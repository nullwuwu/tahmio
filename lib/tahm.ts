import Tahm, { TahmDefaultConfig } from './core/Tahm'
import { bind, merge } from './utils';
import defaults from './defaults';


function createInstance(defaultConfig: TahmDefaultConfig): any{
  const context = new Tahm()
  const instance = bind(Tahm.prototype.request, context)
  // extend(instance, Tahm.prototype, context)
  // extend(instance, context, null)
  return instance
}

const tahm = createInstance(defaults)

tahm.Tahm = Tahm

tahm.create = function create(instanceConfig) {
  return createInstance(merge(defaults, instanceConfig));
};

tahm.use = function(plugin: Function) {
  if (typeof plugin !== "function") {
    return console.error(`[tahm error]: use plugin parameters must be a function`)
  }

  plugin(tahm)
}

export default tahm