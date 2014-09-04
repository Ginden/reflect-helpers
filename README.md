_R
===============

_R is a reflection library.


## _R settings

```javascript
_R.$setDirective(directive)
```

Changes directive placed in every function.

#### Avaible directives

```
_R.DIRECTIVE_NORMAL // ''; is placed before every new function
_R.DIRECTIVE_STRICT // 'use strict'; is placed before every function; default
_R.DIRECTIVE_ASM    // 'use asm'; is placed before every new function
```
## _R methods

### Checks and tests

#### isValidVariableName
```javascript
_R.isValidVariableName(name)
```
Checks if supplied `name` is a valid variable identifier in current JS implementation.

#### isBoundOrNativeFunction

```javascript
_R.isBoundOrNativeFunction(func)
```
Checks if supplied `func` is bound (`.bind`) or native code.

#### getFunctionSourceCode

```javascript
_R.getFunctionSourceCode(func)
```
Returns `FunctionExpression`. Throws error when called on non-function, bound function or native-code function.

#### getInternalClass


```javascript
_R.getInternalClass(what)
```
Returns `[[Class]]`'s name of `what`.

#### declosureFunction

```javascript
_R.declosureFunction(func[, transformer]);
```
Returns `func` redefined in global context. `transformer` function is called on source code of `func` before code evaluation.
##### transformer
`function transformer(sourceCode, originalFunction) {
    /* magic */
    return transformedSourceCode;
}`

#### createNamedFunction

```javascript
_R.createNamedFunction(name, [...argsNames[, sourceCode]])
```
Works like `Function` constructor but first argument is the function name (used in recursive calls; shouldn't be confused with non-standard property `function.name`).

#### createClosure

```javascript
_R.createClosure(func, context, name)
```
Creates closure in given context.
Example:
```javascript
console.log(window.$) // undefined
var showFactorial = _R.createClosure(
    function (n) {
        if (!n || n === 1)
            return 1;
        var curr = n*factorial(n-1);
        $('div.factorial').html(curr);
        return curr;
    },
    {
        $: jQuery
    },
    'factorial'
);
showFactorial(5);
```

#### getObjectPrototype

```javascript
_R.getObjectPrototype(what)
```
If `what` is an object, returns it's prototype. Otherwise, returns `null`.
Can return invalid object in IE8 and lower.

#### getPrototypesChain

```javascript
_R.getPrototypesChain(what)
```
If `what` is an object, returns array containing `what` and objects in it's prototype chain (array ends with `null`).
Otherwise, return `[what, null]`.
When cyclical reference is detected (possible in IE8 and lower), function returns with current prototypes list.

### indirectEval
```javascript
_R.indirectEval(code[, preparationCode]);
```
Works like `eval` but:
- code scope and context always follow rules for ECMAScript strict mode `eval`
- if preparationCode isn't supplied, code is run with global settings directive (default: 'use strict')

### construct
```javascript
_R.construct(constructor, args)
```
This function follows specification of `Reflect.construct` from ES6 ([26.1.2](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-reflect.construct)).

#### Usage example
```javascript
_R.construct(Date, [30,3,1990]);
```


### Proxy

```javascript
new _R.Proxy(target, getHandler, setHandler);
```

Creates proxy object for target.

#### createProxy

```javascript
_R.createProxy(target, getHandler, setHandler);
```

Alias for `new _R.Proxy`.

#### Usage example

```javascript
function Circle(r) {
this.diameter = undefined;  // property have to exist 
this.area = undefined;      // property have to exist
this.radius = r;
return _R.createProxy(this, Circle.getter, Circle.setter);
}
Circle.getter = function circleGetter(originalObject, proxyObject, propertyName) {
    if (propertyName === 'radius') {
        return originalObject.radius;
    }
    if (propertyName === 'diameter') {
        return proxyObject.radius*2;
    }
    if (propertyName === 'area') {
        return proxyObject.radius*proxyObject.radius*Math.PI;
    }
}
Circle.setter = function circleSetter(originalObject, proxyObject, propertyName, propertyValue) {
    if (propertyName !== 'radius') {
        throw Error('You can not modify anything in circle except radius');
    }
    else {
        return originalObject.radius = propertyValue;
    }
}

var k = new Circle(5);
k.radius === k.diameter*2; // true
k.diameter = 7; // Error: You can not modify anything in circle except radius
k.oh = 'hai'; // Error in strict mode; Does nothing outside of strict mode
k.radius = 11; // works
console.log(k.diameter); // 22
```

