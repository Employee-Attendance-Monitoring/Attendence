from django.apps import AppConfig


class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'attendance'

    def ready(self):  
        from .utils.auto_signout_runner import start_auto_signout
        start_auto_signout()