# Generated by Django 5.1.7 on 2025-04-06 08:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("Aarumi", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="aarumi",
            old_name="reply_to",
            new_name="Aarumi_reply",
        ),
    ]
