from rest_framework import serializers
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import secrets, string, json

from organization.models import Organization
from .models import EmployeeProfile, FamilyMember, BankDetail

User = get_user_model()


# ================= PASSWORD GENERATOR =================
def generate_password(length=10):
    chars = string.ascii_letters + string.digits + "@#$%"
    return "".join(secrets.choice(chars) for _ in range(length))


# ================= NESTED SERIALIZERS =================
class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMember
        fields = ["id", "name", "relationship", "phone_number"]


class BankDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankDetail
        fields = ["bank_name", "account_number", "ifsc_code"]


# ================= EMPLOYEE PROFILE =================
class EmployeeProfileSerializer(serializers.ModelSerializer):

    READ_ONLY_AFTER_CREATE = [
        "full_name",
        "gender",
        "date_of_birth",
        "department",
        "role",
        "grade",
        "date_of_joining",
        "blood_group",  
    ]

    # AUTH
    email = serializers.EmailField(write_only=True)
    email_display = serializers.EmailField(
        source="user.email", read_only=True
    )

    # READ
    bank_detail = BankDetailSerializer(read_only=True)
    family_members = FamilyMemberSerializer(many=True, read_only=True)

    # WRITE (FormData JSON)
    bank_detail_input = serializers.CharField(
        write_only=True, required=False
    )
    family_members_input = serializers.CharField(
        write_only=True, required=False
    )

    class Meta:
        model = EmployeeProfile
        fields = [
            "id",
            "email",
            "email_display",
            "employee_code",
            "full_name",
            "gender",
            "date_of_birth",
            "date_of_joining",
            "department",
            "role",
            "grade",
            "company_name",
            "phone_number",
            "blood_group",
            "pancard_number",
            "aadhaar_number",
            "current_address",
            "permanent_address",
            "photo",

            # READ
            "bank_detail",
            "family_members",

            # WRITE
            "bank_detail_input",
            "family_members_input",
        ]

        read_only_fields = ["employee_code"]
        read_only_fields = ["employee_code", "company_name"] 
       
    # ---------- VALIDATION ----------
    def validate_email(self, value):
    # allow same email during update
     if self.instance:
        return value
 
     if User.objects.filter(email=value).exists():
        raise serializers.ValidationError("Email already exists")
     return value


    # ---------- CREATE ----------
    def create(self, validated_data):
        email = validated_data.pop("email")

        bank_raw = validated_data.pop("bank_detail_input", None)
        family_raw = validated_data.pop("family_members_input", None)

        bank_data = json.loads(bank_raw) if bank_raw else None
        family_data = json.loads(family_raw) if family_raw else []

        raw_password = generate_password()

        organization = Organization.objects.filter(is_active=True).first()
        if not organization:
            raise serializers.ValidationError(
                {"organization": "No active organization found"}
            )

        count = EmployeeProfile.objects.filter(
            organization=organization
        ).count()

        employee_code = f"{organization.emp_prefix}{str(count + 1).zfill(3)}"
        validated_data["company_name"] = organization.name

        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                password=raw_password,
                role="EMPLOYEE"
            )

            employee = EmployeeProfile.objects.create(
                user=user,
                organization=organization,
                employee_code=employee_code,
                **validated_data
            )

            if bank_data:
                BankDetail.objects.create(employee=employee, **bank_data)

            for member in family_data:
                if member.get("name"):
                    FamilyMember.objects.create(
                        employee=employee,
                        **member
                    )

        send_mail(
          subject="Your Account Login Credentials – Quandatum Analytics",
          message=(
        f"Hello {employee.full_name},\n\n"
        f"Welcome to Quandatum Analytics.\n\n"
        f"Your employee account has been successfully created. "
        f"Please find your login credentials below:\n\n"
        f"Email: {email}\n"
        f"Temporary Password: {raw_password}\n\n"
        f"For security reasons, we request you to change your password "
        f"immediately after your first login.\n\n"
        f"If you face any issues while accessing your account, "
        f"please feel free to contact the HR or IT support team.\n\n"
        f"We’re glad to have you on board and wish you a great journey "
        f"with Quandatum Analytics.\n\n"
        f"Best regards,\n"
        f"Quandatum Analytics Team"
    ),
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=[email],
    fail_silently=True,
)


        return employee

    # ---------- UPDATE (🔥 THIS FIXES YOUR ISSUE) ----------
    def update(self, instance, validated_data):
        # 🔒 freeze basic details (THIS IS ENOUGH)
        for field in self.READ_ONLY_AFTER_CREATE:
            validated_data.pop(field, None)

        bank_raw = validated_data.pop("bank_detail_input", None)
        family_raw = validated_data.pop("family_members_input", None)

        bank_data = json.loads(bank_raw) if bank_raw else None
        family_data = json.loads(family_raw) if family_raw else None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # update bank
        if bank_data is not None:
            BankDetail.objects.update_or_create(
                employee=instance,
                defaults=bank_data
            )

        # update family
        if family_data is not None:
            instance.family_members.all().delete()
            for member in family_data:
                if member.get("name"):
                    FamilyMember.objects.create(
                        employee=instance,
                        **member
                    )

        return instance
# ================= EMPLOYEE DROPDOWN =================
class EmployeeDropdownSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = EmployeeProfile
        fields = [
            "id",
            "employee_code",
            "full_name",
            "email",
            "department",
        ]
