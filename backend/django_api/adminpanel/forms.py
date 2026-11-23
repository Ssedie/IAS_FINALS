from django import forms

from wallet.models import Transaction


class TransactionFilterForm(forms.Form):
    type = forms.ChoiceField(
        required=False, choices=[("", "All types"), *Transaction.Type.choices]
    )
    q = forms.CharField(required=False, max_length=50)
    date_from = forms.DateField(required=False)
    date_to = forms.DateField(required=False)
