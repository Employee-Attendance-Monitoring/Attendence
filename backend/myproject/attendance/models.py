from django.db import models
from django.utils import timezone
from accounts.models import User


# attendance/models.py
class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()

    sign_in = models.DateTimeField(null=True, blank=True)
    sign_out = models.DateTimeField(null=True, blank=True)

    working_hours = models.DecimalField(
        max_digits=5, decimal_places=2, default=0
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("PRESENT", "Present"),
            ("ABSENT", "Absent"),
            ("HALF_DAY", "Half Day"),
        ],
        default="ABSENT",
    )

    # IMPORTANT
    is_auto_signout = models.BooleanField(default=False)
    auto_signout_reason = models.CharField(
        max_length=100,
        default="",
        blank=True
    )

    
    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} - {self.date}"
