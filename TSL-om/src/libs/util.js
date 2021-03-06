let util = {

};
util.title = function(title) {
    title = title ? title + ' - Home' : 'iView project';
    window.document.title = title;
};
//毫秒时间戳转特定格式 例：currentDate = util.timeFormat((new Date()).getTime(), 'yyyy-MM-dd HH:mm:ss')
util.timeFormat = function (time, format) {
    var t;
    if ((time + "").indexOf("-") != -1) {
        t = new Date(Date.parse(time.replace(/-/g, "/")));
    } else {
        t = new Date(time);
    }
    var tf = function (i) { return (i < 10 ? '0' : '') + i; };
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
        switch (a) {
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    });
}
export default util;
