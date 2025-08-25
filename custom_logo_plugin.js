(function () {
    'use strict';

    if (window.uiCustomizerPluginLoaded) return;
    window.uiCustomizerPluginLoaded = true;
    
    // Функция для отрисовки нашего логотипа
    function applyCustomLogo() {
        // Получаем сохраненный SVG из хранилища Lampa. Если его нет, переменная будет пустой.
        const userLogoSVG = Lampa.Storage.get('my_custom_logo_svg', '');

        // Находим контейнер лого
        var logoContainer = document.querySelector('.head__logo-icon');

        if (logoContainer && userLogoSVG) {
            logoContainer.innerHTML = userLogoSVG;
            console.log('Lampa UI Customizer: Custom logo applied.');
        } else if (logoContainer) {
            // Если лого нет, можно либо оставить стандартное, либо удалить, как раньше
            // logoContainer.remove(); 
        }
    }

    // Добавляем поле для ввода в настройки Lampa
    Lampa.Settings.listener.follow('open', function (e) {
        // Проверяем, что это настройки плагинов
        if (e.name === 'plugins') {
            // Создаем наш новый элемент настроек
            var field = Lampa.Template.get('settings_input', {
                title: 'Код вашего SVG логотипа',
                name: 'my_custom_logo_svg',
                value: Lampa.Storage.get('my_custom_logo_svg', '') // Получаем текущее значение
            });
            
            // Навешиваем обработчик сохранения
            field.find('input').on('change', function () {
                Lampa.Storage.set('my_custom_logo_svg', $(this).val());
                // Можно добавить уведомление об успешном сохранении
                Lampa.Noty.show('Логотип сохранен. Перезагрузите Lampa, чтобы увидеть изменения.');
            });
            
            // Добавляем наше поле в конец списка настроек
            e.body.find('.settings-folder__content').append(field);
        }
    });

    /**
     * Основная функция кастомизации UI
     */
    function customizeUI() {
        console.log('Lampa UI Customizer: Applying changes...');
        
        // Применяем логотип
        applyCustomLogo();
        
        // ... остальной ваш код для удаления иконок ...
    }

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            customizeUI();
        }
    });

})();
