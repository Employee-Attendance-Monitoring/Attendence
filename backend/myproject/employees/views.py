from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import EmployeeProfile
from .serializers import EmployeeProfileSerializer,EmployeeDropdownSerializer
from accounts.models import User
from accounts.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated


class EmployeeCreateView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = EmployeeProfileSerializer(
            data=request.data,
            context={"request": request}   # ✅ REQUIRED
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Employee created successfully",
                "employee": serializer.data
            },
            status=status.HTTP_201_CREATED
        )




class EmployeeListView(APIView):
    """
    ADMIN: List all employees
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        employees = EmployeeProfile.objects.select_related("user").all()
        serializer = EmployeeProfileSerializer(employees, many=True)
        
        return Response(serializer.data)


class EmployeeDetailView(APIView):
    """
    ADMIN: View/update any employee
    EMPLOYEE: View own profile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
     if request.user.role == "EMPLOYEE":
        employee = get_object_or_404(
            EmployeeProfile.objects
            .select_related("bank_detail", "user")
            .prefetch_related("family_members"),
            user=request.user
        )
     else:
        employee = get_object_or_404(
            EmployeeProfile.objects
            .select_related("bank_detail", "user")
            .prefetch_related("family_members"),
            pk=pk
        )

     serializer = EmployeeProfileSerializer(employee)
     return Response(serializer.data)


    def put(self, request, pk=None):
        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Only admin can update employee"},
                status=status.HTTP_403_FORBIDDEN
            )

        employee = get_object_or_404(EmployeeProfile, pk=pk)

        serializer = EmployeeProfileSerializer(
            employee,
            data=request.data,
            partial=True,  
            context={"request": request}

        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Employee updated"})
    
class EmployeeDeleteView(APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        employee = get_object_or_404(EmployeeProfile, pk=pk)
        employee.user.delete()  # cascades employee profile
        return Response(
            {"message": "Employee deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
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
    
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsAdmin
from accounts.models import User

class EmployeeDropdownView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        users = User.objects.filter(is_staff=False).values(
            "id", "email"
        )
        return Response(users)   
     
class EmployeeDropdownView(APIView):
    def get(self, request):
        employees = EmployeeProfile.objects.select_related("user")
        serializer = EmployeeDropdownSerializer(employees, many=True)
        return Response(serializer.data)
