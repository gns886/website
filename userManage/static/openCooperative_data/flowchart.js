/**
	 * flowchart对象构造方法
	 * 
	 * @param userid
	 *            当前操作人ID
	 * @param username
	 *            当前操作人名称
	 * @param initData
	 *            初始数据
	 * @param viewOnly
	 *            是否是只读模式
	 * @param auditFlowData
	 *            审核流程数据
	 * @param options
	 *            流程设计器选项
	 * @returns flowchart对象
	 */
var Flowchart = function(userid, username, callback, initData, viewOnly, auditFlowData, options) {
	var _this = this;
	_this.currentUserid = userid; // 当前操作人ID
	_this.currentUsername = username; // 当前操作人名称
	_this.flowData; // 流程数据
	_this.auditFlowData = auditFlowData; // 审批流程数据
	_this.openSelectorIntention; // 打开选择器的意图
	_this.NEW_FLOW_INTENTION = "new"; // 新建流程意图
	_this.APPEND_FLOW_INTENTION = "append"; // 追加流程意图
	_this.appendType; // 追加流程类型
	_this.APPEND_TYPE_RESET_CHILD = "reset_child"; // 追加类型：重设子节点
	_this.APPEND_TYPE_APPEND_CHILD = "append_child"; // 追加类型：追加子节点
	_this.currentNodeId; // 当前追加流程的节点ID
	_this.flowTypeKeep; // 并行、串行始终保持选项
	_this.maxChildNodesCount = 0; // 流程中下一级节点最多的节点的下一级节点数量
	_this.singleDimensionalData = []; // 一维的流程数据
	_this.callback = callback; // 关闭流程图是触发的回调方法
	_this.options = { // 流程设计器选项的默认值
		allowSetRights : false,	// 是否允许在节点上设置权限，默认为否
		allowCondition : false, // 是否允许创建条件分支，默认为否
		formFields : [], // 表单和字段，用于设置条件
		panel : undefined, // 传此值时流程图将不以窗口形式展现，流程图会渲染于该面板中，此属性为面板ID。面板中渲染只支持只读模式，且会强行转为只读模式。
		showLegend : true, // 是否显示图例（只有在只读模式时有效）
		chartMinHeight : 0 // 流程图最小高度，用于解决不垂直居中的问题
	};
	_this.flowchartFullSize = {width:0,height:0}; // 流程图设计器的全尺寸大小

	if (initData) { // 如果初始数据存在
		_this.flowData = initData; // 设置初始数据
	}
	_this.viewOnly = viewOnly;

	if(options){
		if(typeof(options.allowSetRights) != "undefined"){
			_this.options.allowSetRights = options.allowSetRights;
		}
		if(typeof(options.allowCondition) != "undefined"){
			_this.options.allowCondition = options.allowCondition;
		}
		if(typeof(options.formFields) != "undefined"){
			_this.options.formFields = options.formFields;
		}
		if(typeof(options.panel) != "undefined"){
			_this.options.panel = options.panel;
			_this.viewOnly = true;
		}
		if(typeof(options.showLegend) != "undefined"){
			_this.options.showLegend = options.showLegend;
		}
		if(typeof(options.chartMinHeight) != "undefined"){
			_this.options.chartMinHeight = options.chartMinHeight;
		}
	}

	/**
	 * 新建流程
	 */
	this.newFlow = function() {
		_this.openSelectorIntention = _this.NEW_FLOW_INTENTION;
		_this.tempFlowTypeKeep = _this.flowTypeKeep;
		_this.flowTypeKeep = null;
		_this.openSelector();
	};

	/**
	 * 追加流程
	 */
	this.appendFlow = function(nodeId) {
		_this.openSelectorIntention = _this.APPEND_FLOW_INTENTION;
		_this.currentNodeId = nodeId;
		_this.openSelector();
	};

	/**
	 * 打开人员选择器
	 */
	this.openSelector = function() {
		var params = new Object();
		params.showCheckBox = '2,3,4,5,6,8,9';// 包含允许选中的节点type。包含1，代表允许选中单位。包含2，代表允许选中部门。以此类推，具体数字要跟net.huatech.framework.unit.bean.OrgUnitAdapter中定义的值一致。
		params.multiSelect = true; // 控制 是否允许 多选，true ：多选，false： 单选。默认多选！
		params.shows = '1,2,3,4,6,8,xuanke,shouke'; // 控制显示那几个树，1：显示组织机构树，2：显示岗位信息树，3：显示职务信息树，4：群组信息树。
		onOpenSelector(params, _this.selectCallback, _this.cancelCallback);
	};

	/**
	 * 人员选择结束回调方法
	 */
	this.selectCallback = function(result) {
		var data = mini.decode(result);
		if (data.length > 1) {
			if (_this.flowTypeKeep) {
				_this.optionSelectCallback(data, _this.flowTypeKeep);
			} else {
				mini.open({
					url : onGetBasePath() + "/resources/components/flowchart/optionWindow.html",
					title : "请选择节点在流程中的排列方式",
					width : 460,
					height : 140,
					allowResize : false,
					onload : function() {
						var iframe = this.getIFrameEl();
						iframe.contentWindow.setData(data);
					},
					ondestroy : function(action) {
						if (action.startWith("always_")) {
							action = action.substring(7);
							_this.flowTypeKeep = action;
						}
						if ("parallel" == action || "serial" == action
								|| "combination" == action) {
							_this.optionSelectCallback(data, action);
						} else {
							_this.cancelCallback();
						}
					}
				});
			}
		} else if (data.length == 1) {
			_this.optionSelectCallback(data);
		} else {
			_this.cancelCallback();
		}
		_this.callback();
	};

	/**
	 * 选项选择完毕回调方法
	 */
	this.optionSelectCallback = function(data, type) {
		if (_this.openSelectorIntention == _this.NEW_FLOW_INTENTION) {
			_this.newFlowCallback(data, type);
		} else if (_this.openSelectorIntention == _this.APPEND_FLOW_INTENTION) {
			_this.appendFlowCallback(data, type);
		}
		_this.showFlow();
		_this.callback();
	};

	/**
	 * 人员选择点击取消回调方法
	 */
	this.cancelCallback = function() {
		if (_this.openSelectorIntention == _this.NEW_FLOW_INTENTION) {
			_this.flowTypeKeep = _this.tempFlowTypeKeep;
			_this.showFlow();
		}
		if (_this.openSelectorIntention == _this.APPEND_FLOW_INTENTION) {
			_this.showFlow();
		}
	};

	/**
	 * 新建流程回调方法
	 */
	this.newFlowCallback = function(data, type) {
		var nodes = [];
		if (type && "parallel" == type) {
			var firstNode = {};
			firstNode.name = _this.currentUsername;
			firstNode.id = _this.currentUserid;
			firstNode.type = 6;
			firstNode.childNodes = [];
			for ( var i = 0; i < data.length; i++) {
				var o = data[i];
				var node = {};
				node.name = o.textField;
				node.id = o.idField;
				node.type = o.type;
				node.childNodes = [];
				firstNode.childNodes.push(node);
			}
			nodes.push(firstNode);
		} else if (type && "combination" == type) {
			var firstNode = {};
			firstNode.name = _this.currentUsername;
			firstNode.id = _this.currentUserid;
			firstNode.type = 6;
			firstNode.childNodes = [];
			var combinationNode = {};
			combinationNode.members = [];
			combinationNode.name = "自定义组合";
			combinationNode.type =0;
			combinationNode.childNodes = [];
			for ( var i = 0; i < data.length; i++) {
				var o = data[i];
				var member = {};
				member.name = o.textField;
				member.id = o.idField;
				member.type = o.type;
				combinationNode.members.push(member);
			}
			firstNode.childNodes.push(combinationNode);
			nodes.push(firstNode);
		} else {
			var firstNode = {};
			firstNode.name = _this.currentUsername;
			firstNode.id = _this.currentUserid;
			firstNode.type = 6;
			firstNode.childNodes = [];
			var tempNode = firstNode;
			for ( var i = 0; i < data.length; i++) {
				var o = data[i];
				var node = {};
				node.name = o.textField;
				node.id = o.idField;
				node.type = o.type;
				node.childNodes = [];
				tempNode.childNodes.push(node);
				tempNode = node;
			}
			nodes.push(firstNode);
		}
		_this.flowData = nodes;
	};

	/**
	 * 追加流程回调方法
	 */
	this.appendFlowCallback = function(data, type) {
		if (_this.currentNodeId) {
			var tempNode = _this.getNode(_this.currentNodeId);
			// 如果当前的环节中存在joinNode属性，需要将其移除掉，并且给接下来的子节点加上
			var joinNode = '';
			if (tempNode.joinNode && tempNode.joinNode != '') {
				joinNode = tempNode.joinNode;
				delete tempNode.joinNode; // 把选择追加节点的这个对象的joinNode去掉
			}
			if(data.length>0){
				tempNode.endNode = false;
			}
			if(tempNode.childNodes == undefined) {
				tempNode.childNodes = [];
			}
			
			if (type && "parallel" == type) {
				var nodes = [];
				for ( var i = 0; i < data.length; i++) {
					var o = data[i];
					var node = {};
					node.name = o.textField;
					node.id = o.idField;
					node.type = o.type;
					node.childNodes = [];
					if (joinNode != '') {
						node.joinNode = joinNode;
					}
					nodes.push(node);
				}
				if(_this.appendType == _this.APPEND_TYPE_APPEND_CHILD){
					tempNode.childNodes = tempNode.childNodes.concat(nodes);
				}else if(_this.appendType == _this.APPEND_TYPE_RESET_CHILD){
					// 重设子环节
					_this.resetJoinNodes(tempNode, '');
					tempNode.childNodes = nodes;
				}
			} else if (type && "combination" == type) {
				var combinationNode = {};
				combinationNode.members = [];
				combinationNode.name = "自定义组合";
				combinationNode.type =0;
				combinationNode.childNodes = [];
				if (joinNode != '') {
					combinationNode.joinNode = joinNode;
				}
				var nodes = [];
				for ( var i = 0; i < data.length; i++) {
					var o = data[i];
					var member = {};
					member.name = o.textField;
					member.id = o.idField;
					member.type = o.type;
					combinationNode.members.push(member);
				}
				nodes.push(combinationNode);
				
				if(_this.appendType == _this.APPEND_TYPE_APPEND_CHILD){
					tempNode.childNodes = tempNode.childNodes.concat(nodes);
				}else if(_this.appendType == _this.APPEND_TYPE_RESET_CHILD){
					_this.resetJoinNodes(tempNode, '');
					tempNode.childNodes = nodes;
				}
			} else {
				var temp = tempNode;				
				if(_this.appendType == _this.APPEND_TYPE_RESET_CHILD){
					_this.resetJoinNodes(tempNode, '');
					temp.childNodes = [];
				}
				for ( var i = 0; i < data.length; i++) {
					var o = data[i];
					var node = {};
					node.name = o.textField;
					node.id = o.idField;
					node.type = o.type;
					node.childNodes = [];
					temp.childNodes.push(node);
					temp = node;
				}
				// 给最后一个孩子节点赋值joinNode属性
				if (joinNode != '') {
					temp.joinNode = joinNode;
				}
			}
		}
	};
	
	/**
	 * 针对重设子环节，来处理带有合并的节点
	 */
	this.resetJoinNodes = function(tempNode, type) {
		var joinNodes = []; // 用于存放所有合并节点的joinId值
		var nodes = []; // 存放当前重设子环节的流程数据 自由/审核
		var array = [];
		tempNode.nodeId = tempNode.nodeId + '';
		if (tempNode.nodeId.indexOf("audit_node_") >= 0) {
			nodes = _this.auditFlowData;
		} else {
			nodes = _this.flowData;
		}
		// 先查找当前选中的这个节点的叶子节点对应的joinId值
		var leafNodes = _this.getLeafNodes4ThisNodes([tempNode]);
		for (var i = 0; i < leafNodes.length; i++) {
			if (leafNodes[i].joinNode && leafNodes[i].joinNode != '') {
				joinNodes.push(leafNodes[i].joinNode);
			}
		}
		// 如果是删除操作并且当前节点有joinId属性，需要默认把这个值放进去
		if (type == 'delete' && tempNode.joinId && tempNode.joinId != '') {
			joinNodes.push(tempNode.joinId);
		}
		if (joinNodes.length > 0) {
			joinNodes = _this.removeDuplicatedItem(joinNodes);
			for (var j = 0; j < joinNodes.length; j++) {
				_this.getjoinIds(joinNodes[j], nodes, array);
			}
		}
		array = _this.removeDuplicatedItem(array);
		for (var p = 0; p < nodes.length; p++) {
			var node = nodes[p];
			// 如果当前节点有joinId并且在array中，那么直接把这个节点移除掉；如果没有，查找叶子节点，delete带有这个值得属性
			if (node.joinId && node.joinId != '' && array.indexOf(node.joinId) >= 0) {
				nodes.splice(p, 1);
				p = p - 1 ;
				continue;
			} else {
				var allLeafNodes = _this.getLeafNodes4ThisNodes([node]);
				for (var q = 0; q < allLeafNodes.length; q++) {
					if (array.indexOf(allLeafNodes[q].joinNode) >= 0) {
						delete allLeafNodes[q].joinNode;
					}
				}
			}
		}
	};
	
	/**
	 * 根据传入的数组，获取没有重复元素的一个新数组
	 */
	this.removeDuplicatedItem = function (ar) {
		var ret = [];
		for (var i = 0, j = ar.length; i < j; i++) {
			if (ret.indexOf(ar[i]) === -1) {
				ret.push(ar[i]);
			}
		}
		return ret;
	};
	
	/**
	 * 根据一个joinId来获取所有联动的joinId值串
	 */
	this.getjoinIds = function(joinId, nodes, joinNodes) {
		for (var k = 1; k < nodes.length; k ++) {
			if (nodes[k].joinId == joinId) {
				joinNodes.push(joinId);
				// 查找当前这个对象的所有叶子节点是否有joinNode属性
				var leafNodes = _this.getLeafNodes4ThisNodes([nodes[k]]);
				for (var l = 0; l < leafNodes.length; l ++) {
					if (leafNodes[l].joinNode && leafNodes[l].joinNode != '') {
						joinNodes.push(leafNodes[l].joinNode);
						_this.getjoinIds(leafNodes[l].joinNode, nodes, joinNodes);
					}
				}
			}
		}
		return _this.removeDuplicatedItem(joinNodes);
	};
	
	/**
	 * 获取全部叶子节点
	 */
	this.getLeafNodes4ThisNodes = function(nodes) {
		var leafNods = [];
		_this.recursionGetLeaf(nodes, leafNods);
		return leafNods;
	};
	
	this.recursionGetLeaf = function(nodes, leafNodes) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.childNodes && node.childNodes.length > 0) {
				_this.recursionGetLeaf(node.childNodes, leafNodes);
			} else {
				leafNodes.push(node);
			}
		}
	};

	this.getNode = function(nodeId) {
		var nodeNums = [];
		if(typeof nodeId == "number" || nodeId.indexOf("_") < 0){
			nodeNums.push(nodeId);
		} else {
			nodeNums = nodeId.split("_");
		}
		var tempNode = _this.flowData[nodeNums[0]];
		for ( var i = 1; i < nodeNums.length; i++) {
			var subscript = nodeNums[i];
			tempNode = tempNode.childNodes[subscript];
		}
		return tempNode;
	};

	/**
	 * 显示流程图方法
	 */
	this.showFlow = function() {
		var panelId = _this.options.panel;
		var onloadFuction = function() {
			if (_this.flowData && _this.flowData.length > 0) {
				var iframe = this.getIFrameEl();
				iframe.contentWindow.setData(mini.clone(_this.flowData), _this.viewOnly, mini.clone(_this.auditFlowData), _this);
		        _this.flowchartFullSize=iframe.contentWindow.getFullSize();
		        if(_this.flowchartLoadCallback) {
			        _this.flowchartLoadCallback(_this.flowchartFullSize);
		        }
			}
		};
		
		var ondestroyFuction = function(action) {
			if (action.startWith("clickNode_")) { // 节点被点击
				if(action.startWith("clickNode_append_")){ // 追加子节点
					_this.appendType = _this.APPEND_TYPE_APPEND_CHILD;
					var nodeId = action.substring(17);
					_this.appendFlow(nodeId);
				}else if(action.startWith("clickNode_reset_")){ // 重设子节点
					_this.appendType = _this.APPEND_TYPE_RESET_CHILD;
					var nodeId = action.substring(16);
					_this.appendFlow(nodeId);
				}
			} else if (action.startWith("setCondition_")){
				var nodeId = action.substring(13);
				_this.setCondition(nodeId);
			} else if (action == "redraw") {
				_this.newFlow();
			} else if (action = "ok") {
				if (_this.callback) {
					_this.callback();
				}
			}
		};
		
		if(panelId && $("#"+panelId).length>0) {
			var panel = mini.get(panelId);
			panel.load(onGetBasePath() + "/resources/components/flowchart/flow.html", onloadFuction , ondestroyFuction);
		} else {
			mini.open({
				url : onGetBasePath() + "/resources/components/flowchart/flow.html",
				title : "流程",
				width : 900,
				height : 550,
				allowResize : false,
				showCloseButton : true,
				onload : onloadFuction,
				ondestroy : ondestroyFuction
			});
		}
	};

	/**
	 * 切换多人节点的处理协作方式 type=all 全部人员均需要处理 type=one 任意一人处理即可
	 */
	this.changeGroupOpType = function(nodeId, type) {
		var node = _this.getNode(nodeId);
		node.groupOpType = type;
	};

	/**
	 * 设置节点是否为结束节点
	 */
	this.setEndNode = function(nodeId, endNode) {
		var node = _this.getNode(nodeId);
		node.endNode = endNode;
	};	

	/**
	 * 获取流程描述文字
	 */
	this.getFlowDescription = function() {
		var data = _this.flowData;
		if (data && data.length > 1) { // 带有流程合并的，显示"[多层]请查看流程图"
			return "[多层]请查看流程图";
		}
		if (data && data[0] && data[0].childNodes) {
			var singleColumn = true;
			var nodes = data[0].childNodes;
			var nodesName = [];
			for ( var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				nodesName.push(node.name);
				if (node.childNodes && node.childNodes.length > 0) {
					singleColumn = false;
				}
			}
			if (singleColumn) {
				return "[并行]" + nodesName.join(";");
			}

			_this.maxChildNodesCount = 0;
			var nodeNames = [];
			var row = _this.recurseGetCountAndName(nodes, nodeNames);
			if (_this.maxChildNodesCount == 0) {
				return "[串行]" + nodeNames.join(";");
			}

			return "[多层]请查看流程图";
		}
	};

	/**
	 * 递归计算行数
	 */
	this.recurseGetCountAndName = function(nodes, nodeNames) {
		if(nodes) {
			for ( var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (i > _this.maxChildNodesCount) {
					_this.maxChildNodesCount = i;
				}
				nodeNames.push(node.name);
				_this.recurseGetCountAndName(node.childNodes, nodeNames);
			}
		}
	};

	/**
	 * 获取一维的流程数据，层级用PID来对应
	 */
	this.getSingleDimensionalData = function() {
		_this.singleDimensionalData = [];
		var data = mini.clone(_this.flowData);
		for (var i = 0; i < data.length; i++) {
			var node = data[i];
			node.displayOrder = i;
			if (node.joinId && node.joinId != '') {
				node.pId = 'join_node_' + i;
			} else {
				node.pId = i;
			}
			node.title = node.name;
			node.alisaname = node.alisaname;
			node.name = node.id;
			node.id = Math.uuidFast();
			_this.recursePutSingleDimensionalData(node);
			node.childNodes = undefined;
			if (node.type == 0) {
				if(node.members){
				 	// 增加逻辑判断：只有当这个节点的类型是组合时，才会将人员id串放入name属性中
					node.name = _this.getCombinationMembersIdStr(node.members);
					node.members = undefined;
				}
			} else {
				delete node.members;
			}
			_this.singleDimensionalData.push(node);
		}
		return _this.singleDimensionalData;
	};
	
	this.getSingleDimensionalAuditData = function() {
		_this.singleDimensionalData = [];
		var data = mini.clone(_this.auditFlowData);
		var array = new Array();
		var pNode = {};
		pNode.name = "0";
		pNode.type = 6;
		pNode.childNodes = data;
		array.push(pNode);
		for (var i = 0; i < array.length; i++) {
			var node = array[i];
			node.pId = i;
			node.title = node.name;
			node.alisaname = node.alisaname;
			node.name = node.id;
			node.id = Math.uuidFast();
			_this.recursePutSingleDimensionalData(node);
			node.childNodes = undefined;
			if (node.type == 0) {
				if(node.members){
				 	// 增加逻辑判断：只有当这个节点的类型是组合时，才会将人员id串放入name属性中
					node.name = _this.getCombinationMembersIdStr(node.members);
					node.members = undefined;
				}
			} else {
				delete node.members;
			}
			_this.singleDimensionalData.push(node);
		}
		return _this.singleDimensionalData;
	};

	/**
	 * 递归方式填充一维流程数据
	 */
	this.recursePutSingleDimensionalData = function(parentNode) {
		if(parentNode.childNodes) {
			var nodes = parentNode.childNodes;
			for ( var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				node.displayOrder = i;
				if (node.joinId && node.joinId != '') {
					node.pId = 'join_node_' + i;
				} else {
					node.pId = parentNode.id;
				}
				node.title = node.name;
				node.name = node.id;
				node.id = Math.uuidFast();
				_this.recursePutSingleDimensionalData(node);
				node.childNodes = undefined;
				if (node.type == 0) {
					if(node.members){
					 	// 增加逻辑判断：只有当这个节点的类型是组合时，才会将人员id串放入name属性中
						node.name = _this.getCombinationMembersIdStr(node.members);
						node.members = undefined;
					}
				} else {
					delete node.members;
				}
				_this.singleDimensionalData.push(node);
			}
		}
	};
	
	/**
	 * 获取组合节点成员ID拼接字符串
	 */
	this.getCombinationMembersIdStr = function(members){
		var idArray = [];
		for(var i=0;i<members.length;i++){
			idArray.push(members[i].id);
		}
		return idArray.join(",");
	};

	/**
	 * 设置节点属性
	 */
	this.setNodeAttribute = function(nodeId, attrName, attrValue) {
		var node = _this.getNode(nodeId);
		node[attrName] = attrValue;
	};
	
	/**
	 * 传入表单和字段，用于设置条件分支表达式
	 */
	this.setFormFields = function(formFields) {
		_this.options.formFields = formFields;
	};
	
	/**
	 * 设置转入条件
	 */
	this.setCondition = function(nodeId) {
		mini.open({
			url : onGetBasePath() + "/resources/components/flowchart/conditionWindow.html",
			type:"get",
			title : "设置转入条件",
			width : 600,
			height : 400,
			allowResize : false,
			onload : function() {
				var node = _this.getNode(nodeId);
			 	var iframe = this.getIFrameEl();
		        iframe.contentWindow.setData(_this.options.formFields, node.conditions, node.conditionAndOr);
			},
			ondestroy : function(action) {
				if(action == 'save'){
					var node = _this.getNode(nodeId);
				 	var iframe = this.getIFrameEl();
				 	
					var conditionGrid = iframe.contentWindow.mini.get("conditionGrid");
					var data = conditionGrid.getData();
					if(data.length>0) { // 有条件
						var andOr = iframe.contentWindow.mini.get("andOr").getValue();
						var expression = "";
						var expressionArr = [];
						for(var i=0; i<data.length; i++) {
							delete data[i]._id;
							delete data[i]._uid;
							delete data[i]._state;
							var variable = "_"+data[i].field;
							var formId = data[i].field.split("_")[0];
							var formName = "";
							for(var n=0; n<_this.options.formFields.length; n++){
								var form = _this.options.formFields[n];
								if(form.formId == formId) {
									formName = form.formName;
								}
							}
							if(formName) {
								data[i].formName = formName;
							}
							expressionArr.push("(typeof("+variable+")=='undefined'?false:"+variable+data[i].operator+"'"+data[i].value+"')");
						}
						expression = expressionArr.join(andOr=="and"?"&&":"||");
						node.conditions = data;
						node.conditionAndOr = andOr;
						node.expression = expression;
						node.conditionBranch = true;
					} else {
						delete node.conditions;
						delete node.conditionAndOr;
						delete node.expression;
						delete node.conditionBranch;
					}
				}
				_this.showFlow();
			}
		});
	};
	
	this.setFlowData = function(data) {
		delete _this.flowData;
		_this.flowData = data;
	};
	
	this.setAuditFlowData = function(data) {
		delete _this.auditFlowData;
		_this.auditFlowData = data;
	};
};

/**
 * UUID工具类
 */
Math.uuidFast = function() {
	var uuid ="";
	$.ajax({
		url : basePath + "flowNode/createNodeId.htm",
		type : "post",
		async: false,
		success : function(data) {
			uuid = data;
		}
	});
	
	return uuid;
};

/*(function() {
	var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
			.split('');
	Math.uuidFast = function() {
		var chars = CHARS, uuid = new Array(36), rnd = 0, r;
		for ( var i = 0; i < 36; i++) {
			if (i == 8 || i == 13 || i == 18 || i == 23) {
				uuid[i] = '';
			} else if (i == 14) {
				uuid[i] = '4';
			} else {
				if (rnd <= 0x02)
					rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
		console.info("-----",uuid);
		return uuid.join('');
	};
})();*/