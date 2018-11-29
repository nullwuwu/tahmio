import { isString, isFunction, merge } from '../utils'

import defaults from '../defaults'

import isAbsoluteURL from '../helpers/isAbsoluteURL'
import combineURL from '../helpers/combineURL'

import InterceptorManager from './interceptorManager'
import CacherManager from './cacher'
import dispatchRequest from './dispatchRequest'

function Tahm(defaultConfig) {
  this.defaults = merge({}, defaultConfig)

  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  }

  this.cacher = new CacherManager()
}

Tahm.prototype.request = function (config) {
  if (isString(config)) {
    config = merge(
      // eslint-disable-next-line
      { url: arguments[0] }, arguments[1]
    )
  }

  config = merge(defaults, this.defaults, { method: 'POST' }, config)

  // todo
  const { cacheControl } = config.bixinConfig || {}
  const { cache, cacheIgnore, beforeSetCache } = merge(this.cacher, cacheControl)

  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURL(config.baseURL, config.url)
  }

  config.headers = merge({}, config.headers || {})

  let promise = Promise.resolve(config)

  const chain = [dispatchRequest, undefined]

  const needCache = typeof cacheIgnore === 'function' ? cacheIgnore(config) : cacheIgnore

  if (needCache && cache) {
    const simpleConfig = `${config.url}${JSON.stringify(config.data || config.body)}`

    if (this.cacher.hasCache(simpleConfig)) {
      const cacheResponse = this.cacher.getCache(simpleConfig)

      chain.splice(0, 1, () => {
        return cacheResponse
      })

    } else {
      chain.push(...[(response) => {
        const beforeSetCacheHook = beforeSetCache && beforeSetCache(response) || true

        beforeSetCacheHook && this.cacher.setCache(simpleConfig, response)

        return response
      }, undefined])
    }
  }

  this.interceptors.request.reducer(({ fulfilled, rejected }) =>
    chain.unshift(fulfilled, rejected)
  )
  this.interceptors.response.reducer(({ fulfilled, rejected }) =>
    chain.push(fulfilled, rejected)
  )

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift())
  }

  return promise
}

export default Tahm