from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializers import UserSerializer, CreateEmployeeSerializer
from .permissions import IsAdmin

class MeView(APIView):
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
