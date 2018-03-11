!(function (window, undefined) {

    'use strict';

    var temp =
        '<div class="test">' +
        '    <!--测试-->' +
        '   <div class="parent" -for="item in arr" :class="item.className" :data-prop="item.className">' +
        '       {{item.tips}}' +
        '   </div>' +
        '</div>';

    var vu = new $Vu({
        template: temp,
        data: {
            arr: [
                {
                    className: 'name1',
                    tips: 'tips1'
                },
                {
                    className: 'name2',
                    tips: 'tips2'
                },
                {
                    className: 'name3',
                    tips: 'tips3'
                }
            ]
        }
    });

    document.body.appendChild(vu.$el);

    var vu = new Vue({
        el: '.test',
        data: {
            arr: [
                {
                    className: 'name1',
                    tips: 'tips1'
                },
                {
                    className: 'name2',
                    tips: 'tips2'
                },
                {
                    className: 'name3',
                    tips: 'tips3'
                }
            ]
        }
    });


})(window);