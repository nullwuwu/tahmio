interface handlersGeneric {
    fulfilled?: Function
    rejected?: Function
}

export interface Interceptor {
    use(fulfilled?: Function, rejected?: Function): number
    eject(id: number): void
    reducer(fn: Function): void
}

/**
 * @class 拦截器
 */
class InterceptorManager implements Interceptor{
    handlers: Array<handlersGeneric>

    constructor() {
        this.handlers = []
    }

    use(fulfilled?:Function, rejected?:Function) {
        this.handlers.push({
            fulfilled,
            rejected
        })

        return this.handlers.length - 1
    }

    eject(id: number) {
        if (this.handlers[id]) {
            this.handlers[id] = null
        }
    }

    reducer(fn: Function) {
        this.handlers.forEach(v => fn(v))
    }
}

export default InterceptorManager