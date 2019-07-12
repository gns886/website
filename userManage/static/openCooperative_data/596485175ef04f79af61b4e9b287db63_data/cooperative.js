var map, geolocation; // 高德地图map对象、位置对象
var verifyLocation = false; // 是否需要验证区域标识
var addressInfo = '获取当前坐标位置';
var miniUIElement = []; // 定义一个集合，存放需要显示坐标位置的元素对象
var basePath = onGetBasePath();
var messageBox = false, formFieldRightObjectArray = [], fldLinksArray = [];

function initMap() {
	// 加载地图，调用浏览器定位服务
	if (typeof (AMap) != 'undefined') {
		map = new AMap.Map('container', {});
		map.plugin('AMap.Geolocation', function() {
			geolocation = new AMap.Geolocation({
				enableHighAccuracy : true, // 是否使用高精度定位，默认:true
				timeout : 10000, // 超过10秒后停止定位，默认：无穷大
				buttonOffset : new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
				zoomToAccuracy : true, // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
				buttonPosition : 'RB'
			});
			map.addControl(geolocation);
			geolocation.getCurrentPosition();
			AMap.event.addListener(geolocation, 'complete', onComplete); // 返回定位信息
			AMap.event.addListener(geolocation, 'error', onError); // 返回定位出错信息
		});
	} else {
		onError();
	}
}

