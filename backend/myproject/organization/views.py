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
