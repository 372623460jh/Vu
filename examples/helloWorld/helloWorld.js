!(function (window, undefined) {

    'use strict';

    var vu = new $Vu({
        template: '<div class="parent">{{tips}}</div>',
        data: {tips: 'hello world'}
    });

    document.body.appendChild(vu.$el);

})(window);