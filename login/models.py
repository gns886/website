from django.db import models
from defectManage.models import Module,Data
# Create your models here.

# Create your models here.
class Users(models.Model):
    username   = models.CharField(max_length=100)
    password   = models.CharField(max_length=100)
    authority  = models.IntegerField()
    module     = models.ManyToManyField(Module, on_delete=models.CASCADE,null=True)
    tel_number = models.CharField(max_length=20)
    address    = models.CharField(max_length=100)
    def __str__(self):
        return self.username

