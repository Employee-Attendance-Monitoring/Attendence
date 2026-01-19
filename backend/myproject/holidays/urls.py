from django.urls import path
from .views import (
    HolidayListCreateView,
    HolidayDeleteView,
    HolidayCalendarView,
)

urlpatterns = [
    path("", HolidayListCreateView.as_view()),        # GET, POST
    path("<int:pk>/", HolidayDeleteView.as_view()),   # DELETE

    path("calendar/", HolidayCalendarView.as_view()), # GET, POST
]
