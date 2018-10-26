import Tank from './core/Tank'

import { bind, extend } from './utils'

function createInstance(defaultConfig) {
  const ctx = new Tank(defaultConfig)
  const instance = bind(Tank.prototype.request, ctx)

  extend(instance, Tank.prototype, ctx)
  extend(instance, ctx)

  return instance
}

const tank = createInstance()

tank.use = function(fn) {
  assert(isFunction(fn), 'use plugin must be function')

  fn(tank)
}

export default tank

module.exports = tank
