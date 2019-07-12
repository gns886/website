var basePath = onGetBasePath();

$(function() {
	$("head").append('<script type="text/javascript" src="' + basePath + 'resources/js/cooperative/cooperative.js"></script>');
	mini.parse();
	var ua = navigator.userAgent.toLowerCase();
	var isWeixin = ua.indexOf("micromessenger") != -1;
	var isAndroid = ua.indexOf("android") != -1;
	var isIos = (ua.indexOf("iphone") != -1) || (ua.indexOf("ipad") != -1);
	var datagridInput; // 多行表单输入值
	if (isWeixin || isAndroid || isIos) {
		$(".addsy-wrapper").css("padding", "0px;");
		$(".addsy-main").css("width", "100%");
	}
	$('#form').css({});
	initBarcode();
    initQRCode();
	$("#fieldsList").on("click", "li", function(e) {
		$(this).addClass("fieldsist-li").siblings().removeClass("fieldsist-li");
	});

	var preview = false;
	var params = getUrlParameters(location.href);
	for (var i = 0; i < params.length; i++) {
		var param = params[i];
		if ('true' == param['preview']) {
			preview = true;
			$(".captcha-image").hide();
			$(".captcha-image-refresh").hide();
		}
	}
	// 非移动端表单预览页加载图片验证码
	if ((!window.sessionStorage || !sessionStorage.getItem("cooperate-forms-data")) && !preview) {
		var $captchaImg = $('.captcha-image'),
			src = $captchaImg.data('src');

		$captchaImg.attr('src', src);
	} else {
		$(".captcha-image").hide();
		$(".captcha-image-refresh").hide();
	}

//	console.log($('.mini-textbox-input'));
	// 自定义验证
    $('.mini-textbox-input').each(function(){
        var vtype,	// 自定义规则，如'custom:^\d+$@#@只能输入数字',其中'@#@'为分隔符
			rule,	// 正则表达式
			msg;	// 提示信息
        
        try {
    		vtype = mini.get($(this).attr('name')).vtype; // vtype存于data-options属性中
//    		console.log(mini.get($(this).attr('name')));
//    		vtype = decodeURIComponent(vtype);
        } catch(e){}
        // 注册自定义验证
        if(vtype != undefined && vtype != '') {
        	var vtypearr = vtype.split(';');
        	for(var ind = 0; ind < vtypearr.length; ind++ ) {
        		var vind = decodeURIComponent(vtypearr[ind]);
        		if(typeof vind == 'string') {
        			if(vind.indexOf('custom') != -1) {
        				
        				try{
        					
        					var temp = vind.replace('custom:','').split('@#@');
        					rule = temp[0];
        					msg = temp[1];
        				}catch (e) {
        				}
        				
        				if(!vind || !rule || !msg){
        					return;
        				}
        				var vindEncoded = encodeURIComponent(vind);
        				mini.VTypes[vindEncoded + 'ErrorText'] = msg;
        				mini.VTypes[vindEncoded] = function(v){
        					if(v===null || v===undefined || v===''){
        						return true;
        					}
        					
        					return new RegExp(rule).test(v);
        				}
        			} else if(vind.indexOf('remote') != -1) { //注册远程请求验证
        				
        				try{
        					var temp = vind.replace('remote:','').split('@#@'),
        					url = temp[0],
        					key = temp[1],
        					operator = temp[2],
        					value = temp[3],
        					msg = temp[4];
        				}catch (e) {
        				}
        				
//        	console.log(url, key , operator, value);
        				if(!vind || !url || !key || !operator || !value || !msg){
        					return;
        				}
        				
        				var vindEncoded = encodeURIComponent(vind);
        				var that = this;
        				mini.VTypes[vindEncoded + 'ErrorText'] = msg;
        				mini.VTypes[vindEncoded] = function (v) {
        					var userAttribute;
        					onSubmit(basePath + "api/getUserAttribute.htm",'post', null, false, function(resp) {
        						userAttribute = mini.decode(resp);
//        						console.log(userAttribute);
        					}, function() {
        						
        					});
        					var urlactual = url;
        					if(urlactual.indexOf('INPUTVALUE') != -1) {
        						if(mini.get($(that).attr('name')).value == "" || mini.get($(that).attr('name')).value == undefined) {
        							return true;
        						}
        					}
        					if(mini.get($(that).attr('name')).value != "" && mini.get($(that).attr('name')).value != undefined) {
        						urlactual = urlactual.replace(/INPUTVALUE/g, mini.get($(that).attr('name')).value); //当前输入值
        					}
        					if(userAttribute != undefined && userAttribute.userId != undefined  && userAttribute.userId != '' ) {
        						urlactual = urlactual.replace(/CURRENTUSERID/g, userAttribute.userId); //当前用户编号
        					}
        					if(userAttribute != undefined && userAttribute.userName != undefined && userAttribute.userName != '' ) {
        						urlactual = urlactual.replace(/CURRENTUSER/g, userAttribute.userName); //当前用户姓名
        					}
        					if(userAttribute != undefined && userAttribute.orgId != undefined && userAttribute.orgId != '' ) {
        						urlactual = urlactual.replace(/CURRENTORG/g, userAttribute.orgId); //当前登录用户所在单位
        					}
        					if(userAttribute != undefined && userAttribute.unitId != undefined && userAttribute.unitId != '' ) {
        						urlactual = urlactual.replace(/CURRENTDEPT/g, userAttribute.unitId); //当前登录用户所在部门
        					}
        					if(userAttribute != undefined && userAttribute.postId != undefined && userAttribute.postId != '' ) {
        						urlactual = urlactual.replace(/CURRENTPOST/g, userAttribute.postId); //当前登录用户所在岗位
        					}
        					if(userAttribute != undefined && userAttribute.jobId != undefined && userAttribute.jobId != '' ) {
        						urlactual = urlactual.replace(/CURRENTJOB/g, userAttribute.jobId); //当前登录用户的职务
        					}
        					if(userAttribute != undefined && userAttribute.roleId != undefined && userAttribute.roleId != '' ) {
        						urlactual = urlactual.replace(/CURRENTROLE/g, userAttribute.roleId); //当前登录用户的角色
        					}
        					var myDate = new Date();
        					if(userAttribute != undefined && userAttribute.userName != undefined && userAttribute.userName != '' ) {
        						urlactual = urlactual.replace(/OPTIONDATE/g, myDate.toLocaleDateString()); //当前日期
        					}
        					if(userAttribute != undefined && userAttribute.userName != undefined && userAttribute.userName != '' ) {
        						urlactual = urlactual.replace(/OPRTIONTIME/g, myDate.toLocaleTimeString()); //当前时间
        					}
        					var result = false;
							onSubmit(basePath + decodeURIComponent(urlactual), "get", null, false, function (resp) {
								try{
									resp = mini.decode(resp, true);
									var data = resp;
									if(resp.length) {
										data = resp[0];
									}
									if("=" == operator) {
										operator = "==";
									}
									var datakey;
									if(data[key] != undefined) {
										datakey = data[key];
									} else if(data[key.toUpperCase()] != undefined) {
										datakey = data[key.toUpperCase()];
									} else if(data[key.toLowerCase()] != undefined) {
										datakey = data[key.toLowerCase()];
									} else if(data[key.substring(0,1).toUpperCase()+key.substring(1).toLowerCase()] != undefined) {
										datakey = data[key.substring(0,1).toUpperCase()+key.substring(1).toLowerCase()];
									} else {
										datakey = undefined;
									}
									var code = '0?0:' + datakey + operator + value;
//        				console.log(code);
//        				console.log(data);
									result = !eval(code);
//        				console.log(result);
								} catch (e) {
									console.log(e);
								}
							}, function ( e ) {
								
							});
        					return result;
        				}
        			} else if (vind.indexOf('imagecaptcha') != -1) {
						var flowKey = vind.replace('imagecaptcha:', '');
						var vindEncoded = encodeURIComponent(vind);
						mini.VTypes[vindEncoded + 'ErrorText'] = "验证码错误！";
						mini.VTypes[vindEncoded] = function (v) {
							var validate = false;
							$.ajax({
								url: basePath + '/flowcfg/synergy_form/validateCaptcha.htm',
								data: {'flowKey': flowKey, 'verification': v},
								dataType: 'json',
								async: false,
								success: function (data) {
									if (data['code'] === 200) {
										if (data['data'] === true) {
											validate = true;
										}
									} else {
										console.error(data);
									}
								}
							});
							return validate;
						};
					}
        		}
        	}
        }
    });
    
    // 日期控件自定义验证
    $('.mini-buttonedit-input').each(function(){
    	var thisId,
			vtype,	// 自定义规则，如'custom:^\d+$@#@只能输入数字',其中'@#@'为分隔符
			msg;	// 提示信息
        try {
			thisId = $(this).attr('id').replace('$text','');
			vtype = mini.get(thisId).vtype; // vtype存于data-options属性中
        } catch(e){}
        // 注册自定义验证
        if(thisId && vtype != undefined && vtype != '') {
        	var vtypearr = vtype.split(';');
        	for(var ind = 0; ind < vtypearr.length; ind++ ) {
        		var vind = decodeURIComponent(vtypearr[ind]);
        		if(typeof vind == 'string') {
        			if(vind.indexOf('remote') != -1) { //注册远程请求验证
        				
        				try{
        					var temp = vind.replace('remote:','').split('@#@'),
        					url = temp[0],
        					key = temp[1],
        					operator = temp[2],
        					value = temp[3],
        					msg = temp[4];
        				}catch (e) {
        				}
        				
        				// console.log(url+","+ key +","+ operator+","+ value);
        				if(!vind || !url || !key || !operator || !value || !msg){
        					return;
        				}
        				
        				var that = this;
        				// 给日期控件绑定validation自定义验证事件
        				mini.get(thisId).on("validation", function(e){
        					if (e.isValid) {
        						var valueValidation = false;
        						var userAttribute;
            					onSubmit(basePath + "api/getUserAttribute.htm",'post', null, false, function(resp) {
            						userAttribute = mini.decode(resp);
            					}, function() {
            					});
            					var urlactual = url;
            					// 当前日期控件值
            					var thisDateInputValue = mini.get(thisId).value;
            					if(urlactual.indexOf('INPUTVALUE') != -1) {
            						if(thisDateInputValue == "" || thisDateInputValue == undefined) {
            							valueValidation = true;
            						} else {
            							thisDateInputValue = mini.formatDate(thisDateInputValue,'yyyy-MM-dd HH:mm:ss');
            							// 控件类型为"显示时间"
            							if (thisDateInputValue.indexOf('1970-01-01') != -1 || thisDateInputValue.indexOf('1970-01-02') != -1) {
            								thisDateInputValue = thisDateInputValue.split(' ')[1];
            							}
            						}
            					}
            					if(thisDateInputValue != "" && thisDateInputValue != undefined) {
            						urlactual = urlactual.replace(/INPUTVALUE/g, thisDateInputValue); //当前输入值
            					}
            					if(userAttribute != undefined && userAttribute.userId != undefined  && userAttribute.userId != '' ) {
            						urlactual = urlactual.replace(/CURRENTUSERID/g, userAttribute.userId); //当前用户编号
            					}
            					if(userAttribute != undefined && userAttribute.userName != undefined && userAttribute.userName != '' ) {
            						urlactual = urlactual.replace(/CURRENTUSER/g, userAttribute.userName); //当前用户姓名
            					}
            					if(userAttribute != undefined && userAttribute.orgId != undefined && userAttribute.orgId != '' ) {
            						urlactual = urlactual.replace(/CURRENTORG/g, userAttribute.orgId); //当前登录用户所在单位
            					}
            					if(userAttribute != undefined && userAttribute.unitId != undefined && userAttribute.unitId != '' ) {
            						urlactual = urlactual.replace(/CURRENTDEPT/g, userAttribute.unitId); //当前登录用户所在部门
            					}
            					if(userAttribute != undefined && userAttribute.postId != undefined && userAttribute.postId != '' ) {
            						urlactual = urlactual.replace(/CURRENTPOST/g, userAttribute.postId); //当前登录用户所在岗位
            					}
            					if(userAttribute != undefined && userAttribute.jobId != undefined && userAttribute.jobId != '' ) {
            						urlactual = urlactual.replace(/CURRENTJOB/g, userAttribute.jobId); //当前登录用户的职务
            					}
            					if(userAttribute != undefined && userAttribute.roleId != undefined && userAttribute.roleId != '' ) {
            						urlactual = urlactual.replace(/CURRENTROLE/g, userAttribute.roleId); //当前登录用户的角色
            					}
            					var myDate = new Date();
            					if(userAttribute != undefined && userAttribute.userName != undefined && userAttribute.userName != '' ) {
            						urlactual = urlactual.replace(/OPTIONDATE/g, mini.formatDate(myDate,'yyyy-MM-dd')); //当前日期
            						// urlactual = urlactual.replace(/OPTIONDATE/g, myDate.toLocaleDateString()); //当前日期
            					}
            					if(userAttribute != undefined && userAttribute.userName != undefined && userAttribute.userName != '' ) {
            						urlactual = urlactual.replace(/OPRTIONTIME/g, mini.formatDate(myDate,'HH:mm:ss')); //当前时间
            						// urlactual = urlactual.replace(/OPRTIONTIME/g, myDate.toLocaleTimeString()); //当前时间
            					}
            					var result = false;
    							onSubmit(basePath + decodeURIComponent(urlactual), "get", null, false, function (resp) {
    								try{
    									resp = mini.decode(resp, true);
    									var data = resp;
    									if(resp.length) {
    										data = resp[0];
    									}
    									if("=" == operator) {
    										operator = "==";
    									}
    									var datakey;
    									if(data[key] != undefined) {
    										datakey = data[key];
    									} else if(data[key.toUpperCase()] != undefined) {
    										datakey = data[key.toUpperCase()];
    									} else if(data[key.toLowerCase()] != undefined) {
    										datakey = data[key.toLowerCase()];
    									} else if(data[key.substring(0,1).toUpperCase()+key.substring(1).toLowerCase()] != undefined) {
    										datakey = data[key.substring(0,1).toUpperCase()+key.substring(1).toLowerCase()];
    									} else {
    										datakey = undefined;
    									}
    									var code = '0?0:' + datakey + operator + value;
//            				console.log(code);
    									result = !eval(code);
//            				console.log(result);
    								} catch (e) {
    									console.log(e);
    								}
    							}, function ( e ) {
    							});
    							if (valueValidation) {
    								e.errorText = "值为空！";
        					        e.isValid = false;
    							} else if (!result) {
        				            e.errorText = msg;
        					        e.isValid = false;
        					    }
        					}
        				});
        			}
        		}
        	}
        }
    });
    
    function dateToString(now){
        var year = now.getFullYear();
        var month =(now.getMonth() + 1).toString();
        var day = (now.getDate()).toString();
        var hour = (now.getHours()).toString();
        var minute = (now.getMinutes()).toString();
        var second = (now.getSeconds()).toString();
        if (month.length == 1) {
            month = "0" + month;
        }
        if (day.length == 1) {
            day = "0" + day;
        }
        if (hour.length == 1) {
        	hour = "0" + hour;
        }
        if (minute.length == 1) {
        	minute = "0" + minute;
        }
        if (second.length == 1) {
        	second = "0" + second;
        }
         var dateTime = year + "-" + month + "-" + day +" "+ hour +":"+minute+":"+second;
         return dateTime;
      }
    
    //多行表单验证
    $('img[datagrid_class="mini-datagrid"]').each(function(e) {
    	var img = $('img[datagrid_class="mini-datagrid"]')[e],
    		attributes = img.attributes,
    		datagridId = attributes.getNamedItem('datagrid_enfield').value,
    		datagridFields = [],
    		datagrid = mini.get(datagridId);
    	datagrid.allowCellValid = true;
    	for(var index in datagrid.columns) {
    		var column = datagrid.columns[index];
    		if(typeof column.vtype == 'string') {
    			var vtypearr = column.vtype.split(';');
    			for(var ind = 0; ind < vtypearr.length; ind ++) {
    				var vtypeind = decodeURIComponent(vtypearr[ind]);
    				
    				if(vtypeind.indexOf('custom') != -1 ) {
    					try{
    						
    						var temp = vtypeind.replace('custom:','').split('@#@');
    						rule = temp[0];
    						msg = temp[1];
    					}catch (e) {
    					}
    					
    					if(!vtypeind || !rule || !msg){
    						return;
    					}
    					var vtypeindEncoded = encodeURIComponent(vtypeind);
    					mini.VTypes[vtypeindEncoded + 'ErrorText'] = msg;
    					mini.VTypes[vtypeindEncoded] = (function(rule){
    						return function() {
    							if(datagridInput===null || datagridInput===undefined || datagridInput===''){
    								return true;
    							}
    							
    							return new RegExp(rule).test(datagridInput);
    						}
    					})(rule);
    				} else if(vtypeind.indexOf('remote') != -1) { //注册远程请求验证
    					
    					try{
    						var temp = vtypeind.replace('remote:','').split('@#@'),
    						url = temp[0],
    						key = temp[1],
    						operator = temp[2],
    						value = temp[3],
    						msg = temp[4];
    					}catch (e) {
    					}
    					
//            	console.log(url, key , operator, value);
    					if(!vtypeind || !url || !key || !operator || !value || !msg){
    						return;
    					}
    					
    					var vtypeindEncoded = encodeURIComponent(vtypeind);
    					mini.VTypes[vtypeindEncoded + 'ErrorText'] = msg;
    					console.log(vtypeind);
    					console.log(url);
    					mini.VTypes[vtypeindEncoded] = (function (url, key, operator, value) {
    						return function() {
    							
    							var userAttribute;
    							onSubmit(basePath + "api/getUserAttribute.htm",'post', null, false, function(resp) {
    								userAttribute = mini.decode(resp);
    							}, function() {
    								
    							});
    							var urlactual = url;
    							if(urlactual.indexOf('INPUTVALUE') != -1) {
            						if(datagridInput == "" || datagridInput == undefined) {
            							return true;
            						}
            					}
    							if(datagridInput != "" && datagridInput != undefined) {
    								urlactual = urlactual.replace(/INPUTVALUE/g, datagridInput); //当前输入值
    							}
    							if(userAttribute != undefined && userAttribute.userId != undefined  && userAttribute.userId != '' ) {
    								urlactual = urlactual.replace(/CURRENTUSERID/g, userAttribute.userId); //当前用户编号
    							}
    							if(userAttribute != undefined && userAttribute.userName != undefined && userAttribute.userName != '' ) {
    								urlactual = urlactual.replace(/CURRENTUSER/g, userAttribute.userName); //当前用户姓名
    							}
    							if(userAttribute != undefined && userAttribute.orgId != undefined && userAttribute.orgId != '' ) {
    								urlactual = urlactual.replace(/CURRENTORG/g, userAttribute.orgId); //当前登录用户所在单位
    							}
    							if(userAttribute != undefined && userAttribute.unitId != undefined && userAttribute.unitId != '' ) {
    								urlactual = urlactual.replace(/CURRENTDEPT/g, userAttribute.unitId); //当前登录用户所在部门
    							}
    							if(userAttribute != undefined && userAttribute.postId != undefined && userAttribute.postId != '' ) {
    								urlactual = urlactual.replace(/CURRENTPOST/g, userAttribute.postId); //当前登录用户所在岗位
    							}
    							if(userAttribute != undefined && userAttribute.jobId != undefined && userAttribute.jobId != '' ) {
    								urlactual = urlactual.replace(/CURRENTJOB/g, userAttribute.jobId); //当前登录用户的职务
    							}
    							if(userAttribute != undefined && userAttribute.roleId != undefined && userAttribute.roleId != '' ) {
    								urlactual = urlactual.replace(/CURRENTROLE/g, userAttribute.roleId); //当前登录用户的角色
    							}
    							var myDate = new Date();
    							if(userAttribute != undefined && userAttribute.userName != undefined && userAttribute.userName != '' ) {
    								urlactual = urlactual.replace(/OPTIONDATE/g, myDate.toLocaleDateString()); //当前日期
    							}
    							if(userAttribute != undefined && userAttribute.userName != undefined && userAttribute.userName != '' ) {
    								urlactual = urlactual.replace(/OPRTIONTIME/g, myDate.toLocaleTimeString()); //当前时间
    							}
    							var result = false;
    							onSubmit(basePath + decodeURIComponent(urlactual), "get", null, false, function (resp) {
    								console.log(urlactual);
    								try{
    									resp = mini.decode(resp, true);
    									var data = resp;
    									if(resp.length) {
    										data = resp[0];
    									}
    									if("=" == operator) {
    										operator = "==";
    									}
    									var datakey;
    									if(data[key] != undefined) {
    										datakey = data[key];
    									} else if(data[key.toUpperCase()] != undefined) {
    										datakey = data[key.toUpperCase()];
    									} else if(data[key.toLowerCase()] != undefined) {
    										datakey = data[key.toLowerCase()];
    									} else if(data[key.substring(0,1).toUpperCase()+key.substring(1).toLowerCase()] != undefined) {
    										datakey = data[key.substring(0,1).toUpperCase()+key.substring(1).toLowerCase()];
    									} else {
    										datakey = undefined;
    									}
    									var code = '0?0:' + datakey + operator + value;
    									result = !eval(code);
    								} catch (e) {
    									console.log(e);
    								}
    							}, function ( e ) {
    								
    							} );
    							return result;
    						}
    					})(url, key, operator, value);
    				}
    			}
//    	for(var index in attributes) {
//    		if(attributes[index].name != undefined && attributes[index].name.indexOf('datagridfield_') != -1) {
//    			var tempStr = attributes[index].value,
//    				tempArr = tempStr.split(';'),
//    				datagridField = {};
//    			for( var i in tempArr ) {
//    				if(typeof tempArr[i] == 'string') {
//    					var tempKNV = tempArr[i].split('='),
//	    					key = tempKNV[0],
//	    					value = tempKNV[1];
//    					datagridField[key] = value;
//    				}
//    			}
//    			datagridFields.push(datagridField);
//    			for( var i in datagrid.columns) {
//    				var column = datagrid.columns[i];
//    				if(typeof column.header == 'string' && column.header.trim() == datagridField.name) {
//    					datagrid.columns[i].vtype = datagridField.vtype;
//    				}
//    			}
//    			console.log(datagrid.columns);
//    		}
//    	}
    			datagrid.on('cellcommitedit', function(e) {
    				datagridInput = e.value;
//    				datagrid.validate();
//    				console.log(datagrid.isValid());
    			});
    			}
    		}
    	
    });
});

