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

        taken = sum(float(leave.leave_days) for leave in approved_leaves)
        requested_days = float(serializer.validated_data["leave_days"])

        if taken + requested_days > balance.total_leaves:
            return Response(
                {"detail": "Insufficient leave balance"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Create leave
        leave = Leave.objects.create(
            user=request.user,
            **serializer.validated_data
        )

        # ================= SEND EMAIL TO ADMINS =================
        admin_emails = User.objects.filter(
            role="ADMIN"
        ).values_list("email", flat=True)

        if admin_emails:
            subject = "New Leave Application Submitted"
            message = f"""
Employee: {request.user.employee_profile.full_name}
Email: {request.user.email}

Leave Type: {leave.leave_type.name}
Start Date: {leave.start_date}
End Date: {leave.end_date}
Leave Days: {leave.leave_days}

Reason:
{leave.reason}
            """

            send_mail(
                subject,
                message,
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

    def get(self, request):
        leaves = Leave.objects.filter(user=request.user)
        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data)


# ================= ADMIN LEAVE LIST =================
class LeaveApprovalListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        leaves = Leave.objects.select_related("user").all()
        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data)


# ================= ADMIN APPROVE / REJECT =================
class LeaveApprovalActionView(APIView):
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        leave = get_object_or_404(Leave, pk=pk)

        serializer = LeaveApprovalSerializer(leave, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": f"Leave {leave.status.lower()}"},
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

        taken = 0
        for leave in approved_leaves:
            taken += (leave.end_date - leave.start_date).days + 1

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

        if not total:
            return Response(
                {"detail": "total_leaves is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        total = int(total)

        if email:
            user = get_object_or_404(User, email=email)
            LeaveBalance.objects.update_or_create(
                user=user,
                defaults={"total_leaves": total}
            )
        else:
            for user in User.objects.filter(role="EMPLOYEE"):
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
# ================= EMPLOYEE LEAVE TYPES =================

class LeaveTypeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leave_types = LeaveType.objects.filter(is_active=True)
        return Response(
            [
                {"id": lt.id, "name": lt.name}
                for lt in leave_types
            ],
            status=status.HTTP_200_OK
        )
# ================= ADMIN LEAVE TYPE MANAGEMENT =================
class LeaveTypeAdminView(APIView):
    permission_classes = [IsAdmin]

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

    def delete(self, request, pk):
        leave_type = get_object_or_404(LeaveType, pk=pk)
        leave_type.delete()
        return Response(
            {"message": "Leave type deleted successfully"},
            status=status.HTTP_200_OK
        )
