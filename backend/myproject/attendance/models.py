from django.db import models
from django.utils import timezone
from accounts.models import User


class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()

    sign_in = models.DateTimeField(null=True, blank=True)
    sign_out = models.DateTimeField(null=True, blank=True)

    working_hours = models.DecimalField(
        max_digits=5, decimal_places=2, default=0
    )

    STATUS_CHOICES = [
        ("PRESENT", "Present"),
        ("ABSENT", "Absent"),
        ("HALF_DAY", "Half Day"),
        ("WEEK_OFF", "Week Off"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ABSENT",
    )

    is_auto_signout = models.BooleanField(default=False)

    auto_signout_reason = models.CharField(
        max_length=100,
        default="",
        blank=True
    )

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def save(self, *args, **kwargs):
        # WEEKEND LOGIC
        if self.date.weekday() in (5, 6):  # Saturday, Sunday
            if self.sign_in:
                self.status = "PRESENT"
            else:
                self.status = "WEEK_OFF"

        else:
            # WEEKDAY LOGIC
            if not self.sign_in:
                self.status = "ABSENT"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.date}"