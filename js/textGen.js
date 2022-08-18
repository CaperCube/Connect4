// ToDo: Refactor & use these

///////////////////////////////////////////////
// Generate Complement
///////////////////////////////////////////////
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

///////////////////////////////////////////////
// Generate Insult
///////////////////////////////////////////////
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
    ]
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
    ]
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
    ]
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
    ]

    var responce = ''
    if (!self) responce = starters[getRandomInt(0, starters.length -1)]
    else responce = `I'm a `

    var times = Math.floor(Math.random() * 5)
    for (var i = 0; i < times; i++) {
        // Decide if it's an adverb or adjective
        var adv = Math.random() < 0.5

        // Get on with it
        if (i > 0) responce += ", "

        // Add insult
        if (adv) {
            //adjective
            var pick = getRandomInt(0, adjectives.length -1)
            responce += adjectives[pick]
        }
        else {
            //adverb
            var pick = getRandomInt(0, adverbs.length -1)
            responce += adverbs[pick]
        }
    }

    // One more adjective
    responce += ", "
    responce += adjectives[getRandomInt(0, adjectives.length -1)]

    var pick = getRandomInt(0, noun.length -1)
    responce += " " + noun[pick] + "!"

    return responce
}

///////////////////////////////////////////////
// Generate Laugh
///////////////////////////////////////////////
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

///////////////////////////////////////////////
// Generate a random phrase
///////////////////////////////////////////////
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