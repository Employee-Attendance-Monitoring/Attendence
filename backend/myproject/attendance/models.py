from django.db import models
from django.utils import timezone
from accounts.models import User


class Attendance(models.Model):
    STATUS_CHOICES = (
        ("PRESENT", "Present"),
        ("HALF_DAY", "Half Day"),
        ("ABSENT", "Absent"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="attendances"
    )
    date = models.DateField(default=timezone.localdate)
    sign_in = models.DateTimeField(null=True, blank=True)
    sign_out = models.DateTimeField(null=True, blank=True)
    working_hours = models.DecimalField(
        max_digits=5, decimal_places=2, default=0
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="ABSENT"
    )

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} - {self.date}"
