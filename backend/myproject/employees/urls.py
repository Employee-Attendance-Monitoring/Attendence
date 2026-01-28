from django.urls import path
from .views import (
    EmployeeCreateView,
    EmployeeListView,
    EmployeeDetailView,
    EmployeeDeleteView,
    EmployeeDropdownView,
    ChangePasswordView,
)

urlpatterns = [
    path("create/", EmployeeCreateView.as_view()),   # POST
    path("list/", EmployeeListView.as_view()),       # GET
    path("me/", EmployeeDetailView.as_view()),    
    path("<int:pk>/", EmployeeDetailView.as_view()), # GET / PUT
    path("<int:pk>/delete/", EmployeeDeleteView.as_view()),
    path("dropdown/", EmployeeDropdownView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),

    

]
