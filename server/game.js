const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}

function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState() {
    return {
      players: [{
        pos: {
          x: 3,
          y: 10,
        },
        vel: {
          x: 1,
          y: 0,
        },
        snake: [
          {x: 1, y: 10},
          {x: 2, y: 10},
          {x: 3, y: 10},
        ],
      }, {
        pos: {
          x: 18,
          y: 10,
        },
        vel: {
          x: 0,
          y: 0,
        },
        snake: [
          {x: 20, y: 10},
          {x: 19, y: 10},
          {x: 18, y: 10},
        ],
      }],
      food: {},
      gridSize: GRID_SIZE,
    };
}


function gameLoop(state) {
    if(!state) {
        return
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    // Checking if player pos is NOT outside canvas

    // THIS IS FOR PLAYER 1
    // returns 2 because in multiplayer version 2 is player one loss
    if(playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2;
    } 

    // THIS IS FOR PLAYER 2
    if(playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        return 1;
    } 

    // check if x & y of food matches current x & y player pos
    if(state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        // pushes food into snake and adjusts pos object
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        randomFood(state);
    }

    if(state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        // pushes food into snake and adjusts pos object
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        randomFood(state);
    }

    // check if snake is moving, so we can update its body
    if(playerOne.vel.x || playerOne.vel.y) {
        // check if snake has not bumped into itself
        for (let cell of playerOne.snake) {
            if(cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2;
            }
        }

        // pushes a new pos into array, and removes last one, creating the illusion of a moving element
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.snake.shift();
    }

    if(playerTwo.vel.x || playerTwo.vel.y) {
        // check if snake has not bumped into itself
        for (let cell of playerTwo.snake) {
            if(cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                return 1;
            }
        }

        // pushes a new pos into array, and removes last one, creating the illusion of a moving element
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.snake.shift();
    }

    return false;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }

    // check that new food is not on TOP of snake when created
    for (let cell of state.players[0].snake) {
        if(cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }

    for (let cell of state.players[1].snake) {
        if(cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }

    state.food = food;
}

function getUpdatedVelocity(keyCode) {
    switch (keyCode) {
      case 37: { // left
        return { x: -1, y: 0 };
      }
      case 38: { // down
        return { x: 0, y: -1 };
      }
      case 39: { // right
        return { x: 1, y: 0 };
      }
      case 40: { // up
        return { x: 0, y: 1 };
      }
    }
  }