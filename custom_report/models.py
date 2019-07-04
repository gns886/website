from django.db import models
from django.utils import timezone
import datetime
# Create your models here.

# Create your models here.
class Messages(models.Model):
    message_text   = models.CharField(max_length=200)
    module_text    = models.CharField(max_length=200)
    priority_int   = models.IntegerField()
    from_ip_text   = models.CharField(max_length=20)
    to_ip_text     = models.CharField(max_length=20)
    pub_date       = models.DateTimeField('date published')
    change_date    = models.DateTimeField('date recently changed')
    state_int      = models.IntegerField()
    test_info_text = models.CharField(max_length=200)
    method_int     = models.CharField(max_length=200)
    def __str__(self):
        return self.message_text
    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)
