from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_id = serializers.IntegerField(source="user.id", read_only=True)
    employee_email = serializers.EmailField(source="user.email", read_only=True)
    department = serializers.CharField(
        source="user.employee_profile.department",
        read_only=True
    )
    date = serializers.DateField(format="%Y-%m-%d")
    sign_in = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S", required=False
    )
    sign_out = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S", required=False
    )

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee_id",
            "employee_email",
            "department",
            "date",
            "sign_in",
            "sign_out",
            "working_hours",
            "status",
        ]
