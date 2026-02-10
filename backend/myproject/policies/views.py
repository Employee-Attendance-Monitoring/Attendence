from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CompanyPolicy, PolicyAcknowledgement
from .serializers import CompanyPolicySerializer
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

class CompanyPolicyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyPolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin → see all policies
        if user.is_staff or user.is_superuser:
            return CompanyPolicy.objects.all()

        # Employee → only active policies
        return CompanyPolicy.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, is_active=True)
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only admin can delete policies")
        return super().destroy(request, *args, **kwargs)
    

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        policy = self.get_object()
        PolicyAcknowledgement.objects.get_or_create(
            policy=policy,
            employee=request.user
        )
        return Response({"message": "Policy acknowledged successfully"})
    @action(
    detail=True,
    methods=["patch"],
    permission_classes=[permissions.IsAdminUser]
    )
    def toggle_status(self, request, pk=None):
        policy = self.get_object()

    # toggle active / inactive
        policy.is_active = not policy.is_active
        policy.save(update_fields=["is_active"])

        return Response(
        {
            "message": "Policy status updated successfully",
            "is_active": policy.is_active
        },
        status=status.HTTP_200_OK
    )

