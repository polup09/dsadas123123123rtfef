const express = require('express');
const puppeteer = require('puppeteer');
const session = require('express-session');
const cheerio = require('cheerio');

const app = express();
const port = 3000; // Порт вашего сервера (можно изменить)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Добавляем middleware для управления сессиями
app.use(session({
  secret: 'your-secret-key', // Замените на свой секретный ключ
  resave: false,
  saveUninitialized: true,
}));

// Маршрут для обработки POST-запроса на вашем сервере
app.post('/process-data', async (req, res) => {
  try {
    const requestData = req.body; // Данные, полученные от клиента
    console.log('Полученные данные от клиента:', requestData);

    const websiteUrl = 'https://dsadasdas.cc.ua/132/'; // URL сайта, который нужно открыть

    // Проверяем, есть ли у клиента уже установленная сессия
    if (!req.session.lock) {
      // Если сессия еще не установлена для данного IP-адреса,
      // то создаем новую сессию с пустыми данными
      req.session.lock = '';
      req.session.browser = await puppeteer.launch({ headless: false });
    }

    const page = await req.session.browser.newPage(); // Создание новой вкладки

    await page.goto(websiteUrl); // Переход на указанный URL

    // Вписываем данные в инпуты
    await page.type('#message', requestData.lock);

    // Нажимаем кнопку "Отправить"
    await page.click('input[type="submit"]');

    // Ожидаем загрузки новой страницы
    console.log(1);
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    // Вписываем данные в инпут message2 с помощью page.evaluate
    await page.evaluate((lock2) => {
      document.querySelector('#message2').value = lock2;
    }, requestData.lock2);
    console.log(2);
    // Нажимаем кнопку "Отправить" для второго сообщения
    await page.click('input[type="submit"]');

    // Отправляем данные обратно клиенту
    res.status(200).json({ message: 'Данные успешно обработаны' });
  } catch (error) {
    console.error('Произошла ошибка при обработке данных:', error.message);
    res.status(500).json({ error: 'Произошла ошибка при обработке данных' });
  }
});

// Запуск вашего сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
