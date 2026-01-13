from django.db import models

class Holiday(models.Model):
    name = models.CharField(max_length=150)
    date = models.DateField(unique=True)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date"]

    def __str__(self):
        return f"{self.name} - {self.date}"
