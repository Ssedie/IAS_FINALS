from django.urls import path

from . import views

app_name = "panel"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("users/", views.users, name="users"),
    path("transactions/", views.transactions, name="transactions"),
    path("transactions/export/", views.export_transactions, name="export"),
    path("audit/", views.audit, name="audit"),
]
