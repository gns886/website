# Generated by Django 2.2.2 on 2019-07-05 05:15

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Users',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username_text', models.CharField(max_length=100)),
                ('password_text', models.CharField(max_length=100)),
                ('authority_int', models.IntegerField()),
            ],
        ),
    ]
