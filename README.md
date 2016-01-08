<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [_R](#_r)
  - [Installation](#installation)
    - [Compatibility, requirements](#compatibility-requirements)
      - [Required functions (some functions can not work without them)](#required-functions-some-functions-can-not-work-without-them)
    - [Recommended functions (some functions can work incorrectly without them)](#recommended-functions-some-functions-can-work-incorrectly-without-them)
    - [Tested environments](#tested-environments)
    - [Test coverage](#test-coverage)
  - [_R settings](#_r-settings)
      - [Avaible directives](#avaible-directives)
    - [Implementation dependant](#implementation-dependant)
  - [_R methods](#_r-methods)
    - [Checks and tests](#checks-and-tests)
      - [isValidVariableName](#isvalidvariablename)
      - [isBoundOrNativeFunction](#isboundornativefunction)
    - [Retrieve informations](#retrieve-informations)
      - [getFunctionSourceCode](#getfunctionsourcecode)
      - [getInternalClass](#getinternalclass)
      - [getObjectPrototype](#getobjectprototype)
      - [getPrototypesChain](#getprototypeschain)
    - [Modify functions](#modify-functions)
      - [declosureFunction](#declosurefunction)
        - [transformer](#transformer)
      - [createNamedFunction](#createnamedfunction)
      - [createClosure](#createclosure)
    - [makeGeneric](#makegeneric)
      - [Usage example](#usage-example)
    - [wrapFunction](#wrapfunction)
      - [before](#before)
      - [after](#after)
      - [Usage example](#usage-example-1)
  - [Utility](#utility)
    - [indirectEval](#indirecteval)
  - [ES6 Reflect methods](#es6-reflect-methods)
    - [construct](#construct)
      - [Usage example](#usage-example-2)
    - [has](#has)
    - [apply](#apply)
  - [Create and modify objects](#create-and-modify-objects)
    - [Proxy](#proxy)
      - [createProxy](#createproxy)
      - [defaultSetter](#defaultsetter)
      - [Usage example](#usage-example-3)
    - [forbidPropertyNames](#forbidpropertynames)
      - [Usage example](#usage-example-4)
    - [addMagicLengthProperty](#addmagiclengthproperty)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

_R
===============

_R is a reflection library.

## Installation

```
npm install reflect-r
```
Node.js:
```javascript
var _R = require('reflect-r');
```
Browsers:
```html
<script src="./reflect-helpers.js"></script>
```
### Running tests

```
gulp test
```

### Building project

```
gulp build
```




### Compatibility, requirements

_R requires following ES5/ES6 features:

#### Required functions (some functions can not work without them)
* Object.defineProperty
* Object.getOwnPropertyDescriptor
* JSON.stringify (can be polyfilled)

### Recommended functions (some functions can work incorrectly without them)
* Object.getPrototypeOf
* Object.getOwnPropertyNames

### Tested environments

These enviroments pass automatic tests.
* Node 0.8.14
* Firefox 33
* Chrome 36

See section 'Implementation dependant' for futher information.

### Test coverage
* Statements   : 91.1% (215/236)
* Branches     : 70.41% (69/98)
* Functions    : 88.68% (47/53)
* Lines        : 90.99% (212/233)

## _R settings

```javascript
_R.$setDirective(directive)
```

Changes directive placed in every function.

#### Available directives

```
_R.DIRECTIVE_NORMAL // ''; is placed before every new function
_R.DIRECTIVE_STRICT // 'use strict'; is placed before every function; default
_R.DIRECTIVE_ASM    // 'use asm'; is placed before every new function
```

### Implementation dependant
* `_R.isValidVariableName` tests variable name against **current implementation** rules. 
* `_R.isBoundOrNativeFunction` is slow in V8 (due to V8's incompatibility with ES6 spec).
* `_R.getObjectPrototype` can fail in IE8 and lower. Internally it prefers `Object.getPrototypeOf` over `.__proto__` over `.constructor.prototype`.


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

### Retrieve informations

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

### Modify functions


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
Works like `Function` constructor but first argument is the function name (used in recursive calls).

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

### makeGeneric
```javascript
_R.makeGeneric(func);
```
Changes method to function accepting `this` as first argument.
#### Usage example
```javascript
var slice = _R.makeGeneric([].slice);
slice(arguments, 2, 7);
```

### wrapFunction
```javascript
_R.wrapFunction(func, before, after, [dataObject])
```
Returns new function. New function pseudocode:
```javascript
function newFunc() {
var error = null;
var data = null;
var newArgs = before(func, this, arguments, dataObject) || arguments;
try {
data = func.applyOrConstruct(this, newArgs);
} catch(e){
error = e;
}
var afterResult = after(func, this, error, data, newArgs, dataObject);
data = afterResult || data;
return data;
}
```
#### before
```
function before(func, thisArg, funcArguments, dataObject) {}
````
`before` function can return array or modify `funcArguments` object. It will be used by wraped function.
#### after
```
function after(func, thisArg, funcError, funcResult, funcArguments, dataObject) {}
```

#### Usage example
```javascript
$ = jQuery = _R.wrapFunction(
	jQuery,
	function($,ignored1,ignored2,ignored3, data){
		data.startTime = Date.now();
	},
	function($,ignored1,ignored2,ignored3, data) {
		console.log('jQuery function took '+(Date.now() - data.startTime)+' miliseconds to run.');
	},
	{})
```

## Utility

### indirectEval
```javascript
_R.indirectEval(code[, preparationCode]);
```
Works like `eval` but:
- code scope and context always follow rules for ECMAScript strict mode `eval`
- if preparationCode isn't supplied, code is run with global settings directive (default: 'use strict')



## ES6 Reflect methods

### construct
```javascript
_R.construct(constructor, args)
```
This function follows specification of `Reflect.construct` from ES6 ([26.1.2](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-reflect.construct)).

#### Usage example
```javascript
_R.construct(Date, [30,3,1990]);
```

### has
```javascript
_R.has(obj, key)
```

This function follows specification of `Reflect.has` from ES6 ([26.1.9](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-reflect.has)).

### apply
```javascript
_R.apply(function, target, args);
```

This function follows specification of `Reflect.apply` from ES6 ([26.1.3](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-reflect.apply)).


## Create and modify objects


### Proxy

```javascript
new _R.Proxy(target, getHandler, setHandler);
```

Creates proxy object for target. Proxy objects are sealed (`Object.seal`).

#### createProxy

```javascript
_R.createProxy(target, getHandler, setHandler);
```

Alias for `new _R.Proxy`.

#### defaultSetter
```javascript
_R.defaultSetter
```

Transfers assigment to original object.

#### Usage example

```javascript
function Circle(r) {
	'strict mode';
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
};

Circle.setter = function circleSetter(originalObject, proxyObject, propertyName, propertyValue) {
    if (propertyName !== 'radius') {
        throw Error('You can not modify anything in circle except radius');
    }
    else {
        return originalObject.radius = propertyValue;
    }
};

var k = new Circle(5);
k.radius === k.diameter*2; // true
k.diameter = 7; // Always throw Error: You can not modify anything in circle except radius
k.oh = 'hai'; // Error in strict mode; Does nothing in sloppy mode
k.radius = 11; // works
console.log(k.diameter); // 22
```

### forbidPropertyNames
```javascript
_R.forbidPropertyNames(what, ...names)
```
Forbids writing to properties of object.
Returns modified `what`.
`...names` can be any combination of strings and array of strings.
#### Usage example
```javascript
_R.forbidPropertyNames(Object.prototype, ['get', 'set'], 'enumerable', ['writable', 'configurable']);
Object.prototype.get = function(){}; // throws TypeError
```
### addMagicLengthProperty
```javascript
_R.addMagicLengthProperty(what [,readOnly=true]);
```
Adds magic `length` property to `what` object. It works almost as `length` property of arrays but it does not support length exceeding maximal index. 

If `readOnly` argument is false, changes in `length` property will remove indexes over specified length.

