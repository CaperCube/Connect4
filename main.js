////////////////////////////////////////
// Packages ('import' requires node v13.2.0+ and `"type": "module"` to be in "package.json")
////////////////////////////////////////
// nodemon - restarts node server wheen file is saved
// Use "npm run watch" to run the nodemon version

import * as dotenv from 'dotenv'
dotenv.config()
import Discord from 'discord.js'
const client = new Discord.Client()
import Canvas from 'canvas'

// My js imports
import { getRandomInt, shuffle, timeSince, randomDate } from './js/utils.js'
import CanvasApp from './js/canvasApp.js'
import C4Game, { c4Numbers, c4Special, Piece, C4Player, playerColorArray } from './js/connect4.js'
import GenerateFace from './js/faceGen.js'
import { Complement, Insult, LaughAlong, GenPhrase } from './js/textGen.js'

const cApp = new CanvasApp()

////////////////////////////////////////////////////////////////////
// Global Vars
////////////////////////////////////////////////////////////////////

const repoLink = `https://github.com/CaperCube/Connect4`

// The Discord roles that allow use of "Mod-Only" commands
const botAdminRoles = ['ADMINISTRATOR', 'BotMod', 'STINKY BABY ADMIN']

// The owner of the bot, used for refering to the bot's creator
const botOwner = 'CaperCube'

////////////////////////////////////////////////////////////////////
// Playing card variables
////////////////////////////////////////////////////////////////////

const playingCards = [
    "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "Joker"
]
const cardSuits = [
    "Hearts", "Diamonds", "Clubs", "Spades"
]
var cardSuitImages
var drawnCards = []

////////////////////////////////////////////////////////////////////
// Connect4 variables
////////////////////////////////////////////////////////////////////

var myC4Game

////////////////////////////////////////////////////////////////////
// Util Functions
////////////////////////////////////////////////////////////////////

Object.filter = (obj, predicate) => 
    Object.keys(obj)
          .filter( key => predicate(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} )

////////////////////////////////////////////////////////////////////
// Loading Functions
////////////////////////////////////////////////////////////////////

// Get user from mention
function getUserFromMention(mention) {
	if (!mention) return

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1)

		if (mention.startsWith('!')) {
			mention = mention.slice(1)
		}

		return client.users.cache.get(mention)
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
    c.card = playingCards[getRandomInt(0, playingCards.length-1)]
    c.suitIndex = getRandomInt(0, cardSuits.length-1)
    c.suit = cardSuits[c.suitIndex]
    c.cardName = c.card + "-" + c.suit

    var drawAttempt = true
    
    // if the card has already been drawn, put away
    while (drawnCards.includes(c.cardName)) {
        c.card = playingCards[getRandomInt(0, playingCards.length-1)]
        c.suitIndex = getRandomInt(0, cardSuits.length-1)
        c.suit = cardSuits[c.suitIndex]
        c.cardName = c.card + "-" + c.suit
    }
    
    // put card away
    if (!drawnCards.includes(c.cardName)) drawnCards[drawnCards.length] = c.cardName
    else drawAttempt = false
    
    console.log("new card " + c.cardName)
    console.log(drawnCards)

    return c
}

// ToDo: replace all uses of this with "cApp.LoadUserAvatar()"
async function LoadUserAvatar(user, then, CanvasApp = cApp) {
    const uAvatar = user.displayAvatarURL({dynamic: true, format: "png"})
    // TODO: Use a try / catch here
    const profilePic = await Canvas.loadImage(uAvatar)
    then(profilePic)
}

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Log on and Load resources
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

let headImgs, eyeImgs, noseImgs, mouthImgs
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

// Handle Discord time-outs n stuff
client.on('unhandledRejection', error => console.error("Promise rejection:", error))

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Get user message
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

const prefix = '//'

