from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=150)
    logo = models.ImageField(
        upload_to="organization/logo/",
        null=True,
        blank=True
    )
    phone = models.CharField(max_length=13)  # +91XXXXXXXXXX
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)

    emp_prefix = models.CharField(
        max_length=10,
        default="EMP"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    
class Department(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="departments"
    )
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
class Role(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="roles"
    )
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
