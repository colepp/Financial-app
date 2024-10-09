from django.db import models

# Create your models here.
class signupDetails(models.Model):
    email = models.EmailField()
    first_name = models.CharField(max_length=40)
    last_name = models.CharField(max_length=40)
    password = models.CharField()
    password_confirm = models.CharField()