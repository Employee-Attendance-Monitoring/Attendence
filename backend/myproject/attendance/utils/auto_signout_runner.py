import threading
import time
from django.utils import timezone
from attendance.models import Attendance


def auto_signout_job():
    while True:
        now = timezone.now()   

        records = Attendance.objects.filter(
            sign_in__isnull=False,
            sign_out__isnull=True
        )

        for att in records:
            elapsed = now - att.sign_in

            # 12 hours check
            if elapsed.total_seconds() < 12 * 3600:
                continue

            # use current time
            att.sign_out = now
            att.is_auto_signout = True
            att.auto_signout_reason = "Auto sign-out due to missed sign-out"

            # calculate real hours
            delta = att.sign_out - att.sign_in
            total_seconds = int(delta.total_seconds())
            decimal_hours = round(total_seconds / 3600, 2)

            att.working_hours = decimal_hours

            # status logic
            if decimal_hours >= 8:
                att.status = "PRESENT"
            elif decimal_hours >= 4:
                att.status = "HALF_DAY"
            else:
                att.status = "ABSENT"

            att.save()

            print(f"Auto signed-out: {att.user.email}")

        time.sleep(300)  # every 5 mins


def start_auto_signout():
    thread = threading.Thread(target=auto_signout_job, daemon=True)
    thread.start()