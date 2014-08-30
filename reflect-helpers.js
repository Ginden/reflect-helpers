/** @module reflect-helpers */


(function (root, factory) {
if (typeof define === 'function' && define.amd) {
// AMD. Register as an anonymous module.
define([], factory);
} else if (typeof exports === 'object') {
// Node. Does not work with strict CommonJS, but
// only CommonJS-like environments that support module.exports,
// like Node.
module.exports = factory();
} else {
// Browser globals (root is window)
root._R = factory();
}
}(this, function () {
var _R = {};
var indirectEval;
(function wow(){
   (1,eval)('var wow = 3');
   if (typeof wow === 'number') {
      indirectEval = function indirectEval(code) {
         return Function('code', 'return eval(code)')(code)
      }
   } else {
      indirectEval = eval;
   }
})();
var getNaiveFunctionSourceCode = Function.call.bind(Function.toString);

 _R.__directives = ['', 'use strict', 'use asm'];
 
 _R.DIRECTIVE_NORMAL = 0;
 _R.DIRECTIVE_STRICT = 1;
 _R.DIRECTIVE_ASM    = 2;
 
 /*
  * Changes directives used by created functions
 * @method
 * @param {integer|string} directive - directive to be used
 * @returns {boolean}
 */
 
 _R.$setDirective = function (directive) {
    if (typeof directive === 'number') {
        _R.__directive = JSON.stringify(_R.__directives[directive] || '');
    } else {
        _R.__directive = JSON.stringify(directive);
    }
 };
 
 _R.__directive = '';
 _R.$setDirective(_R.DIRECTIVE_STRICT);
/**
 * Tests variable name against current implementation rules.
 * " If you were to summarize all these rules in a single ASCII-only regular expression for JavaScript, it would be 11,236 characters long."
 * @method
 * @param {string} name - string to be tested
 * @returns {boolean}
 */

_R.isValidVariableName = function isValidVariableName(name) {
    try {
        Function(name, '');
    }
    catch (e) {
        return false;
    }
    return true;
}

function NativeFunctionSuppliedError() {
    var ret = Object.create(new Error());
    ret.message = '_R does not support native or bound functions as arguments!';
    ret.name = 'NativeFunctionSuppliedError';
    return ret;
}



_R.__boundFunction = (function(){}).bind(null);


/**
 * Tests if function is native or bound
 * @method
 * @param {function} func - function to be stringified
 * @throws {TypeError} when func isn't a function
 * @returns {boolean}
 */

_R.isBoundOrNativeFunction = function isBoundOrNativeFunction(func) {
    return getNaiveFunctionSourceCode(func) === getNaiveFunctionSourceCode(func.bind(null));
};

/**
 * Returns source code of function or throws error when it's impossible to retrieve
 * @method
 * @param {function} func - function to be stringified
 * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
 * @returns {string}
 */

_R.getFunctionSourceCode = function getFunctionSourceCode(func) {
    var source = Function.toString.call(func);
    if (_R.isBoundOrNativeFunction(func)) {
        throw new NativeFunctionSuppliedError();
    }
    return source;
};

/**
 * Returns [[Class]] of what
 * @method
 * @param what - Object or primitive to be inspected
 */

_R.getInternalClass = function (what) {
    return Object.prototype.toString.call(what).match(/^\[object\s(.*)\]$/)[1];
};

/**
 * Returns function redefined in global context
 * @method
 * @param {function} func - function to be redefined
 * @param {function} [transformer] - transformation function applied to function source code. function callback(sourceCode, func)
 * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
 */

_R.declosureFunction = function(func, transformer) {
    transformer = transformer || function(a) {return a};
    return indirectEval('('+transformer(_R.getFunctionSourceCode(func), func)+')');
}

/**
 * Creates named function using Function constructor
 * @method
 * @param {string} name - function name (exists in function scope, used for recursive calls, shouldn't be confused with function.name property)
 * @param {...string} restArgs - arguments to Function constructor
 * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
 */

_R.createNamedFunction = function createNamedFunction(name, restArgs) {
    name = ''+name || 'anonymous';
    if (!_R.isValidVariableName(name)) {
        throw new NativeFunctionSuppliedError();
    }
    restArgs = Array.prototype.slice.call(arguments, 1);
    return _R.declosureFunction(
            function($$$1){
                $$$directive;
                $$$1 = $$$2;
                return $$$1;
            },
            function transformSource(sourceCode){
                return sourceCode
                    .replace('$$$1', name, 'g')
                    .replace('$$$directive', _R.__directive)
                    .replace('$$$2', '('+_R.getFunctionSourceCode(Function.apply(null, restArgs))+')', 'g');
            }
    )();
};

/**
 * Redefines function in context of given object;
 * Default function name is 
 * @method
 * @param {function} func - function name (exists in function scope, shouldn't be confused with function.name property)
 * @param {Object} [context] - context of new function
 * @param {string} [name] - name of new function (defaults to 'anonymous' (will NOT shadow arguments from context))
 * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
 */

_R.createClosure = function createClosure(func, context, name) {
    context = context || {};
    name = isValidVariableName(name) ? name : 'anonymous';
    var argumentsNames  = [];
    var argumentsValues = [];
    for (var key in context) {
        if (Object.hasOwnProperty.call(context, key) && _R.isValidVariableName(key)) {
            argumentsNames.push(key);
            argumentsValues.push(context[key])
        }
    }

    var sourceCode = _R.__directive+';\n var '+name+ '= ('+_R.getFunctionSourceCode(func)+'); return '+name+';';
    
    return Function.apply(null, argumentsNames.concat(sourceCode)).apply(null, argumentsValues);
};

/**
 * Returns prototype of first argument
 * If argument isn't an object, returns null
 * Can return invalid object in IE8 and lower.
 * @method
 * @param {*} what
 * @returns {Object?} returns object or null
 */

_R.getObjectPrototype = function getObjectPrototype(what) {
    if (typeof what !== 'object' || typeof what !== 'function') {
        return null;
    }
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(what);
    }
    else if (({}).__proto__) {
        return what.__proto__
    }
    else {
        // This branch doesn't work in certain cases
        
        // check against null and undefined
        // != test is intentional
        if (what != null) {
            return what.constructor ? (what.constructor.prototype || null) : null;
        }
    }
    return null;
}

/**
 * Returns array of objects existing in prototype chains
 * @method
 * @param {*} what
 * @returns {Object*} 
 */

_R.getPrototypesChain = function getPrototypesChain(what) {
    var prototypesList = [];
    do {
        prototypesList.push(what);
    } while (what = _R.getObjectPrototype(what) && prototypesList.indexOf(what) !== -1);
    return prototypesList;
};

_R.toString = function() {
    return '[Object _R]';
};

return _R;
}));