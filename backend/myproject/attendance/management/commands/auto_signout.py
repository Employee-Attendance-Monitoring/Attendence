# attendance/management/commands/auto_signout.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from attendance.models import Attendance

class Command(BaseCommand):
    help = "Auto sign-out employees 24 hours after sign-in if sign-out is missed"

    def handle(self, *args, **kwargs):
        now = timezone.now()

        records = Attendance.objects.filter(
            sign_in__isnull=False,
            sign_out__isnull=True
        )

        for att in records:
            elapsed = now - att.sign_in

            # ✅ Only auto sign-out AFTER 24 hours
            if elapsed.total_seconds() < 24 * 3600:
                continue

            # ✅ AUTO SIGN-OUT TIME = sign_in + 24 hours
            auto_signout_time = att.sign_in + timezone.timedelta(hours=24)

            att.sign_out = auto_signout_time
            att.is_auto_signout = True
            att.auto_signout_reason = "Auto sign-out due to missed sign-out"

            # ✅ CAP HOURS TO MAX 24
            hours = 24.00
            att.working_hours = hours

            # ✅ STATUS RULES (HR STANDARD)
            if hours >= 8:
                att.status = "PRESENT"
            elif hours >= 4:
                att.status = "HALF_DAY"
            else:
                att.status = "ABSENT"

            att.save()

            self.stdout.write(
                self.style.WARNING(
                    f"Auto signed-out {att.user.email} (24.00 hrs)"
                )
            )
