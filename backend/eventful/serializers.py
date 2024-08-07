from rest_framework import serializers
from .models import Users, Events, UserSettings

class LoginUserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Users
        exclude = ("password","lastlocation","lastlogin","userSetting","recentip","registrationdate")
        read_only_fields = ["uid"]

class RegisterUserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Users
        fields = [
            "uid",
            "username",
            "name",
            "surname",
            "password",
            "email",
            "birthdate",
            "language",
            "isactive",
            "sex",
            "token"
        ]
        read_only_fields = ["uid"]

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = UserSettings
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Events
        fields = '__all__'
