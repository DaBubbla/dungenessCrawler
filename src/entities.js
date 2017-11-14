import React from "react";
import ReactDOM from "react-dom";

class CreateEntities extends React.Component{
  constructor(props){
    super(props);
  }
  render() {
        <div>
          const createActors = (gameMap, level = 1) => {
          const bosses = [];
          const enemies = [];
          const exits = [];
          const potions = [];
          const weapons = [];
          const players = [];

          //randomly place all the entities on the floor cells on the map
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
        }
        </div>
  }
}
ReactDOM.render(<CreateEntities />, document.getElementById("container"));

// export default CreateEntities;
