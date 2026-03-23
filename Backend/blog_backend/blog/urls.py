from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import *        

router = DefaultRouter()

router.register('users', UserViewSet)
router.register('profiles', ProfileViewSet)
router.register('categories', CategoryViewSet)
router.register('tags', TagViewSet)
router.register('posts', PostViewSet, basename='post')
router.register('comments', CommentViewSet)
router.register('likes', LikeViewSet)
router.register('bookmarks', BookmarkViewSet)

urlpatterns = [
    
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
   
]

urlpatterns += router.urls
