// == UI Customizer: Logo Settings ==
(function () {
    'use strict';

    // Проверяем, не был ли плагин уже запущен, чтобы избежать дублирования
    if (window.lampaUICustomizer) return;
    window.lampaUICustomizer = true;

    /**
     * Функция для применения пользовательского логотипа.
     * Считывает SVG из хранилища и вставляет его в шапку.
     */
    function applyCustomLogo() {
        const userLogoSVG = Lampa.Storage.get('ui_customizer_logo_svg', '');
        const useCustomLogo = Lampa.Storage.get('ui_customizer_use_logo', 'false') === 'true';
        var logoContainer = document.querySelector('.head__logo-icon');

        if (logoContainer && useCustomLogo && userLogoSVG) {
            logoContainer.innerHTML = userLogoSVG;
            console.log('UI Customizer: Custom logo applied.');
        } else if (logoContainer) {
            logoContainer.remove();
            console.log('UI Customizer: Custom logo disabled or not provided, default logo container removed.');
        }
    }

    /**
     * Функция для удаления других элементов интерфейса (уведомления, лента).
     */
    function removeOtherElements() {
        var notice = document.querySelector('.head__action.open--notice.notice--icon') ||
                     document.querySelector('.head__action[data-action="notice"]');
        if (notice) notice.remove();

        var feed = document.querySelector('.head__action.open--feed') ||
                   document.querySelector('.head__action[data-action="feed"]') ||
                   document.querySelector('.menu__item[data-action="feed"]');
        if (feed) feed.remove();

        console.log('UI Customizer: Extra icons removed.');
    }

    /**
     * Главная функция, которая запускает все изменения в интерфейсе.
     */
    function customizeUI() {
        console.log('UI Customizer: Applying all UI changes...');
        applyCustomLogo();
        removeOtherElements();
    }


    // --- Инициализация настроек плагина ---

    // 1. Создаем новую категорию в настройках Lampa
    Lampa.SettingsApi.addComponent({
        component: 'ui_customizer_settings',
        name: 'Настройки логотипа', // [ИЗМЕНЕНО] Более подходящее название
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l.34 2.27.28 1.84.05.32.32-.05 1.84-.28 2.27-.34.69 4.03-1.5 1.5-.24.24.08.34 1.08 4.53-3.03 3.03-4.53-1.08-.34-.08-.24.24-1.5-1.5-4.03-.69zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>'
    });

    // 2. Добавляем переключатель "Включить/Выключить свой логотип"
    Lampa.SettingsApi.addParam({
        component: 'ui_customizer_settings',
        param: {
            name: 'ui_customizer_use_logo',
            type: 'select',
            values: {
                'true': 'Заменить логотип',
                'false': 'Удалить логотип'
            },
            'default': 'false'
        },
        field: {
            name: 'Действие с логотипом',
            description: 'Выберите, что делать: заменить логотип на свой (из поля ниже) или полностью удалить его.'
        },
        onChange: function(value) {
            Lampa.Storage.set('ui_customizer_use_logo', value);
        }
    });

    // 3. Добавляем поле для ввода SVG-кода
    Lampa.SettingsApi.addParam({
        component: 'ui_customizer_settings',
        param: {
            name: 'ui_customizer_logo_svg',
            type: 'input',
            'default': '',
            values: {}, // [ИСПРАВЛЕНО] Добавлено недостающее обязательное свойство
            placeholder: 'Вставьте SVG-код сюда...'
        },
        field: {
            name: 'Код SVG для замены',
            description: 'Скопируйте и вставьте сюда полный код вашего SVG-логотипа. После сохранения перезагрузите Lampa.'
        },
        onChange: function(value) {
            Lampa.Storage.set('ui_customizer_logo_svg', value);
            Lampa.Noty.show('Код логотипа сохранен. Изменения применятся после перезагрузки Lampa.');
        }
    });


    // --- Запуск плагина ---

    // Ждем, пока Lampa будет полностью готова, и только потом вносим изменения в интерфейс
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            customizeUI();
        }
    });

})();
