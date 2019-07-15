from django.shortcuts import render
from django.contrib import messages
from django.db.models import Q
from django.shortcuts import render,get_object_or_404,redirect
from django.template import loader
from django.http import HttpResponse
from django.urls import reverse
from .models import Users,Module,Event,UnassignedEvent,SolvedEvent,CurrentEvent
from django.utils import timezone
import re
import math
# Create your views here.

#import json
from django.contrib import messages




# Create your views here.
class Cache:
    user = Users(username='custom',password='custom',authority=0)
    username = '1'
    password = '1'
    authority = 0                     #0:游客  1：管理员  2：员工


def TestView(request):
    return HttpResponse(Cache.authority)  #TODO 可以删



def LeftView(request):
    '''
    左边frame
    :param request:
    :return: {'authority':用户权限}
    '''
    authority = Cache.authority
    print(authority)
    return render(request, 'userManage/left.html', {'authority': authority})


def HeadView(request):
    '''
    顶部frame
    :param request:
    :return:
    '''
    if request.method == 'GET':
        if Cache.authority:
            return render(request, 'userManage/head.html', {'name': Cache.username,
                                                            'authority': Cache.authority, })
        else:
            return render(request, 'userManage/head2.html')

def MainView(request):
    return render(request,'userManage/main.html',{'authority' : Cache.authority})

def IndexView(request):
    '''
    主界面
    :param request:
    :return: {'authority' : 用户权限}
    '''
    print(request.method)
    return render(request, 'userManage/index.html', {'status' : Cache.authority,
                                                         'authority' : Cache.authority})

def LoginView(request):
    '''
    登录界面
    :param request:{'username' : 用户名
                    'password' :密码}
    :return: {'err_msg' : 错误信息  null=True}
    '''
    print(request.method)
    Cache.authority = 0
    if request.method=='GET':
        return render(request,'userManage/login.html')
    elif request.method=='POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
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
                Cache.user = user[0]
                Cache.password = password
                Cache.username = username
                Cache.authority = authority
                #return render(request,'userManage/index.html',{'status' : 1,
                #                                               'username' : username,
                #                                               'authority' : authority,})
                return redirect('userManage:index')
        return render(request,'userManage/login.html',{'err_msg' : err_msg})

def MakeCut(page,message_all):
    '''
    做分页切片
    :param page: 接受到的理论显示页数
    :param message_all: 一共多少条信息
    :return:      {'page':实际显示页数
                  'message_from':本页从哪里开始
                  'message_to'：本页到哪里结束
                  'page_from':下面框从哪里开始显示}
    '''
    capacity = 10            #一页能放多少消息
    page_capacity = 9       #下面能显示多少页
    if page < 1:page = 1
    if page > (message_all) / capacity:
        page = math.ceil(message_all / capacity)
    if page * capacity < message_all:
        message_to = page * capacity
    else:
        message_to = message_all
    if message_all == 0:
        page = 1
    message_from = (page-1)*capacity
    page_from = 1 #TODO
    result = {'page' : page,
              'message_from' : message_from,
              'message_to' : message_to,
              'page_from' : page_from}
    return result

def EventViewView(request,pk,order):
    '''
    事件查看
    :param request:
    :param pk:理论页数
    :param order:排序依据
    :return: {'event_list' : 切片后的事件列表
              'message_from' : 本页从哪里显示
              'message_to' : 本页显示到哪里
              'page' : 当前实际页数
              'massage_all' : 一共多少信息
              'err_msg' : 错误信息}
    '''
    if request.method == 'GET':
        event_list = Event.objects.order_by(order)
        message_all = event_list.__len__()
        var = MakeCut(pk, message_all)
        message_from = var['message_from']
        message_to = var['message_to']
        page = var['page']
        if event_list:
            event_cut = event_list[message_from:message_to]
        else: event_cut = event_list
    else:
        return HttpResponse('error')
    return render(request, 'userManage/eventView.html', {'event_list': event_cut,
                                                         'message_from' : message_from+1,
                                                         'message_to' : message_to,
                                                         'page' : page,
                                                         'message_all' : message_all,
                                                         'order' : order})
