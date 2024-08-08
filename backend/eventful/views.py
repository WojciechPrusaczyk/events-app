from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Users, Events
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
    if serializerUser.is_valid():
        if Users.objects.filter(username=serializerUser.validated_data["username"]).exists():
            return Response({"detail": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)
        settingsData = {
            "acceptedSharingDetails": request.data["acceptedSharingDetails"],
            "acceptedTOS": request.data["acceptedTos"],
            "acceptedNews": request.data["acceptedNews"]
        }
        userSettingsSerializer = UserSettingsSerializer(data=settingsData)
        if not userSettingsSerializer.is_valid():
            return Response(userSettingsSerializer.errors, status=status.HTTP_400_BAD_REQUEST)

        userSettings = userSettingsSerializer.save()
        user = serializerUser.save()

        if not is_valid_password(user.password):
            return Response({"detail": "Password doesn't meet conditions."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            user.password = set_password(request.data["password"])
            user.userSettings = userSettingsSerializer.data["id"]
            user.save()
            userSettings.hasseentutorial = request.data.get("hasseentutorial")
            userSettings.acceptedTOS = request.data.get("acceptedTOS")
            userSettings.acceptedNews = request.data.get("acceptedNews")
            userSettings.save()

            return Response(
                {
                    "detail": "succesfully registered."
                },
                status=status.HTTP_201_CREATED,
            )
    else:
        return Response(serializerUser.errors, status=status.HTTP_400_BAD_REQUEST)


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

@api_view(["POST"])
def reset_password_email(request):
    email = request.data.get("email")
    if not email:
        return Response({"detail": "email required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(email=email)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid email."}, status=status.HTTP_400_BAD_REQUEST)
    if not user.token == "":
        return Response({"detail": "Already logged in"}, status=status.HTTP_400_BAD_REQUEST)
    user.token = generate_token()
    #hashed_token = hash(user.token)
    link = f"eventfull.com/{user.token}"
    msg = MIMEText(f'<p>Hello click </p><a href={link}>Reset Password</a><p> to continue</p>','html')

    send_mail(
        "Reset Password",
        msg,
        "eventfull@example.com",
        [email],
        fail_silently=False,
    )


@api_view(["POST"])
def reset_password(request):
    token = request.data.get("token")
    new_password = request.data.get("new_password")
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
    user.password = new_password
    return Response({"detail": "Password changed"}, status=status.HTTP_200_OK)