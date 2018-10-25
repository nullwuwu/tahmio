/**
 * @description 检查是否为相对路径url
 */
export default function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}
