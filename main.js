var selectedDrinks = [],
    ALCOHOL_CONSTANTS = ['vodka', 'gin', 'cointreau', 'tequila', 'white-rum', 'dark-rum', 'coconut-liquor', 'grenadine'],
    NONALCOHOL_CONSTANTS = ['lime', 'mint', 'soda', 'pineapple-juice', 'orange-juice', 'coca-cola', 'tomato-juice'],
    RECIPES = {
        0: {
            name: 'Long Island Iced Tea',
            ingredients: ['gin', 'tequila', 'vodka', 'white-rum']
        },
        1: {
            name: 'Mojito',
            ingredients: ['lime', 'mint', 'soda', 'white-run']
        },
        2: {
            name: 'Pina Colada',
            ingredients: ['coconut-liquor', 'pineapple-juice', 'white-rum']
        },
        3: {
            name: 'Cosmopolitan',
            ingredients: ['cointreau', 'lime', 'vodka']
        },
        4: {
            name: 'Tequila Sunrise',
            ingredients: ['grenadine', 'orange juice', 'tequila']
        },
        5: {
            name: 'Daiquiri',
            ingredients: ['lime', 'white-rum']
        },
        6: {
            name: 'Margarita',
            ingredients: ['cointreau', 'lime', 'tequila']
        },
        7: {
            name: 'Sex on the Beach',
            ingredients: ['pineapple-juice', 'vodka']
        },
        8: {
            name: 'Cuba Libre',
            ingredients: ['coca-cola', 'white-rum']
        },
        9: {
            name: 'Bloody Mery',
            ingredients: ['tomato-juice', 'vodka']
        }
    },
    CONSTANTS = {
        STAGE_WIDTH: 1500,
        STAGE_HEIGHT: 800,
        BOTTLE_IMAGE_HEIGHT: 130,
        BOTTLE_IMAGE_WIDTH: 130,
        NEXT_ROW_OFF_SET: 170
    },
    index = Math.random() * 10 | 0,
    cocktail = RECIPES[index],
    stage = null,
    layer = null,
    backgroundLayer = null;

stage = new Kinetic.Stage({
    container: 'container',
    width: CONSTANTS.STAGE_WIDTH,
    height: CONSTANTS.STAGE_HEIGHT
});
backgroundLayer = new Kinetic.Layer();
layer = new Kinetic.Layer();

//Images must be in dom to set it in kinetic object
function loadImages(sources, callback, secondRow) {
    var images = {},
        loadedImages = 0,
        numImages = 0,
        src,
        desiredCocktail;

    numImages = Object.keys(sources).length;

    for (src in sources) {
        images[src] = new Image();
        images[src].onload = function () {
            if (++loadedImages >= numImages) {
                callback(images, numImages, secondRow);
            }
        };

        images[src].src = sources[src];
    }

    desiredCocktail = document.getElementById('cocktailName');
    desiredCocktail.innerHTML = cocktail.name;
}

function selectedDrinkIsUnique(drinksArray, drink) {
    var i,
        len = drinksArray.length;

    for (i = 0; i < len; i += 1) {
        if (drinksArray[i] === drink) {
            return false;
        }
    }

    return true;
}

