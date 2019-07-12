/**
 * 上传文件
 * @param data 参数对象，以键值对对象({key: value,...})的方式传入
 * 该对象支持的参数(key)包括：
 * 		必要参数：
 * 			basePath: 设置请求的根路径，必要参数
 * 			width：设置文件上传窗口宽度(只支持具体数值，不支持百分比的写法)，必要参数
 * 			height：设置文件上传窗口的高度(只支持具体数值，不支持百分比的写法)，必要参数
 * 			savePath: 设置上传文件保存路径，例如：'fileupload/images/'，必要参数
 * 			
 * 
 * 		可选参数：
 * 			type：设置上传文件的类型，只能是image、doc、zip、htm、mms-image、mms-mid、ms-mobile、all其中的一项，可选参数
 * 			title：设置文件上传窗口显示标题，可选参数，缺省为''
 * 			parameter：设置自定义提交参数，格式为'param1=value1&param2=value2...'，可选参数，缺省为''
 * 			fileNum：设置待传文件的数量，0或负数为不限制，可选参数，缺省为0
 * 			size：设置上传单个文件大小，单位MB，可以填写小数类型，可选参数，缺省为3
 * 			autoClose：设置文件上传完成后，从上传列表中自动删除的时间，单位为秒。设置为-1时不会自动删除。可选参数，缺省为1
 * 			MD5File：设置MD5文件签名模式。只能是0、2、3其中的一项。注意：FLASH无法计算超过100M的文件,在无特殊需要时，请设置为0，可选参数，缺省为0
 * 				0为关闭MD5计算签名；
 * 				2为计算签名，将签名提交服务器验证，在根据服务器反馈来执行上传或不上传；
 * 				3为先提交文件基本信息，根据服务器反馈，执行MD5签名计算或直接上传，如果是要进行MD5计算，计算后，提交计算结果，
 * 				在根据服务器反馈，来执行是否上传或不上传；
 * 
 * 			autoUpload：设置为true时，用户选择文件后，直接开始上传。注意，该项设为true时，不会显示上传按钮。可选参数，缺省为false
 * 			autoCloseWindow: 设置为true时，用户完成一次文件上传后，如果上传没有发生错误，则自动关闭上传窗口，同时，会自动调用用户定义的callback函数；
 * 				设置为false时，用户完成一次文件上传后，不会自动关闭窗口。需要用户手动点击页面按钮来关闭窗口。
 * 				在用户手动点击“确定”按钮关闭窗口时，会调用用户定义的callback函数。
 * 				在用户手动点击“取消”按钮关闭窗口时，系统会自动将已上传的文件删除。
 * 				可选参数，缺省为true
 * 参数样式：
 * <code>
 * 	{
 * 		basePath: '${basePath}',
 * 		title: '上传文件',
 * 		width: 500,
 * 		height: 300,
 * 		type: 'doc',
 * 		savePath: 'uploadfiles',
 * 		parameter: 'key1=value1&key2=value2',
 * 		fileNum: 3,
 * 		size: 5,
 * 		autoClose: 1,
 * 		MD5File: 0,
 * 		autoUpload: false,
 * 		autoCloseWindow: true
 * 	}
 * </code>
 * 
 * @param callback 回调函数，自定义函数，该函数接收一个object类型的参数。
 * 在上传文件为1个时，该参数为一个上传文件对象，该对象包含的属性如下：
 * 		id: 上传文件在服务器端的唯一标识，当上传的文件是一个服务器端已存在的文件时，此处返回的id为服务器端已存在文件的id
 * 		fileName: 上传文件在服务器端保存时使用的文件名，当上传的文件是一个服务器端已存在的文件时，此处返回的名称为服务器端已存在文件的名称
 * 		originalFileName：上传文件原始名称
 * 		fileType：上传文件扩展名，例如：txt、png、jpeg
 * 		fileInSystemPath：上传文件存储路径，当存储模式为文件系统存储时，该值为文件在文件系统中的位置，当存储模式为mongodb时，该值等同于savePath参数。
 * 		MD5：上传文件的MD5值
 * 		fileSize：上传文件的大小
 * 		createDate：上传文件的日期，当上传的文件是一个服务器端已存在的文件时，createDate为空。
 * 		downloadUrl：文件下载请求地址，该请求地址的参数除地址中所携带的标准参数之外，还包括2个可选参数：mode和hideFileName。
 * 					当指定mode参数时，参数值应为'download'，表示强制使用下载方式下载文件。
 * 					当指定hideFileName参数时，参数值应为'true'或者'false'。表示是否隐藏下载文件的原始文件名称。
 * 					注意：hideFileName参数依赖于mode参数，即:如果不指定mode参数，系统会忽略hideFileName参数。括
 * 		deleteUrl：文件删除请求地址
 * 
 * 在上传文件为多个时，该参数为一个上传文件对象数组。
 * 
 * 方法调用典型样例:
 * <code>
 * 	var data = {
 * 		basePath: '${basePath}',
 * 		title: '上传文件',
 * 		width: 500,
 * 		height: 300,
 * 		type: 'doc',
 * 		savePath: 'uploadfiles/xxx/yyy/',
 * 		parameter: 'param1=value1&param2=value2',
 * 		fileNum: 3,
 * 		size: 5
 * 	}
 * 
 * 	uploadFile(data, function(file){
 * 		var id = file.id	//上传文件在服务器端的唯一标识
 * 		var fileName = file.fileName	//上传文件在服务器端保存时使用的文件名
 * 		var downloadUrl = file.downloadUrl	//上传文件的下载请求路径
 * 		...
 * 	});
 * </code>
 */