window.onload = function() {
	$("body").bind("contextmenu", function(e) {
		return false;
	});
}

/**
 * 数值输入的验证
 */
function spinnerValidation(v,vtype,event) {
    if(v === null || v === undefined || v==='') {
        return true;
    }
	if(vtype!=undefined) {
		if(vtype.indexOf('nopositive') != -1) {
            if(v.value > 0) {
                v.isValid = false;
                v.errorText = "不得输入正数！"
                return false;
            }
		}
		if(vtype.indexOf('nonegative') != -1) {
            if(v.value < 0) {
                v.isValid = false;
                v.errorText = "不得输入负数！"
                return false;
            }
		}
		if(vtype.indexOf('nozero') != -1) {
            if(v.value == 0) {
                v.isValid = false;
                v.errorText = "不得输入零！"
                return false;
            }
		}
		if(vtype.indexOf('noint') != -1) {
            if(Math.round(v.value) === v.value) {
                v.isValid = false;
                v.errorText = "请输入小数！"
                return false;
            }
		}
		if(vtype.indexOf('nofloat') != -1) {
            if(!(Math.round(v.value) === v.value)) {
                v.isValid = false;
                v.errorText = "请输入整数！"
                return false;
            }
		}
		return true;
	}
	return true;
}

/**
 * 初始化页面，生成二维码控件
 */
function initQRCode() {
    /* 具体业务包——流程tab页，表单预览tab页需要显示默认的二维码 */
    if (this.parent.showQRCode === true) {
        return;
    }

    /* 处理流程 */
    var inst = this.parent.inst;
    if (inst === undefined && this.parent.opener) {
        /* 打印流程表单 */
        inst = this.parent.opener.inst;
    }
    if (inst && inst.id) {
        $('.flow-qrcode').attr('src', basePath + 'wechat/qrcode/print.htm?qrcode=/weixin/weui/cooperate.htmlSPTdetail/' + inst.id);
    } else {
        $('.flow-qrcode').hide();
    }
}

/**
 * 初始化页面，生成条形码或编号
 */
function initBarcode() {
	var value = '0000LC0011486345424048657';
	var btype = "code128";
	var renderer = "css";
	var settings = {
		output : renderer,
		bgColor : "#ffffff",
		color : "#000000",
		barWidth : 1,
		barHeight : 45,
		showHRI : true
	};
	$(".barcodeTarget").html("").show().barcode(value, btype, settings);
}

/**
 * 功能：通过传入的值，生成条形码
 */
function generateBarcode(barcode) {
	var value = barcode;
	var btype = "code128";
	var renderer = "css";
	var settings = {
		output : renderer,
		bgColor : "#ffffff",
		color : "#000000",
		barWidth : 1,
		barHeight : 45,
		showHRI : true
	}
	$(".barcodeTarget").html("").show().barcode(value, btype, settings);
}

/**
 * 点击添加附件
 */
function onAnnex(enfield, annextype, annexnum, annexsize, annexwidth, annexheight, fontSize, content) {
	var annexGrid = mini.get(enfield);
	var parameter = 'thumbnail=true&thumbnailSpecies=gif,png,jpg,jpeg,jpe,bmp,dib,jfif,tif,tiff';
	if(fontSize && content){
		parameter += ("&watermark={\"fontSize\":" + fontSize + ",\"content\":\"" + content + "\"}");
	}
	var data = {
		basePath : basePath,
		width : annexwidth,
		height : annexheight,
		fileNum : annexnum,
		type : annextype,
		fileType : annextype,
		size : annexsize,
		title : "添加附件",
		autoCloseWindow : false,
		savePath : "fileupload/files/",
        parameter: parameter
    };
	uploadFile(data, function(files) {
		var dataArray = files;
		// 上传窗口关闭时会自动调用的回调函数。
		for (var i = 0; i < dataArray.length; i++) {
			var type = "." + dataArray[i].fileType;
            var imagePath = (dataArray[i].smallAttach && dataArray[i].smallAttach.smallDownloadUrl) || onGetJpg(type);
			var annexName = dataArray[i].originalFileName;
			var url = dataArray[i].downloadUrl;
			var size = dataArray[i].fileSize;
			var physicalId = dataArray[i].id;
			var opDate = new Date();
			var row = {
				annexName : annexName,
				type : type,
				imagePath : imagePath,
				url : url,
				size : size,
				physicalId : physicalId,
				opDate : opDate,
				enfield : enfield
			};
			annexGrid.addRow(row);
		}

	});
}

