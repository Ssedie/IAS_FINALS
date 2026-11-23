from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """Append-only record of admin panel activity. Rows are never edited or deleted."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=50)
    details = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-id"]

    @classmethod
    def record(cls, request, action, details=""):
        user = request.user if request.user.is_authenticated else None
        return cls.objects.create(
            user=user,
            action=action,
            details=(details or "")[:255],
            ip_address=request.META.get("REMOTE_ADDR") or None,
        )

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValueError("Audit logs are immutable and cannot be edited.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("Audit logs are immutable and cannot be deleted.")

    def __str__(self):
        return f"{self.created_at:%Y-%m-%d %H:%M} {self.action}"
