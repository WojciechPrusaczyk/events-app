import pytz
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction

from django.core.mail import send_mail, get_connection
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Users, Events, UserSettings, Locations, Photos, Segments
from .serializers import RegisterUserSerializer, LoginUserSerializer, EventSerializer, UserSettingsSerializer, \
    LocationSerializer, SegmentsSerializer
from .utils import *

from datetime import datetime, timedelta

import os
from django.core.files.storage import FileSystemStorage
from mimetypes import guess_type

from backend.settings import MEDIA_ROOT


@api_view(["GET"])
def viewAPI(request):
    api = {
        "api_register": "https://eventfull.pl/register{wszystko usera}",
        "api_login": "https://eventfull.pl/login{email/login, password}",
        "api_user": "https://eventfull.pl/user{username}",
        "api_check_user": "https://eventfull.pl/checkUsername{username}",
        "api_logout": "https://eventfull.pl/logout{token}",
        "api_logout_username": "https://eventfull.pl/logoutUsername{username}",
        "api_create_event": "https://eventfull.pl/create_event{wszystko eventu}",
        "api_forgot_password": "https://eventfull.pl/forgot_password{email}",
        "api_reset_password": "https://eventfull.pl/reset_password{new_password}"
    }
    return Response(api, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["POST"])
def login(request):
    usernameEmail = request.data.get("username")
    password = request.data.get("password")
    rememberMe = request.data.get("rememberMe")

    if not usernameEmail or not password:
        return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Users.objects.get(email=usernameEmail)
    except Users.DoesNotExist:
        try:
            user = Users.objects.get(username=usernameEmail)
        except Users.DoesNotExist:
            return Response({"detail": "Invalid username or email1."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(password, user.password):
        return Response({"detail": "Invalid password."}, status=status.HTTP_400_BAD_REQUEST)

    if not user.isactive:
        return Response({"detail": "User account is not active."}, status=status.HTTP_400_BAD_REQUEST)

    user.token = generate_token()
    user.save()

    serializer = LoginUserSerializer(user, )

    if rememberMe:
        # Expire in 30 days
        expires = 30 * 24 * 60 * 60  # 30 days
    else:
        # Expire in 1 day
        expires = 1 * 24 * 60 * 60  # 1 day

    response = Response({"user": serializer.data}, status=status.HTTP_200_OK)
    response.set_cookie(key='token', value=user.token, httponly=True, secure=True, samesite='Strict',
                        expires=expires)

    # TODO: dodać obsługę remember me DONE
    return response


@api_view(["POST"])
def register(request):
    serializerUser = RegisterUserSerializer(data=request.data)

    if not serializerUser.is_valid():
        return Response(serializerUser.errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        # Lock the rows for the duration of the transaction
        existing_user_by_username = Users.objects.select_for_update().filter(
            username=serializerUser.validated_data["username"]).exists()
        existing_user_by_email = Users.objects.select_for_update().filter(
            email=serializerUser.validated_data["email"]).exists()

        if existing_user_by_username:
            return Response({"detail": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

        if existing_user_by_email:
            return Response({"detail": "User with provided email already exists."},
                            status=status.HTTP_406_NOT_ACCEPTABLE)

    # Check password validity before saving the user
    if not is_valid_password(request.data["password"]):
        return Response({"detail": "Password doesn't meet conditions."}, status=status.HTTP_400_BAD_REQUEST)

    settings_data = {
        "acceptedSharingDetails": request.data.get("acceptedSharingDetails"),
        "acceptedTOS": request.data.get("acceptedTos"),
        "acceptedNews": request.data.get("acceptedNews")
    }

    userSettingsSerializer = UserSettingsSerializer(data=settings_data)

    if not userSettingsSerializer.is_valid():
        return Response(userSettingsSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user_setting = userSettingsSerializer.save()
        user = serializerUser.save()
        user.password = set_password(request.data["password"])  # Proper password hashing
        user.userSetting = user_setting  # Associate the user with the UserSettings instance
        user.save()

        # Generate and save utility token
        user.userSetting.utilityToken = generate_token()
        user.userSetting.save()
        # Create verification link
        protocol = request.scheme  # http or https
        full_host = request.get_host()  # domain and port
        link = f"{protocol}://{full_host}/account-verification/{user.userSetting.utilityToken}"

        try:
            subject = "Verification"
            message = f"Cześć. Wejdź w tego linka: {link}"
            username = user.username
            rawHTML = open_verification_template()  # Ensure this loads properly
            if rawHTML == "File doesn't exist.":
                return Response({"detail": "File doesn't exist."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            html_message = rawHTML.replace("[Imię]", username)
            html_message = html_message.replace("[Link do weryfikacji]", link)
        except Exception as e:
            return Response({"detail": "Error creating link.", "error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            connection = get_connection()
            connection.open()
            send_mail(
                subject,
                message,
                'no-reply@eventfull.pl',
                [user.email],
                html_message=html_message,
                connection=connection
            )
            connection.close()
        except Exception as e:
            return Response({"detail": "Error sending email.", "error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "Successfully registered."}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def user(request):
    id = request.data.get('id')
    username = request.COOKIES.get('username') or request.data.get('username')

    if isinstance(id, dict):
        id = id.get('id')


    # Check if both id and username are missing
    if not id and not username:
        return Response({"detail": "id or username required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if id:
            user = Users.objects.get(uid=id)
        elif username:
            user = Users.objects.get(username=username)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token or username."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = LoginUserSerializer(user)
    return Response({"user": serializer.data}, status=status.HTTP_201_CREATED)

@csrf_exempt
@api_view(["POST"])
def checkUsername(request):
    username = request.data.get("username")
    if not username:
        return Response({"detail": "username required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        if not Users.objects.filter(username=username).exists():
            return Response(
                {
                    "detail": False,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "detail": True,
                },
                status=status.HTTP_200_OK,
            )

    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def logout(request):
    token = request.data.get("token")
    if not token:
        return Response({"detail": "token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
    if user.token == "":
        return Response(
            {
                "detail": "User not logged in."
            },
            status=status.HTTP_200_OK,
        )
    user.token = ""
    user.save()

    response = Response(
        {
            "detail": "User logged out."
        },
        status=status.HTTP_200_OK,
    )
    response.delete_cookie('token')

    return response


@api_view(["POST"])
def logoutUsername(request):
    username = request.data.get("username")
    if not username:
        return Response({"detail": "token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(username=username)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
    if user.token == "":
        return Response(
            {
                "detail": "User not logged in."
            },
            status=status.HTTP_200_OK,
        )
    user.token = ""
    user.save()
    return Response(
        {
            "detail": "User logged out."
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(["POST"])
def forgotPassword(request):
    email = request.data.get("email")
    if not email:
        return Response({"detail": "Email required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Attempt to find the user by email
        user = Users.objects.get(email=email)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid email."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Ensure that the user has a related UserSettings object
        if not user.userSetting:
            return Response({"detail": "User settings not found."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a password reset token
        userSetting = UserSettings.objects.get(id=user.userSetting.id)
        userSetting.utilityToken = generate_token()
        userSetting.save()  # Save the token to the database

        # Construct the reset link
        protocol = request.scheme  # http or https
        full_host = request.get_host()  # domain and port
        link = f"{protocol}://{full_host}/reset-password/{userSetting.utilityToken}"
    except Exception as e:
        return Response({"detail": "Error sending email.", "error": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    subject = "Password Reset"
    message = f"Cześć, zmieniłeś hasło. Wejdź w tego linka: {link}"
    username = user.username
    rawHTML = open_email_template()
    if rawHTML == "File doesn't exist.":
        return Response({"detail": "File doesn't exist."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    html_message = rawHTML.replace("[Imię]", username)
    html_message = html_message.replace("[Link do resetu hasła]", link)

    try:
        connection = get_connection()
        connection.open()
        send_mail(
            subject,
            message,
            'no-reply@eventfull.pl',
            [email],
            html_message=html_message,
            connection=connection,
        )
        connection.close()
    except Exception as e:
        return Response({"detail": "Error sending email.", "error" :str(e)})
    return Response({"detail": "Sent email."}, status=status.HTTP_200_OK)


@api_view(["POST"])
def resetPassword(request):
    token = request.data.get("token")
    new_password = request.data.get("password")
    try:
        userSettings = UserSettings.objects.get(utilityToken=token)
        user = Users.objects.get(userSetting=userSettings)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

    if is_valid_password(new_password):
        user.password = set_password(new_password)
        userSettings.utilityToken = None
        user.save()
        userSettings.save()
        return Response({"detail": "Password changed"}, status=status.HTTP_200_OK)

    return Response({"detail": "Invalid password."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def createEvent(request):
    token = request.COOKIES.get('token')

    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    # Sprawdzanie, czy istnieje już wydarzenie
    if Events.objects.filter(name="New Event", supervisor=user).exists():
        existingEvent = Events.objects.get(name="New Event", supervisor=user)
        return Response({"event_id": existingEvent.id, "detail": "Event already exists."}, status=status.HTTP_200_OK)

    # Tworzenie nowego wydarzenia
    currentTimeUTC = timezone.now()

    # Konwersja na strefę czasową Europe/Warsaw
    warsaw_tz = pytz.timezone('Europe/Warsaw')
    currentTime = currentTimeUTC.astimezone(warsaw_tz)

    # Tworzenie unikalnego tokenu
    letters = string.ascii_lowercase
    length = 12
    event_token = ''.join(random.choice(letters) for i in range(length))  # Zmieniono nazwę tokena na event_token
    location = Locations(
        longitude="18.0166862",
        latitude="53.1231938"
    )
    location.save()

    # Tworzenie obiektu wydarzenia
    newEvent = Events(
        name="New Event",
        description="",
        rules="",
        starttime=currentTime,
        endtime=currentTime + timedelta(days=10),  # Poprawiono generowanie endtime
        supervisor=user,
        isactive=False,
        ispublic=False,
        joinapproval=True,
        token=event_token,
        location=location,
        icon=None,
        joinCode=generate_code()
    )
    newEvent.save()


    return Response({"event_id": newEvent.id, "detail": "Event created successfully."}, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(["POST"])
def getEvent(request):
    # Checking token and user
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    # check if join code provided
    joinCode = request.data.get("code")
    if joinCode:
        event = Events.objects.get(joinCode=joinCode)
        eventSerializer = EventSerializer(event)
        return Response({"detail": eventSerializer.data}, status=status.HTTP_200_OK)

    # Finding event by id
    eventId = request.data.get("id")
    if not eventId:
        return Response({"detail": "Event id required."}, status=status.HTTP_400_BAD_REQUEST)
    event = Events.objects.get(id=eventId, supervisor=user.uid)
    eventSerializer = EventSerializer(event)

    # TODO: jesli użytkownik nie jest nadzorcą, to sprawdzić czy jest na liście uczestników (chyba że wydarzenie jest publiczne) NA RAZIE WYWALA BLAD

    if event:
        try:
            return Response({"detail": eventSerializer.data}, status=status.HTTP_200_OK)
        except Users.DoesNotExist:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({"detail": "User has no privileges to get requested event."},
                        status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["GET"])
def getEvents(request):
    # Checking token and user
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    # Finding public and active events
    eventsPublicActive = Events.objects.filter(ispublic=True, isactive=True).select_related('icon')

    # Finding inactive events where user is a supervisor
    eventsUserInactive = Events.objects.filter(supervisor=user.uid).select_related('icon')

    # Combine the two querysets using union
    events = eventsPublicActive | eventsUserInactive

    # Serializing events
    if events.exists():
        eventSerializer = EventSerializer(events, many=True)
        eventData = eventSerializer.data
        for event in eventData:
            event.pop('icon', None)
        return Response({"events": eventData}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "User is not supervising any events."}, status=status.HTTP_204_NO_CONTENT)


@csrf_exempt
@api_view(["POST"])
def editEventApi(request):
    # Checking token and user
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    # Finding event
    eventId = request.data.get("id")
    if not eventId:
        return Response({"detail": "Event id required."}, status=status.HTTP_400_BAD_REQUEST)
    event = Events.objects.get(id=eventId, supervisor=user)

    locationObject = Locations()

    try:
        locationObject.placeId = request.data.get('location[placeId]')
        locationObject.formattedAddress = request.data.get('location[formattedAddress]')
        locationObject.latitude = request.data.get('location[latitude]')
        locationObject.longitude = request.data.get('location[longitude]')

        locationObject.save()
    except:
        return Response({"detail": "Cant assign location"}, status=status.HTTP_400_BAD_REQUEST)


    # Retrieve fields from the request and update the event
    name = request.data.get('name')
    description = request.data.get('description')
    rules = request.data.get('rules')
    starttime = request.data.get('startTime')
    endtime = request.data.get('endTime')
    isactive = request.data.get('isActive')
    ispublic = request.data.get('isPublic')
    joinapproval = request.data.get('joinApproval')
    location = locationObject


    #TODO description nie dziala napraw ktos ok? DONE? jest w bazie danych zapisywane Rules to samo DONE


    if name is not None and name != "New Event" and name != "":
        event.name = name

    if description is not None:
        event.description = description
    if rules is not None:
        event.rules = rules

    # TODO: nie jest sprawdzane czy starttime < endtime   DONE
    if starttime is not None:
        try:
            starttime = starttime.replace('T', ' ')
            event.starttime = datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return Response({"detail": "Invalid starttime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                            status=status.HTTP_400_BAD_REQUEST)
    if endtime is not None:
        try:
            endtime = endtime.replace('T', ' ')
            event.endtime = datetime.strptime(endtime, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return Response({"detail": "Invalid endtime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                            status=status.HTTP_400_BAD_REQUEST)

    if starttime > endtime:
        return Response({"detail": "Invalid timeline"},
                        status=status.HTTP_400_BAD_REQUEST)

    if isactive is not None:
        event.isactive = convertBoolean(isactive)
    if ispublic is not None:
        event.ispublic = convertBoolean(ispublic)
    if joinapproval is not None:
        event.joinapproval = convertBoolean(joinapproval)

    if location is not None:
        event.location = location

    uploaded_file = request.FILES.get('image')
    if uploaded_file is None:
        uploaded_file = request.data.get('image')

    print(uploaded_file)
    if uploaded_file == "deleted":
        event.icon = None
    elif isinstance(uploaded_file, str):
        event.icon = event.icon
    elif uploaded_file:
        max_size = 2 * 1024 * 1024
        if uploaded_file.size > max_size:
            return Response({"detail": "File too large."},
                            status=status.HTTP_400_BAD_REQUEST)


        mime_type, _ = guess_type(uploaded_file.name)
        # TODO: nie są spawdzane wyszczególnione formaty obrazów, można wrzucić np. webp   DONE
        # TODO: nie widzę także sprawdzania wielkości pliku (max 2MB)   DONE
        # TODO: nowo zapisywane pliki mają wciąż fragment starej nazwy (powinien być tylko nic nie znaczący ciąg znaków)   DONE
        # TODO: backend wraz z nazwą pliku na serwerze zwraca SAjego id, a nie powinien DONE

        if mime_type and mime_type.startswith('image/'):
            if uploaded_file.content_type == 'image/webp':
                return Response({"detail": "webp files not supported"},
                                status=status.HTTP_400_BAD_REQUEST)


            fs = FileSystemStorage(location='media/images')
            randomFilename = "".join(random.choices(string.ascii_letters + string.digits, k=8))
            ext = os.path.splitext(uploaded_file.name)[1][1:]
            filename = fs.save(randomFilename, uploaded_file)
            file_url = fs.url(filename)
            # Create a Photo record in the database (example)
            photo = Photos(
                addedby=user,
                filename=filename,
                extension=ext,  # Extract file extension without the dot
                originalfilename=uploaded_file.name,
                isdeleted=False
            )
            photo.save()
            event.icon = photo
        else:
            return Response({"detail": "Invalid file type, expected an image."}, status=status.HTTP_400_BAD_REQUEST)

        # Save the updated event
    event.save()

    # Return a success response
    return Response({"detail": "Event updated successfully.", "event_id": event.id}, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(["POST"])
def deleteEvent(request):
    # Checking token and user
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    eventId = request.data.get("id")

    if not eventId:
        return Response({"detail": "Event id required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Events.objects.get(id=eventId, supervisor=user)
    except Events.DoesNotExist:
        return Response({"detail": "Event not found or you don't have permission to delete it."},
                        status=status.HTTP_403_FORBIDDEN)

    photo = event.icon
    imagesPath = os.path.join(MEDIA_ROOT, "images")
    filePath = os.path.join(imagesPath, photo.filename)
    if os.path.exists(filePath):
        os.remove(filePath)
        photo.isdeleted = True
        event.icon = None
        photo.save()


    event.delete()
    return Response({"detail": "Event and associated photos deleted successfully."}, status=status.HTTP_200_OK)



@csrf_exempt
@api_view(['POST'])
def searchUsers(request):
    search_str = request.data.get('query', '')
    limit = request.data.get('limit', None)
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    if not search_str:
        return Response({"detail": "Query string required."}, status=status.HTTP_400_BAD_REQUEST)

    # Filter users where username contains the search string (case-insensitive)
    users = Users.objects.filter(username__icontains=search_str)

    # If a limit is provided, apply it
    if limit and 32 >= limit > 0:
        try:
            limit = int(limit)
            users = users[:limit]
        except ValueError:
            return Response({"detail": "Limit must be an integer."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({"detail": "Limit must be between 32 and 1."}, status=status.HTTP_400_BAD_REQUEST)

    # Serialize the data
    user_data = [{"id": user.uid, "username": user.username, "email": user.email} for user in users]

    return Response({"users": user_data}, status=status.HTTP_200_OK)

@api_view(['GET'])
def getSegments(request, event_id):
    try:
        segments = Segments.objects.filter(event_id=event_id)
        serializer = SegmentsSerializer(segments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Segments.DoesNotExist:
        return Response({"detail": "Event not found or no segments available."}, status=status.HTTP_404_NOT_FOUND)



def createSegment(request):
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

    event_id = request.data.get('event_id')
    if not event_id:
        return Response({"detail": "Event ID required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Events.objects.get(id=event_id)
        if event.supervisor != user:
            return Response({"detail": "You are not the supervisor of this event."}, status=status.HTTP_403_FORBIDDEN)
    except Events.DoesNotExist:
        return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = SegmentsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def editSegment(request):
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)
    segmentId = request.data.get("id")
    if not segmentId:
        return Response({"detail": "Segment ID required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        segment = Segments.objects.select_related('event').get(id=segmentId)
    except Segments.DoesNotExist:
        return Response({"detail": "Segment not found."}, status=status.HTTP_404_NOT_FOUND)
    if segment.event.supervisor != user:
        return Response({"detail": "You are not the supervisor of this event."}, status=status.HTTP_403_FORBIDDEN)

    name = request.data.get('name')
    description = request.data.get('description')
    starttime = request.data.get('startTime')
    endtime = request.data.get('endTime')
    location_id = request.data.get('location')
    speaker_id = request.data.get('speaker')
    isactive = request.data.get('isActive')

    if name is not None:
        segment.name = name
    if description is not None:
        segment.description = description
    if starttime is not None:
        try:
            starttime = starttime.replace('T', ' ')
            segment.starttime = datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return Response({"detail": "Invalid starttime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                            status=status.HTTP_400_BAD_REQUEST)
    if endtime is not None:
        try:
            endtime = endtime.replace('T', ' ')
            segment.endtime = datetime.strptime(endtime, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return Response({"detail": "Invalid endtime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                            status=status.HTTP_400_BAD_REQUEST)

    if starttime and endtime and starttime > endtime:
        return Response({"detail": "Invalid timeline. Start time must be before end time."},
                        status=status.HTTP_400_BAD_REQUEST)

    if location_id is not None:
        try:
            location = Locations.objects.get(id=location_id)
            segment.location = location
        except Locations.DoesNotExist:
            return Response({"detail": "Location not found."}, status=status.HTTP_404_NOT_FOUND)

    if speaker_id is not None:
        try:
            speaker = Users.objects.get(id=speaker_id)
            segment.speaker = speaker
        except Users.DoesNotExist:
            return Response({"detail": "Speaker not found."}, status=status.HTTP_404_NOT_FOUND)

    if isactive is not None:
        segment.isactive = convertBoolean(isactive)

    segment.save()
    return Response({"detail": "Segment updated successfully.", "segment_id": segment.id}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def deleteSegment(request):
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    segmentId = request.data.get("id")
    if not segmentId:
        return Response({"detail": "Segment ID required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        segment = Segments.objects.select_related('event').get(id=segmentId)
    except Segments.DoesNotExist:
        return Response({"detail": "Segment not found."}, status=status.HTTP_404_NOT_FOUND)

    if segment.event.supervisor != user:
        return Response({"detail": "You are not the supervisor of this event."}, status=status.HTTP_403_FORBIDDEN)

    segment.delete()
    return Response({"detail": "Segment deleted successfully."}, status=status.HTTP_200_OK)


#TODO: dodać create, update i delete dla segmentów, bardzo podobne do samych eventów DONE