def MyEventView(request,pk,order):
    '''
    我的事件
    :param request:
    :param pk:理论页数
    :param order:排序依据
    :return:{'event_list' : 切片后的事件列表
              'message_from' : 本页从哪里显示
              'message_to' : 本页显示到哪里
              'page' : 当前实际页数
              'massage_all' : 一共多少信息}
    '''
    if request.method == 'GET':
        print('order_by:'+order)
        event_list = Event.objects.filter(Q(state=0,operator=Cache.user)|Q(state=1,module=Cache.user.module))
        event_list = event_list.order_by(order)
        message_all = event_list.__len__()
        var = MakeCut(pk, message_all)
        message_from = var['message_from']
        message_to = var['message_to']
        page = var['page']
        if event_list:
            event_cut = event_list[message_from:message_to]
        else:
            event_cut = event_list
        return render(request,'userManage/myevent.html',{'event_list' : event_cut,
                                                         'message_from' : message_from+1,
                                                         'message_to' : message_to,
                                                         'page' : page,
                                                         'message_all' : message_all,
                                                         'order' : order})
    else: return HttpResponse('error')



def LogoutView(request):
    '''
    登录界面
    :param request: 
    :return: 
    '''
    #TODO
    Cache.authority = 0
    return redirect('userManage:index')

def UserEditView(request):
    '''
    修改信息
    :param request:{'submit' : '取消'  or '提交'
                    'name' : 姓名
                    'E_mail' :  邮箱
                    'note' :  个人简介
                    'tel_number' : 电话号码
                    'module' : 负责模块}
    :return:{'module_list' : 模块列表
             'name' : 用户姓名
             'sex' : 性别
             'tel_number' : 电话
             'E_mail' : 邮箱
             'note' : 用户简介
             'module' : 所属模块}
    '''
    if request.method == 'GET':
        print('开始修改')
        module_list = Module.objects.all()
        user = Cache.user
        return render(request,'userManage/useredit.html',{'module_list' : module_list,
                                                          'name' : user.name,
                                                          'sex' : user.sex,
                                                          'tel_number' : user.tel_number,
                                                          'E_mail' : user.E_mail,
                                                          'note' : user.note,
                                                          'module' : user.module})
    elif request.method == 'POST':
        print('点击了',request.POST.get('submit'))
        if request.POST.get('submit')=='提交':
            user = Cache.user  # TODO
            user.name = request.POST.get('name')
            user.E_mail = request.POST.get('E_mail')
            user.note = request.POST.get('note')
            user.tel_number = request.POST.get('tel_number')
            module_name = request.POST.get('module')
            if not user.name:
                err_msg = '请填写姓名'
                module_list = Module.objects.all()
                return render(request,'userManage/useredit.html',{'module_list' : module_list,
                                                          'name' : user.name,
                                                          'sex' : user.sex,
                                                          'tel_number' : user.tel_number,
                                                          'E_mail' : user.E_mail,
                                                          'module' : user.module,
                                                          'note' : user.note,
                                                          'err_msg' : err_msg})
            else:
                user.module = Module.objects.get(name = module_name)
                user.sex = request.POST.get('sex')
                user.save()
                return redirect('userManage:main')
        else:
            print('点击了取消')
    else: return HttpResponse('?')

def ChangePWDView(request):
    '''
    修改密码
    :param request: {'password' : 原密码
                     'new_password' : 新密码
                     'confrim_password' : 确认新密码}
    :return: {'err_msg' : 错误消息  null = True
              'username' : 工号
              'name' : 姓名}
    '''
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
                user = Users.objects.get(username = Cache.user.username)        #TODO
                user.password = new_password
                user.save()
                return render(request, 'userManage/main.html',)
        return render(request,'userManage/changepwd.html',{'err_msg' : err_msg,
                                                           'username' : Cache.username,
                                                           'name' : Cache.user.name})
    else:
        return render(request,'userManage/changepwd.html',{'username' : Cache.user.username,
                                                           'name' : Cache.user.name})

