from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "date",
        "sign_in",
        "sign_out",
        "working_hours",
        "status",
    )
    list_filter = ("status", "date")
    search_fields = ("user__email",)
