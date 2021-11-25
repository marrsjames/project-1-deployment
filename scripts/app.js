const canvas = document.querySelector("#background");
const heliCanvas = document.querySelector("#heli");
const topBlockContext = canvas.getContext("2d");
const bottomBlockContext = canvas.getContext("2d");
const heliContext = heliCanvas.getContext("2d");
const background = document.querySelector("body");
const currentScore = document.querySelector("#score");
const currentLevel = document.querySelector("#level");
const img = new Image();
img.src = "assets/heli.png";
const explosionImg = new Image();
explosionImg.src = "assets/explosion.png";
topBlockContext.fillStyle = "yellow";
const bonusPointImg = new Image();
bonusPointImg.src = "assets/bonus.png";
let one = 1;
let heliXInitial = 200;
const canvasWidth = 400;
const canvasHeight = 300;
let initialBlockHeights = 20;
let score = 0;
let isRunning = false;
let level = 1;
let testarray = {
  xPosition: [],
  yPosition: [],
  xSize: [],
  ySize: [],
};
let bonusArray = {
  xPosition: [],
  yPosition: [],
  width: 60,
  height: 60,
};
let heliWidth = 50;
let heliHeight = heliWidth / 3;
currentScore.textContent = score;
currentLevel.textContent = level;

const helicopter = {
  xPosition: heliXInitial,
  yPosition: 0,
  xMoveInitial: 0,
  yMoveInitial: 1,
  width: heliWidth,
  height: heliHeight,
  frontAdjustment: -8,
  topAdjustment: -50,
};

let randomBlockArray = {
  xPosition: [],
  yPosition: [],
  width: [],
  height: [],
};

let bonusIconArray = {
  xPosition: [],
  yPosition: [],
  width: [],
  height: [],
};

let xMove = helicopter.xMoveInitial;
let yMove = helicopter.yMoveInitial;

const topBlockLimits = {
  height: initialBlockHeights,
};
const bottomBlockLimits = {
  height: initialBlockHeights,
};

/////this function makes the mountain arrays that will then be drawn in the 'rungame' function
function makeMountainArrays() {
  topMountainArray = [];
  bottomMountainArray = [];

  //pre entering cave 400 parts///////
  //top & bottom - empty for first 400 parts
  let topBlockY = 0;
  let bottomBlockY = 0;
  for (let i = 0; i <= canvasWidth - 1; i++) {
    topMountainArray.push(0);
    bottomMountainArray.push(0);
  }

  /// slope into cave///////////
  //top
  for (let i = canvasWidth; i <= canvasWidth + topBlockLimits.height - 1; i++) {
    topMountainArray.push(i - canvasWidth);
  }

  //bottom
  for (
    let i = canvasWidth;
    i <= canvasWidth + bottomBlockLimits.height - 1;
    i++
  ) {
    bottomMountainArray.push(i - canvasWidth);
  }

  //cave enter and reset of game. max height of mountaints getting higher every 1000 game positions aka 1 level ////////////////
  //top
  topBlockY = topBlockLimits.height;
  let topCounter = 0;
  for (let i = 500; i <= 99999; i++) {
    if (topCounter % 1000 === 0 && topCounter > 0) {
      topBlockLimits.height += 20;
    }
    topMountainArray.push(topBlockY);
    randNo = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
    if (randNo === 5) {
      one = -one;
    }

    if (topBlockY + one <= 0) {
      one = -one;
    } else if (topBlockY + one >= topBlockLimits.height) {
      one = -one;
    }
    topBlockY = topBlockY + one;
    topCounter++;
  }

  //bottom
  bottomBlockY = bottomBlockLimits.height;
  let bottomCounter = 0;
  for (let i = 500; i <= 99999; i++) {
    if (bottomCounter % 1000 === 0 && bottomCounter > 0) {
      bottomBlockLimits.height += 20;
    }
    bottomMountainArray.push(bottomBlockY);
    randNo = Math.floor(Math.random() * (50 - 1 + 1)) + 1;
    if (randNo === 5) {
      one = -one;
    }

    if (bottomBlockY + one <= 0) {
      one = -one;
    } else if (bottomBlockY + one >= bottomBlockLimits.height) {
      one = -one;
    }
    bottomBlockY = bottomBlockY + one;
    bottomCounter++;
  }
}
makeMountainArrays();

