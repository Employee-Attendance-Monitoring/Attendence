from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Leave, LeaveBalance, LeaveType
from .serializers import (
    LeaveSerializer,
    LeaveApprovalSerializer,
    LeaveBalanceSerializer
)

from accounts.permissions import IsAdmin
from accounts.models import User
from django.core.mail import send_mail
from django.conf import settings

from notifications.models import Notification

# ================= EMPLOYEE APPLY LEAVE =================
class ApplyLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LeaveSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        balance, _ = LeaveBalance.objects.get_or_create(
            user=request.user,
            defaults={"total_leaves": 12}
        )

        approved_leaves = Leave.objects.filter(
            user=request.user,
            status="APPROVED"
        )

        taken = sum(float(l.leave_days) for l in approved_leaves)
        requested_days = float(serializer.validated_data.get("leave_days", 0))

        if taken + requested_days > balance.total_leaves:
            return Response(
                {"detail": "Insufficient leave balance"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ CREATE LEAVE
        leave = Leave.objects.create(
            user=request.user,
            status="PENDING",
            **serializer.validated_data
        )

        # ✅ SAFELY GET LEAVE TYPE NAME
        leave_type_name = (
            leave.leave_type.name
            if leave.leave_type else "Leave"
        )

        # ✅ GET ADMINS (CASE INSENSITIVE)
        admins = User.objects.filter(role__iexact="ADMIN")

        # ✅ CREATE NOTIFICATIONS (SAFE)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title="New Leave Request",
                message=(
                    f"{request.user.email} applied for "
                    f"{leave_type_name} "
                    f"({leave.start_date} → {leave.end_date})"
                )
            )

        # ✅ EMAIL ADMINS (OPTIONAL)
        admin_emails = admins.values_list("email", flat=True)
        if admin_emails:
            send_mail(
                "New Leave Application Submitted",
                f"{request.user.email} applied for leave "
                f"from {leave.start_date} to {leave.end_date}",
                settings.DEFAULT_FROM_EMAIL,
                list(admin_emails),
                fail_silently=True
            )

        return Response(
            {"message": "Leave applied successfully"},
            status=status.HTTP_201_CREATED
        )

# ================= EMPLOYEE LEAVE LIST =================
class MyLeaveListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leaves = Leave.objects.filter(user=request.user).order_by("-applied_at")
        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data)
# ================= ADMIN LEAVE LIST =================
class LeaveApprovalListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        leaves = Leave.objects.select_related(
            "user", "leave_type"
        ).order_by("-applied_at")

        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data)
# ================= ADMIN APPROVE / REJECT =================

class LeaveApprovalActionView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        leave = get_object_or_404(Leave, pk=pk)

        if leave.status != "PENDING":
            return Response(
                {"detail": "Leave already processed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = LeaveApprovalSerializer(
            leave,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # ✅ CRITICAL FIX — refresh object from DB
        leave.refresh_from_db()

        # ================= NOTIFICATION =================
        message = (
            f"Your leave from {leave.start_date} to {leave.end_date} "
            f"was {leave.status.lower()}."
        )

        if leave.status == "REJECTED":
            message += f" Reason: {leave.rejection_reason}"

        Notification.objects.create(
            user=leave.user,
            title="Leave Status Updated",
            message=message
        )

        # ================= EMAIL TO EMPLOYEE (NEW) =================
        if leave.user.email:
            subject = "Leave Request Status Update"

            email_message = (
                f"Hello {leave.user.employee_profile.full_name},\n\n"
                f"Your leave request has been {leave.status.lower()}.\n\n"
                f"Leave Period: {leave.start_date} to {leave.end_date}\n"
            )

            if leave.status == "REJECTED":
                email_message += (
                    f"Reason for rejection:\n{leave.rejection_reason}\n\n"
                )

            email_message += "Regards,\nHR Team"

            send_mail(
                subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [leave.user.email],
                fail_silently=True
            )

        return Response(
            {
                "message": "Leave updated successfully",
                "data": LeaveSerializer(leave).data
            },
            status=status.HTTP_200_OK
        )



# ================= ADMIN LEAVE SUMMARY =================
class LeaveSummaryView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        email = request.query_params.get("employee")
        if not email:
            return Response(
                {"detail": "Employee email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, email=email)

        balance, _ = LeaveBalance.objects.get_or_create(
            user=user,
            defaults={"total_leaves": 12}
        )

        approved_leaves = Leave.objects.filter(
            user=user,
            status="APPROVED"
        )

        taken = sum(
            (l.end_date - l.start_date).days + 1
            for l in approved_leaves
        )

        return Response({
            "total": balance.total_leaves,
            "taken": taken,
            "balance": max(balance.total_leaves - taken, 0)
        })

# ================= ADMIN SET LEAVE BALANCE =================
class SetLeaveBalanceView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        total = request.data.get("total_leaves")
        email = request.data.get("employee")

        if total is None:
            return Response(
                {"detail": "total_leaves is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        total = int(total)

        users = (
            [get_object_or_404(User, email=email)]
            if email
            else User.objects.filter(role="EMPLOYEE")
        )

        for user in users:
            LeaveBalance.objects.update_or_create(
                user=user,
                defaults={"total_leaves": total}
            )

        return Response(
            {"message": "Leave balance updated successfully"},
            status=status.HTTP_200_OK
        )
# ================= EMPLOYEE MY LEAVE BALANCE =================
class MyLeaveBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        balance, _ = LeaveBalance.objects.get_or_create(
            user=request.user,
            defaults={"total_leaves": 12}
        )
        serializer = LeaveBalanceSerializer(balance)
        return Response(serializer.data)
# ================= LEAVE TYPES =================
class LeaveTypeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leave_types = LeaveType.objects.all()
        return Response(
            [{"id": lt.id, "name": lt.name} for lt in leave_types]
        )
# ================= ADMIN LEAVE TYPE MANAGEMENT =================
class LeaveTypeAdminView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        leave_types = LeaveType.objects.all()
        return Response(
            [{"id": lt.id, "name": lt.name} for lt in leave_types]
        )

    def post(self, request):
        name = request.data.get("name")
        if not name:
            return Response(
                {"detail": "Leave type name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        LeaveType.objects.create(name=name)
        return Response(
            {"message": "Leave type added successfully"},
            status=status.HTTP_201_CREATED
        )

    def put(self, request, pk):
        leave_type = get_object_or_404(LeaveType, pk=pk)
        leave_type.name = request.data.get("name", leave_type.name)
        leave_type.save()

        return Response(
            {"message": "Leave type updated successfully"},
            status=status.HTTP_200_OK
        )

    def delete(self, request, pk):
        leave_type = get_object_or_404(LeaveType, pk=pk)

        # 🔴 BLOCK DELETE IF USED
        if Leave.objects.filter(leave_type=leave_type).exists():
            return Response(
                {
                    "detail": "Cannot delete leave type. It is already used in leave records."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        leave_type.delete()

        return Response(
            {"message": "Leave type deleted successfully"},
            status=status.HTTP_200_OK
        )
