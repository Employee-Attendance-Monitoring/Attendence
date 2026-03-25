from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

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

        # ✅ FIX DEFAULT (NO UNDEFINED VARIABLE)
        balance, _ = LeaveBalance.objects.get_or_create(
            user=request.user,
            defaults={
                "paid_leave": 0,
                "sick_leave": 0,
                "casual_leave": 0,
            }
        )

        leave_type = serializer.validated_data["leave_type"].name.strip().lower()

        approved_leaves = Leave.objects.filter(
            user=request.user,
            status="APPROVED",
            leave_type__name__iexact=leave_type
        )

        taken = sum(float(l.leave_days) for l in approved_leaves)
        requested_days = float(serializer.validated_data.get("leave_days", 0))

        if leave_type == "paid":
            limit = balance.paid_leave
        elif leave_type == "sick":
            limit = balance.sick_leave
        elif leave_type == "casual":
            limit = balance.casual_leave
        else:
            limit = 0

        if taken + requested_days > limit:
            return Response(
                {"detail": f"{leave_type.capitalize()} leave exceeded"},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave = Leave.objects.create(
            user=request.user,
            status="PENDING",
            **serializer.validated_data
        )

        # ✅ NOTIFICATIONS
        admins = User.objects.filter(role__iexact="ADMIN")
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title="New Leave Request",
                message=(
                    f"{request.user.email} applied for "
                    f"{leave.leave_type.name} "
                    f"({leave.start_date} → {leave.end_date})"
                )
            )

        # ✅ EMAIL
        admin_emails = admins.values_list("email", flat=True)

        if admin_emails:
            employee_name = (
                request.user.employee_profile.full_name
                if hasattr(request.user, "employee_profile")
                else request.user.email
            )
            # ✅ Day text
            if leave.is_half_day == "FIRST_HALF":
                day_text = "1st Half (0.5 day)"
            elif leave.is_half_day == "SECOND_HALF":
                day_text = "2nd Half (0.5 day)"
            else:
                day_text = f"Full Day ({leave.leave_days} day)"

            subject = "Leave Application"

            email_message = (
                f"Hello Sir/Madam,\n\n"
                f"{employee_name} ({request.user.email}) has applied for leave "
                f"from {leave.start_date} to {leave.end_date} "
                f"({day_text}).\n\n"
                f"Please log in to review the request.\n\n"
                f"Regards,\n"
                f"{employee_name}"
            )

            send_mail(
                subject,
                email_message,
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
        leaves = Leave.objects.select_related("user", "leave_type").order_by("-applied_at")
        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data)


