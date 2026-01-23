from rest_framework import serializers
from .models import Leave,LeaveBalance
from django.utils.timezone import now


from rest_framework import serializers
from .models import Leave


class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source="user.employee_profile.full_name",
        read_only=True
    )
    employee_email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    start_date = serializers.DateField(format="%Y-%m-%d")
    end_date = serializers.DateField(format="%Y-%m-%d")

    class Meta:
        model = Leave
        fields = [
            "id",
            "employee_name",
            "employee_email",
            "leave_type",
            "start_date",
            "end_date",
            "reason",
            "status",
            "applied_at",
            "actioned_at",
        ]

    def validate(self, data):
        if data["end_date"] < data["start_date"]:
            raise serializers.ValidationError("End date cannot be before start date")

        user = self.context["request"].user

        overlap = Leave.objects.filter(
            user=user,
            start_date__lte=data["end_date"],
            end_date__gte=data["start_date"],
            status__in=["PENDING", "APPROVED"],
        ).exists()

        if overlap:
            raise serializers.ValidationError("Overlapping leave already exists")

        return data


class LeaveApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = ["status"]

    def validate_status(self, value):
        if value not in ["APPROVED", "REJECTED"]:
            raise serializers.ValidationError("Invalid status")
        return value

    def update(self, instance, validated_data):
        instance.status = validated_data["status"]
        instance.actioned_at = now()
        instance.save()
        return instance

class LeaveBalanceSerializer(serializers.ModelSerializer):
    employee_email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = LeaveBalance
        fields = [
            "employee_email",
            "total_leaves",
            "updated_at",
        ]