client.on('message', async message => {

    // Function to delete bot messages
    const RemoveBotMessages = (count) => {
        message.channel.messages.fetch({ limit: count }).then(messages => {
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
    }
    
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
                //
                // If playing Connect 4
                //
                if (myC4Game != null && myC4Game.isActive) {
                    // Take turn
                    myC4Game.TakeTurn(
                        message.author.id,
                        command,
                        (text, attachment) => message.channel.send(text, attachment),
                        (count) => RemoveBotMessages(count)
                    )
                }
                //
                // If playing ...
                //
            }
            else message.channel.send(`"${prefix}${command}" is not a valid command. Type "${prefix}${BotCommands.help.commands[0]}" for a the list of all commands.`)
        }
    }
})

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Messege commands
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

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
            userMessage.channel.send(`CaperCube made me 👍 I can do a bunch of things, but mostly games.\nMy Github repo is here: ${repoLink}\nType in "${prefix}help" to see the list of commands.`);
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
            var prompt = ""
            userMessage.channel.send(prompt, GenerateFace(cApp, headImgs, eyeImgs, noseImgs, mouthImgs))
        }
    },
    //
    // Create a Connect 4 Game
    //
    connect4: {
        commands: ['connect4', 'c4', 'playconnect4', 'playc4'],
        mod: false,
        description: "Starts a standard game of connect 4.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            // End current game
            if (myC4Game != null && myC4Game.isActive) userMessage.channel.send("The current connect 4 game has been stopped.")

            // Actuall start the game
            myC4Game = new C4Game(cApp, {id: userMessage.author.id, img: null, user: userMessage.author}, 7, 6, 4)

            // Load player avatar
            LoadUserAvatar(userMessage.author, (a) => {
                for (let q = 0; q < myC4Game.players.length; q++) {
                    if (myC4Game.players[q].id == userMessage.author.id) myC4Game.players[q].img = a
                }
            })

            // Message group
            userMessage.channel.send(mentionMe + " started a connect4 game.\nPlayer 2, type ''"+prefix+"join'' to join.")
        }
    },
    customconnect4: {
        commands: ['customc4', 'cc4'],
        mod: false,
        description: `Starts a custom standard game of connect 4. (example: "${prefix}cc4 10 14 3 4" decay = width: 10, height: 14, pieces to win: 3, players: 4, game mode(optional): decay)`,
        function: function(userMessage, mentionMe, args, IAmAMod) {
            if ((args[0] != null) && (args[1] != null)) {
                // Set custom rules
                var bw = 7 // board width
                var bh = 6 // board height
                var wc = 4 // win count
                var pc = 2 // player count
                var gm = ["none"] // game-mode
                if ((parseInt(args[0]) > 1) && (parseInt(args[0]) < 51)) bw = parseInt(args[0]) // board width
                if ((parseInt(args[1]) > 1) && (parseInt(args[1]) < 51)) bh = parseInt(args[1]) // board height
                if ((args[2] != null) && ((parseInt(args[2]) > 1) && (parseInt(args[2]) < 51))) wc = parseInt(args[2]) // win count
                if ((args[3] != null) && ((parseInt(args[3]) > 1) && (parseInt(args[3]) < (playerColorArray.length + 1)))) pc = parseInt(args[3]) // player count
                if ((args[4] != null)) gm = args[4] // game-mode
                
                // if the chosen win count is impossible, cap it
                if (wc > bw) wc = bw
                if (wc > bh) wc = bh

                // Stop any current game
                if (myC4Game != null && myC4Game.isActive) userMessage.channel.send("The current connect 4 game has been ended.")
                
                // Actuall start the game
                myC4Game = new C4Game(cApp, {id: userMessage.author.id, img: null, user: userMessage.author}, bw, bh, wc, pc, gm)
                
                // Load user avatar
                LoadUserAvatar(userMessage.author, (a) => {
                    for (let q = 0; q < myC4Game.players.length; q++) {
                        if (myC4Game.players[q].id == userMessage.author.id) myC4Game.players[q].img = a
                    }
                })

                // Message group
                userMessage.channel.send(`${mentionMe} started a custom connect4 game.\nWidth: ${myC4Game.gameOptions.boardWidth}\nHeight: ${myC4Game.gameOptions.boardHeight}\nCount to win: ${myC4Game.gameOptions.winCount}\nPlayers: ${myC4Game.gameOptions.expectedPlayerCount}\nGame modes: ${myC4Game.gameOptions.gameModes[0]}\n\nType "${prefix}join" to join.`)
            }
            else {
                userMessage.channel.send(`Command is missing required arguments. Try something like: ${prefix}cc4 [width] [height] [win count] [players] decay(optional)`)
            }
        }
    },
    join: {
        commands: ['join'],
        mod: false,
        description: "Joins an active game of Connect 4.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            // If room is available
            if (myC4Game != null && myC4Game.players.length < myC4Game.gameOptions.expectedPlayerCount) {
                // Join the game
                myC4Game.players.push({id: userMessage.author.id, img: null, user: userMessage.author})

                // Add player avatar to game
                LoadUserAvatar(userMessage.author, (a) => {
                    for (let q = 0; q < myC4Game.players.length; q++) {
                        if (myC4Game.players[q].id == userMessage.author.id) myC4Game.players[q].img = a
                    }
                })

                // Message group
                userMessage.channel.send(mentionMe + " joined!")
    
                // If all players have joined
                if (myC4Game.players.length >= myC4Game.gameOptions.expectedPlayerCount) {
                    // Start Game
                    myC4Game.StartGame((text, attachment) => userMessage.channel.send(text, attachment), prefix)
                }
                else userMessage.channel.send("Waiting for more players...")
            }
            else userMessage.channel.send("The game is full or no game exists.")
        }
    },
    undo: {
        commands: ['undo'],
        mod: false,
        description: "Undo an action in Connect 4.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            if (myC4Game && myC4Game.isActive) {
                myC4Game.Undo((message, attachment) => userMessage.channel.send(message, attachment))
            }
            else {
                userMessage.channel.send(`There is no active game.`)
            }
        }
    },
    endc4: {
        commands: ['endc4', 'stopc4'],
        mod: false,
        description: "Ends any active game of Connect 4.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            if (myC4Game != null && myC4Game.isActive) {
                myC4Game.EndGame((text, attachment) => userMessage.channel.send(text, attachment))
            }
            else {
                userMessage.channel.send("There is no active Connect 4 game to end.")
            }
        }
    },
    //
    // Deck of cards
    //
    card: {
        commands: ['card', 'drawcard'],
        mod: false,
        description: "Draws random a card from the deck.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            // Draw card
            var c = GetCardFromDeck()
            // Create discord attatchment
            const attachment = new Discord.MessageAttachment(cApp.DrawCard(c, cardSuits, cardSuitImages), 'Drawn_Card.png')

            // Send message
            var prompt = mentionMe + " drew a " + c.card + " of " + c.suit + ".\nThere are " + (58 - drawnCards.length) + " cards left in deck."
            if ((58 - drawnCards.length) > 0) {
                userMessage.channel.send(prompt, attachment)
            }
            else userMessage.channel.send("The deck is empty, please shuffle.")
        }
    },
    shuffle: {
        commands: ['shuffle', 'shiffle', 'suffle'],
        mod: false,
        description: "Shuffles the deck.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            drawnCards = []
            userMessage.channel.send("the deck has been shuffled.")
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
            if (args[0] != null) {
                const mention = args[0]
                userMessage.channel.send(Complement(mention))
            }
            else {
                userMessage.channel.send(Complement(mentionMe))
            }
        }
    },
    insult: {
        commands: ['insult', 'inslut'],
        mod: false,
        description: `Gives the designated person a horrible insult (example: ${prefix}insult [@user])`,
        function: function(userMessage, mentionMe, args, IAmAMod) {
            if (args[0] != null) {
                const mention = args[0]
                userMessage.channel.send(Insult(mention))
            }
            else {
                userMessage.channel.send(Insult('', true))
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
            var name = userMessage.author.username
            var id = userMessage.author.id
            var responce = "UserName: " + name + "\nid: " + id + "\nMention: " + mentionMe + "\nBotMod: " + IAmAMod
            userMessage.channel.send(responce)
        }
    },
    admindebug: {
        commands: ["admindebug"],
        mod: true,
        description: "Tells you if you can use mod-only bot commands or not.",
        function: function(userMessage, mentionMe, args, IAmAMod) {
            userMessage.channel.send(`${mentionMe} is a bot mod. Congrats!`)
        }
    }
}

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Login
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// "node ." in console to start Node.js server
// "nodemon ." in console to start Node.js server using nodemon wrapper (auto restarts server when updated)
// "Ctrl + C" in console to end Node.js server
// Last line of file
client.login(process.env.DISCORD_CODE);