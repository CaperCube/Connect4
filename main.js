//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// ToDo: Make this project a module so we can use "import" instead of "require"
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////


// nodemon - restarts node server wheen file is saved
// Use "npm run watch" to run the nodemon version
require('dotenv/config')
const Discord = require('discord.js')
const client = new Discord.Client()
const Canvas = require('canvas')
const fm = require('./faceMaker.js')

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Canvas init
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/
var canvas = Canvas.createCanvas(512, 512)
var ctx = canvas.getContext('2d')
var cw, ch
cw = ch = canvas.width = canvas.height

// Valid canvas image extensions
const imageExt = ['.jpg','.bmp','.jpeg','.gif','.tiff','.png','.webp','.JPG','.BMP','.JPEG','.GIF','.TIFF','.PNG','.WEBP',]

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Global Vars
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/

const repoLink = `https://github.com/CaperCube/CaperClone`

// The Discord roles that allow use of "Mod-Only" commands
const botAdminRoles = ['ADMINISTRATOR', 'BotMod', 'STINKY BABY ADMIN']

// The owner of the bot, used for refering to the bot's creator
const botOwner = 'CaperCube'

// Playing card variables
const playingCards = [
    "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "Joker"
]
const cardSuits = [
    "Hearts", "Diamonds", "Clubs", "Spades"
]
var cardSuitImages
var drawnCards = []

// Connect4 variables
var myC4Game;
var playerColors = ["#ee1111", "#ffcc11", "#d400f9", "#1bed97", "#76aa3a", "#66509b", "#82c8d8", "#755a2c", "#e8b6ff", "#408184", "#ffd4a9", "#8c4f70"];

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Connect 4
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/

// List of valid spaces on connct4 board (not yet implemented)
const c4Numbers = [
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
];

function Piece(p, a) { // This represents all holes in a connect4 game
    this.player = p || 0; // Stores the player index who owns this piece (0 = non-player)
    //this.col; // X position
    //this.row; // Y position
    this.age = a || 0; // How old is this piece? (starts at 0)
    this.hp = 10;
    this.isPetrified = false;
    this.isWinner = false; // True if this hole contains a winning piece
}

// Not yet implemented
function C4Player(newId) { // This is the object for all connect4 players
    this.id = newId || 0;
    this.img = null;
    this.isWinner = false;
}

// Power-ups for C4
const c4Special = {
    "petrified": {offset: 1, icon: "", Power: (c4g, prompt)=>{
        //...
        // Nothing because this isn't a powerup (though maybe health loss?)
    }},
    "extra-turn": {offset: 2, icon: "T", Power: (c4g, prompt)=>{
        // Give player an extra turn
        c4g.turnRotation--;
        if (c4g.turnRotation < 0) c4g.turnRotation = c4g.players.length -1;
        c4g.playerTurn = c4g.players[c4g.turnRotation].id;
        // Set prompt
        prompt = `\n<@${c4g.playerTurn}> got an extra turn!`;
    }},
    "skip-next": {offset: 3, icon: "S", Power: (c4g, prompt)=>{
        // Set prompt
        prompt = `\n<@${c4g.playerTurn}>'s turn got skipped!`;
        // Skip next player's turn
        c4g.turnRotation++;
        if (c4g.turnRotation >= c4g.players.length) c4g.turnRotation = 0;
        c4g.playerTurn = c4g.players[c4g.turnRotation].id;
    }},
    "petrify-random": {offset: 4, icon: "P", Power: (c4g, prompt)=>{
        // Get all other pieces on board
        let otherPlayerPieces = [];
        for (var i = 0; i < c4g.boardHeight; i++) {
            for (var j = 0; j < c4g.boardWidth; j++) {
                if (c4g.board[i][j].player != 0 && c4g.board[i][j].player != (c4g.turnRotation + 1) && c4g.board[i][j].player < playerColors.length) 
                    otherPlayerPieces.push({r: i, c: j});
            }
        }
        // Petrify random other
        const attackPiece = otherPlayerPieces[getRandomInt(0, otherPlayerPieces.length)];
        c4g.board[attackPiece.r][attackPiece.c].player = playerColors.length + c4Special["petrified"].offset;
        // Set prompt
        let lastPlayer = c4g.turnRotation - 1;
        if (lastPlayer < 0) lastPlayer = c4g.players.length -1;
        prompt = `\n<@${c4g.players[lastPlayer].id}> petrified a piece!`;
    }},
    "grow-vert": {offset: 5, icon: "═", Power: (c4g, prompt)=>{
        // Grow board
        if (c4g.boardHeight < c4g.boardMaxHeight)
        {
            let newRow = [];
            for (let i = 0; i < c4g.board[0].length; i++) { // For every col
                newRow[i] = new Piece(0, 0);
            }
            c4g.board.unshift(newRow); // Place new row at the top
        }
        // Cap board size
        c4g.boardHeight++;
        c4g.boardHeight = (c4g.boardHeight >= c4g.boardMaxHeight) ? c4g.boardMaxHeight : c4g.boardHeight;
        // Set prompt
        let lastPlayer = c4g.turnRotation - 1;
        if (lastPlayer < 0) lastPlayer = c4g.players.length -1;
        prompt = `\n<@${c4g.players[lastPlayer].id}> grew the game board vertically!`;
    }},
    "grow-horz": {offset: 6, icon: "║", Power: (c4g)=>{
        // Grow board
        if (c4g.boardWidth + 2 <= c4g.boardMaxWidth)
        {
            for (let i = 0; i < c4g.board.length; i++) { // For every row
                c4g.board[i].unshift(new Piece(0, 0)); // Place at the beginning of the row
                c4g.board[i].push(new Piece(0, 0)); // Place at the end of the row
            }
        }
        // Cap board size
        c4g.boardWidth += 2;
        c4g.boardWidth = (c4g.boardWidth >= c4g.boardMaxWidth) ? c4g.boardMaxWidth : c4g.boardWidth;
        console.log("rows: " + c4g.board.length, "cols: " + c4g.board[0].length);
        // Set prompt
        let lastPlayer = c4g.turnRotation - 1;
        if (lastPlayer < 0) lastPlayer = c4g.players.length -1;
        prompt = `\n<@${c4g.players[lastPlayer].id}> grew the game board horizontally!`;
    }}
}

