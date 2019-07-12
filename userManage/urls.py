from django.urls import path

from . import views
app_name = 'userManage'
urlpatterns = [
    path('', views.IndexView, name='index'),
    #path('register/', views.RegisterView, name='register'),
    path('login/', views.LoginView, name='login'),
    path('left/',views.LeftView, name='left'),
    path('main/',views.MainView, name='main'),
    path('head/',views.HeadView, name='head'),
    #path('head2/',views.Head2View, name='head2'),
    path('main/eventView/',views.EventViewView, name='eventView'),
    #path('main/user/',views.UserView, name='user'),
    path('main/changepwd/',views.ChangePWDView,name='changePWD'),
    path('logout/',views.LogoutView, name='logout'),
    path('test/',views.TestView, name='test'),
    path('main/assign/',views.AssignView, name='assign'),
    path('main/useredit/',views.UserEditView, name='useredit'),
    path('main/changemodule/',views.ChangeModuleView, name='changemodule'),
    path('main/addevent/',views.AddEventView,name='addevent'),
#    path('')
]