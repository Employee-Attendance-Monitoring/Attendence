from django.contrib import admin
from .models import EmployeeProfile, FamilyMember, BankDetail

class FamilyInline(admin.TabularInline):
    model = FamilyMember
    extra = 1


class BankInline(admin.StackedInline):
    model = BankDetail
    extra = 0


@admin.register(EmployeeProfile)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("employee_code", "full_name", "department", "company_name")
    search_fields = ("employee_code", "full_name")
    inlines = [FamilyInline, BankInline]
