import uuid

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import models
from django.db.models import F, Q


def new_reference():
    return "TXN-" + uuid.uuid4().hex[:12].upper()


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    mobile_number = models.CharField(max_length=13, unique=True)  # +639XXXXXXXXX
    pin_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_pin(self, raw_pin):
        self.pin_hash = make_password(raw_pin)

    def check_pin(self, raw_pin):
        return check_password(raw_pin, self.pin_hash)

    def __str__(self):
        return f"{self.user.username} ({self.mobile_number})"


class Wallet(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet"
    )
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(balance__gte=0), name="wallet_balance_non_negative"
            )
        ]

    def __str__(self):
        return f"{self.user.username}: PHP {self.balance}"


class Biller(models.Model):
    class Category(models.TextChoices):
        ELECTRICITY = "ELECTRICITY", "Electricity"
        WATER = "WATER", "Water"
        TELCO = "TELCO", "Telco & Internet"
        INSURANCE = "INSURANCE", "Insurance"
        GOVERNMENT = "GOVERNMENT", "Government"
        OTHER = "OTHER", "Other"

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.OTHER
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Transaction(models.Model):
    """Immutable ledger row. Corrections are made with new rows, never edits."""

    class Type(models.TextChoices):
        CASH_IN = "CASH_IN", "Cash in"
        SEND = "SEND", "Send money"
        BILL_PAYMENT = "BILL_PAYMENT", "Bill payment"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(
        max_length=20, unique=True, default=new_reference, editable=False
    )
    type = models.CharField(max_length=20, choices=Type.choices)
    sender = models.ForeignKey(
        Wallet, null=True, blank=True, on_delete=models.PROTECT, related_name="sent"
    )
    receiver = models.ForeignKey(
        Wallet, null=True, blank=True, on_delete=models.PROTECT, related_name="received"
    )
    biller = models.ForeignKey(
        Biller, null=True, blank=True, on_delete=models.PROTECT, related_name="payments"
    )
    account_ref = models.CharField(max_length=50, blank=True)  # biller account no.
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    fee = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    note = models.CharField(max_length=140, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=Q(amount__gt=0), name="txn_amount_positive"
            ),
            models.CheckConstraint(
                condition=~Q(type="CASH_IN")
                | Q(receiver__isnull=False, sender__isnull=True),
                name="txn_cash_in_shape",
            ),
            models.CheckConstraint(
                condition=~Q(type="SEND")
                | (
                    Q(sender__isnull=False, receiver__isnull=False)
                    & ~Q(sender=F("receiver"))
                ),
                name="txn_send_shape",
            ),
            models.CheckConstraint(
                condition=~Q(type="BILL_PAYMENT")
                | Q(sender__isnull=False, biller__isnull=False),
                name="txn_bill_shape",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValueError("Transactions are immutable and cannot be edited.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("Transactions are immutable and cannot be deleted.")

    def __str__(self):
        return f"{self.reference} {self.type} PHP {self.amount}"