// Main class for the Connect4 game
function C4Game(host, w, h, s, p, m) {
    //this.players = [host]; // Player 1 (creator of game) & Player 2 (player who joined)
    this.players = [{id: host.id, img: host.img, isWinner: false}]; // Player 1 (creator of game) & Player 2 (player who joined)
    this.expectedPlayerCount = p || 2;
    this.playerTurn; // Player who's turn it is
    this.turn = 0;
    this.turnRotation = 0; // index of the player who's turn it is (counts up with this.turn then rolls over)
    this.winner; // Player who won
    this.hasWon = false; // if anyone has won (bool)

    // Available modes:
    // {mode: "none", mod: 0}       - not yet
    // {mode: "timed", mod: 0}      - not yet
    // {mode: "decay", mod: 4}      - not yet
    // {mode: "blockade", mod: 4}   - not yet
    // {mode: "extra", mod: 2}      - not yet
    // {mode: "extra2", mod: 2}     - not yet
    this.gameModes = [m] || ["none"];
    this.timedProps = {time: 30};
    this.decayProps = {turns: 4};
    this.powerupProps = {
        turns: 3,
        types: ["extra-turn", "skip-next", "petrify-random", "grow-vert", "grow-horz"]
    };

    this.boardMaxWidth = 36;
    this.boardMaxHeight = 36;
    this.boardWidth = w || 7;
    this.boardHeight = h || 6;
    this.boardWidth = (this.boardWidth >= this.boardMaxWidth) ? this.boardMaxWidth : this.boardWidth;
    this.boardHeight = (this.boardHeight >= this.boardMaxHeight) ? this.boardMaxHeight : this.boardHeight;
    this.winCount = s || 4;
    this.board; // Array of objects {player, winner, age, ...}

    this.isActive = false;

    // Colors
    this.boardColor = "#55d";
    this.boardBGColor = "#11a";
    this.boardLightColor = "#88ff";
    this.shadeColor = "#0003";
    this.textColor = "#ccc";
    this.nonPlayerColors = ["#a3a3a3", "#ffffff"];
    this.winOutlineColor = "#00ff00";
    this.winColor = "#ffffff";
    //this.playerColors = ["#ee1111", "#ffcc11", "#d400f9", "#1bed97"];

    ////////////////////////
    // TODO
    ////////////////////////

    // Check for new users (one outside a list)
    // if new make a new object for storing data and place them into the users list

    // Save user data to JSON file
    //  Points (leaderboard)
    //  Side-bar coordinates (like battle ship)

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

    // Create new board
    this.CreateBoard = function(w,h) {
        var newBoard = new Array(h);
        for (var i = 0; i < h; i++) {
            newBoard[i] = new Array(w);
            for (var j = 0; j < w; j++) {
                //newBoard[i][j] = 0;
                //newBoard[i][j] = {player, winner, age, ...};
                newBoard[i][j] = new Piece(0, 0); //{player: 0, winner: false, age: 0};
            }
        }
        this.board = newBoard;
    };
    // Draw board
    this.DrawBoard = function() {
        /////////////////////////////////////////
        // Sizing & Spacing
        /////////////////////////////////////////
        const largerDim = (this.boardHeight > this.boardWidth) ? this.boardHeight + 1 : this.boardWidth + 1;
        const scaleFactor = 1000;
        
        // Spacing, and Sizing
        const holeDiam = scaleFactor/(largerDim * 2);
        const holeRadius = holeDiam / 2;
        const spacing = holeDiam / 8;
        //const leftPadding = (holeDiam + spacing) * 2;
        const leftPadding = scaleFactor/5;
        const topPadding = holeDiam + spacing;

        // Board size
        // (+1 is for edge spacing)
        const boardCenterOffset = 0.5;
        const boardWide = (this.boardWidth + (boardCenterOffset * 2)) * (holeDiam + spacing);
        const boardTall = (this.boardHeight + (boardCenterOffset * 2)) * (holeDiam + spacing);

        // Canvas size
        const cw = boardWide + leftPadding;
        const ch = boardTall + topPadding;
        canvas.width = cw;
        canvas.height = ch;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        /////////////////////////////////////////
        // Draw Board
        /////////////////////////////////////////
        // Board
        ctx.fillStyle = this.boardBGColor;
        roundRect(ctx, leftPadding, topPadding, boardWide, boardTall, holeRadius, true, false);
        ctx.fillStyle = this.boardLightColor;
        roundRect(ctx, leftPadding, topPadding, boardWide, boardTall - spacing, holeRadius, true, false);
        ctx.fillStyle = this.boardColor;
        roundRect(ctx, leftPadding, topPadding + spacing, boardWide, boardTall - (spacing * 2), holeRadius, true, false);
        
        // Inner rim
        const leftRim = (leftPadding + (holeRadius / 2));
        const topRim = (topPadding + (holeRadius / 2));
        const rimWide = boardWide - (holeRadius);
        const rimTall = boardTall - (holeRadius);
        ctx.fillStyle = this.boardLightColor;
        roundRect(ctx, leftRim, topRim, rimWide, rimTall, holeRadius, true, false);
        ctx.fillStyle = this.boardBGColor;
        roundRect(ctx, leftRim, topRim, rimWide, (rimTall - (spacing/2)), holeRadius, true, false);
        ctx.fillStyle = this.boardColor;
        roundRect(ctx, leftRim, (topRim + (spacing/2)), rimWide, (rimTall - (spacing)), holeRadius, true, false);

        // Draw text
        for (var i = 0; i < this.board[0].length; i++) {
            // Text style
            const textSize = topPadding * 0.75;
            const textPadding = (topPadding - textSize) / 1.5;
            ctx.fillStyle = this.textColor;
            ctx.textAlign = "center";
            ctx.font = 'bold '+ textSize +'px sans-serif';
            //ctx.font = 'bold '+ textSize +'px serif';

            // Draw number
            ctx.fillText(
                `${i+1}`,
                //c4Numbers[i],
                // padding + side * (i + boardEdges) + center
                leftPadding + ((holeDiam + spacing) * (i + boardCenterOffset)) + (holeDiam/2),
                topPadding - textPadding
            );
        }

        /////////////////////////////////////////
        // Draw turn order
        /////////////////////////////////////////
        for (let i = 0; i < this.players.length; i++) {
            let turnPadding = 0;
            let maxSize = (ch / this.players.length);
            if (maxSize > leftPadding) {
                maxSize = leftPadding;
                turnPadding = (ch - (maxSize * this.players.length))/2;
            }

            let x = leftPadding / 2;
            let y = (i * maxSize) + (maxSize/2) + turnPadding;

            // My turn
            if (!this.hasWon) {
                if (this.turnRotation === i) {
                    DrawCircle(this.winColor, x, y, maxSize/2.2);
                    EraseCircleCtx(ctx, x, y, maxSize/2.4);
                }
            }
            else {
                if (this.players[i].isWinner) {
                    DrawCircle(this.winOutlineColor, x, y, maxSize/2);
                    EraseCircleCtx(ctx, x, y, maxSize/2.4);
                }
            }

            // Background color
            DrawCircle(playerColors[i], x, y, maxSize/2.6);
            DrawRoundImage(this.players[i].img, playerColors[i], x, y, maxSize/2.8);
        }

        /////////////////////////////////////////
        // Draw Pieces
        /////////////////////////////////////////
        let winningSegments = [];
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++)
            {
                const x = ((j + (boardCenterOffset * 2)) * (holeDiam + spacing)) + leftPadding;
                const y = ((i + (boardCenterOffset * 2)) * (holeDiam + spacing)) + topPadding;
                
                // If winner, store segment
                if (this.hasWon) {
                    if (this.board[i][j].isWinner) winningSegments.push({x: x, y: y});
                }

                if (this.board[i][j].player == 0) {
                    // Draw blank space
                    DrawCircle(this.boardBGColor, x, y - (spacing/2), holeRadius - (spacing/2));
                    DrawCircle(this.boardLightColor, x, y + (spacing/2), holeRadius - (spacing/2));
                    EraseCircleCtx(ctx, x, y, holeRadius - (spacing/2));
                }
                else if (this.board[i][j].player > 0 && this.board[i][j].player <= playerColors.length) {
                    // Draw player pieces
                    DrawCircle(playerColors[this.board[i][j].player-1], x, y, holeRadius*1.1);
                    DrawRoundImage(this.players[this.board[i][j].player-1].img, playerColors[this.board[i][j].player-1], x, y, holeRadius);
                }
                else if (this.board[i][j].player > playerColors.length) {
                    function DrawPieceText(c, t) {
                        let ts = holeRadius * 1.5;
                        ctx.fillStyle = c;
                        ctx.textAlign = "center";
                        ctx.font = 'bold '+ ts + 'px sans-serif';
                        ctx.fillText(t, x, y+(ts/2.75));
                    }

                    // Draw Non-player pieces
                    const pieceType = this.board[i][j].player;
                    switch (pieceType) {
                        case (playerColors.length + c4Special["petrified"].offset):
                            DrawCircle(this.nonPlayerColors[0], x, y, holeRadius);
                            break;
                        default:
                            const powerIndex = pieceType - playerColors.length;
                            const filteredObj = Object.filter(c4Special, power => power.offset === powerIndex);
                            const powerName = Object.keys(filteredObj)[0];
                            const powerObj = c4Special[powerName];
                            console.log("Drawing: ", powerName, powerObj, powerIndex, pieceType);
                            if (powerObj) {
                                DrawCircle(this.nonPlayerColors[1], x, y, holeRadius);
                                DrawPieceText(this.boardBGColor, powerObj.icon);
                            }
                            break;
                    }
                }
            }
        }

        /////////////////////////////////////////
        // Draw winning connections
        /////////////////////////////////////////
        if (this.hasWon) {
            const winThickness = spacing / 1.5;

            // outside caps
            let startPos = { x: winningSegments[0].x, y: winningSegments[0].y };
            let endPos = { x: winningSegments[winningSegments.length - 1].x, y: winningSegments[winningSegments.length - 1].y };
            DrawCircle(this.winOutlineColor, startPos.x, startPos.y, winThickness);
            DrawCircle(this.winOutlineColor, endPos.x, endPos.y, winThickness);

            // Make line to stroke
            ctx.beginPath();
            ctx.moveTo(winningSegments[0].x, winningSegments[0].y);
            for (let q = 1; q < winningSegments.length; q++) {
                ctx.lineTo(winningSegments[q].x, winningSegments[q].y);
            }

            // stroke outline
            ctx.strokeStyle = this.winOutlineColor;
            ctx.lineWidth = winThickness * 2;
            ctx.stroke();

            // stroke inner line
            ctx.strokeStyle = this.winColor;
            ctx.lineWidth = winThickness;
            ctx.stroke();
            ctx.beginPath();

            // inside caps
            DrawCircle(this.winColor, startPos.x, startPos.y, winThickness/2);
            DrawCircle(this.winColor, endPos.x, endPos.y, winThickness/2);
        }
    };
    // Place a piece
    this.PlacePiece = function(pos) {
        var prompt = "";
        // Get color by player turn
        if (this.turnRotation >= this.players.length) this.turnRotation = 0;
        //var piece = 0;
        //if ((this.turn % 2) == 0) piece = 1;
        //else piece = 2;

        // chosen position is too large
        if (((pos-1) > (this.boardWidth - 1)) || ((pos-1) < 0)) {
            prompt = "Umm... maybe try a number that's actually valid.";
            console.log("The player dumb and typed a number that's too large >:(");
            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'Connect4_Game_turn' + this.turn + '.png');
            return {p: prompt, a: attachment};
        }

        // place piece at pos
        var placed = false;
        for (var i = this.board.length-1; i > -1; i--) {
            //place if open
            if (this.board[i][pos-1].player == 0) {
                // Decay game mode
                this.DoDecay();
                
                //this.board[i][pos-1] = piece;
                // Get powerup if it exists
                const pieceType = this.board[0][pos-1].player;
                const gotPowerup = pieceType >= playerColors.length;
                // Remove powerup if we didn't place here
                if (i != 0) this.board[0][pos-1].player = 0;
                // Place piece
                this.board[i][pos-1].player = this.turnRotation + 1;
                placed = true;

                // Check if player won
                this.hasWon = this.CheckWinner();
                if (this.hasWon) {
                    this.winner = this.playerTurn;
                    this.players[this.turnRotation].isWinner = true;
                }

                // Check if board is full
                let otherPlayerPieces = [];
                var FullCount = 0;
                for (var i = 0; i < this.boardHeight; i++) {
                    for (var j = 0; j < this.boardWidth; j++) {
                        if (this.board[i][j].player != 0) 
                        {
                            // Count up board pieces
                            if (this.board[i][j].player == playerColors.length+1) FullCount++;
                            // Store this for attack powerups
                            if (this.board[i][j].player != (this.turnRotation + 1) && this.board[i][j].player < playerColors.length) otherPlayerPieces.push({r: i, c: j});
                        }
                    }
                }

                if (FullCount >= (this.boardHeight * this.boardWidth)) {
                    console.log("It's a tie.");
                    prompt = "It's a tie! YOU ALL LOSE!";
                    // Switch player turn
                    this.turn++;
                    this.turnRotation++;
                    if (this.turnRotation >= this.players.length) this.turnRotation = 0;
                    this.playerTurn = this.players[this.turnRotation].id;
                }
                else {
                    // Switch player turn
                    this.turn++;
                    this.turnRotation++;
                    if (this.turnRotation >= this.players.length) this.turnRotation = 0;
                    this.playerTurn = this.players[this.turnRotation].id;

                    //console.log(this.turn);
                    //console.log(this.turnRotation);
                    //console.log(this.playerTurn);
                    //if ((this.turn % 2) == 0) this.playerTurn = this.players[0];
                    //else this.playerTurn = this.players[1];

                    // Check if got powerup
                    let powerupPrompt = "";
                    if (gotPowerup) {
                        switch (pieceType) {
                            default:
                                const powerIndex = pieceType - playerColors.length;
                                const filteredObj = Object.filter(c4Special, power => power.offset === powerIndex);
                                const powerName = Object.keys(filteredObj)[0];
                                const powerObj = c4Special[powerName];
                                console.log("Drawing: ", powerName, powerObj, powerIndex);
                                // If this power exists, do its power
                                if (powerObj) {
                                    powerObj.Power(this, powerupPrompt); // function with the reference to this game
                                }
                                break;
                        }
                    }

                    // Place powerup in PowerUp game mode
                    this.DoPowerup();

                    // Set message
                    var mention = "<@" + this.playerTurn + ">";
                    prompt = `It is ${mention}'s turn.${powerupPrompt}`;
                }

                // End loop
                i = -1;
            }
            // if column is full
            if (i == 0 && placed == false) {
                // return an error "Column is filled"
                prompt = "This column is filled, maybe try an open slot... stinky!";
                console.log("The player dumb and can't see the column is full I guess...");
            }
        }
        
        // Change prompt is player wins
        if (this.hasWon) {
            var winMention = "<@" + this.winner + ">";
            prompt = "Hey " + winMention + ", you win! Good job, son! I'm proud of you.";

            // Set game to inactive
            this.isActive = false;
        }

        // Draw board
        this.DrawBoard();

        // Create discord attatchment
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'Connect4_Game_turn'+this.turn+'.png');
        return {p: prompt, a: attachment};
    };
    // Game modes
    this.DoDecay = function() {
        // Check to see if game mode is active and the selected number of turns have passed
        if (this.gameModes.includes("decay") && ((this.turn + 1) % this.decayProps.turns) == 0) {
            // Get all player pieces' positions
            var p = [];
            for (var i = 0; i < this.board.length; i++) {
                for (var j = 0; j < this.board[i].length; j++) {
                    if (this.board[i][j].player != 0 && this.board[i][j].player <= playerColors.length) p[p.length] = {x: j, y: i};
                }
            }
            // Pick a random piece
            var rand = getRandomInt(0, p.length);
            // Turn to an index 1 greater than the max possible player count
            this.board[p[rand].y][p[rand].x].player = playerColors.length +1; // the +1 is to change the index on the board correctly
            console.log("Piece has decayed");
        }
        else {
            //console.log("Can't decay");
        }
    }

    this.DoPowerup = function() {
        // Check to see if game mode is active and the selected number of turns have passed
        if (this.gameModes.includes("powerup") && ((this.turn + 1) % this.powerupProps.turns) == 0) {
            
            // Get all open cols
            let openCols = [];
            for (var c = 0; c < this.boardWidth; c++) {
                for (var r = 0; r < this.boardHeight; r++) {
                    if (this.board[r][c].player === 0) {
                        // If this row already has a powerup, end the loop
                        if (this.board[r][c].player >= playerColors.length +1) r = this.boardHeight;
                        else {
                            openCols.push(c); // Store this col index
                            r = this.boardHeight; // End looping on this col
                        }
                    }
                }
            }

            // If there are any open spots
            if (openCols.length > 0) {
                // Get random col
                const powerupCol = getRandomInt(0, openCols.length);
                const powerupType = this.powerupProps.types[getRandomInt(0, this.powerupProps.types.length)];

                // Player powerup
                this.board[0][openCols[powerupCol]].player = playerColors.length + c4Special[powerupType].offset; // TODO: change this so powerups are rendered instead
                console.log(`Powerup of type "${powerupType}" spawned at X: ${openCols[powerupCol] + 1}`);
            }
        }
        else {
            //console.log("Can't place powerup");
        }
    }
    // Check winner
    this.CheckWinner = function() {
        var rowWin = this.CheckRows();
        var colWin = this.CheckCols();
        var rDiagWin = this.CheckRDiags();
        var lDiagWin = this.CheckLDiags();

        if (rowWin || colWin || rDiagWin || lDiagWin) return true;
        else return false;
    }

    this.CheckRows = function() {
        let pos = [];
        // Loop through rows
        for (var r = 0; r < this.boardHeight; r++) {
            // new array to check
            var array = new Array();
            // fill array
            for (var c = 0; c < this.boardWidth; c++) {
                array[c] = this.board[r][c].player;
                pos[c] = { x:r, y:c };
            }
            // check array
            var win = CountConnectedPieces(array, pos, this.board);
            if (win) return win;
        }
        return false;
    }
    
    this.CheckCols = function() {
        let pos = [];
        // Loop through columns
        for (var c = 0; c < this.boardWidth; c++) {
            // new array to check
            var array = new Array();
            // fill array
            for (var r = 0; r < this.boardHeight; r++) {
                array[r] = this.board[r][c].player;
                pos[r] = { x:r, y:c };
            }
            // check array
            var win = CountConnectedPieces(array, pos, this.board);
            if (win) return win;
        }
        return false;
    }
    
    this.CheckRDiags = function() {
        var Ylength = this.boardHeight;
        var Xlength = this.boardWidth;
        var maxLength = Math.max(Xlength, Ylength);
        var array; // temporary array
        let pos;

        // Fill temp array
        for (var k = 0; k <= 2 * (maxLength - 1); ++k) {
            array = [];
            pos = [];
            for (var y = Ylength - 1; y >= 0; --y) {
                var x = k - y;
                if (x >= 0 && x < Xlength) {
                    array.push(this.board[y][x].player);
                    pos.push({ x:y, y:x });
                }
            }
            // Check array
            var win = CountConnectedPieces(array, pos, this.board);
            if (win) return win;
        }
        return false;
    }
    
    this.CheckLDiags = function() {
        var Ylength = this.boardHeight;
        var Xlength = this.boardWidth;
        var maxLength = Math.max(Xlength, Ylength);
        var array; // temporary array
        let pos = [];

        for (var k = 0; k <= 2 * (maxLength - 1); ++k) {
            array = [];
            pos = [];
            for (var y = Ylength - 1; y >= 0; --y) {
                var x = k - (Ylength - y);
                if (x >= 0 && x < Xlength) {
                    array.push(this.board[y][x].player);
                    pos.push({ x:y, y:x });
                }
            }
            // Check array
            var win = CountConnectedPieces(array, pos, this.board);
            if (win) return win;
        }
        return false;
    }

    function CountConnectedPieces(ar, pos, board) {
        var count = 0;
        var last = 0;
        let winningIndexes = [];
        for (var i = 0; i < ar.length; i++) {
            // if the cell has a piece in it
            if (ar[i] != 0 && ar[i] <= playerColors.length) {//myC4Game.playerColors.length) {
                // Check is piece is the same as the last
                //console.log(`this = ${ar[i]} : last = ${last}`);
                if (ar[i] == last) {
                    if (count == 0) {
                        // store index
                        winningIndexes.push(i-1);
                        count++;
                    }
                    // store index
                    winningIndexes.push(i);
                    count++;
                    // if there is enough in a row to win
                    if (count >= myC4Game.winCount) {
                        // Set all winning pieces isWinner = true
                        if (winningIndexes.length > 0) {
                            for (let q = 0; q < winningIndexes.length; q++) {
                                board[pos[winningIndexes[q]].x][pos[winningIndexes[q]].y].isWinner = true;
                            }
                        }
                        return true;
                    }
                }
                else {
                    winningIndexes = [];
                    count = 0;
                }
            }
            else {
                winningIndexes = [];
                count = 0;
            }
            // Log the piece
            last = ar[i];
        }
        return false;
    }
}

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

