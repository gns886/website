
/**
 * 说明：
 * ①、需要在设置页面引入此js文件
 * ②、设置data-options属性
 * 	A、需要在日期控件上添加属性：data-options="{\"showStyle\":\"rung\"}"，表示设置组件显示格式。
 * data-options="{key:value}",key是固定的，value有多种。
 * 	B、可以不设置data-options属性，默认显示 yyyy-MM-dd
 * ③、将日期控件中format属性和timeFormat属性去除（视具体情况而定）
 * 
 * 
 * value值说明：
 * rung ：表示显示格式（默认格式） yyyy-MM-dd
 * chinese ：表示显示格式		yyyy年MM月dd日
 * slash ：表示显示格式			yyyy/MM/dd
 * greenwich ：表示显示格式		MM（英文） dd, yyyy	例如：May 09 2018
 * rungDateTime ：表示显示格式		yyyy-MM-dd HH:mm:ss
 * chineseDateTime ：表示显示格式	yyyy年MM月dd日 HH时mm分ss秒
 * slashDateTime ：表示显示格式		yyyy/MM/dd HH:mm:ss
 * greenwichDateTime ：表示显示格式	MM（英文） dd, yyyy HH:mm:ss
 * 
 * 例如：<input name="birthday" class="mini-datepicker" data-options="{\"showStyle\":\"slash\"}"/>
 * 
 */
$(function(){
	initDateFormat();
	initTextBox();
})

/**
 * 功能：日期控件的多种显示方式
 */
function initDateFormat() {
	$(".mini-datepicker").each(function(){
		var name =  $(this).children("input").attr("name");
		var detepicker = mini.getbyName(name);
		if(detepicker){
			//回显数据
			var value = detepicker.getValue();
			//console.log("格式：" + detepicker.showStyle + "，值：" + value);
			if(value){
				setShowStyle(detepicker , detepicker.showStyle , value);
			}
			
			detepicker.on("valuechanged",function(e){
	            valuechanged(e,e.sender.showStyle);	// 显示类型：e.sender.showStyle
	        });
		}
		
	});
}

/**
 * 功能：当单行文本控件默认值为计算天数时监听相应日期控件
 */
function initTextBox() {
	$(".mini-textbox").each(function(){
		var id =  $(this).attr("id");
		var textBox = mini.get(id);
		if(textBox){
			var sDateId = textBox.sDateId;
			if(textBox.sDateId != null && textBox.eDateId != null){
				//监控开始日期控件
				mini.get(textBox.sDateId).on("valuechanged", function(){
					var sDate = mini.get(textBox.sDateId).getValue();
					var eDate = mini.get(textBox.eDateId).getValue();
					if(eDate != "" && eDate != null && typeof(eDate) != undefined){
						var result = getDay(sDate,eDate);
						mini.get(textBox.id).setValue(result);
					}
				});
				//监控结束日期控件
				mini.get(textBox.eDateId).on("valuechanged", function(){
					var sDate = mini.get(textBox.sDateId).getValue();
					var eDate = mini.get(textBox.eDateId).getValue();
					if(sDate != null && typeof(sDate) != undefined && sDate != ""){
						var result = getDay(sDate,eDate);
						mini.get(textBox.id).setValue(result);
					}
				});
			}
		}
		
	});
}

//计算两天之差
function getDay(sdate,endDate){
	if(sdate && endDate){
		var date=endDate.getTime()-sdate.getTime();
		var val = Math.floor(date/(24*3600*1000)) + 1;
		if(val < 0){
			return 0;
		}
		return Math.floor(date/(24*3600*1000)) + 1;
	}
	return "";
}


function valuechanged(e,showStyle){
	var s = e.sender;
	var val = e.value;
	setShowStyle(s,showStyle,val);
}


function setShowStyle(s,showStyle,val){
	
	var curTime = getDateFormat(showStyle,val);
	
	if(showStyle == 'rungDateTime' || showStyle == 'chineseDateTime' || showStyle == 'slashDateTime' || showStyle == 'greenwichDateTime'){
		s.setFormat("yyyy-MM-dd HH:mm:ss");
	}
	
	if(curTime){
		s.setText(curTime);
	}
}



/**
 * 获取格式化日期数据
 * @param showStyle
 * @param val
 * @returns {String}
 */
