import Discord from 'discord.js'
import CanvasApp from "./canvasApp.js"
import { getRandomInt, shuffle } from './utils.js'

export const playerColorArray = ["#ee1111", "#ffcc11", "#d400f9", "#1bed97", "#76aa3a", "#66509b", "#82c8d8", "#755a2c", "#e8b6ff", "#408184", "#ffd4a9", "#8c4f70"]

// List of valid spaces on connct4 board (not yet implemented)
export const c4Numbers = [
    `1`,
    `2`,
    `3`,
    `4`,
    `5`,
    `6`,
    `7`,
    `8`,
    `9`,
    `0`,
    `A`,
    `B`,
    `C`,
    `D`,
    `E`,
    `F`,
    `G`,
    `H`,
    `I`,
    `J`,
    `K`,
    `L`,
    `M`,
    `N`,
    `O`,
    `P`,
    `Q`,
    `R`,
    `S`,
    `T`,
    `U`,
    `V`,
    `W`,
    `X`,
    `Y`,
    `Z`//35
]

// This represents all holes in a connect4 game
export class Piece {
    constructor(playerId, age = 0) {
        this.player = playerId || 0 // Stores the player index who owns this piece (0 = non-player)
        //this.col; // X position
        //this.row; // Y position
        this.age = age // How old is this piece? (starts at 0)
        this.hp = 10
        this.isPetrified = false
        this.isWinner = false // True if this hole contains a winning piece
    }
}

// This is the class for all connect4 players
// (Not yet implemented)
export class C4Player {
    constructor(newId) {
        this.id = newId || 0
        this.img = null
        this.isWinner = false
    }
}

// Power-ups for C4
export const c4Special = {
    "petrified": {offset: 1, icon: "", Power: (c4g, prompt)=>{
        //...
        // Nothing because this isn't a powerup (though maybe health loss?)
    }},
    "extra-turn": {offset: 2, icon: "T", Power: (c4g, prompt)=>{
        // Give player an extra turn
        c4g.turnRotation--
        if (c4g.turnRotation < 0) c4g.turnRotation = c4g.players.length -1
        c4g.playerTurn = c4g.players[c4g.turnRotation].id
        // Set prompt
        prompt = `\n<@${c4g.playerTurn}> got an extra turn!`
    }},
    "skip-next": {offset: 3, icon: "S", Power: (c4g, prompt)=>{
        // Set prompt
        prompt = `\n<@${c4g.playerTurn}>'s turn got skipped!`
        // Skip next player's turn
        c4g.turnRotation++
        if (c4g.turnRotation >= c4g.players.length) c4g.turnRotation = 0
        c4g.playerTurn = c4g.players[c4g.turnRotation].id
    }},
    "petrify-random": {offset: 4, icon: "P", Power: (c4g, prompt)=>{
        // Get all other pieces on board
        let otherPlayerPieces = []
        for (var i = 0; i < c4g.gameOptions.boardHeight; i++) {
            for (var j = 0; j < c4g.boardWidth; j++) {
                if (c4g.board[i][j].player != 0 && c4g.board[i][j].player != (c4g.turnRotation + 1) && c4g.board[i][j].player < c4g.colors.players.length) 
                    otherPlayerPieces.push({r: i, c: j})
            }
        }
        // Petrify random other
        const attackPiece = otherPlayerPieces[getRandomInt(0, otherPlayerPieces.length)]
        c4g.board[attackPiece.r][attackPiece.c].player = c4g.colors.players.length + c4Special["petrified"].offset
        // Set prompt
        let lastPlayer = c4g.turnRotation - 1
        if (lastPlayer < 0) lastPlayer = c4g.players.length -1
        prompt = `\n<@${c4g.players[lastPlayer].id}> petrified a piece!`
    }},
    "grow-vert": {offset: 5, icon: "═", Power: (c4g, prompt)=>{
        // Grow board
        if (c4g.gameOptions.boardHeight < c4g.gameOptions.boardMaxHeight)
        {
            let newRow = []
            for (let i = 0; i < c4g.board[0].length; i++) { // For every col
                newRow[i] = new Piece(0, 0)
            }
            c4g.board.unshift(newRow) // Place new row at the top
        }
        // Cap board size
        c4g.gameOptions.boardHeight++
        c4g.gameOptions.boardHeight = (c4g.gameOptions.boardHeight >= c4g.boardMaxHeight) ? c4g.boardMaxHeight : c4g.gameOptions.boardHeight
        // Set prompt
        let lastPlayer = c4g.turnRotation - 1
        if (lastPlayer < 0) lastPlayer = c4g.players.length -1
        prompt = `\n<@${c4g.players[lastPlayer].id}> grew the game board vertically!`
    }},
    "grow-horz": {offset: 6, icon: "║", Power: (c4g)=>{
        // Grow board
        if (c4g.gameOptions.boardWidth + 2 <= c4g.gameOptions.boardMaxWidth)
        {
            for (let i = 0; i < c4g.board.length; i++) { // For every row
                c4g.board[i].unshift(new Piece(0, 0)) // Place at the beginning of the row
                c4g.board[i].push(new Piece(0, 0)) // Place at the end of the row
            }
        }
        // Cap board size
        c4g.gameOptions.boardWidth += 2
        c4g.gameOptions.boardWidth = (c4g.gameOptions.boardWidth >= c4g.boardMaxWidth) ? c4g.boardMaxWidth : c4g.gameOptions.boardWidth
        console.log("rows: " + c4g.board.length, "cols: " + c4g.board[0].length)
        // Set prompt
        let lastPlayer = c4g.turnRotation - 1
        if (lastPlayer < 0) lastPlayer = c4g.players.length -1
        prompt = `\n<@${c4g.players[lastPlayer].id}> grew the game board horizontally!`
    }}
}

