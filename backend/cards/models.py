from django.db import models
from categories.models import Category
from profiles.models import Profile

class Card(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField()
    image = models.URLField()
    price = models.IntegerField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    shutdown_time = models.CharField(max_length=50)
    last_scrap_date  = models.DateTimeField()
class Favorite(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    card = models.ForeignKey(Card, on_delete=models.CASCADE)

