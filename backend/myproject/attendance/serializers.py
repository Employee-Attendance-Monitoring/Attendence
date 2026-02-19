from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_id = serializers.IntegerField(source="user.id", read_only=True)
    employee_email = serializers.EmailField(source="user.email", read_only=True)
    department = serializers.CharField(
        source="user.employee_profile.department",
        read_only=True
    )
    is_auto_signout = serializers.BooleanField(read_only=True)
    employee_name = serializers.CharField(
        source="user.employee_profile.full_name",
        read_only=True
    )
    date = serializers.DateField(format="%Y-%m-%d")

    sign_in = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S", required=False
    )
    sign_out = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S", required=False
    )

    auto_signout_reason = serializers.CharField(read_only=True) 
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )
    auto_signout_flag = serializers.SerializerMethodField()
    working_hours = serializers.SerializerMethodField()
    
    def get_auto_signout_flag(self, obj):
        return obj.is_auto_signout
    def get_working_hours(self, obj):
        if not obj.working_hours:
            return "0h 0m"

        total_seconds = int(obj.working_hours * 3600)

        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60

        return f"{hours}h {minutes}m"

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
            "status_display",
            "employee_name", 
            "is_auto_signout",  
            "auto_signout_reason",  
            "auto_signout_flag",
        ]
