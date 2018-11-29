'use strict';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var isString = function isString(val) {
  return typeof val === 'string';
};
var isFunction = function isFunction(fn) {
  return typeof fn === 'function';
};
var isObject = function isObject(val) {
  return val && _typeof(val) === 'object';
};
var isArray = function isArray(val) {
  return toString.call(val) === '[object Array]';
};
var forEach = function forEach(obj, fn) {
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  if (_typeof(obj) !== 'object' && !isArray(obj)) {
    obj = [obj];
  }

  if (isArray(obj)) {
    for (var i = 0, l = obj.length; i < l; i++) {
      fn(obj[i], i, obj);
    }
  } else {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn(obj[key], key, obj);
      }
    }
  }
};
var merge = function merge() {
  var result = {};

  function assignValue(v, k) {
    if (isObject(result[k]) && isObject(v)) {
      result[k] = merge(result[k], v);
    } else {
      result[k] = v;
    }
  }

  var len = arguments.length;

  for (var i = 0; i < len; i++) {
    forEach(i < 0 || arguments.length <= i ? undefined : arguments[i], assignValue);
  }

  return result;
};
var bind = function bind(fn, ctx) {
  return function wrap() {
    var args = [].slice.call(arguments, 0);
    return fn.apply(ctx, args);
  };
};
var extend = function extend(target, source, ctx) {
  forEach(source, function (val, key) {
    if (ctx && isFunction(val)) {
      target[key] = bind(val, ctx);
    } else {
      target[key] = val;
    }
  });
  return target;
};

var defaults = {// cacheControl: {
  //   cache: true,
  //   // expire 过期时间
  //   // maxCacheSize 缓存量
  //   // excludeHeaders 是否排除headers
  // }
};

/**
 * @description 检查是否为相对路径url
 */
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

/**
 * @description url合并
 */
function combineURLs(baseURL, relativeURL) {
  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
}

/**
 * @description 路由拦截器
 */

var InterceptorManager =
/*#__PURE__*/
function () {
  function InterceptorManager() {
    _classCallCheck(this, InterceptorManager);

    this.handlers = [];
  }

  _createClass(InterceptorManager, [{
    key: "use",
    value: function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    }
  }, {
    key: "eject",
    value: function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    }
  }, {
    key: "reducer",
    value: function reducer(fn) {
      forEach(this.handlers, function (h) {
        h !== null && fn(h);
      });
    }
  }]);

  return InterceptorManager;
}();

/**
 * @author caominjie
 * @description 缓存类
 */
var Cacher =
/*#__PURE__*/
function () {
  function Cacher() {
    var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Cacher);

    this.cacheMap = new Map();
    this.expire = option.expire || 1000 * 60 * 5;
    this.maxCacheSize = option.maxCacheSize || 15;
    this.excludeHeaders = option.excludeHeaders || true;
  }

  _createClass(Cacher, [{
    key: "setCache",
    value: function setCache(key, val) {
      var _this = this;

      this.cacheMap.set(key, val);

      if (this.maxCacheSize && this.cacheMap.size > this.maxCacheSize) {
        this.cacheMap.delete(this.cacheMap.keys().next().value);
      }

      if (this.expire) {
        setTimeout(function () {
          if (_this.hasCache(key)) {
            _this.cacheMap.delete(key);
          }
        }, this.expire);
      }
    }
  }, {
    key: "hasCache",
    value: function hasCache(key) {
      return this.cacheMap.has(key);
    }
  }, {
    key: "getCache",
    value: function getCache(key) {
      return this.cacheMap.get(key);
    }
  }]);

  return Cacher;
}();

var defaultConcurrency = 5;

function setConcurrencyCount() {
  var concurrency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConcurrency;
  return concurrency && concurrency.constructor === Number ? concurrency : defaultConcurrency;
} // 回调结束置空


var setCall = function setCall(fn) {
  return function () {
    if (!fn) {
      throw new Error('repeating call has been denied.');
    }

    var call = fn;
    fn = null;
    return call.apply(void 0, arguments);
  };
};

function getRequestQueue(call, concurrency) {
  concurrency = setConcurrencyCount(concurrency); // 挂起

  var waitingList = []; // 执行

  var executionList = [];
  return function () {
    var model = {
      concurrency: concurrency,
      push: function push(currentRequest, call) {
        waitingList.push({
          currentRequest: currentRequest,
          call: call
        });
        this.excute();
      },
      excute: function excute() {
        var _this = this;

        var _loop = function _loop() {
          // 将挂起队列中请求推进执行队列
          var apiModel = waitingList.shift();
          executionList.push(apiModel);
          call(apiModel.currentRequest, setCall(function () {
            _this.changeQueue(apiModel);

            if (apiModel.call) {
              apiModel.call.constructor === Function && apiModel.call.apply(apiModel, arguments);
            } // 发起请求


            _this.excute();
          }));
        };

        while (this.concurrency > executionList.length && waitingList.length) {
          _loop();
        }
      },
      changeQueue: function changeQueue(apiModel) {
        // 从执行队列移除
        var index = executionList.indexOf(apiModel);

        if (index !== -1) {
          executionList.splice(index, 1);
        }
      }
    };
    return model;
  };
}