/**
 * 功能：下载附件
 */
function downLoadFile(ele, url, oldName, type) {
	var imgReg = /^\.?(gif|png|jpg|jpeg|jpe|bmp|dib|jfif|tif|tiff){1}$/i;

	// 图片预览
	if(imgReg.test(type) && window.top.previewImage){
		var imgs = [], index = 0;
		var $imgs = $(ele).closest('.mini-grid-table').find('img[data-url]').filter(function(){
			return imgReg.test($(this).attr('data-type'));
		});
		index = $imgs.index($(event.target).closest('img[data-url]'));

		$imgs.each(function(){
			imgs.push({
				url: $(this).attr('data-url'),
				name: $(this).attr('alt')
			})
		});

        window.top.previewImage(imgs, index);
        return;
	}

	oldName = encodeURI(oldName);
	parent.window.location.href = basePath + url + "&mode=download";
}

/**
 * 删除附件
 */
function deleteFile(enfield, physicalId) {
	var annexGrid = mini.get(enfield);
	mini.confirm("确定要删除这个附件吗？", "", function(action) {
		if (action == "ok") {
			$("#" + physicalId).remove();
			annexGrid.removeRow(annexGrid.getSelected());
		}
	});
}

/**
 * 行内编辑，删除附件
 *
 * @param id
 */
function deleteFile4Grid(id, field, physicalId) {
	var grid = mini.get(id);
	var row = grid.getSelected();
	mini.confirm("确定要删除这个附件吗？", "", function(action) {
		if (action == "ok") {
			//$("#" + physicalId).remove();
			// 更新grid里面当前单元格的值
			var annexArray = mini.decode(row[field]);
			var tempArray = new Array();
			for (var i = 0; i < annexArray.length; i++) {
				if (annexArray[i].physicalId != physicalId) {
					tempArray.push(annexArray[i]);
				}
			}
			row[field] = tempArray.length ? mini.encode(tempArray) : '';
			grid.updateRow(row);
		}
	});
}

/**
 * 渲染附件的下载和删除列
 *
 * @param e
 */
function ondrawcell_annex(e) {
	var field = e.field;
	var record = e.record;
	if (field == "annexName") {
		var s = "<span id=\"" + record.physicalId + "\">" + "<img style=\"vertical-align:middle; cursor:pointer;max-width:60px;max-height:60px;\" onclick=\"downLoadFile(this, '" + record.url + "','" + record.annexName + "','" + record.type + "')\" src=\""
				+ basePath + record.imagePath + "\" data-url='" +  record.url + "&cache=true' data-type='" + record.type + "' alt='" + record.annexName + record.type + "'/>" + "<a style=\"border:none; text-decoration:none; margin-left:8px;\" href=\"javascript:void(0)\" onclick=\"downLoadFile(this, '" + record.url + "','"
				+ record.annexName + "','" + record.type + "')\">" + "<span style=\"vertical-align:middle;\" >" + record.annexName + record.type + "</span>" + "</a>" + "</span>";
		e.cellHtml = s;
	}

	if (field == "opp") {
		var d = "<a style=\"border:none;\">" + "<img style=\"vertical-align:middle; cursor:pointer; margin-left:8px;\" onclick=\"deleteFile('" + record.enfield + "', '" + record.physicalId
				+ "')\" src=\"" + basePath + "resources/images/flow/no.gif\"/>" + "</a>";
		e.cellHtml = d;
	}
}

/**
 * 多行控件操作附件渲染
 *
 * @param e
 * @param id
 * @param field
 * @param annextype
 * @param annexnum
 * @param annexsize
 * @param annexwidth
 * @param annexheight
 */
function ondrawcell_annex_grid(e) {
	var grid = e.sender;
	var record = e.record;
	var column = grid.getColumn("_annexPic");
	if (column && column.visible == false) {
		e.rowCls = "myRow";
	}

	// 渲染附件
	if (typeof (e.field) != "undefined" && e.field.indexOf("##annex##") != -1) {
		var annexStr = "";
		var dataArray = new Array();
		if (e.value) {
			if(e.value.indexOf("\\") != -1){
				dataArray = mini.decode(e.value.replace(/[\\]/g,''));
			}else{
				dataArray = mini.decode(e.value);
			}
			for (var i = 0; i < dataArray.length; i++) {
				var annex = dataArray[i];
				var s = "<p id=\"" + annex.physicalId + "\" style='margin-bottom: 5px'>" + "<img style=\"vertical-align:middle; cursor:pointer;max-width:60px;max-height:60px;\" onclick=\"downLoadFile(this, '" + annex.url + "', '" + annex.annexName + "', '" + annex.type
					+ "')\" src=\"" + basePath + annex.imagePath + "\" data-url='" +  annex.url + "&cache=true' data-type='" + annex.type + "'  alt='" + annex.annexName + annex.type + "'/>" + "<a style=\"border:none; text-decoration:none; margin-left:8px;\" href=\"javascript:void(0)\" onclick=\"downLoadFile(this, '"
					+ annex.url + "', '" + annex.annexName + "', '" + annex.type + "')\">" +  annex.annexName + annex.type + "</a>"

                // office文件显示预览按钮
                if(/^\.?(doc|docx|ppt|pptx|xls|xlsx)$/i.test(annex.type)){
                    s += "<a style=\"border:none; padding-right: 5px;\" target='_blank' href='https://view.officeapps.live.com/op/view.aspx?src="
                        + encodeURIComponent(basePath+annex.url) + "'>"
                        + "<img style=\"vertical-align:middle; cursor:pointer; margin-left:8px;\" src=\""
                        + basePath + "resources/images/flow/icon-flow-preview.png\"/>" + "</a>"
                }

                if(!e.column.readOnly){
					s += "<a class=\"_annexDeleteButton\" data-field='"+e.field+"' style=\"border:none;\">" + "<img style=\"vertical-align:middle; cursor:pointer; margin-left:8px;\" onclick=\"deleteFile4Grid('" + grid.id
						+ "', '" + e.field + "', '" + annex.physicalId + "')\" src=\"" + basePath + "resources/images/flow/icon-flow-delete.png\"/>" + "</a>";
				}

				s += '</p>';
				annexStr += s;
			}
		}
		e.cellHtml = annexStr;
	}
}

/**
 * 渲染附件操作栏
 *
 * @param e
 * @returns {String}
 */
function onActionRenderer(e) {
	var field = e.field;
	var parArray = field.split("@@annex@@");
	if (parArray.length > 0) {
		var id = parArray[0];
		var field = parArray[1];
		var annextype = parArray[2];
		var annexnum = parArray[3];
		var annexsize = parArray[4];
		var annexwidth = parArray[5];
		var annexheight = parArray[6];
		var watermark = parArray[7];
		var str = ",''";
		if(watermark == "true"){
			str = ",'" + parArray[8] + "','" + parArray[9] + "'";
		}
		var s = '<center>' + '<a onclick="javascript:onAnnex4Grid(\'' + id + '\', \'' + field + '\', \'' + annextype + '\', ' + annexnum + ', ' + annexsize + ', ' + annexwidth + ', ' + annexheight
				+ str + ');" style="cursor:pointer;" title="上传附件"><img src=\"' + basePath + "resources/images/flow/icon-annex.png" + '\"/></a>' + '</center>';
		return s;
	}
}

/**
 * 表单多行空间，行内编辑--附件组件
 *
 * @param field
 * @param annextype
 * @param annexnum
 * @param annexsize
 * @param annexwidth
 * @param annexheight
 */
function onAnnex4Grid(id, field, annextype, annexnum, annexsize, annexwidth, annexheight, fontSize, content) {
	var grid = mini.get(id);
	var row = grid.getSelected();
	var parameter = '';
	if(fontSize && content){
		parameter += ("&watermark={\"fontSize\":" + fontSize + ",\"content\":\"" + content + "\"}");
	}
	var data = {
		basePath : basePath,
		width : annexwidth,
		height : annexheight,
		fileNum : annexnum,
		type : annextype,
		fileType : annextype,
		size : annexsize,
		title : "添加附件",
		autoCloseWindow : false,
		savePath : "fileupload/files/",
		parameter : parameter
	};
	uploadFile(data, function(files) {
		var dataArray = files;
		var annexArray = new Array();
		if (row[field + "##annex##"]) {
			annexArray = mini.decode(row[field + "##annex##"]); // 获取到已经存在的值
		}
		for (var i = 0; i < dataArray.length; i++) {
			var annex = dataArray[i];
			var type = "." + annex.fileType;
			var imagePath = onGetJpg(type);
			var annexName = annex.originalFileName;
			var url = annex.downloadUrl;
			var size = annex.fileSize;
			var physicalId = annex.id;
			var obj = {
				annexName : annexName,
				type : type,
				imagePath : imagePath,
				url : url,
				size : size,
				physicalId : physicalId
			};
			annexArray.push(obj);
		}
		// 给存放附件的列赋值
		row[field + "##annex##"] = mini.encode(annexArray);
		grid.updateRow(row);
	});
}

/**
 * 功能：点击人员选择器调用的方法
 *
 * @author sunle
 * @date 2013-11-25
 */
function onbuttonclick(id, _showCheckBox, _multiSelect, _shows) {
	var params = new Object();
	var idAndType = mini.get(id).getValue();
	if(idAndType != "" && idAndType != '@_@'){
		var idValue = idAndType.split("@_@")[0];
		var typeValue = idAndType.split("@_@")[1];
		var textValue = mini.get(id).getText();
		//选择器回显数据
		var length = idValue.split(',').length;
		var dataArray = new Array();
		if(length > 1){
			for(var i = 0; i<length;i++){
				var object = {};
				object['idField'] = idValue.split(",")[i];
				if(typeValue){
					object['type'] = typeValue.split(",")[i];
				}
				object['textField'] = textValue.split(",")[i];
				dataArray.push(object);
			}
			params.datas = dataArray;
		}else{
			params.datas ="[{'idField':'" + idValue + "','typeName':'部门','textField':'"+ textValue +"','type':'"+ typeValue +"'}]";
		}
	}
	params.showCheckBox = _showCheckBox;
	params.shows = _shows;
	if (_multiSelect == 'true') {
		params.multiSelect = true;
	} else {
		params.multiSelect = false;
	}
	onOpenSelector(params, function(e) {
		var list = mini.decode(e);
		var ids = "";
		var texts = "";
		var type = "";
		for (var i = 0; i < list.length; i++) {
			if (i == list.length - 1) {
				ids += list[i].idField;
				texts += list[i].textField;
				type += list[i].type;
			} else {
				ids += list[i].idField + ",";
				texts += list[i].textField + ",";
				type += list[i].type+ ",";
			}
		}
		mini.get(id).setValue(ids != "" && type !=""?ids + "@_@" + type:"");
		mini.get(id).setText(texts);
		mini.get(id).validate();
		mini.get(id).doValueChanged();
	});
}
/**
 * 功能：点击人员选择器调用的方法
 */
function onButtonClickByGrid(idData, _showCheckBox, _multiSelect, _shows) {
	var params = new Object();
	var idDatas = mini.decode(idData);
	var grid = mini.get(idDatas.gid);
	var rowValue = grid.getSelected();
	if(rowValue[idDatas.id]){
		var textValue = rowValue[idDatas.id];
		var idAndType = rowValue['idAndType'];
		if(idAndType){
			var idValue = idAndType.split("@_@")[0];
			var typeValue = idAndType.split("@_@")[1];
			var length = idValue.split(',').length;
			var dataArray = new Array();
			if(length > 1){
				for(var i = 0; i<length;i++){
					var object = {};
					object['idField'] = idValue.split(",")[i];
					object['type'] = typeValue.split(",")[i];
					object['textField'] = textValue.split(",")[i];
					dataArray.push(object);
				}
				params.datas = dataArray;
			}else{
				params.datas ="[{'idField':'" + idValue + "','typeName':'部门','textField':'"+ textValue +"','type':'"+ typeValue +"'}]";
			}
		}
	}
	
	params.showCheckBox = _showCheckBox;
	params.shows = _shows;
	if (_multiSelect == 'true') {
		params.multiSelect = true;
	} else {
		params.multiSelect = false;
	}
	onOpenSelector(params, function(e) {
		var list = mini.decode(e);
		var ids = "";
		var texts = "";
		var type = "";
		for (var i = 0; i < list.length; i++) {
			if (i == list.length - 1) {
				ids += list[i].idField ;
				texts += list[i].textField;
				type += list[i].type;
			} else {
				ids += list[i].idField + ",";
				texts += list[i].textField + ",";
				type += list[i].type + ",";
			}
		}
		grid.commitEdit();
		var gridData = grid.data;
		var row = grid.getSelected();
		row[idDatas.id] = texts;
		row["idAndType"] = ids != "" && type !=""?ids + "@_@" + type:"";
		grid.updateRow(row, row);
	});
}

/**
 * 功能：点击签章控件调用的方法
 *
 * @author wumingyue
 * @date 2016-08-16
 */