// Draw image
function DrawPicture(i) {
    // Setup canvas
    ch = canvas.height = i.height
    cw = canvas.width = i.width
    
    // Draw symbol
    ctx.drawImage(i, 0, 0, cw, ch)
    console.log("Card drawn")

    // Create discord attatchment
    return new Discord.MessageAttachment(canvas.toBuffer(), 'Drawn_Card.png')
}

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Util Functions
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/

Object.filter = (obj, predicate) => 
    Object.keys(obj)
          .filter( key => predicate(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} )

/*////////////////////////////////////////////////////////////////////
// Common
////////////////////////////////////////////////////////////////////*/

// Get random Integer in range (min - inclusive, max - exclusive)
function getRandomInt(min, max) {
    //min = Math.ceil(min);
    //max = Math.floor(max);
    //return Math.floor(Math.random() * (max - min + 1)) + min;
    return Math.floor(Math.random() * (max - min) ) + min;
}

// Shuffle array
function shuffle(ar) {
    //const { ar } = this;
    let m = ar.length, i;
    while(m) {
        i = Math.floor(Math.random() * m--);

        [ar[m], ar[i]] = [ar[i], ar[m]];
    }
    //return ar;
}

// Get time passed (Thanks to: https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site)
function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = seconds / 31536000;

    var result = "";

    if (interval > 1) {
        result = Math.floor(interval);
        if (result == 1) return result + " year";
        else return result + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        result = Math.floor(interval);
        if (result == 1) return result + " month";
        else return result + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        result = Math.floor(interval);
        if (result == 1) return result + " day";
        else return result + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        result = Math.floor(interval);
        if (result == 1) return result + " hour";
        else return result + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        result = Math.floor(interval);
        if (result == 1) return result + " minute";
        else return result + " minutes";
    }
    result = Math.floor(seconds);
    if (result == 1) return result + " second";
    else return result + " seconds";
}

