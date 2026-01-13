from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Sum

from .models import Attendance
from .serializers import AttendanceSerializer
from accounts.permissions import IsAdmin


class SignInView(APIView):
    """
    Employee sign-in (only once per day)
    """

    def post(self, request):
        today = timezone.localdate()

        attendance, created = Attendance.objects.get_or_create(
            user=request.user,
            date=today
        )

        if attendance.sign_in:
            return Response(
                {"detail": "Already signed in today"},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance.sign_in = timezone.now()
        attendance.save()

        return Response(
            {"message": "Sign-in successful"},
            status=status.HTTP_200_OK
        )


class SignOutView(APIView):
    """
    Employee sign-out & working hours calculation
    """

    def post(self, request):
        today = timezone.localdate()

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

        # Calculate working hours
        delta = attendance.sign_out - attendance.sign_in
        hours = round(delta.total_seconds() / 3600, 2)
        attendance.working_hours = hours

        # Status rules
        if hours >= 8:
            attendance.status = "PRESENT"
        elif hours >= 4:
            attendance.status = "HALF_DAY"
        else:
            attendance.status = "ABSENT"

        attendance.save()

        return Response(
            {
                "message": "Sign-out successful",
                "working_hours": attendance.working_hours,
                "status": attendance.status,
            },
            status=status.HTTP_200_OK
        )


class MyAttendanceHistoryView(APIView):
    """
    Employee attendance history
    """

    def get(self, request):
        records = Attendance.objects.filter(user=request.user)
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)


class AttendanceReportAdminView(APIView):
    """
    Admin: employee-wise / date-wise attendance
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        user_id = request.query_params.get("user_id")
        date = request.query_params.get("date")

        queryset = Attendance.objects.all()

        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if date:
            queryset = queryset.filter(date=date)

        serializer = AttendanceSerializer(queryset, many=True)
        return Response(serializer.data)


class AttendanceSummaryView(APIView):
    """
    Employee reports:
    - Present days
    - Absent days
    - Total working hours
    """

    def get(self, request):
        qs = Attendance.objects.filter(user=request.user)

        present_days = qs.filter(status="PRESENT").count()
        absent_days = qs.filter(status="ABSENT").count()
        total_hours = qs.aggregate(
            total=Sum("working_hours")
        )["total"] or 0

        return Response({
            "present_days": present_days,
            "absent_days": absent_days,
            "total_working_hours": total_hours
        })
