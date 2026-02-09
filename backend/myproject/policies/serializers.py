from rest_framework import serializers
from .models import CompanyPolicy, PolicyAcknowledgement

class CompanyPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyPolicy
        fields = '__all__'


class PolicyAcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicyAcknowledgement
        fields = '__all__'
