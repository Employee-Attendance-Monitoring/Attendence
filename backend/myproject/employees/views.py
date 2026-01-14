from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import EmployeeProfile
from .serializers import EmployeeProfileSerializer
from accounts.models import User
from accounts.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated


class EmployeeCreateView(APIView):
    """
    ADMIN: Create employee profile after account creation
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        user_id = request.data.get("user_id")

        if not user_id:
            return Response(
                {"user_id": "This field is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, id=user_id)

        serializer = EmployeeProfileSerializer(
            data=request.data,
            context={"user": user}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Employee profile created"},
            status=status.HTTP_201_CREATED
        )


class EmployeeListView(APIView):
    """
    ADMIN: List all employees
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        employees = EmployeeProfile.objects.select_related("user").all()
        serializer = EmployeeProfileSerializer(employees, many=True)
        return Response(serializer.data)


class EmployeeDetailView(APIView):
    """
    ADMIN: View/update any employee
    EMPLOYEE: View own profile
    """
    permission_classes = [IsAuthenticated]

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
                {"detail": "Only admin can update employee"},
                status=status.HTTP_403_FORBIDDEN
            )

        employee = get_object_or_404(EmployeeProfile, pk=pk)

        serializer = EmployeeProfileSerializer(
            employee,
            data=request.data,
            context={"user": employee.user}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Employee updated"})
