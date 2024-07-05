# Generated by Django 5.0.6 on 2024-07-01 18:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Locations',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=128, null=True)),
                ('latitude', models.CharField(max_length=64)),
                ('longitude', models.CharField(max_length=64)),
            ],
            options={
                'db_table': 'locations',
            },
        ),
        migrations.CreateModel(
            name='Events',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('rules', models.TextField(blank=True, null=True)),
                ('starttime', models.DateTimeField(db_column='startTime')),
                ('endtime', models.DateTimeField(db_column='endTime')),
                ('isactive', models.BooleanField(blank=True, db_column='isActive', null=True)),
                ('ispublic', models.BooleanField(blank=True, db_column='isPublic', null=True)),
                ('joinapproval', models.BooleanField(blank=True, db_column='joinApproval', null=True)),
                ('token', models.CharField(blank=True, max_length=8, null=True)),
                ('location', models.ForeignKey(blank=True, db_column='location', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.locations')),
            ],
            options={
                'db_table': 'events',
            },
        ),
        migrations.CreateModel(
            name='Segments',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
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
                ('username', models.CharField(max_length=64)),
                ('name', models.CharField(max_length=64)),
                ('surname', models.CharField(max_length=64)),
                ('email', models.CharField(max_length=320)),
                ('password', models.CharField(max_length=32)),
                ('registrationdate', models.DateTimeField(db_column='registrationDate')),
                ('lastlogin', models.DateTimeField(blank=True, db_column='lastLogin', null=True)),
                ('birthdate', models.DateField(blank=True, db_column='birthDate', null=True)),
                ('language', models.CharField(blank=True, max_length=3, null=True)),
                ('recentip', models.CharField(blank=True, db_column='recentIp', max_length=16, null=True)),
                ('isactive', models.BooleanField(blank=True, db_column='isActive', null=True)),
                ('hasseentutorial', models.BooleanField(blank=True, db_column='hasSeenTutorial', null=True)),
                ('sex', models.CharField(blank=True, max_length=16, null=True)),
                ('token', models.CharField(blank=True, max_length=64, null=True)),
                ('lastlocation', models.ForeignKey(blank=True, db_column='lastLocation', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.locations')),
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
        migrations.CreateModel(
            name='Photos',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('filename', models.CharField(blank=True, max_length=255, null=True)),
                ('extension', models.CharField(blank=True, max_length=16, null=True)),
                ('originalfilename', models.CharField(blank=True, db_column='originalFilename', max_length=255, null=True)),
                ('isdeleted', models.BooleanField(blank=True, db_column='isDeleted', null=True)),
                ('eventid', models.ForeignKey(blank=True, db_column='eventId', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.events')),
                ('segmentid', models.ForeignKey(blank=True, db_column='segmentId', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.segments')),
                ('addedby', models.ForeignKey(blank=True, db_column='addedBy', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='eventful.users')),
            ],
            options={
                'db_table': 'photos',
            },
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
