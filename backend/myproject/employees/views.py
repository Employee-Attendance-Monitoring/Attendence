from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import EmployeeProfile
from .serializers import EmployeeProfileSerializer
from accounts.permissions import IsAdmin


class EmployeeCreateView(APIView):
    """
    Admin creates employee master profile
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = EmployeeProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save(user_id=request.data.get("user_id"))

        return Response(
            {"message": "Employee profile created"},
            status=status.HTTP_201_CREATED
        )


class EmployeeListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        employees = EmployeeProfile.objects.select_related("user").all()
        serializer = EmployeeProfileSerializer(employees, many=True)
        return Response(serializer.data)


class EmployeeDetailView(APIView):
    """
    Admin: view/update any employee
    Employee: view own profile
    """

    def get(self, request, pk=None):
        if request.user.role == "EMPLOYEE":
            employee = get_object_or_404(
                EmployeeProfile,
                user=request.user
            )
        else:
            employee = get_object_or_404(EmployeeProfile, pk=pk)

        serializer = EmployeeProfileSerializer(employee)
        return Response(serializer.data)

    def put(self, request, pk=None):
        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        employee = get_object_or_404(EmployeeProfile, pk=pk)
        serializer = EmployeeProfileSerializer(employee, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Employee updated"})
