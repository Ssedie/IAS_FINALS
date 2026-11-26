from django.urls import path

from . import views

app_name = "panel"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("users/", views.users, name="users"),
    path("users/export.csv", views.export_users_csv, name="export_users_csv"),
    path("users/export.xlsx", views.export_users_xlsx, name="export_users_xlsx"),
    path("transactions/", views.transactions, name="transactions"),
    path("transactions/export/", views.export_transactions, name="export"),
    path("transactions/export.xlsx", views.export_transactions_xlsx, name="export_xlsx"),
    path("audit/", views.audit, name="audit"),
]
