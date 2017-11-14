 import React from 'react';
 import ReactDOM from 'react-dom';
 import payload from 'redux-payload';
 import Redux from 'redux';
 import _ from 'lodash';
 import './index.min.css';


const { Component } = React;
const { createStore } = Redux;
const { update } = React.addons;
const BATCH = 'BATCH_ACTIONS';
let actions=[];

// initial state
const initialState = {
  //our grid is an array of arrays
  entities: [[]],
  //the dungeon level we use when generating entities
  dungeonLevel: 0,
  //the array containing the coordinated
  playerPosition: []
};

const createBoard = (state = initialState, { type, payload }) => {
  switch (type) {
    case 't.CHANGE_ENTITY': {
      //here we use the update function from 'react-addons-update' library
      //basically we are just creating a new object(updating) from the entitites arrays
      //and changing the only entities[y][x]
      const [x, y] = payload.coords;
      const entities =	update(state.entities, {
				[y]: {
					[x]: {$set: payload.entity }
				}
			});

      return { ...state, entities };
    }
    case 't.CHANGE_PLAYER_POSITION':
    return{ ...state,playerPosition: payload };
    case't.CREATE_LEVEL':
      return {
        ...state,
        playerPosition: payload.playerPosition,
        entities: payload.entities
       };
       case 't.SET_DUNGEON_LEVEL':
       return { ...state, dungeonLevel: payload };
    default:
      return state;
  }
};
// end of initial state

function enableBatching(reducer) {
  return function batchingReducer(state, action) {
    switch (action.type) {
      case BATCH:
      return action.payload.reduce( reducer, state );
      default:
      return reducer(state, action);
    }
  }
}

// start of actions//
function changeEntity(entity, coords) {
  return {
    type: 't.CHANGE_ENTITY',
    payload: { entity, coords }
  };
}

function changePlayerPosition(payload) {
  return {
    type: 't.CHANGE_PLAYER_POSITION',
    payload
  };
}

function createLevel(level) {
  return {
    type: 't.CREATE_LEVEL',
    payload: createEntities(createDungeon(), level)
  };
}

function setDungeonLevel(payload) {
  return {
    type: 't.SET_DUNGEON_LEVEL',
    payload
  };
}

function batchActions(actions) {
  return {type: BATCH, payload: actions}
}
//end of actions//

const GRID_HEIGHT = 40;
const GRID_WIDTH = 40;
const MAX_ROOMS = 15;
const ROOM_SIZE_RANGE = [7, 12];

const c= { GRID_HEIGHT, GRID_WIDTH, MAX_ROOMS, ROOM_SIZE_RANGE};

