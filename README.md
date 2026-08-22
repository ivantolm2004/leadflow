# LeadFlow

LeadFlow собирает заявки из разных каналов в одну простую воронку. В репозитории есть два самостоятельных слоя: статический интерфейс для просмотра pipeline и dependency-free REST API на Node.js для приёма, проверки, хранения и смены статуса заявок.

[Открыть интерфейс на GitHub Pages](https://ivantolm2004.github.io/leadflow/)

## Маршрут одной заявки

```text
Website / Telegram / CRM adapter
              │ POST /api/leads
              ▼
      validation → JSON store → new
                                  │
                         PATCH status
                                  ▼
                            work → done
```

API нормализует поля, отклоняет неправильный email, присваивает идентификатор и время создания. `GET /api/leads` возвращает сами заявки и сводку по состояниям `new`, `work`, `done`.

## Проверить полный сценарий

```bash
npm run scenario
```

Команда сама поднимает API на свободном порту, проверяет отказ невалидной заявке, принимает обращения с сайта и из Telegram, проводит одну заявку до `done`, перезапускает сервер и читает сохранённую воронку. Ожидаемый итог — две заявки: одна `new`, одна `done`.

Пошаговые критерии находятся в [docs/business-scenario.md](docs/business-scenario.md). Все тесты и тот же сценарий, который выполняет CI:

```bash
npm run verify
```

## Запуск API

```bash
npm start
# GET http://localhost:3000/health
```

Контракт описан в [openapi.yaml](openapi.yaml), устройство модулей — в [ARCHITECTURE.md](ARCHITECTURE.md). Для контейнера:

```bash
docker build -t leadflow .
docker run --rm -p 3000:3000 leadflow
```

## Где заканчивается прототип

GitHub Pages показывает автономный интерфейс и не размещает Node.js API. Backend запускается локально и хранит данные в JSON-файле; в нём пока нет авторизации, ролей и журнала действий. Для многопользовательской версии нужны PostgreSQL, защищённый deployment и адаптеры реальных CRM/Telegram/email.

Стек: JavaScript, Node.js 20, REST, OpenAPI 3.1, Docker, Node Test Runner и GitHub Actions. Runtime-зависимостей нет.