function onFlowSignature(id) {
	mini.open({
		url : basePath + "flowcfg/synergy_form/signatureSelector.htm",
		showMaxButton : false,
		allowResize : false,
		title : "请选择",
		iconCls : "icon-addnew",
		width : 500,
		height : 450,
		ondestroy : function(action) {
			if (action == "ok") {
				var iframe = this.getIFrameEl();
				var data = iframe.contentWindow.onGetData();
				if (data && data != "") {
					$("img[enfield='" + id + "']").attr("src", data.markPath);
					$("img[enfield='" + id + "']").css("cursor", "pointer");
					$("img[enfield='" + id + "']").css("border", "none");
				}
			}
		}
	});
}

/**
 * 点击某一datagrid时，触发增加一行
 */
function onAdd(id, maxRows, defaultValue, minRows) {
    var grid = mini.get(id);
    var dataCount = grid.data.length;

    /* 为兼容旧的流程信息，当maxRows不是数字时，默认设置为500 */
    if (!/^\d+$/.test(maxRows)) {
        maxRows = 500;
    }
    if (dataCount == maxRows) {
        mini.showMessageBox({
            width: 200,
            title: "提示",
            buttons: ["确定"],
            iconCls: "mini-messagebox-warning",
            message: "表格数据已到达最大限制",
            callback: function (action) {
            }
        });
        return;
    }

    // 2019.5.20 隐藏最小行数错误信息
	minRows = parseInt(minRows);
	if(!isNaN(minRows) && minRows>0 && dataCount >= (minRows-1)){
		$(grid.el).parent().parent().find('.minGridRowsError').remove();
	}

    var newRow = {};
    if (defaultValue) {
        newRow = JSON.parse(defaultValue);

        if (newRow['needConvertFields']) {
            if (grid.gridDefaultValue) {
                grid.addRow($.extend(true, {}, grid.gridDefaultValue), dataCount);
            } else {
                $.ajax({
                    url: window.parent.basePath + "cooperative/queryGridDefaultValue.htm",
                    type: "POST",
                    async: false,
                    dataType:'json',
                    data: {"gridId" : id, "defaultValue" : defaultValue},
                    success: function (result) {
                        if (result['code'] === 200) {
                            grid.gridDefaultValue = $.extend(true, {}, result.data);

                            grid.addRow(result.data, dataCount);
                        } else {
                            mini.showMessageBox({
                                width: 200,
                                title: "提示",
                                buttons: ["确定"],
                                iconCls: "mini-messagebox-warning",
                                message: result['msg'],
                                callback: function (action) {
                                }
                            });
                        }
                    },
                });
            }
        } else {
            grid.addRow(newRow, dataCount);
        }
    } else {
        grid.addRow(newRow, dataCount);
    }
}

/**
 * 移除选中的行
 *
 * @param id
 */
function onDelete(id) {
	var rows = mini.get(id).getSelecteds();
	if (rows.length > 0) {
		mini.get(id).removeRows(rows, false);
	}
}

/**
 * 上移选中的行
 *
 * @param id
 */
function upItem(id) {
    var grid = mini.get(id);
    var rows = grid.getSelecteds();
    if (rows.length > 0) {
        grid.moveUp(rows);
    }
}
/**
 * 下移选中的行
 *
 * @param id
 */
function downItem(id) {
    var grid = mini.get(id);
    var rows = grid.getSelecteds();
    if (rows.length > 0) {
        grid.moveDown(rows);
    }
}

/**
 * 多行控件excel导入数据
 * @param id
 */
function onImportData(id) {
    mini.showMessageBox({
        title: "提示",
        width: 250,
        iconCls: "mini-messagebox-question",
        buttons: ["导入", "下载"],
        message: "直接导入还是下载模版?",
        callback: function (action) {
            if(action == "导入"){
                var data = {
                    basePath: basePath,
                    title: '导入excel',
                    width: 573,
                    height: 362,
                    fileType: 'xls',
                    savePath: 'user/upload/files/',
                    fileNum: 1,
                    size: 0.1
                };
                uploadFile(data, function(file){

                    if(file !== undefined && file[0].id !== undefined){
                        var grid = new mini.DataGrid();
                        grid.loading("处理中，请稍后......");
                        var headerFields = getHeaderFields(id);
                        console.log(headerFields);
                        $.ajax({
                            url: basePath + "flowcfg/synergy_form/importDatagridData.htm",
                            type: "post",
                            dataType: 'json',
                            data: 'fileId=' + file[0].id + '&headerFields=' + JSON.stringify(headerFields),
                            success: function (result) {
                                grid.unmask();
                                if (result['code'] === 200) {
                                    var data = result['data'];
                                    //给表单赋值
                                    console.log(data);
                                    for (var j = 0; j < data.length; j++) {
                                        var element = data[j];
                                        mini.get(id).addRow(element, 9999);
                                    }
                                }
                                var html1 = "<div class=\"mini-fit\" id='ddd' style=\"position:absolute;width:250px;height:125px;overflow:scroll;text-align:left;\">" + result['msg'] + "</div>";
                                mini.showMessageBox({
                                    height: 125,
                                    width: 250,
                                    title: "提示",
                                    html: html1,
                                    iconCls: "mini-messagebox-warning",
                                    callback: function (action) {
                                        grid.reload();
                                    }
                                });
                            },
                            error: function (jqXHR) {
                                onHandleError(jqXHR.status, jqXHR);
                            }
                        });

                    }
                });

            }
            if(action == "下载"){
                // var columns = mini.get(id)['columns'];
                //表头字段
                var fields = getHeaderFields(id);
                // for (var i = 1; i < columns.length; i++) {
                //     var header = columns[i]['header'].trim();
                //     fields.push(header);
                // }
                var url = basePath + 'flowcfg/synergy_form/exportDatagridTemplate.htm';
                window.location.href = encodeURI(url + "?" + 'id=' + id + '&fields=' + JSON.stringify(fields));
            }
        }
    });


    function getHeaderFields(id) {
        var img = $('img[datagrid_enfield="' + id + '"]');
        var attributes = img[0]['attributes'];
        //表头字段
        var headerFields = [];
        for(var i =0;i<attributes.length;i++) {
            var nodeName = attributes[i]['nodeName'];
            if (nodeName.indexOf('datagridfield_') != 0) {
                continue;
            }
            var datagridFields = attributes[i]['nodeValue'];
            var datagridFieldArray = datagridFields.split(';');
            var colClass = '';
            var name = '';
            var field = '';
            var datasourceType = '';
            var data = [];
            for (var j = 0; j < datagridFieldArray.length; j++) {
                var datagridField = datagridFieldArray[j];
                var value = datagridField.substring(datagridField.indexOf('=') + 1, datagridField.length);
                if (datagridField.indexOf('class=') == 0) {
                    colClass = value;
                }
                if (datagridField.indexOf('field=') == 0) {
                    field = value;
                }
                if (datagridField.indexOf('name=') == 0) {
                    name = value;
                }
                //获取datagrid下拉框每列的数据源的值
                if (datagridField.indexOf('datasourcetype=') == 0) {
                    datasourceType = value;
                }
                if (colClass === 'mini-combobox') {
                    //来自固定值
                    if (datasourceType === 'data' && datagridField.indexOf('data=') == 0) {
                        data = value;
                    }
                    //来自数据源或代码集
                    if (datasourceType === 'url' && datagridField.indexOf('url=') == 0) {
                        $.ajax({
                            type: "post",
                            url: basePath + value,
                            async: false,
                            success: function (e) {
                                data = e;
                            }
                        });
                    }
                }
            }
            headerFields.push({
                'type': colClass,
                'name': name,
                'field': field,
                'datasourcetype': datasourceType,
                'data': data
            })
        }
        return headerFields;
    }
}

/**
 * 初始化省
 *
 * @param province_id
 */
function initProvince(province_id) {
	$.getJSON(basePath + "data/flowcfg/city.json", function(obj) {
		_cityJson = obj;
		var proArray = new Array(); // 省对象数组
		$.each(_cityJson, function(i, val) {
			if (val.item_code.substr(2, 4) == '0000') {
				proArray.push(val);
			}
		});
		mini.get(province_id).setData(proArray);
	});
}

/**
 * 初始化市
 *
 * @param city_id
 */
function initCity(province_id, city_id) {
	$.getJSON(basePath + "data/flowcfg/city.json", function(obj) {
		_cityJson = obj;
		var cityArray = new Array();
		$.each(_cityJson, function(i, val) {
			if (val.item_code.substr(0, 2) == mini.get(province_id).getValue().substr(0, 2) && val.item_code.substr(2, 4) != '0000' && val.item_code.substr(4, 2) == '00') {
				cityArray.push(val);
			}
		});
		mini.get(city_id).setData(cityArray);
	});
}

/**
 * 初始化县值
 *
 * @param city_id
 * @param county_id
 */
function initCounty(city_id, county_id) {
	$.getJSON(basePath + "data/flowcfg/city.json", function(obj) {
		_cityJson = obj;
		var cityVal = mini.get(city_id).getValue(); // 获取市值
		var countyArray = new Array();
		$.each(_cityJson, function(i, val) {
			if (cityVal == '110100' || cityVal == "120100" || cityVal == "310100" || cityVal == "500100") {
				if (val.item_code.substr(0, 3) == cityVal.substr(0, 3) && val.item_code.substr(4, 2) != '00') {
					countyArray.push(val);
				}
			} else {
				if (val.item_code.substr(0, 4) == cityVal.substr(0, 4) && val.item_code.substr(4, 2) != '00') {
					countyArray.push(val);
				}
			}
		});
		mini.get(county_id).setData(countyArray);
	});
}

/**
 * 当选择省以后，触发
 *
 * @param province_id
 * @param city_id
 * @param county_id
 */
function doProvAndCityRelation(province_id, city_id, county_id) {
	mini.get(city_id).setValue(""); // 清除市值
	mini.get(county_id).setValue(""); // 清除县值
	var cityArray = new Array();
	$.each(_cityJson, function(i, val) {
		if (val.item_code.substr(0, 2) == mini.get(province_id).getValue().substr(0, 2) && val.item_code.substr(2, 4) != '0000' && val.item_code.substr(4, 2) == '00') {
			cityArray.push(val);
		}
	});
	mini.get(city_id).setData(cityArray);
}

/**
 * 当选择市以后，触发
 *
 * @param city_id
 * @param county_id
 */
function doCityAndCountyRelation(city_id, county_id) {
	var cityVal = mini.get(city_id).getValue(); // 获取市值
	mini.get(county_id).setValue(""); // 清除县值
	var countyArray = new Array();
	$.each(_cityJson, function(i, val) {
		if (cityVal == '110100' || cityVal == "120100" || cityVal == "310100" || cityVal == "500100") {
			if (val.item_code.substr(0, 3) == cityVal.substr(0, 3) && val.item_code.substr(4, 2) != '00') {
				countyArray.push(val);
			}
		} else {
			if (val.item_code.substr(0, 4) == cityVal.substr(0, 4) && val.item_code.substr(4, 2) != '00') {
				countyArray.push(val);
			}
		}
	});
	mini.get(county_id).setData(countyArray);
}

/**
 * 数据源联动赋值
 * @param enfields 被联动控件enfield，逗号分隔
 * @param dataTypes 赋值类型，逗号分隔
 * @param keys 取值key，逗号分隔
 * @param resultArray 数据源返回值
 */
