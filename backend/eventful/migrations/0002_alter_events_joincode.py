# Generated by Django 5.0.6 on 2024-10-09 13:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eventful', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='events',
            name='joinCode',
            field=models.CharField(blank=True, db_column='joinCode', max_length=255, null=True),
        ),
    ]
