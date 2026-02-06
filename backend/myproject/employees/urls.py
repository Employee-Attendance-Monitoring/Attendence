from django.urls import path
from .views import (
    EmployeeCreateView,
    EmployeeListView,
    EmployeeDetailView,
    EmployeeDeleteView,
    EmployeeDropdownView,
    ChangePasswordView,
    BloodGroupListView,
    relieve_employee,
    EmployeeDashboardHighlightsView,
)

urlpatterns = [
    path("create/", EmployeeCreateView.as_view()),
    path("list/", EmployeeListView.as_view()),
    path("me/", EmployeeDetailView.as_view()),
    path("<int:pk>/", EmployeeDetailView.as_view()),
    path("<int:pk>/delete/", EmployeeDeleteView.as_view()),
    path("dropdown/", EmployeeDropdownView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path("blood-groups/", BloodGroupListView.as_view()),
    path("<int:id>/relieve/", relieve_employee),
    path("employee-dashboard-highlights/", EmployeeDashboardHighlightsView.as_view(),
         name="employee-dashboard-highlights",
    ),
]
