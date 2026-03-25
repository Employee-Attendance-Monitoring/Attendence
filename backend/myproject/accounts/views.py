from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializers import UserSerializer, CreateEmployeeSerializer
from .permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class CreateEmployeeView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = CreateEmployeeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            role="EMPLOYEE",
        )

        return Response(
            {
                "message": "Employee credentials created",
                "employee_id": user.id,
            },
            status=status.HTTP_201_CREATED,
        )


from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from accounts.models import User


class ResetEmployeePasswordView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        password = request.data.get("password")

        if not password:
            return Response(
                {"password": "This field is required"},
                status=400
            )

        user = get_object_or_404(User, id=user_id)
        user.set_password(password)
        user.save()

        return Response(
            {"message": "Password reset successful"},
            status=200
        )



from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from accounts.permissions import IsAdmin
from employees.models import EmployeeProfile
from django.contrib.auth import get_user_model
from attendance.models import Attendance
from leaves.models import Leave

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()

        # ✅ ACTIVE EMPLOYEES (FROM EmployeeProfile)
        active_employees_qs = EmployeeProfile.objects.filter(
            is_active=True,
            user__role="EMPLOYEE"
        )
        active_count = active_employees_qs.count()

        # ✅ RELIEVED EMPLOYEES
        relieved_count = EmployeeProfile.objects.filter(
            is_active=False,
            user__role="EMPLOYEE"
        ).count()

        # ✅ TOTAL EMPLOYEES
        total_count = active_count + relieved_count

        # ✅ ATTENDANCE (ONLY ACTIVE USERS)
        attendance_today = Attendance.objects.filter(
            date=today,
            user__employee_profile__is_active=True,
            user__role="EMPLOYEE"
        )

        present_today = attendance_today.filter(
            status__in=["PRESENT", "HALF_DAY"]
        ).values("user").distinct().count()

        # ✅ LEAVE (ONLY ACTIVE USERS)
        on_leave_today = Leave.objects.filter(
            status="APPROVED",
            start_date__lte=today,
            end_date__gte=today,
            user__employee_profile__is_active=True
        ).values("user").distinct().count()

        # ✅ ABSENT
        absent_today = active_count - present_today - on_leave_today
        absent_today = max(absent_today, 0)

        pending_leave_requests = Leave.objects.filter(
            status="PENDING"
        ).count()

        return Response({
            # ✅ NEW (IMPORTANT)
            "active_employees": active_count,
            "relieved_employees": relieved_count,
            "total_employees": total_count,

            # existing fields (unchanged)
            "present_today": present_today,
            "absent_today": absent_today,
            "on_leave_today": on_leave_today,
            "pending_leave_requests": pending_leave_requests,
        })