from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Leave, LeaveBalance
from .serializers import (
    LeaveSerializer,
    LeaveApprovalSerializer,
    LeaveBalanceSerializer
)
from accounts.permissions import IsAdmin
from accounts.models import User


# ================= EMPLOYEE APPLY LEAVE =================
class ApplyLeaveView(APIView):

    def post(self, request):
        serializer = LeaveSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        # Get leave balance
        balance, _ = LeaveBalance.objects.get_or_create(
            user=request.user,
            defaults={"total_leaves": 12}
        )

        approved_leaves = Leave.objects.filter(
            user=request.user,
            status="APPROVED"
        )

        taken = 0
        for leave in approved_leaves:
            taken += (leave.end_date - leave.start_date).days + 1

        requested_days = (
            serializer.validated_data["end_date"]
            - serializer.validated_data["start_date"]
        ).days + 1

        if taken + requested_days > balance.total_leaves:
            return Response(
                {"detail": "Insufficient leave balance"},
                status=status.HTTP_400_BAD_REQUEST
            )

        Leave.objects.create(
            user=request.user,
            **serializer.validated_data
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
