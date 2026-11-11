from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import Profile, Transaction, Wallet


def _insufficient():
    return ValidationError({"amount": "Insufficient balance."})


@transaction.atomic
def cash_in(user, amount):
    wallet = Wallet.objects.select_for_update().get(user=user)
    wallet.balance += amount
    wallet.save(update_fields=["balance", "updated_at"])
    txn = Transaction.objects.create(
        type=Transaction.Type.CASH_IN, receiver=wallet, amount=amount
    )
    return txn, wallet.balance


@transaction.atomic
def send_money(sender_user, receiver_mobile, amount, note=""):
    try:
        receiver_user_id = Profile.objects.values_list("user_id", flat=True).get(
            mobile_number=receiver_mobile
        )
    except Profile.DoesNotExist:
        raise ValidationError({"mobile_number": "No account found for that number."})

    if receiver_user_id == sender_user.id:
        raise ValidationError({"mobile_number": "You can't send money to yourself."})

    # Lock both wallets in a consistent order to avoid deadlocks.
    wallets = {
        w.user_id: w
        for w in Wallet.objects.select_for_update()
        .filter(user_id__in=[sender_user.id, receiver_user_id])
        .order_by("pk")
    }
    sender, receiver = wallets[sender_user.id], wallets[receiver_user_id]

    if sender.balance < amount:
        raise _insufficient()

    sender.balance -= amount
    receiver.balance += amount
    sender.save(update_fields=["balance", "updated_at"])
    receiver.save(update_fields=["balance", "updated_at"])

    txn = Transaction.objects.create(
        type=Transaction.Type.SEND,
        sender=sender,
        receiver=receiver,
        amount=amount,
        note=note,
    )
    return txn, sender.balance


@transaction.atomic
def pay_bill(user, biller, account_ref, amount):
    wallet = Wallet.objects.select_for_update().get(user=user)
    if wallet.balance < amount:
        raise _insufficient()

    wallet.balance -= amount
    wallet.save(update_fields=["balance", "updated_at"])
    txn = Transaction.objects.create(
        type=Transaction.Type.BILL_PAYMENT,
        sender=wallet,
        biller=biller,
        account_ref=account_ref,
        amount=amount,
    )
    return txn, wallet.balance