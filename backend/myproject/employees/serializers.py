from rest_framework import serializers
from django.db import transaction
from accounts.models import User
from .models import EmployeeProfile, FamilyMember, BankDetail


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
        ]


# =========================
# BANK DETAILS
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
    # Nested data
    family_members = FamilyMemberSerializer(many=True, required=False)
    bank_detail = BankDetailSerializer(required=False)

    # INPUT (admin create / update)
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)

    # OUTPUT (display)
    email_display = serializers.EmailField(
        source="user.email", read_only=True
    )
    user_id = serializers.IntegerField(
        source="user.id", read_only=True
    )

    class Meta:
        model = EmployeeProfile
        fields = [
            "id",
            "user_id",

            # auth
            "email",          # write-only
            "password",       # write-only
            "email_display",  # read-only

            # employee info
            "employee_code",
            "full_name",
            "date_of_joining",
            "department",
            "company_name",
            "photo",

            # relations
            "family_members",
            "bank_detail",
        ]

    # =========================
    # CREATE EMPLOYEE + USER
    # =========================
    def create(self, validated_data):
        family_data = validated_data.pop("family_members", [])
        bank_data = validated_data.pop("bank_detail", None)

        email = validated_data.pop("email")
        password = validated_data.pop("password")

        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                password=password,
                role="EMPLOYEE"
            )

            employee = EmployeeProfile.objects.create(
                user=user,
                **validated_data
            )

            for member in family_data:
                FamilyMember.objects.create(
                    employee=employee, **member
                )

            if bank_data:
                BankDetail.objects.create(
                    employee=employee, **bank_data
                )

        return employee

    # =========================
    # UPDATE EMPLOYEE + USER
    # =========================
    def update(self, instance, validated_data):
        user = instance.user

        email = validated_data.pop("email", None)
        password = validated_data.pop("password", None)

        # Update user fields
        if email:
            user.email = email

        if password:
            user.set_password(password)

        user.save()

        # Update employee profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
