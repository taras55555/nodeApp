import { showUserInfo, generateMosaics, fetchGetData, currenUnixTime, fetchCheckImage } from "./modules.js";
document.addEventListener('partialsLoaded', async () => {
    showUserInfo();
    let stateCheck = setInterval(() => {
        if (document.readyState === 'complete') {
            clearInterval(stateCheck);
            generateMosaics();
        }
    }, 100);

    const data = await fetchGetData('/leaderboard-info');
    calculateScores(data)

});

function calculateScores(data) {
    console.log(data)
    const currentTime = currenUnixTime();
    let finalScores = [];
    data[2].forEach(game => {
        const endGame = currentTime > game.end_time ? game.end_time : currentTime;
        const currentScores = [];
        const multiUserControl = [];
        const currentGameSettings = data[1].filter(row => row.id_game === game.id_game);
        currentGameSettings.forEach(element => {
            currentScores.push({ user_id: element.user_id, user_global_name: element.user_global_name, scores: 0 })
        })

        const currentGameLogs = data[0].filter(row => row.id_game === game.id_game);
        currentGameLogs.forEach(element => {
            const isMultiUserControl = multiUserControl.findIndex(item => item.key === element.cell_coordinates);
            let scores = endGame - element.unix_time;

            if (isMultiUserControl === -1) {
                multiUserControl.push({ key: element.cell_coordinates, time_captured: element.unix_time })
            } else {
                scores = multiUserControl[isMultiUserControl].time_captured - element.unix_time
                multiUserControl[isMultiUserControl].time_captured = element.unix_time;
            }

            const keyUser = currentScores.findIndex(user => user.user_id === element.user_id);
            const currentValueScores = currentScores[keyUser].scores;
            currentScores[keyUser].scores = scores + currentValueScores;


        });
        console.log('currentScores: ', currentScores);
        currentScores.forEach(player => {
            const userInFinalTable = finalScores.findIndex(row => row.user_id === player.user_id);
            userInFinalTable === -1 ? finalScores.push(player) : finalScores[userInFinalTable].scores += player.scores;
        })
    });
    console.log(finalScores)
    finalScores.sort((a,b) => b.scores - a.scores)
    const scoresTable = document.querySelector('.high-scores');
    scoresTable.innerHTML = '';
    finalScores.forEach(async element => {
        const players = document.createElement('div');
        players.classList.add('player-score');
        players.innerHTML = `<div class="player-score-coll"><img class="authorized-user-avatar" src="/profile-pictures/${element.user_id}.jpg" onerror="this.src='/profile-pictures/default-image.jpg'" alt="Avatar"></div><div class="player-score-coll player-score-coll-points">` + element.user_global_name + '</div><div class="player-score-coll player-score-coll-points">' + element.scores + '</div>'
        scoresTable.appendChild(players);

    });
}