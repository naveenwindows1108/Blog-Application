from django.db.models import Q
from .serializers import LikeSerializer, BookmarkSerializer
from .models import Like, Bookmark
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAuthenticatedOrReadOnly,
)
from .serializers import CommentSerializer
from .models import Comment
from rest_framework.response import Response
from rest_framework.decorators import action
from .permissions import IsOwnerOrReadOnly
from .serializers import PostSerializer, PostCreateUpdateSerializer
from .models import Post
from .serializers import CategorySerializer, TagSerializer
from .models import Category, Tag
from rest_framework import generics, viewsets, filters
from .serializers import RegisterSerializer
from .models import User, Profile
from .serializers import UserSerializer, ProfileSerializer
import uuid
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().select_related("profile")
    serializer_class = UserSerializer
    permission_classes = []

    @action(
        detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated]
    )
    def me(self, request):
        user = request.user

        if request.method == "GET":
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        elif request.method == "PATCH":
            serializer = self.get_serializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all().select_related("user")
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(
        detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated]
    )
    def me(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)

        if request.method == "GET":
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        elif request.method == "PATCH":
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Cache categories for 1 hour (3600 seconds) - rarely change
        response["Cache-Control"] = "public, max-age=3600"
        return response


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Cache tags for 1 hour (3600 seconds) - rarely change
        response["Cache-Control"] = "public, max-age=3600"
        return response


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = [
        "title",
        "content",
        "author__username",
        "category__name",
        "tags__name",
    ]

    def get_queryset(self):
        queryset = Post.objects.select_related("author", "category").prefetch_related(
            "tags", "comments__replies", "likes"
        )
        return queryset

    def list(self, request, *args, **kwargs):
        # Cache list view for 5 minutes (300 seconds)
        response = super().list(request, *args, **kwargs)
        response["Cache-Control"] = "public, max-age=300"
        response["ETag"] = None  # Remove ETag to benefit from Cache-Control
        return response

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return PostCreateUpdateSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=["view_count"])
        serializer = self.get_serializer(instance)
        response = Response(serializer.data)
        # Cache single post for 1 minute
        response["Cache-Control"] = "public, max-age=60"
        return response

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user

        like = post.likes.filter(user=user).first()

        if like:
            like.delete()
            return Response({"message": "Unliked"}, status=200)
        else:
            post.likes.create(user=user)
            return Response({"message": "Liked"}, status=201)

    @action(detail=True, methods=["post"])
    def bookmark(self, request, pk=None):
        post = self.get_object()
        user = request.user

        bookmark = post.bookmark_set.filter(user=user).first()

        if bookmark:
            bookmark.delete()
            return Response({"message": "Removed Bookmark"}, status=200)
        else:
            post.bookmark_set.create(user=user)
            return Response({"message": "Bookmarked"}, status=201)

    @action(detail=True, methods=["get"])
    def related(self, request, pk=None):
        post = self.get_object()

        query = Q()
        if post.category:
            query |= Q(category=post.category)
        if post.tags.exists():
            query |= Q(tags__in=post.tags.all())

        if not query:
            related_posts = (
                self.get_queryset().exclude(id=post.id).order_by("-created_at")[:3]
            )
        else:
            related_posts = (
                self.get_queryset()
                .filter(query)
                .exclude(id=post.id)
                .distinct()
                .order_by("-created_at")[:3]
            )

        serializer = self.get_serializer(related_posts, many=True)
        response = Response(serializer.data)
        # Cache related posts for 10 minutes
        response["Cache-Control"] = "public, max-age=600"
        return response


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related("user", "post").prefetch_related(
        "replies"
    )
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")

        try:
            CLIENT_ID = "675906039706-rp4m2ik88vkuu905dqhg9ijto7f47apk.apps.googleusercontent.com"
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

            email = idinfo["email"]
            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")
            google_avatar_url = idinfo.get("picture", "")

            user = User.objects.filter(email=email).first()
            is_new_user = False

            if not user:
                is_new_user = True

                base_username = email.split("@")[0]
                username = base_username
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{uuid.uuid4().hex[:4]}"

                user = User(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                )

                user.set_unusable_password()
                user.save()

                Profile.objects.create(user=user)

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "username": user.username,
                    "is_new_user": is_new_user,
                    "avatar": google_avatar_url,
                }
            )

        except ValueError:
            return Response({"error": "Invalid Google token"}, status=400)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "status": "ok",
                "message": "Server is running",
                "timestamp": str(
                    __import__("datetime").datetime.now(
                        __import__("datetime").timezone.utc
                    )
                ),
            },
            status=200,
        )