def OperateEventView(request,pk):
    '''
    操作员处理事件
    :param request: {'note' : 处理结果}
    :param pk: 事件id
    :return: {'event' : 事件}
    '''
    if request.method == 'GET':
        event = Event.objects.get(id = pk)
        return render(request,'userManage/operateevent.html',{'event' : event})
    elif request.method =='POST':
        if request.POST.get('submit') == '提交':
            note = request.POST.get('note')
            event = Event.objects.get(id = pk)
            event.deal_info = note
            event.deal_date = timezone.now()
            event.state = 1
            event.detail_state = '待测试'
            event.save()
            return redirect('userManage:myevent', 1,id)
        elif request.POST.get('submit') == '返回':
            return redirect('userManage:myevent',1,'id')
        else: return HttpResponse('error')
    else: return HttpResponse('error')

def InspectEventView(request,pk):
    '''
    审核员审核事件
    :param request: {'submit' : '提交' or '返回'
                     'result' : 测试结果
                     'note' : 测试报告}
    :param pk: 事件id
    :return:
    '''
    if request.method == 'GET':
        event = Event.objects.get(id = pk)
        return render(request,'userManage/inspectevent.html',{'event' : event})
    elif request.method == 'POST':
        if request.POST.get('submit') == '提交':
            note = request.POST.get('note')
            event = Event.objects.get(id = pk)
            event.inspector = Cache.user
            event.test_info = note
            event.deal_date = timezone.now()
            if request.POST.get('result') == 'REFUSE':
                event.result = '没通过测试'
                event.state = 1
                event.detail_state = '待处理'
            elif request.POST.get('result') == 'PASS':
                event.result = '通过测试'
                currentEvent = CurrentEvent.objects.get(event = event)
                solvedEvent = SolvedEvent(event = event,foreign_id=event.id)
                currentEvent.delete()
                solvedEvent.save()
                event.state = 2
                event.detail_state = '已完成'
            else: return render(request,'userManage/inspectevent.html',{'event' : event,
                                                                        'err_msg' : '请选择测试结果'})
            event.save()
            return redirect('userManage:myevent',1,'id')
        elif request.POST.get('submit') == '返回':
            return redirect('userManage:myevent',1,'id')
        else: return HttpResponse('error')
    else: return HttpResponse('error')

def EventHandlers(request,pk,method):
    '''
    事件处理中转站
    :param request:
    :param pk: 事件id
    :param method: 处理方法  'receive' : 接受任务
                            'confirm_Y': 确认是缺陷
                            'confirm_N': 确认不是缺陷
                            'deal' : 处理事件
                            'check' : 测试事件
    :return:
    '''
    print(pk)
    print(method)
    if method == 'receive':
        print(method)
        event = Event.objects.get(id = pk)
        event.detail_state = '待确认'
        event.deal_date = timezone.now()
        event.save()
        return redirect('userManage:myevent',1,'id')
    elif method == 'confirm_Y':
        event = Event.objects.get(id = pk)
        event.detail_state = '待处理'
        event.judge= '是缺陷'
        event.deal_date = timezone.now()
        event.save()
        return redirect('userManage:myevent',1,'id')
    elif method == 'confirm_N':
        event = Event.objects.get(id = pk)
        event.state = 1
        event.detail_state = '待测试'
        event.judge = '不是缺陷'
        event.deal_date = timezone.now()
        event.save()
        return redirect('userManage:myevent',1,'id')
    elif method == 'deal':
        return redirect('userManage:operateevent',pk)
    elif method == 'check':
        return redirect('userManage:inspectevent',pk)
    else:
        print('not found')
        return redirect('userManage:myevent',1,'id')

def UserInfoView(request):
    '''
    用户信息界面
    :param request:
    :return: {'user' : 用户}
    '''
    return render(request,'userManage/userinfo.html',{'user' : Cache.user})

