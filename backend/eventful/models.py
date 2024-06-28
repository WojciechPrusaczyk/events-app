# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Events(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)  # This field type is a guess.
    rules = models.TextField(blank=True, null=True)  # This field type is a guess.
    starttime = models.DateTimeField(
        db_column="startTime"
    )  # Field name made lowercase.
    endtime = models.DateTimeField(db_column="endTime")  # Field name made lowercase.
    supervisor = models.ForeignKey("Users", models.DO_NOTHING, db_column="supervisor")
    isactive = models.BooleanField(
        db_column="isActive", blank=True, null=True
    )  # Field name made lowercase.
    ispublic = models.BooleanField(
        db_column="isPublic", blank=True, null=True
    )  # Field name made lowercase.
    joinapproval = models.BooleanField(
        db_column="joinApproval", blank=True, null=True
    )  # Field name made lowercase.
    token = models.CharField(max_length=8, blank=True, null=True)
    location = models.ForeignKey(
        "Locations", models.DO_NOTHING, db_column="location", blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = "events"


class Eventsparticipants(models.Model):
    user = models.ForeignKey("Users", models.DO_NOTHING, db_column="user")
    event = models.ForeignKey(Events, models.DO_NOTHING, db_column="event")
    role = models.CharField(max_length=32, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "eventsParticipants"


class Locations(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=128, blank=True, null=True)
    latitude = models.CharField(max_length=64)
    longitude = models.CharField(max_length=64)

    class Meta:
        managed = False
        db_table = "locations"


class Logs(models.Model):
    id = models.IntegerField(primary_key=True)
    user = models.ForeignKey("Users", models.DO_NOTHING, db_column="user")
    action = models.CharField(max_length=32)
    time = models.TimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "logs"


class Photos(models.Model):
    id = models.IntegerField(primary_key=True)
    addedby = models.ForeignKey(
        "Users", models.DO_NOTHING, db_column="addedBy"
    )  # Field name made lowercase.
    filename = models.CharField(max_length=255, blank=True, null=True)
    extension = models.CharField(max_length=16, blank=True, null=True)
    originalfilename = models.CharField(
        db_column="originalFilename", max_length=255, blank=True, null=True
    )  # Field name made lowercase.
    isdeleted = models.BooleanField(
        db_column="isDeleted", blank=True, null=True
    )  # Field name made lowercase.
    eventid = models.ForeignKey(
        Events, models.DO_NOTHING, db_column="eventId", blank=True, null=True
    )  # Field name made lowercase.
    segmentid = models.ForeignKey(
        "Segments", models.DO_NOTHING, db_column="segmentId", blank=True, null=True
    )  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = "photos"


class Segments(models.Model):
    id = models.IntegerField(primary_key=True)
    event = models.ForeignKey(
        Events, models.DO_NOTHING, db_column="event", blank=True, null=True
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)  # This field type is a guess.
    starttime = models.DateTimeField(
        db_column="startTime"
    )  # Field name made lowercase.
    endtime = models.DateTimeField(db_column="endTime")  # Field name made lowercase.
    speaker = models.ForeignKey(
        "Users", models.DO_NOTHING, db_column="speaker", blank=True, null=True
    )
    isactive = models.BooleanField(
        db_column="isActive", blank=True, null=True
    )  # Field name made lowercase.
    location = models.ForeignKey(
        Locations, models.DO_NOTHING, db_column="location", blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = "segments"


class Segmentsparticipants(models.Model):
    user = models.ForeignKey("Users", models.DO_NOTHING, db_column="user")
    event = models.ForeignKey(Segments, models.DO_NOTHING, db_column="event")

    class Meta:
        managed = False
        db_table = "segmentsParticipants"


class Users(models.Model):
    uid = models.IntegerField(primary_key=True)
    username = models.CharField(max_length=64)
    name = models.CharField(max_length=64)
    surname = models.CharField(max_length=64)
    email = models.CharField(max_length=320)
    password = models.CharField(max_length=32)
    registrationdate = models.DateTimeField(
        db_column="registrationDate"
    )  # Field name made lowercase.
    lastlogin = models.DateTimeField(
        db_column="lastLogin", blank=True, null=True
    )  # Field name made lowercase.
    birthdate = models.DateField(
        db_column="birthDate", blank=True, null=True
    )  # Field name made lowercase.
    language = models.CharField(max_length=3, blank=True, null=True)
    lastlocation = models.ForeignKey(
        Locations, models.DO_NOTHING, db_column="lastLocation", blank=True, null=True
    )  # Field name made lowercase.
    recentip = models.CharField(
        db_column="recentIp", max_length=16, blank=True, null=True
    )  # Field name made lowercase.
    isactive = models.BooleanField(
        db_column="isActive", blank=True, null=True
    )  # Field name made lowercase.
    hasseentutorial = models.BooleanField(
        db_column="hasSeenTutorial", blank=True, null=True
    )  # Field name made lowercase.
    sex = models.CharField(max_length=16, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "users"
