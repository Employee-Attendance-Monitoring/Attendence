from django.urls import path
from .views import (
    ApplyLeaveView,
    MyLeaveListView,
    LeaveApprovalListView,
    LeaveApprovalActionView,
)

urlpatterns = [
    path("apply/", ApplyLeaveView.as_view()),
    path("my/", MyLeaveListView.as_view()),

    path("admin/", LeaveApprovalListView.as_view()),
    path("admin/<int:pk>/", LeaveApprovalActionView.as_view()),
]
