from django.db import models
from django.utils import timezone
import datetime
# Create your models here.

# Create your models here.
class Users(models.Model):
    username_text  = models.CharField(max_length=100)
    password_text  = models.CharField(max_length=100)
    authority_int  = models.IntegerField()