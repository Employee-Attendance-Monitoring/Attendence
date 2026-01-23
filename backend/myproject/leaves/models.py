from django.db import models
from accounts.models import User


class Leave(models.Model):
    LEAVE_TYPE_CHOICES = (
        ("PAID", "Paid Leave"),
        ("SICK", "Sick Leave"),
        ("CASUAL", "Casual Leave"),
    )

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="leaves"
    )

    leave_type = models.CharField(
        max_length=20,
        choices=LEAVE_TYPE_CHOICES
    )

    start_date = models.DateField()
    end_date = models.DateField()

    reason = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    applied_at = models.DateTimeField(auto_now_add=True)
    actioned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.user.email} | {self.leave_type} | {self.status}"


# ✅ NEW MODEL (CORRECT)
# leaves/models.py
class LeaveBalance(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="leave_balance"
    )
    total_leaves = models.PositiveIntegerField(default=12)
    leaves_taken = models.PositiveIntegerField(default=0)  # ✅ ADD THIS
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} | Total: {self.total_leaves}"
