from django.contrib import admin
from django.contrib.auth.models import User

from .models import Biller, Profile, Wallet


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    fields = ("mobile_number", "job_title", "address", "gender")


class WalletInline(admin.StackedInline):
    model = Wallet
    can_delete = False
    readonly_fields = ("balance", "updated_at")


class UserAdmin(admin.ModelAdmin):
    inlines = [ProfileInline, WalletInline]
    list_display = ("username", "first_name", "last_name", "email", "job_title", "gender", "is_staff", "is_active")
    list_select_related = ("profile",)
    search_fields = ("username", "first_name", "last_name", "email", "profile__mobile_number")

    @admin.display(description="Job title")
    def job_title(self, obj):
        return obj.profile.get_job_title_display() if getattr(obj.profile, "job_title", "") else ""

    @admin.display(description="Gender")
    def gender(self, obj):
        return obj.profile.get_gender_display() if getattr(obj.profile, "gender", "") else ""


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Biller)
