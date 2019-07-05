from django.shortcuts import render,get_object_or_404,redirect
from django.template import loader
from django.http import HttpResponse,HttpResponseRedirect
from django.urls import reverse
from django.views import generic,View
from .models import Users
#import json
from django.contrib import messages




# Create your views here.
def RegisterAction(request):
    print(request.POST["username"])
    print(request.POST["login_password"])
    print(request.POST["confirm_password"])
    print(Users.objects.filter(username_text=request.POST["username"]).count())
    print(Users.objects.filter(username_text=request.POST["username"]).exists())
    if not request.POST["username"].strip():
        context = '用户名不能为空'
    elif not request.POST["login_password"].strip():
        context = '密码不能为空'
    elif not request.POST["confirm_password"].strip():
        context = '验证密码不能为空'
    elif request.POST["login_password"] != request.POST['confirm_password']:
        context = '验证密码与密码不符'
    elif Users.objects.filter(username_text=request.POST["username"]).count()!=0:
        context = '用户名重复'
    else:
        Users.objects.create(username_text=request.POST["username"],
                             password_text=request.POST["login_password"],
                             authority_int=1)
        return(1)
    messages.success(request, context)
    return(0)

def RegisterView(request):
    if (request.method == "POST"):
        if request.POST["submit"] == "取消":
            return redirect('../')
        if request.POST["submit"] == "同意以上协议并注册":
            if RegisterAction(request):
                return redirect('../login')
            else: return render(request,'login/register.html',)
        return HttpResponse("错误")
    else:
        return render(request,'login/register.html',)


def IndexView(request):
    if (request.method == "POST"):
        print("haha")
        if request.POST["submit"] == "登录":
            #return render(request, 'login/login.html', )  # 'main/index.html'
            return redirect('login/')
        else:
            return redirect('register/')
    else:
        #return render(request, 'login/login.html',)
        print(request.method)
        return render(request,'login/index.html',)

def LoginView(request):
    if (request.method == "POST"):
        print("haha")
        if request.POST['submit'] == "返回" :
            print('?')
            redirect('../')
        else:
            print('hoho')
            film=Users.objects.filter(username_text=request.POST["username"],
                                      password_text=request.POST["password1"])
            if film.exists():
                return HttpResponse("进入主页面")
            else:
                messages.success(request, "用户不存在或密码错误")
                return render(request, 'login/login.html',)
    else:
        print(request.method)
        return render(request, 'login/login.html',)
        #return HttpResponse(request.method)
