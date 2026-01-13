from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Leave
from .serializers import LeaveSerializer, LeaveApprovalSerializer
from accounts.permissions import IsAdmin


class ApplyLeaveView(APIView):
    """
    Employee applies leave
    """

    def post(self, request):
        serializer = LeaveSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        Leave.objects.create(
            user=request.user,
            **serializer.validated_data
        )

        return Response(
            {"message": "Leave applied successfully"},
            status=status.HTTP_201_CREATED
        )


class MyLeaveListView(APIView):
    """
    Employee leave list
    """

    def get(self, request):
        leaves = Leave.objects.filter(user=request.user)
        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data)


class LeaveApprovalListView(APIView):
    """
    Admin: view all leave requests
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        leaves = Leave.objects.select_related("user").all()
        serializer = LeaveSerializer(leaves, many=True)
        return Response(serializer.data)


class LeaveApprovalActionView(APIView):
    """
    Admin approves/rejects leave
    """
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        leave = get_object_or_404(Leave, pk=pk)

        serializer = LeaveApprovalSerializer(
            leave,
            data=request.data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": f"Leave {leave.status.lower()}"},
            status=status.HTTP_200_OK
        )
