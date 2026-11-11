from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view()),
    path("auth/login/", views.LoginView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("me/", views.MeView.as_view()),
    path("billers/", views.BillerListView.as_view()),
    path("transactions/", views.TransactionListView.as_view()),
    path("wallet/cash-in/", views.CashInView.as_view()),
    path("wallet/send/", views.SendMoneyView.as_view()),
    path("wallet/pay-bill/", views.PayBillView.as_view()),
]