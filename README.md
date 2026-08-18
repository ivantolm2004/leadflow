# LeadFlow

Полноценный portfolio case: адаптивная панель обработки заявок и dependency-free REST API на Node.js. Проект показывает, как обращения из разных источников собрать в одном pipeline, валидировать, хранить и передавать менеджеру без ручного копирования.

## Что умеет демо

- показывает ключевые метрики продаж;
- фильтрует заявки по статусу;
- имитирует получение новой заявки в реальном времени;
- адаптируется для телефона, планшета и компьютера;
- работает без сборки и внешних зависимостей.

## Быстрый запуск

Frontend: откройте `index.html` в браузере.

Backend:

```bash
npm start
# GET http://localhost:3000/health
```

Проверка полного сценария:

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "content-type: application/json" \
  -d '{"name":"Anna","request":"CRM setup","email":"anna@example.com"}'

curl http://localhost:3000/api/leads
```

Тесты:

```bash
npm test
```

## Реализовано

- `GET /api/leads` со сводкой pipeline;
- `POST /api/leads` с нормализацией и проверкой email;
- `PATCH /api/leads/:id/status` с контролем переходов;
- JSON-хранилище с атомарной записью;
- ограничение размера request body и корректные HTTP-коды;
- unit-тесты на Node Test Runner и CI в GitHub Actions.
- интеграционные тесты реальных HTTP-запросов;
- OpenAPI 3.1 контракт и Docker-образ без root-пользователя.

Подробности: [ARCHITECTURE.md](ARCHITECTURE.md).

```bash
docker build -t leadflow .
docker run --rm -p 3000:3000 leadflow
```

## Следующий production-шаг

- адаптер PostgreSQL вместо JSON-хранилища;
- уведомления в Telegram и email;
- интеграция с amoCRM, Bitrix24 или HubSpot;
- роли пользователей, авторизация и журнал действий;
- Docker-развёртывание и автоматические тесты.

## Стек

HTML5, CSS3, JavaScript, Node.js 20, Node Test Runner, GitHub Actions. Внешние runtime-зависимости отсутствуют.

## Автор

Портфолио-проект разработчика автоматизаций и AI-интеграций.
