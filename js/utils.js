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