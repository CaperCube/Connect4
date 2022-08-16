module.exports = {
    Resources() {
        this.path = "./img/faceMaker/";
        this.imagePath = this.path + "eye1.jpg";
        //this.eyeImg = new dom.Image();

        //this.eyeImg.src = this.imagePath;
    },
    /*
    Resources() {}
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // Resources
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    const imgPath = "./img/faceMaker/";

    // const heads = [
    //     imgPath + "head1.jpg",
    //     imgPath + "head2.jpg",
    //     imgPath + "head3.jpg"
    // ];

    const eyes = [
        imgPath + "eye1.jpg",
        imgPath + "eye2.jpg",
        imgPath + "eye3.jpg"
    ];

    const noses = [
        imgPath + "nose1.jpg",
        imgPath + "nose2.jpg",
        imgPath + "nose3.jpg"
    ];

    const mouths = [
        imgPath + "mouth1.jpg",
        imgPath + "mouth2.jpg",
        imgPath + "mouth3.jpg"
    ];

    // var headImgs = [
    //     new Image(),
    //     new Image(),
    //     new Image()
    // ];

    var eyeImgs = [
        new dom.Image(),
        new dom.Image(),
        new dom.Image()
    ];

    var noseImgs = [
        new dom.Image(),
        new dom.Image(),
        new dom.Image()
    ];

    var mouthImgs = [
        new dom.Image(),
        new dom.Image(),
        new dom.Image()
    ];

    // Load all heads
    // for (var i = 0; i < eyeImg.length; i++) {
    //     eyeImgs[i].src = eyes[i];
    // }

    // Load all eyes
    for (var i = 0; i < eyeImgs.length; i++) {
        eyeImgs[i].src = eyes[i];
    }

    // Load all noses
    for (var i = 0; i < noseImgs.length; i++) {
        noseImgs[i].src = noses[i];
    }

    // Load all mouths
    for (var i = 0; i < mouthImgs.length; i++) {
        mouthImgs[i].src = mouths[i];
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // Global vars
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    var canvas = dom.document.createElement('canvas');
    var ch, cw;
    cw = ch = canvas.height = canvas.width = 512;
    var ctx = canvas.getContext('2d');

    var imagesLoaded = 0;

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // Functions
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////

    // draws parts to canvas
    function GenerateFace(callback) {
        
        //var h = getRandomInt(0, headImg.length-1);
        var m = getRandomInt(0, mouthImgs.length-1);
        var n = getRandomInt(0, noseImgs.length-1);
        var e = getRandomInt(0, eyeImgs.length-1);
        
        // Head
        //ctx.drawImage(headImg[h], 0, 0, 256, 256);
        
        // Mouth
        ctx.drawImage(mouthImgs[m], 0, 340, 512, 170);
        
        // nose
        ctx.drawImage(noseImgs[n], 0, 170, 512, 170);
        
        // Eyes
        ctx.drawImage(eyeImgs[e], 0, 0, 256, 170);
        ctx.save();
        ctx.scale(-1,1);
        ctx.drawImage(eyeImgs[e], -512, 0, 256, 170);
        ctx.restore();
        
        console.log("Face drawn");
        
        var uri = ctx.canvas.toDataURL("image/png");
        callback(uri);
    }

    // Util
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
*/
    HiThere() {
        return "Hi There!";
    }
};