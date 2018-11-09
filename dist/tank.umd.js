(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Tank = factory());
}(this, (function () { 'use strict';

  const isString = val => {
    return typeof val === 'string'
  };

  const isFunction = fn => {
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
      if (ctx && isFunction(val)) {
        target[key] = bind(val, ctx);
      } else {
        target[key] = val;
      }
    });

    return target
  };

  var defaults = {
    // cacheControl: {
    //   cache: true,
    //   // expire 过期时间
    //   // maxCacheSize 缓存量
    //   // excludeHeaders 是否排除headers
    // }
  };

  /**
   * @description currying断言
   */

  const assert = (condition, msg) => {
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

  /**
   * @author caominjie
   * @description 缓存类
   */

  class Cacher {
    constructor(option = {}) {
      this.cacheMap = new Map();

      this.expire = option.expire || 1000 * 60 * 5;
      this.maxCacheSize = option.maxCacheSize || 15;
      this.excludeHeaders = option.excludeHeaders || true;
    }

    setCache(key, val) {
      this.cacheMap.set(key, val);

      if (this.maxCacheSize && this.cacheMap.size > this.maxCacheSize) {
        this.cacheMap.delete(
          this.cacheMap.keys().next().value
        );
      }

      if (this.expire) {
        setTimeout(() => {
          if (this.hasCache(key)) {
            this.cacheMap.delete(key);
          }
        }, this.expire);
      }
    }

    hasCache(key) {
      return this.cacheMap.has(key)
    }

    getCache(key) {
      return this.cacheMap.get(key)
    }
  }

  const defaultConcurrency = 5;

  function setConcurrencyCount(concurrency = defaultConcurrency) {
    return concurrency && concurrency.constructor === Number
      ? concurrency
      : defaultConcurrency
  }

  // 回调结束置空
  const setCall = fn => (...args) => {
    if (!fn) {
      throw new Error('repeating call has been denied.')
    }

    const call = fn;
    fn = null;

    return call(...args)
  };

  function getRequestQueue(call, concurrency) {
    concurrency = setConcurrencyCount(concurrency);

    // 挂起
    const waitingList = [];
    // 执行
    const executionList = [];

    return function() {
      const model = {
        concurrency,
        push(currentRequest, call) {
          waitingList.push({
            currentRequest,
            call
          });

          this.excute();
        },
        excute() {
          while (this.concurrency > executionList.length && waitingList.length) {
            // 将挂起队列中请求推进执行队列
            const apiModel = waitingList.shift();
            executionList.push(apiModel);
            call(
              apiModel.currentRequest,
              setCall((...args) => {
                this.changeQueue(apiModel);
                if (apiModel.call) {
                  apiModel.call.constructor === Function && apiModel.call(...args);
                }

                // 发起请求
                this.excute();
              })
            );
          }
        },
        changeQueue(apiModel) {
          // 从执行队列移除
          const index = executionList.indexOf(apiModel);

          if (index !== -1) {
            executionList.splice(index, 1);
          }
        }
      };

      return model
    }
  }

  function setConcurrencyRequest(request, concurrency = defaultConcurrency) {
    if (typeof request !== 'function') {
      throw Error('request must be function')
    }

    const queue = getRequestQueue(
      (currentRequest, call) => currentRequest(call),
      concurrency
    )();

    return apiArgs => {
      queue.push(call => {
        const complete = apiArgs.complete;

        apiArgs.complete = (...args) => {
          // 请求完成
          call();
          if (complete) {
            complete.constructor === Function && complete.apply(apiArgs, args);
          }
        };

        request(apiArgs);
      });
    }
  }

  const concurrency = 10;

  assert(wx && wx.request, 'plz check env');

  const request = setConcurrencyRequest(wx.request, concurrency);

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

    this.cacher = new Cacher();
  }

  Tank.prototype.request = function (config) {
    if (isString(config)) {
      config = merge(
        // eslint-disable-next-line
        { url: arguments[0] }, arguments[1]
      );
    }

    config = merge(defaults, this.defaults, { method: 'POST' }, config);

    const { cacheControl } = config.bixinConfig;
    const cacheConfig = merge(this.cacher, cacheControl);

    if (config.baseURL && !isAbsoluteURL(config.url)) {
      config.url = combineURLs(config.baseURL, config.url);
    }

    config.headers = merge({}, config.headers || {});

    let promise = Promise.resolve(config);

    const chain = [dispatchRequest, undefined];

    const needCache = typeof cacheConfig.cache === 'function' ? cacheConfig.cache(config) : cacheConfig.cache;

    if (needCache) {
      const simpleConfig = `${config.url}${JSON.stringify(config.data || config.body)}`;

      if (this.cacher.hasCache(simpleConfig)) {
        const cacheResponse = this.cacher.getCache(simpleConfig);

        chain.splice(0, 1, () => {
          return cacheResponse
        });

      } else {
        chain.push(...[(response) => {
          this.cacher.setCache(simpleConfig, response);

          return response
        }, undefined]);
      }
    }

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

  return tank;

})));
