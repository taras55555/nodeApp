import { showUserInfo, fetchGetData, filterOnlyLastCaptures, showCurrentGames } from "./modules.js";

const currentPath = window.location.pathname.split("/");
const gameId = currentPath[currentPath.length - 1]
const allCell = document.querySelectorAll('.game-table-cell');

showUserInfo();
setInterval(watchStream, 1000);
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
// watchStream();
async function watchStream() {
    const streamCurrentGame = await fetchGetData(`/game-stream/${gameId}`);
    console.log(streamCurrentGame)
    const filteredData = filterOnlyLastCaptures(streamCurrentGame[0]);
    settingParameters(filteredData, streamCurrentGame[1]);
    pointsCalculation(streamCurrentGame);
    // const url = `/game-stream/${gameId}`;

    // const requestOptions = {
    //     method: 'GET'
    // };

    // fetch(url, requestOptions).then(response => response.json()).then(data => {
    //     if (data) {
    //         console.log('Game Stream:', data);
    //         const filteredData = data[0].filter((item, index, arr) => {

    //             const firstIndex = arr.findIndex(
    //                 (element) => element.cell_coordinates === item.cell_coordinates
    //             );
    //             return index === firstIndex;
    //         });
    //         // console.log('Game Stream Filtered Array:', filteredData);
    //         settingParameters(filteredData, data[1]);
    //         pointsCalculation(data);
    //     }
    // }).catch(error => {
    //     console.error('Game Stream:', error);
    // });
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
    const currentTime = Math.round(new Date().getTime() / 1000);
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
            // arraCalculation.push({ user_id: element.user_id, user_global_name: userGlobalName, scores: scoreCell });
            arraCalculation.push({ user_id: element.user_id, user_global_name: userGlobalName, scores: scoreCell });
        } else {
            arraCalculation[keyUser].scores = arraCalculation[keyUser].scores + scoreCell
        }
    });
    const scoresTable = document.querySelector('.high-scores');
    scoresTable.innerHTML = '';
    arraCalculation.forEach(element => {
        const players = document.createElement('div');
        players.innerHTML = element.user_global_name + ' | ' + element.scores
        scoresTable.appendChild(players);
    });
}
