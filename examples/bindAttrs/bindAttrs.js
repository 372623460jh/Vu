!(function (window, undefined) {

    'use strict';

    // 模板
    var temp =
        '<div class="class1" :class="dynamicClass" :data-prop="customProp">' +
        '   <!--img中的src属性-->' +
        '   <img :src="imgAdd" alt="">' +
        '   <!--input中的value属性-->' +
        '   <input type="text" :value="inputValue">' +
        '</div>';
    // 数据
    var data = {
        dynamicClass: 'class2',
        customProp: 'prop1',
        imgAdd: 'http://img.ijianghe.cn/images/jiangshow/js.png',
        inputValue: '值值值'
    };
    var vu = new $Vu({
        template: temp,
        data: data
    });
    vu.appendIn(document.body);

    setTimeout(function () {
        // 单向数据流 数据驱动视图
        data.inputValue = '变变变';
    }, 1000)

})(window);