function makeRandomBlockArrays() {
  //random blocks
  let levelAddition = 0;
  for (let i = 3; i <= 13; i++) {
    for (let j = 0; j < i; j++) {
      xPositionRandNo = Math.floor(Math.random() * 1000) + 1;
      testarray.xPosition.push(xPositionRandNo + levelAddition);
      yPositionRandNo = Math.floor(Math.random() * 200) + 1 + 50;
      testarray.yPosition.push(yPositionRandNo);
      xSizeRandNo = Math.floor(Math.random() * 100) + 1;
      testarray.xSize.push(xSizeRandNo);
      ySizeRandNo = Math.floor(Math.random() * 100) + 1;
      testarray.ySize.push(ySizeRandNo);
    }
    levelAddition += 1000;
  }

  //bonus blocks
  levelAddition = 0;
  for (let i = 0; i <= 13; i++) {
    for (let j = 0; j < i; j++) {
      xPositionRandNo = Math.floor(Math.random() * 1000) + 1;
      bonusArray.xPosition.push(xPositionRandNo + levelAddition);
      yPositionRandNo = Math.floor(Math.random() * 200) + 1 + 50;
      bonusArray.yPosition.push(yPositionRandNo);
    }
    levelAddition += 1000;
  }
}

makeRandomBlockArrays();
let gamePosition = 0;

