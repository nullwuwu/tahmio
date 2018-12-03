import Tahm from './core/Tahm'
import { bind, extend } from './utils';

function createInstance(): any{
  const context = new Tahm()
  const instance = bind(Tahm.prototype.request, context)

  extend(instance, Tahm.prototype, context)
  extend(instance, context, null)

  return instance
}

const tahm = createInstance()

tahm.use = function(plugin: Function) {
  plugin(tahm)
}

export default tahm