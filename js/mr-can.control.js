const gElCanvas = document.querySelector('.the-canvas')
const gCtx = gElCanvas.getContext('2d')

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

let gLastPos
let gLineCount
let gCustomStart




function onInit() {
    resizeCanvas()
    addListeners()
    reset()
}

function addListeners() {
    addMouseListeners()
    addTouchListeners()
    window.addEventListener('resize', resizeCanvas)
    // gElCanvas.addEventListener('click',draw())
}
function addMouseListeners() {
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchend', onUp)
}


function onDown(ev) {
    const pos = getEvPos(ev)
    gLastPos = pos
    setIsPainting(true)
    console.log('pos:', pos)
    if (!getTool().brush) draw(pos)
}

function onMove(ev) {
    if (!getIsPainting() || !getTool().brush) return

    const pos = getEvPos(ev)
    draw(pos)
    gLastPos = pos
}

function onUp() {
    setIsPainting(false)
    if (getTool().brush) gLineCount = 0
    // document.body.style.cursor = 'grab'
}

function getEvPos(ev) {

    let pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    }

    if (TOUCH_EVS.includes(ev.type)) {
        // Prevent triggering the mouse ev
        ev.preventDefault()
        // Gets the first touch point
        ev = ev.changedTouches[0]
        // Calc the right pos according to the touch screen
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        }
    }
    return pos
}

function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
}

function onClearCanvas() {
    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
}



function draw({ x, y }) {

    const { clrStroke, clrFill, shape, brush } = getTool()
    switch (shape) {
        case 'custom':
            drawCustom(x, y, clrStroke, clrFill)
            break
        case 'rect':
            drawRect(x, y, clrStroke, clrFill, brush)
            break
        case 'circle':
            drawCircle(x, y, clrStroke, clrFill, brush)
            break
        case 'img':
            drawImage(x, y, clrStroke, clrFill, brush)
            break
        case 'line':
            drawLine(x, y, clrStroke, brush)
            break
    }
}

function drawCircle(x, y, clrStroke, clrFill, brush) {
    const dist = (brush) ? calcDistance(x, y, gLastPos) : 25
    console.log('dist:', dist)

    gCtx.beginPath()
    gCtx.arc(x, y, dist, 0, Math.PI * 2)
    gCtx.lineWidth = 2
    gCtx.fillStyle = clrFill
    gCtx.fill()
    gCtx.strokeStyle = clrStroke
    gCtx.stroke()
}


function drawRect(x, y, clrStroke, clrFill, brush) {
    const dist = (brush) ? calcDistance(x, y, gLastPos) : 50
    console.log('x:', x)
    console.log('y:', y)
    gCtx.lineWidth = 2
    gCtx.strokeStyle = clrStroke
    gCtx.strokeRect(x - dist / 2, y - dist / 2, dist, dist)
    gCtx.fillStyle = clrFill
    gCtx.fillRect(x - dist / 2, y - dist / 2, dist, dist)
}

function drawLine(x, y, clrStroke, brush) {
    if (gLineCount === 0) {
        gCtx.beginPath()
        gCtx.moveTo(x, y)
        gLineCount++
    } else {
        gCtx.lineTo(x, y)
        gCtx.lineWidth = 3
        gCtx.strokeStyle = clrStroke
        gCtx.stroke()
        if (!brush) gLineCount = 0
    }
}
function drawCustom(x, y, clrStroke,clrFill) {
    if (gLineCount === 0) {
        gCtx.beginPath()
        gCtx.moveTo(x, y)
        gLineCount++
        gCtx.lineWidth = 3
        gCtx.strokeStyle = clrStroke
        gCtx.fillStyle = clrFill
        gCustomStart = { x, y }

    } else if (calcDistance(x, y, gCustomStart) < 30) {
        gCtx.closePath()
        gCtx.stroke()
        gCtx.fill()
    } else {
        gCtx.lineTo(x, y)
        gCtx.stroke()
    }

    // if (!brush) gLineCount = 0
    console.log('hi1');
}


function onSetTool(tool) {
    gLineCount = 0
    setTool(tool)
}
function downloadCanvas(elLink) {

    const data = gElCanvas.toDataURL()

    elLink.href = data
    elLink.download = 'painting'

}
function calcDistance(x, y, pos) {
    var dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2))
    console.log('dist:', dist)
    return dist
}

function reset() {
    const elToolbar = document.querySelector('.toolbar')
    elToolbar.querySelector('#clrStroke').value = '#000000'
    elToolbar.querySelector('#clrFill').value = '#ffffff'
    elToolbar.querySelector('#brush').checked = false
    elToolbar.querySelector('#shape').value = ''
}

function onUploadImg() {
    // Gets the image from the canvas
    const imgDataUrl = gElCanvas.toDataURL('image/jpeg') 

    function onSuccess(uploadedImgUrl) {
        // Handle some special characters
        const url = encodeURIComponent(uploadedImgUrl)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${url}`)
    }
    
    // Send the image to the server
    doUploadImg(imgDataUrl, onSuccess)
}

// Upload the image to a server, get back a URL 
// call the function onSuccess when done
function doUploadImg(imgDataUrl, onSuccess) {
    // Pack the image for delivery
    const formData = new FormData()
    formData.append('img', imgDataUrl)

    // Send a post req with the image to the server
    const XHR = new XMLHttpRequest()
    XHR.onreadystatechange = () => {
        // If the request is not done, we have no business here yet, so return
        if (XHR.readyState !== XMLHttpRequest.DONE) return
        // if the response is not ok, show an error
        if (XHR.status !== 200) return console.error('Error uploading image')
        const { responseText: url } = XHR
        // Same as
        // const url = XHR.responseText

        // If the response is ok, call the onSuccess callback function, 
        // that will create the link to facebook using the url we got
        console.log('Got back live url:', url)
        onSuccess(url)
    }
    XHR.onerror = (req, ev) => {
        console.error('Error connecting to server with request:', req, '\nGot response data:', ev)
    }
    XHR.open('POST', '//ca-upload.com/here/upload.php')
    XHR.send(formData)
}

function onImgInput(ev) {
    loadImageFromInput(ev, renderImg)
}

// Read the file from the input
// When done send the image to the callback function
function loadImageFromInput(ev, onImageReady) {
    const reader = new FileReader()

    reader.onload = function (event) {
        let img = new Image() 
        img.src = event.target.result 
        img.onload = () => onImageReady(img)
    }
    reader.readAsDataURL(ev.target.files[0]) 
}

function renderImg(img) {
    // Draw the img on the canvas
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
}