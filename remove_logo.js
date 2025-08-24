(function () {
    'use strict';

    // Проверяем, не был ли плагин уже запущен
    if (window.uiCustomizerPluginLoaded) return;
    window.uiCustomizerPluginLoaded = true;

    /**
     * Функция для скрытия элементов интерфейса.
     * Здесь находится ваш код для удаления элементов.
     */
    function customizeUI() {
        console.log('Lampa UI Customizer: Applying changes...');

        // Удаление логотипа в шапке
        var logo = document.querySelector('.head__logo-icon');
        if (logo) {
            logo.remove();
            console.log('Lampa UI Customizer: Logo removed.');
        }

        // Удаление значка уведомлений
        var notice = document.querySelector('.head__action.open--notice.notice--icon') ||
                     document.querySelector('.head__action[data-action="notice"]');
        if (notice) {
            notice.remove();
            console.log('Lampa UI Customizer: Notice icon removed.');
        }

        // Удаление значка ленты
        var feed = document.querySelector('.head__action.open--feed') ||
                   document.querySelector('.head__action[data-action="feed"]') ||
                   document.querySelector('.menu__item[data-action="feed"]');
        if (feed) {
            feed.remove();
            console.log('Lampa UI Customizer: Feed icon removed.');
        }
    }

    /**
     * Главная логика плагина.
     * Мы ждем, пока Lampa полностью загрузится и будет готова к работе.
     * Событие 'app', type 'ready' — идеальный момент для этого.
     */
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            // Как только приложение готово, запускаем нашу функцию кастомизации.
            customizeUI();
            
            // Нам больше не нужно слушать это событие, поэтому можно его отключить.
            // Но для простоты можно и оставить, оно сработает только один раз.
        }
    });

})();
