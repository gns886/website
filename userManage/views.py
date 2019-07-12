from django.shortcuts import render

# Create your views here.
from django.shortcuts import render,get_object_or_404,redirect
from django.template import loader
from django.http import HttpResponse,HttpResponseRedirect
from django.urls import reverse
from django.views import generic,View
from .models import Users,Module,Event
#import json
from django.contrib import messages




# Create your views here.
class Cache:
    username = '1'
    password = '1'
    authority = 0                     #0:游客  1：管理员  2：员工
    page = 0

def TestView(request):
    return HttpResponse(Cache.authority)

def LeftView(request):
    authority = Cache.authority
    print(authority)
    return render(request, 'userManage/left.html', {'admin_authority': authority,
                                                    'authority': authority})
    #if authority==1:
    #    return render(request,'userManage/left.html',{'admin_authority' : authority,
    #                                                 'authority' : authority})
    #elif authority==0:
    #    return render(request,'userManage/left.html',)

    #elif authority==2:
    #    return render(request,'userManage/left.html',{'authority' : authority})

def MainView(request):
    return render(request,'userManage/main.html',{'authority' : Cache.authority})



def IndexView(request):
        #return render(request, 'login/login.html',)
        print(request.method)
        #return render(request,'userManage/login.html',)
        return render(request, 'userManage/index.html', {'status' : Cache.authority,
                                                         'authority' : Cache.authority})

def LoginView(request):
    print(request.method)
    Cache.authority = 0
    if request.method=='GET':
        return render(request,'userManage/login.html')
    elif request.method=='POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        err_msg = 'success'
        if not username:
            err_msg = "请输入用户名"
        elif not password:
            err_msg = "请输入密码"
        else:

            user = Users.objects.filter(username=username)
            if not user.exists():
                err_msg = "用户不存在或密码错误"
            elif not (password==user[0].password):
                err_msg = "用户不存在或密码错误"
            else:                                   #登陆成功
                authority = user[0].authority
                print(username)
                print(password)
                print(authority)
                Cache.password = password
                Cache.username = username
                Cache.authority = authority
                #return render(request,'userManage/index.html',{'status' : 1,
                #                                               'username' : username,
                #                                               'authority' : authority,})
                return redirect('../')
        return render(request,'userManage/login.html',{'err_msg' : err_msg})

def EventViewView(request):
    if request.method == 'GET':
        message_from = Cache.page*10+1
        page = Cache.page
        event_list = Event.objects.all()
        if event_list.__len__() > (message_from+9):
            message_to = message_from + 9
        else:
            message_to = event_list.__len__()
        event_cut = event_list[message_from:message_to]
    else:
        message_from = Cache.page * 10 + 1
        page = Cache.page
        event_list = Event.objects.all()
        if event_list.__len__() > (message_from + 9):
            message_to = message_from + 9
        else:
            message_to = event_list.__len__()
        event_cut = event_list[message_from:message_to]

    return render(request, 'userManage/eventView.html', {'event_list': event_cut,
                                                         'message_from' : message_from,
                                                         'message_to' : message_to,
                                                         'page' : page,
                                                         'message_all' : event_list.__len__()})

def HeadView(request):
    if request.method == 'GET':
        if Cache.authority:
            return render(request,'userManage/head.html',{'name' : Cache.username,
                                                      'authority' : Cache.authority,})
        else:
            return render(request,'userManage/head2.html')

def LogoutView(request):
    Cache.authority = 0
    return redirect(reverse('userManage:index'))

#def UserView(request):
#    return render(request,'userManage/user.html')

def UserEditView(request):
    if request.method == 'GET':
        print('开始修改')
        return render(request,'userManage/useredit.html')
    else:
        print('点击了',request.POST.get('submit'))
        if request.POST.get('submit')=='提交':
            name = request.POST.get('name')
            E_mail = request.POST.get('E_mail')
            note = request.POST.get('note')
            tel_number = request.POST.get('tel_number')
            user = Users.objects.get(username = Cache.username)
            user.name = name
            user.E_mail = E_mail
            user.tel_number = tel_number
            user.note = note
            user.save()
        else:
            print('点击了取消')
        #return redirect('../')
        return HttpResponse('?')

def ChangePWDView(request):

    print('密码为：')
    print(Cache.password)
    if request.method == "POST":
        password = request.POST.get('password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        if (not password) or (not new_password) or (not confirm_password):
            err_msg = '输入信息不能为空'
        else:
            if not(password == Cache.password):
                err_msg = '密码错误'
                print(Cache.password)
                print(password)
                print(confirm_password)
                print(new_password)
            elif not(new_password == confirm_password):
                err_msg = '两次密码不同'
            elif new_password == Cache.password:
                err_msg = '新密码与旧密码重复'
            else:                                #成功
                user = Users.objects.get(username = Cache.username)
                user.password = new_password
                user.save()
                return render(request, 'userManage/main.html',)
        return render(request,'userManage/changepwd.html',{'err_msg' : err_msg})
    else:
        return render(request,'userManage/changepwd.html')

def AssignView(request):
    if request.method == 'GET':
        user_list = Users.objects.all()
        return render(request,'userManage/assign.html',{'user_list' : user_list})
    if request.method == 'POST':
        user_name = request.POST.get('username')
        user_password = request.POST.get('password')
        user = Users(username = user_name,password=user_password,authority=2)
        user.save()
        user_list = Users.objects.all()
        return render(request,'userManage/assign.html',{'user_list' : user_list})

def AddEventView(request):
    module_list = Module.objects.all()
    worker_list = Users.objects.filter(authority=2)
    return render(request,'userManage/addevent.html',{'module_list' :module_list,
                                                      'worker_list' :worker_list})

def ChangeModuleView(request):

    if request.method == 'GET':
        module_list = Module.objects.all()
        return render(request, 'userManage/changemodule.html', {'module_list' : module_list})
    else:
        name = request.POST.get('modulename')
        if not name:
            return render(request,'userManage/changemodule.html',{'err_msg' : '请输入模块名'})
        module = Module(name=name)
        module.save()
        module_list = Module.objects.all()
        return render(request, 'userManage/changemodule.html', {'module_list': module_list})
    #return HttpResponse('?')