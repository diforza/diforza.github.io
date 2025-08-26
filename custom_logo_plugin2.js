// == UI Customizer: Logo Settings v2.0 ==
(function () {
    'use strict';

    if (window.lampaUICustomizer) return;
    window.lampaUICustomizer = true;

    /**
     * Главная функция кастомизации.
     * Выполняет действие с логотипом в зависимости от настроек.
     */
    function handleLogo() {
        // Получаем настройку действия с логотипом. По умолчанию - 'default' (оставить как есть).
        const logoAction = Lampa.Storage.get('ui_logo_action', 'default');
        
        // Находим контейнер стандартного логотипа.
        var logoContainer = document.querySelector('.head__logo-icon');

        // Если контейнера нет на странице, ничего не делаем.
        if (!logoContainer) return;

        switch (logoAction) {
            case 'replace':
                // Пользователь выбрал "Заменить на свой"
                const userLogoSVG = Lampa.Storage.get('ui_customizer_logo_svg', '');
                if (userLogoSVG) {
                    // Если SVG-код предоставлен, вставляем его.
                    logoContainer.innerHTML = userLogoSVG;
                    console.log('UI Customizer: Custom logo applied.');
                } else {
                    // Если кода нет, но выбрана замена - удаляем лого, чтобы было видно, что настройка сработала.
                    logoContainer.remove();
                    console.log('UI Customizer: "Replace" selected but no SVG provided. Logo container removed.');
                }
                break;
            
            case 'delete':
                // Пользователь явно выбрал "Удалить"
                logoContainer.remove();
                console.log('UI Customizer: Logo container removed by user setting.');
                break;

            case 'default':
            default:
                // Пользователь выбрал "Оставить стандартный" или настройка еще не задана.
                // Ничего не делаем.
                console.log('UI Customizer: Action is "default". Native logo kept.');
                break;
        }
    }

    /**
     * Функция для удаления других элементов интерфейса.
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
     * Общая функция, которая запускает все изменения.
     */
    function applyAllChanges() {
        console.log('UI Customizer: Applying all UI changes...');
        handleLogo();
        removeOtherElements();
    }

    // --- Инициализация настроек плагина ---

    Lampa.SettingsApi.addComponent({
        component: 'ui_customizer_settings',
        name: 'Настройки логотипа',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l.34 2.27.28 1.84.05.32.32-.05 1.84-.28 2.27-.34.69 4.03-1.5 1.5-.24.24.08.34 1.08 4.53-3.03 3.03-4.53-1.08-.34-.08-.24.24-1.5-1.5-4.03-.69zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>'
    });

    // [ИЗМЕНЕНО] Переключатель с тремя опциями
    Lampa.SettingsApi.addParam({
        component: 'ui_customizer_settings',
        param: {
            name: 'ui_logo_action',
            type: 'select',
            values: {
                'default': 'Оставить стандартный',
                'replace': 'Заменить на свой',
                'delete': 'Удалить логотип'
            },
            'default': 'default'
        },
        field: {
            name: 'Действие с логотипом',
            description: 'Выберите, что делать с логотипом в шапке приложения.'
        },
        onChange: function(value) {
            Lampa.Storage.set('ui_logo_action', value);
            Lampa.Noty.show('Настройка сохранена. Перезагрузите Lampa для применения.');
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'ui_customizer_settings',
        param: {
            name: 'ui_customizer_logo_svg',
            type: 'input',
            'default': '',
            values: {},
            placeholder: 'Вставьте полный SVG-код сюда...'
        },
        field: {
            name: 'Код SVG для замены',
            description: 'Сработает, если в опции выше выбрано "Заменить на свой".'
        },
        onChange: function(value) {
            Lampa.Storage.set('ui_customizer_logo_svg', value);
            Lampa.Noty.show('Код логотипа сохранен.');
        }
    });

    // --- Запуск плагина ---

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            applyAllChanges();
        }
    });

})();
