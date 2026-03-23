# blog/backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Check if the user exists by matching the exact username OR the exact email
            user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
            
            # If the user exists, check if the password is correct
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            # No user was found with that username or email
            return None