function getDateFormat(showStyle,val){

	if(typeof val === 'string'){
		val = val.replace(/-/g, '/');
	}

	var dateO = (new Date(val));

	//如果不是日期对象，则不处理
	if(!(dateO instanceof Date)){
		return val;
	}
	
	var oldTime = dateO.getTime();
	var curTime = "";
	
	if(showStyle == 'rung'){
		curTime = new Date(oldTime).format("yyyy-MM-dd");
	}else if(showStyle == 'chinese'){
        curTime = new Date(oldTime).format("yyyy年MM月dd日");
	}else if(showStyle == 'slash'){
		curTime = new Date(oldTime).format("yyyy/MM/dd");
	}else if(showStyle == 'local'){
		curTime = new Date(oldTime).format("yyyy-MM");
	} else if(showStyle == 'monthPointdDay'){
		curTime = new Date(oldTime).format("M.d");
	} else if(showStyle == 'daySlashMonth'){
		curTime = new Date(oldTime).format("d/M");
	} else if(showStyle == 'greenwich'){
		if(dateO){
			var year = dateO.getFullYear();
			var month = dateO.getMonth()+1;
			var day = dateO.getDate();
			
			month = getEnglishMonth(month);
			day = day<10?"0"+day:day;
			
			curTime = month + " " + day + ", " + year;
        }
    }else if(showStyle == 'rungDateTime'){
    	curTime = new Date(oldTime).format("yyyy-MM-dd HH:mm:ss");
	}else if(showStyle == 'chineseDateTime'){
		curTime = new Date(oldTime).format("yyyy年MM月dd日 HH时mm分ss秒");
	}else if(showStyle == 'slashDateTime'){
        curTime = new Date(oldTime).format("yyyy/MM/dd HH:mm:ss");
	}else if(showStyle == 'greenwichDateTime'){
		if(dateO){
			var year = dateO.getFullYear();
			var month = dateO.getMonth()+1;
			var day = dateO.getDate();
			
			month = getEnglishMonth(month);
			day = day<10?"0"+day:day;
			
			var hours = dateO.getHours();
			hours = hours==0?"00":hours < 10 ? "0"+hours : hours;
			var	minutes =dateO.getMinutes();
			minutes =minutes==0?"00":minutes < 10 ? "0"+minutes : minutes;
			var	seconds = dateO.getSeconds();
			seconds = seconds==0?"00":seconds < 10 ? "0"+seconds : seconds;
			
			curTime = month + " " + day + ", " + year + " " + hours +":" + minutes + ":" + seconds;
        }
	}
	if(curTime.indexOf("NaN") != -1){
		return val;
	}
	return curTime;
}


/**
 * 获取英文月份
 * @param month
 */
function getEnglishMonth(month){
	//var months=["January","February","March","April","May","June","July","August","September","October","November","December"];
	var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	return months[month-1]
}


/**
 * 设置列表页日期显示格式(适用于流程列表)
 * @param data	数组对象，每一行数据是一个对象
 * @returns
 */
function setListDateFormat(data){
	//设置日期样式
	for(var i=0,len=data.length; i<len; i++){
		var dataObj = data[i];
		var wfContent = dataObj.wfContent;	//处理之前的数据
		
		//因不同列表返回数据时，装载数据的属性不同，故需要重新获取
		if(!wfContent){	//表示没有获取到数据
			wfContent = dataObj.displayField;
		}
		
		var content = dataObj.fromObject;	//统计列表装载字段的属性
		if(!content){
			content = dataObj.content;	//新建、发起、修改、暂缓中装载字段的属性
		}
		
		if(content && wfContent){
			wfContentJSON = $.parseJSON(wfContent);
			for(var j=0,length=wfContentJSON.length; j<length; j++){
				var attributes = wfContentJSON[j].attributes;
				if(attributes){
					
					if(!isJson(attributes)){
						attributes = attributes.replaceAll(new RegExp("\n",""),"");
						attributes = $.parseJSON(attributes);
					}
					
					var showStyle = attributes.showStyle;
					//console.log("显示样式：" + showStyle);
					if(showStyle){
						var field = wfContentJSON[j].enfield;
						for(attr in content){	//循环对象属性
							//console.log(attr);
							if(attr == field && content[field]){
								//判断是否是日期格式
								//var flag = new Date(content[attr]).getDate()==content[attr].substring(content[attr].length-2);
								//if(flag){
									content[field] = getDateFormat(showStyle,content[field]);
								//}
							}
						}
					}
				}
			}
		}
		
		dataObj.content = content;
	}
	return data;
}

//判断obj是否为json对象  
function isJson(obj){  
    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;   
    return isjson;  
}  


