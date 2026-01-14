from django.urls import path
from .views import MeView, CreateEmployeeView, ResetEmployeePasswordView, AdminDashboardView

urlpatterns = [
    path("me/", MeView.as_view()),
    path("create-employee/", CreateEmployeeView.as_view()),
    path("reset-password/<int:user_id>/", ResetEmployeePasswordView.as_view()),
    path("admin-dashboard/", AdminDashboardView.as_view()),

]
