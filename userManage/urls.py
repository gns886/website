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
    path('main/eventView/<int:pk>/<order>',views.EventViewView, name='eventView'),
    #path('main/user/',views.UserView, name='user'),
    path('main/changepwd/',views.ChangePWDView,name='changePWD'),
    path('logout/',views.LogoutView, name='logout'),
    path('main/assign/',views.AssignView, name='assign'),
    path('main/useredit/',views.UserEditView, name='useredit'),
    path('main/changemodule/',views.ChangeModuleView, name='changemodule'),
    path('main/addevent/',views.AddEventView,name='addevent'),
    path('main/<int:pk>/detailevent/',views.DetailEventView,name='detailevent'),
    path('main/changemodule/deletemodule/<int:pk>',views.DeleteModule,name='deletemodule'),
    path('main/assign/deleteworker/<int:pk>',views.DeleteWorker,name='deleteworker'),
    path('main/changemodule/editmodule/<int:pk>',views.EditModuleView,name='editmodule'),
    path('main/test',views.TestView,name='test'),
    #path('main/testevent/testresult',views.TestResultView,name='testresult'),
    #path('main/dealevent/dealresult',views.DealResultView,name='dealresult'),
    #path('main/testevent',views.TestEventView,name='testevent'),
    #path('main/dealevent',views.DealEventView,name='dealevent'),
    path('main/myevent/<int:pk>/view/<order>',views.MyEventView,name='myevent'),
    path('main/myevent/<int:pk>/inspect', views.InspectEventView, name='inspectevent'),
    path('main/myevent/<int:pk>/operate', views.OperateEventView, name='operateevent'),
    path('main/myevent/<int:pk>/<method>',views.EventHandlers,name='eventhandlers'),
    path('main/userinfo',views.UserInfoView,name='userinfo')
#    path('')
]