import Discord from 'discord.js'
import { getRandomInt } from './utils.js'

export default function GenerateFace(cApp, headImgs, eyeImgs, noseImgs, mouthImgs ) {
    cApp.ChangeSize({x: 512, y: 512})

    var h = getRandomInt(0, headImgs.length)
    var m = getRandomInt(0, mouthImgs.length)
    var n = getRandomInt(0, noseImgs.length)
    var e = getRandomInt(0, eyeImgs.length)
    
    var mouthPos = Math.random() * 100
    var mouthW = 100 + Math.random() * 230
    
    var eyeW = 80 + Math.random() * 100
    var eyePos = 20 + Math.random() * 50
    var eyeDist = 50 + Math.random() * 80
    
    var noseW = 100 + Math.random() * 100
    var nosePos = Math.random() * 50
    
    // Head
    cApp.ctx.drawImage(headImgs[h], 0, 0, 512, 512)
    // Mouth
    cApp.ctx.drawImage(mouthImgs[m], 256 - (mouthW/2), 200 + mouthPos, mouthW, 200)
    // Eyes
    cApp.ctx.drawImage(eyeImgs[e], 256 - ((eyeW/2) + eyeDist), 80 + eyePos, eyeW, eyeW * 0.8)
    cApp.ctx.save()
    cApp.ctx.scale(-1,1)
    cApp.ctx.drawImage(eyeImgs[e], -256 - ((eyeW/2) + eyeDist), 80 + eyePos, eyeW, eyeW * 0.8)
    cApp.ctx.restore()
    // nose
    cApp.ctx.drawImage(noseImgs[n], 256 - (noseW/2), 130 + nosePos, noseW, noseW)
    
    console.log("Face drawn")

    // Create discord attatchment
    const attachment = new Discord.MessageAttachment(cApp.GetCanvasData(), 'Strangers_Face.png')
    return attachment
}