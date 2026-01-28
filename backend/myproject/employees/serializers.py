from rest_framework import serializers
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import secrets
import string
import json

from organization.models import Organization
from .models import EmployeeProfile, FamilyMember, BankDetail

User = get_user_model()

# =========================
# PASSWORD GENERATOR
# =========================
def generate_password(length=10):
    chars = string.ascii_letters + string.digits + "@#$%"
    return "".join(secrets.choice(chars) for _ in range(length))


# =========================
# FAMILY MEMBER
# =========================
class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMember
        fields = [
            "id",
            "name",
            "relationship",
            "date_of_birth",
            "phone_number",
        ]


# =========================
# BANK DETAIL
# =========================
class BankDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankDetail
        fields = [
            "bank_name",
            "account_number",
            "ifsc_code",
        ]


# =========================
# EMPLOYEE PROFILE
# =========================
class EmployeeProfileSerializer(serializers.ModelSerializer):
    # Nested
    family_members = FamilyMemberSerializer(many=True, required=False)
    bank_detail = BankDetailSerializer(required=False)

    # Auth
    email = serializers.EmailField(write_only=True)

    # Display
    email_display = serializers.EmailField(
        source="user.email",
        read_only=True
    )
    employee_code = serializers.CharField(read_only=True)

    # Optional fields
    gender = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(required=False, allow_blank=True)
    grade = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    phone_number = serializers.CharField(required=False, allow_blank=True)
    pancard_number = serializers.CharField(required=False, allow_blank=True)
    aadhaar_number = serializers.CharField(required=False, allow_blank=True)

    date_of_birth = serializers.DateField(required=False)
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = EmployeeProfile
        fields = [
            "id",

            # auth
            "email",
            "email_display",

            # core
            "employee_code",
            "full_name",
            "gender",
            "date_of_birth",
            "date_of_joining",

            # org
            "department",
            "role",
            "grade",
            "address",
            "company_name",

            # personal
            "phone_number",
            "pancard_number",
            "aadhaar_number",
            "photo",

            # nested
            "family_members",
            "bank_detail",
        ]

    # ================= VALIDATION =================
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Employee with this email already exists."
            )
        return value

    # ================= CREATE =================
    def create(self, validated_data):
        request = self.context.get("request")

        # Nested data from FormData
        bank_data = request.data.get("bank_detail")
        family_data = request.data.get("family_members")

        if isinstance(bank_data, str):
            bank_data = json.loads(bank_data)

        if isinstance(family_data, str):
            family_data = json.loads(family_data)

        email = validated_data.pop("email")

        # 🔐 Auto-generate password
        raw_password = generate_password()

        # 🏢 Active organization
        organization = Organization.objects.filter(is_active=True).first()
        if not organization:
            raise serializers.ValidationError(
                {"organization": "Active organization not found"}
            )

        # 🆔 Generate employee code
        last_employee = (
            EmployeeProfile.objects
            .filter(organization=organization)
            .order_by("-id")
            .first()
        )

        next_number = last_employee.id + 1 if last_employee else 1
        employee_code = f"{organization.emp_prefix}{str(next_number).zfill(3)}"

        # Force company name
        validated_data["company_name"] = organization.name

        with transaction.atomic():
            # Create user
            user = User.objects.create_user(
                email=email,
                password=raw_password,
                role="EMPLOYEE",
            
            )

            # Create employee profile
            employee = EmployeeProfile.objects.create(
                user=user,
                organization=organization,
                employee_code=employee_code,
                **validated_data
            )

            # Bank detail
            if bank_data:
                BankDetail.objects.create(
                    employee=employee,
                    **bank_data
                )

            # Family members
            if family_data:
                for member in family_data:
                    FamilyMember.objects.create(
                        employee=employee,
                        **member
                    )

        # 📧 Send email (safe)
        try:
            send_mail(
                subject="Your Employee Account Credentials",
                message=(
                    f"Hello {employee.full_name},\n\n"
                    f"Your employee account has been created.\n\n"
                    f"Login Email: {email}\n"
                    f"Temporary Password: {raw_password}\n\n"
                    f"Please login and change your password immediately."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            # Do NOT break employee creation
            print("Email sending failed:", e)

        return employee


# =========================
# EMPLOYEE DROPDOWN
# =========================
class EmployeeDropdownSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = EmployeeProfile
        fields = [
            "email",
            "department",
        ]
