!(function (window, undefined) {

    'use strict';

    // 综合案例
    // 循环展示技能name，img，tips
    // li标签上data-key是每个技能的索引值，
    // 每个技能有自己独立的类名，
    // 当技能名为js时不显示tips
    // 1s后随机打乱数据重新渲染
    // 模板
    var temp = '' +
        '<ul>' +
        '    <li -for="item in list" class="pub_li" :class="item.className" :data-key="item.key">' +
        '        <img :src="item.img" class="pub_img" alt="">' +
        '        <span class="pub_name">{{item.name}}</span>' +
        '        <span -if="item.name != \'js\'" class="pub_tips">{{item.tips}}</span>' +
        '    </li>' +
        '</ul>';
    // 数据
    var data = {
        className: 'list',
        list: [
            {
                key: 0,
                name: 'js',
                tips: 'js Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/js.png',
                className: 'js_classname'
            }, {
                key: 1,
                name: 'java',
                tips: 'java Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/java.png',
                className: 'java_classname'
            }, {
                key: 2,
                name: 'react',
                tips: 'react Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/react.png',
                className: 'react_classname'
            }, {
                key: 3,
                name: 'redis',
                tips: 'redis Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/redis.png',
                className: 'redis_classname'
            }, {
                key: 4,
                name: 'vue',
                tips: 'vue Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/vue.png',
                className: 'vue_classname'
            }, {
                key: 5,
                name: 'android',
                tips: 'android Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/android.png',
                className: 'android_classname'
            }, {
                key: 6,
                name: 'nodejs',
                tips: 'nodejs Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/nodejs.png',
                className: 'jsnodejs_classname'
            }, {
                key: 0,
                name: 'js',
                tips: 'js Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/js.png',
                className: 'js_classname'
            }, {
                key: 1,
                name: 'java',
                tips: 'java Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/java.png',
                className: 'java_classname'
            }, {
                key: 2,
                name: 'react',
                tips: 'react Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/react.png',
                className: 'react_classname'
            }, {
                key: 4,
                name: 'vue',
                tips: 'vue Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/vue.png',
                className: 'vue_classname'
            }, {
                key: 5,
                name: 'android',
                tips: 'android Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/android.png',
                className: 'android_classname'
            }, {
                key: 6,
                name: 'nodejs',
                tips: 'nodejs Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/nodejs.png',
                className: 'jsnodejs_classname'
            }, {
                key: 0,
                name: 'js',
                tips: 'js Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/js.png',
                className: 'js_classname'
            }, {
                key: 1,
                name: 'java',
                tips: 'java Cell',
                img: 'http://img.ijianghe.cn/images/jiangshow/java.png',
                className: 'java_classname'
            }
        ]
    };
    var vu = new $Vu({
        template: temp,
        data: data
    });
    vu.appendIn(document.body);

    // 1s后随机打乱数据重新渲染
    setTimeout(function () {
        data.list.sort(function () {
            return (0.5 - Math.random());
        })
    }, 1000);

})(window);