const createDungeon = () => {
  const roomPlacementValid = (grid, {x, y, width =1, height =1}) => {
    if (y < 1 || y + height > grid.length - 1) {
      return false;
    }
    if (x < 1 || x + width > grid[0].length - 1) {
      return false;
    }
    //check if on or next to existing room
    for(let i = y - 1; i < y + height + 1; i++) {
      for (let j = x - 1; j < x + width + 1; j++) {
        if (grid[i][j].type === 'floor') {
          return false;
        }
      }
    }
    //all grid cells clear??
    return true;
  };

  const placeCells = (grid, {x, y, width = 1, height = 1, id}, type = 'floor') => {
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        grid[i][j] = {type, id};
      }
    }
    return grid;
  };

  const createRoomsFromSeed = (grid, {x, y, width, height}, range = c.ROOM_SIZE_RANGE) => {
    const [min, max] = range;
    const roomValues = [];

    //NORTH
    const north = {height: _.random(min, max), width: _.random(min,max) };
    north.x = _.random(x, x + width -1);
    north.y = y - north.height - 1;
    north.doorx = _.random(north.x, (Math.min(north.x + north.width, x + width)) - 1);
    north.doory = y - 1;
    north.id = 'N';
    roomValues.push(north);

    //EAST
    const east = { height: _.random(min,max), width: _.random(min,max) };
    east.x = x + width + 1;
    east.y = _.random(y, height + y - 1);
    east.doorx = east.x - 1;
    east.doory = _.random(east.y, (Math.min(east.y + east.height, y + height)) - 1);
    east.id = 'E';
    roomValues.push(east);

    //SOUTH
    const south = { height: _.random(min,max), width: _.random(min,max) };
    south.x = _.random(x, width + x - 1);
    south.y = y + height + 1;
    south.doorx = _.random(south.x, (Math.min(south.x + south.width, x + width)) - 1);
    south.doory = y + height;
    south.id = 'S';
    roomValues.push(south);

    //WEST
    const west = { height: _.random(min, max), width: _.random(min, max) };
    west.x = x - west.width - 1;
    west.y = _.random(y, height + y - 1);
    west.doorx = x - 1;
    west.doory = _.random(west.y, (Math.min(west.y + west.height, y + height))-1);
    west.id = 'W';
    roomValues.push(west);

    const placedRooms = [];
    roomValues.forEach(room => {
      if (roomPlacementValid(grid, room)) {
        //place room
        grid = placeCells(grid, room);
        //place door
        grid = placeCells(grid, {x: room.doorx, y: room.doory}, 'door');
        //need placed room values for the next seeds
        placedRooms.push(room);
      }
    });
    //console.log(placedRooms);
    return {grid, placedRooms};
  };
  //build out the map

  //1. make a grid of 'empty' cells with random opacity value for styling
  let grid = [];
  for(let i = 0; i < c.GRID_HEIGHT; i++) {
    grid.push([]);
    for (let j = 0; j < c.GRID_WIDTH; j++) {
      grid[i].push({type: 0, opacity: _.random(0.3, 0.8)});
    }
  }

 //2. random values for the 1st room
  const [min, max] = c.ROOM_SIZE_RANGE;
  const firstRoom = {
    x: _.random(1, c.GRID_WIDTH - max - 15),
    y: _.random(1, c.GRID_HEIGHT - max - 15),
      height: _.random(min, max),
      width: _.random(min, max),
    id: 'O'
  };
  //3.place the 1st room on the grid
  grid = placeCells(grid, firstRoom);

  //4. using the 1st room as a seed, recursively add rooms to the grid
  const growMap = (grid, seedRooms, counter = 1, maxRooms = c.MAX_ROOMS) =>  {
    if (counter + seedRooms.length > maxRooms || !seedRooms.length) {
      return grid;
    }
    grid = createRoomsFromSeed(grid, seedRooms.pop());
    seedRooms.push(...grid.placedRooms);
    counter += grid.placedRooms.length;
    return growMap(grid.grid, seedRooms, counter);
  };
  //console.log(firstRoom);
  return growMap(grid, [firstRoom]);
};
//////////////////////////////
const createEntities = (gameMap, level = 1) => {
  const bosses = [];
  if (level === 4) {
    bosses.push({
      health: 400,
      level: 5,
      type: 'boss'
    })
  }
  const enemies = [];
  for (let i = 0; i < 7; i++) {
    enemies.push({
      health: level * 30 + 40,
      level: _.random(level, _.random(level - 1 ? level - 1 : level, level + 1)),
      type: 'enemy'
    });
  }

  const exits = [];
  if (level < 4) {
    exits.push({
      type: 'exit'
    });
  }
  const players = [
    {
      type: 'player'
    }
  ];
  const potions = [];
  for (let i = 0; i < 5; i++) {
    potions.push({ type: 'potion' });
  }
  const weaponTypes = [
    { name: 'Rusty Claw', damage: 15 },
    { name: 'New Claw', damage: 19 },
    { name: 'Strong Claw', damage: 26 },
    { name: 'RoboClaw', damage: 28 },
    { name: 'Fresh Pincer', damage: 30 },
    { name: 'Mechanical Pincer', damage: 33 },
    { name: 'Hydraulic Pincer', damage: 40 },
    { name: 'Demi-God Pincer', damage: 43 }
  ];
  const weapons = [];
  // weapon types will vary based on the level passed to the parent function
  const qualifying = weaponTypes
  .filter(weapon => weapon.damage < level * 10 + 10)
    .filter(weapon => weapon.damag > level *10 - 10);

  for (let i = 0; i < 3; i++) {
    const weapon = Object.assign({}, qualifying[_.random(0, qualifying.lenth - 1)]);
    weapon.type = 'weapon';
    weapons.push(weapon);
  }

//randomly place all the entities on the floor cells on the map
// return the player's starting coordinates
  let playerPosition = [];

  [potions, enemies, weapons, exits, players, bosses].forEach(entities => {
    while (entities.length) {
      const x = Math.floor(Math.random() * c.GRID_WIDTH);
      const y = Math.floor(Math.random() * c.GRID_HEIGHT);

      if (gameMap[y][x].type === 'floor') {
        if(entities[0].type === 'player') {
          playerPosition = [x, y];
        }
        //pop() method removes last element from aray and returns that element
        gameMap[y][x] = entities.pop();
      }
    }
  });
  for(let i = 0; i < gameMap.length; i++) {
    for (let j = 0; j < gameMap[0].length; j++){
      if (gameMap[i][j].type === 'door') {
        gameMap[i][j].type = 'floor';
      }
    }
  }
  return {entities: gameMap, playerPosition};
};///<~~~parsing error?
//////////////////////////////
let dungeon = createDungeon();
let firstStore = {
  entities: createEntities(dungeon)
};
const store = createStore(enableBatching( createBoard ));
// const store = createStore(createBoard);
  store.dispatch(createLevel(1));
  store.dispatch(setDungeonLevel(1));


