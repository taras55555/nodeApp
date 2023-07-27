const { request } = require('undici');
require('dotenv').config();
const express = require('express');
const sessions = require('express-session');

const queries = require('./queries');
const myModule = require('./my_modules');
const path = require('path');
const app = express();

const halfDay = 1000 * 60 * 60 * 12;
app.use(sessions({
	secret: myModule.generateRandomString(10),
	saveUninitialized: true,
	cookie: { maxAge: halfDay },
	resave: false
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async ({ query, session }, response) => {
	const { code } = query;

	if (code) {
		// console.log(code)
		try {
			const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: process.env.CLIENT_ID,
					client_secret: process.env.CLIENT_SECRET,
					code,
					grant_type: 'authorization_code',
					redirect_uri: `http://vps-43791.vps-default-host.net:${process.env.PORT}`,
					scope: 'identify',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await tokenResponseData.body.json();
			// console.log(oauthData);
			const userResult = await request('https://discord.com/api/users/@me', {
				headers: {
					authorization: `${oauthData.token_type} ${oauthData.access_token}`,
				},
			});
			const userData = await userResult.body.json();
			if (userData.id !== undefined) {
				// console.log(userData);
				queries.findUser(userData.id, (err, rowCount) => {
					if (err) console.error('Помилка запиту:', err);
					if (rowCount === 0) {
						queries.addUser(userData, (err, result) => {
							if (err) console.error('Помилка запиту:', err);
							session.userid = userData.id;
							session.globalname = userData.global_name;
							console.log(session.userid);
							myModule.downloadAvatar(userData.id, userData.avatar)
						})
					} else {
						session.userid = userData.id;
						session.globalname = userData.global_name;
						console.log(session.userid);
						myModule.downloadAvatar(userData.id, userData.avatar)
					}
				});
			}
		} catch (error) {
			console.error(error);
		}
	}
	return response.sendFile('index.html', { root: '.' });

});

app.get('/user', async (request, response) => {
	const result = await queries.getUserData(request.session.userid);
	response.send(result);
})

app.get('/current-games', async (request, response) => {
	const result = await queries.getCurrentGames();
	response.send(result);
});

app.get('/game/:idgame', (request, response) => {
	const idGame = request.params.idgame;
	response.sendFile(path.join(__dirname, 'public/game.html'));
})

app.get('/logout', (request, response) => {
	request.session.destroy();
	response.redirect('/');
});

app.get('/game-stream/:code', async (request, response) => {
	const idGame = request.params.code;
	const [...obj] = await Promise.all([
		queries.getGemaLog(idGame),
		queries.getSettingsByIdGame(idGame)
	])
	// const result = await queries.getGemaLog(idGame);
	response.send(obj);
})
app.get('/cell-capture/:parameters', async (request, response) => {
	const arrayParameters = request.params.parameters;
	const discordUserId = request.session.userid;
	const dicordUserGlobalName = request.session.globalname;

	const result = await queries.captureCell(arrayParameters, discordUserId, dicordUserGlobalName);
	response.send(result);
	// console.log(arrayParameters + request.session.userid);
})
app.get('/manage-games', (request, response) => {
	queries.createGame();
	console.log('created new game');
	response.send('ok');
})
app.listen(process.env.PORT, () => console.log(`App listening at http://vps-43791.vps-default-host.net:${process.env.PORT}`));