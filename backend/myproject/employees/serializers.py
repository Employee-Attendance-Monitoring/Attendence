from rest_framework import serializers
from .models import EmployeeProfile, FamilyMember, BankDetail


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
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = EmployeeProfile
        fields = [
            "id",
            "email",
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

        user = self.context["user"]

        employee = EmployeeProfile.objects.create(
            user=user,
            **validated_data
        )

        for member in family_data:
            FamilyMember.objects.create(employee=employee, **member)

        if bank_data:
            BankDetail.objects.create(employee=employee, **bank_data)

        return employee

    def update(self, instance, validated_data):
        family_data = validated_data.pop("family_members", None)
        bank_data = validated_data.pop("bank_detail", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if family_data is not None:
            instance.family_members.all().delete()
            for member in family_data:
                FamilyMember.objects.create(employee=instance, **member)

        if bank_data is not None:
            BankDetail.objects.update_or_create(
                employee=instance,
                defaults=bank_data
            )

        return instance
