import { showUserInfo, fetchGetData, filterOnlyLastCaptures,showCurrentGames } from "./modules.js";

showUserInfo();

showCurrentGames();
//     console.log(games)
//     for (const element of games) {
//         const stremInfo = await fetchGetData(`http://vps-43791.vps-default-host.net/game-stream/${element.id_game}`);
//         console.log(filterOnlyLastCaptures(stremInfo[0]));
//         const renderingGame = `
//         <div>
//     <div class="game-board">
//         <div class="game-board-title"><a href="http://vps-43791.vps-default-host.net/game/${element.id_game}">${element.name}</a></div>
//         <div class="game-board-stream">
//             <div class="game-table">
//                 <div class="game-table-row">
//                     <div class="game-table-cell mini" id="aa"></div>
//                     <div class="game-table-cell mini" id="ab"></div>
//                     <div class="game-table-cell mini" id="ac"></div>
//                     <div class="game-table-cell mini" id="ad"></div>
//                     <div class="game-table-cell mini" id="ae"></div>
//                 </div>
//                 <div class="game-table-row">
//                     <div class="game-table-cell mini" id="ba"></div>
//                     <div class="game-table-cell mini" id="bb"></div>
//                     <div class="game-table-cell mini" id="bc"></div>
//                     <div class="game-table-cell mini" id="bd"></div>
//                     <div class="game-table-cell mini" id="be"></div>
//                 </div>
//                 <div class="game-table-row">
//                     <div class="game-table-cell mini" id="ca"></div>
//                     <div class="game-table-cell mini" id="cb"></div>
//                     <div class="game-table-cell mini" id="cc"></div>
//                     <div class="game-table-cell mini" id="cd"></div>
//                     <div class="game-table-cell mini" id="ce"></div>
//                 </div>
//                 <div class="game-table-row">
//                     <div class="game-table-cell mini" id="da"></div>
//                     <div class="game-table-cell mini" id="db"></div>
//                     <div class="game-table-cell mini" id="dc"></div>
//                     <div class="game-table-cell mini" id="dd"></div>
//                     <div class="game-table-cell mini" id="de"></div>
//                 </div>
//                 <div class="game-table-row">
//                     <div class="game-table-cell mini" id="ea"></div>
//                     <div class="game-table-cell mini" id="eb"></div>
//                     <div class="game-table-cell mini" id="ec"></div>
//                     <div class="game-table-cell mini" id="ed"></div>
//                     <div class="game-table-cell mini" id="ee"></div>
//                 </div>
//             </div>
//         </div>
//     </div>
// </div>`
//         listGames.innerHTML += renderingGame;
//     }
