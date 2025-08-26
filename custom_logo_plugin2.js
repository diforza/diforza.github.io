(function () {
    'use strict';

    if (window.lampaUICustomizer) return;
    window.lampaUICustomizer = true;

    function applyLogoSetting() {
        const action = Lampa.Storage.get('ui_logo_action', 'default');
        const svgCode = Lampa.Storage.get('ui_customizer_logo_svg', '');
        let logoContainer = document.querySelector('.head__logo-icon');
        const logoWrapper = document.querySelector('.head__logo');

        switch (action) {
            case 'delete':
                if (logoContainer) logoContainer.remove();
                break;
            case 'replace':
                if (!logoContainer && logoWrapper) {
                    logoContainer = document.createElement('div');
                    logoContainer.classList.add('head__logo-icon');
                    logoWrapper.prepend(logoContainer);
                }
                if (logoContainer) logoContainer.innerHTML = svgCode || '';
                break;
            default:
                if (!logoContainer && logoWrapper) {
                    logoContainer = document.createElement('div');
                    logoContainer.classList.add('head__logo-icon');
                    logoWrapper.prepend(logoContainer);
                }
                break;
        }
    }

    Lampa.SettingsApi.addComponent({
        component: 'ui_customizer_settings',
        name: 'Настройки логотипа',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l.34 2.27.28 1.84.05.32.32-.05 1.84-.28 2.27-.34.69 4.03-1.5 1.5-.24.24.08.34 1.08 4.53-3.03 3.03-4.53-1.08-.34-.08-.24.24-1.5-1.5-4.03-.69zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>'
    });

    Lampa.SettingsApi.addParam({
        component: 'ui_customizer_settings',
        param: {
            name: 'ui_logo_action',
            type: 'select',
            values: {
                'default': 'Оставить стандартный',
                'delete': 'Удалить логотип',
                'replace': 'Заменить на свой (SVG)'
            },
            'default': 'default'
        },
        field: {
            name: 'Действие с логотипом',
            description: 'Что делать с логотипом в шапке приложения.'
        },
        onChange: function(value) {
            Lampa.Storage.set('ui_logo_action', value);
            applyLogoSetting();
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'ui_customizer_settings',
        param: {
            name: 'ui_customizer_logo_svg',
            type: 'input',
            'default': '',
            values: {},
            placeholder: '<svg>...</svg>'
        },
        field: {
            name: 'SVG-код логотипа',
            description: 'Используется, если выбрано «Заменить на свой».'
        },
        onChange: function(value) {
            Lampa.Storage.set('ui_customizer_logo_svg', value);
            applyLogoSetting();
        }
    });

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            applyLogoSetting();
        }
    });

})();
