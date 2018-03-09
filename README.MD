# Vu.js

vu是参照vue思想开发出的一个轻量,高性能的mvvm框架,之所以叫vu寓意是残疾版的vue。列举下他拥有的功能

- 单向的数据驱动视图，数据的改变驱动界面改变。

- 模板引擎。

- 虚拟dom

- 局部更新

## vue2.5.13思想

以下所有代码都是根据源码思想的简化简写伪码。

- 1.将template解析为AST(Abstract Syntax Tree)

    ```javascript
    /**
     * 将template解析为ast
     * <div class="parent">{{tips}}</div>
     * 解析为ast(以对象的形式标识dom)后:
     * {
     *     attrsMap:{class:"parent"},//属性集合
     *     children:[{
     *          expression:"_s(tips)",//render方法表达式
     *          static:false,//是否是静态节点
     *          text:"{{tips}}",//文本内容
     *          type:2//2：占位符文本
     *     }],//子节点集合
     *     tag:'div',//标签名
     *     type:1,//节点类型 1：ele  2：占位符文本  3：纯文本
     *     staticClass:'parent',//静态类
     *     static:false,//是否是静态节点
     *     parent:null//父AST对象
     * }
     */
    var ast = parse(template.trim(),options);
    // 至于template解析为ast的流程,也就是parse的实现。是根据正则匹配出标签开始,匹配出标签结束,匹配出标签属性,匹配出标签文本。
    // 再通过先后触发的标签开始结束方法确定父子关系。这里主要记录思想,实现不过多赘述,详细可看parse的源码
    ```

- 2.将AST编译为render方法字串

    ```javascript
    /**
     * 将AST编译为render方法
     * {
     *     attrsMap:{class:"parent"},//属性集合
     *     children:[{
     *          expression:"_s(tips)",//render方法表达式
     *          static:false,//是否是静态节点
     *          text:"{{tips}}",//文本内容
     *          type:2//2：占位符文本
     *     }],//子节点集合
     *     tag:'div',//标签名
     *     type:1,//节点类型 1：ele  2：占位符文本  3：纯文本
     *     staticClass:'parent',//静态类
     *     static:false,//是否是静态节点
     *     parent:null//父AST对象
     * }
     * 编译为render方法字串后,！！！这里是字串不是方法
     * with (this) {
     *     return _c('div', {staticClass: "parent"}, [_v(_s(tips))])
     * }
     * 返回值code.render方法中就是这个字串,具体的_c,_v,_s等等方法之后介绍
     * 到此AST的使命就结束了，那么render方法的作用是啥呢？其实执行render方法得到的就是template对应的虚拟dom(vnode)
     */
    var code = generate(ast,options);
    ```

- 3.到此template就被解析成了render方法,小节一波
    ```javascript
    /**
     * 静态节点:永远不会因为数据改变而变化的节点
     * 1.vue被实例化
     * 2.将dom转为template字串 
     * 3.将template字串转为AST 
     * 4.将AST转为render方法(staticRenderFns是静态节点render方法的数组)
     * 5.将render方法挂载到Vue实例下的$options属性下的render上(同原理还有staticRenderFns)
     * 
     * 
     */
    function Vue(option){
        //...
        this.$mount();
        //...
    }
    Vue.prototype.$mount = function() {
        //...
       var compiled = Vue.compile(template);
       this.$options.render = compiled.render;
       this.$options.staticRenderFns = compiled.staticRenderFns;
        //...
    }
    Vue.compile = function (template) {
        var ast = parse(template.trim(),options);
        var code = generate(ast,options);
        var res = {};
        res.render = createFunction(code.render, fnGenErrors);
        res.staticRenderFns = code.staticRenderFns.map(function (code) {
           return createFunction(code, fnGenErrors)
        });
        return res;
    }
    ```

- 4.现在render方法已经绑定到实例中,接下来处理数据给数据添加拦截方法
    ```javascript
    /**
     * 添加数据拦截,先说Object.defineProperty
     */
  
    var data = {
        
    }
  
    function Vue(option){
        //...
        this.$mount();
        //...
    }
    Vue.prototype.$mount = function() {
        //...
       var compiled = Vue.compile(template);
       this.$options.render = compiled.render;
       this.$options.staticRenderFns = compiled.staticRenderFns;
        //...
    }
    Vue.compile = function (template) {
        var ast = parse(template.trim(),options);
        var code = generate(ast,options);
        var res = {};
        res.render = createFunction(code.render, fnGenErrors);
        res.staticRenderFns = code.staticRenderFns.map(function (code) {
           return createFunction(code, fnGenErrors)
        });
        return res;
    }
    ```


