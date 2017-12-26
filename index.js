let timerId = null
let now = 0
let delay = 120

const mutation = new MutationObserver(function (e) {
  // 兜底，防止线程阻塞导致 setTimeout 出现误差
  if (performance.now() - now <= delay) {
    now = 0
    clearTimeout(timerId)
  }
})
mutation.observe(document.documentElement, {childList: true, subtree: true, attributes: true})
document.documentElement.addEventListener('click', function (e) {
  console.log('---0')
  now = performance.now()
  timerId = setTimeout(function () {
    if (now === 0) {
      // 线程阻塞过，严重级别加大
    }
    alert(e.pageY)
  }, delay)
}, true)

const style = document.createElement('style')
style.appendChild(document.createTextNode('* { cursor: pointer }'))
document.head.appendChild(style)