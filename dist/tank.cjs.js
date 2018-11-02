'use strict';

const isString = val => {
  return typeof val === 'string'
};

const isFunction$1 = fn => {
  return typeof fn === 'function'
};

const isObject = val => {
  return val && typeof val === 'object'
};

const isArray = val => {
  return toString.call(val) === '[object Array]'
};

const forEach = (obj, fn) => {
  if (obj === null || typeof obj === 'undefined') {
    return
  }

  if (typeof obj !== 'object' && !isArray(obj)) {
    obj = [obj];
  }

  if (isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      fn(obj[i], i, obj);
    }
  } else {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn(obj[key], key, obj);
      }
    }
  }
};

const merge = (...arg) => {
  const result = {};

  function assignValue(v, k) {
    if (isObject(result[k]) && isObject(v)) {
      result[k] = merge(result[k], v);
    } else {
      result[k] = v;
    }
  }

  const len = arg.length;

  for (let i = 0; i < len; i++) {
    forEach(arg[i], assignValue);
  }

  return result
};

const bind = (fn, ctx) => {
  return function wrap() {
    const args = [].slice.call(arguments, 0);

    return fn.apply(ctx, args)
  }
};

const extend = (target, source, ctx) => {
  forEach(source, (val, key) => {
    if (ctx && isFunction$1(val)) {
      target[key] = bind(val, ctx);
    } else {
      target[key] = val;
    }
  });

  return target
};

var defaults = {};

/**
 * @description currying断言
 */

const assert$1 = (condition, msg) => {
  if (!condition) throw new Error(`[invoke request error]: ${msg}`)
};

/**
 * @description 检查是否为相对路径url
 */
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

/**
 * @description url合并
 */
function combineURLs(baseURL, relativeURL) {
  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
}

/**
 * @description 路由拦截器
 */
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }

  use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled,
      rejected
    });

    return this.handlers.length - 1
  }

  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  reducer(fn) {
    forEach(this.handlers, h => {
      h !== null && fn(h);
    });
  }
}

const concurrency = 10;

assert$1(wx && wx.request, 'plz check env');

const request = require('./../core/concurrency')(wx.request, concurrency);

function wxAdapter(resolve, reject, config) {
  const { url, data, body, method, headers } = config;

  request({
    url,
    data: data || body || {},
    header: headers,
    method: method.toUpperCase(),
    success: function(res) {
      if (res.statusCode !== 200) {
        reject({ ...res, ...config });
      } else {
        resolve({ ...res, ...config });
      }
    },
    fail: function(e) {
      reject({ ...e, ...config });
    }
  });
}

function dispatchRequest(config) {
  return new Promise((resolve, reject) => {
    try {
      wxAdapter(resolve, reject, config);
    } catch (e) {
      reject(e);
    }
  })
}

function Tank(defaultConfig) {
  this.defaults = merge({}, defaultConfig);

  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

Tank.prototype.request = function (config) {
  if (isString(config)) {
    config = merge(
      // eslint-disable-next-line
      { url: arguments[0] }, arguments[1]
    );
  }

  config = merge(defaults, this.defaults, { method: 'POST' }, config);

  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  config.headers = merge({}, config.headers || {});

  const chain = [dispatchRequest, undefined];
  let promise = Promise.resolve(config);

  this.interceptors.request.reducer(({ fulfilled, rejected }) =>
    chain.unshift(fulfilled, rejected)
  );
  this.interceptors.response.reducer(({ fulfilled, rejected }) =>
    chain.push(fulfilled, rejected)
  );

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise
};

function createInstance(defaultConfig) {
  const ctx = new Tank(defaultConfig);
  const instance = bind(Tank.prototype.request, ctx);

  extend(instance, Tank.prototype, ctx);
  extend(instance, ctx);

  return instance
}

const tank = createInstance();

tank.use = function(fn) {
  assert(isFunction(fn), 'use plugin must be function');

  fn(tank);
};

module.exports = tank;

module.exports = tank;
