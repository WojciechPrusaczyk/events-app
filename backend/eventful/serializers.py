from rest_framework import serializers
from .models import Users, Events, UserSettings

class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Users
        fields = [
            "uid",
            "username",
            "name",
            "surname",
            "password"
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
