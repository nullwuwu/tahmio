const defaultConcurrency = 5

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

  const call = fn
  fn = null

  return call(...args)
}

function getRequestQueue(call, concurrency) {
  concurrency = setConcurrencyCount(concurrency)

  // 挂起
  const waitingList = []
  // 执行
  const executionList = []

  return function() {
    const model = {
      concurrency,
      push(currentRequest, call) {
        waitingList.push({
          currentRequest,
          call
        })

        this.excute()
      },
      excute() {
        while (this.concurrency > executionList.length && waitingList.length) {
          // 将挂起队列中请求推进执行队列
          const apiModel = waitingList.shift()
          executionList.push(apiModel)
          call(
            apiModel.currentRequest,
            setCall((...args) => {
              this.changeQueue(apiModel)
              if (apiModel.call) {
                apiModel.call.constructor === Function && apiModel.call(...args)
              }

              // 发起请求
              this.excute()
            })
          )
        }
      },
      changeQueue(apiModel) {
        // 从执行队列移除
        const index = executionList.indexOf(apiModel)

        if (index !== -1) {
          executionList.splice(index, 1)
        }
      }
    }

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
  )()

  return apiArgs => {
    queue.push(call => {
      const complete = apiArgs.complete

      apiArgs.complete = (...args) => {
        // 请求完成
        call()
        if (complete) {
          complete.constructor === Function && complete.apply(apiArgs, args)
        }
      }

      request(apiArgs)
    })
  }
}

module.exports = setConcurrencyRequest
