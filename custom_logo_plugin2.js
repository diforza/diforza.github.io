(function () {
    'use strict';

    // Проверка, чтобы плагин не был запущен дважды
    if (window.LampaCustomLogoPlugin) return;
    window.LampaCustomLogoPlugin = true;

    // Ключ, по которому SVG будет храниться в памяти Lampa
    const STORAGE_KEY = 'my_plugin_custom_logo_svg';

    /**
     * Функция, которая находит и заменяет логотип.
     */
    function applyCustomLogo() {
        const logoContainer = document.querySelector('.head__logo-icon');
        const userLogoSVG = Lampa.Storage.get(STORAGE_KEY, '');

        if (logoContainer && userLogoSVG) {
            logoContainer.innerHTML = userLogoSVG;
            console.log('[CustomLogo] Логотип успешно заменен.');
        } else if (logoContainer) {
            console.log('[CustomLogo] SVG код не найден в настройках. Отображается стандартный логотип.');
        }
    }

    /**
     * Добавляем кнопку в настройки, которая открывает модальное окно для ввода SVG
     */
    function addSettings() {
        // Создаем сам раздел в настройках
        Lampa.SettingsApi.addComponent({
            component: 'lampa_custom_logo_settings',
            name: 'Мой логотип',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>`
        });

        // Добавляем кнопку для вызова модального окна
        Lampa.SettingsApi.addParam({
            component: 'lampa_custom_logo_settings',
            param: {
                name: 'edit_logo_button',
                type: 'button',
            },
            field: {
                name: 'Редактировать логотип',
                description: 'Нажмите, чтобы открыть окно для вставки SVG-кода вашего логотипа.'
            },
            // При нажатии на кнопку...
            onChange: function() {
                // 1. Создаем HTML-содержимое для нашего окна
                const modalContent = $(`
                    <div>
                        <div class="settings-input settings-input--textarea">
                           <div class="settings-input__title">SVG-код вашего логотипа</div>
                           <div class="settings-input__content">
                              <textarea class="settings-input__textarea" style="height: 250px;" placeholder="Вставьте сюда полный SVG-код..."></textarea>
                           </div>
                        </div>
                        <div class="settings-input__descr">
                            Логотип применится автоматически после вставки кода.
                        </div>
                    </div>
                `);

                // 2. Находим наше поле и сразу вставляем в него сохраненный SVG
                const textarea = modalContent.find('textarea');
                textarea.val(Lampa.Storage.get(STORAGE_KEY, ''));

                // 3. Вешаем обработчик, чтобы при каждом вводе символа все сохранялось и применялось
                textarea.on('input', function() {
                    Lampa.Storage.set(STORAGE_KEY, $(this).val());
                    applyCustomLogo();
                });

                // 4. Открываем модальное окно со всем нашим содержимым
                Lampa.Modal.open({
                    title: 'Редактирование логотипа',
                    html: modalContent,
                    size: 'medium',
                    onBack: function() {
                        Lampa.Modal.close();
                        // Возвращаем фокус на главный контроллер настроек
                        Lampa.Controller.toggle('settings');
                    }
                });

                // Небольшая задержка, чтобы дать окну появиться, а затем сфокусироваться на поле ввода
                setTimeout(() => {
                    textarea.focus();
                }, 100);
            }
        });
    }

    /**
     * Главная логика плагина
     */
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            // Добавляем настройки
            addSettings();

            // Сразу же пытаемся применить логотип при загрузке
            applyCustomLogo();

            // Используем MutationObserver для надежности
            const observer = new MutationObserver(applyCustomLogo);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

})();
