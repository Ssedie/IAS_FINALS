import re
from decimal import Decimal

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from .models import Biller, Profile, Transaction, Wallet

AMOUNT_FIELD = dict(
    max_digits=12,
    decimal_places=2,
    min_value=Decimal("1.00"),
    max_value=Decimal("50000.00"),
)


def normalize_mobile(value):
    """Accepts 09XXXXXXXXX or +639XXXXXXXXX and returns +639XXXXXXXXX."""
    value = value.strip().replace(" ", "")
    if re.fullmatch(r"09\d{9}", value):
        return "+63" + value[1:]
    if re.fullmatch(r"\+639\d{9}", value):
        return value
    raise serializers.ValidationError("Enter a valid PH mobile number (09XXXXXXXXX).")


class MobileField(serializers.CharField):
    def to_internal_value(self, data):
        return normalize_mobile(super().to_internal_value(data))


class PinField(serializers.RegexField):
    def __init__(self, **kwargs):
        super().__init__(
            regex=r"^\d{4}$",
            write_only=True,
            error_messages={"invalid": "PIN must be exactly 4 digits."},
            **kwargs,
        )


class RegisterSerializer(serializers.Serializer):
    mobile_number = MobileField()
    first_name = serializers.CharField(max_length=60)
    last_name = serializers.CharField(max_length=60)
    password = serializers.CharField(write_only=True)
    pin = PinField()

    def validate_mobile_number(self, value):
        if Profile.objects.filter(mobile_number=value).exists():
            raise serializers.ValidationError("This number is already registered.")
        return value

    def validate(self, attrs):
        user = User(
            username=attrs["mobile_number"],
            first_name=attrs["first_name"],
            last_name=attrs["last_name"],
        )
        try:
            validate_password(attrs["password"], user=user)
        except Exception as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["mobile_number"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        profile = Profile(user=user, mobile_number=validated_data["mobile_number"])
        profile.set_pin(validated_data["pin"])
        profile.save()
        Wallet.objects.create(user=user)
        return user


class CashInSerializer(serializers.Serializer):
    amount = serializers.DecimalField(**AMOUNT_FIELD)


class SendMoneySerializer(serializers.Serializer):
    mobile_number = MobileField()
    amount = serializers.DecimalField(**AMOUNT_FIELD)
    note = serializers.CharField(max_length=140, required=False, allow_blank=True, default="")
    pin = PinField()


class PayBillSerializer(serializers.Serializer):
    biller_id = serializers.PrimaryKeyRelatedField(
        queryset=Biller.objects.filter(is_active=True), source="biller"
    )
    account_ref = serializers.CharField(max_length=50)
    amount = serializers.DecimalField(**AMOUNT_FIELD)
    pin = PinField()


class BillerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Biller
        fields = ["id", "name", "category"]


class TransactionSerializer(serializers.ModelSerializer):
    direction = serializers.SerializerMethodField()
    counterparty = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            "reference", "type", "direction", "counterparty",
            "amount", "fee", "note", "created_at",
        ]

    def get_direction(self, obj):
        return "out" if obj.sender_id == self.context["wallet"].id else "in"

    def get_counterparty(self, obj):
        if obj.type == Transaction.Type.CASH_IN:
            return "Cash In"
        if obj.type == Transaction.Type.BILL_PAYMENT:
            return obj.biller.name
        mine = self.context["wallet"].id
        other = obj.receiver if obj.sender_id == mine else obj.sender
        return other.user.get_full_name() or other.user.username