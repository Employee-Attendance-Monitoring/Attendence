from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializers import UserSerializer, CreateEmployeeSerializer
from .permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class CreateEmployeeView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = CreateEmployeeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            role="EMPLOYEE",
        )

        return Response(
            {
                "message": "Employee credentials created",
                "employee_id": user.id,
            },
            status=status.HTTP_201_CREATED,
        )


from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from accounts.models import User


class ResetEmployeePasswordView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        password = request.data.get("password")

        if not password:
            return Response(
                {"password": "This field is required"},
                status=400
            )

        user = get_object_or_404(User, id=user_id)
        user.set_password(password)
        user.save()

        return Response(
            {"message": "Password reset successful"},
            status=200
        )



from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsAdmin
from employees.models import EmployeeProfile
from django.contrib.auth import get_user_model

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        total_employees = EmployeeProfile.objects.count()
        active_employees = User.objects.filter(
            role="EMPLOYEE",
            is_active=True
        ).count()

        data = {
            "total_employees": total_employees,
            "active_employees": active_employees,
            # placeholders (we will fill later)
            "present_today": 0,
            "on_leave": 0,
        }

        return Response(data)
