(function () {
    'use strict';

    function removeLogo() {
        // Находим элемент логотипа по его классу
        const logo = document.querySelector('.head__logo-icon');
        
        // Если элемент найден, удаляем его
        if (logo) {
            logo.remove();
            // console.log('Lampa logo removed by plugin.');
        }
    }

    // Lampa — это одностраничное приложение (SPA).
    // Элементы интерфейса могут создаваться и удаляться динамически.
    // Чтобы гарантированно удалить логотип, даже если он появится позже,
    // мы используем MutationObserver. Он будет следить за изменениями в DOM.
    
    function startObserver() {
        const observer = new MutationObserver((mutations) => {
            // Пытаемся найти и удалить логотип при каждом изменении
            const logo = document.querySelector('.head__logo-icon');
            if (logo) {
                removeLogo();
                // Как только логотип удален, наблюдатель нам больше не нужен.
                // Отключаем его для экономии ресурсов.
                observer.disconnect();
            }
        });

        // Запускаем наблюдение за всем 'body' на предмет добавления или удаления дочерних элементов
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Создаем плагин Lampa
    Lampa.Plugin.create({
        name: 'Logo Remover',
        version: '1.0.0',
        author: 'User',
        
        // Функция start() вызывается при запуске плагина
        start: function () {
            // Сначала пробуем удалить логотип сразу
            removeLogo();
            // Затем запускаем наблюдатель на случай, если логотип появится позже
            startObserver();
        }
    });
})();
