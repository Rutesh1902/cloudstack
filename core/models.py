from django.db import models

# Create your models here.

class CustomUser(models.Model):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)  # Store hashed password

    def __str__(self):
        return self.email