# ================= ADMIN APPROVE / REJECT =================
class LeaveApprovalActionView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        leave = get_object_or_404(Leave, pk=pk)

        if leave.status != "PENDING":
            return Response({"detail": "Already processed"}, status=400)

        serializer = LeaveApprovalSerializer(leave, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # ✅ FIX INDENTATION + VALIDATION
        if serializer.validated_data.get("status") == "APPROVED":
            balance, _ = LeaveBalance.objects.get_or_create(
                user=leave.user,
                defaults={
                    "paid_leave": 0,
                    "sick_leave": 0,
                    "casual_leave": 0
                }
            )

            leave_type = leave.leave_type.name.lower()

            approved_leaves = Leave.objects.filter(
                user=leave.user,
                status="APPROVED",
                leave_type__name__iexact=leave_type
            ).exclude(id=leave.id)

            taken = sum(float(l.leave_days) for l in approved_leaves)

            if leave_type == "paid":
                limit = balance.paid_leave
            elif leave_type == "sick":
                limit = balance.sick_leave
            elif leave_type == "casual":
                limit = balance.casual_leave
            else:
                limit = 0

            if taken + float(leave.leave_days) > limit:
                return Response({"detail": "Leave limit exceeded"}, status=400)

        serializer.save()
        leave.refresh_from_db()

        # ✅ NOTIFICATION
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

       # ================= EMAIL TO EMPLOYEE =================
        if leave.user.email:
            name = (
                leave.user.employee_profile.full_name
                if hasattr(leave.user, "employee_profile")
                else leave.user.email
            )

            days = leave.leave_days

            if leave.status == "APPROVED":
                subject = "Leave Approved – Quandatum Analytics"
                email_message = (
                    f"Hello {name},\n\n"
                    f"Your leave request has been approved.\n\n"
                    f"Leave Date: {leave.start_date} ({days} day)\n\n"
                    f"Regards,\n"
                    f"Quandatum Analytics – HR Team"
                )

            elif leave.status == "REJECTED":
                subject = "Leave Request Update – Quandatum Analytics"
                email_message = (
                    f"Hello {name},\n\n"
                    f"Your leave request has been rejected.\n\n"
                    f"Reason: {leave.rejection_reason}\n\n"
                    f"Regards,\n"
                    f"Quandatum Analytics – HR Team"
                )            
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
            defaults={
                "paid_leave": 0,
                "sick_leave": 0,
                "casual_leave": 0
            }
        )

        approved_leaves = Leave.objects.filter(user=user, status="APPROVED")

        return Response({
            "paid_leave": balance.paid_leave,
            "sick_leave": balance.sick_leave,
            "casual_leave": balance.casual_leave,

            "paid_used": sum(float(l.leave_days) for l in approved_leaves if l.leave_type.name.lower() == "paid"),
            "sick_used": sum(float(l.leave_days) for l in approved_leaves if l.leave_type.name.lower() == "sick"),
            "casual_used": sum(float(l.leave_days) for l in approved_leaves if l.leave_type.name.lower() == "casual"),
        })


# ================= ADMIN SET LEAVE =================
class SetLeaveBalanceView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        paid = request.data.get("paid_leave", 0)
        sick = request.data.get("sick_leave", 0)
        casual = request.data.get("casual_leave", 0)
        email = request.data.get("employee")

        users = (
            [get_object_or_404(User, email=email)]
            if email
            else User.objects.filter(role="EMPLOYEE")
        )

        for user in users:
            LeaveBalance.objects.update_or_create(
                user=user,
                defaults={
                    "paid_leave": int(paid),
                    "sick_leave": int(sick),
                    "casual_leave": int(casual),
                }
            )

        return Response(
            {"message": "Leave balance updated successfully"},
            status=status.HTTP_200_OK
        )

# ================= MY BALANCE =================
# ================= MY BALANCE =================
class MyLeaveBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        balance, _ = LeaveBalance.objects.get_or_create(
            user=user,
            defaults={
                "paid_leave": 0,
                "sick_leave": 0,
                "casual_leave": 0
            }
        )
        approved_leaves = Leave.objects.filter(
            user=user,
            status="APPROVED"
        )
        paid_used = sum(
            float(l.leave_days)
            for l in approved_leaves
            if l.leave_type.name.lower() == "paid"
        )

        sick_used = sum(
            float(l.leave_days)
            for l in approved_leaves
            if l.leave_type.name.lower() == "sick"
        )

        casual_used = sum(
            float(l.leave_days)
            for l in approved_leaves
            if l.leave_type.name.lower() == "casual"
        )

        total = balance.paid_leave + balance.sick_leave + balance.casual_leave
        taken = paid_used + sick_used + casual_used
        remaining = total - taken

        return Response({
           "paid": {
    "total": balance.paid_leave,
    "used": int(paid_used)
},
    "sick": {
    "total": balance.sick_leave,
    "used": int(sick_used)
},
    "casual": {
    "total": balance.casual_leave,
    "used": int(casual_used)
},
    "total": total,
    "taken": int(taken),
    "balance": int(remaining)
        })

# ================= LEAVE TYPES =================
class LeaveTypeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leave_types = LeaveType.objects.filter(is_active=True)
        return Response([{"id": lt.id, "name": lt.name} for lt in leave_types])


# ================= ADMIN LEAVE TYPE =================
class LeaveTypeAdminView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        leave_types = LeaveType.objects.all()
        return Response([{"id": lt.id, "name": lt.name} for lt in leave_types])

    def post(self, request):
        name = request.data.get("name")
        LeaveType.objects.get_or_create(name=name)
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
