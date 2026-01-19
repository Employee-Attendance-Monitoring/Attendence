from django.urls import path
from .views import (
    SignInView,
    SignOutView,
    MyAttendanceHistoryView,
    AttendanceSummaryView,
    AttendanceReportAdminView,
)

urlpatterns = [
    path("signin/", SignInView.as_view()),
    path("signout/", SignOutView.as_view()),
    path("my-history/", MyAttendanceHistoryView.as_view()),
    path("my-summary/", AttendanceSummaryView.as_view()),

    # ✅ THIS IS WHAT WAS MISSING
    path("admin-report/", AttendanceReportAdminView.as_view()),
]