// Main class for the Connect4 game
export default class C4Game {
    constructor(canvasApp, host, width = 7, height = 6, winCount = 4, playerCount = 2, mode = "none") {
        ///////////////////////////////////////////////////////
        // Game Vars
        ///////////////////////////////////////////////////////
        this.cApp = canvasApp || new CanvasApp() // The canvas app used to draw the game board

        this.players = [{id: host.id, img: host.img, isWinner: false}] // Player 1 (creator of game) & Player 2 (player who joined)
        this.playerTurn // Player who's turn it is
        this.turn = 0 // The total number of turns elapsed
        this.turnRotation = 0 // The index of the player who's turn it is (counts up with this.turn then rolls over)

        this.winner // Player who won
        this.hasWon = false // If anyone has won (bool)
        this.isActive = false // If there is a game in progress

        this.board // Array of objects {player, winner, age, ...}

        ///////////////////////////////////////////////////////
        // Game Options
        ///////////////////////////////////////////////////////

        // Available modes:
        // {mode: "none", mod: 0}       - not yet
        // {mode: "timed", mod: 0}      - not yet
        // {mode: "decay", mod: 4}      - not yet
        // {mode: "blockade", mod: 4}   - not yet
        // {mode: "extra", mod: 2}      - not yet
        // {mode: "extra2", mod: 2}     - not yet

        // Voard size calc
        this.boardMaxWidth = 36
        this.boardMaxHeight = 36
        const clampedWidth = (width >= this.boardMaxWidth) ? this.boardMaxWidth : width
        const clampedHeight = (height >= this.boardMaxHeight) ? this.boardMaxHeight : height
        
        // Options
        this.gameOptions = {
            // Player options
            expectedPlayerCount: playerCount,
            // Board options
            boardWidth: clampedWidth,
            boardHeight: clampedHeight,
            winCount: winCount,
            // Game modes
            gameModes: [mode],
            timedProps: {time: 30},
            decayProps: {turns: 4},
            powerupProps: {
                turns: 3,
                types: ["extra-turn", "skip-next", "petrify-random", "grow-vert", "grow-horz"]
            },
        }

        ///////////////////////////////////////////////////////
        // Game Colors
        ///////////////////////////////////////////////////////
        this.colors = {
            board: "#55d",
            boardBG: "#11a",
            boardLight: "#88ff",
            shade: "#0003",
            text: "#ccc",
            nonPlayers: ["#a3a3a3", "#ffffff"],
            winOutline: "#00ff00",
            win: "#ffffff",
            players: playerColorArray
        }
    }

