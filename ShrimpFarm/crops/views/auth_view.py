import logging

from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from ..serializers.user_serializer import (
    ChangePasswordSerializer,
    EmailOrUsernameTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
    build_password_reset_token,
    build_password_reset_uid,
)

logger = logging.getLogger(__name__)


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        # Always return the same message to avoid account enumeration.
        generic = {
            "detail": (
                "If an account exists for this email, a password reset link has been sent."
            )
        }

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            return Response(generic)

        uid = build_password_reset_uid(user)
        token = build_password_reset_token(user)
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip(
            "/"
        )
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}"

        try:
            send_mail(
                subject="Reset your MinhDungFarm password",
                message=(
                    "You requested a password reset for your MinhDungFarm account.\n\n"
                    f"Open this link to set a new password:\n{reset_link}\n\n"
                    "If you did not request this, you can ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception:
            logger.exception("Failed to send password-reset email to %s", user.email)
        return Response(generic)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password has been updated."})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password has been changed."})


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(APIView):
    """Clear Django session for staff; frontend still clears JWT locally."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"ok": True})


@method_decorator(csrf_exempt, name="dispatch")
class DjangoSessionView(APIView):
    """Create a Django session from a JWT-authenticated staff user (for embedded admin).

    CSRF is exempt because the client authenticates with a Bearer token and has
    no session/CSRF cookie yet when this endpoint is called.
    """

    permission_classes = [IsAdminUser]

    def post(self, request):
        login(
            request,
            request.user,
            backend="django.contrib.auth.backends.ModelBackend",
        )
        return Response({"ok": True})
