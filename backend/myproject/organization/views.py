# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Organization, Department, Role
from .serializers import (
    OrganizationSerializer,
    DepartmentSerializer,
    RoleSerializer,
)
from accounts.permissions import IsAdmin
from django.db.models import Count
from datetime import date
from employees.models import EmployeeProfile


class OrganizationDetailView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        org = Organization.objects.filter(is_active=True).first()
        if not org:
            return Response(
                {"detail": "Organization not created"},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(OrganizationSerializer(org).data)

    def post(self, request):
        serializer = OrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        org = get_object_or_404(Organization, is_active=True)
        serializer = OrganizationSerializer(
            org, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


#----------------------------------- Department-----------------------------------------------
class DepartmentListCreateView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        departments = Department.objects.filter(is_active=True)
        return Response(
            DepartmentSerializer(departments, many=True).data
        )

    def post(self, request):
        org = Organization.objects.filter(is_active=True).first()
        serializer = DepartmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(organization=org)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DepartmentUpdateDeleteView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        department = get_object_or_404(
            Department, pk=pk, is_active=True
        )
        serializer = DepartmentSerializer(
            department, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        department = get_object_or_404(
            Department, pk=pk, is_active=True
        )
        department.is_active = False
        department.save()
        return Response(
            {"detail": "Department deleted"},
            status=status.HTTP_204_NO_CONTENT
        )
# ------------------------------Role--------------------------------------------------------------
class RoleListCreateView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        roles = Role.objects.filter(is_active=True)
        return Response(
            RoleSerializer(roles, many=True).data
        )

    def post(self, request):
        org = Organization.objects.filter(is_active=True).first()
        serializer = RoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(organization=org)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoleUpdateDeleteView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        role = get_object_or_404(
            Role, pk=pk, is_active=True
        )
        serializer = RoleSerializer(
            role, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        role = get_object_or_404(
            Role, pk=pk, is_active=True
        )
        role.is_active = False
        role.save()
        return Response(
            {"detail": "Role deleted"},
            status=status.HTTP_204_NO_CONTENT
        )
# ------------------------------ Organization Report --------------------------------------------

class OrganizationReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        organization = Organization.objects.filter(is_active=True).first()

        if not organization:
            return Response(
                {"detail": "Organization not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        employees = EmployeeProfile.objects.filter(
            organization=organization
        )

        # ---------------- BASIC COUNTS ----------------
        total_employees = employees.count()

        male_count = employees.filter(gender="MALE").count()
        female_count = employees.filter(gender="FEMALE").count()
        other_count = employees.filter(gender="OTHER").count()

        # ---------------- AVERAGE AGE ----------------
        def calculate_age(dob):
            today = date.today()
            return today.year - dob.year - (
                (today.month, today.day) < (dob.month, dob.day)
            )

        ages = [
            calculate_age(emp.date_of_birth)
            for emp in employees
            if emp.date_of_birth
        ]

        average_age = round(sum(ages) / len(ages), 1) if ages else 0

        # ---------------- AGE DISTRIBUTION ----------------
        age_distribution = {
            "18-25": 0,
            "26-35": 0,
            "36-45": 0,
            "46-60": 0,
            "60+": 0,
        }

        for age in ages:
            if 18 <= age <= 25:
                age_distribution["18-25"] += 1
            elif 26 <= age <= 35:
                age_distribution["26-35"] += 1
            elif 36 <= age <= 45:
                age_distribution["36-45"] += 1
            elif 46 <= age <= 60:
                age_distribution["46-60"] += 1
            elif age > 60:
                age_distribution["60+"] += 1

        # ---------------- DEPARTMENT WISE ----------------
        department_chart = (
            employees.values("department")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        # ---------------- ROLE WISE ----------------
        role_chart = (
            employees.values("role")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response({
            "organization": {
                "id": organization.id,
                "name": organization.name,
            },

            "summary": {
                "total_employees": total_employees,
                "male_employees": male_count,
                "female_employees": female_count,
                "other_employees": other_count,
                "average_age": average_age,
            },

            "gender_chart": {
                "labels": ["Male", "Female", "Other"],
                "data": [male_count, female_count, other_count],
            },

            "age_chart": {
                "labels": list(age_distribution.keys()),
                "data": list(age_distribution.values()),
            },

            "department_chart": list(department_chart),
            "role_chart": list(role_chart),
        })
