from django.core.management.base import BaseCommand
from django.utils import timezone
from attendance.models import Attendance
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = "Auto sign-out employees at 6:30 PM"

    def handle(self, *args, **kwargs):
        self.stdout.write("Auto sign-out command triggered")
        now = timezone.now()
        today = now.date()

        cutoff = now.replace(hour=18, minute=30, second=0)

        if now < cutoff:
            return

        records = Attendance.objects.filter(
            date=today,
            sign_in__isnull=False,
            sign_out__isnull=True
        )

        for att in records:
            att.sign_out = cutoff
            att.is_auto_signout = True

            delta = att.sign_out - att.sign_in
            hours = round(delta.total_seconds() / 3600, 2)
            att.working_hours = hours

            if hours >= 8:
                att.status = "PRESENT"
            elif hours >= 4:
                att.status = "HALF_DAY"
            else:
                att.status = "ABSENT"

            att.save()

            send_mail(
                subject="Auto Sign-Out at 6:30 PM",
                message=(
                    f"Hello {att.user.email},\n\n"
                    f"You were automatically signed out at 6:30 PM "
                    f"because you missed sign-out."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[att.user.email],
                fail_silently=True,
            )
