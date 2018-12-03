/**
 * @description 获取环境信息
 */

export const isWxMiniProgram = () => {
    try {
      return !!wx && wx.request
    } catch (error) {
      return false 
    }
  }