// Get random date: console.log(randomDate(new Date(2012, 0, 1), new Date()));
// from: https://gist.github.com/miguelmota/5b67e03845d840c949c4
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/*////////////////////////////////////////////////////////////////////
// Loading
////////////////////////////////////////////////////////////////////*/

// Get user from mention
function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

// Get card
function GetCardFromDeck() {
    // Pick card and put away
    //
    var c = {
        card: playingCards[0],
        suitIndex: 0,
        suit: cardSuits[0],
        cardName: playingCards[0] + "-" + cardSuits[0]
    }
    c.card = playingCards[getRandomInt(0, playingCards.length-1)];
    c.suitIndex = getRandomInt(0, cardSuits.length-1);
    c.suit = cardSuits[c.suitIndex];
    c.cardName = c.card + "-" + c.suit;

    var drawAttempt = true;
    
    // if the card has already been drawn, put away
    while (drawnCards.includes(c.cardName)) {
        c.card = playingCards[getRandomInt(0, playingCards.length-1)];
        c.suitIndex = getRandomInt(0, cardSuits.length-1);
        c.suit = cardSuits[c.suitIndex];
        c.cardName = c.card + "-" + c.suit;
    }
    
    // put card away
    if (!drawnCards.includes(c.cardName)) drawnCards[drawnCards.length] = c.cardName;
    else drawAttempt = false;
    
    console.log("new card " + c.cardName);
    console.log(drawnCards);

    return c;
}

async function TryLoadImages(im, im2, callback) {
    try {
        if (im) await Canvas.loadImage(im);
        callback(im);
    } catch {
        console.log('Unable to load this image');
        callback(im2);
    }
}

async function LoadUserAvatar(user, then) {
    const uAvatar = user.displayAvatarURL({dynamic: true, format: "png"});
    // TODO: Use a try / catch here
    const profilePic = await Canvas.loadImage(uAvatar);
    then(profilePic);
}

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Bot Functions
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/

// Generate Complement
function Complement() {
    var responce = "you're a ";
    var adjectives = [
        "distinguished",
        "amazing",
        "fantastic",
        "humane",
        "infallible",
        "incorruptible",
        "sensational",
        "not stupid",
        "very nice",
        "good smelling",
        "friendly",
        "edifying",
        "stable",
        "grounded",
        "precious",
        "great",
        "cool",
        "stellar",
        "friggin' awesome",
        "neat",
        "beautiful"
    ];
    var noun = [
        "individual",
        "being",
        "soul",
        "anomaly",
        "friend",
        "personality",
        "leader",
        "entity",
        "person",
        "person",
        "fella",
        "saint",
        "angel",
        "legend"
    ];

    var times = Math.floor(Math.random() * 10);

    for (var i = 0; i < times; i++) {
        var pick = getRandomInt(0, adjectives.length -1);
        if (i > 0) responce += ", ";
        responce += adjectives[pick];
    }
    var pick = getRandomInt(0, noun.length -1);
    responce += " " + noun[pick];

    return responce;
}

