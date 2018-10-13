//VARIABLES ====================================
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 480;
canvas.height = 852;
var centerDiv = $("#center");
centerDiv.append(canvas);
var alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S",
"T", "U", "V", "W", "X", "Y", "Z"];
var letters = [];
var word = [];
var allWords = [];
var longWord;
var i = 0;
var randyCounter = 4;
var bgReady = false;
var letterReady = false;
var bgImage = new Image();
var xCor = [10, 130, 250, 370];
var randy = 2;
var mouseDown = false;
var mousePosX;
var mousePosY;
var score = 0;
var number = 10;
var Letter = function()
{
    this.random = Math.floor(Math.random()* 26);
    this.value = alphabet[this.random];
    this.x = xCor[randy];
    this.y = -100;
    this.image = new Image();
    this.isStopped = false;

}
var letter;
var keysDownCurrent = {};
var keysDownPrevious = {};

addEventListener("keydown", function (e) {
	keysDownCurrent[e.keyCode] = true;
});

addEventListener("keyup", function(e) {
    keysDownCurrent[e.keyCode] = false;
});
//FUNCTIONS ====================================

bgImage.onload = function() {
    bgReady = true;
};
bgImage.src = "assets/images/smoke.jpg";


//looks for stacking
function colFilled(col) {
    var counter = 0;
    for (var i = 0; i < letters.length; i++)
    {
      if(letters[i].x === col && letters[i].isStopped === true)
      {
        counter++;
      }
    }
    switch (counter)
    {
      case 0:
        return 742;
        break;
      case 1:
        return 632;
        break;
      case 2:
        return 522;
        break;
      case 3:
        return 412;
        break;
      case 4:
        return 300;
        break;
    }
}

//returns true if there is a letter that should block current letter.
function collisionRight() {
  if(colFilled(letter.x+120)+5 < letter.y)
  {
    return true;
  }
  else
  {
    return false;
  }
}

//returns true if there is a letter that should block current letter.
function collisionLeft() {
  if(colFilled(letter.x-120)+5 < letter.y)
  {
    return true;
  }
  else
  {
    return false;
  }
}

//elimanates full column from possible spawn point
function randyFunk() {
  if(randyCounter < 0)
  {
    return;
  }

  for (var i = 0; i < xCor.length; i++)
  {
    if(colFilled(xCor[i]) === 300)
    {
      xCor.splice(i,1);
      randyCounter--;
    }
  }
  randy = Math.floor(Math.random()*randyCounter);
}

//the main game loop
var main = function () {
	render();
    update();
	requestAnimationFrame(main);
};

//controls tetris style movement of letter blocks as they fall
var update = function() {
    if (letter.y < colFilled(letter.x) && !letter.isStopped)
    {
        letter.y += 10;

        if (keysDownCurrent[37] && !keysDownPrevious[37] && letter.x > 10 && !collisionLeft()) {
            letter.x -= 120;
        }
        if (keysDownCurrent[39] && !keysDownPrevious[39] && letter.x < 370 && !collisionRight()) {
            letter.x += 120;
        }
        if(letter.y >= colFilled(letter.x))
        {
          if(letters.length < 15)
          {
            letterReady = false;
          }
            letter.isStopped = true;
            randyFunk();
            loop();
        }
    }
    keysDownPrevious = Object.assign({}, keysDownCurrent);
};

//draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
    for (var i = 0; i < letters.length; i++) {
        if(letterReady) {
          ctx.drawImage(letters[i].image, letters[i].x , letters[i].y);
        }
    }
}

//drops letters until boggle board is full
function loop() {
    if(i === 16) {
        $("#timer").html("<p>Time Remaining: 90</p>");
        $("#score").html("<p>Score: 0</p>");
        intervalId = setInterval(decrement, 1000);
        //console.log(letters);
        return;
    }
    letter = new Letter();
    letters.push(letter);

    letter.image.onload = function() {
        letterReady = true;
    };
    letter.image.src = "assets/images/" + alphabet[letter.random] + ".png";
    letter.image.inactive = "assets/images/" + alphabet[letter.random] + ".png";
    letter.image.active = "assets/images/" + alphabet[letter.random] + "-active.png";
    i++;
}

