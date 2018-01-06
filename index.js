const timers = []
const filter = ['body', 'select', 'input']
const maxDelay = 1000

let delay = 200
let requestUrl = ''

const isIos = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

function post (body) {
  return window.fetch(requestUrl, {
    method: 'post',
    body: JSON.stringify(body)
  })
}

function report (log) {
  post(log)
}

function clean () {
  timers.length = 0
}

function hackSafari () {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode('body { cursor: pointer }'))
  document.head.appendChild(style)
}

function observerCb () {
  if (!timers.length) return
  const now = performance.now()

  const {timer, start, log} = timers.shift()
  const time = log.time = now - start
  if (time > delay) {
    report(log)
  }
  clearTimeout(timer)
}

function capture (e) {
  const {pageX, pageY, target, target: {tagName, name, className, id, textContent}} = e
  const lowerTagName = tagName.toLowerCase()
  if (filter.includes(lowerTagName)) return

  const start = performance.now()
  const log = {
    pageX,
    pageY,
    tagName: lowerTagName,
    name,
    className,
    id,
    textContent: textContent.substr(0, 10),
    url: location.href
  }
  const task = new Task({log, start})
  // 1s 未发生 dom 变化则自动上报
  timers.push(task)
}

function monitoring () {
  const rootEl = document.documentElement
  const observer = new MutationObserver(observerCb)

  // hack: ios 无法对未监听过 click 事件的非原生可点击元素进行事件委托
  if (isIos) hackSafari()

  observer.observe(rootEl, {childList: true, attributes: true, subtree: true})
  rootEl.addEventListener('click', capture, true)
}

monitoring()

class Task {
  constructor ({log, start}) {
    this.timer = setTimeout(() => {
      report(this.log)
      timers.splice(timers.findIndex(task => task === this), 1)
    }, maxDelay)
    this.log = log
    this.start = start
  }
}