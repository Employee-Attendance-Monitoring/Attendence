from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import EmployeeProfile
from .serializers import (
    EmployeeProfileSerializer,
    EmployeeDropdownSerializer
)
from accounts.permissions import IsAdmin

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
User = get_user_model()

# =========================
# EMPLOYEE CREATE
# =========================
class EmployeeCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = EmployeeProfileSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Employee created successfully",
                "employee": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


# =========================
# EMPLOYEE LIST (ADMIN)
# =========================
class EmployeeListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        employees = EmployeeProfile.objects.select_related("user").all()
        serializer = EmployeeProfileSerializer(employees, many=True)
        return Response(serializer.data)


# =========================
# EMPLOYEE DETAIL
# =========================
class EmployeeDetailView(APIView):
    """
    ADMIN  -> View / Update any employee
    EMPLOYEE -> View own profile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if request.user.role == "EMPLOYEE":
            employee = get_object_or_404(
                EmployeeProfile.objects
                .select_related("bank_detail", "user")
                .prefetch_related("family_members"),
                user=request.user,
            )
        else:
            employee = get_object_or_404(
                EmployeeProfile.objects
                .select_related("bank_detail", "user")
                .prefetch_related("family_members"),
                pk=pk,
            )

        serializer = EmployeeProfileSerializer(employee)
        return Response(serializer.data)

    def put(self, request, pk=None):
        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Only admin can update employee"},
                status=status.HTTP_403_FORBIDDEN,
            )

        employee = get_object_or_404(EmployeeProfile, pk=pk)

        serializer = EmployeeProfileSerializer(
            employee,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Employee updated"})


# =========================
# EMPLOYEE DELETE
# =========================
class EmployeeDeleteView(APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        employee = get_object_or_404(EmployeeProfile, pk=pk)
        employee.user.delete()  # cascades employee profile
        return Response(
            {"message": "Employee deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


# =========================
# ADMIN DASHBOARD
# =========================
class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        total_employees = EmployeeProfile.objects.count()
        active_employees = User.objects.filter(
            role="EMPLOYEE",
            is_active=True,
        ).count()

        return Response({
            "total_employees": total_employees,
            "active_employees": active_employees,
            "present_today": 0,
            "on_leave": 0,
        })


# =========================
# EMPLOYEE DROPDOWN
# =========================
class EmployeeDropdownView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        employees = EmployeeProfile.objects.select_related("user")
        serializer = EmployeeDropdownSerializer(employees, many=True)
        return Response(serializer.data)
    


# --------------------------Password------------------------------------------
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response(
                {"detail": "Old password and new password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(old_password):
            return Response(
                {"detail": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {"detail": e.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        # 🔐 Invalidate old tokens
        RefreshToken.for_user(user)

        return Response({"message": "Password changed successfully"})
    # =========================
# BLOOD GROUP LIST
# =========================
class BloodGroupListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        blood_groups = [
            {"value": bg[0], "label": bg[1]}
            for bg in EmployeeProfile.BLOOD_GROUP_CHOICES
        ]
        return Response(blood_groups)
