(function () {
    'use strict';

    /**
     * Функция для удаления элемента логотипа.
     * Вынесена отдельно для чистоты кода.
     */
    function removeLogo() {
        const logo = document.querySelector('.head__logo-icon');
        if (logo) {
            logo.remove();
            console.log('Lampa Logo Remover: Логотип успешно удален.');
        }
    }

    /**
     * Основная функция инициализации плагина.
     */
    function initPlugin() {
        Lampa.Plugin.create({
            name: 'Logo Remover (Persistent)',
            version: '1.2.1', // Обновляем версию
            author: 'User',
            
            start: function () {
                console.log('Lampa Logo Remover: Плагин запущен.');

                // --- Метод 1: Используем официальный слушатель событий Lampa ---
                // Это предпочтительный способ, так как он срабатывает в нужный момент.
                Lampa.Listener.follow('app', (e) => {
                    if (e.type === 'ready') {
                        console.log('Lampa Logo Remover: Событие "app:ready" получено. Пытаемся удалить логотип.');
                        removeLogo();
                    }
                });

                // --- Метод 2: Постоянный наблюдатель (MutationObserver) ---
                // Это надежный запасной вариант, который отловит любые изменения на странице.
                // Он не будет отключаться и будет удалять логотип каждый раз при его появлении.
                const observer = new MutationObserver(() => {
                    // Просто проверяем, не появился ли логотип снова
                    if (document.querySelector('.head__logo-icon')) {
                        removeLogo();
                    }
                });

                // Запускаем наблюдение за всем документом
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                // Делаем первоначальную проверку на всякий случай
                removeLogo();
            }
        });
    }

    /**
     * Функция-ожидания, которая запускает плагин только после полной загрузки Lampa.
     */
    function checkLampa() {
        // Проверяем наличие не только Lampa.Plugin, но и Lampa.Listener
        if (window.Lampa && window.Lampa.Plugin && window.Lampa.Listener) {
            initPlugin();
        } else {
            // Если Lampa еще не готова, пробуем снова через 100 мс
            setTimeout(checkLampa, 100);
        }
    }

    // Запускаем проверку
    checkLampa();

})();
