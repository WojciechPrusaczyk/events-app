# Generated by Django 5.0.6 on 2024-09-19 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eventful', '0005_alter_users_isactive'),
    ]

    operations = [
        migrations.AlterField(
            model_name='users',
            name='isactive',
            field=models.BooleanField(blank=True, db_column='isActive', default=False, null=True),
        ),
    ]
