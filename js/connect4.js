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



////////////////////////////
// Refactor
////////////////////////////

/*
class C4Game {
    constructor(canvasApp, options = {}) {
        this.window = canvasApp
    }

    //
    // Functions for chat commads to call
    // Many of these should have callbacks to send the image to chat
    //

    // Create game
    // Join game
    // Start game

    // Do turn (place piece)

    // Use powerup

    // Check wins
}
*/