from django.urls import path
from .views import (
    SignInView,
    SignOutView,
    MyAttendanceHistoryView,
    AttendanceSummaryView,
    AttendanceReportAdminView,
    MyAttendanceDashboardSummaryView,
)

urlpatterns = [
    path("signin/", SignInView.as_view()),
    path("signout/", SignOutView.as_view()),
    path("my-history/", MyAttendanceHistoryView.as_view()),
    path("my-summary/", AttendanceSummaryView.as_view()),
    path("admin-report/", AttendanceReportAdminView.as_view()),
    path("my-dashboard-summary/", MyAttendanceDashboardSummaryView.as_view()),
]
