from rest_framework import serializers
from .models import Holiday, HolidayCalendar

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = "__all__"


class HolidayCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = HolidayCalendar
        fields = ["id", "file", "uploaded_at"]
