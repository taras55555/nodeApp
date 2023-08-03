function currenUnixTime() {
    return Math.round(new Date().getTime() / 1000);
}

async function showUserInfo() {
    const result = await fetchGetData('/user');
    if (result.length === 1) {
        const avatarURL = result[0].avatar === 'null' ? `/profile-pictures/default-image.jpg` : `https://cdn.discordapp.com/avatars/${result[0].user_id}/${result[0].avatar}`
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

async function fetchCheckImage(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
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

function generateMosaics() {
    const footerSquare = document.querySelector('#footerSquare');
    const headerSquare = document.querySelector('#headerSquare');
    const headerSquareContainer = document.querySelector('#headerSquareContainer');
    createSquares(footerSquare, footerSquare);
    createSquares(headerSquare, headerSquareContainer);
}

function createSquares(elemntSize, elementFills) {

    const countSquaresWidth = Math.floor(elemntSize.offsetWidth / 29.5);
    const countSquaresHeight = Math.floor(elemntSize.offsetHeight / 29.5);
    elementFills.innerHTML = '';
    for (let i = 0; i < countSquaresWidth * countSquaresHeight; i++) {
        const square = document.createElement('div');
        square.classList.add("square");
        square.style.backgroundColor = 'var(--gray-color)'
        elementFills.appendChild(square);
    }
    const pixels = document.querySelectorAll('.square');
    pixels.forEach(animatePixel);
}

function animatePixel(pixel) {
    const playerCollorsArray = ["#000", "#ff0000", "#ffa500", "#ffff00", "#008000", "#00ff15", "#0000ff", "#00FFFF", "#800080", "#ffffff"];
    pixel.intervalId = setInterval(() => {
        pixel.style.backgroundColor = playerCollorsArray[Math.floor(Math.random() * playerCollorsArray.length)];;
    }, (Math.random() * 5000) + 1500);
}

window.addEventListener('resize', generateMosaics);

async function showGameInfo() {
    const currentPath = window.location.pathname.split("/");
    const gameId = currentPath[currentPath.length - 1]
    const result = await fetchGetData(`/game-info/${gameId}`);
    const gameTitle = document.querySelector('.game-title');
    const gameTimer = document.querySelector('.game-timer');
    let currentTime = currenUnixTime();
    deadline.value = result[0].end_time;
    console.log(result[0]);
    timer.textContent = (result[0].end_time - currentTime) > 0 ? (result[0].end_time - currentTime) : 0;
    gameTitle.textContent = result[0].name
    const endTime = setInterval(() => {
        currentTime = currenUnixTime();
        timer.textContent = deadline.value - currentTime;
        if (timer.textContent <= 0) {
            clearInterval(endTime);
            gameTimer.textContent = "Game Over"
        }
    }, 1000)
}

export { showUserInfo, fetchGetData, filterOnlyLastCaptures, showCurrentGames, generateMosaics, showGameInfo, currenUnixTime, fetchCheckImage }