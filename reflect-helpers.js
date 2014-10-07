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
var indirectEval = function indirectEval(code, preparationCode) {
         return Function('code', (arguments.length > 1 ? preparationCode : _R.__directive) + ';\n return eval(arguments[0])')(code)
};



_R.indirectEval = indirectEval;

_R.__supportsObjectDefineProperties = (function(){
   if (!Object.defineProperty) {
      return false;
   }
   try {
      var q = {};
      Object.defineProperty(q, 'wow', {value: 3});
      return q.wow === 3;
   } catch (e) {
      return false;
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
 * " If you were to summarize all these rules in a single ASCII-only regular expression for JavaScript,
 *   it would be 11,236 characters long".
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
    var ret = objectCreate(new Error());
    ret.message = '_R does not support native or bound functions as arguments!';
    ret.name = 'NativeFunctionSuppliedError';
    return ret;
}

function objectCreate(proto) {
   function F(){}
   if (Object.create) {
      return Object.create(proto);
   }
   else {
      F.prototype = proto;
      return (new F());
   }
}

function removeDuplicatesFromStringArray(what) {
   var dict = objectCreate(null);
   var ret = [];
   for (var i=0; i < what.length; i++) {
      dict[what[i]] = true;
   }
   for (var key in dict) {
      ret.push(key);
   }
   return ret;
}

_R.__boundFunction = (function a(){}).bind(null);

_R.__emptyFunction = Function();
_R.__emptySetter = Function('a', '');

/**
 * Tests if function is native or bound
 * @method
 * @param {function} func - function to be stringified
 * @throws {TypeError} when func isn't a function
 * @returns {boolean}
 */

_R.isBoundOrNativeFunction = function isBoundOrNativeFunction(func) {
   var sourceCode = getNaiveFunctionSourceCode(func);
   if (sourceCode === getNaiveFunctionSourceCode(func.bind(null))) {
      return true;
   }
   // Old Safari
   if (sourceCode === '[function]') {
      return true;
   }
   
   try {
      Function('return ('+sourceCode+')');
      return false;
   } catch (e) {
      return true;
   }

};

/**
 * Returns source code of function or throws error when it's impossible to retrieve
 * @method
 * @param {function} func - function to be stringified
 * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
 * @returns {String}
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
 * @param {string} name - function name (used for recursive calls, shouldn't be confused with function.name property)
 * @param {...string} restArgs - arguments to Function constructor
 * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
 */

_R.createNamedFunction = function createNamedFunction(name, restArgs) {
    name = name || 'anonymous';
    if (!_R.isValidVariableName(name)) {
        throw new NativeFunctionSuppliedError();
    }
    restArgs = Array.prototype.slice.call(arguments, 1);
    var tempFuncSource = _R.getFunctionSourceCode(Function.apply(null, restArgs));
    var newFuncSource;
    if (tempFuncSource.indexOf('function anonymous')) === 0)	 {
    	tempFuncSource = tempFuncSource.split('\n');
    	tempFuncSource[0] = tempFuncSource.replace('anonymous', name+' ');
    	newFuncSource = tempFuncSource.join('\n');
    }
    else {
    	newFuncSource = 'function '+name+' '+tempFuncSource.slice(tempFuncSource.indexOf('('));
    }
    return _R.indirectEval(newFuncSource);
};

/**
 * Redefines function in context of given object;
 * Default function name is 
 * @method
 * @param {function} func - function name (exists in function scope, shouldn't be confused with function.name property)
 * @param {Object} [context] - context of new function
 * @param {string} [name] - name of new function (defaults to 'anonymous' (will shadow arguments from context))
 * @throws {NativeFunctionSuppliedError} for bound functions and native code functions
 */

_R.createClosure = function createClosure(func, context, name) {
    context = context || {};
    name = _R.isValidVariableName(name) ? name : 'anonymous';
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

/**
 * Returns objects properties names without duplicates
 * @param {*} what
 * @param {boolean} searchInPrototypes
 * @returns {String*} 
 */

_R.getObjectPropertiesNames = function getObjectPropertiesNames(what, searchInPrototypes) {
   var keys = [];
   if (what === null) {
      return [];
   }
   if (Object.getOwnPropertyNames) {
      keys.push.apply(keys, Object.getOwnPropertyNames(what));
   }
   else {
      for (var key in what) {
         if (Object.hasOwnProperty.call(what, key)) {
            keys.push(key);
         }
      }
   }
   if (searchInPrototypes) {
      keys.push.apply(keys, _R.getObjectPropertiesNames(_R.getObjectPrototype(what), true));
   }
   
   return keys;
}





_R.__getDescriptor = function __getDescriptor(what, key) {
   var descriptor;
   do {
      descriptor = Object.getOwnPropertyDescriptor(what, key);
      what = _R.getObjectPrototype(what)
   } while (!descriptor && what);
   return descriptor;
};

_R.__injectAccesorsToDescriptor = function __injectAccesorsToDescriptor(descriptor, getter, setter) {
   descriptor.get = getter;
   descriptor.set = setter;
   delete descriptor.value;
   delete descriptor.writable;
   return descriptor;
};
 
_R.__createAccesor = function __createGetter(accesor, original, proxy, key) {
   return accesor.bind(null, original, proxy, key);
};

/**
 * new _R.Proxy is an alias for _R.createProxy
 * Calls Object.seal on returned value.
 * Works only if current implementation supports Object.defineProperty()
 * @method
 * @param {Object} what
 * @param {function} getHandler - function filter(originalObject, proxyObject, propertyName)
 * @param {function} [setHandler] - function filter(originalObject, proxyObject, propertyName, propertyValue). Default: do nothing.
 * @returns {Object} 
 */
 

_R.Proxy = function Proxy(what, getHandler, setHandler) {
   var proxy = this instanceof Proxy ? this : objectCreate(Proxy.prototype);
   if (!_R.__supportsObjectDefineProperties) {
      throw new Error('_R.createProxy requires spec-compatible Object.defineProperty to work!');
   }
   if (typeof getHandler !== 'function') {
      throw new Error('getHandler is not a function!');
   }
   if (arguments.length > 2 && typeof setHandler !== 'function') {
      throw new Error('setHandler is not a function!');
   }
   setHandler = setHandler || _R.Proxy.defaultSetter;
   var keys = removeDuplicatesFromStringArray(_R.getObjectPropertiesNames(what, true));
   console.log(keys);
   var key, originalDescriptor, descriptor, accesorGet, accesorSet;
   for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      descriptor = _R.__getDescriptor(what, key);
      accesorGet = _R.__createAccesor(getHandler, what, proxy, key);
      accesorSet = setHandler ? _R.__createAccesor(setHandler, what, proxy, key) : _R.__emptyFunction;
      _R.__injectAccesorsToDescriptor(descriptor, accesorGet, accesorSet);
      Object.defineProperty(proxy, key, descriptor);
   }
   Object.seal(proxy);
   return this;
};

_R.Proxy.defaultSetter = function (orig, proxy, name, val) {
   return orig[name] = val;
};


/**
 * Returns proxy object.
 * __R.createProxy is an alias for new _R.Proxy

 * @method
 * @param {Object} what
 * @param {function} getHandler - function filter(originalObject, proxyObject, propertyName)
 * @param {function} [setHandler] - function filter(originalObject, proxyObject, propertyName, propertyValue). Default: do nothing.
 * @returns {Object} 
 */
 
_R.createProxy = function createProxy() {
   return _R.construct(_R.Proxy, arguments);
};

/**
 * Applies constructor with specified arguments (array or array-like)
 * Follows spec of ES6 Reflect.construct
 * @method
 * @param {function} target
 * @param {Array} args 
 * @returns {Object} 
 */

_R.construct = function construct(target, args) {
   if (typeof target !== 'function') {
      throw new TypeError('_R.construct can be called only on function');
   }
   args = Array.prototype.slice.call(args);
   var argsList = [];
   for (var i=0; i < args.length; i++) {
      argsList.push('arguments['+(i+1)+']')
   }
   
   var source = 'return (new Constructor('+argsList.join(', ')+'));';
   return Function('Constructor', source).apply(null, [target].concat(args));
};


/**
 * Applies function with specified arguments and this value
 * Follows spec of ES6 Reflect.apply
 * @method
 * @param {function} target
 * @param {Object} thisArg
 * @param {Array} args
 * @returns {*} 
 */

_R.apply = function ReflectApply(target, thisArg, args) {
   return Function.apply.call(target, thisArg, args);
};



/**
 * Checks if target has a property key
 * Follows spec of ES6 Reflect.has
 * @method
 * @param {function} target
 * @param {string|symbol} key
 * @returns {*} 
 */

_R.has = function ReflectHas(target, key) {
   return Object.prototype.hasOwnProperty.call(target, key);
};



_R.toString = function() {
    return '[Object _R]';
};

function Env() {
   Env.__DECODER__ = '_R';
}

Env.__serialise = function serialise(what) {
   var stringRepresentation = {};
   var type;
   if (what instanceof _R.Expression) {
      type = 'expression';
   } else if (what instanceof RegExp) {
      type = 'RegExp';
   } else {
      type = typeof what;
   }
   var ret = {};
   var val;
   ret.__TYPE__ = type;
   if (type === 'object') {
      val = Env.__serialiseObject(what);
   } else if (type === 'function') {
      val = _R.getFunctionSourceCode(what);
   } else if (type === 'number' || type === 'string') {
      val = String(what); // JSON.stringify does not preserve Infinity, -Infinity, NaN
   } else if (type === 'RegExp') {
      val = {
         source: what.source,
         options: what.options
      };
   } else {
      val = what;
   }
   return {
      __TYPE__: type,
      __VALUE__: val
   };
};

Env.__decode = function decode(what) {
   types 
}

Env.prototype.add = function add() {
   
}

_R.createEnv = function createEnv() {
   var env = new Env();
   env.functions = [];
};

_R.restoreEnv = function restoreEnv(object, target) {
   if (typeof object === 'string') {
      object = JSON.parse(object);
   }
   target = target || this; // global
   if (object.__DECODER__ !== '_R') {
      throw new Error('_R can not decode this object');
   }
   
}

/**
 * Forbids writing to properties from `args` of `what` object
 * @method
 * @param {what} target
 * @param {string|string*} ...args
 * @returns {*} 
 */

_R.forbidPropertyNames = function forbidPropertyNames(what) {
   var unpacked = [].concat.apply([],[].slice.call(arguments, 1));
   var key;
   for (var i=0; i < unpacked.length; i++) {
      key = unpacked[i];
      Object.defineProperty(
         what, key, {
            enumerable: false,
            configurable: false,
            writable: false,
            get: function() {
               return undefined;
            },
            set: _R.__setterAccessDenied.bind(what, key)
         }
      );
   }
};

_R.__setterAccessDenied = function(propertyName, value, message, error) {
   message = message || 'Can\'t write to ('+this+')['+JSON.stringify(propertyName)+']!';
   error = error || TypeError;
   if (error) {
      throw new error(message);
   }
   else {
      return undefined;
   }
};

_R.addMagicLengthProperty = function addMagicLengthProperty(what, readOnly) {
   if (arguments.length < 2) {
      readOnly = true;
   }
   Object.defineProperty(what, 'length', {
      configurable: false,
      enumerable: false,
      get: _R.__magicLengthGetter,
      set: readOnly ? _R.__emptyFunction : _R__magicLengthSetter
   }
   );
   return what;
};

_R.__magicLengthGetter = function magicLengthGetter() {
   var last = Math.max.apply(null,
            Object.keys(this)
               .map(Number)
               .filter(function(el){
                  return el > 0 && el === el;
               })
   );
   if (last === -Infinity) {
      return 0;
   }
   return last + 1;
};

_R.__magicLengthSetter = function magicLengthSetter(val) {
   Object.keys(this).forEach(function(el,i,arr) {
      var modified = Number(el);
      if (modified === modified && modified >= val) {
         delete this[el];
      }
   }, this);
   return val;
};

_R.makeGeneric = function demethodify(func) {
   return Function.call.bind(func);
};


return _R;
}));