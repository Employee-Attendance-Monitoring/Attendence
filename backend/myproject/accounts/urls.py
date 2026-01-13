from django.urls import path
from .views import MeView, CreateEmployeeView

urlpatterns = [
    path("me/", MeView.as_view()),
    path("create-employee/", CreateEmployeeView.as_view()),
]
