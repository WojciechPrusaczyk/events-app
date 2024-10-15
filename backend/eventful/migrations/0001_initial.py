# Generated by Django 5.0.6 on 2024-10-15 17:08

import django.db.models.deletion
import eventful.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Locations',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('placeId', models.CharField(db_column='placeId', default='default', null=True)),
                ('formattedAddress', models.CharField(blank=True, max_length=256, null=True)),
                ('latitude', models.CharField(default='0', max_length=64)),
                ('longitude', models.CharField(default='0', max_length=64)),
            ],
            options={
                'db_table': 'locations',
            },
        ),
        migrations.CreateModel(
            name='Photos',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('filename', models.CharField(blank=True, max_length=255, null=True)),
                ('extension', models.CharField(blank=True, max_length=16, null=True)),
                ('originalfilename', models.CharField(blank=True, db_column='originalFilename', max_length=255, null=True)),
                ('isdeleted', models.BooleanField(blank=True, db_column='isDeleted', null=True)),
            ],
            options={
                'db_table': 'photos',
            },
        ),
        migrations.CreateModel(
            name='UserSettings',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('hasSeenTutorial', models.BooleanField(blank=True, db_column='hasSeenTutorial', default=False, null=True)),
                ('acceptedSharingDetails', models.BooleanField(blank=True, db_column='acceptedSharingDetails', default=False, null=True)),
                ('acceptedTOS', models.BooleanField(blank=True, db_column='acceptedTOS', default=False, null=True)),
                ('acceptedNews', models.BooleanField(blank=True, db_column='acceptedNews', default=False, null=True)),
                ('utilityToken', models.CharField(blank=True, db_column='utilityToken', db_default='', default='', max_length=64, null=True)),
            ],
            options={
                'db_table': 'userSettings',
            },
        ),
        migrations.CreateModel(
            name='Events',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('description', models.JSONField(blank=True, null=True)),
                ('rules', models.JSONField(blank=True, null=True)),
                ('starttime', models.DateTimeField(db_column='startTime')),
                ('endtime', models.DateTimeField(db_column='endTime')),
                ('isactive', models.BooleanField(blank=True, db_column='isActive', null=True)),
                ('ispublic', models.BooleanField(blank=True, db_column='isPublic', null=True)),
                ('joinapproval', models.BooleanField(blank=True, db_column='joinApproval', null=True)),
                ('token', models.CharField(blank=True, max_length=16, null=True)),
                ('joinCode', models.CharField(blank=True, db_column='joinCode', max_length=255, null=True)),
                ('location', models.ForeignKey(blank=True, db_column='location', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.locations')),
                ('icon', models.ForeignKey(blank=True, db_column='photo', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.photos')),
            ],
            options={
                'db_table': 'events',
            },
        ),
        migrations.CreateModel(
            name='Segments',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('starttime', models.DateTimeField(db_column='startTime')),
                ('endtime', models.DateTimeField(db_column='endTime')),
                ('isactive', models.BooleanField(blank=True, db_column='isActive', null=True)),
                ('event', models.ForeignKey(blank=True, db_column='event', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.events')),
                ('location', models.ForeignKey(blank=True, db_column='location', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.locations')),
            ],
            options={
                'db_table': 'segments',
            },
        ),
        migrations.CreateModel(
            name='Users',
            fields=[
                ('uid', models.AutoField(primary_key=True, serialize=False)),
                ('username', models.CharField(max_length=64, unique=True)),
                ('name', models.CharField(max_length=64)),
                ('surname', models.CharField(max_length=64)),
                ('email', models.CharField(max_length=320)),
                ('password', models.CharField(max_length=64)),
                ('isactive', models.BooleanField(blank=True, db_column='isActive', default=False, null=True)),
                ('registrationdate', models.CharField(db_column='registrationDate', max_length=64)),
                ('lastlogin', models.CharField(blank=True, db_column='lastLogin', max_length=64, null=True)),
                ('birthdate', models.DateField(blank=True, db_column='birthDate', null=True)),
                ('language', models.CharField(blank=True, max_length=3, null=True)),
                ('recentip', models.CharField(blank=True, db_column='recentIp', max_length=16, null=True)),
                ('sex', models.CharField(blank=True, max_length=16, null=True)),
                ('token', models.CharField(blank=True, max_length=64, null=True)),
                ('lastlocation', models.ForeignKey(blank=True, db_column='lastLocation', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.locations')),
                ('userSetting', models.ForeignKey(blank=True, db_column='userSetting', default=eventful.models.UserSettings, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.usersettings')),
            ],
            options={
                'db_table': 'users',
            },
        ),
        migrations.CreateModel(
            name='Segmentsparticipants',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event', models.ForeignKey(blank=True, db_column='event', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.segments')),
                ('user', models.ForeignKey(blank=True, db_column='user', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.users')),
            ],
            options={
                'db_table': 'segmentsParticipants',
            },
        ),
        migrations.AddField(
            model_name='segments',
            name='speaker',
            field=models.ForeignKey(blank=True, db_column='speaker', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.users'),
        ),
        migrations.AddField(
            model_name='photos',
            name='addedby',
            field=models.ForeignKey(blank=True, db_column='addedBy', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.users'),
        ),
        migrations.CreateModel(
            name='Logs',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('action', models.CharField(max_length=32)),
                ('time', models.TimeField(blank=True, null=True)),
                ('user', models.ForeignKey(blank=True, db_column='user', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.users')),
            ],
            options={
                'db_table': 'logs',
            },
        ),
        migrations.CreateModel(
            name='Eventsparticipants',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(blank=True, max_length=32, null=True)),
                ('event', models.ForeignKey(blank=True, db_column='event', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.events')),
                ('user', models.ForeignKey(blank=True, db_column='user', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.users')),
            ],
            options={
                'db_table': 'eventsParticipants',
            },
        ),
        migrations.AddField(
            model_name='events',
            name='supervisor',
            field=models.ForeignKey(blank=True, db_column='supervisor', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.users'),
        ),
    ]
