from rest_framework import serializers
from django.db import transaction
from django.db.models import Max
from accounts.models import User
from organization.models import Organization
from .models import EmployeeProfile, FamilyMember, BankDetail
import json


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
            "ifsc_code"
        ]


# =========================
# EMPLOYEE PROFILE
# =========================
class EmployeeProfileSerializer(serializers.ModelSerializer):
    # nested
    family_members = FamilyMemberSerializer(many=True, required=False)
    bank_detail = BankDetailSerializer(required=False)

    # auth fields
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=3)

    # display
    email_display = serializers.EmailField(
        source="user.email",
        read_only=True
    )
    employee_code = serializers.CharField(read_only=True)

    # optional fields
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

            "email",
            "password",
            "email_display",

            "employee_code",

            "full_name",
            "gender",
            "date_of_birth",
            "date_of_joining",

            "department",
            "role",
            "grade",
            "address",

            "company_name",
            "phone_number",
            "pancard_number",
            "aadhaar_number",
            "photo",

            "family_members",
            "bank_detail",
        ]

    # ================= CREATE =================
    def create(self, validated_data):
        request = self.context.get("request")

        bank_data = request.data.get("bank_detail")
        family_data = request.data.get("family_members")

        if isinstance(bank_data, str):
            bank_data = json.loads(bank_data)
        if isinstance(family_data, str):
            family_data = json.loads(family_data)

        email = validated_data.pop("email")
        password = validated_data.pop("password")

        # ✅ GET ACTIVE ORGANIZATION
        organization = Organization.objects.filter(is_active=True).first()
        if not organization:
            raise serializers.ValidationError(
                {"organization": "Active organization not found"}
            )

        # ✅ GENERATE UNIQUE EMPLOYEE CODE (SAFE)
        last_employee = (
            EmployeeProfile.objects
            .filter(organization=organization)
            .order_by("-id")
            .first()
        )

        next_number = 1
        if last_employee:
            next_number = last_employee.id + 1

        employee_code = f"{organization.emp_prefix}{str(next_number).zfill(3)}"

       

        # ✅ FORCE COMPANY NAME FROM ORGANIZATION
        validated_data["company_name"] = organization.name

        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                password=password,
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

            if family_data:
                for member in family_data:
                    FamilyMember.objects.create(
                        employee=employee,
                        **member
                    )

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
