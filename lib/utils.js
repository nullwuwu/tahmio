export const isString = val => {
  return typeof val === 'string'
}

export const isFunction = fn => {
  return typeof fn === 'function'
}

export const isObject = val => {
  return val && typeof val === 'object'
}

export const isArray = val => {
  return toString.call(val) === '[object Array]'
}

export const forEach = (obj, fn) => {
  if (obj === null || typeof obj === 'undefined') {
    return
  }

  if (typeof obj !== 'object' && !isArray(obj)) {
    obj = [obj]
  }

  if (isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      fn(obj[i], i, obj)
    }
  } else {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn(obj[key], key, obj)
      }
    }
  }
}

export const merge = (...arg) => {
  const result = {}

  function assignValue(v, k) {
    if (isObject(result[k]) && isObject(v)) {
      result[k] = merge(result[k], v)
    } else {
      result[k] = v
    }
  }

  const len = arg.length

  for (let i = 0; i < len; i++) {
    forEach(arg[i], assignValue)
  }

  return result
}

export const bind = (fn, ctx) => {
  return function wrap() {
    const args = [].slice.call(arguments, 0)

    return fn.apply(ctx, args)
  }
}

export const extend = (target, source, ctx) => {
  forEach(source, (val, key) => {
    if (ctx && isFunction(val)) {
      target[key] = bind(val, ctx)
    } else {
      target[key] = val
    }
  })

  return target
}