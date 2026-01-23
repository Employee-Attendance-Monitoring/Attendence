# leaves/urls.py
from django.urls import path
from .views import (
    ApplyLeaveView,
    MyLeaveListView,
    LeaveApprovalListView,
    LeaveApprovalActionView,
    LeaveSummaryView,   # ✅ ADD THIS
    SetLeaveBalanceView,
    MyLeaveBalanceView,
)

urlpatterns = [
    # EMPLOYEE
    path("apply/", ApplyLeaveView.as_view()),
    path("my/", MyLeaveListView.as_view()),
    path("my-balance/", MyLeaveBalanceView.as_view()), 
    # ADMIN - LEAVE MANAGEMENT
    path("admin/", LeaveApprovalListView.as_view()),
    path("admin/<int:pk>/", LeaveApprovalActionView.as_view()),

    # ADMIN - LEAVE SUMMARY (NEW)
    path("admin/leave-summary/", LeaveSummaryView.as_view()),

    path("admin/set-balance/", SetLeaveBalanceView.as_view()),
    



]