//gets the position of the mouse within the canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

//gets the letters that the user selects for the current word
function getLetter() {
    for (var i = 0; i < letters.length; i++) {
        if (mousePosX >= letters[i].x + 5 && mousePosX <= letters[i].x + 95 && mousePosY >= letters[i].y + 5 && mousePosY <= letters[i].y + 95) {
            if (word[word.length -1] !== letters[i].value){
                word.push(letters[i].value);
            }
        }
    }
}

//compiles letters into a word
function getWord() {
    var wordString = word.toString().replace(/,/g, "").toLowerCase();
    console.log(wordString);
    word = [];
    if (allWords.indexOf(wordString) === -1) {
        $.get("/api/checkWord/" + wordString, function(data) {
            if (data === "No such entry found" || data === "Residual") {
                return;
            }
            else {
                allWords.push(wordString);
                var length = wordString.length;
                switch(length) {
                    case 2:
                        score += 10;
                        break;
                    case 3:
                        score += 25;
                        break;
                    case 4:
                        score += 100;
                        break;
                    case 5:
                        score += 150;
                        break;
                    case 6:
                        score += 200;
                        break;
                    case 7:
                        score += 250;
                        break;
                    case 8:
                        score += 300;
                        break;
                    case 9:
                        score += 375;
                        break;
                    case 10:
                        score += 450;
                        break;
                    case 11:
                        score += 550;
                        break;
                    case 12:
                        score += 650;
                        break;
                    case 13:
                        score += 800;
                        break;
                    case 14:
                        score += 900;
                        break;
                    case 15:
                        score += 1000;
                        break;
                    case 16:
                        score += 2000;
                        break;
                }
            }
        });
    }
}


function findLong() {
  longWord = allWords[0];
  for (var i = 1; i < allWords.length; i++)
  {
    if(allWords[i].length > longWord.length)
    {
      longWord = allWords[i];
    }
  }
}


//controlls the timer for the boggle portion of the game

function decrement() {
    number--;
    $("#timer").html("<p>Time Remaining: " + number + "</p>");
    $("#score").html("<p>Score: " + score + "</p>");

    if (number === 0) {
      var userId = sessionStorage.getItem("key");
        clearInterval(intervalId);
        findLong();
        $("#timer").html("<p>Time's Up!</p>");
        $(canvas).hide();

        var scores = {
          score: score,
          word: longWord,
          userId: userId
        };

        console.log(scores);
        $.post("/api/addScore", scores).done(function(data)
        {
          //to update leaderboard with new score
          $.get("/api/highScore", function(data)
          {
            for (var i = 0; i < data.length; i++)
            {
              console.log(data[i].User.name);
              console.log(data[i].score);
            }
          });

          //updates leaderboard with new long words.
          $.get("/api/long", function(data)
          {
            console.log(data);
            for (var i = 0; i < data.length; i++)
            {
              console.log(data[i].User.name);
              console.log(data[i].word);
            }
          });
        });
    }
}

function activeLetter() {
    for (var i = 0; i < letters.length; i++) {
        if (mousePosX >= letters[i].x + 5 && mousePosX <= letters[i].x + 95 && mousePosY >= letters[i].y + 5 && mousePosY <= letters[i].y + 95) {
            if (mouseDown) {
                letters[i].image.src = letters[i].image.active;
            }
            else {
                for (var i = 0; i < letters.length; i++) {
                    letters[i].image.src = letters[i].image.inactive;
                }
            }
        }
    }
}

function startGame () {
    loop();
    main();
}

function preLoad ()
//MAIN PROCESS =================================
startGame();

canvas.addEventListener("mousemove", function(evt) {
    if (mouseDown) {
        var mousePos = getMousePos(canvas, evt);
        mousePosX = mousePos.x;
        mousePosY = mousePos.y;
        getLetter();
        activeLetter();
    }
}, false);

canvas.addEventListener("mousedown", function() {
    mouseDown = true;
});

canvas.addEventListener("mouseup", function() {
    mouseDown = false;
    getWord();
    activeLetter();
});
