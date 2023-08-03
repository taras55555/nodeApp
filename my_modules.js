exports.generateRandomString = function (length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

exports.unixTime = () => Math.round(new Date().getTime() / 1000);

exports.downloadAvatar = function (userId, avatarHash) {
    const https = require('https');
    const fs = require('fs');
    const path = require('path');

    fs.mkdir(path.join(__dirname, 'public/profile-pictures'), (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Directory created successfully!');
    });

    const imageUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}`;
    const imageName = `${userId}.jpg`;
    const file = fs.createWriteStream(`public/profile-pictures/${imageName}`, { flags: 'w' });
    https.get(imageUrl, response => {
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log(`Image downloaded as ${imageName}`);
        });
    }).on('error', err => {
        fs.unlink(imageName);
        console.error(`Error downloading image: ${err.message}`);
    });
}