function initStage(images, rowLength, secondRow) {
    var len = 0,
        BOTTLES_OFF_SET_POSITION = 100,
        bottleID,
        bottles = [],
        bottle,
        offsetY = 15,
        imageWidth = CONSTANTS.BOTTLE_IMAGE_WIDTH,
        imageHeight = CONSTANTS.BOTTLE_IMAGE_HEIGHT,
        background,
        img,
        nextRowConst = 0;

    var imageObj = new Image();
    imageObj.onload = function() {
        background = new Kinetic.Image({
            x: 0,
            y: 0,
            image: imageObj,
            width: 1500,
            height: 800
        });

        backgroundLayer.add(background);

        stage.add(backgroundLayer);
        stage.add(layer);
        stage.draw();

    };
    imageObj.src = 'images/background.png';

    //playing with y offset and image widht/height
    if (secondRow) {
        offsetY = secondRow;
        imageWidth -= 50;
    }

    for (bottleID = 0; bottleID < rowLength; bottleID += 1) { //alcohol bottles here
        if(bottleID === 4) {
            nextRowConst += CONSTANTS.NEXT_ROW_OFF_SET;
        }

        bottle = new Kinetic.Image({
            x: (bottleID % 4) * BOTTLES_OFF_SET_POSITION,
            y: offsetY + nextRowConst,
            image: images[bottleID],
            width: imageWidth,
            height: imageHeight,
            draggable: true
        });

        bottle.startX = bottle.attrs.x;
        bottle.startY = bottle.attrs.y;
        bottle.id = ALCOHOL_CONSTANTS[bottleID];

        if (secondRow) {
            bottle.id = NONALCOHOL_CONSTANTS[bottleID];
        }
        bottles.push(bottle);

        layer.add(bottle);
    }

    stage.add(layer);
    stage.draw();

    bottles.forEach(function (bottle) {
        bottle.addEventListener('dragstart', function () {
            //console.log(bottle.id);  // add the clicked alcohol to compare with constants
        });
    });

    bottles.forEach(function (bottle) {
        bottle.addEventListener('dragend', function () {
            function animFrame() {
                /** the bigger the ANYM_CCONST the smoother(slower) the bottle's retturn */
                var startX = bottle.startX,
                    startY = bottle.startY,
                    ANIM_CONST = 20,
                    dragendX = bottle.attrs.x,
                    dragendY = bottle.attrs.y,
                    deltaX = ((Math.abs(startX - dragendX)) / ANIM_CONST),
                    deltaY = ((Math.abs(startY - dragendY)) / ANIM_CONST);

                if (dragendX > startX) {
                    x = bottle.getX() - deltaX;

                    if (dragendY < startY) {
                        y = bottle.getY() + deltaY;
                    } else {
                        y = bottle.getY() - deltaY;
                    }

                    if (bottle.attrs.x >= startX) {
                        bottle.setX(x);
                        bottle.setY(y);
                        layer.draw();
                    }
                }
                else if (dragendX <= startX) {
                    x = bottle.getX() + deltaX;

                    if (dragendY < startY) {
                        y = bottle.getY() + deltaY;
                    } else {
                        y = bottle.getY() - deltaY;
                    }

                    if (bottle.attrs.x <= startX) {
                        bottle.setX(x);
                        bottle.setY(y);
                        layer.draw();
                    }
                }
                setTimeout(animFrame, 10);
            }

            // if (dragendX  && dragendY /* are over the shaker*/) {
            //     // do animate the puor
            // } else {
            //     //should we punish for not making it to the shaker? "are you drunk already?":)
            // }
            
            animFrame();

            if ((selectedDrinkIsUnique(selectedDrinks, bottle.id))) {
                selectedDrinks.push(bottle.id);
            }
            console.log(selectedDrinks);
            console.log(bottle.id);
        })
    })


    layer.on('mouseover', function (evt) {
        var shape = evt.shape;
        document.body.style.cursor = 'pointer';
        layer.draw();
    });

    layer.on('mouseout', function (evt) {
        var shape = evt.shape;
        document.body.style.cursor = 'default';
        layer.draw();
    });
}

var alcoholSources = generateImagePath(ALCOHOL_CONSTANTS, ''),
    nonalcoholSources = generateImagePath(NONALCOHOL_CONSTANTS, 'non-');

loadImages(alcoholSources, initStage);
loadImages(nonalcoholSources, initStage, CONSTANTS.NEXT_ROW_OFF_SET * 2);

var myButton = document.getElementById('myButton');

