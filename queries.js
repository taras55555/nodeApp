const connection = require('./database');
const myModule = require('./my_modules');

function findUser(userIdToCheck, callback) {
    const checkQuery = `SELECT COUNT(*) as rowCount FROM discord_users WHERE user_id = ?`;
    connection.query(checkQuery, [userIdToCheck], (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            const rowCount = result[0].rowCount;
            callback(null, rowCount);
        }
    });
}

function addUser(userData, callback) {
    const unixTime = myModule.unixTime();
    const addQuery = `INSERT INTO discord_users (id, user_id, username, global_name, avatar, discriminator, public_flags, flags, banner, banner_color, accent_color, locale, mfa_enabled, premium_type, avatar_decoration, date_add) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(addQuery, [`${userData.id}`, `${userData.username}`, `${userData.global_name}`, `${userData.avatar}`, `${userData.discriminator}`, `${userData.public_flags}`, `${userData.flags}`, `${userData.banner}`, `${userData.banner_color}`, `${userData.accent_color}`, `${userData.locale}`, `${userData.mfa_enabled}`, `${userData.premium_type}`, `${userData.avatar_decoration}`, `${unixTime}`], function (err, data) {
        if (err) callback(err, null);
        callback(null, data);
    });
}

function getUserData(userId) {
    return new Promise((resolve, reject) => {
        if (userId) {
            const selectQuery = `SELECT * FROM discord_users WHERE user_id = ${userId}`;
            connection.query(selectQuery, (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        } else {
            resolve([]);
        }
    })
}


async function createGame() {
    const currentGamesArray = await getCurrentGames();
    const funnyNamesArray = await getFunnyName();
    let funnyNameRandom = funnyNamesArray[Math.floor(Math.random() * funnyNamesArray.length)].name;
    while(currentGamesArray.some(item => item.name === funnyNameRandom)) {
        funnyNameRandom = funnyNamesArray[Math.floor(Math.random() * funnyNamesArray.length)].name;
    }
    let isGame = [0];
    let randomString;
    while (isGame.length !== 0) {
        randomString = myModule.generateRandomString(8)
        isGame = await getGameById(randomString);
    }
    return new Promise((resolve, reject) => {
        const insertQuery = `INSERT INTO games (id, id_game, max_players, date_create, end_time, is_game_closed, name) VALUES (NULL, '${randomString}', '10', '${myModule.unixTime()}', '${myModule.unixTime() + 3600}', '0', '${funnyNameRandom}')`
        connection.query(insertQuery, function (err, result) {
            if (err) reject(err);
            resolve(result);
        })
    });
}

function getFunnyName() {
    return new Promise((resolve, reject) => {
        const selectQuery = `SELECT * FROM funny_names`;
        connection.query(selectQuery, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    });
}

function getCurrentGames() {
    return new Promise((resolve, reject) => {
        const selectQuery = `SELECT * FROM games WHERE end_time > '${myModule.unixTime()}'`;
        connection.query(selectQuery, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    })
}

function getGameById(idGame) {
    return new Promise((resolve, reject) => {
        const selectQuery = idGame === undefined ? `SELECT * FROM games` : `SELECT * FROM games WHERE id_game = '${idGame}'`
        connection.query(selectQuery, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    })
}

async function captureCell(parameters, idUser, userGloblName) {
    const spliParameters = parameters.split("&");
    const currentGame = await getGameById(spliParameters[1]);
    const endTimeCurrentGame = currentGame[0].end_time;
    if (myModule.unixTime() > endTimeCurrentGame) {
        return { error: 'Game is over' };
    }
    if (idUser === undefined) {
        return { error: 'Unauthorized' };
    }
    return new Promise((resolve, reject) => {
        const insertQuery = `INSERT INTO games_log (id, id_game, user_id, cell_coordinates, unix_time) VALUES (NULL, '${spliParameters[1]}', '${idUser}', '${spliParameters[0]}', '${myModule.unixTime()}');`
        connection.query(insertQuery, async function (err, result) {
            if (err) reject(err);
            const settings = await getSettingsByIdUser(spliParameters[1], idUser, userGloblName);
            resolve(result);
        });
    })
}


function getSettingsByIdUser(idGame, idUser, userGloblName) {
    return new Promise((resolve, reject) => {
        const selectQuery = `SELECT * FROM game_settings WHERE id_game = '${idGame}' AND user_id = '${idUser}'`;
        connection.query(selectQuery, function (err, result) {
            if (err) reject(err);
            if (result.length === 0) {
                setSettings(idGame, idUser, userGloblName);
            } else {

            }
            resolve(result);
        });
    })
}
function getSettingsByIdGame(idGame) {
    return new Promise((resolve, reject) => {
        const selectQuery = idGame === undefined ? `SELECT * FROM game_settings` : `SELECT * FROM game_settings WHERE id_game = '${idGame}'`;
        connection.query(selectQuery, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    })
}
function setSettings(idGame, idUser, userGloblName) {
    return new Promise(async (resolve, reject) => {
        const reservedColors = await getSettingsByIdGame(idGame);
        const randomColor = setPLayerColor(reservedColors);
        const insertQuery = `INSERT INTO game_settings (id, id_game, user_id, color, user_global_name, user_avatar) VALUES (NULL, '${idGame}', '${idUser}', '${randomColor}', '${userGloblName}', '')`;
        connection.query(insertQuery, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    })
}

function setPLayerColor(reservedColors) {
    const playerCollorsArray = ["#000", "#ff0000", "#ffa500", "#ffff00", "#008000", "#00ff15", "#0000ff", "#00FFFF", "#800080", "#ffffff"];
    const possibleArrayColors = playerCollorsArray.filter((item) => (!isColorReserved(item, reservedColors)))
    return possibleArrayColors[Math.floor(Math.random() * possibleArrayColors.length)];
}

function isColorReserved(color, reservedColors) {
    return reservedColors.some(item => item.color === color);
}
function getGameLog(idGame) {
    return new Promise((resolve, reject) => {
        const selectQuery = idGame === undefined ? `SELECT * FROM games_log ORDER BY id DESC` : `SELECT * FROM games_log WHERE id_game = '${idGame}' ORDER BY id DESC`;
        connection.query(selectQuery, function (err, result) {
            if (err) reject(err);
            resolve(result);
        })
    })
}

module.exports = { findUser, addUser, getUserData, createGame, getCurrentGames, getGameById, captureCell, getGameLog, getSettingsByIdGame };