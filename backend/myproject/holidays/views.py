from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Holiday, HolidayCalendar
from .serializers import HolidaySerializer, HolidayCalendarSerializer
from accounts.permissions import IsAdmin




class HolidayListCreateView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        holidays = Holiday.objects.all()
        serializer = HolidaySerializer(holidays, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = HolidaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)


class HolidayDeleteView(APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        holiday = get_object_or_404(Holiday, pk=pk)
        holiday.delete()
        return Response(status=204)
class HolidayCalendarView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        calendar = HolidayCalendar.objects.first()
        if not calendar:
            return Response(None)
        serializer = HolidayCalendarSerializer(calendar)
        return Response(serializer.data)

    def post(self, request):
        calendar = HolidayCalendar.objects.first()

        serializer = HolidayCalendarSerializer(
            calendar,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
