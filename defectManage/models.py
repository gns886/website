from django.db import models
# Create your models here.

class Module(models.Model):
    name_text   = models.CharField(max_length=100)
    def __str__(self):
        return self.name_text

class Method(models.Model):
    name_text   = models.CharField(max_length=100)
    in_module   = models.ForeignKey(Module, on_delete=models.CASCADE)
    detail_info = models.CharField(max_length=100)
    def __str__(self):
        return self.name_text

class Data(models.Model):
    name_text = models.CharField(max_length=100)
    module    = models.ForeignKey(Module, on_delete=models.CASCADE)
    priority  = models.IntegerField()
    method    = models.ForeignKey(Method, on_delete=models.CASCADE)
    from_ip   = models.CharField(max_length=20)
    to_ip     = models.CharField(max_length=20)
    pub_date  = models.DateTimeField('date published')
    deal_date = models.DateTimeField('date handled')
    authority = models.IntegerField()
    state     = models.IntegerField()
    def __str__(self):
        return self.name_text