from django.urls import path
from .views import (
    EmployeeCreateView,
    EmployeeListView,
    EmployeeDetailView
    , EmployeeDeleteView
)

urlpatterns = [
    path("create/", EmployeeCreateView.as_view()),   # POST
    path("list/", EmployeeListView.as_view()),       # GET
    path("<int:pk>/", EmployeeDetailView.as_view()), # GET / PUT
    path("<int:pk>/delete/", EmployeeDeleteView.as_view()),

]
