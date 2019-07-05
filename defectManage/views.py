from django.template import loader
from django.http import HttpResponse,HttpResponseRedirect
from django.urls import reverse
from django.views import generic,View
from .models import Data
#import json
from django.contrib import messages

from django.shortcuts import render,get_object_or_404,redirect

# Create your views here.
def IndexView(request):
    if request.method=="POST":
        if request.POST["submit"] == "新建":
            return redirect('add/')
        if request.POST["submit"] == "查询":
            return redirect('/')
        if request.POST["submit"] == "处理":
            return redirect('deal/')
    else: return render(request, 'defectManage/index.html',)
def AddView(request):
    if request.method=="POST":
        if request.POST["submit"] == "确认":
            return render(request, '',)
        if request.POST["submit"] == "取消":
            return redirect('../')
        if request.POST["submit"] == "重置":
            return redirect('')
    else:   return render(request, 'defectManage/add.html',)
    
def DealView(request):
    if request.method=="POST":
        if request.POST["submit"] == "确认":
            return render(request, '', )
        if request.POST["submit"] == "取消":
            return redirect('../')
        if request.POST["submit"] == "重置":
            return redirect('')
        return render(request, 'defectManage/deal.html',)
    else:   return render(request, 'defectManage/deal.html', )

def DetailView(request,data_id):
    data = get_object_or_404(Data, pk=data_id)
    if request.method=="POST":
        return render(request,'defectManage/detail.html',data)
    else:
        return render(request, 'defectManage/detail.html', data)