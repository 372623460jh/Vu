;(function defineVu(global, factory) {
    var Vu = factory(global);
    if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
        global.$Vu = Vu;
        module.exports = Vu
    } else {
        global.$Vu = Vu
    }
})(window, function (global, undefined) {
    'use strict';
    var emptyObject = Object.freeze({});
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    var ncname = '[a-zA-Z_][\\w\\-\\.]*';
    var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
    var startTagOpen = new RegExp(("^<" + qnameCapture));
    var startTagClose = /^\s*(\/?)>/;
    var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
    var doctype = /^<!DOCTYPE [^>]+>/i;
    var comment = /^<!--/;
    var conditionalComment = /^<!\[/;
    var isNonPhrasingTag = makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' + 'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' + 'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' + 'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' + 'title,tr,track');
    var isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' + 'link,meta,param,source,track,wbr');
    var canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source');
    var isPlainTextElement = makeMap('script,style,textarea', true);
    var isIgnoreNewlineTag = makeMap('pre,textarea', true);
    var shouldIgnoreFirstNewline = function (tag, html) {
        return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'
    };
    var IS_REGEX_CAPTURING_BROKEN = false;
    'x'.replace(/x(.)?/g, function (m, g) {
        IS_REGEX_CAPTURING_BROKEN = g === ''
    });
    var isHTMLTag = makeMap('html,body,base,head,link,meta,style,title,' + 'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' + 'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' + 'embed,object,param,source,canvas,script,noscript,del,ins,' + 'caption,col,colgroup,table,thead,tbody,td,th,tr,' + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' + 'output,progress,select,textarea,' + 'details,dialog,menu,menuitem,summary,' + 'content,element,shadow,template,blockquote,iframe,tfoot');
    var isSVG = makeMap('svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' + 'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' + 'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view', true);
    var inBrowser = typeof window !== 'undefined';
    var UA = inBrowser && window.navigator.userAgent.toLowerCase();
    var isIE = UA && /msie|trident/.test(UA);
    var isEdge = UA && UA.indexOf('edge/') > 0;
    var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
    var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
    var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
    var reCache = {};
    var decoder;
    var he = {
        decode: function decode(html) {
            decoder = decoder || document.createElement('div');
            decoder.innerHTML = html;
            return decoder.textContent
        }
    };

    function noop(a, b, c) {
    }

    function isDef(v) {
        return v !== undefined && v !== null
    }

    function isTrue(v) {
        return v === true
    }

    var _toString = Object.prototype.toString;

    function isPlainObject(obj) {
        return _toString.call(obj) === '[object Object]'
    }

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function hasOwn(obj, key) {
        return hasOwnProperty.call(obj, key)
    }

    function isNative(Ctor) {
        return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
    }

    function def(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {value: val, enumerable: !!enumerable, writable: true, configurable: true})
    }

    var hasProto = '__proto__' in {};

    function cached(fn) {
        var cache = Object.create(null);
        var cachedFn = function (str) {
            var hit = cache[str];
            return hit || (cache[str] = fn(str))
        };
        return cachedFn
    }

    function baseWarn(msg) {
        console.error(("错误:" + msg))
    }

    function makeMap(str, exceptsLowerCase) {
        var map = Object.create(null);
        var list = str.split(',');
        for (var i = 0, l = list.length; i < l; i++) {
            map[list[i]] = true
        }
        return exceptsLowerCase ? function (val) {
            return map[val.toLowerCase()]
        } : function (val) {
            return map[val]
        }
    }

    function makeAttrsMap(attrs) {
        var map = {};
        for (var i = 0, l = attrs.length; i < l; i++) {
            if (map[attrs[i].name] && !isIE && !isEdge) {
                console.log('重复的属性：' + attrs[i].name)
            }
            map[attrs[i].name] = attrs[i].value
        }
        return map
    }

    var decodingMap = {'&lt;': '<', '&gt;': '>', '&quot;': '"', '&amp;': '&', '&#10;': '\n', '&#9;': '\t'};
    var encodedAttr = /&(?:lt|gt|quot|amp|#10|#9);/g;

    function decodeAttr(value) {
        return value.replace(encodedAttr, function (match) {
            return decodingMap[match]
        })
    }

    var ieNSBug = /^xmlns:NS\d+/;
    var ieNSPrefix = /^NS\d+:/;

    function guardIESVGBug(attrs) {
        var res = [];
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            if (!ieNSBug.test(attr.name)) {
                attr.name = attr.name.replace(ieNSPrefix, '');
                res.push(attr)
            }
        }
        return res
    }

    function createASTElement(tag, attrs, parent) {
        return {type: 1, tag: tag, attrsList: attrs, attrsMap: makeAttrsMap(attrs), parent: parent, children: []}
    }

    function isForbiddenTag(el) {
        return (el.tag === 'style' || (el.tag === 'script' && (!el.attrsMap.type || el.attrsMap.type === 'text/javascript')))
    }

    var platformGetTagNamespace = function getTagNamespace(tag) {
        if (isSVG(tag)) {
            return 'svg'
        }
        if (tag === 'math') {
            return 'math'
        }
    };

    function getAndRemoveAttr(el, name, removeFromMap) {
        var val;
        if ((val = el.attrsMap[name]) != null) {
            var list = el.attrsList;
            for (var i = 0, l = list.length; i < l; i++) {
                if (list[i].name === name) {
                    list.splice(i, 1);
                    break
                }
            }
        }
        if (removeFromMap) {
            delete el.attrsMap[name]
        }
        return val
    }

    function extend(to, _from) {
        for (var key in _from) {
            to[key] = _from[key]
        }
        return to
    }

    var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
    var stripParensRE = /^\(|\)$/g;
    var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;

    function processFor(el) {
        var exp;
        if ((exp = getAndRemoveAttr(el, '-for'))) {
            var res = parseFor(exp);
            if (res) {
                extend(el, res)
            } else {
                baseWarn("无效的-for指令" + exp)
            }
        }
    }

    function parseFor(exp) {
        var inMatch = exp.match(forAliasRE);
        if (!inMatch) {
            return
        }
        var res = {};
        res.for = inMatch[2].trim();
        var alias = inMatch[1].trim().replace(stripParensRE, '');
        var iteratorMatch = alias.match(forIteratorRE);
        if (iteratorMatch) {
            res.alias = alias.replace(forIteratorRE, '');
            res.iterator1 = iteratorMatch[1].trim();
            if (iteratorMatch[2]) {
                res.iterator2 = iteratorMatch[2].trim()
            }
        } else {
            res.alias = alias
        }
        return res
    }

    function processIf(el) {
        var exp = getAndRemoveAttr(el, '-if');
        if (exp) {
            el.if = exp;
            addIfCondition(el, {exp: exp, block: el})
        } else {
            if (getAndRemoveAttr(el, '-else') != null) {
                el.else = true
            }
            var elseif = getAndRemoveAttr(el, '-else-if');
            if (elseif) {
                el.elseif = elseif
            }
        }
    }

    function addIfCondition(el, condition) {
        if (!el.ifConditions) {
            el.ifConditions = []
        }
        el.ifConditions.push(condition)
    }

    function processIfConditions(el, parent) {
        var prev = findPrevElement(parent.children);
        if (prev && prev.if) {
            addIfCondition(prev, {exp: el.elseif, block: el})
        } else {
            baseWarn("v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + "之前<" + (el.tag) + ">元素上没有 -if 指令")
        }
    }

    function findPrevElement(children) {
        var i = children.length;
        while (i--) {
            if (children[i].type === 1) {
                return children[i]
            } else {
                if (children[i].text !== ' ') {
                    baseWarn("文本 \"" + (children[i].text.trim()) + "\" 出现在 -if 和 -else(-if)之间。")
                }
                children.pop()
            }
        }
    }

    function getBindingAttr(el, name, getStatic) {
        var dynamicValue = getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name);
        if (dynamicValue != null) {
            return parseFilters(dynamicValue)
        } else if (getStatic !== false) {
            var staticValue = getAndRemoveAttr(el, name);
            if (staticValue != null) {
                return JSON.stringify(staticValue)
            }
        }
    }

    var validDivisionCharRE = /[\w).+\-_$\]]/;

    function parseFilters(exp) {
        var inSingle = false;
        var inDouble = false;
        var inTemplateString = false;
        var inRegex = false;
        var curly = 0;
        var square = 0;
        var paren = 0;
        var lastFilterIndex = 0;
        var c, prev, i, expression, filters;
        for (i = 0; i < exp.length; i++) {
            prev = c;
            c = exp.charCodeAt(i);
            if (inSingle) {
                if (c === 0x27 && prev !== 0x5C) {
                    inSingle = false
                }
            } else if (inDouble) {
                if (c === 0x22 && prev !== 0x5C) {
                    inDouble = false
                }
            } else if (inTemplateString) {
                if (c === 0x60 && prev !== 0x5C) {
                    inTemplateString = false
                }
            } else if (inRegex) {
                if (c === 0x2f && prev !== 0x5C) {
                    inRegex = false
                }
            } else if (c === 0x7C && exp.charCodeAt(i + 1) !== 0x7C && exp.charCodeAt(i - 1) !== 0x7C && !curly && !square && !paren) {
                if (expression === undefined) {
                    lastFilterIndex = i + 1;
                    expression = exp.slice(0, i).trim()
                } else {
                    pushFilter()
                }
            } else {
                switch (c) {
                    case 0x22:
                        inDouble = true;
                        break
                    case 0x27:
                        inSingle = true;
                        break
                    case 0x60:
                        inTemplateString = true;
                        break
                    case 0x28:
                        paren++;
                        break
                    case 0x29:
                        paren--;
                        break
                    case 0x5B:
                        square++;
                        break
                    case 0x5D:
                        square--;
                        break
                    case 0x7B:
                        curly++;
                        break
                    case 0x7D:
                        curly--;
                        break
                }
                if (c === 0x2f) {
                    var j = i - 1;
                    var p = (void 0);
                    for (; j >= 0; j--) {
                        p = exp.charAt(j);
                        if (p !== ' ') {
                            break
                        }
                    }
                    if (!p || !validDivisionCharRE.test(p)) {
                        inRegex = true
                    }
                }
            }
        }
        if (expression === undefined) {
            expression = exp.slice(0, i).trim()
        } else if (lastFilterIndex !== 0) {
            pushFilter()
        }
        function pushFilter() {
            (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
            lastFilterIndex = i + 1
        }

        if (filters) {
            for (i = 0; i < filters.length; i++) {
                expression = wrapFilter(expression, filters[i])
            }
        }
        return expression
    }

    function wrapFilter(exp, filter) {
        var i = filter.indexOf('(');
        if (i < 0) {
            return ("_f(\"" + filter + "\")(" + exp + ")")
        } else {
            var name = filter.slice(0, i);
            var args = filter.slice(i + 1);
            return ("_f(\"" + name + "\")(" + exp + "," + args)
        }
    }

    var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
    var decodeHTMLCached = cached(he.decode);

    function parseText(text) {
        var tagRE = defaultTagRE;
        if (!tagRE.test(text)) {
            return
        }
        var tokens = [];
        var rawTokens = [];
        var lastIndex = tagRE.lastIndex = 0;
        var match, index, tokenValue;
        while ((match = tagRE.exec(text))) {
            index = match.index;
            if (index > lastIndex) {
                rawTokens.push(tokenValue = text.slice(lastIndex, index));
                tokens.push(JSON.stringify(tokenValue))
            }
            var exp = parseFilters(match[1].trim());
            tokens.push(("_s(" + exp + ")"));
            rawTokens.push({'@binding': exp});
            lastIndex = index + match[0].length
        }
        if (lastIndex < text.length) {
            rawTokens.push(tokenValue = text.slice(lastIndex));
            tokens.push(JSON.stringify(tokenValue))
        }
        return {expression: tokens.join('+'), tokens: rawTokens}
    }

    var transforms = [transformNode, transformNode$1];
    var staticKeys = "staticClass,staticStyle";
    var dataGenFns = [genData, genData$1];

    function genData$1(el) {
        var data = '';
        if (el.staticStyle) {
            data += "staticStyle:" + (el.staticStyle) + ","
        }
        if (el.styleBinding) {
            data += "style:(" + (el.styleBinding) + "),"
        }
        return data
    }

    function genData(el) {
        var data = '';
        if (el.staticClass) {
            data += "staticClass:" + (el.staticClass) + ","
        }
        if (el.classBinding) {
            data += "class:" + (el.classBinding) + ","
        }
        return data
    }

    function transformNode(el) {
        var staticClass = getAndRemoveAttr(el, 'class');
        if (staticClass) {
            var res = parseText(staticClass);
            if (res) {
                baseWarn("class=\"" + staticClass + "\":请使用v-bind:或:来代替。例如：<div class=\"{{ val }}\">, 使用<div :class=\"val\">")
            }
        }
        if (staticClass) {
            el.staticClass = JSON.stringify(staticClass)
        }
        var classBinding = getBindingAttr(el, 'class', false);
        if (classBinding) {
            el.classBinding = classBinding
        }
    }

    function transformNode$1(el) {
        var staticStyle = getAndRemoveAttr(el, 'style');
        if (staticStyle) {
            var res = parseText(staticStyle);
            if (res) {
                baseWarn("style=\"" + staticStyle + "\":请使用v-bind:或:来代替。例如：<div style=\"{{ val }}\">, 使用<div :style=\"val\">")
            }
            el.staticStyle = JSON.stringify(parseStyleText(staticStyle))
        }
        var styleBinding = getBindingAttr(el, 'style', false);
        if (styleBinding) {
            el.styleBinding = styleBinding
        }
    }

    function processKey(el) {
        var exp = getBindingAttr(el, 'key');
        if (exp) {
            if (el.tag === 'template') {
                baseWarn('<template>不能够添加keye')
            }
            el.key = exp
        }
    }

    function addAttr(el, name, value) {
        (el.attrs || (el.attrs = [])).push({name: name, value: value});
        el.plain = false
    }

    var dirRE = /^v-|^@|^:/;
    var bindRE = /^:|^v-bind:/;

    function processAttrs(el) {
        var list = el.attrsList;
        var i, l, name, rawName, value, modifiers, isProp;
        for (i = 0, l = list.length; i < l; i++) {
            name = rawName = list[i].name;
            value = list[i].value;
            if (dirRE.test(name)) {
                el.hasBindings = true;
                if (bindRE.test(name)) {
                    name = name.replace(bindRE, '');
                    value = parseFilters(value);
                    addAttr(el, name, value)
                }
            } else {
                addAttr(el, name, JSON.stringify(value))
            }
        }
    }

    function processElement(element) {
        processKey(element);
        for (var i = 0; i < transforms.length; i++) {
            element = transforms[i](element) || element
        }
        processAttrs(element)
    }

    function isTextTag(el) {
        return el.tag === 'script' || el.tag === 'style'
    }

    function praseHtml(html, options) {
        var stack = [];
        var expectHTML = options.expectHTML;
        var isUnaryTag$$1 = options.isUnaryTag || false;
        var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || false;
        var last;
        var index = 0;
        var lastTag;
        while (html) {
            last = html;
            if (!lastTag || !isPlainTextElement(lastTag)) {
                var textEnd = html.indexOf('<');
                if (textEnd === 0) {
                    if (comment.test(html)) {
                        var commentEnd = html.indexOf('-->');
                        if (commentEnd >= 0 && options.comment) {
                        }
                        advance(commentEnd + 3);
                        continue
                    }
                    if (conditionalComment.test(html)) {
                        var conditionalEnd = html.indexOf(']>');
                        if (conditionalEnd >= 0) {
                            advance(conditionalEnd + 2);
                            continue
                        }
                    }
                    var doctypeMatch = html.match(doctype);
                    if (doctypeMatch) {
                        advance(doctypeMatch[0].length);
                        continue
                    }
                    var endTagMatch = html.match(endTag);
                    if (endTagMatch) {
                        var startIndex = index;
                        advance(endTagMatch[0].length);
                        parseEndTag(endTagMatch[1], startIndex, index);
                        continue
                    }
                    var startTagMatch = parseStartTag();
                    if (startTagMatch) {
                        handleStartTag(startTagMatch);
                        if (shouldIgnoreFirstNewline(lastTag, html)) {
                            advance(1)
                        }
                        continue
                    }
                }
                var text, rest, next;
                if (textEnd >= 0) {
                    rest = html.slice(textEnd);
                    while (!endTag.test(rest) && !startTagOpen.test(rest) && !comment.test(rest) && !conditionalComment.test(rest)) {
                        next = rest.indexOf('<', 1);
                        if (next < 0) {
                            break
                        }
                        textEnd += next;
                        rest = html.slice(textEnd)
                    }
                    text = html.substring(0, textEnd);
                    advance(textEnd)
                }
                if (textEnd < 0) {
                    text = html;
                    html = ''
                }
                if (options.chars && text) {
                    options.chars(text)
                }
            } else {
                var endTagLength = 0;
                var stackedTag = lastTag.toLowerCase();
                var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
                var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
                    endTagLength = endTag.length;
                    if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
                        text = text.replace(/<!--([\s\S]*?)-->/g, '$1').replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
                    }
                    if (shouldIgnoreFirstNewline(stackedTag, text)) {
                        text = text.slice(1)
                    }
                    if (options.chars) {
                        options.chars(text)
                    }
                    return ''
                });
                index += html.length - rest$1.length;
                html = rest$1;
                parseEndTag(stackedTag, index - endTagLength, index)
            }
            if (html === last) {
                options.chars && options.chars(html);
                if (!stack.length && options.warn) {
                    baseWarn('格式化标签模板错误,匹配前后文本未变会造成死循环:' + html)
                }
                break
            }
        }
        parseEndTag();
        function advance(n) {
            index += n;
            html = html.substring(n)
        }

        function parseStartTag() {
            var start = html.match(startTagOpen);
            if (start) {
                var match = {tagName: start[1], attrs: [], start: index};
                advance(start[0].length);
                var end, attr;
                while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                    advance(attr[0].length);
                    match.attrs.push(attr)
                }
                if (end) {
                    match.unarySlash = end[1];
                    advance(end[0].length);
                    match.end = index;
                    return match
                }
            }
        }

        function handleStartTag(match) {
            var tagName = match.tagName;
            var unarySlash = match.unarySlash;
            if (expectHTML) {
                if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                    parseEndTag(lastTag)
                }
                if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
                    parseEndTag(tagName)
                }
            }
            var unary = isUnaryTag$$1(tagName) || !!unarySlash;
            var l = match.attrs.length;
            var attrs = new Array(l);
            for (var i = 0; i < l; i++) {
                var args = match.attrs[i];
                if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
                    if (args[3] === '') {
                        delete args[3]
                    }
                    if (args[4] === '') {
                        delete args[4]
                    }
                    if (args[5] === '') {
                        delete args[5]
                    }
                }
                var value = args[3] || args[4] || args[5] || '';
                attrs[i] = {name: args[1], value: decodeAttr(value)}
            }
            if (!unary) {
                stack.push({tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs});
                lastTag = tagName
            }
            if (options.start) {
                options.start(tagName, attrs, unary, match.start, match.end)
            }
        }

        function parseEndTag(tagName, start, end) {
            var pos;
            var lowerCaseTagName;
            if (start == null) {
                start = index
            }
            if (end == null) {
                end = index
            }
            if (tagName) {
                lowerCaseTagName = tagName.toLowerCase();
                for (pos = stack.length - 1; pos >= 0; pos--) {
                    if (stack[pos].lowerCasedTag === lowerCaseTagName) {
                        break
                    }
                }
            } else {
                pos = 0
            }
            if (pos >= 0) {
                for (var i = stack.length - 1; i >= pos; i--) {
                    if (i > pos || !tagName) {
                        baseWarn("标签 <" + (stack[i].tag) + "> 没有结束标签。")
                    }
                    if (options.end) {
                        options.end(stack[i].tag, start, end)
                    }
                }
                stack.length = pos;
                lastTag = pos && stack[pos - 1].tag
            } else if (lowerCaseTagName === 'br') {
                if (options.start) {
                    options.start(tagName, [], true, start, end)
                }
            } else if (lowerCaseTagName === 'p') {
                if (options.start) {
                    options.start(tagName, [], false, start, end)
                }
                if (options.end) {
                    options.end(tagName, start, end)
                }
            }
        }
    }

    function parse(template) {
        var stack = [];
        var preserveWhitespace = true;
        var root;
        var currentParent;
        var options = {
            expectHTML: true,
            isUnaryTag: isUnaryTag,
            canBeLeftOpenTag: canBeLeftOpenTag,
            start: function start(tag, attrs, unary, start, end) {
                var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);
                if (isIE && ns === 'svg') {
                    attrs = guardIESVGBug(attrs)
                }
                var element = createASTElement(tag, attrs, currentParent);
                if (ns) {
                    element.ns = ns
                }
                if (isForbiddenTag(element)) {
                    element.forbidden = true;
                    baseWarn('模板仅负责用来映射UI相关，请不要在模板中加入副作用的标签。如:<' + tag + '>,将不会被模板引擎解析')
                }
                if (!element.processed) {
                    processFor(element);
                    processIf(element);
                    processElement(element)
                }
                function checkRootConstraints(el) {
                    if (el.tag === 'slot' || el.tag === 'template') {
                        baseWarn('不能使用<' + (el.tag) + '>做为根节点因为它可能包含多个节点')
                    }
                    if (el.attrsMap.hasOwnProperty('-for')) {
                        baseWarn('不能使用含有-for指令的节点做为根节点因为它会呈现多个元素')
                    }
                }

                if (!root) {
                    root = element;
                    checkRootConstraints(root)
                } else if (!stack.length) {
                    if (root.if && (element.elseif || element.else)) {
                        checkRootConstraints(element);
                        addIfCondition(root, {exp: element.elseif, block: element})
                    } else {
                        baseWarn('根节点中使用了-if指令但在和根节点同级的元素中未发现elseif或else指令')
                    }
                }
                if (currentParent && !element.forbidden) {
                    if (element.elseif || element.else) {
                        processIfConditions(element, currentParent)
                    } else {
                        currentParent.children.push(element);
                        element.parent = currentParent
                    }
                }
                if (!unary) {
                    currentParent = element;
                    stack.push(element)
                }
            },
            end: function end() {
                var element = stack[stack.length - 1];
                var lastNode = element.children[element.children.length - 1];
                if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
                    element.children.pop()
                }
                stack.length -= 1;
                currentParent = stack[stack.length - 1]
            },
            chars: function chars(text) {
                if (!currentParent) {
                    if (text === template) {
                        baseWarn("传入模板只是一个文本而不是一个根元素")
                    } else if ((text = text.trim())) {
                        baseWarn("text \"" + text + "\" 外部根元素将被忽略。")
                    }
                    return
                }
                if (isIE && currentParent.tag === 'textarea' && currentParent.attrsMap.placeholder === text) {
                    return
                }
                var children = currentParent.children;
                text = text.trim() ? (isTextTag(currentParent) ? text : decodeHTMLCached(text)) : ((preserveWhitespace && children.length) ? ' ' : '');
                if (text) {
                    var res;
                    if (text !== ' ' && (res = parseText(text))) {
                        children.push({type: 2, expression: res.expression, tokens: res.tokens, text: text})
                    } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
                        children.push({type: 3, text: text})
                    }
                }
            },
            comment: function comment(text) {
                currentParent.children.push({type: 3, text: text, isComment: true})
            }
        };
        praseHtml(template, options);
        if (root) {
            markStatic$1(root);
            markStaticRoots(root, false)
        }
        return root
    }

    var genStaticKeysCached = cached(function genStaticKeys$1(keys) {
        return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,attrs' + (keys ? ',' + keys : ''))
    });
    var isReservedTag = function (tag) {
        return isHTMLTag(tag) || isSVG(tag)
    };

    function getTagNamespace(tag) {
        if (isSVG(tag)) {
            return 'svg'
        }
        if (tag === 'math') {
            return 'math'
        }
    }

    var isStaticKey = genStaticKeysCached(staticKeys || '');
    var isBuiltInTag = makeMap('slot,component', true);

    function isStatic(node) {
        if (node.type === 2) {
            return false
        }
        if (node.type === 3) {
            return true
        }
        return !!(!node.hasBindings && !node.if && !node.for && !isBuiltInTag(node.tag) && isReservedTag(node.tag) && Object.keys(node).every(isStaticKey))
    }

    function markStatic$1(node) {
        node.static = isStatic(node);
        if (node.type === 1) {
            if (!isReservedTag(node.tag)) {
                return
            }
            for (var i = 0, l = node.children.length; i < l; i++) {
                var child = node.children[i];
                markStatic$1(child);
                if (!child.static) {
                    node.static = false
                }
            }
            if (node.ifConditions) {
                for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
                    var block = node.ifConditions[i$1].block;
                    markStatic$1(block);
                    if (!block.static) {
                        node.static = false
                    }
                }
            }
        }
    }

    function markStaticRoots(node, isInFor) {
        if (node.type === 1) {
            if (node.static) {
                node.staticInFor = isInFor
            }
            if (node.static && node.children.length && !(node.children.length === 1 && node.children[0].type === 3)) {
                node.staticRoot = true;
                return
            } else {
                node.staticRoot = false
            }
            if (node.children) {
                for (var i = 0, l = node.children.length; i < l; i++) {
                    markStaticRoots(node.children[i], isInFor || !!node.for)
                }
            }
            if (node.ifConditions) {
                for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
                    markStaticRoots(node.ifConditions[i$1].block, isInFor)
                }
            }
        }
    }

    function CodegenState(options) {
        this.options = options;
        this.warn = baseWarn;
        this.dataGenFns = dataGenFns;
        this.directives = {};
        var isReserved = isReservedTag;
        this.maybeComponent = function (el) {
            return !isReserved(el.tag)
        };
        this.onceId = 0;
        this.staticRenderFns = []
    };
    function genStatic(el, state) {
        el.staticProcessed = true;
        state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
        return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
    }

    function genFor(el, state, altGen, altHelper) {
        var exp = el.for;
        var alias = el.alias;
        var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
        var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';
        if (state.maybeComponent(el)) {
            state.warn("<" + (el.tag) + " -for=\"" + alias + " in " + exp + "\">非预留标签中使用for。", true)
        }
        el.forProcessed = true;
        return (altHelper || '_l') + "((" + exp + ")," + "function(" + alias + iterator1 + iterator2 + "){" + "return " + ((altGen || genElement)(el, state)) + '})'
    }

    function genIf(el, state, altGen, altEmpty) {
        el.ifProcessed = true;
        return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
    }

    function genIfConditions(conditions, state, altGen, altEmpty) {
        if (!conditions.length) {
            return altEmpty || '_e()'
        }
        var condition = conditions.shift();
        if (condition.exp) {
            return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
        } else {
            return ("" + (genTernaryExp(condition.block)))
        }
        function genTernaryExp(el) {
            return altGen ? altGen(el, state) : (el.once ? genOnce(el, state) : genElement(el, state))
        }
    }

    function genProps(props) {
        var res = '';
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            res += "\"" + (prop.name) + "\":" + (transformSpecialNewlines(prop.value)) + ","
        }
        return res.slice(0, -1)
    }

    function genData$2(el, state) {
        var data = '{';
        if (el.key) {
            data += "key:" + (el.key) + ","
        }
        for (var i = 0; i < state.dataGenFns.length; i++) {
            data += state.dataGenFns[i](el)
        }
        if (el.attrs) {
            data += "attrs:{" + (genProps(el.attrs)) + "},"
        }
        data = data.replace(/,$/, '') + '}';
        return data
    }

    function genChildren(el, state, checkSkip, altGenElement, altGenNode) {
        var children = el.children;
        if (children.length) {
            var el$1 = children[0];
            if (children.length === 1 && el$1.for) {
                return (altGenElement || genElement)(el$1, state)
            }
            var normalizationType = checkSkip ? getNormalizationType(children) : 0;
            var gen = altGenNode || genNode;
            return ("[" + (children.map(function (c) {
                return gen(c, state)
            }).join(',')) + "]" + (normalizationType ? ("," + normalizationType) : ''))
        }
    }

    function getNormalizationType(children) {
        var res = 0;
        for (var i = 0; i < children.length; i++) {
            var el = children[i];
            if (el.type !== 1) {
                continue
            }
            if (el.for || (el.ifConditions && el.ifConditions.some(function (c) {
                    return c.block.for !== undefined
                }))) {
                res = 2;
                break
            }
        }
        return res
    }

    function genNode(node, state) {
        if (node.type === 1) {
            return genElement(node, state)
        } else {
            return genText(node)
        }
    }

    function transformSpecialNewlines(text) {
        return text.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
    }

    function genText(text) {
        return ("_v(" + (text.type === 2 ? text.expression : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
    }

    function genElement(el, state) {
        if (el.staticRoot && !el.staticProcessed) {
            return genStatic(el, state)
        } else if (el.for && !el.forProcessed) {
            return genFor(el, state)
        } else if (el.if && !el.ifProcessed) {
            return genIf(el, state)
        } else {
            var code;
            var data = genData$2(el, state);
            var children = genChildren(el, state, true);
            code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
            return code
        }
    };
    function generate(ast, options) {
        var state = new CodegenState(options);
        var code = ast ? genElement(ast, state) : '_c("div")';
        return {render: ("with(this){return " + code + "}"), staticRenderFns: state.staticRenderFns}
    }

    function baseCompile(template, options) {
        var ast = parse(template.trim());
        var code = generate(ast, options);
        return {ast: ast, render: code.render, staticRenderFns: code.staticRenderFns}
    };
    function createFunction(code, errors) {
        try {
            return new Function(code)
        } catch (err) {
            errors.push({err: err, code: code});
            return noop
        }
    }

    function createCompiler() {
        function compile(template, options) {
            var compiled = baseCompile(template, options);
            return compiled
        }

        function createCompileToFunctionFn(compile) {
            var cache = Object.create(null);
            return function compileToFunctions(template, options) {
                options = extend({}, options);
                try {
                    new Function('return 1')
                } catch (e) {
                    if (e.toString().match(/unsafe-eval|CSP/)) {
                        baseWarn('无法在该环境下工作,通过new Function()的方式来用字符串创建代码失败。')
                    }
                }
                if (cache[template]) {
                    return cache[template]
                }
                var compiled = compile(template, options);
                var res = {};
                var fnGenErrors = [];
                res.render = createFunction(compiled.render, fnGenErrors);
                res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
                    return createFunction(code, fnGenErrors)
                });
                res.ast = compiled.ast;
                return (cache[template] = res)
            }
        }

        return {compile: compile, compileToFunctions: createCompileToFunctionFn(compile)}
    }

    var VNode = function VNode(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.ns = undefined;
        this.context = context;
        this.fnContext = undefined;
        this.fnOptions = undefined;
        this.fnScopeId = undefined;
        this.key = data && data.key;
        this.componentOptions = componentOptions;
        this.componentInstance = undefined;
        this.parent = undefined;
        this.raw = false;
        this.isStatic = false;
        this.isRootInsert = true;
        this.isComment = false;
        this.isCloned = false;
        this.asyncFactory = asyncFactory;
        this.asyncMeta = undefined
    };

    function isObject(obj) {
        return obj !== null && typeof obj === 'object'
    }

    function installRenderHelpers(target) {
        target._n = toNumber;
        target._s = toString;
        target._l = renderList;
        target._q = looseEqual;
        target._i = looseIndexOf;
        target._m = renderStatic;
        target._v = createTextVNode;
        target._e = createEmptyVNode
    }

    function toNumber(val) {
        var n = parseFloat(val);
        return isNaN(n) ? val : n
    }

    function toString(val) {
        return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
    }

    function renderList(val, render) {
        var ret, i, l, keys, key;
        if (Array.isArray(val) || typeof val === 'string') {
            ret = new Array(val.length);
            for (i = 0, l = val.length; i < l; i++) {
                ret[i] = render(val[i], i)
            }
        } else if (typeof val === 'number') {
            ret = new Array(val);
            for (i = 0; i < val; i++) {
                ret[i] = render(i + 1, i)
            }
        } else if (isObject(val)) {
            keys = Object.keys(val);
            ret = new Array(keys.length);
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                ret[i] = render(val[key], key, i)
            }
        }
        if (isDef(ret)) {
            (ret)._isVList = true
        }
        return ret
    }

    function looseEqual(a, b) {
        if (a === b) {
            return true
        }
        var isObjectA = isObject(a);
        var isObjectB = isObject(b);
        if (isObjectA && isObjectB) {
            try {
                var isArrayA = Array.isArray(a);
                var isArrayB = Array.isArray(b);
                if (isArrayA && isArrayB) {
                    return a.length === b.length && a.every(function (e, i) {
                            return looseEqual(e, b[i])
                        })
                } else if (!isArrayA && !isArrayB) {
                    var keysA = Object.keys(a);
                    var keysB = Object.keys(b);
                    return keysA.length === keysB.length && keysA.every(function (key) {
                            return looseEqual(a[key], b[key])
                        })
                } else {
                    return false
                }
            } catch (e) {
                return false
            }
        } else if (!isObjectA && !isObjectB) {
            return String(a) === String(b)
        } else {
            return false
        }
    }

    function looseIndexOf(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (looseEqual(arr[i], val)) {
                return i
            }
        }
        return -1
    }

    function renderStatic(index, isInFor) {
        var cached = this._staticTrees || (this._staticTrees = []);
        var tree = cached[index];
        if (tree && !isInFor) {
            return Array.isArray(tree) ? cloneVNodes(tree) : cloneVNode(tree)
        }
        tree = cached[index] = this.$options.staticRenderFns[index].call(this, null, this);
        markStatic(tree, ("__static__" + index), false);
        return tree
    }

    function createTextVNode(val) {
        return new VNode(undefined, undefined, undefined, String(val))
    }

    var createEmptyVNode = function (text) {
        if (text === void 0) text = '';
        var node = new VNode();
        node.text = text;
        node.isComment = true;
        return node
    };

    function cloneVNodes(vnodes, deep) {
        var len = vnodes.length;
        var res = new Array(len);
        for (var i = 0; i < len; i++) {
            res[i] = cloneVNode(vnodes[i], deep)
        }
        return res
    }

    function cloneVNode(vnode, deep) {
        var componentOptions = vnode.componentOptions;
        var cloned = new VNode(vnode.tag, vnode.data, vnode.children, vnode.text, vnode.elm, vnode.context, componentOptions, vnode.asyncFactory);
        cloned.ns = vnode.ns;
        cloned.isStatic = vnode.isStatic;
        cloned.key = vnode.key;
        cloned.isComment = vnode.isComment;
        cloned.fnContext = vnode.fnContext;
        cloned.fnOptions = vnode.fnOptions;
        cloned.fnScopeId = vnode.fnScopeId;
        cloned.isCloned = true;
        if (deep) {
            if (vnode.children) {
                cloned.children = cloneVNodes(vnode.children, true)
            }
            if (componentOptions && componentOptions.children) {
                componentOptions.children = cloneVNodes(componentOptions.children, true)
            }
        }
        return cloned
    };
    function markStatic(tree, key, isOnce) {
        if (Array.isArray(tree)) {
            for (var i = 0; i < tree.length; i++) {
                if (tree[i] && typeof tree[i] !== 'string') {
                    markStaticNode(tree[i], (key + "_" + i), isOnce)
                }
            }
        } else {
            markStaticNode(tree, key, isOnce)
        }
    }

    function markStaticNode(node, key, isOnce) {
        node.isStatic = true;
        node.key = key;
        node.isOnce = isOnce
    }

    function callHook(vm, hook) {
        var handlers = vm.$options[hook];
        if (handlers) {
            for (var i = 0, j = handlers.length; i < j; i++) {
                try {
                    handlers[i].call(vm)
                } catch (e) {
                    baseWarn('hook方法调用' + hook + '生命周期方法出错：' + e)
                }
            }
        }
    }

    function isPrimitive(value) {
        return (typeof value === 'string' || typeof value === 'number' || typeof value === 'symbol' || typeof value === 'boolean')
    }

    var uid$2 = 0;
    var SIMPLE_NORMALIZE = 1;
    var ALWAYS_NORMALIZE = 2;

    function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
        if (Array.isArray(data) || isPrimitive(data)) {
            normalizationType = children;
            children = data;
            data = undefined
        }
        if (alwaysNormalize === true) {
            normalizationType = ALWAYS_NORMALIZE
        }
        return _createElement(context, tag, data, children, normalizationType)
    }

    function _createElement(context, tag, data, children, normalizationType) {
        if (isDef(data) && isDef((data).__ob__)) {
            baseWarn('避免使用被监听的数据作为vnode的数据' + JSON.stringify(data));
            return createEmptyVNode()
        }
        if (!tag) {
            return createEmptyVNode()
        }
        if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
            baseWarn('请使用基础数据类型作为key值' + data.key)
        }
        if (Array.isArray(children) && typeof children[0] === 'function') {
            data = data || {};
            data.scopedSlots = {default: children[0]};
            children.length = 0
        }
        if (normalizationType === ALWAYS_NORMALIZE) {
            children = normalizeChildren(children)
        } else if (normalizationType === SIMPLE_NORMALIZE) {
            children = simpleNormalizeChildren(children)
        }
        var vnode;
        if (typeof tag === 'string') {
            if (context.config.isReservedTag(tag)) {
                vnode = new VNode(tag, data, children, undefined, undefined, context)
            } else {
                baseWarn('创建vnode时发现不是标签的元素');
                return createEmptyVNode()
            }
        } else {
            baseWarn('创建vnode时发现不是标签的元素');
            return createEmptyVNode()
        }
        if (isDef(vnode)) {
            return vnode
        } else {
            return createEmptyVNode()
        }
    }

    function normalizeChildren(children) {
        return isPrimitive(children) ? [createTextVNode(children)] : Array.isArray(children) ? normalizeArrayChildren(children) : undefinedl
    }

    function simpleNormalizeChildren(children) {
        for (var i = 0; i < children.length; i++) {
            if (Array.isArray(children[i])) {
                return Array.prototype.concat.apply([], children)
            }
        }
        return children
    }

    function normalizeArrayChildren(children, nestedIndex) {
        var res = [];
        var i, c, lastIndex, last;
        for (i = 0; i < children.length; i++) {
            c = children[i];
            if (!isDef(c) || typeof c === 'boolean') {
                continue
            }
            lastIndex = res.length - 1;
            last = res[lastIndex];
            if (Array.isArray(c)) {
                if (c.length > 0) {
                    c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
                    if (isTextNode(c[0]) && isTextNode(last)) {
                        res[lastIndex] = createTextVNode(last.text + (c[0]).text);
                        c.shift()
                    }
                    res.push.apply(res, c)
                }
            } else if (isPrimitive(c)) {
                if (isTextNode(last)) {
                    res[lastIndex] = createTextVNode(last.text + c)
                } else if (c !== '') {
                    res.push(createTextVNode(c))
                }
            } else {
                if (isTextNode(c) && isTextNode(last)) {
                    res[lastIndex] = createTextVNode(last.text + c.text)
                } else {
                    if (isTrue(children._isVList) && isDef(c.tag) && !isDef(c.key) && isDef(nestedIndex)) {
                        c.key = "__vlist" + nestedIndex + "_" + i + "__"
                    }
                    res.push(c)
                }
            }
        }
        return res
    }

    function isTextNode(node) {
        return isDef(node) && isDef(node.text) && !isTrue(node.isComment)
    }

    var uid = 0;

    function remove(arr, item) {
        if (arr.length) {
            var index = arr.indexOf(item);
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    var Dep = function Dep() {
        this.id = uid++;
        this.subs = []
    };
    Dep.prototype.addSub = function addSub(sub) {
        this.subs.push(sub)
    };
    Dep.prototype.removeSub = function removeSub(sub) {
        remove(this.subs, sub)
    };
    Dep.prototype.depend = function depend() {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    };
    Dep.prototype.notify = function notify() {
        var subs = this.subs.slice();
        for (var i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    };
    Dep.target = null;
    var targetStack = [];

    function pushTarget(_target) {
        if (Dep.target) {
            targetStack.push(Dep.target)
        }
        Dep.target = _target
    }

    function popTarget() {
        Dep.target = targetStack.pop()
    }

    var sharedPropertyDefinition = {enumerable: true, configurable: true, get: noop, set: noop};

    function proxy(target, sourceKey, key) {
        sharedPropertyDefinition.get = function proxyGetter() {
            return this[sourceKey][key]
        };
        sharedPropertyDefinition.set = function proxySetter(val) {
            this[sourceKey][key] = val
        };
        Object.defineProperty(target, key, sharedPropertyDefinition)
    }

    function protoAugment(target, src) {
        target.__proto__ = src
    }

    function copyAugment(target, src, keys) {
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            def(target, key, src[key])
        }
    }

    var arrayProto = Array.prototype;
    var arrayMethods = Object.create(arrayProto);
    ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
        var original = arrayProto[method];
        def(arrayMethods, method, function mutator() {
            var args = [], len = arguments.length;
            while (len--)args[len] = arguments[len];
            var result = original.apply(this, args);
            var ob = this.__ob__;
            var inserted;
            switch (method) {
                case'push':
                case'unshift':
                    inserted = args;
                    break;
                case'splice':
                    inserted = args.slice(2);
                    break
            }
            if (inserted) {
                ob.observeArray(inserted)
            }
            ob.dep.notify();
            return result
        })
    });
    var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
    var observerState = {shouldConvert: true};

    function observe(value, asRootData) {
        if (!isObject(value) || value instanceof VNode) {
            return
        }
        var ob;
        if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
            ob = value.__ob__
        } else if (observerState.shouldConvert && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value)) {
            ob = new Observer(value)
        }
        if (asRootData && ob) {
            ob.vmCount++
        }
        return ob
    }

    var Observer = function Observer(value) {
        this.value = value;
        this.dep = new Dep();
        this.vmCount = 0;
        def(value, '__ob__', this);
        if (Array.isArray(value)) {
            var augment = hasProto ? protoAugment : copyAugment;
            augment(value, arrayMethods, arrayKeys);
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    };
    Observer.prototype.observeArray = function observeArray(items) {
        for (var i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    };
    Observer.prototype.walk = function walk(obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    };
    function dependArray(value) {
        var e;
        for (var i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
            if (Array.isArray(e)) {
                dependArray(e)
            }
        }
    }

    function defineReactive(obj, key, val, customSetter, shallow) {
        var dep = new Dep();
        var property = Object.getOwnPropertyDescriptor(obj, key);
        if (property && property.configurable === false) {
            return
        }
        var getter = property && property.get;
        var setter = property && property.set;
        var childOb = !shallow && observe(val);
        Object.defineProperty(obj, key, {
            enumerable: true, configurable: true, get: function reactiveGetter() {
                var value = getter ? getter.call(obj) : val;
                if (Dep.target) {
                    dep.depend();
                    if (childOb) {
                        childOb.dep.depend();
                        if (Array.isArray(value)) {
                            dependArray(value)
                        }
                    }
                }
                return value
            }, set: function reactiveSetter(newVal) {
                var value = getter ? getter.call(obj) : val;
                if (newVal === value) {
                    return
                }
                if (customSetter) {
                    customSetter()
                }
                if (setter) {
                    setter.call(obj, newVal)
                } else {
                    val = newVal
                }
                childOb = !shallow && observe(newVal);
                dep.notify()
            }
        })
    }

    var _Set;
    if (typeof Set !== 'undefined' && isNative(Set)) {
        _Set = Set
    } else {
        _Set = (function () {
            function Set() {
                this.set = Object.create(null)
            }

            Set.prototype.has = function has(key) {
                return this.set[key] === true
            };
            Set.prototype.add = function add(key) {
                this.set[key] = true
            };
            Set.prototype.clear = function clear() {
                this.set = Object.create(null)
            };
            return Set
        }())
    }
    var Watcher = function Watcher(vm, expOrFn, cb, options, isRenderWatcher) {
        this.vm = vm;
        if (isRenderWatcher) {
            vm._watcher = this
        }
        vm._watchers.push(this);
        this.cb = cb;
        this.id = ++uid$2;
        this.active = true;
        this.newDeps = [];
        this.depIds = new _Set();
        this.newDepIds = new _Set();
        this.expression = expOrFn.toString();
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            baseWarn('更新页面的方法不是方法' + expOrFn)
        }
        this.value = this.get()
    };
    Watcher.prototype.get = function get() {
        pushTarget(this);
        var value;
        var vm = this.vm;
        try {
            value = this.getter.call(vm, vm)
        } catch (e) {
            baseWarn('在观察者(watcher)中更新的方法执行出错' + e)
        } finally {
            popTarget()
        }
        return value
    };
    Watcher.prototype.addDep = function addDep(dep) {
        var id = dep.id;
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if (!this.depIds.has(id)) {
                dep.addSub(this)
            }
        }
    };
    Watcher.prototype.run = function run() {
        if (this.active) {
            var value = this.get();
            if (value !== this.value || isObject(value) || this.deep) {
                var oldValue = this.value;
                this.value = value;
                this.cb.call(this.vm, value, oldValue)
            }
        }
    };
    Watcher.prototype.update = function update() {
        queueWatcher(this)
    };
    var callbacks = [];
    var pending = false;
    var queue = [];
    var has = {};
    var waiting = false;
    var flushing = false;
    var index = 0;
    var circular = {};
    var MAX_UPDATE_COUNT = 100;

    function queueWatcher(watcher) {
        var id = watcher.id;
        if (has[id] == null) {
            has[id] = true;
            if (!flushing) {
                queue.push(watcher)
            } else {
                var i = queue.length - 1;
                while (i > index && queue[i].id > watcher.id) {
                    i--
                }
                queue.splice(i + 1, 0, watcher)
            }
            if (!waiting) {
                waiting = true;
                nextTick(flushSchedulerQueue)
            }
        }
    }

    function nextTick(cb, ctx) {
        callbacks.push(function () {
            if (cb) {
                try {
                    cb.call(ctx)
                } catch (e) {
                    baseWarn('nextTick中添加的callbacks中的方法执行出错')
                }
            }
        });
        if (!pending) {
            pending = true;
            if (useMacroTask) {
                macroTimerFunc()
            } else {
                microTimerFunc()
            }
        }
    }

    function flushSchedulerQueue() {
        flushing = true;
        var watcher, id;
        queue.sort(function (a, b) {
            return a.id - b.id
        });
        for (index = 0; index < queue.length; index++) {
            watcher = queue[index];
            id = watcher.id;
            has[id] = null;
            watcher.run();
            if (has[id] != null) {
                circular[id] = (circular[id] || 0) + 1;
                if (circular[id] > MAX_UPDATE_COUNT) {
                    baseWarn('代码可能出现了更新循环在' + watcher.expression + '方法中');
                    break
                }
            }
        }
        resetSchedulerState()
    }

    function resetSchedulerState() {
        index = queue.length = 0;
        has = {};
        waiting = flushing = false
    }

    var microTimerFunc;
    var macroTimerFunc;
    var useMacroTask = false;

    function flushCallbacks() {
        pending = false;
        var copies = callbacks.slice(0);
        callbacks.length = 0;
        for (var i = 0; i < copies.length; i++) {
            copies[i]()
        }
    };
    if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
        macroTimerFunc = function () {
            setImmediate(flushCallbacks)
        }
    } else if (typeof MessageChannel !== 'undefined' && (isNative(MessageChannel) || MessageChannel.toString() === '[object MessageChannelConstructor]')) {
        var channel = new MessageChannel();
        var port = channel.port2;
        channel.port1.onmessage = flushCallbacks;
        macroTimerFunc = function () {
            port.postMessage(1)
        }
    } else {
        macroTimerFunc = function () {
            setTimeout(flushCallbacks, 0)
        }
    }
    if (typeof Promise !== 'undefined' && isNative(Promise)) {
        var p = Promise.resolve();
        microTimerFunc = function () {
            p.then(flushCallbacks);
            if (isIOS) {
                setTimeout(noop)
            }
        }
    } else {
        microTimerFunc = macroTimerFunc
    }
    var patch = (function () {
        var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

        function createPatchFunction(backend) {
            var i, j;
            var cbs = {};
            var modules = backend.modules;
            var nodeOps = backend.nodeOps;
            var emptyNode = new VNode('', {}, []);
            var isTextInputType = makeMap('text,number,password,search,email,tel,url');
            for (i = 0; i < hooks.length; ++i) {
                cbs[hooks[i]] = [];
                for (j = 0; j < modules.length; ++j) {
                    if (isDef(modules[j][hooks[i]])) {
                        cbs[hooks[i]].push(modules[j][hooks[i]])
                    }
                }
            }
            function emptyNodeAt(elm) {
                return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
            }

            function createRmCb(childElm, listeners) {
                function remove() {
                    if (--remove.listeners === 0) {
                        removeNode(childElm)
                    }
                }

                remove.listeners = listeners;
                return remove
            }

            function removeNode(el) {
                var parent = nodeOps.parentNode(el);
                if (isDef(parent)) {
                    nodeOps.removeChild(parent, el)
                }
            }

            function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
                vnode.isRootInsert = !nested;
                var data = vnode.data;
                var children = vnode.children;
                var tag = vnode.tag;
                if (isDef(tag)) {
                    vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag, vnode);
                    createChildren(vnode, children, insertedVnodeQueue);
                    if (isDef(data)) {
                        invokeCreateHooks(vnode, insertedVnodeQueue)
                    }
                    insert(parentElm, vnode.elm, refElm)
                } else if (isTrue(vnode.isComment)) {
                    vnode.elm = nodeOps.createComment(vnode.text);
                    insert(parentElm, vnode.elm, refElm)
                } else {
                    vnode.elm = nodeOps.createTextNode(vnode.text);
                    insert(parentElm, vnode.elm, refElm)
                }
            }

            function insert(parent, elm, ref$$1) {
                if (isDef(parent)) {
                    if (isDef(ref$$1)) {
                        if (ref$$1.parentNode === parent) {
                            nodeOps.insertBefore(parent, elm, ref$$1)
                        }
                    } else {
                        nodeOps.appendChild(parent, elm)
                    }
                }
            }

            function createChildren(vnode, children, insertedVnodeQueue) {
                if (Array.isArray(children)) {
                    for (var i = 0; i < children.length; ++i) {
                        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true)
                    }
                } else if (isPrimitive(vnode.text)) {
                    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
                }
            }

            function isPatchable(vnode) {
                while (vnode.componentInstance) {
                    vnode = vnode.componentInstance._vnode
                }
                return isDef(vnode.tag)
            }

            function invokeCreateHooks(vnode, insertedVnodeQueue) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                    cbs.create[i$1](emptyNode, vnode)
                }
            }

            function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
                for (; startIdx <= endIdx; ++startIdx) {
                    createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm)
                }
            }

            function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
                for (; startIdx <= endIdx; ++startIdx) {
                    var ch = vnodes[startIdx];
                    if (isDef(ch)) {
                        if (isDef(ch.tag)) {
                            removeAndInvokeRemoveHook(ch)
                        } else {
                            removeNode(ch.elm)
                        }
                    }
                }
            }

            function removeAndInvokeRemoveHook(vnode, rm) {
                if (isDef(rm) || isDef(vnode.data)) {
                    var i;
                    var listeners = cbs.remove.length + 1;
                    if (isDef(rm)) {
                        rm.listeners += listeners
                    } else {
                        rm = createRmCb(vnode.elm, listeners)
                    }
                    if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
                        removeAndInvokeRemoveHook(i, rm)
                    }
                    for (i = 0; i < cbs.remove.length; ++i) {
                        cbs.remove[i](vnode, rm)
                    }
                    if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
                        i(vnode, rm)
                    } else {
                        rm()
                    }
                } else {
                    removeNode(vnode.elm)
                }
            }

            function createKeyToOldIdx(children, beginIdx, endIdx) {
                var i, key;
                var map = {};
                for (i = beginIdx; i <= endIdx; ++i) {
                    key = children[i].key;
                    if (isDef(key)) {
                        map[key] = i
                    }
                }
                return map
            }

            function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
                var oldStartIdx = 0;
                var newStartIdx = 0;
                var oldEndIdx = oldCh.length - 1;
                var oldStartVnode = oldCh[0];
                var oldEndVnode = oldCh[oldEndIdx];
                var newEndIdx = newCh.length - 1;
                var newStartVnode = newCh[0];
                var newEndVnode = newCh[newEndIdx];
                var oldKeyToIdx, idxInOld, vnodeToMove, refElm;
                var canMove = !removeOnly;
                while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                    if (!isDef(oldStartVnode)) {
                        oldStartVnode = oldCh[++oldStartIdx]
                    } else if (!isDef(oldEndVnode)) {
                        oldEndVnode = oldCh[--oldEndIdx]
                    } else if (sameVnode(oldStartVnode, newStartVnode)) {
                        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                        oldStartVnode = oldCh[++oldStartIdx];
                        newStartVnode = newCh[++newStartIdx]
                    } else if (sameVnode(oldEndVnode, newEndVnode)) {
                        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                        oldEndVnode = oldCh[--oldEndIdx];
                        newEndVnode = newCh[--newEndIdx]
                    } else if (sameVnode(oldStartVnode, newEndVnode)) {
                        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
                        oldStartVnode = oldCh[++oldStartIdx];
                        newEndVnode = newCh[--newEndIdx]
                    } else if (sameVnode(oldEndVnode, newStartVnode)) {
                        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                        oldEndVnode = oldCh[--oldEndIdx];
                        newStartVnode = newCh[++newStartIdx]
                    } else {
                        if (!isDef(oldKeyToIdx)) {
                            oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
                        }
                        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
                        if (!isDef(idxInOld)) {
                            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
                        } else {
                            vnodeToMove = oldCh[idxInOld];
                            if (sameVnode(vnodeToMove, newStartVnode)) {
                                patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue);
                                oldCh[idxInOld] = undefined;
                                canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
                            } else {
                                createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
                            }
                        }
                        newStartVnode = newCh[++newStartIdx]
                    }
                }
                if (oldStartIdx > oldEndIdx) {
                    refElm = !isDef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
                    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
                } else if (newStartIdx > newEndIdx) {
                    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
                }
            }

            function findIdxInOld(node, oldCh, start, end) {
                for (var i = start; i < end; i++) {
                    var c = oldCh[i];
                    if (isDef(c) && sameVnode(node, c)) {
                        return i
                    }
                }
            }

            function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
                if (oldVnode === vnode) {
                    return
                }
                var elm = vnode.elm = oldVnode.elm;
                if (isTrue(vnode.isStatic) && isTrue(oldVnode.isStatic) && vnode.key === oldVnode.key && isTrue(vnode.isCloned)) {
                    vnode.componentInstance = oldVnode.componentInstance;
                    return
                }
                var i;
                var data = vnode.data;
                var oldCh = oldVnode.children;
                var ch = vnode.children;
                if (isDef(data) && isPatchable(vnode)) {
                    for (i = 0; i < cbs.update.length; ++i) {
                        cbs.update[i](oldVnode, vnode)
                    }
                }
                if (!isDef(vnode.text)) {
                    if (isDef(oldCh) && isDef(ch)) {
                        if (oldCh !== ch) {
                            updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
                        }
                    } else if (isDef(ch)) {
                        if (isDef(oldVnode.text)) {
                            nodeOps.setTextContent(elm, '')
                        }
                        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
                    } else if (isDef(oldCh)) {
                        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
                    } else if (isDef(oldVnode.text)) {
                        nodeOps.setTextContent(elm, '')
                    }
                } else if (oldVnode.text !== vnode.text) {
                    nodeOps.setTextContent(elm, vnode.text)
                }
                if (isDef(data)) {
                    if (isDef(i = data.hook) && isDef(i = i.postpatch)) {
                        i(oldVnode, vnode)
                    }
                }
            }

            function sameInputType(a, b) {
                if (a.tag !== 'input') {
                    return true
                }
                var i;
                var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
                var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
                return typeA === typeB || (isTextInputType(typeA) && isTextInputType(typeB))
            }

            function sameVnode(a, b) {
                return (a.key === b.key && ((a.tag === b.tag && a.isComment === b.isComment && isDef(a.data) === isDef(b.data) && sameInputType(a, b))))
            }

            return function patch(oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
                var insertedVnodeQueue = [];
                var isRealElement = isDef(oldVnode.nodeType);
                if (!isRealElement && sameVnode(oldVnode, vnode)) {
                    patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
                } else {
                    if (isRealElement) {
                        oldVnode = emptyNodeAt(oldVnode)
                    }
                    var oldElm = oldVnode.elm;
                    var parentElm$1 = nodeOps.parentNode(oldElm);
                    createElm(vnode, insertedVnodeQueue, parentElm$1, nodeOps.nextSibling(oldElm));
                    if (isDef(parentElm$1)) {
                        removeVnodes(parentElm$1, [oldVnode], 0, 0)
                    }
                }
                return vnode.elm
            }
        }

        var nodeOps = (function () {
            function createElement$1(tagName, vnode) {
                var elm = document.createElement(tagName);
                if (tagName !== 'select') {
                    return elm
                }
                if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
                    elm.setAttribute('multiple', 'multiple')
                }
                return elm
            }

            function createTextNode(text) {
                return document.createTextNode(text)
            }

            function createComment(text) {
                return document.createComment(text)
            }

            function insertBefore(parentNode, newNode, referenceNode) {
                parentNode.insertBefore(newNode, referenceNode)
            }

            function removeChild(node, child) {
                node.removeChild(child)
            }

            function appendChild(node, child) {
                node.appendChild(child)
            }

            function parentNode(node) {
                return node.parentNode
            }

            function nextSibling(node) {
                return node.nextSibling
            }

            function tagName(node) {
                return node.tagName
            }

            function setTextContent(node, text) {
                node.textContent = text
            }

            function setAttribute(node, key, val) {
                node.setAttribute(key, val)
            }

            var nodeOps = Object.freeze({
                createElement: createElement$1,
                createTextNode: createTextNode,
                createComment: createComment,
                insertBefore: insertBefore,
                removeChild: removeChild,
                appendChild: appendChild,
                parentNode: parentNode,
                nextSibling: nextSibling,
                tagName: tagName,
                setTextContent: setTextContent,
                setAttribute: setAttribute
            });
            return nodeOps
        })();
        var modules = (function () {
            var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');
            var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' + 'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' + 'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' + 'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' + 'required,reversed,scoped,seamless,selected,sortable,translate,' + 'truespeed,typemustmatch,visible');
            var isFalsyAttrValue = function (val) {
                return val == null || val === false
            };

            function updateAttrs(oldVnode, vnode) {
                if (!isDef(oldVnode.data.attrs) && !isDef(vnode.data.attrs)) {
                    return
                }
                var key, cur, old;
                var elm = vnode.elm;
                var oldAttrs = oldVnode.data.attrs || {};
                var attrs = vnode.data.attrs || {};
                if (isDef(attrs.__ob__)) {
                    attrs = vnode.data.attrs = extend({}, attrs)
                }
                for (key in attrs) {
                    cur = attrs[key];
                    old = oldAttrs[key];
                    if (old !== cur) {
                        setAttr(elm, key, cur)
                    }
                }
                if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
                    setAttr(elm, 'value', attrs.value)
                }
                for (key in oldAttrs) {
                    if (!isDef(attrs[key])) {
                        if (!isEnumeratedAttr(key)) {
                            elm.removeAttribute(key)
                        }
                    }
                }
            }

            function setAttr(el, key, value) {
                if (isBooleanAttr(key)) {
                    if (isFalsyAttrValue(value)) {
                        el.removeAttribute(key)
                    } else {
                        value = (key === 'allowfullscreen' && el.tagName === 'EMBED') ? 'true' : key;
                        el.setAttribute(key, value)
                    }
                } else if (isEnumeratedAttr(key)) {
                    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true')
                } else {
                    if (isFalsyAttrValue(value)) {
                        el.removeAttribute(key)
                    } else {
                        if (isIE && !isIE9 && el.tagName === 'TEXTAREA' && key === 'placeholder' && !el.__ieph) {
                            var blocker = function (e) {
                                e.stopImmediatePropagation();
                                el.removeEventListener('input', blocker)
                            };
                            el.addEventListener('input', blocker);
                            el.__ieph = true
                        }
                        el.setAttribute(key, value)
                    }
                }
            }

            var attrs = {create: updateAttrs, update: updateAttrs};

            function concat(a, b) {
                return a ? (b ? (a + ' ' + b) : a) : (b || '')
            }

            function mergeClassData(child, parent) {
                return {
                    staticClass: concat(child.staticClass, parent.staticClass),
                    class: isDef(child.class) ? [child.class, parent.class] : parent.class
                }
            }

            function stringifyArray(value) {
                var res = '';
                var stringified;
                for (var i = 0, l = value.length; i < l; i++) {
                    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
                        if (res) {
                            res += ' '
                        }
                        res += stringified
                    }
                }
                return res
            }

            function stringifyObject(value) {
                var res = '';
                for (var key in value) {
                    if (value[key]) {
                        if (res) {
                            res += ' '
                        }
                        res += key
                    }
                }
                return res
            }

            function stringifyClass(value) {
                if (Array.isArray(value)) {
                    return stringifyArray(value)
                }
                if (isObject(value)) {
                    return stringifyObject(value)
                }
                if (typeof value === 'string') {
                    return value
                }
                return ''
            }

            function renderClass(staticClass, dynamicClass) {
                if (isDef(staticClass) || isDef(dynamicClass)) {
                    return concat(staticClass, stringifyClass(dynamicClass))
                }
                return ''
            }

            function genClassForVnode(vnode) {
                var data = vnode.data;
                var parentNode = vnode;
                var childNode = vnode;
                while (isDef(childNode.componentInstance)) {
                    childNode = childNode.componentInstance._vnode;
                    if (childNode && childNode.data) {
                        data = mergeClassData(childNode.data, data)
                    }
                }
                while (isDef(parentNode = parentNode.parent)) {
                    if (parentNode && parentNode.data) {
                        data = mergeClassData(data, parentNode.data)
                    }
                }
                return renderClass(data.staticClass, data.class)
            }

            function updateClass(oldVnode, vnode) {
                var el = vnode.elm;
                var data = vnode.data;
                var oldData = oldVnode.data;
                if (!isDef(data.staticClass) && !isDef(data.class) && (!isDef(oldData) || (!isDef(oldData.staticClass) && !isDef(oldData.class)))) {
                    return
                }
                var cls = genClassForVnode(vnode);
                var transitionClass = el._transitionClasses;
                if (isDef(transitionClass)) {
                    cls = concat(cls, stringifyClass(transitionClass))
                }
                if (cls !== el._prevClass) {
                    el.setAttribute('class', cls);
                    el._prevClass = cls
                }
            }

            var klass = {create: updateClass, update: updateClass};
            return [attrs, klass]
        })();
        return createPatchFunction({nodeOps: nodeOps, modules: modules})
    })();

    function Vu(options) {
        this.$options = options;
        this._staticTrees = null;
        this._vnode = null;
        this.$el = null;
        this._watchers = [];
        this.config = {isReservedTag: isReservedTag};
        init(this);
        this._initData(this);
        this.$mount(false)
    }

    function init(vm) {
        vm.$createElement = function (a, b, c, d) {
            return createElement(vm, a, b, c, d, true)
        };
        vm._c = function (a, b, c, d) {
            return createElement(vm, a, b, c, d, false)
        }
    }

    installRenderHelpers(Vu.prototype);
    Vu.compile = createCompiler().compileToFunctions;
    Vu.prototype._initData = function (vm) {
        var data = vm.$options.data;
        data = vm._data = data || {};
        if (!isPlainObject(data)) {
            data = {};
            baseWarn('data不是一个[object Object]类型')
        }
        var keys = Object.keys(data);
        var i = keys.length;
        while (i--) {
            var key = keys[i];
            proxy(vm, "_data", key)
        }
        observe(data, true)
    };
    var activeInstance = null;
    Vu.prototype._update = function (vnode, hydrating) {
        var vm = this;
        callHook(vm, 'updateBefore');
        var prevVnode = vm._vnode;
        var prevActiveInstance = activeInstance;
        activeInstance = vm;
        vm._vnode = vnode;
        if (!prevVnode) {
            vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false, vm.$options._parentElm, vm.$options._refElm);
            vm.$options._parentElm = vm.$options._refElm = null
        } else {
            vm.$el = vm.__patch__(prevVnode, vnode)
        }
        activeInstance = prevActiveInstance;
        if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
            vm.$parent.$el = vm.$el
        }
        callHook(vm, 'updateAfter')
    };
    Vu.prototype._render = function () {
        var vm = this;
        var ref = vm.$options;
        var render = ref.render;
        var _parentVnode = ref._parentVnode;
        vm.$vnode = _parentVnode;
        var vnode;
        try {
            vnode = render.call(vm, vm.$createElement)
        } catch (e) {
            baseWarn('render执行出错')
        }
        vnode.parent = _parentVnode;
        return vnode
    };
    function mountComponent(vm, template, hydrating) {
        vm.$el = vm.parseDom(template);
        callHook(vm, 'beforeMount');
        var updateComponent = function () {
            vm._update(vm._render(), hydrating)
        };
        new Watcher(vm, updateComponent, noop, null, true);
        hydrating = false;
        return vm
    }

    Vu.prototype.$mount = function (hydrating) {
        var options = this.$options;
        var template = options.template;
        if (template) {
            var ref = Vu.compile(template, {});
            var render = ref.render;
            var staticRenderFns = ref.staticRenderFns;
            var ast = ref.ast;
            options.render = render;
            options.staticRenderFns = staticRenderFns;
            options.ast = ast
        }
        return mountComponent.call(this, this, template, hydrating)
    };
    Vu.prototype.parseDom = function (html) {
        var objE = document.createElement("div");
        objE.innerHTML = html;
        return objE.children[0]
    };
    Vu.prototype.setAllDate = function (data) {
        var vm = this;
        Object.keys(data).forEach(function (item) {
            vm._data[item] = data[item]
        })
    };
    Vu.prototype.resetVu = function (data, cb) {
        var vm = this;
        vm.$el = vm.parseDom(vm.$options.template);
        vm._vnode = null;
        Object.keys(data).forEach(function (item) {
            vm._data[item] = data[item]
        });
        function _updateAfter() {
            vm.$options.updateAfter.pop();
            cb.call(vm)
        }

        if (vm.$options.updateAfter) {
            vm.$options.updateAfter.push(_updateAfter)
        } else {
            vm.$options.updateAfter = [_updateAfter]
        }
    };
    Vu.prototype.appendIn = function (parentDom) {
        var vm = this;
        parentDom.appendChild(vm.$el)
    };
    Vu.prototype.__patch__ = inBrowser ? patch : noop;
    return Vu
});