// Generate Insult
var startWords = [
    "Hey, ",
    "Yo, ",
    "Listen, ",
    "Ok ok, ",
    "Umm... sooo, ",
    "Here's the thing, ",
    "That's it, ",
    "Dude! ",
    "Oi Mate, "
]

function Insult(self = false) {
    var starters = [
        "you're a ",
        "you remind me of a ",
        "you're kinda like a ",
        "you tend to be a ",
        "you can be a ",
        "you are, in my opinion, a ",
        "you've been a ",
        "you've been known in my town as a ",
        "you may be a "
    ];
    var adverbs = [
        "inoperablely",
        "unquantifiably",
        "genuinely",
        "morally",
        "subjectively",
        "contextually",
        "objectively",
        "sometimes",
        "usually",
        "often",
        "frequently",
        "infrequently",
        "understandably",
        "reasonably",
        "sequentially",
        "chronologically",
        "intermittantly",
        "periodically",
        "instantly",
        "coincidentally",
        "unusually",
        "haphazardly"
    ];
    var adjectives = [
        "stinky",
        "predictable",
        "smelly",
        "diaper-wearing",
        "farty",
        "dumpy",
        "ridiculous",
        "amateur",
        "bean-headed",
        "boneheaded",
        "bootlickin'",
        "irreparable",
        "useless",
        "reprehensible",
        "dogmatic",
        "bombastic",
        "socially inebriated",
        "morally ambiguous",
        "unparseable",
        "toad-eatin'",
        "apple-polishing",
        "dementia-having",
        "Zachly",
        "Shoe-Pukin'",
        "dorky",
        "underwhelming",
        "unpalatable",
        "baby brained",
        "in my opinion",
        "un-interesting",
        "unfinished",
        "uninteresting",
        "contemporary",
        "washed-up",
        "jelly-ass",
        "ineffectual",
        "rotten",
        "pant-shitting",
        "brown-nosed",
        "poo-nosed",
        "dick-dunkin'"
    ];
    var noun = [
        "individual",
        "lizard",
        "being",
        "soul",
        "anomaly",
        "enemy",
        "personality",
        "sheep",
        "sheeple",
        "entity",
        "person",
        "animal",
        "fart dick",
        "butt-nosed, poo man",
        "arfarfan'arf",
        "assbutt",
        "bum",
        "boob",
        "boober",
        "goober",
        "con man",
        "dick man",
        "dick",
        "specimen",
        "gorilla",
        "hog",
        "horse's necktie",
        "idiot sandwich",
        "incel",
        "incelulite",
        "jelly",
        "dumbass",
        "fart-catcher",
        "footman",
        "fart-sniffer",
        "donky bonker",
        "turd bomber",
        "has-been",
        "simp",
        "goblina",
        "Craig",
        "neck winder",
        "lozenge",
        "dunce"
    ];

    var responce = '';
    if (!self) responce = starters[getRandomInt(0, starters.length -1)];
    else responce = `I'm a `

    var times = Math.floor(Math.random() * 5);
    for (var i = 0; i < times; i++) {
        // Decide if it's an adverb or adjective
        var adv = Math.random() < 0.5;

        // Get on with it
        if (i > 0) responce += ", ";

        // Add insult
        if (adv) {
            //adjective
            var pick = getRandomInt(0, adjectives.length -1);
            responce += adjectives[pick];
        }
        else {
            //adverb
            var pick = getRandomInt(0, adverbs.length -1);
            responce += adverbs[pick];
        }
    }

    // One more adjective
    responce += ", ";
    responce += adjectives[getRandomInt(0, adjectives.length -1)];

    var pick = getRandomInt(0, noun.length -1);
    responce += " " + noun[pick] + "!";

    return responce;
}

// Generate Laugh
function LaughAlong() {
    var options = [
        "ha",
        "hah",
        "heh",
        "lol",
        "ROFL",
        "aw man", //5
        "dude",
        "bruh",
        ""
    ];
    var times = Math.floor(Math.random() * 20);
    var responce = "";
    for (var i = 0; i < times; i++) {
        var pick = getRandomInt(0, options.length -1);
        if (pick >= 5) {
            responce += " ";
            responce += options[pick];
            responce += " ";
        }
        else responce += options[pick];
    }

    responce += " that was funny!";
    return responce;
}

// Generate Face
function GenerateFace() {
    cw = ch = canvas.width = canvas.height = 512;
    ctx.clearRect(0,0,cw,ch);

    var h = getRandomInt(0, headImgs.length);
    var m = getRandomInt(0, mouthImgs.length);
    var n = getRandomInt(0, noseImgs.length);
    var e = getRandomInt(0, eyeImgs.length);
    
    var mouthPos = Math.random() * 100;
    var mouthW = 100 + Math.random() * 230;
    
    var eyeW = 80 + Math.random() * 100;
    var eyePos = 20 + Math.random() * 50;
    var eyeDist = 50 + Math.random() * 80;
    
    var noseW = 100 + Math.random() * 100;
    var nosePos = Math.random() * 50;
    
    // Head
    ctx.drawImage(headImgs[h], 0, 0, 512, 512);
    // Mouth
    ctx.drawImage(mouthImgs[m], 256 - (mouthW/2), 200 + mouthPos, mouthW, 200);
    // Eyes
    ctx.drawImage(eyeImgs[e], 256 - ((eyeW/2) + eyeDist), 80 + eyePos, eyeW, eyeW * 0.8);
    ctx.save();
    ctx.scale(-1,1);
    ctx.drawImage(eyeImgs[e], -256 - ((eyeW/2) + eyeDist), 80 + eyePos, eyeW, eyeW * 0.8);
    ctx.restore();
    // nose
    ctx.drawImage(noseImgs[n], 256 - (noseW/2), 130 + nosePos, noseW, noseW);
    
    console.log("Face drawn");

    // Create discord attatchment
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'Strangers_Face.png');
    return attachment
}

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Phrase Gen
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/

function GenPhrase() {
            
    // Pick sentence structure
    var str = PhraseDefs.structures[Math.floor(Math.random() * PhraseDefs.structures.length)];
    var phrase = "";
    
    // Console log
    var structString = "";
    for (var i = 0; i < str.length; i++) { structString += PhraseDefs.strucDef[str[i]] + " "; }
    console.log("Structure = " + structString);
    
    // Pick words
    for (var i = 0; i < str.length; i++) {
        switch (str[i]) {
            case 0:
                phrase += PhraseDefs.nouns[Math.floor(Math.random() * PhraseDefs.nouns.length)] + " ";
            break;
            case 1:
                phrase += PhraseDefs.adjectives[Math.floor(Math.random() * PhraseDefs.adjectives.length)] + " ";
            break;
            case 2:
                phrase += PhraseDefs.adverbs[Math.floor(Math.random() * PhraseDefs.adverbs.length)] + " ";
            break;
            case 3:
                phrase += PhraseDefs.verbs[Math.floor(Math.random() * PhraseDefs.verbs.length)] + " ";
            break;
            case 4:
                phrase += PhraseDefs.pronouns[Math.floor(Math.random() * PhraseDefs.pronouns.length)] + " ";
            break;
            case 5:
                phrase += PhraseDefs.possesiveNouns[Math.floor(Math.random() * PhraseDefs.possesiveNouns.length)] + " ";
            break;
            case 6:
                phrase += PhraseDefs.prepositions[Math.floor(Math.random() * PhraseDefs.prepositions.length)] + " ";
            break;
            case 7:
                phrase += PhraseDefs.conjunctions[Math.floor(Math.random() * PhraseDefs.conjunctions.length)] + " ";
            break;
            case 8:
                phrase += PhraseDefs.interjections[Math.floor(Math.random() * PhraseDefs.interjections.length)] + " ";
            break;
            case 9:
                phrase += PhraseDefs.articles[Math.floor(Math.random() * PhraseDefs.articles.length)] + " ";
            break;
            default:
                //phrase += nouns[Math.floor(Math.random() * nouns.length)] + " ";
            break;                     
        }
    }
    
    return phrase;
}

