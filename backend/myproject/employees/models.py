from django.db import models
from accounts.models import User

class EmployeeProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="employee_profile"
    )

    employee_code = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=100)
    date_of_joining = models.DateField()
    department = models.CharField(max_length=100)
    company_name = models.CharField(max_length=150)
    photo = models.ImageField(upload_to="employees/photos/", null=True, blank=True)

    def __str__(self):
        return f"{self.employee_code} - {self.full_name}"


class FamilyMember(models.Model):
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name="family_members"
    )

    name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.relationship})"


class BankDetail(models.Model):
    employee = models.OneToOneField(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name="bank_detail"
    )

    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"
