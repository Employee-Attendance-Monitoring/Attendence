from django.db import models
from accounts.models import User


# =========================
# EMPLOYEE PROFILE
# =========================
class EmployeeProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="employee_profile"
    )

    organization = models.ForeignKey(
        "organization.Organization",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees"
    )

    employee_code = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=100)

    date_of_joining = models.DateField()
    date_of_birth = models.DateField(null=True, blank=True)

    GENDER_CHOICES = (
        ("MALE", "Male"),
        ("FEMALE", "Female"),
        ("OTHER", "Other"),
    )
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        null=True,
        blank=True
    )

    department = models.CharField(max_length=100)
    role = models.CharField(max_length=100, null=True, blank=True)
    grade = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    company_name = models.CharField(max_length=150)

    BLOOD_GROUP_CHOICES = (
        ("A+", "A+"),
        ("A-", "A-"),
        ("B+", "B+"),
        ("B-", "B-"),
        ("O+", "O+"),
        ("O-", "O-"),
        ("AB+", "AB+"),
        ("AB-", "AB-"),
    )

    

    blood_group = models.CharField(
        max_length=3,
        choices=BLOOD_GROUP_CHOICES,
        null=True,
        blank=True
    )

    # 🌍 International phone number support
    phone_number = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    pancard_number = models.CharField(max_length=10, null=True, blank=True)
    aadhaar_number = models.CharField(max_length=12, null=True, blank=True)

    photo = models.ImageField(
        upload_to="employees/photos/",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee_code} - {self.full_name}"


# =========================
# FAMILY MEMBER
# =========================
class FamilyMember(models.Model):
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name="family_members"
    )

    name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    date_of_birth = models.DateField(null=True, blank=True)

    phone_number = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.relationship})"


# =========================
# BANK DETAILS
# =========================
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
