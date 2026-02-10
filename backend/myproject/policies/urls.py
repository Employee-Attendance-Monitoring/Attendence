from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyPolicyViewSet

router = DefaultRouter()
router.register(
    r'policies',
    CompanyPolicyViewSet,
    basename='policies'  
)

urlpatterns = [
    path('', include(router.urls)),
    
]