function setValueAndData4Fields(enfields, dataTypes, keys, resultArray,reqUrl,linkField,miniFieldControl) {
	// 移动端预览页，不需要赋值
    var cooperateFormsData = sessionStorage ? sessionStorage.getItem("cooperate-forms-data") : undefined;
    if(!cooperateFormsData){
		var array = [], enfieldsArray = enfields.split(','), dataTypeArray = dataTypes.split(','), keyArray = keys.split(',');
		var province_enfield = "";
		var city_enfield = "";
		for (var j = 0, len = enfieldsArray.length; j < len; j++) {
			var enfield = enfieldsArray[j];
			var dataType = dataTypeArray[j];
			var key = keyArray[j];
			//try {
				if (enfield != '') {
					if (dataType == 'value') { // 类型是赋值，而不是赋数据源
						if (resultArray.length > 0) {
							var resultObject = resultArray[0];
							if (resultObject && key && key != '') {
								var meifield = mini.get(enfield);
								if(resultObject.err &&(resultObject.err.code =="404" || resultObject.err.code =="500")){
									//记录错误日志  保存到mongo
									var miniFieldControlValue = miniFieldControl.getValue();
									var miniFieldControlText = miniFieldControl.getText();
									var data = {
											reqUrl : reqUrl,//请求URL
											enfield : meifield.getId(),//被联动的控件
											linkField : linkField, //联动的控件
											miniFieldControlValue :miniFieldControlValue,//联动控件的值（ID）
											miniFieldControlText :miniFieldControlText, //联动控件的文本
											formId : sessionStorage.getItem("formId"),
											errorCode : resultObject.err.code,   //返回的结果集
											errorMsg : resultObject.err.msg   //返回的结果集
										}
									$.ajax({
										url : basePath + "cooperative/saveErrorDataSource.htm",
										type : "post",
										data: data,
										dataType : "json",
										success : function(json) {
											var json = mini.decode(json);
											if(json.code == '500'){
												console.error("数据源错误日志保存失败")
											}
										}
									});
									mini.get(enfield).setValue("");
									break;
								}
								if(meifield != null && typeof(meifield) !='undefined'){
									var el = meifield.getEl();
									var value = resultObject[key];
									var tvalue = mini.encode(resultObject[key]);
									//数据渲染，例如value取出来是date对象时  要格式化，目前为止只有时间需要格式化
									if(enfield.indexOf("_province") != -1){//_province
										province_enfield = enfield; 
										getProvince(enfield,value);
									}else if(enfield.indexOf("_city") != -1){
										if(province_enfield != ""){
											city_enfield = enfield; 
											getCity(enfield,value,province_enfield);
										}
									}else if(enfield.indexOf("_county") != -1){
										if(city_enfield != "" ){
											getCounty(enfield,value,city_enfield);
										}
									}else if(typeof(value) == "string" && value.indexOf("@#@") != -1){
										mini.get(enfield).setValue(value.split("@#@")[0]);
										mini.get(enfield).setText && mini.get(enfield).setText(value.split("@#@")[1]);
										mini.get(enfield).doValueChanged();
									}else if(tvalue && tvalue.indexOf("fileupload/") != -1){
										var annexGrid = mini.get(enfield);
										annexGrid.clearRows();
										for (var i = 0; i < value.length; i++) {
											var row = {
												annexName : value[i].annexName,
												imagePath : value[i].imagePath,
												physicalId : value[i].physicalId,
												size : value[i].size,
												type : value[i].type,
												url : value[i].url
											};
											annexGrid.addRow(row);
										}
									}else{
										if(resultArray.length > 0 && key && key == "ORG"){
											var values = "";
											for(var i=0; i<resultArray.length; i++){
												var reObj = resultArray[i];
												if (reObj && key && key != '') {
													values += (reObj[key] + ",");
												}
											}
											values = values.substring(0, values.length - 1);
											mini.get(enfield).setValue(values);
											mini.get(enfield).doValueChanged && mini.get(enfield).doValueChanged();
										}else{
											value = DataRendering(el,resultObject[key],value);
											mini.get(enfield).setValue(value);
											mini.get(enfield).doValueChanged && mini.get(enfield).doValueChanged();
										}
									}
								}else{
									//目前来说只有头像控件
									var value = resultObject[key];
									if(typeof(value) != 'undefined'){
										if(value.indexOf("fileupload") > -1){
											//用户自定义上传的
											$("#"+enfield+"").attr("src", basePath + value);
										}else{
											$("#"+enfield+"").attr("src", basePath +"user/photo.htm?uid="+ value);
										}
									}
								}
							}
						}
					} else if (dataType == 'data') { // 赋值数据源
						var oldValue = mini.get(enfield).getValue();

	//					mini.get(enfield).setValue(''); // 清空原有的值，让用户重新选择
						if (key != '' && resultArray.length > 0) {
	//						mini.get(enfield).setData(resultArray[0][key]);
							var bd = mini.decode(resultArray[0][key]);
							var bdStr = mini.encode(bd);
							var columns = mini.get(enfield).getColumns();
							for (var k = 0; k < columns.length; k++) {
								var fjName = "";
								var fjName_annex = ""; //特殊处理轻应用显示表单多行附件回显问题
								if (columns[k].name == "_annexPic") {
									mini.get(enfield).showColumn(k);
								}
								if(columns[k].field && columns[k].field.indexOf("##annex##") != -1){
									fjName = columns[k].field;
									fjName_annex = columns[k].name;
								}
								if(fjName != ""){
									bdStr = bdStr.replaceAll(fjName.toUpperCase(),fjName);
									if(fjName_annex != ""){
										bdStr = bdStr.replaceAll(fjName_annex ,fjName);
									}
								}
							}
							mini.get(enfield).setData(mini.decode(bdStr));
						} else {
	//						mini.get(enfield).setData(resultArray);
							mini.get(enfield).setData(mini.decode(resultArray));
						}

						if(oldValue){
							mini.get(enfield).setValue(oldValue);
						}
					}
				}
			//} catch (e) {
			//	console.log(e);
			//}
		}
    }

    // 格式化日期时间控件显示格式
    window.initDateFormat && initDateFormat();
}
/**
 * 根据采集后的省名称查询省code
 * @param enfield
 * @param province
 */
function getProvince(enfield,province){
	var p_code = "";
	var copyEnfield  = enfield.substr(0,enfield.lastIndexOf("_"));//为了调用doProvAndCityRelation方法 
	$.ajaxSettings.async = false;
	$.getJSON(basePath + "data/flowcfg/city.json", function(obj) {
		_cityJson = obj;
		$.each(_cityJson, function(i, val) {
			if(province == val.item_name){
				mini.get(enfield).setValue(val.item_code);
				doProvAndCityRelation(enfield, copyEnfield+'_city', copyEnfield+'_county');
				return false;
			}
		});
	});
}
/**
 * 根据采集后的市名称查询市code
 * @param enfield
 * @param city
 * @param province_enfield
 */
function getCity(enfield,city,province_enfield){
	var copyEnfield  = enfield.substr(0,enfield.lastIndexOf("_"));
	$.ajaxSettings.async = false;
	$.getJSON(basePath + "data/flowcfg/city.json", function(obj) {
		_cityJson = obj;
		$.each(_cityJson, function(i, val) {
			if (val.item_code.substr(0, 2) == mini.get(province_enfield).getValue().substr(0, 2) 
					&& val.item_code.substr(2, 4) != '0000' 
						&& val.item_code.substr(4, 2) == '00' 
							&& val.item_name == city) {
				mini.get(enfield).setValue(val.item_code);
				doCityAndCountyRelation(enfield, copyEnfield+'_county');
				return false;
			}
		});
	});
}
/**
 *  根据采集后的区名称查询区code
 * @param enfield
 * @param county
 * @param city_enfield
 */
function getCounty(enfield,county,city_enfield){
	$.ajaxSettings.async = false;
	$.getJSON(basePath + "data/flowcfg/city.json", function(obj) {
		_cityJson = obj;
		var cityVal = mini.get(city_enfield).getValue(); // 获取市值
		if(cityVal != null && cityVal != ""){
			$.each(_cityJson, function(i, val) {
				if (cityVal == '110100' || cityVal == "120100" || cityVal == "310100" || cityVal == "500100") {
					if (val.item_code.substr(0, 3) == cityVal.substr(0, 3) 
							&& val.item_code.substr(4, 2) != '00'
								&& val.item_name == county) {
						mini.get(enfield).setValue(val.item_code);
						return false;
					}
				} else {
					if (val.item_code.substr(0, 4) == cityVal.substr(0, 4) && val.item_code.substr(4, 2) != '00' && val.item_name == county) {
						mini.get(enfield).setValue(val.item_code);
						return false;
					}
				}
				
			});
		}
	});
}
/**
 * 数据渲染
 */ 
function DataRendering(el,key,value){
	var clazz = el.className;
	if(clazz.indexOf("mini-datepicker") != -1 && key != null && typeof(key.time) != "undefined"){
		value = new Date(key.time).format("yyyy-MM-dd HH:mm:ss");
	}
	return value;
}

/**
 * 关联项获取值方法
 * @param enfields 被联动控件enfield，逗号分隔
 * @param dataTypes 赋值类型，逗号分隔
 * @param url 数据源地址
 * @param keys 取值key，逗号分隔
 * @param field 当前控件enfield
 */
function setReactionDate(enfields, dataTypes, url, keys, field) {
	var miniField = mini.get(field),
		$field = $(miniField.el),
		parValue = miniField.getValue();
	
	if(parValue.indexOf("@_@") >= 0){
		parValue = parValue.split("@_@")[0];
	}

	// 日期时间取text
	if($field.hasClass('mini-datepicker') || $field.hasClass('mini-timespinner')){
		parValue = miniField.getText();
	}

	onSubmit(basePath + 'flowcfg/synergy_form/parseUrl.htm', 'post', {
		url : url,
		parValue : parValue
	}, false, function(json) {
		if (json.indexOf("http") == -1) { // 不是以http或者https开头，默认会加一个当前项目的路径
			json = basePath + json;
		}
		json = encodeURI(json);
		var reqUrl = json;
		$.ajax({
			url : json,
			type : "get",
			async : false,
			dataType : "json",
			success : function(json) {
				var object, resultArray = [];
				if (typeof (json) == "string") {
					object = mini.encode(json);
				} else {
					object = json;
				}
				if (object instanceof Array) {
					resultArray = object;
				} else {
					resultArray.push(object);
				}
				setValueAndData4Fields(enfields, dataTypes, keys, resultArray,reqUrl,field,miniField);
			}
		});
	});
}

/**
 * 表单多行内数据源联动赋值
 * @param e	 				miniui事件对象
 * @param datagirdEnfield	表单多行控件enfield
 * @param url				数据源地址
 * @param columnEnfields	被联动列enfield，逗号分隔
 * @param keys				取值key，逗号分隔
 * @param dataTypes         赋值类型，逗号分隔（目前赋值类型不可设置，默认为value）
 */
function setReactionDataForDatagirdCell(e, datagirdEnfield, url, columnEnfields, keys, dataTypes) {
	var grid = mini.get(datagirdEnfield),
		currRow = grid.getEditorOwnerRow(e.sender),
		parValue = e.sender.getValue();

	'datepicker' == e.sender.type && (parValue = e.sender.getText()); // 日期时间取text

	$.ajax({
		url: basePath + 'flowcfg/synergy_form/parseUrl.htm',
		type: 'post',
		data: {
			url : url,
			parValue : parValue
		},
		success: function (parsedUrl) {
			// 不是以http或者https开头，默认会加一个当前项目的路径
			parsedUrl.indexOf('http')!=0 && (parsedUrl = basePath + parsedUrl);

			$.ajax({
				url: encodeURI(parsedUrl),
				dataType: 'json',
				success: function(data){
					data = data instanceof Array ? data[0] : data;

					// 移动端预览页，不需要赋值
					if(getItem('cooperate-forms-data'))
						return;

					columnEnfields = columnEnfields.split(',');
					keys = keys.split(',');
					// dataTypes = dataTypes.split(',');

					var rowData = {};
					for(var i=0; i<columnEnfields.length; i++){
						var columnEnfield = columnEnfields[i],
							key = keys[i],
							// dataType = dataTypes[i],
							column = grid.getColumn(columnEnfield),
							value = data[key].toString();

						if (value && value.indexOf('@#@') != -1)
							value = value.split('@#@')[0];

						if(!column)
						    continue;

						rowData[column.field] = value;
					}

					grid.updateRow(currRow, rowData);
				}
			});
		}
	});
}


function getJsonLength(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key))
			size++;
	}
	return size;
};

/**
 * 预览页赋值
 */