var PhraseDefs = {
    strucDef: [
        "noun",             // 0 = noun
        "adj",              // 1 = adj
        "adverb",           // 2 = adverb
        "verb",             // 3 = verb
        "pronouns",         // 4 = pronouns
        "possesiveNouns",   // 5 = possesiveNouns
        
        "pronouns",         // 6 = prepositions
        "pronouns",         // 7 = conjunctions
        "pronouns",         // 8 = interjections
        "articles"          // 9 = articles
    ],
    structures: [
        /*  old
        [ 1 ],
        [ 2 ],
        [ 0, 0 ],
        [ 1, 0 ],
        [ 2, 1, 0 ],
        [ 1, 0, 0 ],
        [ 0, 2 ],
        [ 0, 2, 0 ],
        [ 0, 2, 1, 3 ],
        [ 0, 2, 0, 3 ],
        [ 2, 0, 3 ],
        [ 1, 0, 2, 0 ],
        [ 1, 0, 2, 1, 0 ],
        [ 1, 0, 3, 2, 1, 0 ],
        [ 0, 2, 3, ],
        [ 0, 3, 2, ],
        [ 0, 3, 2, 0 ],
        [ 1, 0, 3, 2, 0 ]
        */
        //[ 3, 1, 0, 2, 3, 1, 0],
        //[ 0, 2, 2, 3, 0 ]
        [ 0, 3, 1, 0 ],
        [ 0, 3, 9, 1, 0 ]
    ],
    nouns: [
        // Names
        "Mitch",
        "Stanke",
        "Eric",
        "EEERIIIIICC",
        "Lydia",
        "Tony",
        "Kelly",
        "Justin",
        "Brittany",
        "Abbey",
        "brother",
        "sister",
        "momma",
        
        // Le gym
        "gym",
        "gymbo",
        "jimbo",
        "jimmy",
        "jimmy jam",
        "Jim",
        
        // Winona Themed
        "lizard man",
        "that lizard man",
        "Mah",
        "ChinLick Mah",
        "LockJaw Shmaw",
        "Watkins",
        "Winona Stink University",
        "WSU",
        "loaf",
        "Danillo",
        "Vanillo Danillo",
        "Roger Boulay",
        "Roger STINK ASS Boulay",
        "Roger BOOTYlay",
        "Adrian",
        
        // Stinky
        "poo",
        "poo poo",
        "poop",
        "is pooping",
        "poops",
        "diaper",
        "diapers",
        "pants",
        "booty",
        "booties",
        "ass",
        "asses",
        "ASS",
        "butt",
        "butts",
        "diarrhea",
        "explosive diarrhea",
        "shit",
        "shits",
        "stink",
        "bathroom",
        "trash can",
        "trash",
        
        // Homebrew memes
        "OOof",
        "pepperoni",
        
        // Tim and Eric
        "PoopTube",
        
        // Other / memes
        //"slow",
        //"fast",
        "swamp",
        "boys",
        "shirts",
        "shirt",
        "bepis",
    ],
    pronouns: [
        // Normal
        "Me",
        "I",
        "he",
        "she",
        "it",
        
        // Possesive
        "my",
        "your",
        "yo",
        "yall",
        "his",
        "hers",
        "its",
        "their",
        "someone's"
    ],
    possesiveNouns: [
        // Propper
        "Mitch's",
        "Stanke's",
        "Eric's",
        "Lydia's",
        "Tony's",
        "Kelly's",
        "Justin's",
        "Brittany's",
        "Abbey's",
        "brother's",
        "sister's",
        "momma's",
        "yo momma's",
        "Mah's",
        "Danillo's",
        "Roger's",
        "Adrian's",
        "WSU's",
        "gym's",
        "lizard man's"
    ],
    adjectives: [
        // Normal
        "ugly",
        "nice",
        "no",
        
        // Stinky
        "stinky",
        "smelly",
        "stanky",
        "farty",
        "poo-pooie",
        "poopie",
        "shitty",
        "ass",
        "ASS",
        "stinky ass",
        "stanky ass",
        "smelly ass",
        "swampy"
    ],
    adverbs: [
        // Normal
        "quickly",
        "slowly",
        "loudly",
        "stupidly",
        "painfully",
        "shittily",
        "very",
        "super",
        "extremely",
        "outrageously",
        "the most",
        
        // Stinky
        "stinkily"
    ],
    verbs: [
        // sense
        "eat",
        "ate",
        "eating",
        "sniff",
        "sniffin'",
        "sniffed",
        "taste",
        "tasted",
        "tasting",
        "feel",
        "felt",
        "feeling",
        "hear",
        "heard",
        "hearing",
        "slap",
        "slapped",
        "slapping",
        "shmack",
        "shmacked",
        "shmacking",
        
        // Stinky
        "poop",
        "pooped",
        "pooping",
        "fart",
        "farted",
        "farting",
        "stink",
        "stinkin'",
        "stank",
        "shit",
        "shat",
        "shitting",
        
        // Equal
        "is",
        "was",
        "will be",
        "used to be",
        "became",
        "will become",
        "will turn into",
        
        // location
        /*
        "am at",
        "is at",
        "was at",
        "going to",
        */
        "meeting",
        "met",
        "meet",
        "running",
        "ran",
        "left",
        "leaving"
    ],
    prepositions: [
        "over",
        "from",
        "at",
        "to",
        "around",
        "through",
        "during",
        "according to",
        "above",
        "besides"
    ],
    conjunctions: [
        "and",
        "an",
        "but",
        "or",
        "nor",
        "however",
        "moreover"
    ],
    interjections: [
        "OOooff!",
        "NANI!!!",
        "Bitch!"
    ],
    articles: [
        "a",
        "an",
        "the",
        "le"
    ]
}

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Log on and Load resources
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/
var headImgs, eyeImgs, noseImgs, mouthImgs, dogImages, catImages
client.once('ready', async () => {
    headImgs = [
        await Canvas.loadImage('./img/faceMaker/face1.png'),
        await Canvas.loadImage('./img/faceMaker/face2.png'),
        await Canvas.loadImage('./img/faceMaker/face3.png'),
        await Canvas.loadImage('./img/faceMaker/face4.png'),
		await Canvas.loadImage('./img/faceMaker/face5.png'),
		await Canvas.loadImage('./img/faceMaker/face6.png')
    ]

    eyeImgs = [
        await Canvas.loadImage('./img/faceMaker/eye1.png'),
        await Canvas.loadImage('./img/faceMaker/eye2.png'),
        await Canvas.loadImage('./img/faceMaker/eye3.png'),
        await Canvas.loadImage('./img/faceMaker/eye4.png'),
		await Canvas.loadImage('./img/faceMaker/eye5.png'),
		await Canvas.loadImage('./img/faceMaker/eye6.png')
    ]

    noseImgs = [
        await Canvas.loadImage('./img/faceMaker/nose1.png'),
        await Canvas.loadImage('./img/faceMaker/nose2.png'),
        await Canvas.loadImage('./img/faceMaker/nose3.png'),
        await Canvas.loadImage('./img/faceMaker/nose4.png'),
		await Canvas.loadImage('./img/faceMaker/nose5.png'),
		await Canvas.loadImage('./img/faceMaker/nose6.png')
    ]

    mouthImgs = [
        await Canvas.loadImage('./img/faceMaker/mouth1.png'),
        await Canvas.loadImage('./img/faceMaker/mouth2.png'),
        await Canvas.loadImage('./img/faceMaker/mouth3.png'),
        await Canvas.loadImage('./img/faceMaker/mouth4.png'),
		await Canvas.loadImage('./img/faceMaker/mouth5.png'),
		await Canvas.loadImage('./img/faceMaker/mouth6.png')
    ]
    
    cardSuitImages = [
        await Canvas.loadImage('./img/hearts.png'),
        await Canvas.loadImage('./img/diamonds.png'),
        await Canvas.loadImage('./img/clubs.png'),
        await Canvas.loadImage('./img/spades.png')
    ]

    console.log('CaperClone is online!')
})

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Get user message
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/
const prefix = '//'

