from django.db import models

# Create your models here.
class Data(models.Model):
    name_text     = models.CharField(max_length=100)
    module_text   = models.CharField(max_length=100)
    priority_int  = models.IntegerField()
    Method_int    = models.CharField(max_length=100)

class MethodList(models.Model):
    name_text      = models.CharField(max_length=100)
    in_module_text = models.CharField(max_length=100)

class ModuleList(models.Model):
    name_text   = models.CharField(max_length=100)
