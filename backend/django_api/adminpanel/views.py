import csv
from datetime import datetime, time, timedelta
from urllib.parse import urlencode

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate
from django.http import StreamingHttpResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST

from wallet.models import Profile, Transaction, Wallet

from .forms import TransactionFilterForm
from .models import AuditLog

panel_required = staff_member_required(login_url="panel:login")


def query_without_page(request):
    params = request.GET.copy()
    params.pop("page", None)
    return params.urlencode()


def full_name(wallet):
    if wallet is None:
        return ""
    return wallet.user.get_full_name() or wallet.user.username


# ---------------------------------------------------------------- auth

def login_view(request):
    if request.user.is_authenticated and request.user.is_staff:
        return redirect("panel:dashboard")

    next_url = request.POST.get("next") or request.GET.get("next", "")
    error = None

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        user = authenticate(
            request, username=username, password=request.POST.get("password", "")
        )
        if user is not None and user.is_staff:
            login(request, user)
            AuditLog.record(request, "login")
            safe = url_has_allowed_host_and_scheme(
                next_url,
                allowed_hosts={request.get_host()},
                require_https=request.is_secure(),
            )
            return redirect(next_url if next_url and safe else "panel:dashboard")
        AuditLog.record(request, "login_failed", username)
        error = "Wrong username or password, or this account has no admin access."

    return render(request, "adminpanel/login.html", {"error": error, "next": next_url})


@require_POST
@panel_required
def logout_view(request):
    AuditLog.record(request, "logout")
    logout(request)
    return redirect("panel:login")


# ---------------------------------------------------------- dashboard

@panel_required
def dashboard(request):
    today = timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today - timedelta(days=6)

    today_txns = Transaction.objects.filter(created_at__gte=today)
    stats = {
        "users": Profile.objects.count(),
        "balance": Wallet.objects.aggregate(t=Sum("balance"))["t"] or 0,
        "txn_today": today_txns.count(),
        "volume_today": today_txns.aggregate(t=Sum("amount"))["t"] or 0,
    }

    labels = dict(Transaction.Type.choices)
    by_type = [
        {"label": labels.get(r["type"], r["type"]), "n": r["n"], "total": r["total"]}
        for r in Transaction.objects.order_by()
        .values("type")
        .annotate(n=Count("id"), total=Sum("amount"))
        .order_by("type")
    ]

    rows = {
        r["day"]: r
        for r in Transaction.objects.filter(created_at__gte=week_start)
        .order_by()
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(n=Count("id"), volume=Sum("amount"))
    }
    days = []
    for i in range(7):
        d = (week_start + timedelta(days=i)).date()
        r = rows.get(d)
        days.append(
            {
                "label": d.strftime("%a"),
                "n": r["n"] if r else 0,
                "volume": float(r["volume"]) if r else 0.0,
            }
        )
    peak = max(1.0, max(d["volume"] for d in days))
    for d in days:
        d["pct"] = round(d["volume"] / peak * 100)

    recent = Transaction.objects.select_related(
        "sender__user", "receiver__user", "biller"
    ).order_by("-created_at")[:8]

    return render(
        request,
        "adminpanel/dashboard.html",
        {"stats": stats, "by_type": by_type, "days": days, "recent": recent},
    )


# -------------------------------------------------------------- users

@panel_required
def users(request):
    q = request.GET.get("q", "").strip()[:50]
    qs = (
        User.objects.filter(profile__isnull=False, wallet__isnull=False)
        .select_related("profile", "wallet")
        .order_by("-date_joined")
    )
    if q:
        qs = qs.filter(
            Q(profile__mobile_number__icontains=q)
            | Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
        )
    page_obj = Paginator(qs, 15).get_page(request.GET.get("page"))
    return render(
        request,
        "adminpanel/users.html",
        {"page_obj": page_obj, "q": q, "qs": query_without_page(request)},
    )


# ------------------------------------------------------- transactions

def filtered_transactions(request):
    form = TransactionFilterForm(request.GET)
    f = form.cleaned_data if form.is_valid() else {}

    qs = Transaction.objects.select_related("sender__user", "receiver__user", "biller")
    if f.get("type"):
        qs = qs.filter(type=f["type"])
    if f.get("q"):
        qs = qs.filter(reference__icontains=f["q"])
    if f.get("date_from"):
        qs = qs.filter(
            created_at__gte=timezone.make_aware(datetime.combine(f["date_from"], time.min))
        )
    if f.get("date_to"):
        qs = qs.filter(
            created_at__lte=timezone.make_aware(datetime.combine(f["date_to"], time.max))
        )
    return form, qs.order_by("-created_at")


@panel_required
def transactions(request):
    form, qs = filtered_transactions(request)
    page_obj = Paginator(qs, 20).get_page(request.GET.get("page"))
    return render(
        request,
        "adminpanel/transactions.html",
        {"form": form, "page_obj": page_obj, "qs": query_without_page(request)},
    )


class _Echo:
    def write(self, value):
        return value


def _csv_safe(value):
    # Stop spreadsheet apps from running user-supplied text as a formula.
    if isinstance(value, str) and value[:1] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + value
    return value


@panel_required
def export_transactions(request):
    _, qs = filtered_transactions(request)
    qs = qs[:5000]

    used = {
        k: request.GET[k]
        for k in ("type", "q", "date_from", "date_to")
        if request.GET.get(k)
    }
    AuditLog.record(request, "export_csv", urlencode(used))

    def stream():
        writer = csv.writer(_Echo())
        yield "\ufeff"
        yield writer.writerow(
            ["Reference", "Type", "Sender", "Receiver", "Biller",
             "Amount", "Fee", "Note", "Date (Manila)"]
        )
        for t in qs.iterator(chunk_size=500):
            yield writer.writerow(
                [
                    t.reference,
                    t.type,
                    _csv_safe(full_name(t.sender)),
                    _csv_safe(full_name(t.receiver)),
                    _csv_safe(t.biller.name if t.biller else ""),
                    t.amount,
                    t.fee,
                    _csv_safe(t.note),
                    timezone.localtime(t.created_at).strftime("%Y-%m-%d %H:%M:%S"),
                ]
            )

    stamp = timezone.localtime().strftime("%Y%m%d-%H%M%S")
    response = StreamingHttpResponse(stream(), content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="transactions-{stamp}.csv"'
    return response


# -------------------------------------------------------------- audit

@panel_required
def audit(request):
    qs = AuditLog.objects.select_related("user")
    page_obj = Paginator(qs, 20).get_page(request.GET.get("page"))
    return render(
        request,
        "adminpanel/audit.html",
        {"page_obj": page_obj, "qs": query_without_page(request)},
    )
