// В файле api/popularGames.js (или любом другом файле в папке api на Вёрселе)

const { firefox } = require('playwright');

let popularGames = [];

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
        popularGames = games;
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }
}

// Обновляем популярные игры каждые 5 секунд
setInterval(fetchPopularGames, 5000);
fetchPopularGames();  // Стартуем при запуске

module.exports = (req, res) => {
    res.json(popularGames);
};
