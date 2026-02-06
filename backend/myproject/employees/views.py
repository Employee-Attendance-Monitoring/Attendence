from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()
from .models import EmployeeProfile
from .serializers import (
    EmployeeProfileSerializer,
    EmployeeDropdownSerializer,
)

from accounts.permissions import IsAdmin


class EmployeeCreateView(APIView):
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = EmployeeProfileSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Employee created successfully"},
            status=status.HTTP_201_CREATED
        )


class EmployeeListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        employees = EmployeeProfile.objects.all()
        serializer = EmployeeProfileSerializer(employees, many=True)
        return Response(serializer.data)


class EmployeeDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk=None):
        if request.user.role == "EMPLOYEE":
            employee = get_object_or_404(
                EmployeeProfile, user=request.user
            )
        else:
            employee = get_object_or_404(
                EmployeeProfile, pk=pk
            )

        serializer = EmployeeProfileSerializer(employee)
        return Response(serializer.data)

    def put(self, request, pk):
        employee = get_object_or_404(EmployeeProfile, pk=pk)
        serializer = EmployeeProfileSerializer(
            employee,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Employee updated"})


class EmployeeDeleteView(APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        employee = get_object_or_404(EmployeeProfile, pk=pk)
        employee.user.delete()
        return Response(
            {"message": "Employee deleted"},
            status=status.HTTP_204_NO_CONTENT
        )


class EmployeeDropdownView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employees = EmployeeProfile.objects.filter(is_active=True)
        serializer = EmployeeDropdownSerializer(employees, many=True)
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response(
                {"detail": "Old password incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed"})


class BloodGroupListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([
            {"value": bg[0], "label": bg[1]}
            for bg in EmployeeProfile.BLOOD_GROUP_CHOICES
        ])


def relieve_employee(request, id):
    employee = get_object_or_404(EmployeeProfile, id=id)
    employee.is_active = False
    employee.save()

    user = employee.user
    user.is_active = False
    user.save()

    return Response({"message": "Employee relieved"})
class EmployeeDashboardHighlightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        current_month = today.month
        current_year = today.year

        employees = EmployeeProfile.objects.select_related("user").filter(
            user__role="EMPLOYEE",
            is_active=True
        )

        birthdays = []
        anniversaries = []
        new_joiners = []

        for emp in employees:
            full_name = emp.full_name or emp.user.email


            # 🎂 Birthday
            if emp.date_of_birth and emp.date_of_birth.month == current_month:
                birthdays.append({
                    "id": emp.id,
                    "full_name": full_name,
                    "date": emp.date_of_birth,
                })

            # 🏆 Anniversary
            if (
                emp.date_of_joining
                and emp.date_of_joining.month == current_month
                and emp.date_of_joining.year < current_year
            ):
                years = current_year - emp.date_of_joining.year
                anniversaries.append({
                    "id": emp.id,
                    "full_name": full_name,
                    "date": emp.date_of_joining,
                    "years": years,
                })

            # 🎉 New joiner
            if (
                emp.date_of_joining
                and emp.date_of_joining.month == current_month
                and emp.date_of_joining.year == current_year
            ):
                new_joiners.append({
                    "id": emp.id,
                    "full_name": full_name,
                    "date": emp.date_of_joining,
                })

        return Response({
            "birthdays": birthdays,
            "anniversaries": anniversaries,
            "new_joiners": new_joiners,
        })