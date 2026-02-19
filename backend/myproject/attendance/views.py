from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum
from django.contrib.auth import get_user_model
from django.conf import settings

from .models import Attendance
from .serializers import AttendanceSerializer
from accounts.permissions import IsAdmin
from calendar import monthrange
from leaves.models import Leave
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

        total_seconds = int(delta.total_seconds())

        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        decimal_hours = round(total_seconds / 3600, 2)
        attendance.working_hours =  decimal_hours

        if decimal_hours >= 8:
            attendance.status = "PRESENT"
        elif decimal_hours >= 4:
            attendance.status = "HALF_DAY"
        else:
            attendance.status = "ABSENT"

        attendance.save()

        return Response({
            "message": "Sign-out successful",
            "working_hours": f"{hours}h {minutes}m",
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

        total_decimal = qs.aggregate(
            total=Sum("working_hours")
        )["total"] or 0

        # Convert decimal hours to hours + minutes
        total_seconds = int(total_decimal * 3600)

        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60

        return Response({
            "present_days": qs.filter(status="PRESENT").count(),
            "absent_days": qs.filter(status="ABSENT").count(),
            "half_days": qs.filter(status="HALF_DAY").count(),
            "total_working_hours": f"{hours}h {minutes}m",
        })



# ================= ADMIN =================

class AttendanceReportAdminView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        employee_email = request.query_params.get("employee")
        date = request.query_params.get("date")

        qs = Attendance.objects.select_related("user").all()

        if employee_email and employee_email != "all":
            qs = qs.filter(user__email=employee_email)

        if date:
            qs = qs.filter(date=date)

        serializer = AttendanceSerializer(qs, many=True)
        return Response(serializer.data)


class MyAttendanceDashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        month format: YYYY-MM
        example: 2025-10
        """
        month = request.query_params.get("month")

        qs = Attendance.objects.filter(user=request.user)
        leave_qs = Leave.objects.filter(
            user=request.user,
            status="APPROVED"
        )

        if month:
            year, m = map(int, month.split("-"))

            qs = qs.filter(date__year=year, date__month=m)
            leave_qs = leave_qs.filter(
                start_date__year=year
            )

            total_days = monthrange(year, m)[1]
        else:
            total_days = qs.count()

        present = qs.filter(status="PRESENT").count()
        absent = qs.filter(status="ABSENT").count()
        half_day = qs.filter(status="HALF_DAY").count()

        paid_leave = leave_qs.count()

        # Week off = Saturdays + Sundays (simple HRMS logic)
        week_off = 0
        if month:
            for day in range(1, total_days + 1):
                d = timezone.datetime(year, m, day).date()
                if d.weekday() in (5, 6):  # Sat, Sun
                    week_off += 1

        # Late mark (basic logic: sign_in after 10:15 AM)
        late_mark = qs.filter(
            sign_in__time__gt=timezone.datetime.strptime(
                "10:15", "%H:%M"
            ).time()
        ).count()

        # OD Day (future-proof, currently 0)
        od_day = 0

        paid_day = present + paid_leave

        return Response({
            "present": present,
            "absent": absent,
            "half_day": half_day,
            "paid_leave": paid_leave,
            "week_off": week_off,
            "late_mark": late_mark,
            "od_day": od_day,
            "paid_day": paid_day,
        })
