from rest_framework import serializers
from .models import Holiday


class HolidaySerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%Y-%m-%d")

    class Meta:
        model = Holiday
        fields = [
            "id",
            "name",
            "date",
            "description",
        ]

    def validate_date(self, value):
        if Holiday.objects.filter(date=value).exists():
            raise serializers.ValidationError("Holiday already exists for this date")
        return value