function setConcurrencyRequest(request) {
  var concurrency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultConcurrency;

  if (typeof request !== 'function') {
    throw Error('request must be function');
  }

  var queue = getRequestQueue(function (currentRequest, call) {
    return currentRequest(call);
  }, concurrency)();
  return function (apiArgs) {
    queue.push(function (call) {
      var complete = apiArgs.complete;

      apiArgs.complete = function () {
        // 请求完成
        call();

        if (complete) {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          complete.constructor === Function && complete.apply(apiArgs, args);
        }
      };

      request(apiArgs);
    });
  };
}

var concurrency = 10;
var request;

try {
  request = wx && setConcurrencyRequest(wx.request, concurrency);
} catch (error) {}

function wxAdapter(config) {
  return new Promise(function (resolve, reject) {
    var url = config.url,
        data = config.data,
        body = config.body,
        method = config.method,
        headers = config.headers;
    request({
      url: url,
      data: data || body || {},
      header: headers,
      method: method.toUpperCase(),
      success: function success(res) {
        if (res.statusCode !== 200) {
          reject(_objectSpread({}, res, config));
        } else {
          resolve(_objectSpread({}, res, config));
        }
      },
      fail: function fail(e) {
        reject(_objectSpread({}, e, config));
      }
    });
  });
}

function h5Adapter (config) {
  var url = config.url,
      options = _objectWithoutProperties(config, ["url"]);

  return fetch(url, options);
}

/**
 * @description 获取环境信息
 */
var isWxMiniProgram = function isWxMiniProgram() {
  try {
    return !!wx && wx.request;
  } catch (error) {
    return false;
  }
};

var requestInstance = null;
function dispatchRequest(config) {
  if (!requestInstance) {
    requestInstance = createDispatchRequest();
  }

  return requestInstance(config);
}

var createDispatchRequest = function createDispatchRequest() {
  return isWxMiniProgram() ? wxAdapter : h5Adapter;
};

function Tahm(defaultConfig) {
  this.defaults = merge({}, defaultConfig);
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
  this.cacher = new Cacher();
}

Tahm.prototype.request = function (config) {
  var _this = this;

  if (isString(config)) {
    config = merge( // eslint-disable-next-line
    {
      url: arguments[0]
    }, arguments[1]);
  }

  config = merge(defaults, this.defaults, {
    method: 'POST'
  }, config); // todo

  var _ref = config.bixinConfig || {},
      cacheControl = _ref.cacheControl;

  var _merge = merge(this.cacher, cacheControl),
      cache = _merge.cache,
      cacheIgnore = _merge.cacheIgnore,
      beforeSetCache = _merge.beforeSetCache;

  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  config.headers = merge({}, config.headers || {});
  var promise = Promise.resolve(config);
  var chain = [dispatchRequest, undefined];
  var needCache = typeof cacheIgnore === 'function' ? cacheIgnore(config) : cacheIgnore;

  if (needCache && cache) {
    var simpleConfig = "".concat(config.url).concat(JSON.stringify(config.data || config.body));

    if (this.cacher.hasCache(simpleConfig)) {
      var cacheResponse = this.cacher.getCache(simpleConfig);
      chain.splice(0, 1, function () {
        return cacheResponse;
      });
    } else {
      chain.push.apply(chain, [function (response) {
        var beforeSetCacheHook = beforeSetCache && beforeSetCache(response) || true;
        beforeSetCacheHook && _this.cacher.setCache(simpleConfig, response);
        return response;
      }, undefined]);
    }
  }

  this.interceptors.request.reducer(function (_ref2) {
    var fulfilled = _ref2.fulfilled,
        rejected = _ref2.rejected;
    return chain.unshift(fulfilled, rejected);
  });
  this.interceptors.response.reducer(function (_ref3) {
    var fulfilled = _ref3.fulfilled,
        rejected = _ref3.rejected;
    return chain.push(fulfilled, rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

/**
 * @description currying断言
 */
var assert = function assert(condition, msg) {
  if (!condition) throw new Error("[invoke request error]: ".concat(msg));
};

function createInstance(defaultConfig) {
  var ctx = new Tahm(defaultConfig);
  var instance = bind(Tahm.prototype.request, ctx);
  extend(instance, Tahm.prototype, ctx);
  extend(instance, ctx);
  return instance;
}

var tahm = createInstance();

tahm.use = function (fn) {
  assert(isFunction(fn), 'use plugin must be function');
  fn(tahm);
};

module.exports = tahm;
