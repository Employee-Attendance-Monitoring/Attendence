from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%Y-%m-%d")
    sign_in = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False)
    sign_out = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", required=False)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "date",
            "sign_in",
            "sign_out",
            "working_hours",
            "status",
        ]
