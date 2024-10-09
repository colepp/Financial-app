from django.urls import path
from . import views
# import the path function for linking the view to the path
# import the views for the path function


# url patterns for signup page

# NOTE add success and fail pages?
urlpatterns = [
    path("",views.signup,name='signup')
]
