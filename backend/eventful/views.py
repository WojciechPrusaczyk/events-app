from django.db import transaction
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt

from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Users, Events, UserSettings
from .serializers import RegisterUserSerializer, LoginUserSerializer, EventSerializer, UserSettingsSerializer
from .utils import *
from email.mime.text import MIMEText




# Create your views here.
def index(request):
    return render(request, "index.html")


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

    # Check if user is already logged in
    # existing_token = user.token
    # if existing_token:
    #     return Response({"detail": "User is already logged in."}, status=status.HTTP_400_BAD_REQUEST)
    # else:
    #     pass  # Proceed with login

    # Generate token for the session
    user.token = generate_token()
    user.save()

    serializer = LoginUserSerializer(user, )

    response = Response({"user": serializer.data}, status=status.HTTP_200_OK)

    if rememberMe and rememberMe == True:
        response.set_cookie(key='token', value=user.token, httponly=True, secure=True, samesite='Strict',
                            expires=1209600)
    else:
        response.set_cookie(key='token', value=user.token, httponly=True, secure=True, samesite='Strict',
                            expires=0)

    return response


@csrf_exempt
@api_view(["POST"])
def register(request):
    serializerUser = RegisterUserSerializer(data=request.data)

    if not serializerUser.is_valid():
        return Response(serializerUser.errors, status=status.HTTP_400_BAD_REQUEST)

    if Users.objects.filter(username=serializerUser.validated_data["username"]).exists():
        return Response({"detail": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

    settings_data = {
        "acceptedSharingDetails": request.data.get("acceptedSharingDetails", False),
        "acceptedTOS": request.data.get("acceptedTOS", False),
        "acceptedNews": request.data.get("acceptedNews", False)
    }

    userSettingsSerializer = UserSettingsSerializer(data=settings_data)

    if not userSettingsSerializer.is_valid():
        return Response(userSettingsSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user_setting = userSettingsSerializer.save()
        user = serializerUser.save()

        if not is_valid_password(user.password):
            return Response({"detail": "Password doesn't meet conditions."}, status=status.HTTP_400_BAD_REQUEST)

        user.password = set_password(request.data["password"])
        user.userSetting = user_setting  # Associate the user with the UserSettings instance
        user.save()

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
def create_event(request):
    serializer = EventSerializer(data=request.data)
    if serializer.is_valid():
        if Events.objects.filter(name=serializer.validated_data["name"]).exists():
            return Response({"detail": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)
        event = serializer.save()
        return Response(
            {
                "event": serializer.data
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["POST"])
def forgot_password(request):
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
        user.userSetting.passwordResetToken = generate_token()
        user.userSetting.save()  # Save the token to the database

        # Construct the reset link
        protocol = request.scheme  # http or https
        full_host = request.get_host()  # domain and port
        link = f"{protocol}://{full_host}/reset_password/{user.userSetting.passwordResetToken}"
    except Exception as e:
        return Response({"detail": "Error sending email.", "error": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    subject = "Reset Hasła"
    message = f"Cześć, zmieniłeś hasło. Wejdź w tego linka: {link}"
    username = user.username
    rawHTML = open_email_template()
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
        return Response({"detail": "Error sending email.", "error": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({"detail": "Sent email."}, status=status.HTTP_200_OK)


@api_view(["POST"])
def reset_password(request):
    token = request.data.get("token")
    new_password = request.data.get("password")

    try:
        userSettings = UserSettings.objects.get(passwordResetToken=token)
        user = Users.objects.get(userSetting=userSettings)

    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

    if is_valid_password(new_password):
        user.password = set_password(new_password)
        userSettings.passwordResetToken = None
        user.save()
        userSettings.save()
        return Response({"detail": "Password changed"}, status=status.HTTP_200_OK)

    return Response({"detail": "Invalid password."}, status=status.HTTP_400_BAD_REQUEST)


def view_reset_password(request, token=""):
    if token:
        return render(request, "index.html", {"token": token})
    else:
        return Response("Token not provided.", status=status.HTTP_400_BAD_REQUEST)


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
