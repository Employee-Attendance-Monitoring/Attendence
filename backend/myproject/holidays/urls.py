from django.urls import path
from .views import (
    HolidayListView,
    HolidayCreateView,
    HolidayUpdateDeleteView,
)

urlpatterns = [
    path("", HolidayListView.as_view()),
    path("create/", HolidayCreateView.as_view()),
    path("<int:pk>/", HolidayUpdateDeleteView.as_view()),
]
