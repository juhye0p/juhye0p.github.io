// colorscheme.js
let switchHandle = document.querySelector('#switch-color-scheme')
let themeIcon = document.querySelector('#theme-icon')
var html = document.documentElement

const switchMode = () => {
    let attr = html.getAttribute('color-mode')
    let colorMode = attr === 'light' ? 'dark' : 'light'
    html.setAttribute('color-mode', colorMode)
    themeIcon.classList = colorMode === 'dark' ? 'iconfont icon-sun' : 'iconfont icon-moon'
    localStorage.setItem('color-mode', colorMode)
}

switchHandle.addEventListener('click', switchMode, false)

const currColorMode = localStorage.getItem('color-mode')
if (currColorMode === 'light') {
    html.setAttribute('color-mode', 'light')
    themeIcon.classList = 'iconfont icon-moon'
} else {
    html.setAttribute('color-mode', 'dark')
    themeIcon.classList = 'iconfont icon-sun'
}
