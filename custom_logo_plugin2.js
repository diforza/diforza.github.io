(function () {
    'use strict';

    // Проверка, чтобы плагин не был запущен дважды
    if (window.LampaCustomLogoPlugin) return;
    window.LampaCustomLogoPlugin = true;

    // Ключ, по которому SVG будет храниться в памяти Lampa
    const STORAGE_KEY = 'my_plugin_custom_logo_svg';

    /**
     * Функция, которая находит и заменяет логотип.
     * Она берет SVG из настроек и вставляет его на страницу.
     */
    function applyCustomLogo() {
        const logoContainer = document.querySelector('.head__logo-icon');
        const userLogoSVG = Lampa.Storage.get(STORAGE_KEY, '');

        if (logoContainer && userLogoSVG) {
            logoContainer.innerHTML = userLogoSVG;
            console.log('[CustomLogo] Логотип успешно заменен.');
        } else if (logoContainer) {
            // Если SVG пуст, можно вернуть стандартный логотип Lampa, если он был сохранен
            // Но в данном случае просто выводим сообщение
            console.log('[CustomLogo] SVG код не найден в настройках. Отображается стандартный логотип.');
        }
    }

    /**
     * ИСПРАВЛЕННАЯ ФУНКЦИЯ: Добавляем новый раздел в настройки Lampa.
     * Используем правильный API Lampa.SettingsApi.
     */
    function addSettings() {
        // ШАГ 1: Создаем сам раздел в настройках
        Lampa.SettingsApi.addComponent({
            component: 'lampa_custom_logo_settings', // Уникальное имя для нашего компонента
            name: 'Мой логотип', // Имя, которое будет отображаться в меню
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>`
        });

        // ШАГ 2: Добавляем поле для ввода SVG-кода в наш раздел
        Lampa.SettingsApi.addParam({
            component: 'lampa_custom_logo_settings', // Связываем с компонентом выше
            param: {
                name: STORAGE_KEY, // Имя параметра (ключ в хранилище)
                type: 'textarea',   // Указываем тип поля - многострочный текст
                default: ''         // Значение по умолчанию
            },
            field: {
                name: 'SVG-код вашего логотипа',
                description: 'Вставьте сюда полный SVG-код. После изменения логотип применится автоматически. Для надежности можно перезагрузить Lampa.'
            },
            // Эта функция будет вызываться каждый раз при изменении значения в поле
            onChange: function(value) {
                // Lampa.Storage.set(STORAGE_KEY, value); // Lampa делает это автоматически для 'param'
                applyCustomLogo(); // Сразу же пробуем применить логотип "на лету"
            }
        });
    }

    /**
     * Главная логика плагина
     */
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            // 1. Добавляем страницу настроек по-новому
            addSettings();

            // 2. Сразу же пытаемся применить логотип при загрузке
            applyCustomLogo();

            // 3. Используем MutationObserver для надежности. Он сработает,
            // если Lampa перерисует шапку (например, при переходе между страницами).
            const observer = new MutationObserver(applyCustomLogo);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

})();
