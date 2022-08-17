//ToDo: Make this an import
const Canvas = require('canvas')

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Canvas init
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/
var canvas = Canvas.createCanvas(512, 512)
var ctx = canvas.getContext('2d')
var cw, ch
cw = ch = canvas.width = canvas.height

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Drawing Functions
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/

/*////////////////////////////////////////////////////////////////////
// Shapes
////////////////////////////////////////////////////////////////////*/

// Draw round rect
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
        stroke = true
    }
    
    if (typeof radius === 'undefined') {
        radius = 5
    }
    
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius}
    }
    
    else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0}
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side]
        }
    }
    
    ctx.beginPath()
    ctx.moveTo(x + radius.tl, y)
    ctx.lineTo(x + width - radius.tr, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
    ctx.lineTo(x + width, y + height - radius.br)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
    ctx.lineTo(x + radius.bl, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
    ctx.lineTo(x, y + radius.tl)
    ctx.quadraticCurveTo(x, y, x + radius.tl, y)
    ctx.closePath()
    
    if (fill) {
        ctx.fill()
    }
    if (stroke) {
        ctx.stroke()
    }
}

// Draw filled circle
function DrawCircle(color, x, y, r) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
}

// Draw filled circle, custom ctx
function DrawCircleCtx(cctx, color, x, y, r) {
    cctx.fillStyle = color
    cctx.beginPath()
    cctx.arc(x, y, r, 0, 2 * Math.PI)
    cctx.closePath()
    cctx.fill()
}

// Erase with filled circle
function EraseCircle(x, y, r) {
    ctx.save()
    
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.clip()
    ctx.clearRect(0,0,cw,ch)
    
    ctx.restore()
}

// Erase with circle and context
function EraseCircleCtx(cctx, x, y, r) {
    let ccw = cctx.canvas.width
    let cch = cctx.canvas.height

    cctx.save()
    
    cctx.beginPath()
    cctx.arc(x, y, r, 0, 2 * Math.PI)
    cctx.closePath()
    cctx.clip()
    cctx.clearRect(0,0,ccw,cch)
    
    cctx.restore()
}

/*////////////////////////////////////////////////////////////////////
// Images
////////////////////////////////////////////////////////////////////*/

// Draw round image
function DrawRoundImage(img, color, x, y, r) {
    ctx.save() // save the context
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.clip()

    try {
        ctx.drawImage(img, x-r, y-r, r*2, r*2)
    } catch {
        //console.log('Unable to draw this image');
        ctx.fillStyle = color
        ctx.fillRect(x-r, y-r, r*2, r*2)
    }

    ctx.restore() // Stop clipping
}

// Draw Card
function DrawCard(c) {
    // Setup canvas
    ch = canvas.height = 256
    cw = canvas.width = 170
    ctx.clearRect(0,0,cw,ch)
    
    // Draw base
    ctx.fillStyle = "#ddd"
    roundRect(ctx, 0, 0, cw, ch, 20, true, false)
    ctx.fillStyle = "#eee"
    roundRect(ctx, 10, 10, cw-20, ch-20, 15, true, false)
    
    // Draw number and suit
    if (c.suit == cardSuits[0] || c.suit == cardSuits[1]) ctx.fillStyle = "#e00"
    else if (c.suit == cardSuits[2] || c.suit == cardSuits[3]) ctx.fillStyle = "#444"
    ctx.font = 'bold 40px sans-serif'
    ctx.fillText(c.card, 25, 55)
    
    // Draw symbol
    ctx.drawImage(cardSuitImages[c.suitIndex], 25, 65, 30, 30)
    console.log("Card drawn")

    // Create discord attatchment
    return new Discord.MessageAttachment(canvas.toBuffer(), 'Drawn_Card.png')
}




/////////////////////////
// Refactor
/////////////////////////

class CanvasApp {
    constructor() {
        // canvas
        // ctx
        // cw
        // ch
    }

    // Change size

    // Draw functions

    // Get canvas data / image
}