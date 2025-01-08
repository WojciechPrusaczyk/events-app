import pytz
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.utils.crypto import get_random_string

from django.core.mail import send_mail, get_connection
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.urls import resolve

from .models import Users, Events, UserSettings, Locations, Photos, Segments, Eventsparticipants
from .serializers import RegisterUserSerializer, LoginUserSerializer, EventSerializer, UserSettingsSerializer, \
    LocationSerializer, SegmentsSerializer
from .utils import *

from datetime import datetime, timedelta

import os
from django.core.files.storage import FileSystemStorage
from mimetypes import guess_type

from backend.settings import MEDIA_ROOT
from django.shortcuts import redirect


@api_view(["GET"])
def viewAPI(request):
    api = {
        "api_register": "https://eventfull.pl/register{wszystko usera}",
        "api_login": "https://eventfull.pl/login{email/login, password}",
        "api_user": "https://eventfull.pl/user{username}",
        "api_check_user": "https://eventfull.pl/checkUsername{username}",
        "search_users": "https://eventfull.pl/searchUsers{query, limit}",
        "api_logout": "https://eventfull.pl/logout{token}",
        "api_logout_username": "https://eventfull.pl/logoutUsername{username}",
        "api_create_event": "https://eventfull.pl/create_event{wszystko eventu}",
        "api_delete_event": "https://eventfull.pl/delete_event{id}",
        "api_get_event": "https://eventfull.pl/get_event{code, id}",
        "api_get_events": "https://eventfull.pl/get_events(token}",
        "api_edit_event": "https://eventfull.pl/editEventApi{wszystko eventu}",
        "api_send_event_request": "https://eventfull.pl/sendEventRequest{event_id, user_id}",
        "api_leave_event": "https://eventfull.pl/leaveEvent{event_id, user_id}",
        "api_forgot_password": "https://eventfull.pl/forgot_password{email}",
        "api_reset_password": "https://eventfull.pl/reset_password{new_password}",
        "api_get_segments": "https://eventfull.pl/getSegments{wszystko segmentu}",
        "api_create_segment": "https://eventfull.pl/createSegment{event_id}",
        "api_edit_segment": "https://eventfull.pl/editSegment{wszystko segmentu}",
        "delete_segment": "https://eventfull.pl/delete_segment{wszystko segmentu}"
    }
    return Response(api, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["POST"])
