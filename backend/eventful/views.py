from datetime import datetime, timedelta

from django.db import transaction
from django.middleware.csrf import get_token
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt

from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Users, Events, UserSettings, Eventsparticipants
from .serializers import RegisterUserSerializer, LoginUserSerializer, EventSerializer, UserSettingsSerializer, \
    EventsParticipantsSerializer
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
        event = Events.objects.get(joinCode=code.lower(), ispublic=True, joinapproval=False)

        if event:
            return render(request, "index.html", {"code": event.joinCode})

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

        userApproval = Eventsparticipants.objects.filter(user=user, event=event, isAccepted=True)

        if userApproval:
            return redirect("event_page", eventToken=event.token)
        else:
            return render(request, "index.html", {"code": code})
    else:
        return Response("Invalid user.", status=status.HTTP_404_NOT_FOUND)

def eventPage(request, eventToken=None):

    # Checking if event exist
    requestedEvent = Events.objects.get(token=eventToken.lower(), isactive=True)
    if not requestedEvent:
        return Response({"detail": "Event does not exist, or is inactive."}, status=status.HTTP_400_BAD_REQUEST)

    # Checking if participant is logged
    userToken = request.COOKIES.get('token')

    # OK if user is not logged and event is public and event doesn't need request to enter
    if not userToken and requestedEvent.ispublic and not requestedEvent.joinapproval:
        return render(request, "index.html", {"eventToken": requestedEvent.token})

    # Checking if user is valid and is logged in
    try:
        user = Users.objects.get(token=userToken)
    except Users.DoesNotExist:
        return Response({"detail": "Invalid token: " + userToken}, status=status.HTTP_400_BAD_REQUEST)

    if user and requestedEvent:
        if requestedEvent.joinapproval:
            # check if user is approved to attend
            userApproval = Eventsparticipants.objects.filter(user=user, event=requestedEvent, isAccepted=True)

            if userApproval:
                return render(request, "index.html", {"eventToken": eventToken.lower()})
            else:
                return Response({"detail": "User is not accepted to attend."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return render(request, "index.html", {"eventToken": eventToken.lower()})
    else:
        return Response({"detail": "Invalid data provided."}, status=status.HTTP_400_BAD_REQUEST)


def error_404(request, exception):
    return render(request, "index.html")

def error_500(request):
    return render(request, "index.html")

def error_403(request, exception):
    return render(request, "index.html")
