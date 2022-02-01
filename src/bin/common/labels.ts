export default {
    INVALID_PAYLOAD: {
        EN: "Payload provided does not satisfy our request body requirements.",
        RU: "Предоставленная полезная нагрузка не удовлетворяет требованиям нашего тела запроса.",
    },
    MAINTENANCE: {
        EN: 'Server module under maintenance',
        RU: 'Серверный модуль на обслуживании',
    },
    SUCCESSFULLY: {
        EN: 'The operation completed successfully.',
        RU: 'Операция успешно выполнена.',
    },
    FORBIDDEN: {
        EN: 'You does not have the permission.',
        RU: 'У вас нет разрешения.',
    },
    QUERY_EXCEPTION: {
        EN: 'Malformed query founds in database operations.',
        RU: 'В операциях с базой данных обнаружен неверный запрос.',
    },
    UNEXPECTED_ERROR: {
        EN: 'An unexpected events occurs on database transactions or server operations.',
        RU: 'Неожиданные события происходят при транзакциях с базой данных или операциях сервера.',
    },
    UNHANDLED_EXCEPTION: {
        EN: 'Errors generated from operations without exception handling.',
        RU: 'Ошибки, возникающие при операциях без обработки исключений.',
    },
    CLIENT_EXCEPTION: {
        EN: 'Client made an invalid request.',
        RU: 'Клиент сделал неверный запрос.',
    },
    SERVER_EXCEPTION: {
        EN: 'Server failed to fulfill a request.',
        RU: 'Серверу не удалось выполнить запрос.',
    },
    UNAUTHENTICATED: {
        EN: '[Code: {0}] Unable to authenticated with the provided credentials',
        RU: '[Code: {0}] Не удалось пройти аутентификацию с использованием предоставленных учетных данных',
    },
    NOT_FOUND: {
        EN: 'Not found ({0})',
        RU: 'Не найдено ({0})',
    },
    ROUTE_NOT_FOUND: {
        EN: 'The route was not found.',
        RU: 'Маршрут не найден.',
    },
    BAD_GATEWAY: {
        EN: 'Unknown error occurs',
        RU: 'Произошла неизвестная ошибка',
    },
    BANNED: {
        EN: 'You are banned. Reason: {0}',
        RU: 'Вы заблокированы. Причина: {0}',
    },
    NOT_SUBSCRIBED: {
        EN: 'You are not subscribed.',
        RU: 'Вы не подписаны.',
    },
    ALREADY_SUBSCRIBED: {
        EN: 'You are already subscribed.',
        RU: 'Вы уже подписаны.',
    },
    SUBSCRIBED: {
        EN: 'You have successfully subscribed.',
        RU: 'Вы успешно подписались.',
    },
    UNSUBSCRIBED: {
        EN: 'You have successfully unsubscribed.',
        RU: 'Вы успешно отписались.',
    },
    NOT_IN_ROOM: {
        EN: 'Please join the room before send messages.',
        RU: 'Пожалуйста, присоединяйтесь к комнате перед отправкой сообщений.',
    },
} as any;
