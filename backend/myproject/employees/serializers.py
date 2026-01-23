from rest_framework import serializers
from django.db import transaction
from accounts.models import User
from .models import EmployeeProfile, FamilyMember, BankDetail
import json


# =========================
# FAMILY MEMBER
# =========================
class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMember
        fields = ["id", "name", "relationship", "date_of_birth","phone_number",]


# =========================
# BANK DETAIL
# =========================
class BankDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankDetail
        fields = ["bank_name", "account_number", "ifsc_code"]


# =========================
# EMPLOYEE PROFILE
# =========================
class EmployeeProfileSerializer(serializers.ModelSerializer):
    family_members = FamilyMemberSerializer(many=True, required=False)
    bank_detail = BankDetailSerializer(required=False)
    pancard_number = serializers.CharField(required=False, allow_blank=True)   # ✅
    aadhaar_number = serializers.CharField(required=False, allow_blank=True)

    photo = serializers.ImageField(required=False, allow_null=True)
    phone_number = serializers.CharField(   # ✅ NEW
        required=False,
        allow_blank=True
    )


    # Auth
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=3)

    # Display
    email_display = serializers.EmailField(source="user.email", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = EmployeeProfile
        fields = [
            "id",
            "user_id",
             
            "email",
            "password",
            "email_display",
            "pancard_number",     # ✅ ADD
            "aadhaar_number",

            "employee_code",
            "full_name",
            "date_of_joining",
            "department",
            "company_name",
            "photo",
            "phone_number",
            "family_members",
            "bank_detail",
        ]

    # =========================
    # CREATE
    # =========================
    def create(self, validated_data):
        request = self.context.get("request")

        # Parse multipart JSON
        bank_data = request.data.get("bank_detail")
        family_data = request.data.get("family_members")

        if isinstance(bank_data, str):
            bank_data = json.loads(bank_data)

        if isinstance(family_data, str):
            family_data = json.loads(family_data)

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

            if bank_data:
                BankDetail.objects.create(
                    employee=employee, **bank_data
                )

            if family_data:
                for member in family_data:
                    FamilyMember.objects.create(
                        employee=employee, **member
                    )

        return employee

    # =========================
    # UPDATE
    # =========================
    def update(self, instance, validated_data):
     request = self.context.get("request")

    # -------------------------
    # USER UPDATE
    # -------------------------
     user = instance.user
     email = validated_data.pop("email", None)
     password = validated_data.pop("password", None)

     if email:
        user.email = email
     if password:
        user.set_password(password)
     user.save()

    # -------------------------
    # EMPLOYEE PROFILE UPDATE
    # -------------------------
     for attr, value in validated_data.items():
        setattr(instance, attr, value)
        instance.save()

    # -------------------------
    # NESTED DATA (IMPORTANT)
    # -------------------------
     bank_data = request.data.get("bank_detail")
     family_data = request.data.get("family_members")

    # Parse JSON if multipart

     if isinstance(bank_data, str):
        bank_data = json.loads(bank_data)
     if isinstance(family_data, str):
        family_data = json.loads(family_data)

    # -------- BANK DETAIL --------
     if bank_data:
        BankDetail.objects.update_or_create(
            employee=instance,
            defaults=bank_data
        )

    # -------- FAMILY MEMBERS --------
     if family_data is not None:
        # Remove old members
        instance.family_members.all().delete()

        # Re-create members
        for member in family_data:
            FamilyMember.objects.create(
                employee=instance,
                **member
            )

     return instance
    
class EmployeeDropdownSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = EmployeeProfile
        fields = [
            "email",
            "department",   # ✅ THIS IS THE KEY
        ]

