// /api/index.js
const { firefox } = require('playwright');

async function fetchPopularGames() {
    try {
        const browser = await firefox.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://www.roblox.com/charts');
        await page.waitForSelector('.game-card-container', { timeout: 10000 });

        const games = await page.evaluate(() => {
            const gameElements = document.querySelectorAll('.game-card-container');
            const gameData = [];

            gameElements.forEach(game => {
                const nameElement = game.querySelector('.game-card-name');
                const name = nameElement ? nameElement.textContent.trim() : 'Неизвестно';

                const playerCountElement = game.querySelector('.playing-counts-label');
                const players = playerCountElement ? playerCountElement.textContent.trim() : 'Неизвестно';

                const placeIdElement = game.querySelector('a');
                const url = placeIdElement ? placeIdElement.getAttribute('href') : '';
                const placeId = url ? url.split('/games/')[1]?.split('/')[0] : 'Неизвестно';

                const likeElement = game.querySelector('.info-label.vote-percentage-label');
                const likes = likeElement ? likeElement.textContent.trim() : 'Неизвестно';

                gameData.push({ name, players, placeId, likes });
            });

            return gameData;
        });

        await browser.close();
        return games;
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    }
}

module.exports = async (req, res) => {
    try {
        const games = await fetchPopularGames();
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ error: 'Не удалось загрузить данные' });
    }
};