client.on('message', async message => {
    
    // Check if the person sending the message is the bot owner
    let isBotOwner = message.author.username === botOwner

    var lowercaseMessage = message.content.toLowerCase()
    let muted = false

    //
    // Explicit commands
    //
    // ignore messgae if no prefix OR is from bot
    if (!message.content.startsWith(prefix) || message.author.bot) return
    // Remove the prefix from the message
    //const args = message.content.slice(prefix.length).split(/ +/); // .split(/ +/)
    const args = message.content.slice(prefix.length).trim().split(" ")
    // Convert commands to lowercase (makes the commands case-insensitive)
    const command = args.shift().toLowerCase()
    // User mention
    const mentionMe = "<@" + message.author.id + ">"
    
    //
    // am I a mod?
    //
    var IAmAMod = false
    // Check user's roles
    if (message.guild) { // Only check if this is a server message
        for (var i = 0; i < botAdminRoles.length; i++) {
            //if (message.member.hasPermission(botAdminRoles[i])) IAmAMod = true
            //message.member.roles.cache.has(<role id>)
            //Get discord role id using "\@<role name>" if "allow users to mention this role" is enabled
            if (message.member.roles.cache.some(r => r.name === botAdminRoles[i])) IAmAMod = true
        }
    }
    // If bot author
    if (message.author.id === process.env.BOTOWNER_DISCORDID) IAmAMod = true

    //
    // If the command matches any of the available commands, run the function
    //
    if (!muted || IAmAMod) {
        var commandFound = false
        for (const [key, value] of Object.entries(BotCommands)) {
            for (var i = 0; i < BotCommands[key].commands.length; i++) {
                // if command is found, exicute it
                if (command === BotCommands[key].commands[i] && !commandFound) {
                    commandFound = true
                    // If mod is required
                    if (BotCommands[key].mod) {
                        if (IAmAMod) BotCommands[key].function(message, mentionMe, args, IAmAMod, command)
                        else {
                            // Tell them they need better priv to do this
                            message.channel.send(`Sorry ${mentionMe}, you need to have admin privileges to do this.`)
                        }
                    }
                    // If no Mod is required
                    else BotCommands[key].function(message, mentionMe, args, IAmAMod, command)
                }
                if (commandFound) break
            }
            if (commandFound) break
        }

        if (!commandFound) {
            // Number commands
            if (parseInt(command) > 0 || parseInt(command) < 51) {
                // If playing connect 4
                if (myC4Game != null && myC4Game.isActive) {
                    // Check if it is my turn
                    if (myC4Game.playerTurn == message.author.id) {
                        // Check if position is valid
                        if (parseInt(command) <= myC4Game.boardWidth) {
                            // Remove last bot message
                            //...
                            message.channel.messages.fetch({ limit: 10 }).then(messages => {
                                console.log(`Received ${messages.size} messages`)
                                let hasDeleted = false
                                messages.forEach((message) => {
                                    if (!hasDeleted && message.author.equals(client.user)) {
                                        message.delete()
                                        hasDeleted = true
                                    }
                                    return
                                })
                                
                            })

                            // Place piece
                            var turn = myC4Game.PlacePiece(parseInt(command))
                            message.channel.send(turn.p, turn.a)
                        }
                        else {
                            // Not valid
                            message.channel.send("Nice try, you can't place anything there!")
                        }
                    }
                    else {
                        // It is not your turn
                        var mention = "<@" + myC4Game.playerTurn + ">"
                        message.channel.send("It is " + mention + " 's turn.")
                    }
                }
            }
            else message.channel.send(`"${prefix}${command}" is not a valid command. Type "${prefix}${BotCommands.help.commands[0]}" for a the list of all commands.`)
            //client.say(channel, "...")
        }
    }
})

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Messege commands
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/