function resetData(keyText, formId) {
	var form = new mini.Form("form");
	var formdata = mini.decode(sessionStorage.getItem("cooperate-forms-data"));
	var formJson = formdata.formJson;
	for (var i = 0; i < formJson.length; i++) {
		var data = formJson[i];
		if (data.formFieldRight) {
			$.each(data.formFieldRight, function(key, val) {
				if (val == "hidden") {
					// 表单多行的列
					if(key.indexOf('@#@datagrid@#@') != -1){
						var idArr = key.split('@#@datagrid@#@');
						mini.get(idArr[0]).hideColumn(idArr[1]);
					}else{
						$("#" + key).hide();
					}
				}
			});
		}
		if (getJsonLength(data) <= 2) {
			return;
		}
		if (data.formId === formId) {
			// form.setEnabled(false);
			var fields = form.getFields();
			for (var i = 0, l = fields.length; i < l; i++) {
				var c = fields[i];
				if (c.setRequired) {
					c.setRequired(false); // 去掉必填项
				}
				if (c.setEnabled) {
					// c.setEnabled(false); // 不允许编辑
				}
				if (c.setReadOnly) {
					c.setReadOnly(true); // 只读
				}
				if (c.setIsValid) {
					c.setIsValid(true); // 去除错误提示
				}
				if (c.addCls) {
					c.addCls("smart-form-label"); // 增加asLabel外观
				}
				if (data.formFieldRight && data.formFieldRight[c.id] && data.formFieldRight[c.id] === 'hidden') {
					// 隐藏该控件
					c.setVisible(false);
				}
			}
			var servicData = mini.decode(sessionStorage.getItem("cooperateService-forms-data") || "{}");
			var servicFormData = servicData[formId] || {};
			data = $.extend({}, servicFormData, data);
			// 合并fldLinks字段
			var newFldLinks = JSON.parse(servicFormData.fldLinks || "[]").concat(JSON.parse(data.fldLinks));
			data.fldLinks = JSON.stringify(newFldLinks);

			var size = 0;
			for ( var key in data) {
				if (data.hasOwnProperty(key)) {
					size++;
				}
			}

			if (!(size === 4 && data.hasOwnProperty("formId") && data.hasOwnProperty("fldLinks") && data.hasOwnProperty("formFmclassify") && data.hasOwnProperty("formFieldRight"))) {
				form.setData(data);

                // 格式化日期时间控件显示格式
				window.initDateFormat && initDateFormat();
			}

			var combobox = $(".control-mini-combobox");
			for (var i = 0; i < combobox.length; i++) {
				var cid = combobox[i].id;
				var comb = mini.get(cid);
				if (comb) {
					var cvalue = data[cid];
					var citems = cvalue.split("@#@")[0];
					var citemsText = cvalue.split("@#@")[1];
					if (cvalue && comb.data.length > 0) {
						comb.setValue(citems);
					} else {
						comb.setValue(citems);
						comb.setText(citemsText);
					}
					comb.doValueChanged();
				}
			}

			var checkboxlist = $(".control-mini-checkboxlist");
			for (var i = 0; i < checkboxlist.length; i++) {
				var cid = checkboxlist[i].id;
				var comb = mini.get(cid);
				if (comb) {
					var cvalue = data[cid];
					if (cvalue) {
						if (comb.data.length == 0) {
							comb.setData(this.genDataSource(cvalue, comb.valueField, comb.textField));
						}
						var citems = cvalue.split("@#@")[0];
						comb.setValue(citems);
						comb.doValueChanged();
					}
				}
			}

			var radiobuttonlist = $(".control-mini-radiobuttonlist");
			for (var i = 0; i < radiobuttonlist.length; i++) {
				var cid = radiobuttonlist[i].id;
				var comb = mini.get(cid);
				if (comb) {
					var cvalue = data[cid];
					if (cvalue) {
						if (comb.data.length == 0) {
							comb.setData(this.genDataSource(cvalue, comb.valueField, comb.textField));
						}
						var citems = cvalue.split("@#@")[0];
						comb.setValue(citems);
						comb.doValueChanged();
					}
				}
			}

			var buttonedit = $(".control-mini-buttonedit");
			for (var i = 0; i < buttonedit.length; i++) {
				var bid = buttonedit[i].id;
				var but = mini.get(bid);
				if (but) {
					var bvalue = data[bid];
					if (bvalue) {
						var value = bvalue.split("@#@")[1];
						but.setText(value);
					}
				}
			}

			$('.mini-barcode').each(function(){
				var $this = $(this);
				if($this.attr('barcodetype') == 'lsh'){
					var enfield = $this.attr('enfield'),
						value = data[enfield];
					$('#' + enfield).text(value);

					if(value && value.indexOf("@") != -1 && (
                        value.indexOf("FIXED") != -1
                        || value.indexOf("RANDOM") != -1
                        || value.indexOf("SERIAL") != -1)){
                        $('#' + enfield).hide();
					}
				}
			});

			var signature = $(".flow-signature");
			for (var i = 0; i < signature.length; i++) {
				var signid = signature[i].id;
                if(data[signid]){
                    $("#" + signid).attr("src", basePath + data[signid]);
                    $("#" + signid).removeAttr("onclick");
				}else{
                    $("#" + signid).hide();
				}

			}

			var province = $(".control-mini-province");
			for (var i = 0; i < province.length; i++) {
				var pid = province[i].id;
				var pc = mini.get(pid);
				pc.setData(initProvince(pid));
				if (data[pid]) {
					var pv = data[pid].split("@#@")[0];
					pc.setValue(pv);
				}
			}

			var city = $(".control-mini-city");
			for (var i = 0; i < city.length; i++) {
				var cid = city[i].id;
				var cc = mini.get(cid);
				cc.setData(initCity(cid.split("_")[0] + '_province', cid));
				if (data[cid]) {
					var cv = data[cid].split("@#@")[0];
					cc.setValue(cv);
				}
			}

			var county = $(".control-mini-county");
			for (var i = 0; i < county.length; i++) {
				var coid = county[i].id;
				var coc = mini.get(coid);
				coc.setData(initCounty(coid.split("_")[0] + '_city', coid));
				if (data[coid]) {
					var cov = data[coid].split("@#@")[0];
					coc.setValue(cov);
				}
			}

			var grid = $(".control-mini-datagrid");
			for (var i = 0; i < grid.length; i++) {
				var gid = grid[i].id;
				var gt = mini.get("toolbar_" + gid);
				gt.setVisible(false);
				var g = mini.get(gid);
				g.setEnabled(false);
				g.setData(mini.decode(data[gid]));
                if(grid[i].className.indexOf("control-mini-datagrid annex")!=-1){
                    g.hideColumn(1);
                }else{
                    g.hideColumn(0);

                    // 隐藏表单多行内附件控件的操作列
					g.getColumns().forEach(function(item){
						item.name == '_annexPic' && g.hideColumn(item);
					});
				}
			}

			var coordinates = $(".control-mini-coordinate");
			for (var i = 0; i < coordinates.length; i++) {
				var coid = coordinates[i].id;
				var addressArr = data[coid].split("@#@");
				var addressVal = addressArr[1];
				$(coordinates[i]).text(addressVal);
				$(coordinates[i]).attr("href", 'http://uri.amap.com/marker?position=' + addressArr[0]);
			}

			var photo = $(".flow-userphoto");
			for (var i = 0; i < photo.length; i++) {
				var pid = photo[i].id,
					value = data[pid],
					src = value.indexOf('/') == -1
						? basePath + "user/photo.htm?uid=" + value
						: basePath + value;
				$("#" + pid).attr("src", src);
			}

			// 设置多行控件高度
            var heightIncrement = 0;
			$('textarea.mini-textbox-input').each(function(){
				var diff = this.scrollHeight - this.clientHeight;
				if(diff > 0){
                    $(this).height(this.scrollHeight)
                        .parents('.mini-textarea')
                        .height((this.scrollHeight + 2));
                    heightIncrement += diff;
				}
			});
			var $firstDiv = $("body").find("div:first").find("div:first"),
                $iframe = window.parent.$('iframe#' + formId),
                $formPanels = window.parent.$("#formPanels"),
                firstDivScrollHeight = $firstDiv[0].scrollHeight;
            $firstDiv.height(firstDivScrollHeight);
            $iframe.height(firstDivScrollHeight + 60);
            $formPanels.height($formPanels.height() + heightIncrement);

			data.formFieldRight.form_id = formId;
			showOrHide(mini, data.fldLinks, data.formFmclassify, window, data.formFieldRight);
			return;
		}
	}

}

/**
 * 给单选框和复选框中生成数据源
 *
 * @param data
 */
function genDataSource(data, valueField, textField) {
	var dataArray = new Array();
	// 402880ef5ba2cb92015ba31188ee0013,402880ef5ba2cb92015ba31188ee0014,402880ef5ba2cb92015ba31188ee0015@#@单行文本,下拉菜单,单行文本
	var values = data.split("@#@")[0];
	var texts = data.split("@#@")[1];
	var length = values.split(",").length;
	for (var i = 0; i < length; i++) {
		var object = {};
		object[valueField] = values.split(",")[i];
		object[textField] = texts.split(",")[i];
		dataArray.push(object);
	}
	return dataArray;
}

/**
 * 预览页查询赋值
 */
var formIdTmp;
function loadData(keyText, formId) {
	var form = new mini.Form("form");
	var cooperatedata = mini.decode(sessionStorage.getItem("cooperate-instance"));
	var type = cooperatedata.cooperateStatus;
	var editLocked = cooperatedata.editLocked;
	formIdTmp = formId;

	onSubmit(basePath + "cooperative/queryFormsValue.htm", "post", {
		formId : formId,
		instId : keyText,
		type : type,
		editLocked : editLocked
	}, false, function(json) {
		var data = mini.decode(json);
		if (data.formFieldRight) {
			$.each(data.formFieldRight, function(key, val) {
				if (val == "hidden") {
					$("#" + key).hide();
				}
			});
		}
		// 将服务器端的数据缓存到本地
		var tmpdata = mini.decode(sessionStorage.getItem("cooperateService-forms-data") || "{}");
		tmpdata[formIdTmp] = data;
		sessionStorage.setItem("cooperateService-forms-data", mini.encode(tmpdata));
		// form.setEnabled(false);
		var fields = form.getFields();
		for (var i = 0, l = fields.length; i < l; i++) {
			var c = fields[i];
			if (c.setRequired) {
				c.setRequired(false); // 去掉必填项
			}
			if (c.setEnabled) {
				// c.setEnabled(false); // 不允许编辑
			}
			if (c.setReadOnly) {
				c.setReadOnly(true); // 只读
			}
			if (c.setIsValid) {
				c.setIsValid(true); // 去除错误提示
			}
			if (c.addCls) {
				c.addCls("smart-form-label"); // 增加asLabel外观
			}
			if (data.formFieldRight && data.formFieldRight[c.id] && data.formFieldRight[c.id] === 'hidden') {
				// 隐藏该控件
				c.setVisible(false);
			}
		}

		form.setData(data);

		var opinionFieldEnName = data.opinionFieldEnName;
		if (opinionFieldEnName) {
			for (var i = 0; i < opinionFieldEnName.split(",").length; i++) {
				var key = opinionFieldEnName.split(",")[i];
				if(!key){
					continue;
				}
				var value = data[key];
				var obj = document.getElementById(key + "$text");
				var opinionValue = "";
				if (value.indexOf("[") != -1) {
					var opinionList = mini.decode(value);
					for (var j = 0; j < opinionList.length; j++) {
						var logMsg = opinionList[j].logUserMsg;	//处理意见
						var logUserName = opinionList[j].logUserName;	//处理人
						var logUserTime = opinionList[j].logUserTime;	//处理时间
						//var logShowNameDate = opinionList[j].logShowNameDate;

						// zorzhi 181113 update
						var logShowSignatureName = opinionList[j].logShowSignatureName;	//是否显示署名
						var logUserSignature = opinionList[j].logUserSignature;	//是否显示签名
						var showSignatureDateFormat = opinionList[j].showSignatureDateFormat;	//显示日期格式
						opinionValue += "<div id='" + key + "' style='text-align: left; padding: 10px 25px;'>";
						if(logMsg != '') {	//表示有处理意见
							//zorzhi 181129 add (替换意见域内容换行</br>)
							if(logMsg.indexOf("&lt;/br&gt;")){
								logMsg = logMsg.replaceAll("&lt;/br&gt;","</br>")
							}

							if(logShowSignatureName == "false"){
								opinionValue += "<div>" + logMsg + "</div>";
							}else{
								opinionValue += "<div>" + logMsg + "</div>";
								opinionValue += "<div style='height: 35px; line-height: 35px;'>";
								if(logUserSignature){
									opinionValue += "<span style='float: left;'></span><div style='display: inline-block; float: left; height: 100%; text-align: center;'><div style=' display: inline-block;'><img style='max-height: 35px; max-width: "+window.outerWidth/25+"px; padding-top: "+window.outerWidth/150+"px; float: left;' src='" + basePath + opinionList[j].logUserSignature + "' /></div></div>";
								}else{
									opinionValue += "<span style='float: left;'>" + logUserName + "</span>";
								}
							}
							if(logUserTime){	//日期存在，表示显示
								var dateTime = getDateFormat(showSignatureDateFormat,logUserTime); //datepickerShowStyle.js中方法
								if(dateTime){
									opinionValue += "<span style='float: left; padding-left: 10px;'>" + dateTime + "</span>";
								}else{
									opinionValue += "<span style='float: left; padding-left: 10px;'>" + mini.formatDate(mini.parseDate(logUserTime), "yyyy年M月d日") + "</span>";
								}
							}

						} else {	//没有处理意见
							opinionValue += "<div style='height: 35px; line-height: 35px;'>";
							if(logShowSignatureName == "true"){
								if(logUserSignature){
									opinionValue += "<div style='display: inline-block; float: left; height: 100%; text-align: center;'><div style=' display: inline-block;'><img style='max-height: 35px; max-width: "+window.outerWidth/25+"px; padding-top: "+window.outerWidth/150+"px; float: left;' src='" + basePath + opinionList[j].logUserSignature + "' /></div></div>";
								}else{
									opinionValue += "<span style='float: left;'>" + logUserName + "</span>";
								}
							}
							if(logUserTime){	//日期存在，表示显示
								var dateTime = getDateFormat(showSignatureDateFormat,logUserTime);
								if(dateTime){
									opinionValue += "<span style='float: left; padding-left: 10px;'>" + dateTime + "</span>";
								}else{
									opinionValue += "<span style='float: left; padding-left: 10px;'>" + mini.formatDate(mini.parseDate(logUserTime), "yyyy年M月d日") + "</span>";
								}
							}
						}
						opinionValue += "</div>";
						opinionValue += "</div>";
					}
				} else {
					opinionValue = value;
				}
				if (opinionValue && opinionValue != '' && opinionValue != null) {
					//$(obj).parent().parent().parent().html(opinionValue);
					//pMini.get(key).hide();
					//修复在控件的同一级中存在同胞元素时会被替换
					//新增字体、字号class
					var opinionClass = $(obj).parent().parent().attr("class");
					var newClass = "";
					for (var c = 0; c < opinionClass.split(" ").length; c++) {
						if (opinionClass.split(" ")[c].indexOf("mini") == -1) {
							newClass += opinionClass.split(" ")[c] + " ";
						}
					}
					$(obj).parent().parent().replaceWith('<div class="'+newClass+'">' + opinionValue + '</div>');
				}
			}
		}

		var combobox = $(".control-mini-combobox");
		for (var i = 0; i < combobox.length; i++) {
			var cid = combobox[i].id;
			var comb = mini.get(cid);
			if (comb) {
				var cvalue = data[cid];
				var citems = cvalue.split("@#@")[0];
				var citemsText = cvalue.split("@#@")[1];
				if (cvalue && comb.data.length > 0) {
					comb.setValue(citems);
				} else {
					comb.setValue(citems);
					comb.setText(citemsText);
				}
			}
		}

		var checkboxlist = $(".control-mini-checkboxlist");
		for (var i = 0; i < checkboxlist.length; i++) {
			var cid = checkboxlist[i].id;
			var comb = mini.get(cid);
			if (comb) {
				var cvalue = data[cid];
				if (cvalue) {
					if (comb.data.length == 0) {
						comb.setData(this.genDataSource(cvalue, comb.valueField, comb.textField));
					}
					var citems = cvalue.split("@#@")[0];
					comb.setValue(citems);
				}
			}
		}

		var radiobuttonlist = $(".control-mini-radiobuttonlist");
		for (var i = 0; i < radiobuttonlist.length; i++) {
			var cid = radiobuttonlist[i].id;
			var comb = mini.get(cid);
			if (comb) {
				var cvalue = data[cid];
				if (cvalue) {
					if (comb.data.length == 0) {
						comb.setData(this.genDataSource(cvalue, comb.valueField, comb.textField));
					}
					var citems = cvalue.split("@#@")[0];
					comb.setValue(citems);
				}
			}
		}

		var buttonedit = $(".control-mini-buttonedit");
		for (var i = 0; i < buttonedit.length; i++) {
			var bid = buttonedit[i].id;
			var but = mini.get(bid);
			if (but) {
				var bvalue = data[bid];
				if (bvalue) {
					var value = bvalue.split("@#@")[1];
					but.setText(value);
				}
			}
		}

		var signature = $(".flow-signature");
		for (var i = 0; i < signature.length; i++) {
			var signid = signature[i].id;
			if(data[signid]){
				$("#" + signid).attr("src", basePath + data[signid]);
				$("#" + signid).removeAttr("onclick");
			}else{
				$("#" + signid).hide();
			}
		}

		var province = $(".control-mini-province");
		for (var i = 0; i < province.length; i++) {
			var pid = province[i].id;
			var pc = mini.get(pid);
			pc.setData(initProvince(pid));
			var pv = data[pid].split("@#@")[0];
			pc.setValue(pv);
		}

		var city = $(".control-mini-city");
		for (var i = 0; i < city.length; i++) {
			var cid = city[i].id;
			var cc = mini.get(cid);
			cc.setData(initCity(cid.split("_")[0] + '_province', cid));
			var cv = data[cid].split("@#@")[0];
			cc.setValue(cv);
		}

		var county = $(".control-mini-county");
		for (var i = 0; i < county.length; i++) {
			var coid = county[i].id;
			var coc = mini.get(coid);
			coc.setData(initCounty(coid.split("_")[0] + '_city', coid));
			var cov = data[coid].split("@#@")[0];
			coc.setValue(cov);
		}

		var grid = $(".control-mini-datagrid");
		for (var i = 0; i < grid.length; i++) {
			var gid = grid[i].id;
			var gt = mini.get("toolbar_" + gid);
			gt.setVisible(false);
			var g = mini.get(gid);
			g.setEnabled(false);
			g.setData(mini.decode(data[gid]));
			if(grid[i].className.indexOf("control-mini-datagrid annex")!=-1){
				g.hideColumn(1);
			}else{
				g.hideColumn(0);
			}
		}

		var photo = $(".flow-userphoto");
		for (var i = 0; i < photo.length; i++) {
			var pid = photo[i].id;
			$("#" + pid).attr("src", basePath + "user/photo.htm?uid=" + data[pid]);
		}

		var coordinates = $(".control-mini-coordinate");
		for (var i = 0; i < coordinates.length; i++) {
			var coid = coordinates[i].id;
			var addressArr = data[coid].split("@#@");
			var addressVal = addressArr[1];
			$(coordinates[i]).text(addressVal);
			$(coordinates[i]).attr("href", 'http://uri.amap.com/marker?position=' + addressArr[0]);
		}

		var textareas = $(".control-mini-textarea");
		for (var i = 0; i < textareas.length; i++) {
			var textarea = textareas[i],
				$textarea = textareas.eq(i),
				textareaId = textarea.id,
				value = data[textareaId];

			//需求：多行文本是意见域时，默认值多显示‘发起人签名’，如果选中，则在后续环节 多行文本会显示‘发起人签名’。
			//zorzhi 181210 add (流程发起页面，不需要显示‘发起人签名图片’)
			//originatorSignature 表示发起人签名
			if(value == "originatorSignature"){
				(function($textarea){
					onSubmit(basePath + "cooperative/queryOriginatorSignature.htm", "post",
						{instId : keyText}, true, function(json) {
							json = mini.decode(json);

							var clazz = $textarea.attr('class').replace(/\S*mini-\S*/g, ''),
								wrapper = $('<div style="height: 40px; max-width: 200px; overflow: hidden;padding: 10px; display: flex; justify-content: center; align-items: center;" class="'+ clazz +'">');
							if(json.originatorSignature){
								wrapper.append('<img style="max-width: 200px; max-height: 40px;" src="' +  basePath + json.originatorSignature + '">')
							}else{
								wrapper.text(json.originatorName);
							}

							$textarea.hide().after(wrapper);
						});
				})($textarea);
			}
		}


        data.formFieldRight = data.formFieldRight || {};
        data.formFieldRight.form_id = formId;
        showOrHide(mini, data.fldLinks, data.formFmclassify, window, data.formFieldRight);
	});
	resetData(keyText, formId);

	// 格式化日期时间控件显示格式
	window.initDateFormat && initDateFormat();

}

