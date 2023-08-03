import { showUserInfo, fetchGetData, filterOnlyLastCaptures, generateMosaics, showGameInfo, currenUnixTime, fetchCheckImage } from "./modules.js";

const currentPath = window.location.pathname.split("/");
const gameId = currentPath[currentPath.length - 1]
const allCell = document.querySelectorAll('.game-table-cell');

showUserInfo();
showGameInfo();
generateMosaics();
setInterval(watchStream, 1000);
allCell.forEach(cell => {
    cell.addEventListener('click', async event => {
        const currentCell = document.querySelector(`#${event.target.id}`)
        currentCell.style.backgroundImage = "url('/images/loading-icon.gif')";
        const url = `/cell-capture/${event.target.id}&${gameId}`;
        const result = await fetchGetData(url);
        if (result.error === 'Game is over') alert(result.error);
        if (result.error === 'Unauthorized') alert('You need to authorize')
        console.log(result)
    })
});

async function watchStream() {
    const streamCurrentGame = await fetchGetData(`/game-stream/${gameId}`);
    const filteredData = filterOnlyLastCaptures(streamCurrentGame[0]);
    settingParameters(filteredData, streamCurrentGame[1]);
    pointsCalculation(streamCurrentGame);
}

function settingParameters(filteredData, settings) {
    filteredData.forEach(element => {
        const cell = document.querySelector(`#${element.cell_coordinates}`);
        const userId = element.user_id;
        const cellColor = settings.find(item => item.user_id === userId).color;
        cell.style.backgroundColor = cellColor;
        cell.style.backgroundImage = 'unset';
    });
}

function pointsCalculation(data) {
    let currentTime = currenUnixTime();
    if (currentTime > deadline.value) currentTime = deadline.value;
    const arraCalculation = [];
    const keysLog = [];
    console.log(data)
    data[0].forEach(element => {
        const isKey = keysLog.findIndex(item => item.key === element.cell_coordinates);
        let scoreCell = currentTime - element.unix_time;
        if (isKey === -1) {
            keysLog.push({ key: element.cell_coordinates, time_captured: element.unix_time });
        } else {
            scoreCell = keysLog[isKey].time_captured - element.unix_time
            keysLog[isKey].time_captured = element.unix_time;

        }

        const keyUser = arraCalculation.findIndex(item => item.user_id === element.user_id);
        if (keyUser === -1) {
            const keyForUserGlobalName = data[1].findIndex(itemInSettings => itemInSettings.user_id === element.user_id);
            const userGlobalName = data[1][keyForUserGlobalName].user_global_name;
            const userColor = data[1][keyForUserGlobalName].color;
            arraCalculation.push({ user_id: element.user_id, user_global_name: userGlobalName, scores: scoreCell, color: userColor });
        } else {
            arraCalculation[keyUser].scores = arraCalculation[keyUser].scores + scoreCell
        }
    });
    arraCalculation.sort((a,b) => b.scores - a.scores)
    const scoresTable = document.querySelector('.high-scores');
    scoresTable.innerHTML = '';
    arraCalculation.forEach(element => {
        const players = document.createElement('div');
        players.classList.add('player-score')
        players.innerHTML = `<div style="border: 3px solid var(--discord-theme);background-color: ${element.color};width:30px; height:30px;border-radius:50%;"></div><div class="player-score-coll"><img class="authorized-user-avatar" src="/profile-pictures/${element.user_id}.jpg" onerror="this.src='/profile-pictures/default-image.jpg'" alt="Avatar"></div><div class="player-score-coll player-score-coll-points">` + element.user_global_name + '</div><div class="player-score-coll player-score-coll-points">' + element.scores + '</div>'
        scoresTable.appendChild(players);
    });
}