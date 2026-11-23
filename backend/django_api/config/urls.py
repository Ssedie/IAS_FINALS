from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(request):
    return JsonResponse({"service": "django", "status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("panel/", include("adminpanel.urls")),
    path("api/health/", health),
    path("api/", include("wallet.urls")),
]
