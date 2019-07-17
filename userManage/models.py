from django.db import models
#from eventManage.models import Event,UncheckedEvent
#from defectManage.models import Module,Data
from cache.variables import variables
# Create your models here.

# Create your models here.


class Module(models.Model):
    name = models.CharField(max_length=30)
    detail = models.CharField(max_length=100,null=True)

    def __str__(self):
        return self.name



class Users(models.Model):

    username   = models.CharField(max_length=100)
    name       = models.CharField(max_length=100, null=True)
    password   = models.CharField(max_length=100)
    authority  = models.IntegerField()
    module = models.ForeignKey(Module, null=True, on_delete=models.CASCADE)
    tel_number = models.CharField(max_length=20, null=True)
    E_mail     = models.CharField(max_length=100, null=True)
    sex        = models.CharField(max_length=4, null=True)
    note       = models.CharField(max_length=500, null=True)
    image      = models.ImageField(null=True,blank=True)

    def __str__(self):
        return self.username


class Event(models.Model):
    name_text = models.CharField(max_length=100)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    priority = models.IntegerField()
    method = models.CharField(max_length=200,null=True)
    operator_name = models.CharField(max_length=20,null=True)
    inspector_name = models.CharField(max_length=20,null=True)
    operator = models.ForeignKey(Users,related_name='event_operator',on_delete=models.SET_NULL,blank=True,null=True)
    inspector = models.ForeignKey(Users,related_name='event_inspector',on_delete=models.SET_NULL,blank=True,null=True)
    pub_date = models.DateTimeField('date published')
    deal_date = models.DateTimeField('date handled')
    state = models.IntegerField()
    detail_state = models.CharField(max_length=10)
    deal_addition = models.CharField(max_length = 300,null=True)   #TODO 上传附件
    deal_info = models.CharField(max_length = 300,null=True)
    test_info = models.CharField(max_length = 300,null=True)
    test_addition = models.CharField(max_length = 300,null=True)    #TODO 上传附件
    note = models.CharField(max_length = 300,null=True)
    judge = models.CharField(max_length = 5)
    result = models.CharField(max_length = 5)
    def __str__(self):
        return self.name_text

class UnassignedEvent(models.Model):
    event = models.ForeignKey(Event,on_delete=models.CASCADE,null=True)
    foreign_id = models.IntegerField()
    def __str__(self):
        return self.event.name_text

class SolvedEvent(models.Model):
    event = models.ForeignKey(Event,on_delete=models.CASCADE,null=True)
    foreign_id = models.IntegerField()
    def __str__(self):
        return self.event.name_text

class CurrentEvent(models.Model):
    event = models.ForeignKey(Event,on_delete=models.CASCADE,null=True)
    foreign_id = models.IntegerField()
    def __str__(self):
        return self.event.name_text