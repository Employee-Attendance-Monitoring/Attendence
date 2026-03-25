from django.db import models
from datetime import timedelta
from accounts.models import User


# =========================
# LEAVE TYPE (ADMIN MANAGED)
# =========================
class LeaveType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Leave Type"
        verbose_name_plural = "Leave Types"

    def __str__(self):
        return self.name


# =========================
# LEAVE MODEL
# =========================
class Leave(models.Model):

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    )

    HALF_DAY_CHOICES = (
        ("FULL", "Full Day"),
        ("FIRST_HALF", "1st Half"),
        ("SECOND_HALF", "2nd Half"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="leaves"
    )

    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.PROTECT,
        related_name="leaves"
    )

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    leave_days = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=1.0
    )

    is_half_day = models.CharField(
        max_length=15,
        choices=HALF_DAY_CHOICES,
        default="FULL"
    )

    is_comp_off = models.BooleanField(default=False)
    reason = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    applied_at = models.DateTimeField(auto_now_add=True)
    actioned_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-applied_at"]

    def save(self, *args, **kwargs):
        if self.start_date:
            # ✅ Half-day leave
            if self.is_half_day in ["FIRST_HALF", "SECOND_HALF"]:
                self.leave_days = 0.5
                self.end_date = self.start_date
            else:
                # ✅ Full-day leave 
                days = int(float(self.leave_days or 1)) - 1
                self.end_date = self.start_date + timedelta(days=max(days, 0))

        super().save(*args, **kwargs)

    @property
    def leave_type_name(self):
        return self.leave_type.name.lower()

    def __str__(self):
        return f"{self.user.email} | {self.leave_type.name} | {self.status}"


# =========================
# LEAVE BALANCE
# =========================
class LeaveBalance(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="leave_balance"
    )

    paid_leave = models.PositiveIntegerField(default=0)
    sick_leave = models.PositiveIntegerField(default=0)
    casual_leave = models.PositiveIntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    
    @property
    def total_leaves(self):
        return (
            (self.paid_leave or 0) +
            (self.sick_leave or 0) +
            (self.casual_leave or 0)
        )

    def __str__(self):
        return f"{self.user.email}"