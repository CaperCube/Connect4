import Canvas from 'canvas'

export default class CanvasApp {
    constructor(size = {x: 512, y: 512}) {
        // Canvas vars
        this.canvas = Canvas.createCanvas(size.x, size.y)
        this.ctx = this.canvas.getContext('2d')
        this.cw = this.canvas.width
        this.ch = this.canvas.height
    }

    ////////////////////////////////////////////////////
    // Change Size
    ////////////////////////////////////////////////////
    ChangeSize(size = {x: 512, y: 512}) {
        this.cw = this.canvas.width = size.x
        this.ch = this.canvas.height = size.y
        this.ctx.clearRect(0, 0, this.cw, this.ch)
    }

    ////////////////////////////////////////////////////
    // Draw Shapes
    ////////////////////////////////////////////////////

    // Draw round rect
    RoundRect(x = 0, y = 0, width = 20, height = 20, color = "#ffffff", radius = 10, fill = true, stroke = false) {
        this.ctx.fillStyle = color
        
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius}
        }
        
        else {
            var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0}
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side]
            }
        }
        
        this.ctx.beginPath()
        this.ctx.moveTo(x + radius.tl, y)
        this.ctx.lineTo(x + width - radius.tr, y)
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
        this.ctx.lineTo(x + width, y + height - radius.br)
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
        this.ctx.lineTo(x + radius.bl, y + height)
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
        this.ctx.lineTo(x, y + radius.tl)
        this.ctx.quadraticCurveTo(x, y, x + radius.tl, y)
        this.ctx.closePath()
        
        if (fill) {
            this.ctx.fill()
        }
        if (stroke) {
            this.ctx.stroke()
        }
    }

    // Draw filled circle
    DrawCircle(color, x, y, r) {
        this.ctx.fillStyle = color
        this.ctx.beginPath()
        this.ctx.arc(x, y, r, 0, 2 * Math.PI)
        this.ctx.closePath()
        this.ctx.fill()
    }

    // Erase with circle and context
    EraseCircle(x, y, r) {
        this.ctx.save()
        
        this.ctx.beginPath()
        this.ctx.arc(x, y, r, 0, 2 * Math.PI)
        this.ctx.closePath()
        this.ctx.clip()
        this.ctx.clearRect(0, 0, this.cw, this.ch)
        
        this.ctx.restore()
    }

    ////////////////////////////////////////////////////
    // Draw Images
    ////////////////////////////////////////////////////

    // Draw round image
    DrawRoundImage(img, color, x, y, r) {
        this.ctx.save() // save the context
        this.ctx.beginPath()
        this.ctx.arc(x, y, r, 0, 2 * Math.PI)
        this.ctx.closePath()
        this.ctx.clip()

        try {
            this.ctx.drawImage(img, x-r, y-r, r*2, r*2)
        } catch {
            //console.log('Unable to draw this image');
            this.ctx.fillStyle = color
            this.ctx.fillRect(x-r, y-r, r*2, r*2)
        }

        this.ctx.restore() // Stop clipping
    }

    // Draw Card
    DrawCard(c, cardSuits, cardSuitImages) {
        // Setup canvas
        this.ChangeSize({x: 170, y: 256})
        
        // Draw base
        this.RoundRect(0, 0, this.cw, this.ch, "#ddd", 20, true, false)
        this.RoundRect(10, 10, this.cw-20, this.ch-20, "#eee", 15, true, false)
        
        // Draw number and suit
        if (c.suit == cardSuits[0] || c.suit == cardSuits[1]) this.ctx.fillStyle = "#e00"
        else if (c.suit == cardSuits[2] || c.suit == cardSuits[3]) this.ctx.fillStyle = "#444"
        this.ctx.font = 'bold 40px sans-serif'
        this.ctx.fillText(c.card, 25, 55)
        
        // Draw symbol
        this.ctx.drawImage(cardSuitImages[c.suitIndex], 25, 65, 30, 30)
        console.log("Card drawn")

        // Create discord attatchment
        return this.GetCanvasData()
    }

    ////////////////////////////////////////////////////
    // Load Images
    ////////////////////////////////////////////////////

    async LoadUserAvatar(user, then) {
        const uAvatar = user.displayAvatarURL({dynamic: true, format: "png"})
        try {
            if (profilePic) {
                const profilePic = await Canvas.loadImage(uAvatar)
                then(profilePic)
            }
        } catch {
            console.log('Unable to load this image')
        }
    }

    ////////////////////////////////////////////////////
    // Get canvas data / image
    ////////////////////////////////////////////////////
    GetCanvasData() {
        return this.canvas.toBuffer()
    }
    
}