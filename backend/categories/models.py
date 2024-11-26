from django.db import models
from profiles.models import Profile

class Category(models.Model):
    title = models.CharField(max_length=100, unique = True)

class Subscriber(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
