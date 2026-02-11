from django.db import models
from django.conf import settings

class CompanyPolicy(models.Model):
    CATEGORY_CHOICES = (
        ('GENERAL', 'General'),
        ('HR', 'HR'),
        ('IT', 'IT'),
        ('FINANCE', 'Finance'),
       )

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    file = models.FileField(upload_to='policies/')
    from_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class PolicyAcknowledgement(models.Model):
    policy = models.ForeignKey(CompanyPolicy, on_delete=models.CASCADE)
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    acknowledged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('policy', 'employee')
