from django.contrib import admin
from .models import User, Profile, Category, Tag, Post, Comment, Like, Bookmark

admin.site.register(User)
admin.site.register(Profile)
admin.site.register(Tag)
admin.site.register(Like)
admin.site.register(Bookmark)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)} 

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'created_at', 'view_count')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('title', 'content', 'author__username')
    prepopulated_fields = {'slug': ('title',)} 
    date_hierarchy = 'created_at' 

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('content', 'user__username')
    actions = ['approve_comments']

    
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = "Approve selected comments"