let gameContinue = true;
//this function makes the game run. the  mountain values are drawn and random blocks are drawn.
//the mountain arrays move fromright to left while heli stays in position so it appears as  tho heli is moving
//game position increases each time function is ran (set by setInterval)
//game position relates to iterations in the mountain arrays. these are compared with co-ordinates of heli to detect collision
//
function runGame() {
  const handlegame = setInterval(() => {
    heliCanvas.addEventListener("click", reset);
    isRunning = true;
    //top and bottom mountains
    topBlockContext.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i <= canvasWidth; i++) {
      topBlockContext.fillRect(i, 0, 1, topMountainArray[gamePosition + i]);
    }
    for (let i = 0; i <= canvasWidth; i++) {
      bottomBlockContext.fillRect(
        i,
        canvasHeight - bottomMountainArray[gamePosition + i],
        1,
        bottomMountainArray[gamePosition + i]
      );
    }

    function collisionHappens(X, Y) {
      heliCanvas.removeEventListener("click", reset);
      isRunning = false;
      clearInterval(handlegame);
      heliContext.drawImage(explosionImg, X, Y - 30, 80, 73);
      setTimeout(endGame, 1000);
    }

    //random blocks
    //every 1000... random amount of randomly placed blocks getting larger and more frequent
    // should the random blocks be 1 extra per level or a random number getting more regular?

    //initial space where set is empty
    let blockplacement = canvasWidth;

    // draw the random array and add it to a new array (with game position info)
    for (let j = 0; j <= testarray.xPosition.length; j++) {
      topBlockContext.fillRect(
        blockplacement - gamePosition + testarray.xPosition[j],
        testarray.yPosition[j],
        testarray.xSize[j],
        testarray.ySize[j]
      );
      randomBlockArray.xPosition.push(
        blockplacement - gamePosition + testarray.xPosition[j]
      );
      randomBlockArray.yPosition.push(testarray.yPosition[j]);
      randomBlockArray.width.push(testarray.xSize[j]);
      randomBlockArray.height.push(testarray.ySize[j]);
    }

    // put bonus point icons in
    // for (let j = 0; j <= bonusArray.xPosition.length; j++) {
    //   topBlockContext.drawImage(
    //     bonusPointImg,
    //     blockplacement - gamePosition + bonusArray.xPosition[j],
    //     bonusArray.yPosition[j],
    //     bonusArray.width,
    //     bonusArray.height
    //   );
    //   bonusIconArray.xPosition.push(
    //     blockplacement - gamePosition + bonusArray.xPosition[j]
    //   );
    //   bonusIconArray.yPosition.push(bonusArray.yPosition[j]);
    // }

    heliMovement();

    function heliMovement() {
      //clear, place and move heli
      heliContext.clearRect(0, 0, canvasWidth, canvasHeight);
      heliContext.drawImage(
        img,
        helicopter.xPosition,
        helicopter.yPosition,
        helicopter.width,
        helicopter.height
      );

      helicopter.yPosition += yMove;

      //detect front on collision with random block)
      //100 BEing a limited size of the massive array of random blocks
      for (let j = 0; j <= 100; j++) {
        //if x position heli is same as block
        if (
          gamePosition +
            heliXInitial +
            helicopter.width +
            helicopter.frontAdjustment ===
          randomBlockArray.xPosition[j]
        ) {
          //if y position is same as block
          for (l = 0; l <= helicopter.height; l++) {
            if (
              helicopter.yPosition + l >= randomBlockArray.yPosition[j] &&
              helicopter.yPosition + l <=
                randomBlockArray.yPosition[j] + randomBlockArray.height[j]
            ) {
              collisionHappens(helicopter.xPosition, helicopter.yPosition);
              break;
            }
          }
          break;
        }
      }

      //detect front on collision with BONUS
      for (let j = 0; j <= 100; j++) {
        //if x position heli is same as block
        if (
          gamePosition +
            heliXInitial +
            helicopter.width +
            helicopter.frontAdjustment ===
          bonusIconArray.xPosition[j]
        ) {
          //if y position is same as block
          for (l = 0; l <= helicopter.height; l++) {
            if (
              helicopter.yPosition + l >= bonusIconArray.yPosition[j] &&
              helicopter.yPosition + l <=
                bonusIconArray.yPosition[j] + bonusArray.height
            ) {
              console.log("bonus crash front");
              break;
            }
          }
          break;
        }
      }

      //detect collision on bottom with random block////////
      for (let j = 0; j <= 100; j++) {
        //   //if Y position is same as top of block
        if (
          helicopter.yPosition + helicopter.height >=
            randomBlockArray.yPosition[j] &&
          helicopter.yPosition + helicopter.height <=
            randomBlockArray.yPosition[j] + 1
        ) {
          for (k = 0; k <= helicopter.width; k++) {
            if (
              gamePosition + heliXInitial + k + helicopter.frontAdjustment >=
                randomBlockArray.xPosition[j] &&
              gamePosition + heliXInitial + k + helicopter.frontAdjustment <=
                randomBlockArray.xPosition[j] + randomBlockArray.width[j]
            ) {
              collisionHappens(helicopter.xPosition, helicopter.yPosition);
              break;
            }
          }
          break;
        }
      }

      //detect collision on bottom with bonus point////////
      for (let j = 0; j <= 100; j++) {
        //   //if Y position is same as top of block
        if (
          helicopter.yPosition + helicopter.height >=
            bonusIconArray.yPosition[j] &&
          helicopter.yPosition + helicopter.height <=
            bonusIconArray.yPosition[j] + 1
        ) {
          for (k = 0; k <= helicopter.width; k++) {
            if (
              gamePosition + heliXInitial + k + helicopter.frontAdjustment >=
                bonusIconArray.xPosition[j] &&
              gamePosition + heliXInitial + k + helicopter.frontAdjustment <=
                bonusIconArray.xPosition[j] + bonusArray.width
            ) {
              console.log("bonus crash on bottom of icon");
              break;
            }
          }
          break;
        }
      }

      //detect collision on top with random block////////
      for (let j = 0; j <= 100; j++) {
        //   //if Y position is same as top of block
        if (
          helicopter.yPosition >=
            randomBlockArray.yPosition[j] + randomBlockArray.height[j] &&
          helicopter.yPosition <=
            randomBlockArray.yPosition[j] + 1 + randomBlockArray.height[j]
        ) {
          //      console.log('hit')
          for (k = 0; k <= helicopter.width; k++) {
            if (
              gamePosition + heliXInitial + k + helicopter.frontAdjustment >=
                randomBlockArray.xPosition[j] &&
              gamePosition + heliXInitial + k + helicopter.frontAdjustment <=
                randomBlockArray.xPosition[j] + randomBlockArray.width[j]
            ) {
              collisionHappens(helicopter.xPosition, helicopter.yPosition);
              break;
            }
          }
          break;
        }
      }

      //detect collision on top with bonus icon////////
      for (let j = 0; j <= 100; j++) {
        //   //if Y position is same as top of block
        if (
          helicopter.yPosition >=
            bonusIconArray.yPosition[j] + bonusIconArray.height &&
          helicopter.yPosition <=
            bonusIconArray.yPosition[j] + 1 + bonusIconArray.height
        ) {
          //      console.log('hit')
          for (k = 0; k <= helicopter.width; k++) {
            if (
              gamePosition + heliXInitial + k + helicopter.frontAdjustment >=
                bonusIconArray.xPosition[j] &&
              gamePosition + heliXInitial + k + helicopter.frontAdjustment <=
                bonusIconArray.xPosition[j] + bonusIconArray.width
            ) {
              console.log("bonus crash on top of icon");
              break;
            }
          }
          break;
        }
      }

      //heli collision top
      for (let i = 0; i <= helicopter.width; i++) {
        if (
          helicopter.yPosition <=
          topMountainArray[gamePosition + heliXInitial + i]
        ) {
          collisionHappens(helicopter.xPosition, helicopter.yPosition);
          break;
        }

        //heli collision bottom RANDOM BLOCKS bottom detection NEEDS ADDING TOO
        else if (
          helicopter.yPosition + helicopter.height >=
          canvasHeight - bottomMountainArray[gamePosition + heliXInitial + i]
        ) {
          collisionHappens(helicopter.xPosition, helicopter.yPosition);
          break;
        } else {
          //   console.log('safe')
          background.classList.remove("collision");
        }
      }
    }

    if (gameContinue === true) {
      gamePosition++;
    }

    if (gamePosition >= heliXInitial - helicopter.width) {
      if (gamePosition % 10 === 0) {
        score++;
        currentScore.textContent = score;
        if (score % 100 === 0) {
          level++;
          currentLevel.textContent = level;
        }
      }
    }
  }, 10);
}
//run the above function
runGame();

