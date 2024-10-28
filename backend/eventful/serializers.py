from rest_framework import serializers
from .models import Users, Events, UserSettings, Locations, Photos, Segments, Eventsparticipants


class LoginUserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Users
        exclude = ("password","lastlocation","lastlogin","userSetting","recentip","registrationdate","isactive","token")
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

class PublicUserdataSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Users
        fields = [
            "uid",
            "username",
            "language",
            "sex"
        ]
        read_only_fields = ["uid"]


class LocationSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Locations
        fields = '__all__'


class EventsParticipantsSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Eventsparticipants
        fields = '__all__'


class PhotoSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Photos
        fields = '__all__'

class SegmentsSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    class Meta:
        model = Segments
        fields = ['id', 'event', 'name', 'description', 'starttime', 'endtime', 'speaker', 'isactive', 'location']

class EventSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    photo = PhotoSerializer(read_only=True)
    iconFilename = serializers.SerializerMethodField()
    supervisor = PublicUserdataSerializer(read_only=True)
    segments = SegmentsSerializer(read_only=True, many=True)

    class Meta(object):
        model = Events
        fields = '__all__'

    def get_iconFilename(self, obj):
        if obj.icon:
            return obj.icon.filename
        return None