function initData(id, func) {
	onSubmit(basePath + 'flowcfg/synergy_form/parseDataSource.htm', 'post', {
		id : id
	}, false, function(json) {
		var dataArray = mini.decode(json);
		var funcAfter = (function(size, func){
			return function(){
				if(--size < 1){
					func();
				}
			}
		})(dataArray.length, func);

		if(!dataArray.length){
			func();
		}

		for (var i = 0; i < dataArray.length; i++) {
			var dataSource = dataArray[i];
			var url = dataSource.url;
			if (url.indexOf("http") == -1) { // 不是以http或者https开头，默认会加一个当前项目的路径
				url = basePath + url;
			}
			$.ajax({
				url : url,
				type : "get",
				async : false,
				dataType : "json",
				success : function(json) {
					var result = new Array();
					if (typeof (json) == "string") { // 返回结果是字符串
						result = mini.encode(json);
					} else {
						result = json;
					}
					// 解析dataArray中的values，分别赋值
					var valueArray = mini.decode(dataSource.values);
					for (var i = 0; i < valueArray.length; i++) {
						var object = valueArray[i];
						if (object.key) { // 说明是需要根据key来获取某一个值
							if (result instanceof Array) {
								if (result.length >= 1) { // 取第一个来获取值
                                    mini.get(object.enfield) && mini.get(object.enfield).setValue && mini.get(object.enfield).setValue(result[0][object.key]);
								}
							} else {
                                mini.get(object.enfield) && mini.get(object.enfield).setValue && mini.get(object.enfield).setValue(result[object.key]);
							}
						} else { // 需要将获取到的值都通过setData方法来赋值
						    // 2018.07.25 修复字段不存在、字段类型改变导致的移动端预览页报错
                            mini.get(object.enfield) && mini.get(object.enfield).setData && mini.get(object.enfield).setData(result);
						}
					}
				},
				complete: function(){
                    funcAfter();
				}
			});
		}
	});
}

/**
 * 表单多行控件加载完成后，如果是空记录，给加两行空的
 *
 * @param e
 */
function onupdate_grid(e) {
//	var grid = e.sender;
//	if (grid && grid.data.length == 0) {
//		var newRow1 = {};
//		mini.get(grid.id).addRow(newRow1, 0);
//		var newRow2 = {};
//		mini.get(grid.id).addRow(newRow2, 0);
//	}

}

/**
 * 下拉选择框或者单选框组触发了点击事件，会执行以下方法
 *
 * @param linkData
 *            联动数据JSON串
 * @param fmclassify
 *            表单分类（2:简易模式;1:高级模式）
 */