////detection of key presses that affect helicopter placement
function onkeydown(e) {
  //up key
  if (e.keyCode === 38) {
    if (gameContinue === true) {
      yMove = -1.5;
    }
  }
  //down key
  if (e.keyCode === 40) {
    if (gameContinue === true) {
      yMove = helicopter.yMoveInitial + 0.5;
    }
  }
}

function onkeyup(e) {
  //up key
  if (e.keyCode === 38) {
    yMove = helicopter.yMoveInitial;
  }
}

///what is seen when game ended. cleans the page. sets it red. score / level stop and play again button appears
function endGame() {
  background.classList.add("collision");
  const btn = document.createElement("button");
  btn.setAttribute("id", "play-again");
  btn.innerHTML = "play again?";
  background.appendChild(btn);
  heliContext.clearRect(0, 0, canvasWidth, canvasHeight);
  topBlockContext.clearRect(0, 0, canvasWidth, canvasHeight);
  topBlockContext.clearRect(0, 0, canvasWidth, canvasHeight);

  const buttonClick = document.querySelector("#play-again");
  function handleClick() {
    reset();
  }
  buttonClick.addEventListener("click", handleClick);
}

//this resets everything. score / level. ne
function reset() {
  const removeButton = document.getElementById("play-again");
  if (removeButton) {
    removeButton.parentNode.removeChild(removeButton);
  }
  helicopter.xPosition = heliXInitial;
  helicopter.yPosition = 0;
  xMove = helicopter.xMoveInitial;
  yMove = helicopter.yMoveInitial;
  gamePosition = 0;
  testarray = {
    xPosition: [],
    yPosition: [],
    xSize: [],
    ySize: [],
  };
  //   makeMountainArrays()
  randomBlockArray = {
    xPosition: [],
    yPosition: [],
    width: [],
    height: [],
  };
  makeRandomBlockArrays();
  score = 0;
  level = 1;
  gameContinue = true;
  currentLevel.textContent = level;
  currentScore.textContent = score;
  if (!isRunning) {
    runGame();
  }
}

window.addEventListener("keydown", onkeydown);
window.addEventListener("keyup", onkeyup);

//  heliCanvas.addEventListener('click', runGame)