function onComplete(data) {
	px = data.position.getLng();
	py = data.position.getLat();
	if (verifyLocation) {
		$.ajax({
			url : basePath + "flowcfg/synergy_template/verifyFlowFeasibility.htm",
			type : "post",
			dataType : "json",
			async : false,
			data : {
				flowId : flowId,
				px : data.position.getLng(),
				py : data.position.getLat()
			},
			success : function(text) {
				var messageObject = mini.decode(text);
				if (messageObject.code == "500") {
					tabs = mini.get("mainTabs");
					tabs.hide();
					$("#panel").hide();
					mini.showMessageBox({
						title : "提示",
						iconCls : "mini-messagebox-warning",
						buttons : [ "ok" ],
						message : messageObject.desc,
						callback : function(action) {
							CloseWindow('ok');
						}
					});
					return;
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				mini.alert("系统维护中，请联系管理员");
			}
		});
	}
	// 没有限定器，表单中有坐标控件，需要获取用户具体位置信息
	var addressObject = data.addressComponent;
	var url = "http://uri.amap.com/marker?position=" + px + "," + py;
	for (var i = 0; i < miniUIElement.length; i++) {
		miniUIElement[i].attr("href", url);
		miniUIElement[i].text(getAddressInfo(addressObject));
	}
}

/**
 * 获取整理后的地址信息
 */
function getAddressInfo(addressObject) {
	var addressInfo = '';
	if (addressObject.province != '') {
		addressInfo = addressObject.province;
	}
	if (addressObject.city != '') {
		addressInfo = addressInfo + ',' + addressObject.city;
	}
	if (addressObject.district != '') {
		addressInfo = addressInfo + ',' + addressObject.district;
	}
	if (addressObject.street != '') {
		addressInfo = addressInfo + ',' + addressObject.street;
	}
	if (addressObject.neighborhood != '') {
		addressInfo = addressInfo + ',' + addressObject.neighborhood;
	}
	return addressInfo;
}

/**
 * 获取位置失败、回调
 */
function onError() {
	if (!messageBox) {
		messageBox = true;
		mini.showMessageBox({
			title : "提示",
			iconCls : "mini-messagebox-warning",
			buttons : [ "ok" ],
			message : '获取坐标位置失败，请刷新页面重新获取地理位置',
			callback : function(action) {

			}
		});
	}
}

/**
 * 如果控件处于显示可编辑或者显示不可编辑，是允许进行联动的；如果控件权限是隐藏的，那么是不允许进行联动的
 * 
 * @param formFieldRightObjectArray
 */
function isNeedLink(formFieldRightObjectArray, linkFld, form_id) {
	for (var q = 0, len = formFieldRightObjectArray.length; q < len; q++) {
		var rightObject = formFieldRightObjectArray[q];
		if (rightObject.form_id == form_id) {
			if (rightObject[linkFld] != 'hidden' ) {
				return true;
			}
		}
	}
	return false;
}

/**
 * 显示/隐藏 单行文本框
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_textbox(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				pMini.get(object.linkFld).hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				pMini.get(object.linkFld).show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					pMini.get(object.linkFld).show();
				}
			} else {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).setRequired(true);
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
		}
	}
}

/**
 * 显示/隐藏 多行文本框
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_textarea(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				pMini.get(object.linkFld).hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				pMini.get(object.linkFld).show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					pMini.get(object.linkFld).show();
				}
			} else {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).setRequired(true);
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
		}
	}
}

/**
 * 显示/隐藏 下拉选择框
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_combobox(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				pMini.get(object.linkFld).hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				pMini.get(object.linkFld).show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					pMini.get(object.linkFld).show();
				}
			} else {
				pMini.get(object.linkFld).setValue('');
				pMini.get(object.linkFld).setText('');
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).setRequired(true);
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
		}
	}

	for (var q = 0, fldLinksLen = fldLinksArray.length; q < fldLinksLen; q++) {
		if (object.linkFld == fldLinksArray[q].fld) {
			showOrHide(pMini, fldLinksArray[q], formFmclassify, contentWindow, formFieldRightObjectArray);
		}
	}
}

/**
 * 显示/隐藏 单选框组
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_radiobuttonlist(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				pMini.get(object.linkFld).hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				pMini.get(object.linkFld).show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					pMini.get(object.linkFld).show();
				}
			} else {
				pMini.get(object.linkFld).setValue('');
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).setRequired(true);
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
		}
	}

	for (var q = 0, fldLinksLen = fldLinksArray.length; q < fldLinksLen; q++) {
		if (object.linkFld == fldLinksArray[q].fld) {
			showOrHide(pMini, fldLinksArray[q], formFmclassify, contentWindow, formFieldRightObjectArray);
		}
	}
}

/**
 * 显示/隐藏 复选框组
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_checkboxlist(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				pMini.get(object.linkFld).hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				pMini.get(object.linkFld).show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					pMini.get(object.linkFld).show();
				}
			} else {
				pMini.get(object.linkFld).setValue('');
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).setRequired(true);
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
		}
	}

//	for (var q = 0, fldLinksLen = fldLinksArray.length; q < fldLinksLen; q ++) {
//		if (object.linkFld == fldLinksArray[q].fld) {
//			showOrHide(pMini, fldLinksArray[q], formFmclassify, contentWindow, formFieldRightObjectArray);
//		}
//	}
}

/**
 * 显示/隐藏 数值调节器
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_spinner(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				pMini.get(object.linkFld).hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				pMini.get(object.linkFld).show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					pMini.get(object.linkFld).show();
				}
			} else {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).setRequired(true);
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
		}
	}
}

/**
 * 显示/隐藏 日期时间
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_datepicker(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				pMini.get(object.linkFld).hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				pMini.get(object.linkFld).show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					pMini.get(object.linkFld).show();
				}
			} else {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).setRequired(true);
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
		}
	}
}

/**
 * 显示/隐藏 组织机构控件
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_buttonedit(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				pMini.get(object.linkFld).hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				pMini.get(object.linkFld).show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					pMini.get(object.linkFld).show();
				}
			} else {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).setRequired(true);
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld).hide();
				}
			}
		}
	}
}

/**
 * 显示/隐藏 区域控件
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_area(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld + '_province');
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				pMini.get(object.linkFld + '_province').hide();
				pMini.get(object.linkFld + '_city').hide();
				pMini.get(object.linkFld + '_county').hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				pMini.get(object.linkFld + '_province').show();
				pMini.get(object.linkFld + '_city').show();
				pMini.get(object.linkFld + '_county').show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					pMini.get(object.linkFld + '_province').show();
					pMini.get(object.linkFld + '_city').show();
					pMini.get(object.linkFld + '_county').show();
				}
			} else {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld + '_province').hide();
					pMini.get(object.linkFld + '_city').hide();
					pMini.get(object.linkFld + '_county').hide();
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld + '_province').setRequired(true);
				pMini.get(object.linkFld + '_city').setRequired(true);
				pMini.get(object.linkFld + '_county').setRequired(true);
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					pMini.get(object.linkFld + '_province').hide();
					pMini.get(object.linkFld + '_city').hide();
					pMini.get(object.linkFld + '_county').hide();
				}
			}
		}
	}
}

/**
 * 显示/隐藏 表单多行控件
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_datagrid(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	// 工具条
	var node = contentWindow.document.getElementById('toolbar_' + object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				$(node).hide(); // 隐藏工具条
				pMini.get(object.linkFld).hide(); // 隐藏列表
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				$(node).show(); // 显示工具条
				pMini.get(object.linkFld).show(); // 显示列表
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					$(node).show(); // 显示工具条
					pMini.get(object.linkFld).show(); // 显示列表
				}
			} else {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					$(node).hide(); // 隐藏工具条
					pMini.get(object.linkFld).hide(); // 隐藏列表
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).addCls('gridRequired'); // 增加必填的样式类
			} else {
				pMini.get(object.linkFld).removeCls('gridRequired'); // 移除必填的样式类
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					$(node).hide(); // 隐藏工具条
					pMini.get(object.linkFld).hide(); // 隐藏列表
				}
				pMini.get(object.linkFld).removeCls('gridRequired'); // 移除必填的样式类
			}
		}
	}
}

/**
 * 显示/隐藏 附件控件
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_annex(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	// 工具条
	var node = contentWindow.document.getElementById('toolbar_' + object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				$(node).hide(); // 隐藏工具条
				pMini.get(object.linkFld).hide(); // 隐藏列表
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				$(node).show(); // 显示工具条
				pMini.get(object.linkFld).show(); // 显示列表
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					$(node).show(); // 显示工具条
					pMini.get(object.linkFld).show(); // 显示列表
				}
			} else {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					$(node).hide(); // 隐藏工具条
					pMini.get(object.linkFld).hide(); // 隐藏列表
				}
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				pMini.get(object.linkFld).addCls('gridRequired'); // 增加必填的样式类
			} else {
				pMini.get(object.linkFld).removeCls('gridRequired'); // 移除必填的样式类
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					$(node).hide(); // 隐藏工具条
					pMini.get(object.linkFld).hide(); // 隐藏列表
				}
				pMini.get(object.linkFld).removeCls('gridRequired'); // 移除必填的样式类
			}
		}
	}
}

/**
 * 显示/隐藏 位置控件
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_coordinate(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").hide();
			} else {
				$(node).hide();
			}
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			if (formFmclassify == '2') {
				// 简易模式
				$(node).closest("li").show();
			} else {
				$(node).show();
			}
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").show();
				} else {
					$(node).show();
				}
			} else {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					$(node).hide();
				}
			}
			if (object.required == 'true') {

			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				if (formFmclassify == '2') {
					// 简易模式
					$(node).closest("li").hide();
				} else {
					$(node).hide();
				}
			}
		}
	}
}

/**
 * 显示/隐藏 脚本控件
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_javascript(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {

}

/**
 * 显示/隐藏 头像控件
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_userphoto(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			$(node).hide();
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			$(node).show();
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				$(node).show();
			} else {
				$(node).hide();
			}
			if (object.required == 'true') {

			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				$(node).hide();
			}
		}
	}
}

/**
 * 显示/隐藏 签章控件
 * 
 * @param pMini
 *            mini对象
 * @param formFmclassify
 *            表单分类
 * @param contentWindow
 *            contentWindow对象
 * @param fldText
 *            联动控件（下拉选择、单选框组）
 * @param object
 *            被联动控件
 * @param formFieldRightObjectArray
 *            表单字段权限集合
 */
function showOrHide_signature(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, form_id) {
	var node = contentWindow.document.getElementById(object.linkFld);
	if (fldText == '') { // 该控件没有被选中的项
		if (object.showOrHide == 'show') { // 如果联动控件配置的是show，说明默认是隐藏的，点击某一项以后，才显示出来
			$(node).hide();
		} else {
			// 如果配置的是隐藏，那么，默认是显示的
			$(node).show();
		}
	} else {
		// 单选框组和下拉选择框有值，需要按照具体的选择项来控制关联控件
		if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) > -1 : fldText == object.itemText) {
			if (object.showOrHide == 'show') {
				$(node).show();
			} else {
				$(node).hide();
			}
			if (object.required == 'true' && !isNeedLink(formFieldRightObjectArray, object.linkFld, form_id)) {
				$(node).addClass('signatureRequired');
			} else {
				$(node).removeClass('signatureRequired');
			}
		} else { // 下拉项的值和当前循环的联动控件的内容不匹配
			if (object.showOrHide == 'show') {
				$(node).hide();
				$(node).removeClass('signatureRequired');
			}
		}
	}
}

