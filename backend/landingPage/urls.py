from django.urls import path
from . import views
# import the path function for linking the view to the path
# import the views for the path function

# NOTE should add another page for login succes and login semi-succes(as in no attached bank account)
urlpatterns = [
    path("",views.index,name='index')
]
