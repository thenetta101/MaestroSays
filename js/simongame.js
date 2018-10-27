
var CBGames = CBGames || {};
CBGames.SimonGame = CBGames.SimonGame || {
    isGameActive: false,
    isPaused: true,
    colorBlockMarker: "simonBlock",
    colorList: ["red","yellow","green","blue"],
    currentRound: 0,
    redSound: new Howl({src:["./sound/1cMONO16.wav"],
                        onplay: function() { CBGames.SimonGame.toggleColor("red"); },
                        onend: function() { CBGames.SimonGame.playOnEnd(); },
                        buffer: true }), //onplay: toggleColor("red"),
    yellowSound: new Howl({src:["./sound/2gMONO16.wav"],
                        onplay: function() { CBGames.SimonGame.toggleColor("yellow"); },
                        onend: function() { CBGames.SimonGame.playOnEnd(); },
                        buffer: true }),
    greenSound: new Howl({src:["./sound/3AminMONO16.wav"],
                        onplay: function() { CBGames.SimonGame.toggleColor("green"); },
                        onend: function() { CBGames.SimonGame.playOnEnd(); },
                        buffer: true }),
    blueSound: new Howl({src:["./sound/4fMONO16.wav"],
                        onplay: function() { CBGames.SimonGame.toggleColor("blue"); },
                        onend: function() { CBGames.SimonGame.playOnEnd(); },
                        buffer: true }),
    maxRounds: 10,
    
    generatedPattern: [],
    playlist: [],
    playerSequence: [],

    buildPattern: function() {
        this.generatedPattern.splice(0,this.generatedPattern.length); // clear() function workaround for ECMA arrays, now with zero performance impact!
        
        for(var i = 0; i < this.maxRounds; i++) { //build the pattern cap based on the max rounds, enabling difficulty selection
            this.generatedPattern.push(Math.floor(Math.random() * 4));
        }
        //console.log(this.generatedPattern);
    },
    nextRound: function() {
        if(this.validatePlayerSequence()) {
            this.playerSequence.splice(0,this.playerSequence.length);
            this.currentRound++;
            if(this.currentRound < this.maxRounds) { // keep going!
                
                this.PlaySequenceToNumber(this.currentRound + 1);

            } else { // you win, stop already!
                this.isPaused = true;
                this.isGameActive = false;

                var banner = $(".statusBanner");
                var ptext = banner.children("p");
                ptext.text("You Win! You've completed " + (this.currentRound) + " rounds, you're epic!");
                banner.show();
            }
        } else { // flash an error color to let the player know the sequence was wrong
             this.playerSequence.splice(0,this.playerSequence.length);
            $("#submitit").addClass("errorBtnColor").delay(300).queue(function() {
               $(this).removeClass("errorBtnColor").dequeue(); 
                setTimeout(function() {
                    CBGames.SimonGame.PlaySequenceToNumber(CBGames.SimonGame.currentRound + 1);
                },200);
            });          
            // start the round over           
        }
    },

    playGame: function() {
        if(this.isGameActive) {
            // notify player the game is active, and prompt for restart option
        } else {
            // reset the round count, build a new pattern for the game, start the game, notify the player the round started, and play the first sequence
            this.currentRound = 0; 
            this.buildPattern();
            this.isGameActive = true;
            this.isPaused = false;
            this.PlaySequenceToNumber(this.currentRound + 1);
        }
    },

    playOnEnd: function(e) {
        if(this.playlist.length > 0) {
            var soundId = this.playlist.shift();
            switch(soundId) {
                case 0:
                    this.redSound.play();
                    break;
                case 1:
                    this.yellowSound.play();
                    break;
                case 2:
                    this.greenSound.play();
                    break;
                case 3:
                    this.blueSound.play();
                    break;
            }
        }
    },

    PlaySequenceToNumber: function(num) {
        
        if(this.redSound.playing() || this.yellowSound.playing() || this.greenSound.playing() || this.blueSound.playing()) { 
            // don't start a sequence if audio is still playing, preventing runaway triggers. Will try again after the timeout.
            setTimeout(function() { CBGames.SimonGame.PlaySequenceToNumber(num); }, 150);
            return;
        }
        if(num > this.generatedPattern.length) {
            num = this.generatedPattern.length;
        }
        this.playlist.splice(0,this.playlist.length); // this works in place of a clear() function with ECMA arrays.

        for(var i = 0; i < num; i++) {
            this.playlist.push(this.generatedPattern[i]);   
        }
        //console.log(this.playlist);
        this.playOnEnd(0);
    },

    PlaySound: function(colorId) {
        var id = this.colorList.indexOf(colorId);
        switch(id) {
            case 0:
                this.redSound.play();
                break;
            case 1:
                this.yellowSound.play();
            break;
            case 2:
                this.greenSound.play();
                break;
            case 3:
                this.blueSound.play();
                break;
        }
    },

    showGameMenu: function() {
        this.isPaused = true;
        $("#freePlay").hide();
        $(".statusBanner").hide();
        $("#gameMenu").show();
    },

    toggleColor: function(buttonId) {
        $("#"+buttonId).animate({"opacity": 0.75 },200).delay(100).animate({"opacity": 1 },200);        
    },

    /**
     * Summary: Verify if the player sequence is correct first by checking length, then by performing a sequence check.
     */
    validatePlayerSequence: function() {
        this.isPaused = true; // disable player button presses while validating.
        var successfulRepeat = true;
        var roundLen = this.currentRound + 1;
        if( roundLen == this.playerSequence.length) {
            for(var i = 0; i < roundLen; i++) {
                if(this.playerSequence[i] != this.generatedPattern[i]) {
                    successfulRepeat = false;
                }
            }
        } else {
            successfulRepeat = false;
        }

        this.isPaused = false; // enable player button presses when done validating.
        return successfulRepeat;
    }

};

$(".simonBlock").click(function() {
    if(CBGames.SimonGame.isPaused == false) {
        var pressedId = this.id;

        CBGames.SimonGame.PlaySound(pressedId);
        if(CBGames.SimonGame.isGameActive) {
            CBGames.SimonGame.playerSequence.push(CBGames.SimonGame.colorList.indexOf(pressedId));
        } else {
            CBGames.SimonGame.generatedPattern.push(CBGames.SimonGame.colorList.indexOf(pressedId));
        }
    }
});

$("#playit").click(function() {
    CBGames.SimonGame.PlaySequenceToNumber(CBGames.SimonGame.maxRounds);
});

$("#submitit").click(function() {
    if(CBGames.SimonGame.isGameActive) {
        CBGames.SimonGame.nextRound();
    }    
});

$("#startGame").click(function() {
    if(CBGames.SimonGame.isGameActive == false) {
        var difficulty = parseInt(($("#difficultySetting").val()));
        if(difficulty == 0) {
            // selected free play, don't start the game just move the bar out of the way.
            $("#gameMenu").hide();
            $("#freePlay").show();
            CBGames.SimonGame.isPaused = false;
        } else {
            CBGames.SimonGame.maxRounds = difficulty;
            $("#gameMenu").hide();
            CBGames.SimonGame.playGame();
        }
        
    }    
});

$(".showGameMenu").click(function() {
    CBGames.SimonGame.showGameMenu();
});

$("#clearMix").click(function(){
    CBGames.SimonGame.generatedPattern.splice(0,CBGames.SimonGame.generatedPattern.length);
});

$("#playMix").click(function() {
    CBGames.SimonGame.PlaySequenceToNumber(CBGames.SimonGame.generatedPattern.length);
});