import { showUserInfo, generateMosaics } from "./modules.js";
document.addEventListener('partialsLoaded', () => {
    showUserInfo();
    let stateCheck = setInterval(() => {
        if (document.readyState === 'complete') {
            clearInterval(stateCheck);
            generateMosaics();
        }
    }, 100);
});