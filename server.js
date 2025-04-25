const express = require('express');
const cors = require('cors'); // Подключаем cors
const { firefox } = require('playwright');

const app = express();
const port = 3000;

// Настроим CORS для разрешения запросов с любого источника
app.use(cors()); // Это позволяет запросы с любого источника

// Обработчик для получения популярных игр
app.get('/api/popular-games', async (req, res) => {
    try {
        // Запускаем браузер Firefox
        const browser = await firefox.launch({ headless: true });
        const page = await browser.newPage();

        // Переходим на страницу с популярными играми
        await page.goto('https://www.roblox.com/charts');

        // Ожидаем загрузки данных
        await page.waitForSelector('.game-card-container', { timeout: 10000 });

        // Извлекаем данные о популярных играх
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

                // Извлекаем лайки
                const likeElement = game.querySelector('.info-label.vote-percentage-label');
                const likes = likeElement ? likeElement.textContent.trim() : 'Неизвестно';

                // Собираем данные об игре
                gameData.push({ name, players, placeId, likes });
            });

            return gameData;
        });

        // Закрываем браузер
        await browser.close();

        // Отправляем данные в ответ
        res.json(games);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при парсинге данных' });
    }
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
