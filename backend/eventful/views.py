from .serializers import UserSerializer
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import logout as django_logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)


# Create your views here.
def index(request):
    return render(request, "index.html")


@csrf_exempt
@api_view(["POST"])
def login(request):
    try:
        user = get_object_or_404(User, username=request.data["username"])
    except User.DoesNotExist:
        return Response(
            {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
        )
    if not user.check_password(request.data["password"]):
        return Response(
            {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
        )
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user)
    return Response({"token": token.key, "user": serializer.data})


@csrf_exempt
@api_view(["POST"])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(request.data["password"])
        user.save()
        token = Token.objects.create(user=user)
        return Response(
            {"token": token.key, "user": serializer.data},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(["GET"])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def user(request):
    user = request.user
    data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }
    return Response(data)


@api_view(["POST"])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    user = request.user
    token = Token.objects.get(user=user)  # Retrieve the token from the request
    if token:
        token.delete()
        django_logout(request)
        return Response({"detail": "Logout succesfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "Can't logout"}, status=status.HTTP_404_NOT_FOUND)
