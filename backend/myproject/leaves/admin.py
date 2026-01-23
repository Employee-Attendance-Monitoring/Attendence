from django.contrib import admin
from .models import Leave, LeaveBalance


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "leave_type",
        "start_date",
        "end_date",
        "status",
        "applied_at",
    )
    list_filter = ("leave_type", "status")
    search_fields = ("user__email",)


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "total_leaves",
        "updated_at",
    )
    search_fields = ("user__email",)