const BotCommands = {
    //
    // Info commands
    //
    help: {
        commands: ["help"],
        mod: false,
        description: "Displays the available commands.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
        //function: function(client, channel, tags, message, self, mentionMe, args, IAmAMod) {
            var mes = [];
            let mCount = 0;
            mes[mCount] = `${mentionMe} Commands:`;
            let maxLeng = 1999;
            let content = "";
            // List all commands
            // The user is a Mod
            if (IAmAMod){
                for (const [key, value] of Object.entries(BotCommands)) {
                    if (BotCommands[key].mod) {
                        content = `\n${prefix}**${BotCommands[key].commands[0]}** ***(Mods only)*** - ${BotCommands[key].description}`;
                    }
                    else {
                        content = `\n${prefix}**${BotCommands[key].commands[0]}** - ${BotCommands[key].description}`;
                    }

                    // Split message into multiple messages
                    if ((mes[mCount].length + content.length) >= maxLeng) {
                        mCount++;
                        mes[mCount] += content;
                    }
                    else mes[mCount] += content;
                }
            }
            // The user is not a Mod
            else {
                for (const [key, value] of Object.entries(BotCommands)) {
                    if (!BotCommands[key].mod) {
                        content = `\n${prefix}**${BotCommands[key].commands[0]}** - ${BotCommands[key].description}`;

                        // Split message into multiple messages
                        if ((mes[mCount].length + content.length) >= maxLeng) {
                            mCount++;
                            mes[mCount] += content;
                        }
                        else mes[mCount] += content;
                    }
                }
            }

            //userMessage.channel.send(`${mentionMe}, check your DMs :wink:`);
            //client.users.cache.get(userMessage.author.id).send(mes);
            //userMessage.channel.send(`${mentionMe} here:\n${mes}`);
            for (var i = 0; i < mes.length; i++) {
                userMessage.channel.send(`${mes[i]}`);
            }
        }
    },
    about: {
        commands: ["about"],
        mod: false,
        description: "Displays information about this bot.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            // Show info about This bot
            userMessage.channel.send(fm.HiThere() + `My name is CaperClone! CaperCube made me 👍 I can do a bunch of things.\nMy Github repo is here: ${repoLink}\nType in "${prefix}help" to see the list of commands.`);
        }
    },
    //
    // Face Gen
    //
    face: {
        commands: ["face"],
        mod: false,
        description: "Generates a friendly face.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            // Send message
            var prompt = "";
            //var prompt = "This person runs up to you and tells you to give them all your money, what do you do?";
            userMessage.channel.send(prompt, GenerateFace());
        }
    },
    //
    // Create a Connect 4 Game
    //
    connect4: {
        commands: ['connect4', 'connect 4', 'c4', 'playconnect4', 'play connect4', 'play connect 4', 'play c4'],
        mod: false,
        description: "Starts a standard game of connect 4.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            // Actuall start the game
            if (myC4Game != null && myC4Game.isActive) userMessage.channel.send("The current connect 4 game has been stopped.");
            //myC4Game = new C4Game(userMessage.author.id, 7, 6, 4);
            myC4Game = new C4Game({id: userMessage.author.id, img: null, user: userMessage.author}, 7, 6, 4);
            LoadUserAvatar(userMessage.author, (a) => {
                for (let q = 0; q < myC4Game.players.length; q++) {
                    if (myC4Game.players[q].id == userMessage.author.id) myC4Game.players[q].img = a;
                }
            });
            //myC4Game = new C4Game(userMessage.author.id);

            // Message group
            userMessage.channel.send(mentionMe + " started a connect4 game.\nPlayer 2, type ''"+prefix+"join'' to join.");
        }
    },
    customconnect4: {
        commands: ['customc4', 'cc4'],
        mod: false,
        description: 'Starts a custom standard game of connect 4. (example: '+prefix+'cc4 10 14 3 4 decay = width: 10, height: 14, pieces to win: 3, players: 4, game mode(optional): decay)',
        function: function(userMessage, mentionMe, args, IAmAMod) {
            if ((args[0] != null) && (args[1] != null)) {
                // Set custom rules
                var bw = 7; // board width
                var bh = 6; // board height
                var wc = 4; // win count
                var pc = 2; // player count
                var gm = ["none"]; // game-mode
                if ((parseInt(args[0]) > 1) && (parseInt(args[0]) < 51)) bw = parseInt(args[0]); // board width
                if ((parseInt(args[1]) > 1) && (parseInt(args[1]) < 51)) bh = parseInt(args[1]); // board height
                if ((args[2] != null) && ((parseInt(args[2]) > 1) && (parseInt(args[2]) < 51))) wc = parseInt(args[2]); // win count
                if ((args[3] != null) && ((parseInt(args[3]) > 1) && (parseInt(args[3]) < (playerColors.length + 1)))) pc = parseInt(args[3]); // player count
                if ((args[4] != null)) gm = args[4]; // game-mode
                
                // if the chosen win count is impossible, cap it
                if (wc > bw) wc = bw;
                if (wc > bh) wc = bh;

                // Actuall start the game
                if (myC4Game != null && myC4Game.isActive) userMessage.channel.send("The current connect 4 game has been stopped.");
                //myC4Game = new C4Game(userMessage.author.id, bw, bh, wc, pc, gm);
                myC4Game = new C4Game({id: userMessage.author.id, img: null, user: userMessage.author}, bw, bh, wc, pc, gm);
                //LoadUserAvatar(userMessage.author, (a) => {myC4Game.players[myC4Game.players.length - 1].img = a;});
                LoadUserAvatar(userMessage.author, (a) => {
                    for (let q = 0; q < myC4Game.players.length; q++) {
                        if (myC4Game.players[q].id == userMessage.author.id) myC4Game.players[q].img = a;
                    }
                });

                // Message group
                userMessage.channel.send(mentionMe + " started a custom connect4 game.\nWidth: " + myC4Game.boardWidth + "\nHeight: " + myC4Game.boardHeight + "\nCount to win: " + myC4Game.winCount + "\nPlayers: " + myC4Game.expectedPlayerCount + "\nGame modes: " + myC4Game.gameModes[0] + "\n\nType ''"+prefix+"join'' to join.");
            }
            else {
                userMessage.channel.send(`Command is missing required arguments. Try something like ${prefix}cc4 [width] [height] [win count] [players] decay(optional)`);
            }
        }
    },
    join: {
        commands: ['join'],
        mod: false,
        description: "Joins an active game of Connect 4.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            // If room is available
            if (myC4Game != null && myC4Game.players.length < myC4Game.expectedPlayerCount) {
                // Join the game
                //myC4Game.players[myC4Game.players.length].id = userMessage.author.id;
                myC4Game.players.push({id: userMessage.author.id, img: null, user: userMessage.author});

                // Add player avatar to game
                /*
                LoadUserAvatar(userMessage.author, (a) => {
                    myC4Game.players[myC4Game.players.length - 1].img = a;
                    console.log(a);
                });
                */
                LoadUserAvatar(userMessage.author, (a) => {
                    for (let q = 0; q < myC4Game.players.length; q++) {
                        if (myC4Game.players[q].id == userMessage.author.id) myC4Game.players[q].img = a;
                    }
                });

                // Message group
                userMessage.channel.send(mentionMe + " joined!");
    
                // If all players have joined
                if (myC4Game.players.length >= myC4Game.expectedPlayerCount) {
                    // Set random starting player
                    //myC4Game.playerTurn = myC4Game.players[getRandomInt(0,2)];
                    shuffle(myC4Game.players);
                    myC4Game.playerTurn = myC4Game.players[0].id;
                    console.log(myC4Game.players);
    
                    // Start game
                    myC4Game.CreateBoard(myC4Game.boardWidth, myC4Game.boardHeight);
                    myC4Game.isActive = true;
                    var mention = "<@" + myC4Game.playerTurn + ">";
                    userMessage.channel.send("It is " + mention + " 's turn.\nType ''"+prefix+"'' + <1-" + myC4Game.boardWidth + "> to place a piece.");
                    
                    // Draw and send board
                    myC4Game.DrawBoard();
                    // Create discord attatchment
                    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'Connect4_Game_turn'+myC4Game.turn+'.png');
                    userMessage.channel.send("", attachment);
                }
                else userMessage.channel.send("Waiting for more players...");
            }
            else userMessage.channel.send("The game is full or no game exists.");
        }
    },
    undo: {
        commands: ['undo'],
        mod: false,
        description: "Undo an action in Connect 4.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            userMessage.channel.send("Hah! You can't actually undo an action.");
        }
    },
    endc4: {
        commands: ['endc4', 'end c 4', 'end c4', 'stopc4', 'stop c4', 'stop c 4'],
        mod: false,
        description: "Ends any active game of Connect 4.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            if (myC4Game != null) {
                myC4Game.isActive = false;
                userMessage.channel.send("The current connect 4 game has been stopped.");
            }
            else {
                userMessage.channel.send("There is no active Connect 4 game to end.");
            }
        }
    },
    //
    // Deck of cards
    //
    card: {
        commands: ['card'],
        mod: false,
        description: "Draws random a card from the deck.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            // Draw card
            var c = GetCardFromDeck();
            // Create discord attatchment
            const attachment = DrawCard(c);

            // Send message
            var prompt = mentionMe + " drew a " + c.card + " of " + c.suit + ".\nThere are " + (58 - drawnCards.length) + " cards left in deck.";
            if ((58 - drawnCards.length) > 0) {
                userMessage.channel.send(prompt, attachment);
            }
            else userMessage.channel.send("The deck is empty, please shuffle.");
        }
    },
    shuffle: {
        commands: ['shuffle', 'shiffle', 'suffle'],
        mod: false,
        description: "Shuffles the deck.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            drawnCards = [];
            userMessage.channel.send("the deck has been shuffled.");
        }
    },
    //
    // Complements and Insults
    //
    complement: {
        commands: ['complement', 'comlement', 'comp', 'compliment'],
        mod: false,
        description: `Gives the designated person a nice compliment (example: ${prefix}compliment [@user])`,
        function: function(userMessage, mentionMe, args, IAmAMod) {
            var sw = startWords[getRandomInt(0, startWords.length)];

            if (args[0] != null) {
                var responce = Complement();
                var mention = args[0];
                
                if (args[1] == "tts") userMessage.channel.send(sw + mention + ", " + responce, {tts: true});
                else userMessage.channel.send(sw + mention + ", " + responce);
            }
            else {
                var responce = Complement();
                userMessage.channel.send(sw + mentionMe + ", " + responce);
            }
        }
    },
    insult: {
        commands: ['insult' || command === 'inslut'],
        mod: false,
        description: `Gives the designated person a horrible insult (example: ${prefix}insult [@user])`,
        function: function(userMessage, mentionMe, args, IAmAMod) {
            var sw = startWords[getRandomInt(0, startWords.length)];

            if (args[0] != null) {
                var responce = Insult();
                var mention = args[0];
                
                if (args[1] == "tts") userMessage.channel.send(sw + mention + ", " + responce, {tts: true});
                else userMessage.channel.send(sw + mention + ", " + responce);
            }
            else {
                var responce = Insult();
                userMessage.channel.send(sw + mentionMe + ", " + responce);
            }
        }
    },
    //
    // Other commands
    //
    clearbotchat: {
        commands: ['clear', 'clearbot', 'clearchat', 'clean', 'cleanup', 'cleanchat', 'cleanbot'],
        mod: true,
        description: "Deletes the last 100 messages from this bot in this channel.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            userMessage.channel.messages.fetch({ limit: 100 }).then(messages => {
                console.log(`Received ${messages.size} messages`);
                //Iterate through the messages here with the variable "messages".
                messages.forEach(message => message.author.equals(client.user) && message.delete())
              })
        }
    },
    //
    // Debug commands
    //
    debugme: {
        commands: ["debugme"],
        mod: false,
        description: "Displays your user name, id, and @mention.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            var name = userMessage.author.username;
            var id = userMessage.author.id;
            var responce = "UserName: " + name + "\nid: " + id + "\nMention: " + mentionMe + "\nBotMod: " + IAmAMod;
            userMessage.channel.send(responce);
        }
    },
    admindebug: {
        commands: ["admindebug"],
        mod: true,
        description: "Tells you if you can use mod-only bot commands or not.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            userMessage.channel.send(`${mentionMe} is a bot mod. Congrats!`);
        }
    }
};

/*////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Login
//////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////*/
// "node ." in console to start Node.js server
// "nodemon ." in console to start Node.js server using nodemon wrapper (auto restarts server when updated)
// "Ctrl + C" in console to end Node.js server
// Last line of file
client.login(process.env.DISCORD_CODE);