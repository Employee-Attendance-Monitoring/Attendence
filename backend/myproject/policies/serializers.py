from rest_framework import serializers
from .models import CompanyPolicy, PolicyAcknowledgement

class CompanyPolicySerializer(serializers.ModelSerializer):
    from_date = serializers.DateField(format="%d/%m/%Y")
    end_date = serializers.DateField(format="%d/%m/%Y")
    class Meta:
        model = CompanyPolicy
        fields = '__all__'


class PolicyAcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicyAcknowledgement
        fields = '__all__'
