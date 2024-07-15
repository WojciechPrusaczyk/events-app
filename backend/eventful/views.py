from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Users, Events
from .serializers import UserSerializer, EventSerializer, UserSettingsSerializer
from .utils import *


# Create your views here.
def index(request):
    return render(request, "index.html")


@csrf_exempt
@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Users.objects.get(username=username)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid username."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(password, user.password):
        return Response({"detail": "Invalid password."}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user is already logged in
    existing_token = user.token
    if existing_token:
        return Response({"detail": "User is already logged in."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        pass  # Proceed with login

    # Generate token for the session
    user.token = generate_token()
    user.save()

    serializer = UserSerializer(user)

    return Response(
        {
            "user": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(["POST"])
def register(request):
    serializerUser = UserSerializer(data=request.data)
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
            user.password = set_password(request.data["password"])  # Hash the password
            user.token = generate_token()
            user.userSettings = userSettingsSerializer.data["id"]
            user.save()
            userSettings.hasseentutorial = request.data.get("hasseentutorial")
            userSettings.acceptedTOS = request.data.get("acceptedTOS")
            userSettings.acceptedNews = request.data.get("acceptedNews")
            userSettings.save()

            return Response(
                {
                    "user": serializerUser.data,
                    "settings": userSettingsSerializer.data
                },
                status=status.HTTP_201_CREATED,
            )
    else:
        return Response(serializerUser.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["GET"])
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
        serializer = UserSerializer(Users.objects.get(username=username))
        return Response(
            {
                "user": serializer.data
            },
            status=status.HTTP_201_CREATED,
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