from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Holiday
from .serializers import HolidaySerializer
from accounts.permissions import IsAdmin


class HolidayListView(APIView):
    """
    Employee + Admin: view holiday list
    """

    def get(self, request):
        holidays = Holiday.objects.all()
        serializer = HolidaySerializer(holidays, many=True)
        return Response(serializer.data)


class HolidayCreateView(APIView):
    """
    Admin: create holiday
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = HolidaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Holiday created"},
            status=status.HTTP_201_CREATED
        )


class HolidayUpdateDeleteView(APIView):
    """
    Admin: update / delete holiday
    """
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        holiday = get_object_or_404(Holiday, pk=pk)
        serializer = HolidaySerializer(holiday, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Holiday updated"})

    def delete(self, request, pk):
        holiday = get_object_or_404(Holiday, pk=pk)
        holiday.delete()
        return Response(
            {"message": "Holiday deleted"},
            status=status.HTTP_204_NO_CONTENT
        )
