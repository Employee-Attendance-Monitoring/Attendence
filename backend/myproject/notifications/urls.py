from django.urls import path
from .views import MyNotificationsView, MarkNotificationReadView

urlpatterns = [
    path("", MyNotificationsView.as_view()),
    path("<int:pk>/read/", MarkNotificationReadView.as_view()),
]
