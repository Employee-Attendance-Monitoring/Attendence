from rest_framework import serializers
from .models import EmployeeProfile, FamilyMember, BankDetail


from django.db import transaction
from accounts.models import User



class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMember
        fields = ["id", "name", "relationship", "date_of_birth"]


class BankDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankDetail
        fields = ["bank_name", "account_number", "ifsc_code"]


class EmployeeProfileSerializer(serializers.ModelSerializer):
    family_members = FamilyMemberSerializer(many=True, required=False)
    bank_detail = BankDetailSerializer(required=False)

    # NEW fields
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

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
            
            "employee_code",
            "full_name",
            "date_of_joining",
            "department",
            "company_name",
            "photo",
            "family_members",
            "bank_detail",
        ]

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
                FamilyMember.objects.create(employee=employee, **member)

            if bank_data:
                BankDetail.objects.create(employee=employee, **bank_data)

        return employee
