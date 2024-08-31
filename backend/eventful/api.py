from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction

from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Users, Events, UserSettings, Locations
from .serializers import RegisterUserSerializer, LoginUserSerializer, EventSerializer, UserSettingsSerializer, LocationSerializer
from .utils import *

from datetime import datetime, timedelta


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

    user.token = generate_token()
    user.save()

    serializer = LoginUserSerializer(user, )

    response = Response({"user": serializer.data}, status=status.HTTP_200_OK)
    response.set_cookie(key='token', value=user.token, httponly=True, secure=True, samesite='Strict',
                        expires=1209600)

    return response



@api_view(["POST"])
def register(request):
    serializerUser = RegisterUserSerializer(data=request.data)

    if not serializerUser.is_valid():
        return Response(serializerUser.errors, status=status.HTTP_400_BAD_REQUEST)

    if Users.objects.filter(username=serializerUser.validated_data["username"]).exists():
        return Response({"detail": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

    if Users.objects.filter(email=serializerUser.validated_data["email"]).exists():
        return Response({"detail": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)
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
            subject = "Weryfikacja"
            message = f"Cześć. Wejdź w tego linka: {link}"
            username = user.username
            rawHTML = open_verification_template()  # Ensure this loads properly
            if rawHTML is "File doesn't exist.":
                return Response({"detail": "File doesn't exist."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            html_message = rawHTML.replace("[Imię]", username)
            html_message = html_message.replace("[Link do weryfikacji]", link)
        except Exception as e:
            return Response({"detail": "Error creating link.", "error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            send_mail(
                subject,
                message,
                'no-reply@eventfull.pl',
                [user.email],
                html_message=html_message,
            )
        except Exception as e:
            return Response({"detail": "Error sending email.", "error": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "Successfully registered."}, status=status.HTTP_201_CREATED)

@csrf_exempt
@api_view(["POST"])
def user(request):
    username = request.data.get("username")
    if not username:
        return Response({"detail": "username required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        if not Users.objects.filter(username=username).exists():
            return Response(
                {
                    "detail": "User does not exist.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = LoginUserSerializer(Users.objects.get(username=username))
        return Response(
            {
                "user": serializer.data
            },
            status=status.HTTP_201_CREATED,
        )
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)



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
        user.save()  # Save the token to the database

        # Construct the reset link
        protocol = request.scheme  # http or https
        full_host = request.get_host()  # domain and port
        link = f"{protocol}://{full_host}/reset-password/{user.userSetting.utilityToken}"
    except Exception as e:
        return Response({"detail": "Error sending email.", "error": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    subject = "Reset Hasła"
    message = f"Cześć, zmieniłeś hasło. Wejdź w tego linka: {link}"
    username = user.username
    rawHTML = open_email_template()
    if rawHTML is "File doesn't exist.":
        return Response({"detail": "File doesn't exist."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    html_message = rawHTML.replace("[Imię]", username)
    html_message = html_message.replace("[Link do resetu hasła]", link)

    try:
        send_mail(
            subject,
            message,
            'no-reply@eventfull.pl',
            [email],
            html_message=html_message,
        )
    except Exception as e:
        return Response({"detail": "Error sending email."})
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
    currentTime = datetime.now()  # aktualna data

    # Tworzenie unikalnego tokenu
    letters = string.ascii_lowercase
    length = 12
    event_token = ''.join(random.choice(letters) for i in range(length))  # Zmieniono nazwę tokena na event_token
    location = Locations(
        longitude= "18.0166862",
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
        location=location
    )
    newEvent.save()

    return Response({"event_id": newEvent.id, "detail": "Event created successfully."}, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(["POST"])
def getEvent(request):

    # Finding event
    eventId = request.data.get("id")
    if not eventId:
        return Response({"detail": "Event id required."}, status=status.HTTP_400_BAD_REQUEST)
    event = Events.objects.get(id=eventId)
    eventSerializer = EventSerializer(event)

    try:
        return Response({"detail": eventSerializer.data}, status=status.HTTP_200_OK)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


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
        locationObject.placeId = request.data.get('location').get("placeId")
        locationObject.formattedAddress = request.data.get('location').get("formattedAddress")
        locationObject.latitude = request.data.get('location').get("latitude")
        locationObject.longitude = request.data.get('location').get("longitude")
        locationObject.save()
    except:
        return Response({"detail": "Cant assign location"}, status=status.HTTP_400_BAD_REQUEST)

    # Retrieve fields from the request and update the event
    name = request.data.get('name')
    description = request.data.get('description')
    rules = request.data.get('rules')
    starttime = request.data.get('starttime')
    endtime = request.data.get('endtime')
    isactive = request.data.get('isactive')
    ispublic = request.data.get('ispublic')
    joinapproval = request.data.get('joinapproval')
    location = locationObject

    if name is not None and name != "New Event" and name != "":
        event.name = name
    if description is not None:
        event.description = description
    if rules is not None:
        event.rules = rules
    if starttime is not None:
        try:
            event.starttime = datetime.strptime(starttime, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return Response({"detail": "Invalid starttime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                            status=status.HTTP_400_BAD_REQUEST)
    if endtime is not None:
        try:
            event.endtime = datetime.strptime(endtime, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return Response({"detail": "Invalid endtime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                            status=status.HTTP_400_BAD_REQUEST)
    if isactive is not None:
        event.isactive = bool(isactive)
    if ispublic is not None:
        event.ispublic = bool(ispublic)
    if joinapproval is not None:
        event.joinapproval = bool(joinapproval)

    if location is not None:
        event.location = location
        # Save the updated event
    event.save()

    # Return a success response
    return Response({"detail": "Event updated successfully.", "event_id": event.id}, status=status.HTTP_200_OK)


@api_view(['GET'])
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
    if limit:
        try:
            limit = int(limit)
            users = users[:limit]
        except ValueError:
            return Response({"detail": "Limit must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

    # Serialize the data
    user_data = [{"id": user.uid, "username": user.username} for user in users]

    return Response({"users": user_data}, status=status.HTTP_200_OK)