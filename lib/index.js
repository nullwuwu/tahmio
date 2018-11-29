import Tahm from './core/Tahm'

import assert from './helpers/assert'

import { bind, extend, isFunction } from './utils'

function createInstance(defaultConfig) {
  const ctx = new Tahm(defaultConfig)
  const instance = bind(Tahm.prototype.request, ctx)

  extend(instance, Tahm.prototype, ctx)
  extend(instance, ctx)

  return instance
}

const tahm = createInstance()

tahm.use = function(fn) {
  assert(isFunction(fn), 'use plugin must be function')

  fn(tahm)
}

export default tahm
