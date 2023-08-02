import { showUserInfo, showCurrentGames, generateMosaics } from "./modules.js";

showUserInfo();

showCurrentGames();

let stateCheck = setInterval(() => {
  if (document.readyState === 'complete') {

    clearInterval(stateCheck);
    generateMosaics();
  }
}, 100);