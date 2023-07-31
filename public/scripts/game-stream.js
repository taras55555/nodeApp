import { showUserInfo, fetchGetData, filterOnlyLastCaptures, showCurrentGames, generateMosaics, showGameInfo } from "./modules.js";

const currentPath = window.location.pathname.split("/");
const gameId = currentPath[currentPath.length - 1]
const allCell = document.querySelectorAll('.game-table-cell');

showUserInfo();
showGameInfo();
generateMosaics();
// watchStream();

setInterval(watchStream, 4000);
// const blockSettings = document.querySelector('.colors-settings');


allCell.forEach(cell => {
    cell.addEventListener('click', event => {
        // console.log(event.target.id)

        const url = `/cell-capture/${event.target.id}&${gameId}`;

        const requestOptions = {
            method: 'GET'
        };

        fetch(url, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    console.log('Cell Capture:', data);
                }
            })
            .catch(error => {
                console.error('Cell Capture request ERR:', error);
            });
    })
});

async function watchStream() {
    const streamCurrentGame = await fetchGetData(`/game-stream/${gameId}`);
    console.log(streamCurrentGame)
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
    });
}

function pointsCalculation(data) {
    let currentTime = Math.round(new Date().getTime() / 1000);
    if(currentTime > deadline.value) {
        currentTime = deadline.value;
    }
    // console.log(currentTime)
    // console.log(data);
    const arraCalculation = [];
    const keysLog = [];
    data[0].forEach(element => {
        // console.log(element);
        const isKey = keysLog.findIndex(item => item.key === element.cell_coordinates);
        let scoreCell = currentTime - element.unix_time;
        if (isKey === -1) {
            keysLog.push({ key: element.cell_coordinates, time_captured: element.unix_time })
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
    const scoresTable = document.querySelector('.high-scores');
    scoresTable.innerHTML = '';
    arraCalculation.forEach(element => {
        const players = document.createElement('div');
        players.classList.add('player-score')
        players.innerHTML = `<div style="border: 3px solid var(--discord-theme);background-color: ${element.color};width:30px; height:30px;border-radius:50%;"></div><div class="player-score-coll"><img class="authorized-user-avatar" src="/profile-pictures/${element.user_id}.jpg"></div><div class="player-score-coll player-score-coll-points">` + element.user_global_name + '</div><div class="player-score-coll player-score-coll-points">' + element.scores + '</div>'

        scoresTable.appendChild(players);
    });
}
