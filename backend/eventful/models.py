from django.db import models

class Events(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    rules = models.TextField(blank=True, null=True)
    starttime = models.DateTimeField(db_column="startTime")
    endtime = models.DateTimeField(db_column="endTime")
    supervisor = models.ForeignKey("Users", models.DO_NOTHING, db_column="supervisor", blank=True, null=True)
    isactive = models.BooleanField(db_column="isActive", blank=True, null=True)
    ispublic = models.BooleanField(db_column="isPublic", blank=True, null=True)
    joinapproval = models.BooleanField(db_column="joinApproval", blank=True, null=True)
    token = models.CharField(max_length=8, blank=True, null=True)
    location = models.ForeignKey("Locations", models.DO_NOTHING, db_column="location", blank=True, null=True)

    class Meta:
        db_table = "events"

class Eventsparticipants(models.Model):
    user = models.ForeignKey("Users", models.DO_NOTHING, db_column="user", blank=True, null=True)
    event = models.ForeignKey(Events, models.DO_NOTHING, db_column="event", blank=True, null=True)
    role = models.CharField(max_length=32, blank=True, null=True)

    class Meta:
        db_table = "eventsParticipants"

class Locations(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=128, blank=True, null=True)
    latitude = models.CharField(max_length=64)
    longitude = models.CharField(max_length=64)

    class Meta:
        db_table = "locations"

class Logs(models.Model):
    id = models.IntegerField(primary_key=True)
    user = models.ForeignKey("Users", models.DO_NOTHING, db_column="user", blank=True, null=True)
    action = models.CharField(max_length=32)
    time = models.TimeField(blank=True, null=True)

    class Meta:
        db_table = "logs"

class Photos(models.Model):
    id = models.IntegerField(primary_key=True)
    addedby = models.ForeignKey("Users", models.DO_NOTHING, db_column="addedBy", blank=True, null=True)
    filename = models.CharField(max_length=255, blank=True, null=True)
    extension = models.CharField(max_length=16, blank=True, null=True)
    originalfilename = models.CharField(db_column="originalFilename", max_length=255, blank=True, null=True)
    isdeleted = models.BooleanField(db_column="isDeleted", blank=True, null=True)
    eventid = models.ForeignKey(Events, models.DO_NOTHING, db_column="eventId", blank=True, null=True)
    segmentid = models.ForeignKey("Segments", models.DO_NOTHING, db_column="segmentId", blank=True, null=True)

    class Meta:
        db_table = "photos"

class Segments(models.Model):
    id = models.IntegerField(primary_key=True)
    event = models.ForeignKey(Events, models.DO_NOTHING, db_column="event", blank=True, null=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    starttime = models.DateTimeField(db_column="startTime")
    endtime = models.DateTimeField(db_column="endTime")
    speaker = models.ForeignKey("Users", models.DO_NOTHING, db_column="speaker", blank=True, null=True)
    isactive = models.BooleanField(db_column="isActive", blank=True, null=True)
    location = models.ForeignKey(Locations, models.DO_NOTHING, db_column="location", blank=True, null=True)

    class Meta:
        db_table = "segments"

class Segmentsparticipants(models.Model):
    user = models.ForeignKey("Users", models.DO_NOTHING, db_column="user", blank=True, null=True)
    event = models.ForeignKey(Segments, models.DO_NOTHING, db_column="event", blank=True, null=True)

    class Meta:
        db_table = "segmentsParticipants"


class UserSettings(models.Model):
    id = models.AutoField(primary_key=True)
    hasSeenTutorial = models.BooleanField(db_column="hasSeenTutorial", blank=True, null=True, default=False)
    acceptedSharingDetails = models.BooleanField(db_column="acceptedSharingDetails", blank=True, null=True, default=False)
    acceptedTOS = models.BooleanField(db_column="acceptedTOS", blank=True, null=True, default=False)
    acceptedNews = models.BooleanField(db_column="acceptedNews", blank=True, null=True, default=False)
    utilityToken = models.CharField(db_column="utilityToken", blank=True, null=True, default="", max_length=64, db_default="")

    class Meta:
        db_table = "userSettings"


class Users(models.Model):
    uid = models.AutoField(primary_key=True)
    username = models.CharField(max_length=64)
    name = models.CharField(max_length=64)
    surname = models.CharField(max_length=64)
    email = models.CharField(max_length=320)
    password = models.CharField(max_length=64)
    isactive = models.CharField(db_column="isActive", blank=True, null=True, default="False")
    registrationdate = models.CharField(db_column="registrationDate", max_length=64)
    lastlogin = models.CharField(db_column="lastLogin", blank=True, null=True, max_length=64)
    birthdate = models.DateField(db_column="birthDate", blank=True, null=True)
    language = models.CharField(max_length=3, blank=True, null=True)
    lastlocation = models.ForeignKey(Locations, models.DO_NOTHING, db_column="lastLocation", blank=True, null=True)
    recentip = models.CharField(db_column="recentIp", max_length=16, blank=True, null=True)
    sex = models.CharField(max_length=16, blank=True, null=True)
    token = models.CharField(max_length=64, blank=True, null=True)
    userSetting = models.ForeignKey(UserSettings, models.DO_NOTHING, db_column="userSetting", blank=True, null=True, default=UserSettings)

    class Meta:
        db_table = "users"
