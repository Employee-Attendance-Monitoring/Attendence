from django.urls import path
from .views import (
    EmployeeCreateView,
    EmployeeListView,
    EmployeeDetailView,
)

urlpatterns = [
    path("create/", EmployeeCreateView.as_view()),
    path("list/", EmployeeListView.as_view()),
    path("detail/<int:pk>/", EmployeeDetailView.as_view()),
    path("me/", EmployeeDetailView.as_view()),
]
