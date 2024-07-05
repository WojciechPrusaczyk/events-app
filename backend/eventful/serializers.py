from rest_framework import serializers
from .models import Users


class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Users
        fields = [
            "uid",
            "username",
            "name",
            "surname",
            "password",
            "email",
            "registrationdate",
            "birthdate",
            "language",
            "isactive",
            "sex",
            "token"
        ]

        read_only_fields = ["uid"]