function uploadFile(data, callback){
	data = validate(data);
	if(data){
		var uploadWindow = buildUploadWindowParams(data, callback);
		mini.open(uploadWindow);
	}
}

/**
 * 验证上传参数
 * @param data 上传参数
 * @returns 如果验证失败，返回false；否则，返回验证后的数据对象。
 */
function validate(data){
	if(data == undefined){
		showValiedateMessage('缺少data参数。');
		return false;
	}
	
	if(data.basePath == undefined || typeof(data.basePath) != 'string'){
		showValiedateMessage('缺少data.basePath参数或参数类型不正确。');
		return false;
	}
	
	if(data.savePath == undefined || typeof(data.savePath) != 'string'){
		showValiedateMessage('缺少data.savePath参数或参数类型不正确。');
		return false;
	}
	
	if(data.width == undefined || typeof(data.width) != 'number'){
		showValiedateMessage('缺少data.width参数或参数类型不正确。');
		return false;
	}else if(data.width < 300){
		data.width = 300;
	}
	
	if(data.height == undefined || typeof(data.height) != 'number'){
		showValiedateMessage('缺少data.height参数或参数类型不正确。');
		return false;
	}else if(data.height < 300){
		data.height = 300;
	}
	
	if(data.type == undefined || typeof(data.type) != 'string'){
		data.type = 'all';
	}
	
	if(data.parameter == undefined || typeof(data.parameter) != 'string'){
		data.parameter = '';
	}
	
	if(data.fileNum != undefined && typeof(data.fileNum) != 'number'){
		showValiedateMessage('data.fileNum参数类型不正确。');
		return false;
	}
	
	if(data.size != undefined && typeof(data.size) != 'number'){
		showValiedateMessage('data.size参数类型不正确。');
		return false;
	}
	
	if(data.autoClose != undefined && typeof(data.autoClose) != 'number'){
		showValiedateMessage('data.autoClose参数类型不正确。');
		return false;
	}
	
	if(data.MD5File != undefined && (typeof(data.MD5File) != 'number' 
		|| (data.MD5File != 0 && data.MD5File != 2 && data.MD5File != 3))){
		showValiedateMessage('data.MD5File参数不正确。');
		return false;
	}
	
	if(data.autoUpload == undefined){
		data.autoUpload = false;
	}else if(typeof(data.autoUpload) != 'boolean'){
		showValiedateMessage('data.autoUpload参数类型不正确。');
		return false;
	}
	
	if(data.autoCloseWindow == undefined){
		data.autoCloseWindow = true;
	}else if(typeof(data.autoCloseWindow) != 'boolean'){
		showValiedateMessage('data.autoCloseWindow参数类型不正确。');
		return false;
	}
	
	return data;
}

