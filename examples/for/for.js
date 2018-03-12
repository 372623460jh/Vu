!(function (window, undefined) {

    'use strict';

    // 模板
    var temp = '' +
        '<ul>' +
        '   <li -for="item in list">{{item.name}}</li>' +
        '</ul>';
    // 数据
    var data = {
        list: [
            {name: 'list1'},
            {name: 'list2'},
            {name: 'list3'},
            {name: 'list4'},
            {name: 'list5'},
            {name: 'list6'},
            {name: 'list7'},
            {name: 'list8'},
            {name: 'list9'},
            {name: 'list10'}
        ]
    };
    var vu = new $Vu({
        template: temp,
        data: data
    });
    vu.appendIn(document.body);

})(window);