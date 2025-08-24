(function () {
    'use strict';

    /**
     * Основная функция для инициализации плагина.
     * Она будет вызвана только тогда, когда Lampa будет готова.
     */
    function initPlugin() {

        // Функция для удаления логотипа
        function removeLogo() {
            const logo = document.querySelector('.head__logo-icon');
            if (logo) {
                logo.remove();
            }
        }

        /**
         * Запускает наблюдатель за изменениями в DOM.
         * Это гарантирует, что логотип будет удален, даже если он появится позже
         * (например, при переходе между страницами внутри Lampa).
         */
        function startObserver() {
            const observer = new MutationObserver((mutations) => {
                const logo = document.querySelector('.head__logo-icon');
                if (logo) {
                    removeLogo();
                    // Как только логотип удален, отключаем наблюдатель для экономии ресурсов.
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Создаем плагин Lampa
        Lampa.Plugin.create({
            name: 'Logo Remover',
            version: '1.0.1', // Обновил версию
            author: 'User',
            
            // Эта функция вызывается при запуске плагина
            start: function () {
                // Пытаемся удалить логотип сразу
                removeLogo();
                // И запускаем наблюдатель на случай, если логотип появится позже
                startObserver();
            }
        });
    }

    /**
     * Проверяем, готова ли Lampa.
     * Если да - запускаем плагин. Если нет - ждем 100 миллисекунд и проверяем снова.
     */
    function checkLampa() {
        if (window.Lampa && window.Lampa.Plugin) {
            initPlugin();
        } else {
            setTimeout(checkLampa, 100);
        }
    }

    // Начинаем проверку
    checkLampa();

})();
