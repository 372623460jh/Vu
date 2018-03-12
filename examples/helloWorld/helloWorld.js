!(function (window, undefined) {

    'use strict';

    // 模板
    var temp = '<div>{{hello}}</div>';
    // 数据
    var data = {
        hello: '你好,世界!'
    };
    var vu = new $Vu({
        template: temp,
        data: data
    });
    vu.appendIn(document.body);

})(window);