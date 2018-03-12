!(function (window, undefined) {

    'use strict';

    // // 是否存在的判断
    // var temp =
    //     '<div>' +
    //     '   <div -if="name">存在名字{{name}}</div>' +
    //     '</div>';
    // var data = {
    //     name: 'Tom',
    // };

    // 判断字符串
    // var temp =
    //     '<div>' +
    //     '   <div -if="name == \'Tom\'">名字是{{name}}</div>' +
    //     '</div>';
    // // 数据
    // var data = {
    //     name: 'Tom'
    // };

    // 判断数字
    // var temp =
    //     '<div>' +
    //     '   <div -if="age > 18">{{name}}年龄大于18</div>' +
    //     '</div>';
    // // 数据
    // var data = {
    //     name: 'Tom',
    //     age: 22
    // };

    // if else 使用
    // var temp =
    //     '<div>' +
    //     '   <div -if="age > 18">{{name}}年龄大于18</div>' +
    //     '   <div -else>{{name}}年龄<=18</div>' +
    //     '</div>';
    // // 数据
    // var data = {
    //     name: 'Tom',
    //     age: 16
    // };

    // if elseif else 使用
    var temp =
        '<div>' +
        '   <div -if="age > 18">{{name}}年龄大于18</div>' +
        '   <div -else-if="age == 18">{{name}}年龄等于18</div>' +
        '   <div -else>{{name}}年龄小于18</div>' +
        '</div>';
    // 数据
    var data = {
        name: 'Tom',
        age: 18
    };


    var vu = new $Vu({
        template: temp,
        data: data
    });
    vu.appendIn(document.body);


})(window);