/**
 * 获取单选框组、复选框组、下拉选择框的文本值
 * 
 * @param pMini
 * @param id
 * @returns {String}
 */
function getFldText(pMini, id) {
	var selecteds = pMini.get(id).getSelecteds(), value = pMini.get(id).getValue(), text = '';
	if (selecteds.length > 0 && value != '') {
		for (var h = 0, length = selecteds.length; h < length; h++) {
			text = text + selecteds[h].text + ',';
		}
		text = text.substring(0, text.length - 1);
	}
	return text;
}

/**
 * 用来控制表单控件的显示与隐藏
 * 
 * @param pMini
 *            mini对象
 * @param fldLinks
 *            控件关联JSON串
 * @param formFmclassify
 *            表单分类
 * @param formFieldRight
 *            表单字段权限
 */
function showOrHide(pMini, fldLinks, formFmclassify, contentWindow, formFieldRight) {
	formFieldRightObjectArray.push(formFieldRight);
	var tempObject = mini.decode(fldLinks), iteratorArray = [];
	if (tempObject instanceof Array) {
		fldLinksArray = tempObject;
		iteratorArray = tempObject;
	} else {
		// 是一个对象，将其封装到数组中
		iteratorArray.push(tempObject);
	}
	for (var i = 0; i < iteratorArray.length; i++) {
		var fldLink = iteratorArray[i];
		var array = fldLink.linkFlds, fldText = '', filterArray = [];
		fldText = getFldText(pMini, fldLink.fld);
		for (var j = 0; j < array.length; j++) {
			var object = array[j];
			if (!isNeedLink(formFieldRightObjectArray, object.linkFld, formFieldRight.form_id)) {
				continue;
			}
			// 先处理和当前联动控件选项值不相同的(做反向处理)，再处理联动控件和被联动控件值相同的
			if (object.inOrEq == 'in' ? fldText.indexOf(object.itemText) == -1 : fldText != object.itemText) {
				if (object.fldType == 'mini-textbox') {
					showOrHide_textbox(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-textarea') {
					showOrHide_textarea(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-combobox') {
					showOrHide_combobox(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-radiobuttonlist') {
					showOrHide_radiobuttonlist(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-checkboxlist') {
					showOrHide_checkboxlist(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-spinner') {
					showOrHide_spinner(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-datepicker') {
					showOrHide_datepicker(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-buttonedit') {
					showOrHide_buttonedit(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-area') {
					showOrHide_area(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-annex') {
					showOrHide_annex(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'flow-signature') {
					showOrHide_signature(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'flow-userphoto') {
					showOrHide_userphoto(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-javascript') {
					showOrHide_javascript(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-coordinate') {
					showOrHide_coordinate(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				} else if (object.fldType == 'mini-datagrid') {
					showOrHide_datagrid(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
				}
			} else {
				filterArray.push(object);
			}
		}

		for (var q = 0; q < filterArray.length; q++) {
			var object = filterArray[q];
			if (!isNeedLink(formFieldRightObjectArray, object.linkFld, formFieldRight.form_id)) {
				continue;
			}
			// 先处理和当前联动控件选项值不相同的(做反向处理)，再处理联动控件和被联动控件值相同的
			if (object.fldType == 'mini-textbox') {
				showOrHide_textbox(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-textarea') {
				showOrHide_textarea(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-combobox') {
				showOrHide_combobox(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-radiobuttonlist') {
				showOrHide_radiobuttonlist(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-checkboxlist') {
				showOrHide_checkboxlist(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-spinner') {
				showOrHide_spinner(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-datepicker') {
				showOrHide_datepicker(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-buttonedit') {
				showOrHide_buttonedit(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-area') {
				showOrHide_area(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-annex') {
				showOrHide_annex(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'flow-signature') {
				showOrHide_signature(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'flow-userphoto') {
				showOrHide_userphoto(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-javascript') {
				showOrHide_javascript(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-coordinate') {
				showOrHide_coordinate(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			} else if (object.fldType == 'mini-datagrid') {
				showOrHide_datagrid(pMini, formFmclassify, contentWindow, fldText, object, formFieldRightObjectArray, formFieldRight.form_id);
			}
		}
	}
}

/**
 * 验证附件、表单多行是否有数据
 * 
 * @param formDocument
 *            发起流程时，对应的加载出来的表单
 * @param mini
 *            表单中的mini对象
 * @returns {Boolean}
 */
function customValidate(formDocument, mini) {
	var validateFlag = true;
	$(formDocument).find("div[class*='gridRequired']").each(function() {
		var data = mini.get($(this).attr("id")).getData();
		if (!(data && data.length > 0)) {
			validateFlag = false;
		}
	});

	$(formDocument).find("img[class*='signatureRequired']").each(function() {
		if (!$(this).attr("src")) {
			validateFlag = false;
		}
	});

	return validateFlag;
}

/**
 * remote验证
 * 
 * @param formDocument
 *            发起流程时，对应的加载出来的表单
 * @param mini
 *            表单中的mini对象
 * @returns {Boolean}
 */
function remoteValidate(formDocument, mini) {
	var validateFlag = true;
	$(formDocument).find("div[vtype*='remote']").each(function() {
		var remoteUrl = mini.get($(this).attr("")).getData();
		console.log(remoteUrl)
		var data = mini.get($(this).attr("id")).getData();
		if (!(data && data.length > 0)) {
			validateFlag = false;
		}
	});


	return validateFlag;
}

/**
 * 初始化超链接控件的href
 * 
 * @param formDom
 *            发起流程时，对应的加载出来的表单
 * @param mini
 *            表单中的mini对象
 */
function genLinkData(mini, formDom) {
	$(formDom).find("a[class*='mini-link']").each(function() {
		var linksObject = mini.decode($(this).attr('links'));
		var hrefPC = linksObject.hrefPC;
		if (linksObject && hrefPC) {
			var parametersArray = mini.decode(linksObject.parameters);
			if (parametersArray && parametersArray.length > 0) {
				for (var i = 0, len = parametersArray.length; i < len; i++) {
					var parameter = parametersArray[i];
					if (parameter.variable && parameter.key && mini.get(parameter.key)) {
						hrefPC = linksObject.hrefPC.replace(new RegExp(parameter.variable, "gm"), mini.get(parameter.key).getValue());
					}
				}
			}
			$(this).attr('href', hrefPC);
		}
	});
}

/**
 * 发起流程调用，给超链接控件赋值
 * 
 * @param formDom
 *            发起流程时，对应的加载出来的表单
 * @param mini
 *            表单中的mini对象
 */
function setValue4Link(mini, formDom, returnData) {
	$(formDom).find("a[class*='mini-link']").each(function() {
		var returnObject = {};
		var linksObject = mini.decode($(this).attr('links'));
		var hrefPC = linksObject.hrefPC;
		var hrefAPP = linksObject.hrefAPP;
		var flag = 'needUpdate';
		var parametersArray = mini.decode(linksObject.parameters);
		if (parametersArray && parametersArray.length > 0) {
			for (var i = 0, len = parametersArray.length; i < len; i++) {
				var parameter = parametersArray[i];
				if (parameter.variable && parameter.key && mini.get(parameter.key)) {
					hrefPC = hrefPC.replace(new RegExp(parameter.variable, "gm"), mini.get(parameter.key).getValue());
					hrefAPP = hrefAPP.replace(new RegExp(parameter.variable, "gm"), mini.get(parameter.key).getValue());
				} else {
					flag = 'noNeedUpdate';
				}
			}
		}
		if (flag === 'needUpdate') {
			returnObject.hrefPC = hrefPC;
			returnObject.hrefAPP = hrefAPP;
			returnData[$(this).attr("id")] = returnObject;
		}
	});
}

/**
 * 表单字段权限：显示可编辑
 * 
 * @param obj
 *            当前控件对象
 * @param className
 *            控件类名
 * @param data
 *            后台返回所有的字段权限数据
 * @param pMini
 *            父页面miniUI对象
 * @param formFieldObj
 *            data中循环的每一个对象
 */
function oppEdit(obj, className, data, pMini, formFieldObj) {
	if (className && className.indexOf("flow-signature") != -1) {
		// 签章控件
		$(obj).css("display", "block");// 显示签章控件
		$(obj).attr("onclick", "onFlowSignature('" + formFieldObj.field + "')");// 签章控件点击事件
		$(obj).css("cursor", "pointer");// 鼠标滑入签章控件区域内变成小手
	} else if (className && className.indexOf("flow-userphoto") != -1) {
		// 头像控件
		$(obj).css("display", "block");// 显示头像控件
//		$(obj).attr("src", "../../user/photo.htm?uid="+loginUserId);

		var type = $(obj).attr("onclick")?"1":"2";
		if(type == "1"){
			$(obj).attr("onclick", "uploadphoto('"+$(obj).attr("id")+"', 'png,jpg,jpeg,gif', 1, 3, 500, 300)");//启用点击事件
			$("#" + $(obj).attr("enfield")).attr("src", $(obj).attr("src"));
		}else{
			var path = '';
			if ($(obj).attr("src")) {
				path = $(obj).attr("src").split("=")[1];
			}
			data[$(obj).attr("enfield")] = path;
		}
		var click = $(obj).attr("onclick");
		if(click && click != ""){
			$(obj).css("cursor", "pointer");
			var w = $(obj).width();
			var h = $(obj).height();
			var s = new Number((w > h ? h : w) * 0.5).toFixed(0);
			var t = new Number(s / 2).toFixed(0);
			var z = new Number(w / 2).toFixed(0);
			var style = "width:" + s + "px;margin-top:-" + t + "px;margin-left:-" + t + "px;";
			var parent = $(obj).parent();
			parent.css("position", "relative");
			var zzSpan = document.createElement("span");
			zzSpan.className = "upload-zz";
			zzSpan.setAttribute("style" , "width:"+w+"px;height:"+h+"px;margin-left:-"+z+"px;");
			zzSpan.setAttribute("onclick" , click);
			parent.append(zzSpan);
			var uploadSpan = document.createElement("span");
			uploadSpan.setAttribute("style" , style);
			uploadSpan.className = "upload-icon";
			uploadSpan.setAttribute("onclick" , click);
			var uploadImg = document.createElement("img");
			uploadImg.setAttribute("src", "../../resources/images/flow/upload_img.png");
			uploadSpan.appendChild(uploadImg);
			parent.append(uploadSpan);
		}
	} else if (className && className.indexOf("annex") != -1 && className.indexOf("mini-datagrid") != -1) {
		// 附件控件
		var annexGrid = $(obj).attr("id");
		pMini.get("toolbar_" + annexGrid).show(); // 显示工具栏
		pMini.get(annexGrid).showColumn(1); // 显示删除列
	} else if (className && className.indexOf("mini-datagrid") != -1) {
		// 表格多行控件
		var gridId = $(obj).attr("id");
		pMini.get("toolbar_" + gridId).show();// 显示工具栏
		pMini.get(gridId).setAllowCellEdit(true);// 允许单元格编辑
		pMini.get(gridId).showColumn(0);// 显示复选框列
		// pMini.get(gridId).showColumn("_annexPic"); // 显示删除列
		var columns = pMini.get(gridId).getColumns();
		for (var j = 0; j < columns.length; j++) {
			if (columns[j].name == "_annexPic") {
				pMini.get(gridId).showColumn(j);
			}
		}
	} else if (className && className.indexOf("mini-coordinate") != -1) {// 坐标控件赋值
		// continue;
	} else {
		pMini.get(formFieldObj.field).show();
		pMini.get(formFieldObj.field).removeCls("asLabel");// 增加asLabel外观
		pMini.get(formFieldObj.field).setReadOnly(false); // 只读
		pMini.get(formFieldObj.field).enable();
		pMini.get(formFieldObj.field).setVisible(true);
		if (className && className.indexOf("mini-radiobuttonlist") == -1 && className.indexOf("mini-checkboxlist") == -1) {
			pMini.get(formFieldObj.field).setAllowInput(true);
		}
		if(className && className.indexOf("mini-buttonedit mini-spinner") != -1){
			pMini.get(formFieldObj.field).setAllowInput(true);
			// 只读
		}
	}
}

/**
 * 表单字段权限：显示不可编辑
 * 
 * @param obj
 *            当前控件对象
 * @param className
 *            控件类名
 * @param data
 *            后台返回所有的字段权限数据
 * @param pMini
 *            父页面miniUI对象
 * @param formFieldObj
 *            data中循环的每一个对象
 * @param formFmclassify
 *            是不是简易模式的表单
 */
function oppNoEdit(obj, className, data, pMini, formFieldObj, formFmclassify) {
	if (className.indexOf("mini-radiobuttonlist") != -1 || className.indexOf("mini-checkboxlist") != -1 || className.indexOf("mini-checkbox") != -1) {
		pMini.get(formFieldObj.field).setReadOnly(true); // 只读
		pMini.get(formFieldObj.field).setRequired(false);
	} else if (className && className.indexOf("mini-datagrid") != -1 && className.indexOf("annex") == -1) {
		// 表格多行控件
		var gridId = $(obj).attr("id");
		pMini.get("toolbar_" + gridId).hide();// 隐藏工具栏
		pMini.get(gridId).setAllowCellEdit(true);// 单元格本身有权限控制
		pMini.get(gridId).hideColumn(0);// 隐藏复选框列
		/*var columns = pMini.get(gridId).getColumns();
		for (var w = 0; w < columns.length; w++) {
			if (columns[w].name == "_annexPic") {
				pMini.get(gridId).hideColumn(w);
			}
		}*/
	} else if (className && className.indexOf("flow-signature") != -1) {
		// 签章控件
		$(obj).css("display", "block");
		$(obj).removeAttr('onclick');
	} else if (className && className.indexOf("flow-userphoto") != -1) {
		// 头像控件
		var type = $(obj).attr("onclick")?"1":"2";
		$(obj).attr("onclick", "");//禁用点击事件
		if(type == "1"){
			$("#" + $(obj).attr("enfield")).attr("src", $(obj).attr("src"));
		}else{
			var path = '';
			if ($(obj).attr("src")) {
				path = $(obj).attr("src").split("=")[1];
			}
			data[$(obj).attr("enfield")] = path;
		}
	} else if (className && className.indexOf("mini-datagrid") != -1 && className.indexOf("annex") != -1) {
		// 附件控件
		var annexGrid = $(obj).attr("id");
		pMini.get("toolbar_" + annexGrid).hide(); // 隐藏添加附件工具栏
		pMini.get(annexGrid).hideColumn(1); // 隐藏删除列
	} else {
		try {
			pMini.get(formFieldObj.field).setIsValid(true);// 去除错误提示
			pMini.get(formFieldObj.field).setRequired(false);
//		    pMini.get(formFieldObj.field).addCls("asLabel");// 增加asLabel外观
			pMini.get(formFieldObj.field).setAllowInput(false);
		    pMini.get(formFieldObj.field).setReadOnly(true); // 只读
//		    pMini.get(formFieldObj.field).setEnabled(false);
//		    if (pMini.get(formFieldObj.field).value == '') {
//			    pMini.get(formFieldObj.field).setVisible(false);
//		    }
		} catch (e) {}
	}
}

/**
 * 表单字段权限：隐藏控件
 * 
 * @param obj
 *            当前控件对象
 * @param className
 *            控件类名
 * @param data
 *            后台返回所有的字段权限数据
 * @param pMini
 *            父页面miniUI对象
 * @param formFieldObj
 *            data中循环的每一个对象
 * @param formFmclassify
 *            是不是简易模式的表单
 * @param iframe
 *            每个表单iframe对象
 */
function oppHidden(obj, className, data, pMini, formFieldObj, formFmclassify, iframe) {
	if (formFmclassify == '2') { // 这个表单是简易模式的
		$(obj).closest("li").hide(); // 隐藏父级元素
	} else {
		$(obj).hide();
		$("#toolbar_" + formFieldObj.field, iframe.contentWindow.document).hide();
	}
}

/**
 * 根据指定url获取参数集合列表
 * 
 * @param url
 * @returns {Array}
 */
function getUrlParameters(url) {
	var result = [];
	if (url.indexOf("?") != -1) {
		var query = url.split("?")[1];
		var queryArr = query.split("&");
		queryArr.forEach(function(item) {
			var obj = {};
			var key = item.split("=")[0];
			var value = item.split("=")[1];
			obj[key] = value;
			result.push(obj);
		});
	}
	return result;
}

/**
 * 解析流程表单控件数据源
 * 
 * @param id
 *            表单id
 * @param iframe
 *            iframe
 * @param pMini
 *            miniUI
 */
function parseDataSource(id, iframe, pMini,instId) {
	// 数据源
	onSubmit(basePath + 'flowcfg/synergy_form/parseDataSource.htm', 'post', {
		id : id,
		instId : instId
		/*parameters: mini.encode(getUrlParameters(location.href))*/
	}, false, function(json) {
		var dataArray = mini.decode(json);
		for (var i = 0; i < dataArray.length; i++) {
			var dataSource = dataArray[i];
			var url = dataSource.url;
			if (url.indexOf("http") == -1) { // 不是以http或者https开头，默认会加一个当前项目的路径
				url = onGetBasePath() + url;
			}
			$.ajax({
				url : encodeURI(url),
				type : "get",
				async : false,
				dataType : "json",
				success : function(json) {
					try {
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
							var obj = iframe.contentWindow.document.getElementById(object.enfield);
							var className = $(obj).attr("class");
							if (object.key && !object.textfield && !object.valuefield) { // 说明是需要根据key来获取某一个值
								if (typeof (pMini.get(object.enfield).getValue()) != 'undefined' && pMini.get(object.enfield).getValue() != "") {
									continue;
								}
								if (result instanceof Array) {
									if (result.length >= 1) { // 取第一个来获取值
										if (className.indexOf('mini-datagrid') != -1) {
											pMini.get(object.enfield).setData(result[0][object.key]);
										} else {
											var value = eval('result[0].' + object.key);
											pMini.get(object.enfield).setValue(value);
										}
									}
								} else {
									if (className.indexOf('mini-datagrid') != -1) {
										pMini.get(object.enfield).setData(result[object.key]);
									} else {
										pMini.get(object.enfield).setValue(result[object.key]);
									}
								}
							} else { // 需要将获取到的值都通过setData方法来赋值
								try {
									if(object.key){
										var value = eval('result[0].' + object.key);
										console.info(value);
										pMini.get(object.enfield).setData(value);
									}else{
										pMini.get(object.enfield).setData(result);
									}
									if (className.indexOf("mini-combobox") != -1) {
										if(pMini.get(object.enfield).getValue() != ""){
											pMini.get(object.enfield).setValue(pMini.get(object.enfield).getValue());
										}else{
											// pMini.get(object.enfield).select(0); 2018.12.21 不清楚此处为什么要默认选中第一项，暂时注释 BUG5410
										}
									}
									if(className.indexOf("mini-radiobuttonlist") != -1){
										var data = pMini.get(object.enfield).getData();
										for(var key in data[0]){
											pMini.get(object.enfield).setValue(data[0][key]);
											break;
										}
									}
								} catch (e) {
                                    console.error(e);
								}
							}
						}
                    }catch (e) {
                        console.error(e);
                    }
				}
			});
		}
	});
}

/**
 * 功能：选择抄送
 * 
 * @author xingmin
 * @date 2013-11-15
 */
function onmakeCopy() {
	var params = new Object();
	params.datas = makeCopeJson;
	params.showCheckBox = '1,2,3,4,5,6,7,8';
	params.shows = '1,3,4,6,8,xuanke,shouke';
	// params.showCheckBox = '1,2,3,4,5,6,7';
	// params.shows = '1,3,4,6,xuanke,shouke';
	onOpenSelector(params, function(e) {
		var list = mini.decode(e), dataList = new Array(), ids = "", texts = "";
		for (var i = 0; i < list.length; i++) {
			var data = {};
			data.type = list[i].type;
			data.idField = list[i].idField;
			data.textField = list[i].textField;
			dataList.add(data);
			if (i == list.length - 1) {
				ids += list[i].idField;
				texts += list[i].textField;
			} else {
				ids += list[i].idField + ",";
				texts += list[i].textField + ",";
			}
		}
		mini.get("makeCopy").setValue(ids);
		mini.get("makeCopy").setText(texts);
		makeCopeJson = mini.encode(dataList);
	});
}

/**
 * 第三方调用流程发起、编辑时传入的表单控件权限
 * [{
 * "field" : "控件英文名称",
 * "rightValue" : "控件值",
 * "rightType" : "noedit/edit/hidden"
 * }]
 * @param fieldRightJson
 */
function initExternalFormFieldRight(fieldRightJson) {
	externalFormFieldRight = mini.decode(fieldRightJson);
}

/**
 * 过滤外部控件权限
 */
function filterExternalFormFieldRight(externalFormFieldRightArray, dataCollection, formId) {
	var array = externalFormFieldRightArray;
	var dataCollectionArray = mini.decode(dataCollection);
	var fieldMappingObject = {};
	for (var i = 0, len = dataCollectionArray.length; i < len; i++) {
		var fieldsArray = dataCollectionArray[i].fields;
		for (var j = 0, jLen = fieldsArray.length; j < jLen; j++) {
			fieldMappingObject[fieldsArray[j].field] = fieldsArray[j].fieldValue;
		}
	}
	for (var k = 0, kLen = array.length; k < kLen; k++) {
		array[k].field = fieldMappingObject[array[k].field];
		array[k].rightKey = 'defaultValue';
		array[k].formId = formId;
	}
	return array;
}

/**
 * 设置表单中的控件为只读形式
 */
function setFormReadOnly(iframe) {
	var mini = iframe.mini;
	var document = iframe.document;
	$(document).find("div[class*='mini-datagrid']").each(function() { // 多行控件
		var id = $(this).attr("id");
		try {
			mini.get("toolbar_" + id).hide(); // 隐藏工具栏
			mini.get(id).setAllowCellEdit(false); // 禁止单元格编辑
			var data = mini.encode(mini.get(id).data);
			if(data.indexOf("fileupload/") != -1){
				mini.get(id).hideColumn(1); // 附件类型隐藏删除列	
			}else{
				mini.get(id).hideColumn(0); // 隐藏复选框列	
			}
			var columns = mini.get(id).getColumns();
			for (var w = 0; w < columns.length; w++) {
				if (columns[w].name == "_annexPic") {
					mini.get(id).hideColumn(w);
				}
			}
		} catch (e) {}
	});
	
	$(document).find("img[class*='flow-signature']").each(function() { // 签章控件
		try {
			$(this).attr("onclick", ""); // 禁用点击事件
		} catch (e) {}
	});
	
	$(document).find("img[class*='flow-userphoto']").each(function() { // 头像控件
		try {
			$(this).attr("onclick", ""); // 禁用点击事件
		} catch (e) {}
	});
}

/**
 * 后台传入的结果，需要将空值的key《-》value过滤掉
 * @param formData
 * @returns {___anonymous50458_50459}
 */
function filterFormValues(formData) {
	var filterDataObject = {};
	for (var key in formData) {
		if(formData[key] == '' || null == formData[key] || undefined == formData[key]) {
			continue;
		}
		filterDataObject[key] = formData[key];
	}
	return filterDataObject;
}

//判断一个url是否可以访问
function isLoad(_url, fun) {
	$.ajax({
		url: _url,
		type: "get",
		async: false,
		success: function() {
			//说明请求的url存在，并且可以访问
			if ($.isFunction(fun)) {
				fun(true);
			}
		},
		statusCode: {
			404: function() {
				//说明请求的url不存在
				if ($.isFunction(fun)) {
					fun(false);
				}
			}
		}
	});
}


//表单赋值
function buildingForm(pMini){
	if(appDataJson){
		var appData = pMini.decode(appDataJson);
		if(appDataJson) {
			for(var data in appData){
				if(pMini.get(data)){
					pMini.get(data).setValue(appData[data]);
				}
			}
		}
	}
}