function linkItemChange(linkData, fmclassify) {
	var form_id = parent.mini.get("mainTabs").getActiveTab().name;
	var linkObject = mini.decode(linkData);
	var id = linkObject.fld, array = linkObject.linkFlds, text = '', filterArray = [];
	text = parent.getFldText(mini, id);
	for (var i = 0; i < array.length; i++) {
		var object = array[i];
		if (!parent.isNeedLink(parent.formFieldRightObjectArray, object.linkFld, form_id)) {
			continue;
		}
		if('eq' == object.inOrEq){//如果配置项等于 选项值时
			// 先处理和当前联动控件选项值不相同的(做反向处理)，再处理联动控件和被联动控件值相同的
			if (text != object.itemText) {
				parseLinkChangeState(fmclassify,text,object);
			} else {
				filterArray.push(object);
			}
		}else if('in' == object.inOrEq){//如果配置项 包含选项值时
			 if (text.indexOf(object.itemText) > -1){ //如果包含，那么就想取选项值 是否显示/隐藏
				 parseLinkChangeState(fmclassify,object.itemText,object);
			 } else {// 如果不包含，那么就隐藏
				 parseLinkChangeState(fmclassify,text,object);
			 }
		}
		
	}
	for (var j = 0; j < filterArray.length; j++) {
		var linkFldObject = filterArray[j];
		if (!parent.isNeedLink(parent.formFieldRightObjectArray, object.linkFld, form_id)) {
			continue;
		}
		if (linkFldObject.fldType == 'mini-textbox') {
			linkItemChange_textbox(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-textarea') {
			linkItemChange_textarea(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-combobox') {
			linkItemChange_combobox(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-radiobuttonlist') {
			linkItemChange_radiobuttonlist(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-checkboxlist') {
			linkItemChange_checkboxlist(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-spinner') {
			linkItemChange_spinner(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-datepicker') {
			linkItemChange_datepicker(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-buttonedit') {
			linkItemChange_buttonedit(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-area') {
			linkItemChange_area(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-annex') {
			linkItemChange_annex(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'flow-signature') {
			linkItemChange_signature(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'flow-userphoto') {
			linkItemChange_userphoto(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-javascript') {
			linkItemChange_javascript(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-coordinate') {
			linkItemChange_coordinate(fmclassify, text, linkFldObject);
		} else if (linkFldObject.fldType == 'mini-datagrid') {
			linkItemChange_datagrid(fmclassify, text, linkFldObject);
		}

		// 2019.05.15 关联元素显隐
		if((linkFldObject.itemText == text) == (linkFldObject.showOrHide == 'show')){
			$('.' + linkFldObject.linkFld + '-related-ele').show();
		} else {
			$('.' + linkFldObject.linkFld + '-related-ele').hide();
		}
	}
}


function parseLinkChangeState(fmclassify,text,object) {
	if (object.fldType == 'mini-textbox') {
		linkItemChange_textbox(fmclassify, text, object);
	} else if (object.fldType == 'mini-textarea') {
		linkItemChange_textarea(fmclassify, text, object);
	} else if (object.fldType == 'mini-combobox') {
		linkItemChange_combobox(fmclassify, text, object);
	} else if (object.fldType == 'mini-radiobuttonlist') {
		linkItemChange_radiobuttonlist(fmclassify, text, object);
	} else if (object.fldType == 'mini-checkboxlist') {
		linkItemChange_checkboxlist(fmclassify, text, object);
	} else if (object.fldType == 'mini-spinner') {
		linkItemChange_spinner(fmclassify, text, object);
	} else if (object.fldType == 'mini-datepicker') {
		linkItemChange_datepicker(fmclassify, text, object);
	} else if (object.fldType == 'mini-buttonedit') {
		linkItemChange_buttonedit(fmclassify, text, object);
	} else if (object.fldType == 'mini-area') {
		linkItemChange_area(fmclassify, text, object);
	} else if (object.fldType == 'mini-annex') {
		linkItemChange_annex(fmclassify, text, object);
	} else if (object.fldType == 'flow-signature') {
		linkItemChange_signature(fmclassify, text, object);
	} else if (object.fldType == 'flow-userphoto') {
		linkItemChange_userphoto(fmclassify, text, object);
	} else if (object.fldType == 'mini-javascript') {
		linkItemChange_javascript(fmclassify, text, object);
	} else if (object.fldType == 'mini-coordinate') {
		linkItemChange_coordinate(fmclassify, text, object);
	} else if (object.fldType == 'mini-datagrid') {
		linkItemChange_datagrid(fmclassify, text, object);
	}

	// 2019.07.02 关联元素显隐
	if((object.itemText == text) == (object.showOrHide == 'show')){
		$('.' + object.linkFld + '-related-ele').show();
	} else {
		$('.' + object.linkFld + '-related-ele').hide();
	}
}


/**
 * 联动控件选择值以后，被联动的控件是单行文本
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_textbox(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		} else {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).setRequired(true);
		} else {
			mini.get(object.linkFld).setRequired(false);
		}
	} else {
		if (object.showOrHide == 'show') {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是多行文本框
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_textarea(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		} else {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).setRequired(true);
		} else {
			mini.get(object.linkFld).setRequired(false);
		}
	} else {
		if (object.showOrHide == 'show') {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是下拉选择框
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_combobox(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		} else {
			mini.get(object.linkFld).setValue('');
			mini.get(object.linkFld).setText('');
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).setRequired(true);
		} else {
			mini.get(object.linkFld).setRequired(false);
		}
	} else {
		if (object.showOrHide == 'show') {
			mini.get(object.linkFld).setValue('');
			mini.get(object.linkFld).setText('');
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		}
	}

	for (var q = 0, fldLinksLen = parent.fldLinksArray.length; q < fldLinksLen; q ++) {
		if (object.linkFld == parent.fldLinksArray[q].fld) {
			linkItemChange(mini.encode(parent.fldLinksArray[q]), fmclassify);
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是单选框组
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_radiobuttonlist(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		} else {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).setRequired(true);
		} else {
			mini.get(object.linkFld).setRequired(false);
		}
	} else {
		if (object.showOrHide == 'show') {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		}
	}
	for (var q = 0, fldLinksLen = parent.fldLinksArray.length; q < fldLinksLen; q ++) {
		if (object.linkFld == parent.fldLinksArray[q].fld) {
			linkItemChange(mini.encode(parent.fldLinksArray[q]), fmclassify);
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是复选框组
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_checkboxlist(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		} else {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).setRequired(true);
		} else {
			mini.get(object.linkFld).setRequired(false);
		}
	} else {
		if (object.showOrHide == 'show') {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		}
	}

//	for (var q = 0, fldLinksLen = parent.fldLinksArray.length; q < fldLinksLen; q ++) {
//		if (object.linkFld == parent.fldLinksArray[q].fld) {
//			linkItemChange(mini.encode(parent.fldLinksArray[q]), fmclassify);
//		}
//	}
}

/**
 * 联动控件选择值以后，被联动的控件是数值调节器
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_spinner(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		} else {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).setRequired(true);
		} else {
			mini.get(object.linkFld).setRequired(false);
		}
	} else {
		if (object.showOrHide == 'show') {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是日期时间
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_datepicker(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		} else {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).setRequired(true);
		} else {
			mini.get(object.linkFld).setRequired(false);
		}
	} else {
		if (object.showOrHide == 'show') {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是组织机构控件
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_buttonedit(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		} else {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).setRequired(true);
		} else {
			mini.get(object.linkFld).setRequired(false);
		}
	} else {
		if (object.showOrHide == 'show') {
			mini.get(object.linkFld).setValue('');
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").hide();
			} else {
				mini.get(object.linkFld).hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").show();
			} else {
				mini.get(object.linkFld).show();
			}
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是区域控件
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_area(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld + '_province').closest("li").show();
			} else {
				mini.get(object.linkFld + '_province').show();
				mini.get(object.linkFld + '_city').show();
				mini.get(object.linkFld + '_county').show();
			}
		} else {
			mini.get(object.linkFld + '_province').setValue('');
			mini.get(object.linkFld + '_city').setValue('');
			mini.get(object.linkFld + '_county').setValue('');
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld + '_province').closest("li").hide();
			} else {
				mini.get(object.linkFld + '_province').hide();
				mini.get(object.linkFld + '_city').hide();
				mini.get(object.linkFld + '_county').hide();
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld + '_province').setRequired(true);
			mini.get(object.linkFld + '_city').setRequired(true);
			mini.get(object.linkFld + '_county').setRequired(true);
		} else {
			mini.get(object.linkFld + '_province').setRequired(false);
			mini.get(object.linkFld + '_city').setRequired(false);
			mini.get(object.linkFld + '_county').setRequired(false);
		}
	} else {
		if (object.showOrHide == 'show') {
			mini.get(object.linkFld + '_province').setValue('');
			mini.get(object.linkFld + '_city').setValue('');
			mini.get(object.linkFld + '_county').setValue('');
			if (fmclassify == '2') {
				$('#' + object.linkFld + '_province').closest("li").hide();
			} else {
				mini.get(object.linkFld + '_province').hide();
				mini.get(object.linkFld + '_city').hide();
				mini.get(object.linkFld + '_county').hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld + '_province').closest("li").show();
			} else {
				mini.get(object.linkFld + '_province').show();
				mini.get(object.linkFld + '_city').show();
				mini.get(object.linkFld + '_county').show();
			}
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是表单多行控件
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_datagrid(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#toolbar_' + object.linkFld).closest("li").show();
			} else {
				$('#toolbar_' + object.linkFld).show(); // 显示工具条
				mini.get(object.linkFld).show(); // 显示列表
			}
		} else {
			// 清空列表页数据
			// ...
			if (fmclassify == '2') {
				// 简易模式
				$('#toolbar_' + object.linkFld).closest("li").hide();
			} else {
				$('#toolbar_' + object.linkFld).hide(); // 隐藏工具条
				mini.get(object.linkFld).hide(); // 隐藏列表
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).addCls('gridRequired'); // 增加必填的样式类
		} else {
			mini.get(object.linkFld).removeCls('gridRequired'); // 移除必填的样式类
		}
	} else {
		if (object.showOrHide == 'show') {
			// 清空列表页
			// ...
			if (fmclassify == '2') {
				$('#toolbar_' + object.linkFld).closest("li").hide();
			} else {
				$('#toolbar_' + object.linkFld).hide(); // 隐藏工具条
				mini.get(object.linkFld).hide(); // 隐藏列表
			}
			mini.get(object.linkFld).removeCls('gridRequired'); // 移除必填的样式类
		} else {
			if (fmclassify == '2') {
				$('#toolbar_' + object.linkFld).closest("li").show();
			} else {
				$('#toolbar_' + object.linkFld).show(); // 显示工具条
				mini.get(object.linkFld).show(); // 显示列表
			}
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是附件控件
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_annex(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#toolbar_' + object.linkFld).closest("li").show();
			} else {
				$('#toolbar_' + object.linkFld).show(); // 显示工具条
				mini.get(object.linkFld).show(); // 显示列表
			}
		} else {
			// 清空列表页数据
			// ...
			if (fmclassify == '2') {
				// 简易模式
				$('#toolbar_' + object.linkFld).closest("li").hide();
			} else {
				$('#toolbar_' + object.linkFld).hide(); // 隐藏工具条
				mini.get(object.linkFld).hide(); // 隐藏列表
			}
		}
		if (object.required == 'true') {
			mini.get(object.linkFld).addCls('gridRequired'); // 增加必填的样式类
		} else {
			mini.get(object.linkFld).removeCls('gridRequired'); // 移除必填的样式类
		}
	} else {
		if (object.showOrHide == 'show') {
			// 清空列表页
			// ...
			if (fmclassify == '2') {
				$('#toolbar_' + object.linkFld).closest("li").hide();
			} else {
				$('#toolbar_' + object.linkFld).hide(); // 隐藏工具条
				mini.get(object.linkFld).hide(); // 隐藏列表
			}
			mini.get(object.linkFld).removeCls('gridRequired'); // 移除必填的样式类
		} else {
			if (fmclassify == '2') {
				$('#toolbar_' + object.linkFld).closest("li").show();
			} else {
				$('#toolbar_' + object.linkFld).show(); // 显示工具条
				mini.get(object.linkFld).show(); // 显示列表
			}
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是位置控件
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_coordinate(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").show();
			} else {
				$('#' + object.linkFld).show();
			}
		} else {
			if (fmclassify == '2') {
				// 简易模式
				$('#' + object.linkFld).closest("li").hide();
			} else {
				$('#' + object.linkFld).hide();
			}
		}
		if (object.required == 'true') {

		} else {

		}
	} else {
		if (object.showOrHide == 'show') {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").hide();
			} else {
				$('#' + object.linkFld).hide();
			}
		} else {
			if (fmclassify == '2') {
				$('#' + object.linkFld).closest("li").show();
			} else {
				$('#' + object.linkFld).show();
			}
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是脚本控件
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_javascript(fmclassify, text, object) {

}

/**
 * 联动控件选择值以后，被联动的控件是头像控件
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_userphoto(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			$('#' + object.linkFld).show();
		} else {
			$('#' + object.linkFld).hide();
		}
		if (object.required == 'true') {

		} else {

		}
	} else {
		if (object.showOrHide == 'show') {
			$('#' + object.linkFld).hide();
		} else {
			$('#' + object.linkFld).show();
		}
	}
}

/**
 * 联动控件选择值以后，被联动的控件是签章控件
 *
 * @param fmclassify
 *            表单分类
 * @param text
 *            下拉、单选框选择的文本
 * @param object
 *            被联动控件
 */
function linkItemChange_signature(fmclassify, text, object) {
	if (text == object.itemText) { // 当前的选择项和当前循环的配置项相等
		if (object.showOrHide == 'show') {
			$('#' + object.linkFld).show();
		} else {
			$('#' + object.linkFld).hide();
		}
		if (object.required == 'true') {
			$('#' + object.linkFld).addClass('signatureRequired');
		} else {
			$('#' + object.linkFld).removeClass('signatureRequired');
		}
	} else {
		if (object.showOrHide == 'show') {
			$('#' + object.linkFld).hide();
			$('#' + object.linkFld).removeClass('signatureRequired');
		} else {
			$('#' + object.linkFld).show();
		}
	}
}

/**
 * 自定义控件验证
 *
 * event_datasourceurl 数据源url
 * event_urlkey 取值key
 * event_alertOperatorCondition 判断符号
 * event_value 比较值
 * event_warn 警告语言
 * @param e
 */
function customValidation(e) {
	var fieldId = e.sender.id;
	var field = mini.get(fieldId);
	if (e.isValid && field && field.event_datasourceurl && field.event_urlkey && field.event_alertOperatorCondition && field.event_warn) {
		var parValue = field.getValue();
		e.errorText = field.event_warn;
		onSubmit(basePath + 'flowcfg/synergy_form/parseUrl.htm', 'post', {
			url : field.event_datasourceurl,
			parValue : parValue
		}, false, function(json) {
			var url = encodeURI(json);
			if (url.indexOf("http") == -1) { // 不是以http或者https开头，默认会加一个当前项目的路径
				url = basePath + url;
			}
			$.ajax({
				url : url,
				type : "get",
				async : false,
				dataType : "json",
				success : function(json) {
					e.isValid = isValid(json, field);
				}
			});
		});
	}
}

/**
 * 生成表达式，并验证其正确性
 *
 * @param json
 * @param field
 * @returns {Boolean}
 */
function isValid(json, field) {
	var valid = true;
	var object, resultArray = [];
	if (typeof (json) == "string") {
		object = mini.encode(json);
	} else {
		object = json;
	}
	if (object instanceof Array) {
		resultArray = object;
	} else {
		resultArray.push(object);
	}
	var value = resultArray[0][field.event_urlkey];
	var expression = value + ' ' + field.event_alertOperatorCondition + ' ' + field.event_value;
	try {
		valid = eval(expression);
	} catch(e) {
		valid = false;
	}
	return valid;
}
/**
 * 表单联动 
 * @param data
 * @param fmclassify 暂时无用
 */
function useFormItemChange(data, fmclassify) {
	// 移动端表单预览页不执行这个函数
	if(sessionStorage.getItem("cooperate-forms")){
		return;
	}

	var tabs = parent.mini.get("mainTabs");
	var currentTab = tabs.getActiveTab();
	var data = mini.decode(data);
	var useFormDatas = mini.decode(data.useFormDatas);
	var activedTab = false;
	if(useFormDatas != null && useFormDatas.length > 0){
		//处理useFormDatas 
		var formJsonList = parent.formJsonList;//被联动的表单
		if(formJsonList != null && typeof(formJsonList) != "undefined"){
			var checked = mini.get(data.fld).getValue();
			var but = [ currentTab ];
			but.push(tabs.getTab(0));
			tabs.removeAll(but);
			for(var i = 0; i < formJsonList.length; i++){
				if(formJsonList[i].isGuidePage == "0"){
					for(var j = 0; j < useFormDatas.length; j++){
						if(checked == useFormDatas[j].itemDataValue){
							var linkForms = mini.decode(useFormDatas[j].linkForms);
							for(var k = 0; k < linkForms.length; k++){
								if(linkForms[k].formTypeFld == formJsonList[i].id || 
										linkForms[k].formTypeFld == formJsonList[i].enname){
									var tab = {};
									tab.title = formJsonList[i].title;
									tab.name = formJsonList[i].id;
									tab.url = parent.url + formJsonList[i].path;
									tab.showCloseButton = false;
									tabs.addTab(tab);

									if(!activedTab){
										activedTab = true;
										tabs.activeTab(tab);
									}

									if(formJsonList.length > 1){
										parent.$("#mainTabs").removeClass("form-title-hide");
										parent.$(".header").css("margin-bottom", "0");
										parent.$(".header").css("box-shadow", "none");
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
}

/**
 * 点击添加附件
 */
function uploadphoto(enfield, annextype, annexnum, annexsize, annexwidth, annexheight) {
	var annexGrid = enfield;
	var data = {
		basePath : basePath,    
		width : annexwidth,
		height : annexheight,
		fileNum : annexnum,
		type : annextype,
		size : annexsize,
		title : "添加附件",
		autoCloseWindow : false,
		savePath : "fileupload/files/"
	};
	uploadFile(data, function(files) {
		var dataArray = files;
		// 上传窗口关闭时会自动调用的回调函数。
		for (var i = 0; i < dataArray.length; i++) {
			var type = "." + dataArray[i].fileType;
			var imagePath = onGetJpg(type);
			var annexName = dataArray[i].originalFileName;
			var url = dataArray[i].downloadUrl;
			var size = dataArray[i].fileSize;
			var physicalId = dataArray[i].id;
			var opDate = new Date();
			$("#"+annexGrid+"").attr("src", basePath + "nonlogin/" + url);
		}
	});
}

/**
 * 刷新验证码
 */
function refreshCaptcha() {
    $(".captcha-image").attr('src', $(".captcha-image").attr('src')+'&_p=1111');
}