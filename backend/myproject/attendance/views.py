from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum
from django.contrib.auth import get_user_model

from .models import Attendance
from .serializers import AttendanceSerializer

User = get_user_model()


# ================= EMPLOYEE =================

class SignInView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        today = timezone.now().date()

        attendance, _ = Attendance.objects.get_or_create(
            user=request.user,
            date=today
        )

        if attendance.sign_in:
            return Response(
                {"detail": "Already signed in today"},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance.sign_in = timezone.now()
        attendance.status = "PRESENT"
        attendance.save()

        return Response({"message": "Sign-in successful"})


class SignOutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        today = timezone.now().date()

        try:
            attendance = Attendance.objects.get(
                user=request.user,
                date=today
            )
        except Attendance.DoesNotExist:
            return Response(
                {"detail": "Sign-in required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if attendance.sign_out:
            return Response(
                {"detail": "Already signed out"},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance.sign_out = timezone.now()

        delta = attendance.sign_out - attendance.sign_in
        hours = round(delta.total_seconds() / 3600, 2)
        attendance.working_hours = hours

        if hours >= 8:
            attendance.status = "PRESENT"
        elif hours >= 4:
            attendance.status = "HALF_DAY"
        else:
            attendance.status = "ABSENT"

        attendance.save()

        return Response({
            "message": "Sign-out successful",
            "working_hours": hours,
            "status": attendance.status
        })


class MyAttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        records = Attendance.objects.filter(
            user=request.user
        ).order_by("-date")

        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)


class AttendanceSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Attendance.objects.filter(user=request.user)

        return Response({
            "present_days": qs.filter(status="PRESENT").count(),
            "absent_days": qs.filter(status="ABSENT").count(),
            "half_days": qs.filter(status="HALF_DAY").count(),
            "total_working_hours": qs.aggregate(
                total=Sum("working_hours")
            )["total"] or 0,
        })


# ================= ADMIN =================

class AttendanceReportAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date = request.query_params.get("date")
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        # ✅ THIS IS THE KEY FIX
        # Get all employees (exclude admin/superuser)
        employees = User.objects.exclude(is_superuser=True)

        response = []

        for emp in employees:
            attendance_qs = Attendance.objects.filter(user=emp)

            if date:
                attendance_qs = attendance_qs.filter(date=date)

            if month:
                attendance_qs = attendance_qs.filter(date__month=int(month))

            if year:
                attendance_qs = attendance_qs.filter(date__year=int(year))

            response.append({
                "employee_id": emp.id,
                "employee_name": emp.get_full_name() or emp.email,
                "attendance": AttendanceSerializer(attendance_qs, many=True).data
            })

        return Response(response)