/**
 * 显示验证失败信息
 * @param message
 */
function showValiedateMessage(message){
	mini.showMessageBox({
      	width: 300,
       	title: '提示',
       	buttons: ['确定'],
       	iconCls: "mini-messagebox-warning",
       	message: message
	});
}


/**
 * 构造文件上传配置参数
 * @param data 上传参数
 * @returns 文件上传配置参数对象
 */
function buildUploadConfigParams(data){
	var config = {};
	
	config.title = data.title != undefined ? data.title : '';
	config.type = data.type;
	config.parameter = (data.parameter != undefined && $.trim(data.parameter) != '') 
		? encodeURIComponent(data.parameter + '&savePath=' + data.savePath) 
		: encodeURIComponent('savePath=' + data.savePath);
	config.fileNum = data.fileNum != undefined ? data.fileNum : 0;
	config.size = data.size != undefined ? data.size : 3;
	config.autoClose = data.autoClose != undefined ? data.autoClose : 1;
	config.MD5File = data.MD5File != undefined ? data.MD5File : 0;
	config.autoUpload = data.autoUpload != undefined ? data.autoUpload : false;
	config.autoCloseWindow = data.autoCloseWindow != undefined ? data.autoCloseWindow : true;
	config.width = data.width;
	config.height = data.height;
	config.fileType = data.fileType != undefined ? data.fileType : '';
	
	return config;
}

/**
 * 构造文件上传窗口URL参数
 * @param config
 * @returns {String}
 */
function buildUploadWindowURLParams(config){
	var params = '?';
	params += ('title=' + encodeURI(encodeURI(config.title))  
			+ '&type=' + config.type 
			+ '&parameter=' + config.parameter 
			+ '&fileNum=' + config.fileNum 
			+ '&size=' + config.size
			+ '&autoClose=' + config.autoClose
			+ '&MD5File=' + config.MD5File
			+ '&autoUpload=' + config.autoUpload
			+ '&autoCloseWindow=' + config.autoCloseWindow
			+ '&width=' + config.width
			+ '&height=' + config.height
			+ '&fileType=' + config.fileType);
	return params;
}

/**
 * 构造文件上传窗口参数
 * @param data
 * @param callback
 * @returns 文件上传窗口对象
 */
function buildUploadWindowParams(data, callback){
	var basePath = data.basePath;
	var config = buildUploadConfigParams(data);
	var params = buildUploadWindowURLParams(config);
	
	var uploadWindow = {};
	uploadWindow.url = data.basePath + 'fileupload/uploadwindow/open.htm' + params;
	uploadWindow.showMaxButton = false;
	uploadWindow.allowResize = false;
	uploadWindow.title = data.title != undefined ? data.title : '';
	uploadWindow.iconCls = 'icon-addnew';
	uploadWindow.width = data.width;
	uploadWindow.height = data.height;
	
	uploadWindow.ondestroy = function(action){
		var iframe = this.getIFrameEl();
		var data = iframe.contentWindow.getData();
		data = mini.clone(data);
		if(action == 'cancel'){
			if(data.id == undefined){
				var length = data.length
				for(var i=0; i<length; i++){
					if(data[i].createDate != ''){
						$.get(basePath + data[i].deleteUrl);
					}
				}
			}else if(data.createDate != ''){
				$.get(basePath + data.deleteUrl);
			}
		}else if((action == 'ok' || action == 'close') && callback != undefined && typeof(callback) == 'function'){
			callback(data);
		}
	};
	
	return uploadWindow;
}