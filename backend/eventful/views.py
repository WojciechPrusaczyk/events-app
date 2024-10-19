from datetime import datetime, timedelta

from django.db import transaction
from django.middleware.csrf import get_token
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt

from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Users, Events, UserSettings
from .serializers import RegisterUserSerializer, LoginUserSerializer, EventSerializer, UserSettingsSerializer
from .utils import *
import logging

logger = logging.getLogger(__name__)


# Create your views here.
def index(request):
    logger.info('Widok YourView został wywołany.')
    return render(request, "index.html")


def viewResetPassword(request, token=""):
    if token:
        return render(request, "index.html", {"token": token})
    else:
        return Response("Token not provided.", status=status.HTTP_400_BAD_REQUEST)


def viewAccountVerification(request, token=""):
    if token:
        try:
            userSettings = UserSettings.objects.get(utilityToken=token)
            user = Users.objects.get(userSetting=userSettings)
        except Users.DoesNotExist:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        user.isactive = True
        userSettings.utilityToken = None
        userSettings.save()
        user.save()

        return render(request, "index.html", {"token": token})
    else:
        return Response("Token not provided.", status=status.HTTP_400_BAD_REQUEST)


def editEvent(request, id=None):
    # weryfikacja zalogowania
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    if id and user:
        return render(request, "index.html", {"token": id})
    else:
        return Response("Id not provided.", status=status.HTTP_404_NOT_FOUND)

def editSegments(request, id=None):
    # weryfikacja zalogowania
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    if id and user:
        return render(request, "index.html", {"token": id})
    else:
        return Response("Id not provided.", status=status.HTTP_404_NOT_FOUND)


def joinEvent(request):
    # weryfikacja zalogowania
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    if user:
        return render(request, "index.html")
    else:
        return Response("Invalid user.", status=status.HTTP_404_NOT_FOUND)


def showEvent(request, code=None):
    token = request.COOKIES.get('token')
    if not token:
        return Response({"detail": "Token required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = Users.objects.get(token=token)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + token}, status=status.HTTP_400_BAD_REQUEST)

    # Sprawdzenie czy dany event istnieje.
    try:
        event = Events.objects.get(joinCode=code.lower())
    except Users.DoesNotExist:
        return Response({"detail": "Event with provided join code not found."}, status=status.HTTP_404_NOT_FOUND)

    if user and event:
        # Zmiana z małych liter na duże.
        for letter in code:
            if letter.islower():
                return redirect("show_event", code=code.upper())
        return render(request, "index.html", {"code": code})
    else:
        return Response("Invalid user.", status=status.HTTP_404_NOT_FOUND)
