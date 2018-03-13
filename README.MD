# Vu.js

vu是参照vue思想开发出的一个轻量,高性能的mvvm框架,之所以叫vu寓意是残疾版的vue。

## 地址链接

- 源码所在位置：https://github.com/372623460jh/Vu/tree/master/dist

- dev链接：http://libs.ijianghe.cn/js/vu/vu.js

- pro链接：http://libs.ijianghe.cn/js/vu/vu.min.js

## 列举下vu拥有的特性:

- 单向的数据驱动视图，数据的改变驱动界面改变。

- 模板引擎。

- 虚拟dom局部更新

## vu用法

- **Mustache占位符`{{}}`**

    使用模板和数据创建vu实例,在Vu中标签的内容使用Mustache模板引擎中一样形式的{{}}占位符
    
    demo:https://github.com/372623460jh/Vu/tree/master/examples/helloWorld
    
    ```javascript
    var template = '<div>{{hello}}</div>';
    var data = {
        hello: '你好,世界!'
    };
    var vu = new $Vu({
        template: template,
        data: data
    });
    vu.appendIn(document.body);
    ```
    
- **条件指令`-if  -else-if  -else`**

    条件指令,指令中可以嵌入表达式
    
    demo:https://github.com/372623460jh/Vu/tree/master/examples/if
    
    ```javascript
    var template =
        '<div>' +
        '   <div -if="age > 18">{{name}}年龄大于18</div>' +
        '   <div -else-if="age == 18">{{name}}年龄等于18</div>' +
        '   <div -else>{{name}}年龄小于18</div>' +
        '</div>';
    var data = {
        name: 'Tom',
        age: 18
    };
    var vu = new $Vu({
        template: template,
        data: data
    });
    vu.appendIn(document.body);
    ```

- **循环指令`-for`**

    循环指令
    
    demo:https://github.com/372623460jh/Vu/tree/master/examples/for
    
    ```javascript
    var template = '' +
        '<ul>' +
        '   <li -for="item in list">{{item.name}}</li>' +
        '</ul>';
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
        template: template,
        data: data
    });
    vu.appendIn(document.body);
    ```
    
- **绑定属性指令`:`**

    绑定属性指令:`:attrName`用来给标签的属性绑定数据
    
    demo:https://github.com/372623460jh/Vu/tree/master/examples/bindAttrs
    
    ```javascript
    // 模板
    var template =
        '<div class="class1" :class="dynamicClass" :data-prop="customProp">' +
        '   <img :src="imgAdd" alt="">' +
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
        template: template,
        data: data
    });
    vu.appendIn(document.body);
    ```
    
- **综合使用案例**
    
    将所有指令混合使用的案例
    
    demo:https://github.com/372623460jh/Vu/tree/master/examples/synthesize
    
## vu实例属性，方法介绍
    
### 属性

- $el:该属性存放生成的element

- $options:该属性存放实例化Vu时的入参

- _data:该属性存放用于驱动页面的数据

    - \_\_ob\_\_:属性对应的数据拦截者对象
    
- _vnode:该属性存放执行render方法生成的虚拟dom(vnode)

- _watchers：model层观察者集合

- _watcher：当前实例对应model层观察者

- _staticTrees: 是不是静态树（不会因为数据改变而变化的节点）

### 方法

- appendIn:将vu生成的dom添加到指定元素中

- parseDom:将html字符串装换为dom对象

- resetVu:使用数据强制重置模板（非局部更新,页面会闪一下）

- setAllDate:整体设置数据，vu会帮你检测变化的数据来实现局部更新