    ////////////////////////
    // ToDo:
    ////////////////////////

    // Check for new users (one outside a list)
    // if new make a new object for storing data and place them into the users list

    // Save user data to JSON file
    //  Points / Wins (leaderboard)

    // Game modes:
    //  (Decay) After every X turns a random player token gets petrified
    //      (Restore) Needs Decay to work - every X*2 turns a petrified token is restored
    //  (Decay2) After every X turns a random player token gets destroyed and the pieces above it fall
    //  (Blockade / sudden-death) After every X turns, a random blank space is covered
    //  (Extra) 1 + X connections to win (old connections are petrified)
    //  (Extra - alt) 1 + X connections to win (old connections are removed)
    //  (Time) Timed mode
    //  (Wild) A wild token drops every X turns
    //  (flip) Every X truns the board rotates
    //  (fps) damageable tokens
    //  (Royal) the edges slowly close in
    //  (Crits) Dropped pieces can cause damage based on player level

    // Power-ups (appears at a random location on the board) (useable right-away) (Some are persistant and some are instant use)
    //  Clear Row / Col
    //  Clear single token
    //  Extra-life (other player needs +1 connections to win)
    //  Capture token
    //  Bombs (player can drop a bomb)

    ///////////////////////////////////////////////////////
    // Create new board
    ///////////////////////////////////////////////////////

    CreateBoard = () => {
        const w = this.gameOptions.boardWidth
        const h = this.gameOptions.boardHeight
        const clampedWidth = (w >= this.boardMaxWidth) ? this.boardMaxWidth : w
        const clampedHeight = (h >= this.boardMaxHeight) ? this.boardMaxHeight : h

        var newBoard = new Array(clampedHeight)
        for (var i = 0; i < clampedHeight; i++) {
            newBoard[i] = new Array(clampedWidth)
            for (var j = 0; j < clampedWidth; j++) {
                // Place empty piece in each spot
                newBoard[i][j] = new Piece(0, 0)
            }
        }
        this.board = newBoard
    }

    ///////////////////////////////////////////////////////
    // Draw board
    ///////////////////////////////////////////////////////

