from rest_framework import serializers
from django.utils.timezone import now
from .models import Leave, LeaveBalance
from datetime import timedelta


class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source="user.employee_profile.full_name",
        read_only=True
    )
    employee_email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

     # ✅ ADD THIS
    leave_type_name = serializers.CharField(
        source="leave_type.name",
        read_only=True
    )

    # end_date is auto-calculated → read only
    end_date = serializers.DateField(
        format="%Y-%m-%d",
        read_only=True
    )

    class Meta:
        model = Leave
        fields = [
            "id",
            "employee_name",
            "employee_email",
            "start_date",
            "leave_days",
            "leave_type",        # ID (used for submit)
            "leave_type_name",   # LABEL (used for UI)
            "is_half_day",
            "is_comp_off",
            "end_date",
            "reason",
            "status",
            "applied_at",
            "actioned_at",
        ]
        read_only_fields = [
            "status",
            "applied_at",
            "actioned_at",
            "end_date",
        ]

    def validate(self, data):
        user = self.context["request"].user

        start_date = data["start_date"]
        leave_days = float(data["leave_days"])

        if leave_days <= 0:
            raise serializers.ValidationError("Leave days must be greater than 0")

        # 🔥 calculate end_date same as model
        days = int(leave_days) - 1
        calculated_end = start_date + timedelta(days=max(days, 0))

        # 🔥 overlap check
        overlap = Leave.objects.filter(
            user=user,
            start_date__lte=calculated_end,
            end_date__gte=start_date,
            status__in=["PENDING", "APPROVED"],
        ).exists()

        if overlap:
            raise serializers.ValidationError("Overlapping leave already exists")

        return data


class LeaveApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = ["status","rejection_reason"]

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
