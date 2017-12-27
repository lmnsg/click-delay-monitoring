let start = 0
let timer = null
let log = {}
const filter = ['body','select', 'input']
const maxDelay = 1000

let delay = 200
let requestUrl = ''

const isIos = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

function post(body) {
  console.log(JSON.stringify(body))
  return window.fetch(requestUrl, {
    method: 'post',
    body: JSON.stringify(body)
  })
}

function report(log) {
  if (!log.time) log.time = maxDelay
  post(log)
  clean()
}

function clean() {
  start = 0
  log = {}
  clearTimeout(timer)
}

function hackSafari() {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode('body { cursor: pointer }'))
  document.head.appendChild(style)
}

function observerCb() {
  if (!start) return

  // 点击触发后第一次 dom 变化消耗的时间
  const time = log.time = performance.now() - start

  if (time > delay) {
    report(log)
  } else {
    clean()
  }
}

function capture(e) {
  const { pageX, pageY, target, target: { tagName, name, className, id, textContent } } = e
  const lowerTagName = tagName.toLowerCase()
  if (filter.includes(lowerTagName)) return

  start = performance.now()
  Object.assign(log, {
    pageX,
    pageY,
    tagName: lowerTagName,
    name,
    className,
    id,
    textContent: textContent.substr(0, 10),
    url: location.href
  })

  // 1s 未发生 dom 变化则自动上报
  timer = setTimeout(() => report(log), maxDelay)
}

function monitoring() {
  const rootEl = document.documentElement
  const observer = new MutationObserver(observerCb)

  // hack: ios 无法对未监听过 click 事件的非原生可点击元素进行事件委托
  if (isIos) hackSafari()

  observer.observe(rootEl, { childList: true, attributes: true, subtree: true })
  rootEl.addEventListener('click', capture, true)
}

monitoring()