    DrawBoard = () => {
        /////////////////////////////////////////
        // Sizing & Spacing
        /////////////////////////////////////////
        const largerDim = (this.gameOptions.boardHeight > this.gameOptions.boardWidth) ? this.gameOptions.boardHeight + 1 : this.gameOptions.boardWidth + 1
        const scaleFactor = 1000
        
        // Spacing, and Sizing
        const holeDiam = scaleFactor/(largerDim * 2)
        const holeRadius = holeDiam / 2
        const spacing = holeDiam / 8
        //const leftPadding = (holeDiam + spacing) * 2;
        const leftPadding = scaleFactor/5
        const topPadding = holeDiam + spacing

        // Board size
        // (+1 is for edge spacing)
        const boardCenterOffset = 0.5
        const boardWide = (this.gameOptions.boardWidth + (boardCenterOffset * 2)) * (holeDiam + spacing)
        const boardTall = (this.gameOptions.boardHeight + (boardCenterOffset * 2)) * (holeDiam + spacing)

        // Canvas size
        const cw = boardWide + leftPadding
        const ch = boardTall + topPadding
        this.cApp.ChangeSize({x: cw, y: ch})
        
        /////////////////////////////////////////
        // Draw Board
        /////////////////////////////////////////
        // Shade
        this.cApp.RoundRect(leftPadding, topPadding, boardWide, boardTall, this.colors.boardBG, holeRadius, true, false)
        // Highlight
        this.cApp.RoundRect(leftPadding, topPadding, boardWide, boardTall - spacing, this.colors.boardLight, holeRadius, true, false)
        // Body
        this.cApp.RoundRect(leftPadding, topPadding + spacing, boardWide, boardTall - (spacing * 2), this.colors.board, holeRadius, true, false)
        
        // Inner rim
        const leftRim = (leftPadding + (holeRadius / 2))
        const topRim = (topPadding + (holeRadius / 2))
        const rimWide = boardWide - (holeRadius)
        const rimTall = boardTall - (holeRadius)
        // Highlight
        this.cApp.RoundRect(leftRim, topRim, rimWide, rimTall, this.colors.boardLight, holeRadius, true, false)
        // Shade
        this.cApp.RoundRect(leftRim, topRim, rimWide, (rimTall - (spacing/2)), this.colors.boardBG, holeRadius, true, false)
        // Body
        this.cApp.RoundRect(leftRim, (topRim + (spacing/2)), rimWide, (rimTall - (spacing)), this.colors.board, holeRadius, true, false)

        /////////////////////////////////////////
        // Draw text
        /////////////////////////////////////////
        for (var i = 0; i < this.board[0].length; i++) {
            // Text style
            const textSize = topPadding * 0.75
            const textPadding = (topPadding - textSize) / 1.5
            this.cApp.ctx.fillStyle = this.colors.text
            this.cApp.ctx.textAlign = "center"
            this.cApp.ctx.font = 'bold '+ textSize +'px sans-serif'

            // Draw number
            this.cApp.ctx.fillText(
                `${i+1}`,
                //c4Numbers[i],
                // padding + side * (i + boardEdges) + center
                leftPadding + ((holeDiam + spacing) * (i + boardCenterOffset)) + (holeDiam/2),
                topPadding - textPadding
            )
        }

        /////////////////////////////////////////
        // Draw turn order
        /////////////////////////////////////////
        for (let i = 0; i < this.players.length; i++) {
            let turnPadding = 0
            let maxSize = (ch / this.players.length);
            if (maxSize > leftPadding) {
                maxSize = leftPadding
                turnPadding = (ch - (maxSize * this.players.length))/2
            }

            let x = leftPadding / 2
            let y = (i * maxSize) + (maxSize/2) + turnPadding

            // My turn
            if (!this.hasWon) {
                if (this.turnRotation === i) {
                    this.cApp.DrawCircle(this.colors.win, x, y, maxSize/2.2)
                    this.cApp.EraseCircle(x, y, maxSize/2.4)
                }
            }
            else {
                if (this.players[i].isWinner) {
                    this.cApp.DrawCircle(this.colors.winOutline, x, y, maxSize/2)
                    this.cApp.EraseCircle(x, y, maxSize/2.4)
                }
            }

            // Background color
            this.cApp.DrawCircle(this.colors.players[i], x, y, maxSize/2.6)
            this.cApp.DrawRoundImage(this.players[i].img, this.colors.players[i], x, y, maxSize/2.8)
        }

        /////////////////////////////////////////
        // Draw Pieces
        /////////////////////////////////////////
        let winningSegments = []
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++)
            {
                const x = ((j + (boardCenterOffset * 2)) * (holeDiam + spacing)) + leftPadding
                const y = ((i + (boardCenterOffset * 2)) * (holeDiam + spacing)) + topPadding
                
                // If winner, store segment
                if (this.hasWon) {
                    if (this.board[i][j].isWinner) winningSegments.push({x: x, y: y})
                }

                if (this.board[i][j].player == 0) {
                    // Draw blank space
                    this.cApp.DrawCircle(this.colors.boardBG, x, y - (spacing/2), holeRadius - (spacing/2))
                    this.cApp.DrawCircle(this.colors.boardLight, x, y + (spacing/2), holeRadius - (spacing/2))
                    this.cApp.EraseCircle(x, y, holeRadius - (spacing/2))
                }
                else if (this.board[i][j].player > 0 && this.board[i][j].player <= this.colors.players.length) {
                    // Draw player pieces
                    this.cApp.DrawCircle(this.colors.players[this.board[i][j].player-1], x, y, holeRadius*1.1)
                    this.cApp.DrawRoundImage(this.players[this.board[i][j].player-1].img, this.colors.players[this.board[i][j].player-1], x, y, holeRadius)
                }
                else if (this.board[i][j].player > this.colors.players.length) {
                    function DrawPieceText(c, t) {
                        let ts = holeRadius * 1.5
                        this.cApp.ctx.fillStyle = c
                        this.cApp.ctx.textAlign = "center"
                        this.cApp.ctx.font = 'bold '+ ts + 'px sans-serif'
                        this.cApp.ctx.fillText(t, x, y+(ts/2.75))
                    }

                    // Draw Non-player pieces
                    const pieceType = this.board[i][j].player
                    switch (pieceType) {
                        case (this.colors.players.length + c4Special["petrified"].offset):
                            this.cApp.DrawCircle(this.colors.nonPlayers[0], x, y, holeRadius)
                            break
                        default:
                            const powerIndex = pieceType - this.colors.players.length
                            const filteredObj = Object.filter(c4Special, power => power.offset === powerIndex)
                            const powerName = Object.keys(filteredObj)[0]
                            const powerObj = c4Special[powerName]
                            console.log("Drawing: ", powerName, powerObj, powerIndex, pieceType)
                            if (powerObj) {
                                this.cApp.DrawCircle(this.colors.nonPlayers[1], x, y, holeRadius)
                                DrawPieceText(this.colors.boardBG, powerObj.icon)
                            }
                            break
                    }
                }
            }
        }

        /////////////////////////////////////////
        // Draw winning connections
        /////////////////////////////////////////
        if (this.hasWon) {
            const winThickness = spacing / 1.5

            // outside caps
            let startPos = { x: winningSegments[0].x, y: winningSegments[0].y }
            let endPos = { x: winningSegments[winningSegments.length - 1].x, y: winningSegments[winningSegments.length - 1].y }
            this.cApp.DrawCircle(this.colors.winOutline, startPos.x, startPos.y, winThickness)
            this.cApp.DrawCircle(this.colors.winOutline, endPos.x, endPos.y, winThickness)

            // Make line to stroke
            this.cApp.ctx.beginPath()
            this.cApp.ctx.moveTo(winningSegments[0].x, winningSegments[0].y)
            for (let q = 1; q < winningSegments.length; q++) {
                this.cApp.ctx.lineTo(winningSegments[q].x, winningSegments[q].y)
            }

            // stroke outline
            this.cApp.ctx.strokeStyle = this.colors.winOutline
            this.cApp.ctx.lineWidth = winThickness * 2
            this.cApp.ctx.stroke()

            // stroke inner line
            this.cApp.ctx.strokeStyle = this.colors.win
            this.cApp.ctx.lineWidth = winThickness
            this.cApp.ctx.stroke()
            this.cApp.ctx.beginPath()

            // inside caps
            this.cApp.DrawCircle(this.colors.win, startPos.x, startPos.y, winThickness/2)
            this.cApp.DrawCircle(this.colors.win, endPos.x, endPos.y, winThickness/2)
        }
    }

    ///////////////////////////////////////////////////////
    // Place a piece
    ///////////////////////////////////////////////////////

    PlacePiece = (pos) => {
        var prompt = ""
        // Get color by player turn
        if (this.turnRotation >= this.players.length) this.turnRotation = 0

        // chosen position is too large
        if (((pos-1) > (this.gameOptions.boardWidth - 1)) || ((pos-1) < 0)) {
            prompt = "Umm... maybe try a number that's actually valid."
            console.log("The player dumb and typed a number that's too large >:(")
            const attachment = new Discord.MessageAttachment(this.cApp.GetCanvasData(), `Connect4_Game_turn${this.turn}.png`)
            return {p: prompt, a: attachment}
        }

        // place piece at pos
        var placed = false
        for (var i = this.board.length-1; i > -1; i--) {
            //place if open
            if (this.board[i][pos-1].player == 0) {
                // Decay game mode
                this.DoDecay()
                
                // Get powerup if it exists
                const pieceType = this.board[0][pos-1].player
                const gotPowerup = pieceType >= this.colors.players.length
                // Remove powerup if we didn't place here
                if (i != 0) this.board[0][pos-1].player = 0
                // Place piece
                this.board[i][pos-1].player = this.turnRotation + 1
                placed = true

                // Check if player won
                this.hasWon = this.CheckWinner()
                if (this.hasWon) {
                    this.winner = this.playerTurn
                    this.players[this.turnRotation].isWinner = true
                }

                // Check if board is full
                let otherPlayerPieces = []
                var FullCount = 0
                for (var i = 0; i < this.gameOptions.boardHeight; i++) {
                    for (var j = 0; j < this.gameOptions.boardWidth; j++) {
                        if (this.board[i][j].player != 0) 
                        {
                            // Count up board pieces
                            if (this.board[i][j].player == this.colors.players.length+1) FullCount++
                            // Store this for attack powerups
                            if (this.board[i][j].player != (this.turnRotation + 1) && this.board[i][j].player < this.colors.players.length) otherPlayerPieces.push({r: i, c: j})
                        }
                    }
                }

                if (FullCount >= (this.gameOptions.boardHeight * this.gameOptions.boardWidth)) {
                    console.log("It's a tie.")
                    prompt = "It's a tie! YOU ALL LOSE!"
                    // Switch player turn
                    this.turn++
                    this.turnRotation++
                    if (this.turnRotation >= this.players.length) this.turnRotation = 0
                    this.playerTurn = this.players[this.turnRotation].id
                }
                else {
                    // Switch player turn
                    this.turn++
                    this.turnRotation++
                    if (this.turnRotation >= this.players.length) this.turnRotation = 0
                    this.playerTurn = this.players[this.turnRotation].id

                    // Check if got powerup
                    let powerupPrompt = ""
                    if (gotPowerup) {
                        switch (pieceType) {
                            default:
                                const powerIndex = pieceType - this.colors.players.length
                                const filteredObj = Object.filter(c4Special, power => power.offset === powerIndex)
                                const powerName = Object.keys(filteredObj)[0]
                                const powerObj = c4Special[powerName]
                                console.log("Drawing: ", powerName, powerObj, powerIndex)
                                // If this power exists, do its power
                                if (powerObj) {
                                    powerObj.Power(this, powerupPrompt) // function with the reference to this game
                                }
                                break
                        }
                    }

                    // Place powerup in PowerUp game mode
                    this.DoPowerup()

                    // Set message
                    var mention = "<@" + this.playerTurn + ">"
                    prompt = `It is ${mention}'s turn.${powerupPrompt}`
                }

                // End loop
                i = -1
            }
            // if column is full
            if (i == 0 && placed == false) {
                // return an error "Column is filled"
                prompt = "This column is filled, maybe try an open slot... stinky!"
                console.log("The player dumb and can't see the column is full I guess...")
            }
        }
        
        // Change prompt is player wins
        if (this.hasWon) {
            var winMention = "<@" + this.winner + ">"
            prompt = "Hey " + winMention + ", you win! Good job, son! I'm proud of you."

            // Set game to inactive
            this.isActive = false
        }

        // Draw board
        this.DrawBoard()

        // Create discord attatchment
        const attachment = new Discord.MessageAttachment(this.cApp.GetCanvasData(), `Connect4_Game_turn${this.turn}.png`)
        return {p: prompt, a: attachment}
    }

    ///////////////////////////////////////////////////////
    // Game Commands
    ///////////////////////////////////////////////////////

    StartGame(sendMessage = () => {}, prefix = "//") {
        // Set random starting player
        shuffle(this.players)
        this.playerTurn = this.players[0].id

        // Start game
        this.CreateBoard()
        this.isActive = true
        
        const mention = `<@${this.playerTurn}>`
        const prompt = `It is ${mention}'s turn.\nType ${prefix}<1-${this.gameOptions.boardWidth}> to place a piece.`

        // Draw and send board
        const message = this.SendBoardUpdate(prompt)
        sendMessage(message.p, message.a)
    }

    EndGame(sendMessage = () => {}) {
        // End game
        this.isActive = false

        // Send message
        const prompt = `The current connect 4 game has been ended.`
        sendMessage(prompt)
    }

    TakeTurn(authorId, command, sendMessage = () => {}, RemoveBotMessages = () => {}) {
        // Check if it is my turn
        if (this.playerTurn == authorId) {
            // Check if position is valid
            if (parseInt(command) <= this.gameOptions.boardWidth) {
                // Remove last bot message
                RemoveBotMessages(10)

                // Place piece
                var turn = this.PlacePiece(parseInt(command))
                sendMessage(turn.p, turn.a)
            }
            else {
                // Not valid
                sendMessage(`Nice try, you can't place anything there!`)
            }
        }
        else {
            // It is not your turn
            var mention = `<@${this.playerTurn}>`
            sendMessage(`It is ${mention}'s turn.`)
        }
    }

    Undo(sendMessage = () => {}) {
        // You cannot undo, so tell the player this
        const mention = `<@${this.playerTurn}>`
        const prompt = `${mention} you cannot undo. That's cheating!`

        // Send message
        sendMessage(prompt)
    }

    ///////////////////////////////////////////////////////
    // Send Updates
    ///////////////////////////////////////////////////////

    SendBoardUpdate(prompt) {
        // Draw board
        this.DrawBoard()

        // Create discord attatchment
        const attachment = new Discord.MessageAttachment(this.cApp.GetCanvasData(), `Connect4_Game_turn${this.turn}.png`)
        return {p: prompt, a: attachment}
    }

    ///////////////////////////////////////////////////////
    // Game modes
    ///////////////////////////////////////////////////////

    DoDecay = () => {
        // Check to see if game mode is active and the selected number of turns have passed
        if (this.gameOptions.gameModes.includes("decay") && ((this.turn + 1) % this.gameOptions.decayProps.turns) == 0) {
            // Get all player pieces' positions
            var p = []
            for (var i = 0; i < this.board.length; i++) {
                for (var j = 0; j < this.board[i].length; j++) {
                    if (this.board[i][j].player != 0 && this.board[i][j].player <= this.colors.players.length) p[p.length] = {x: j, y: i}
                }
            }
            // Pick a random piece
            var rand = getRandomInt(0, p.length)
            // Turn to an index 1 greater than the max possible player count
            this.board[p[rand].y][p[rand].x].player = this.colors.players.length +1 // the +1 is to change the index on the board correctly
            console.log("Piece has decayed")
        }
        else {
            //console.log("Can't decay")
        }
    }

    DoPowerup = () => {
        // Check to see if game mode is active and the selected number of turns have passed
        if (this.gameOptions.gameModes.includes("powerup") && ((this.turn + 1) % this.gameOptions.powerupProps.turns) == 0) {
            
            // Get all open cols
            let openCols = []
            for (var c = 0; c < this.gameOptions.boardWidth; c++) {
                for (var r = 0; r < this.gameOptions.boardHeight; r++) {
                    if (this.board[r][c].player === 0) {
                        // If this row already has a powerup, end the loop
                        if (this.board[r][c].player >= this.colors.players.length +1) r = this.gameOptions.boardHeight
                        else {
                            openCols.push(c) // Store this col index
                            r = this.gameOptions.boardHeight // End looping on this col
                        }
                    }
                }
            }

            // If there are any open spots
            if (openCols.length > 0) {
                // Get random col
                const powerupCol = getRandomInt(0, openCols.length)
                const powerupType = this.gameOptions.powerupProps.types[getRandomInt(0, this.gameOptions.powerupProps.types.length)]

                // Player powerup
                this.board[0][openCols[powerupCol]].player = this.colors.players.length + c4Special[powerupType].offset // TODO: change this so powerups are rendered instead
                console.log(`Powerup of type "${powerupType}" spawned at X: ${openCols[powerupCol] + 1}`)
            }
        }
        else {
            //console.log("Can't place powerup")
        }
    }

    ///////////////////////////////////////////////////////
    // Check winner
    ///////////////////////////////////////////////////////

    // The function to call when checking for winners
    CheckWinner = () => {
        var rowWin = this.CheckRows()
        var colWin = this.CheckCols()
        var rDiagWin = this.CheckRDiags()
        var lDiagWin = this.CheckLDiags()

        if (rowWin || colWin || rDiagWin || lDiagWin) return true
        else return false
    }

    CheckRows = () => {
        let pos = []
        // Loop through rows
        for (var r = 0; r < this.gameOptions.boardHeight; r++) {
            // new array to check
            var array = new Array()
            // fill array
            for (var c = 0; c < this.gameOptions.boardWidth; c++) {
                array[c] = this.board[r][c].player
                pos[c] = { x:r, y:c }
            }
            // check array
            var win = this.CountConnectedPieces(array, pos, this.board)
            if (win) return win
        }
        return false
    }
    
    CheckCols = () => {
        let pos = []
        // Loop through columns
        for (var c = 0; c < this.gameOptions.boardWidth; c++) {
            // new array to check
            var array = new Array()
            // fill array
            for (var r = 0; r < this.gameOptions.boardHeight; r++) {
                array[r] = this.board[r][c].player
                pos[r] = { x:r, y:c }
            }
            // check array
            var win = this.CountConnectedPieces(array, pos, this.board)
            if (win) return win
        }
        return false
    }
    
    CheckRDiags = () => {
        var Ylength = this.gameOptions.boardHeight
        var Xlength = this.gameOptions.boardWidth
        var maxLength = Math.max(Xlength, Ylength)
        var array // temporary array
        let pos

        // Fill temp array
        for (var k = 0; k <= 2 * (maxLength - 1); ++k) {
            array = []
            pos = []
            for (var y = Ylength - 1; y >= 0; --y) {
                var x = k - y
                if (x >= 0 && x < Xlength) {
                    array.push(this.board[y][x].player)
                    pos.push({ x:y, y:x })
                }
            }
            // Check array
            var win = this.CountConnectedPieces(array, pos, this.board)
            if (win) return win
        }
        return false
    }
    
    CheckLDiags = () => {
        var Ylength = this.gameOptions.boardHeight
        var Xlength = this.gameOptions.boardWidth
        var maxLength = Math.max(Xlength, Ylength)
        var array // temporary array
        let pos = []

        for (var k = 0; k <= 2 * (maxLength - 1); ++k) {
            array = []
            pos = []
            for (var y = Ylength - 1; y >= 0; --y) {
                var x = k - (Ylength - y)
                if (x >= 0 && x < Xlength) {
                    array.push(this.board[y][x].player)
                    pos.push({ x:y, y:x })
                }
            }
            // Check array
            var win = this.CountConnectedPieces(array, pos, this.board)
            if (win) return win
        }
        return false
    }

    CountConnectedPieces(ar, pos, board) {
        var count = 0
        var last = 0
        let winningIndexes = []
        for (var i = 0; i < ar.length; i++) {
            // if the cell has a piece in it
            if (ar[i] != 0 && ar[i] <= this.colors.players.length) {
                // Check is piece is the same as the last
                //console.log(`this = ${ar[i]} : last = ${last}`)
                if (ar[i] == last) {
                    if (count == 0) {
                        // store index
                        winningIndexes.push(i-1)
                        count++
                    }
                    // store index
                    winningIndexes.push(i)
                    count++
                    // if there is enough in a row to win
                    if (count >= this.gameOptions.winCount) {
                        // Set all winning pieces isWinner = true
                        if (winningIndexes.length > 0) {
                            for (let q = 0; q < winningIndexes.length; q++) {
                                board[pos[winningIndexes[q]].x][pos[winningIndexes[q]].y].isWinner = true
                            }
                        }
                        return true
                    }
                }
                else {
                    winningIndexes = []
                    count = 0
                }
            }
            else {
                winningIndexes = []
                count = 0
            }
            // Log the piece
            last = ar[i]
        }
        return false
    }
}