class App extends Component {
  playerInput = (vector) => {
    //this is the main store.
    let state = store.getState();
    const [x, y] = state.playerPosition;//get current location
      const [ vectorX, vectorY ] = vector;//get direction modifier
      const newPosition = [vectorX + x, vectorY + y];//define where we are going
      const newPlayer = state.entities[y][x];
      const destination = state.entities[y + vectorY][x+ vectorX];//whats in the cell ahead of us
    console.log('I am in app', newPlayer, destination);

    store.dispatch( changeEntity({ type: 'floor' }, [x, y]) );
    store.dispatch( changeEntity(newPlayer, newPosition) );
    store.dispatch( changePlayerPosition(newPosition) );
  };

keydown = (e) => {
  switch (e.keyCode) {
    case 38:
    case 87:
      this.playerInput([0, -1]);
      break;
      //east
    case 39:
    case 68:
      this.playerInput([1, 0]);
      //south
    case 40:
    case 83:
      this.playerInput([0, 1]);
      break;
      //west
    case 37:
    case 65:
      this.playerInput([-1, 0]);
      break;
    default:
      return;
  }
};
componentDidMount () {
  window.addEventListener('keydown', this.keydown);
  this.unsubscribe = store.subscribe(() => this.forceUpdate()
    );
  }
componentWillUnmount() {
  window.removeEventListener('keydown', this.keydown);
  this.unsubscribe();
}
render() {
  console.log('i am rendering...')
  let { entities, playerPosition } = store.getState();
  return(
    <div className='App'>
      <Dungeon
        //passed only for rendering
        entities = {entities}
        playerPosition = {playerPosition}
        />
      </div>
  )
}
}

function Dungeon(props) {
  let { entities, playerPosition } = props;
  const [x, y] = playerPosition;//get current location
  entities.map((row, i) => row.map ((cell, j) => {
    cell.distanceFromPlayer = (Math.abs(y - i)) + (Math.abs(x - y));
    (cell.distanceFromPlayer > 10) ? cell.opacity = 0 : cell.opacity = 1;
    return cell;
  }));
  const cells = entities.map((element, index) => {
    return (
      <div className='row' key={Date.now()+index}>
        {
          element.map((cell, i) => {
            return (
              <div className={
                  (cell.type ) ? 'cell ' + cell.type : 'cell'
                }
                style={{opacity: cell.opacity}}
                key={i}
                >
                </div>
            )
          })
        }
        </div>
    )
  });
  return(
  <div className='flex-container'>
      {cells}
      </div>
  )
};


///////////////////////////////////////////////


ReactDOM.render(<App />, document.getElementById('container'));

// export default Dungeon;
