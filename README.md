_R
===============

_R is a reflection library.


## _R settings

```
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
```
_R.isValidVariableName(name)
```
Checks if supplied `name` is a valid variable identifier in current JS implementation.

#### isBoundOrNativeFunction

```
_R.isBoundOrNativeFunction(func)
```
Checks if supplied `func` is bound (`.bind`) or native code.

#### getFunctionSourceCode

```
_R.getFunctionSourceCode(func)
```
Returns `FunctionExpression`. Throws error when called on non-function, bound function or native-code function.

#### getInternalClass


```
_R.getInternalClass(what)
```
Returns `[[Class]]`'s name of `what`.

#### declosureFunction

```
_R.declosureFunction(func[, transformer]);
```
Returns `func` redefined in global context. `transformer` function is called on source code of `func` before code evaluation.
##### transformer
`function transformer(sourceCode, originalFunction) {
    /* magic */
    return transformedSourceCode;
}`

#### createNamedFunction

```
_R.createNamedFunction(name, [...argsNames[, sourceCode]])
```
Works like `Function` constructor but first argument is the function name (used in recursive calls; shouldn't be confused with non-standard property `function.name`).

#### createClosure

```
_R.createClosure(func, context, name)
```
Creates closure in given context.
Example:
```
console.log(window.$) // undefined
var showFactorial = _R.createClosure(
    function (n) {
        var prev = n  || 1;
        var curr = n*factorial(n-1);
        $('div.factorial').html(curr);
    },
    {
        $: jQuery
    },
    'factorial'
);
showFactorial(5);
```

#### getObjectPrototype

```
_R.getObjectPrototype(what)
```
If `what` is an object, returns it's prototype. Otherwise, returns `null`.
Can return invalid object in IE8 and lower.

#### getPrototypesChain

```
_R.getPrototypesChain(what)
```
If `what` is an object, returns array containing `what` and objects in it's prototype chain (array ends with `null`).
Otherwise, return `[what, null]`.
When cyclical reference is detected (possible in IE8 and lower), function returns with current prototypes list.

