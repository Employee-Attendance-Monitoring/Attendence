from django.urls import path
from .views import (
    OrganizationDetailView,
    DepartmentListCreateView,
    RoleListCreateView,
    DepartmentUpdateDeleteView,
    RoleUpdateDeleteView,
    OrganizationReportView,
)

urlpatterns = [
    # Organization
    path("", OrganizationDetailView.as_view()),
     path("report/", OrganizationReportView.as_view()), 
    # Departments
    path("departments/", DepartmentListCreateView.as_view()),
    path("departments/<int:pk>/", DepartmentUpdateDeleteView.as_view()),

    # Roles
    path("roles/", RoleListCreateView.as_view()),
    path("roles/<int:pk>/", RoleUpdateDeleteView.as_view()),
]
