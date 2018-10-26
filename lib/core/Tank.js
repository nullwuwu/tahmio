import { isString, isFunction, merge } from '../utils'

import defaults from '../defaults'

import assert from '../helpers/assert'
import isAbsoluteURL from '../helpers/isAbsoluteURL'
import combineURL from '../helpers/combineURL'

import InterceptorManager from './interceptorManager'
import dispatchRequest from './dispatchRequest'

function Tank(defaultConfig) {
  this.defaults = merge({}, defaultConfig)

  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  }
}

Tank.prototype.request = function (config) {
  if (isString(config)) {
    config = merge(
      // eslint-disable-next-line
      { url: arguments[0] }, arguments[1]
    )
  }

  config = merge(defaults, this.defaults, { method: 'POST' }, config)

  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURL(config.baseURL, config.url)
  }

  config.headers = merge({}, config.headers || {})

  const chain = [dispatchRequest, undefined]
  let promise = Promise.resolve(config)

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

export default Tank