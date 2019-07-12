__CreateJSPath = function (js) {
    var scripts = document.getElementsByTagName("script");
    var path = "";
    for (var i = 0, l = scripts.length; i < l; i++) {
        var src = scripts[i].src;
        if (src.indexOf(js) != -1) {
            var ss = src.split(js);
            path = ss[0];
            break;
        }
    }
    var href = location.href;
    href = href.split("#")[0];
    href = href.split("?")[0];
    var ss = href.split("/");
    ss.length = ss.length - 1;
    href = ss.join("/");
    if (path.indexOf("https:") == -1 && path.indexOf("http:") == -1 && path.indexOf("file:") == -1 && path.indexOf("\/") != 0) {
        path = href + "/" + path;
    }
    return path;
};

__CreatePath = function (js, level) {
    var scripts = document.getElementsByTagName("script");
    var path = "";
    for (var i = 0, l = scripts.length; i < l; i++) {
        var src = scripts[i].src;
        if (src.indexOf(js) != -1) {
            var ss = src.split(js);
            path = ss[0];
            
            ss = path.split("/");
            ss.length = ss.length - level;
            path = ss.join("/");
            
            break;
        }
    }
    var href = location.href;
    href = href.split("#")[0];
    href = href.split("?")[0];
    var ss = href.split("/");
    ss.length = ss.length - 1;
    href = ss.join("/");
    if (path.indexOf("https:") == -1 && path.indexOf("http:") == -1 && path.indexOf("file:") == -1 && path.indexOf("\/") != 0) {
        path = href + "/" + path;
    }
    return path;
};

var bootPATH = __CreateJSPath("boot.js");
var BASE_PATH = __CreatePath("boot.js", 2);
var RESOURCES_PATH = BASE_PATH + '/resources';

//debugger
mini_debugger = false;   

document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'miniui/themes/default/miniui.css" />');
document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'miniui/themes/icons.css" />');
document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'css/global.css" />');
// document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'css/newIcons.css" />');
// document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'css/jquery-ui.min.css" />');
// document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'css/jquery-ui.theme.min.css" />');
document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'css/portal.css" />');

//javascript
document.write('<script type="text/javascript" src="' + RESOURCES_PATH + '/lib/jquery-1.12.4.min.js"></script>');
// document.write('<script type="text/javascript" src="' + bootPATH + 'jquery-ui.min.js"></script>');
document.write('<script type="text/javascript" src="' + bootPATH + 'miniui/miniui.js"></script>');
document.write('<script type="text/javascript" src="' + bootPATH + 'script/validate.js"></script>');
document.write('<script type="text/javascript" src="' + bootPATH + 'miniui/locale/zh_CN.js"></script>');
document.write('<script type="text/javascript" src="' + bootPATH + 'script/public.js"></script>');
document.write('<script type="text/javascript" src="' + bootPATH + 'script/Math.uuid.js"></script>');
document.write('<script type="text/javascript" src="' + bootPATH + 'script/pngBG.js"></script>');
document.write('<script type="text/javascript" src="' + BASE_PATH + '/resources/js/index/changeThemes.js"></script>');

//skin
var skin = getCookie("miniuiSkin");
if (skin||true) {
    document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'miniui/themes/2018-skin/skin.css" />');
    document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'miniui/themes/2018-skin/2018-css/popup.css" />');
    document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'miniui/themes/2018-skin/2018-css/datagrid.css" />');
    document.write('<link rel="stylesheet" type="text/css" href="' + bootPATH + 'miniui/themes/2018-skin/2018-css/button.css" />');
}

function getCookie(sName) {
    var aCookie = document.cookie.split("; ");
    var lastMatch = null;
    for (var i = 0; i < aCookie.length; i++) {
        var aCrumb = aCookie[i].split("=");
        if (sName == aCrumb[0]) {
            lastMatch = aCrumb;
        }
    }
    if (lastMatch) {
        var v = lastMatch[1];
        if (v === undefined) return v;
        return unescape(v);
    }
    return null;
}

window.console = window.console || (function() {
	var c = {};
	c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {
	};
	return c;
})();