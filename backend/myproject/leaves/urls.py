# leaves/urls.py
from django.urls import path
from .views import (
    ApplyLeaveView,
    MyLeaveListView,
    LeaveApprovalListView,
    LeaveApprovalActionView,
    LeaveSummaryView,
    SetLeaveBalanceView,
    MyLeaveBalanceView,
    LeaveTypeListView,
    LeaveTypeAdminView,
)

urlpatterns = [
    # ================= EMPLOYEE =================
    path("apply/", ApplyLeaveView.as_view()),
    path("my/", MyLeaveListView.as_view()),
    path("my-balance/", MyLeaveBalanceView.as_view()),
    path("leave-types/", LeaveTypeListView.as_view()),   # ✅ NEW

    # ================= ADMIN =================
    path("admin/", LeaveApprovalListView.as_view()),
    path("admin/<int:pk>/", LeaveApprovalActionView.as_view()),
    path("admin/leave-summary/", LeaveSummaryView.as_view()),
    path("admin/set-balance/", SetLeaveBalanceView.as_view()),
    path("admin/leave-types/", LeaveTypeAdminView.as_view()),          # ✅ NEW
    path("admin/leave-types/<int:pk>/", LeaveTypeAdminView.as_view()), # ✅ NEW
]
