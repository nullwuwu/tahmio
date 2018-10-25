/**
 * @description currying断言
 */

const assert = (condition, msg) => {
  if (!condition) throw new Error(`[invoke request error]: ${msg}`)
}

export default assert