def login(request):
    usernameEmail = request.data.get("username")
    password = request.data.get("password")
    rememberMe = request.data.get("rememberMe")

    if not password:
        return Response({"detail": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

    if not usernameEmail:
        return Response({"detail": "Username, or email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Users.objects.get(email=usernameEmail)
    except Users.DoesNotExist:
        try:
            user = Users.objects.get(username=usernameEmail)
        except Users.DoesNotExist:
            return Response({"detail": "Invalid username or email."}, status=status.HTTP_400_BAD_REQUEST)

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
    response.set_cookie(key='token', value=user.token, httponly=True, secure=False, samesite='Lax', expires=expires)

    return response


@api_view(["POST"])
def register(request):
    try:
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        name = request.data.get("name")
        surname = request.data.get("surname")

        if not username or not email or not password:
            return Response({"detail": "Username, email, and password are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        if not is_valid_password(password):
            return Response({"detail": "Password doesn't meet conditions."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            existing_user_by_username = Users.objects.select_for_update().filter(username=username).exists()
            existing_user_by_email = Users.objects.select_for_update().filter(email=email).exists()

            if existing_user_by_username:
                return Response({"detail": "User with this username already exists."},
                                status=status.HTTP_400_BAD_REQUEST)

            if existing_user_by_email:
                return Response({"detail": "User with this email already exists."},
                                status=status.HTTP_406_NOT_ACCEPTABLE)

            # UserSettings data
            user_setting = UserSettings(
                acceptedSharingDetails=request.data.get("acceptedSharingDetails", False),
                acceptedTOS=request.data.get("acceptedTos", False),
                acceptedNews=request.data.get("acceptedNews", False),
            )

            # Create user
            user = Users(
                username=username,
                email=email,
                name=name,
                surname=surname,
                userSetting=user_setting
            )
            user.password = set_password(password)  # Hash the password

            user_setting.utilityToken = generate_token()

            protocol = request.scheme
            full_host = request.get_host()
            verification_link = f"{protocol}://{full_host}/account-verification/{user_setting.utilityToken}"

            try:
                subject = "Verification"
                message = f"Cześć. Wejdź w tego linka: {verification_link}"
                username = user.username
                rawHTML = open_verification_template()

                if rawHTML == "File doesn't exist.":
                    return Response({"detail": "Verification email template not found."},
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                html_message = rawHTML.replace("[Imię]", username).replace("[Link do weryfikacji]", verification_link)

                # Send verification email
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
                return Response({"detail": "Error sending verification email.", "error": str(e)},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            user_setting.save()
            user.save()

        return Response({"detail": "Successfully registered."}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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

    response = Response( { "detail": "User logged out." }, status=status.HTTP_200_OK )
    response.delete_cookie(key='token')

    return response


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
        link = "{}://{}/reset-password/{}".format(protocol, full_host, userSetting.utilityToken)
    except Exception as e:
        return Response({"detail": "Error sending email.", "error": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    subject = "Password Reset"
    message = "Cześć, zmieniłeś hasło. Wejdź w tego linka: {}".format(link)
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
        return Response({"detail": "Error sending email.", "error": str(e)})
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
    joinCode = get_random_string(8, "abcdefghijklmnopqrstuvwxyz0123456789")

    while True:
        if Events.objects.filter(joinCode=joinCode).exists():
            joinCode = get_random_string(8, "abcdefghijklmnopqrstuvwxyz0123456789")
        else:
            break

    # Tworzenie obiektu wydarzenia
    newEvent = Events(
        name="New Event",
        description=None,
        rules=None,
        starttime=currentTime,
        endtime=currentTime + timedelta(days=10),  # Poprawiono generowanie endtime
        supervisor=user,
        isactive=False,
        ispublic=False,
        joinapproval=True,
        token=event_token,
        location=location,
        icon=None,
        joinCode=joinCode
    )
    newEvent.save()

    return Response({"event_id": newEvent.id, "detail": "Event created successfully."}, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(["POST"])
def getEvent(request):
    # Checking token and user
    token = request.COOKIES.get('token')
    joinCode = request.data.get("code")
    eventToken = request.data.get("token")

    if not token and not eventToken and joinCode:
        event = Events.objects.get(joinCode=joinCode, ispublic=True, joinapproval=False)
        eventSerializer = EventSerializer(event)

        if event:
            return Response({"detail": eventSerializer.data}, status=status.HTTP_200_OK)

        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)

    # check if join code provided
    if joinCode:
        event = Events.objects.get(joinCode=joinCode)
        eventSerializer = EventSerializer(event)
        return Response({"detail": eventSerializer.data}, status=status.HTTP_200_OK)

    if eventToken:
        event = Events.objects.get(token=eventToken)
        eventSerializer = EventSerializer(event)

        return Response({"detail": eventSerializer.data}, status=status.HTTP_200_OK)

    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

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
@api_view(["POST"])
def getEvents(request):
    # Checking token and user
    token = request.COOKIES.get('token')
    if not token:
        # Finding public and active events
        eventsPublicActive = Events.objects.filter(ispublic=True, isactive=True, joinapproval=False).select_related('icon').distinct()
        eventSerializer = EventSerializer(eventsPublicActive, many=True)

        return Response({"events": eventSerializer.data}, status=status.HTTP_200_OK)

    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    userAssociatedEvents = request.data.get('userAssociatedEvents')

    if userAssociatedEvents:
        eventsUserInactive = Events.objects.filter(supervisor=user.uid).select_related('icon').distinct()

        # Finding events, user participates in.
        events_with_pending_participants = Events.objects.filter(
            eventsparticipants__user=user,
            eventsparticipants__isAccepted=True
        ).select_related('icon').distinct()

        events = eventsUserInactive.union(events_with_pending_participants)
    else:
        events = Events.objects.filter(ispublic=True, isactive=True).select_related('icon').distinct()

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
    supervisor = request.data.get('supervisor')
    location = locationObject

    if name is not None and name != "New Event" and name != "":
        event.name = name

    if description is not None:
        event.description = description
    if rules is not None:
        event.rules = rules

    if supervisor is not None:
        try:
            supervisorObject = Users.objects.get(uid=supervisor)
        except ObjectDoesNotExist:
            return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)
        event.supervisor = supervisorObject
        print(event.supervisor.uid)

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
    except ObjectDoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    eventId = request.data.get("id")

    if not eventId:
        return Response({"detail": "Event id required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Events.objects.get(id=eventId, supervisor=user)
    except ObjectDoesNotExist:
        return Response({"detail": "Event not found or you don't have permission to delete it."},
                        status=status.HTTP_403_FORBIDDEN)

    Segments.objects.filter(event=event).delete()

    Eventsparticipants.objects.filter(event=event).delete()

    photo = event.icon
    if photo:
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


@api_view(['POST'])
def getSegments(request):
    event_id = request.data.get("id")
    try:
        segments = Segments.objects.filter(event_id=event_id).order_by('starttime')
        serializer = SegmentsSerializer(segments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Segments.DoesNotExist:
        return Response({"detail": "Event not found or no segments available."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def createSegment(request):
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

    event_id = request.data.get('id')
    if not event_id:
        return Response({"detail": "Event ID required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Events.objects.get(id=event_id)
        if event.supervisor != user:
            return Response({"detail": "You are not the supervisor of this event."}, status=status.HTTP_403_FORBIDDEN)
    except Events.DoesNotExist:
        return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    location = Locations(
        longitude="18.0166862",
        latitude="53.1231938"
    )
    location.save()

    currentTimeUTC = timezone.now()
    warsaw_tz = pytz.timezone('Europe/Warsaw')
    currentTime = currentTimeUTC.astimezone(warsaw_tz)

    starttime = currentTime
    endtime = currentTime

    if starttime > endtime:
        return Response({"detail": "Start time must be before end time."}, status=status.HTTP_400_BAD_REQUEST)

    # Check for time conflicts with other segments for the same event
    conflicting_segments = Segments.objects.filter(
        event=event
    ).filter(
        starttime__lte=endtime,
        endtime__gte=starttime
    )

    if conflicting_segments.exists():
        return Response({"detail": "There is already a segment scheduled that conflicts with the provided time range."},
                        status=status.HTTP_409_CONFLICT)

    newSegment = Segments(
        event=event,
        name=event.name + " segment",
        description="",
        starttime=starttime,
        endtime=endtime,
        speaker=user,
        isactive=False,
        location=location,
    )
    newSegment.save()

    return Response({"detail": "Segment created successfully."}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
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
    starttime = request.data.get('starttime')
    endtime = request.data.get('endtime')
    location = request.data.get('location')
    speaker_id = request.data.get('speaker')
    isactive = request.data.get('isActive')

    if name is not None:
        segment.name = name
    if description is not None:
        segment.description = description

    if starttime is not None:
        try:
            # Convert starttime string to datetime object
            starttime = starttime.replace('T', ' ')
            starttime_obj = datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S')
            segment.starttime = timezone.make_aware(starttime_obj) if timezone.is_naive(
                starttime_obj) else starttime_obj
        except ValueError:
            return Response({"detail": "Invalid starttime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                            status=status.HTTP_400_BAD_REQUEST)

    if endtime is not None:
        try:
            # Convert endtime string to datetime object
            endtime = endtime.replace('T', ' ')
            endtime_obj = datetime.strptime(endtime, '%Y-%m-%d %H:%M:%S')
            segment.endtime = timezone.make_aware(endtime_obj) if timezone.is_naive(endtime_obj) else endtime_obj
        except ValueError:
            return Response({"detail": "Invalid endtime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                            status=status.HTTP_400_BAD_REQUEST)

    # Validate timeline: Start time must be before end time
    if segment.starttime and segment.endtime and segment.starttime > segment.endtime:
        return Response({"detail": "Invalid timeline. Start time must be before end time."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Ensure segment end time does not exceed the event's end time
    if segment.endtime and segment.event.endtime:
        # Normalize both to timezone-aware for comparison
        event_endtime = timezone.make_aware(segment.event.endtime) if timezone.is_naive(
            segment.event.endtime) else segment.event.endtime
        if segment.endtime > event_endtime:
            return Response({"detail": "Segment end time cannot exceed the event's end time."},
                            status=status.HTTP_400_BAD_REQUEST)
    print(segment.event.endtime, "event", segment.endtime, "segment")

    # Check for overlapping segments
    if starttime or endtime:
        conflicting_segments = Segments.objects.filter(
            event=segment.event
        ).exclude(id=segment.id).filter(
            starttime__lt=segment.endtime,
            endtime__gt=segment.starttime
        )
        if conflicting_segments.exists():
            return Response(
                {"detail": "There is already a segment scheduled that conflicts with the provided time range."},
                status=status.HTTP_409_CONFLICT)

    if location is not None:
        segment.location.placeId = location["placeId"]
        segment.location.longitude = location["longitude"]
        segment.location.latitude = location["latitude"]
        segment.location.formattedAddress = location["formattedAddress"]
        segment.location.save()

    if speaker_id is not None:
        try:
            speaker = Users.objects.get(uid=speaker_id)
            segment.speaker = speaker
        except Users.DoesNotExist:
            return Response({"detail": "Speaker not found."}, status=status.HTTP_404_NOT_FOUND)

    if isactive is not None:
        segment.isactive = convertBoolean(isactive)

    segment.save()
    return Response({"detail": "Segment updated successfully.", "segment_id": segment.id}, status=status.HTTP_200_OK)


@api_view(['POST'])
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

@api_view(["POST"])
def sendEventRequest(request):
    eventCode = request.data.get("code")
    eventCode = eventCode.lower()

    if not eventCode:
        return Response({"detail": "Code required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Events.objects.get(joinCode=eventCode)
    except ObjectDoesNotExist:
        return Response({"detail": "Event does not exist."}, status=status.HTTP_404_NOT_FOUND)

    token = request.COOKIES.get('token')

    if event.joinapproval:
        if not token:
            return Response({"detail": "Account is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Users.objects.get(token=token)
        except Users.DoesNotExist:
            return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

        if Eventsparticipants.objects.filter(user=user, event=event, isAccepted=False).exists():
            return Response({"detail": "You already sent request, wait for acceptation."},
                            status=status.HTTP_400_BAD_REQUEST)

        if Eventsparticipants.objects.filter(user=user, event=event).exists():
            return Response({"detail": "You are already a participant of this event."}, status=status.HTTP_400_BAD_REQUEST)

        if Events.objects.filter(supervisor=user, id=event.id).exists():
            return Response({"detail": "You can't request to join your own event."}, status=status.HTTP_400_BAD_REQUEST)

        participant = Eventsparticipants(
            user=user,
            event=event,
            isAccepted=False if event.joinapproval else True,
        )
        participant.save()

        if event.joinapproval:
            return Response({"detail": "Request sent."}, status=status.HTTP_200_OK)

        elif not event.joinapproval:
            return Response({"detail": "User added to event."}, status=status.HTTP_200_OK)

        else:
            raise Exception("Error occured.")


    else:

        try:

            user = Users.objects.get(token=token)

            existing_participant = Eventsparticipants.objects.filter(user=user, event=event, isAccepted=True).first()

            if existing_participant:

                return Response({"detail": "Redirecting to event.", "token": event.token}, status=status.HTTP_200_OK)


            participant = Eventsparticipants(

                user=user,

                event=event,

                isAccepted=True,

            )

            participant.save()

            return Response({"detail": "Successfully joined to event.", "token": event.token},
                            status=status.HTTP_200_OK)


        except Users.DoesNotExist:

            return Response({"detail": "Redirecting to event.", "token": event.token}, status=status.HTTP_200_OK)


@api_view(['POST'])
def acceptUser(request):
    #TODO: nie ma sprawdzania czy dany event należy do zalogowanego użytkownika
    eventId = request.data.get("eventId")
    user = request.data.get("userId")
    accepted = request.data.get("accepted")

    if not eventId:
        return Response({"detail": "Code required."}, status=status.HTTP_400_BAD_REQUEST)

    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Events.objects.get(id=eventId)
    except:
        return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        eventParticipant = Eventsparticipants.objects.get(user=user, event=event)

        if accepted is True:
            eventParticipant.isAccepted = True
        elif accepted is False:
            eventParticipant.isAccepted = False
            eventParticipant.delete()
            return Response({"detail": "User request successfully refused.."}, status=status.HTTP_200_OK)
        else:
            eventParticipant.isAccepted = False

        eventParticipant.accepted_at = timezone.now()
        eventParticipant.save()
    except:
        return Response({"detail": "Event participant not found."}, status=status.HTTP_404_NOT_FOUND)

    return Response({"detail": "Event joined successfully."}, status=status.HTTP_200_OK)


@api_view(['POST'])
def getNotifications(request):
    token = request.COOKIES.get('token')

    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    pendingParticipants = Eventsparticipants.objects.filter(event__supervisor=user, isAccepted=False)

    notifications = [
        {
            "event_id": participant.event.id,
            "event_name": participant.event.name,
            "user_id": participant.user.uid,
            "user_name": participant.user.username
        }
        for participant in pendingParticipants
    ]

    return Response({"notifications": notifications}, status=status.HTTP_200_OK)

@api_view(['POST'])
def leaveEvent(request):
    token = request.COOKIES.get('token')

    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    eventId = request.data.get("eventId")
    if not eventId:
        return Response({"detail": "Code required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        participant_record = Eventsparticipants.objects.get(user=user, event=eventId)
    except Eventsparticipants.DoesNotExist:
        return Response({"detail": "You are not on participating in this event."}, status=status.HTTP_404_NOT_FOUND)

    participant_record.delete()

    return Response({"detail": "Event leave successfully."}, status=status.HTTP_200_OK)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Events
from .serializers import EventSerializer
from datetime import datetime

from datetime import datetime

@api_view(['get'])
def getEventsByKeywords(request):
    token = request.COOKIES.get('token')
    if token:
        user = Users.objects.get(token=token)

    # Pobierz bieżącą datę i czas
    now = datetime.now()
    current_year = now.year
    next_year = current_year + 1

    # Definicja kategorii i słów kluczowych
    keywords_criteria = {
        "technology": [
            "tech", "AI", "machine learning", "programming", "robotics", "blockchain",
            "cybersecurity", "data science", "hackathon", "startup", "cloud computing",
            "konferencja", "technologia", "innowacje", "targi pracy", "IT", "sztuczna inteligencja"
        ],
        "sports": [
            "football", "soccer", "basketball", "tennis", "volleyball", "swimming",
            "athletics", "running", "cycling", "yoga", "gym", "workout", "sport",
            "piłka nożna", "koszykówka", "siatkówka", "tenis", "bieganie", "pływanie", "sport"
        ],
        "cultural": [
            "theatre", "cinema", "movie", "festival", "art", "museum", "exhibition",
            "spotkanie", "kultura", "teatr", "kino", "wystawa", "sztuka", "muzeum", "targi",
            "impreza", "event", "wieczór", "towarzyski", "kulturalne"
        ],
        "music": [
            "concert", "live music", "performance", "festival", "band", "orchestra",
            "festiwal", "koncert", "muzyka", "show", "trasa koncertowa", "zespół", "orkiestra"
        ],
        "education": [
            "lecture", "study", "course", "workshop", "university", "conference", "seminar",
            "juwenalia", "dni otwarte", "warsztaty", "edukacja", "studia", "nauka", "lekcja", "szkolenie"
        ],
        current_year: [],
        next_year: []
    }

    result = {keyword: [] for keyword in keywords_criteria}

    # Pobranie wszystkich aktywnych, publicznych i nadchodzących wydarzeń
    if token and user:
        upcoming_events = Events.objects.filter(
            isactive=True, ispublic=True,
            starttime__gte=now
        )

        ongoing_events = Events.objects.filter(
            isactive=True, ispublic=True,
            starttime__lte=now, endtime__gte=now
        )
    else:
        upcoming_events = Events.objects.filter(
            isactive=True, ispublic=True, joinapproval=False,
            starttime__gte=now
        )

        ongoing_events = Events.objects.filter(
            isactive=True, ispublic=True, joinapproval=False,
            starttime__lte=now, endtime__gte=now
        )

    events = list(upcoming_events) + list(ongoing_events)

    if len( events ) == 0:
        return Response({"detail": "No active and public events found."}, status=status.HTTP_404_NOT_FOUND)

    for event in events:
        event_year = event.starttime.year

        for keyword, word_list in keywords_criteria.items():
            if keyword == current_year and event_year == current_year:
                result[keyword].append(EventSerializer(event).data)
            elif keyword == next_year and event_year == next_year:
                result[keyword].append(EventSerializer(event).data)
            elif keyword not in [current_year, next_year]:
                if any(word.lower() in event.name.lower() for word in word_list):
                    result[keyword].append(EventSerializer(event).data)

    # Sortowanie wydarzeń w każdej kategorii według starttime
    for category in result.keys():
        result[category].sort(key=lambda x: x["starttime"])

    return Response({"categorized_events": result}, status=status.HTTP_200_OK)