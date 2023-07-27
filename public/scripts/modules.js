async function showUserInfo() {
    const result = await fetchGetData('/user');
    if (result.length === 1) {
        const avatarURL = `https://cdn.discordapp.com/avatars/${result[0].user_id}/${result[0].avatar}`;
        avatar.style.backgroundImage = `url(${avatarURL})`;
        userName.textContent = result[0].username;
        loginButton.style.display = 'none';
        authorizedUser.style.display = 'unset';
    }
}

function filterOnlyLastCaptures(array) {
    const filteredData = array.filter((item, index, arr) => {
        const firstIndex = arr.findIndex(
            (element) => element.cell_coordinates === item.cell_coordinates
        );
        return index === firstIndex;
    });
    return filteredData;
}

async function fetchGetData(url) {
    return (await fetch(url)).json();
}

async function showCurrentGames() {
    const arrayCells = [
        ['aa', 'ab', 'ac', 'ad', 'ae'],
        ['ba', 'bb', 'bc', 'bd', 'be'],
        ['ca', 'cb', 'cc', 'cd', 'ce'],
        ['da', 'db', 'dc', 'dd', 'de'],
        ['ea', 'eb', 'ec', 'ed', 'ee']
    ]
    const result = await fetchGetData('/current-games');
    // console.log(result);
    result.forEach(async element => {
        const streamCurrentGame = await fetchGetData(`/game-stream/${element.id_game}`);
        console.log("streamCurrentGame - ", streamCurrentGame);

        const gameBoard = document.createElement('div');
        gameBoard.classList.add('game-board');
        gameBoard.addEventListener('click', () => window.location.href = `http://vps-43791.vps-default-host.net/game/${element.id_game}`);
        const gameBoardTitle = document.createElement('div');
        gameBoardTitle.classList.add('game-board-title')
        gameBoardTitle.textContent = element.name;

        const gameBoardStream = document.createElement('div');
        gameBoardStream.classList.add('game-board-stream');

        const gameTable = document.createElement('div');
        gameTable.classList.add('game-table');

        gameBoard.appendChild(gameBoardTitle);
        gameBoard.appendChild(gameBoardStream).appendChild(gameTable);

        const currentControlCells = filterOnlyLastCaptures(streamCurrentGame[0]);
        for (let row of arrayCells) {
            const newRow = document.createElement('div');
            newRow.classList.add('game-table-row');
            for (let cell of row) {
                const newCell = document.createElement('div');
                newCell.classList.add('game-table-cell', 'mini');
                newCell.id = cell;
                const key = currentControlCells.findIndex(item => item.cell_coordinates === cell);
                if (key !== -1) {
                    const keyColor = streamCurrentGame[1].findIndex(item => item.user_id === currentControlCells[key].user_id);
                    newCell.style.backgroundColor = streamCurrentGame[1][keyColor].color;
                }
                newRow.appendChild(newCell);
            }
            gameTable.appendChild(newRow)
        }
        listGames.appendChild(gameBoard)
    });

}

export { showUserInfo, fetchGetData, filterOnlyLastCaptures, showCurrentGames }