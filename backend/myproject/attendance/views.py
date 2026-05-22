from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum
from django.contrib.auth import get_user_model
from calendar import month, monthrange
from datetime import time

from .models import Attendance
from .serializers import AttendanceSerializer
from accounts.permissions import IsAdmin
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

        if not attendance.sign_in:
            return Response(
                {"detail": "You must sign in first"},
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

        attendance.working_hours = decimal_hours

        # WEEKEND LOGIC
        if today.weekday() in (5, 6):
            attendance.status = "PRESENT"
        else:
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


# ================= EMPLOYEE HISTORY =================

class MyAttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")

        if month:
            year, m = map(int, month.split("-"))
        else:
            today = timezone.now().date()
            year, m = today.year, today.month
        start_date = timezone.datetime(year, m, 1).date()
        end_date = timezone.datetime(year, m, monthrange(year, m)[1]).date()
        today = timezone.now().date()
        if end_date > today:
            end_date = today
        records = []
        current = start_date
        while current <= end_date:
            attendance = Attendance.objects.filter(
                user=request.user,
                date=current
            ).first()

            if attendance:
                records.append(AttendanceSerializer(attendance).data)
            else:
             
                if current.weekday() in (5, 6):
                    status_value = "WEEK_OFF"
                else:
                    status_value = "ABSENT"

                records.append({
                    "id": None,
                    "date": current.strftime("%Y-%m-%d"),
                    "sign_in": None,
                    "sign_out": None,
                    "working_hours": 0,
                    "status": status_value,
                    "status_display": status_value.replace("_", " ").title(),
                    "is_auto_signout": False,
                    "auto_signout_reason": "",
                    "auto_signout_flag": False,
                })

            current += timezone.timedelta(days=1)

        return Response(records)

# ================= SUMMARY =================

class MyAttendanceDashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")
        today = timezone.now().date()
        if month:
            year, m = map(int, month.split("-"))
        else:
            year, m = today.year, today.month

        total_days = monthrange(year, m)[1]

        present = 0
        absent = 0
        half_day = 0
        week_off = 0
        paid_leave = 0
        working_days = 0
        late_entries = 0

        for day in range(1, total_days + 1):
            date = timezone.datetime(year, m, day).date()
            if date > today:
                continue
            if date.weekday() in (5, 6):
                attendance = Attendance.objects.filter(
                    user=request.user,
                    date=date
                ).first()

                if attendance and attendance.sign_in:
                    present += 1
                else:
                    week_off += 1
                continue
            working_days += 1
            leave = Leave.objects.filter(
                user=request.user,
                status="APPROVED",
                start_date__lte=date,
                end_date__gte=date
            ).exists()

            if leave:
                paid_leave += 1
                continue

            attendance = Attendance.objects.filter(
                user=request.user,
                date=date
            ).first()

            if attendance:
                if attendance.status == "PRESENT":
                    present += 1
                elif attendance.status == "HALF_DAY":
                    half_day += 1
                elif attendance.status == "ABSENT":
                    absent += 1

                # LATE ENTRY CHECK
                if attendance.sign_in and attendance.sign_in.time() > time(9, 45):
                    late_entries += 1
                    late_mark = late_entries
            else:
                absent += 1
        late_mark = late_entries

    

        # ✅ PAID DAY
        paid_day = present + paid_leave + (half_day * 0.5)
        return Response({
            "present": present,
            "absent": absent,
            "half_day": half_day,
            "paid_leave": paid_leave,
            "week_off": week_off,
            "working_days": working_days,
            "late_mark": late_mark,
            "paid_day": paid_day,
            "chart_data": [
                {"name": "Present", "value": present},
                {"name": "Absent", "value": absent},
                {"name": "Week Off", "value": week_off},
                {"name": "Paid Leave", "value": paid_leave},
                {"name": "Half Day", "value": half_day},
                {"name": "Late Mark", "value": late_mark},
            ]
        })


# ================= ADMIN =================

class AttendanceReportAdminView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        employee_email = request.query_params.get("employee")
        date_param = request.query_params.get("date")
        month_param = request.query_params.get("month")

        employees = User.objects.filter(
            role="EMPLOYEE",
            employee_profile__is_active=True
        ).select_related("employee_profile")

        if employee_email and employee_email != 'all':
             employees = employees.filter(email=employee_email)

        result = []

        if month_param:
            year, m = map(int, month_param.split("-"))
            start_date = timezone.datetime(year, m, 1).date()
            end_date = timezone.datetime(year, m, monthrange(year, m)[1]).date()

            for user in employees:
                current = start_date
                while current <= end_date:
                    attendance = Attendance.objects.filter(
                        user=user,
                        date=current
                    ).first()

                    if not attendance:
                        if current.weekday() in (5, 6):
                            status_value = "WEEK_OFF"
                        else:
                            status_value = "ABSENT"

                        result.append({
                            "id": None,
                            "employee_id": user.id,
                            "employee_email": user.email,
                            "employee_name": user.employee_profile.full_name,
                            "department": user.employee_profile.department,
                            "date": current,
                            "sign_in": None,
                            "sign_out": None,
                            "working_hours": 0,
                            "status": status_value,
                            "status_display": status_value.replace("_", " ").title(),
                            "is_auto_signout": False,
                            "auto_signout_reason": "",
                            "auto_signout_flag": False,
                        })
                    else:
                        result.append(AttendanceSerializer(attendance).data)
                    current += timezone.timedelta(days=1)
        else:
            if not date_param:
                date_val = timezone.now().date()
            else:
                date_val = timezone.datetime.strptime(date_param, "%Y-%m-%d").date()

            for user in employees:
                attendance = Attendance.objects.filter(
                    user=user,
                    date=date_val
                ).first()

                if not attendance:
                    if date_val.weekday() in (5, 6):
                        status_value = "WEEK_OFF"
                    else:
                        status_value = "ABSENT"

                    result.append({
                        "id": None,
                        "employee_id": user.id,
                        "employee_email": user.email,
                        "employee_name": user.employee_profile.full_name,
                        "department": user.employee_profile.department,
                        "date": date_val,
                        "sign_in": None,
                        "sign_out": None,
                        "working_hours": 0,
                        "status": status_value,
                        "status_display": status_value.replace("_", " ").title(),
                        "is_auto_signout": False,
                        "auto_signout_reason": "",
                        "auto_signout_flag": False,
                    })
                else:
                    result.append(AttendanceSerializer(attendance).data)

        return Response(result)
class AttendanceSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Attendance.objects.filter(user=request.user)

        total_decimal = qs.aggregate(
            total=Sum("working_hours")
        )["total"] or 0

        total_seconds = int(total_decimal * 3600)
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60

        absent = qs.exclude(date__week_day__in=[1, 7])\
                   .filter(status="ABSENT").count()

        return Response({
            "present_days": qs.filter(status="PRESENT").count(),
            "absent_days": absent,
            "half_days": qs.filter(status="HALF_DAY").count(),
            "total_working_hours": f"{hours}h {minutes}m",
        })