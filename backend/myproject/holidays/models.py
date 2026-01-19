# holidays/models.py
from django.db import models

class Holiday(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateField()
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["date"]

    def __str__(self):
        return f"{self.name} - {self.date}"


from django.db import models

class HolidayCalendar(models.Model):
    file = models.FileField(upload_to="holiday_calendar/")
    uploaded_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Holiday Calendar"


