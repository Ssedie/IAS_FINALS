from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from . import services
from .models import Biller, Transaction
from .serializers import (
    BillerSerializer, CashInSerializer, PayBillSerializer,
    RegisterSerializer, SendMoneySerializer, TransactionSerializer,
)


class AuthThrottle(AnonRateThrottle):
    scope = "auth"
    rate = "10/min"


class MoneyThrottle(UserRateThrottle):
    scope = "money"
    rate = "20/min"


def verify_pin(user, pin):
    if not user.profile.check_pin(pin):
        raise PermissionDenied("Incorrect PIN.")


def money_response(request, txn, balance):
    data = TransactionSerializer(txn, context={"wallet": request.user.wallet}).data
    return Response({"transaction": data, "balance": balance}, status=status.HTTP_201_CREATED)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {"access": str(refresh.access_token), "refresh": str(refresh)},
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    throttle_classes = [AuthThrottle]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "mobile_number": user.profile.mobile_number,
            "balance": user.wallet.balance,
        })


class BillerListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BillerSerializer
    queryset = Biller.objects.filter(is_active=True).order_by("name")
    pagination_class = None


class TransactionListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    pagination_class = None

    def get_queryset(self):
        wallet = self.request.user.wallet
        return (
            Transaction.objects.filter(sender=wallet) | Transaction.objects.filter(receiver=wallet)
        ).select_related("sender__user", "receiver__user", "biller").order_by("-created_at")[:50]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["wallet"] = self.request.user.wallet
        return context


class CashInView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [MoneyThrottle]

    def post(self, request):
        serializer = CashInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        txn, balance = services.cash_in(request.user, serializer.validated_data["amount"])
        return money_response(request, txn, balance)


class SendMoneyView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [MoneyThrottle]

    def post(self, request):
        serializer = SendMoneySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        verify_pin(request.user, data["pin"])
        txn, balance = services.send_money(
            request.user, data["mobile_number"], data["amount"], data["note"]
        )
        return money_response(request, txn, balance)


class PayBillView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [MoneyThrottle]

    def post(self, request):
        serializer = PayBillSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        verify_pin(request.user, data["pin"])
        txn, balance = services.pay_bill(
            request.user, data["biller"], data["account_ref"], data["amount"]
        )
        return money_response(request, txn, balance)