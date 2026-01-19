from django.urls import path
from .views import (
    SignInView,
    SignOutView,
    MyAttendanceHistoryView,
    AttendanceSummaryView,
    AttendanceReportAdminView,
)

urlpatterns = [
    # EMPLOYEE
    path("signin/", SignInView.as_view()),
    path("signout/", SignOutView.as_view()),
    path("my-history/", MyAttendanceHistoryView.as_view()),
    path("my-summary/", AttendanceSummaryView.as_view()),

    # ADMIN
    path("admin/", AttendanceReportAdminView.as_view()),
]