def AssignView(request):
    '''
    人事调度
    :param request: {'username' : 新建用户名
                     'password' : 新用户密码}
    :return: {'user_list' : 用户列表（没分页）}
    '''
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
    '''
    新建事件
    :param request: {'submit' : '提交' or '重置'
                     'name' : 事件名
                     'module' : 所属模块
                     'priority' : 优先级
                     'worker' : 分配操作员
                     'note' : 事件简述}
    :return: {'worker_list' 用户列表:
              'module_list' 模块列表:
              'err_msg' : 错误信息 Null = true}
    '''
    module_list = Module.objects.all()
    worker_list = Users.objects.filter(authority=2)
    if request.method=='GET':
        return render(request,'userManage/addevent.html',{'module_list' :module_list,
                                                          'worker_list' :worker_list})
    else:
        print (request.POST.get('submit'))
        if request.POST.get('submit') == '提交':
            event_name = request.POST.get('name')
            priority = request.POST.get('priority')
            module_name = request.POST.get('module')
            worker_info = request.POST.get('worker')
            note = request.POST.get('note')
            if not event_name:
                err_msg = '事件名不能为空'
            if not module_name:
                err_msg = '模块名不能为空'
            elif not priority:
                err_msg = '优先级不能为空'
            elif not worker_info:
                err_msg = '处理人员不能为空'
            else:
                print('读到的内容：')
                print(worker_info)
                worker_member = re.findall(r'[(](.*?)[)]', worker_info)[0]
                print('提取的内容：')
                print(worker_member)
                users = Users.objects.all()
                print('我们有:')
                for user in users:
                    print(user.username)
                pub_date = timezone.now()
                deal_date = timezone.now()
                module = Module.objects.get(name=module_name)
                worker = Users.objects.get(username=worker_member)
                worker_name = worker.name
                event = Event(name_text=event_name,
                              priority=priority,
                              operator_name=worker_name,
                              module=module,
                              operator = worker,
                              pub_date=pub_date,
                              deal_date=deal_date,
                              state=0,
                              detail_state='待接受',
                              judge='',
                              result='',
                              note=note)
                event.save()
                currentevent = CurrentEvent(event=event,foreign_id=event.id)
                currentevent.save()
                return redirect('../')
            return render(request, 'userManage/addevent.html', {'module_list': module_list,
                                                                    'worker_list': worker_list,
                                                                    'err_msg' : '找不到模块'})
        elif request.POST.get('submit') == '重置':
            return render(request, 'userManage/addevent.html', {'module_list': module_list,
                                                                'worker_list': worker_list})
        else:
            return HttpResponse('Error')


def ChangeModuleView(request):
    '''
    模块管理
    :param request:{'modulename' : 新的模块名}
    :return:{'module_list' : 模块列表
             'err_msg' : 错误信息  Null = True}
    '''
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



def DeleteWorker(reqeust,pk):
    '''
    删除用户
    :param reqeust:
    :param pk: 用户ID
    :return:
    '''
    user = Users.objects.get(id = pk)
    if (user.authority == 2) and (Cache.authority == 1):   #TODO
        user.delete()
    return redirect('userManage:assign')

def DeleteModule(request,pk):
    '''
    删除模块
    :param request:
    :param pk: 模块ID
    :return:
    '''
    module = Module.objects.get(id = pk)
    if (Cache.authority == 1):                    #TODO
        module.delete()
    return redirect('userManage:changemodule')

def EditModuleView(request,pk):
    '''
    修改模块
    :param request: {'submit' : '提交' or '取消'
                     'name' : 模块名
                     'detail' : 模块简述}
    :param pk:模块ID
    :return:
    '''
    if request.method == 'GET':
        module = Module.objects.get(id = pk)
        if (Cache.authority == 1):
            return render(request,'userManage/editmodule.html',{'module' : module})
        else:
            return redirect('userManage:changemodule')
    elif request.method == 'POST':
        if request.POST.get('submit') == '提交':
            detail = request.POST.get('detail')
            name = request.POST.get('name')
            print(detail)
            print(name)
            module = Module.objects.get(id = pk)
            module.name = name
            module.detail = detail
            module.save()
        return redirect('userManage:changemodule')
    else: return HttpResponse('error')

def DetailEventView(request,pk):
    '''
    事件详情
    :param request:
    :param pk: 事件ID
    :return: {'event' : 事件}               #TODO
    '''
    print(request.method)
    if request.method == 'GET':
        event = Event.objects.get(id=pk)
        return render(request, 'userManage/detailevent.html',{'event' : event})

    elif request.method == 'POST':
        if request.POST.get('submit') == '删除':
            if Cache.authority == 1:
                event = Event.objects.get(id = pk)
                event.delete()
        return redirect('userManage:eventView',1,'id')
    else: return HttpResponse('error')