myButton.addEventListener('click', function (ev) {
    selectedDrinks.sort(function (firstIngredient, secondIngredient) {
        var sortedDrinks = firstIngredient.localeCompare(secondIngredient);
        return sortedDrinks;
    });

    var areEqual = true;

    if (!selectedDrinks.length) {
        areEqual = false;
    }

    for (var i = 0, len = selectedDrinks.length; i < len; i += 1) {
        if (selectedDrinks[i] !== cocktail.ingredients[i]) {
            areEqual = false;
        }
    }

    if (areEqual) {
        endScreen();
    }

    console.log(areEqual);
});

//END SCREEN
//Fireworks in case you win the game
function endScreen() {
    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight,
        mousePos = {
            x: 400,
            y: 300
        },

        // create canvas
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        particles = [],
        MAX_PARTICLES = 300;

    document.addEventListener("mousemove", function (e) {
        e.preventDefault();
        mousePos = {
            x: e.clientX,
            y: e.clientY
        };
    });

    function loop() {
        // update screen size
        if (SCREEN_WIDTH != window.innerWidth) {
            canvas.width = SCREEN_WIDTH = window.innerWidth;
        }
        if (SCREEN_HEIGHT != window.innerHeight) {
            canvas.height = SCREEN_HEIGHT = window.innerHeight;
        }
    
        // clear canvas
        context.fillStyle = "rgba(0, 0, 0, 0.1)";
        context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        makeParticle(5);

        var existingParticles = [];

        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
    
            // render and save particles that can be rendered
            if (particles[i].exists()) {
                particles[i].render(context);
                existingParticles.push(particles[i]);
            }
        }
    
        // update array with existing particles - old particles should be garbage collected
        particles = existingParticles;

        while (particles.length > MAX_PARTICLES) {
            particles.shift();
        }
    }

    function makeParticle(count) {
        var particle,
            angle,
            speed;

        for (var i = 0; i < count; i++) {
            particle = new Particle(mousePos);
            angle = Math.random() * Math.PI * 2;
            speed = Math.random() * 10 + 2;

            particle.vel.x = Math.cos(angle) * speed;
            particle.vel.y = Math.sin(angle) * speed;

            particle.size = 10;
    
            // particle.fade = 0.02;
            particle.gravity = 0.2;
            particle.resistance = 0.92;
            particle.shrink = 0.92;

            particle.flick = true;

            particles.push(particle);
        }
    }

    function Particle(pos) {
        this.pos = {
            x: pos.x,
            y: pos.y
        };
        this.vel = {
            x: 0,
            y: 0
        };
        this.shrink = .97;
        this.size = 2;

        this.resistance = 1;
        this.gravity = 0;

        this.flick = false;

        this.alpha = 1;
        this.fade = 0;
        this.color = Math.floor(Math.random() * 360 / 10) * 10;
    }

    Particle.prototype.update = function () {
        // apply resistance
        this.vel.x *= this.resistance;
        this.vel.y *= this.resistance;
    
        // gravity down
        this.vel.y += this.gravity;
    
        // update position based on speed
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    
        // shrink
        this.size *= this.shrink;
    
        // fade out
        this.alpha -= this.fade;
    }

    Particle.prototype.render = function (c) {
        if (!this.exists()) {
            return;
        }

        c.save();

        c.globalCompositeOperation = 'lighter';

        var x = this.pos.x,
            y = this.pos.y,
            r = this.size / 2;

        var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
        gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
        gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
        gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");


        c.fillStyle = gradient;

        c.beginPath();
        c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
        c.closePath();
        c.fill();

        c.restore();
    }

    Particle.prototype.exists = function () {
        return this.alpha >= 0.01 && this.size >= 1;
    }

    function init() {
        document.body.innerHTML = '';
        document.body.appendChild(canvas);
        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;
        setInterval(loop, 1000 / 30);
    }

    init();
}

//private method for generating image path for alcohol and non-alcohol images
//separated in different folder names according function prefix parameter
function generateImagePath(items, prefix) {
    var sources = {};
    for (var i = 0; i < items.length; i++) {
        sources[i] = './images/' + prefix + 'alcohol/' + items[i] + '.png';
    }

    return sources;
}