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
     * ШАГ 1: Регистрируем нашу кастомную страницу настроек как полноценный компонент Lampa.
     * Здесь мы используем твой первоначальный подход с template и onRender,
     * но с правильной функцией Lampa.Component.add().
     */
    function registerSettingsComponent() {
        const settingsComponent = {
            component: 'lampa_custom_logo_settings_page', // Уникальное имя для нашего компонента-страницы
            // Внешний вид нашего поля для ввода
            template: `
                <div class="settings-folder">
                    <div class="settings-folder__title">Настройка логотипа</div>
                    <div class="settings-folder__content">
                        <div class="settings-input settings-input--textarea">
                           <div class="settings-input__title">SVG-код вашего логотипа</div>
                           <div class="settings-input__content">
                              <textarea class="settings-input__textarea" placeholder="Вставьте сюда полный SVG-код вашего логотипа..."></textarea>
                           </div>
                        </div>
                        <div class="settings-input__descr">
                            После вставки кода логотип применится сразу. Для надежности можно перезагрузить Lampa (или просто вернуться на главную).
                        </div>
                    </div>
                </div>
            `,
            // Эта функция вызывается, когда Lampa отрисовывает наши настройки
            onRender: function(html) {
                const textarea = html.find('textarea');
                
                // Загружаем сохраненное значение в поле
                textarea.val(Lampa.Storage.get(STORAGE_KEY, ''));

                // Сохраняем новое значение при любом изменении в поле
                textarea.on('input', function() {
                    Lampa.Storage.set(STORAGE_KEY, $(this).val());
                    // Сразу же пробуем применить логотип "на лету"
                    applyCustomLogo(); 
                });

                // Устанавливаем фокус на поле ввода для удобства
                Lampa.Controller.enable(this.name);
                Lampa.Controller.collectionSet(html);
                Lampa.Controller.collectionFocus(false, html);
                setTimeout(() => textarea.focus(), 100);
            },
            onBack: function() {
                // При выходе со страницы настроек закрываем ее
                Lampa.Activity.back();
            }
        };

        // Регистрируем наш компонент в системе Lampa
        Lampa.Component.add(settingsComponent);
    }
    
    /**
     * ШАГ 2: Добавляем в главное меню настроек кнопку, которая будет
     * открывать наш кастомный компонент.
     */
    function addSettingsButton() {
        // Создаем сам раздел в настройках
        Lampa.SettingsApi.addComponent({
            component: 'lampa_custom_logo_main_settings',
            name: 'Мой логотип',
            icon: `<svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>`
        });
        
        // Добавляем кнопку
        Lampa.SettingsApi.addParam({
            component: 'lampa_custom_logo_main_settings',
            param: {
                name: 'open_logo_settings_button',
                type: 'button',
            },
            field: {
                name: 'Настроить логотип',
                description: 'Открыть страницу для вставки SVG-кода вашего логотипа.'
            },
            // При нажатии на кнопку...
            onChange: function() {
                // ...открываем нашу ранее зарегистрированную страницу-компонент
                Lampa.Activity.push({
                    component: 'lampa_custom_logo_settings_page'
                });
            }
        });
    }

    /**
     * Главная логика плагина
     */
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            // 1. Регистрируем компонент нашей страницы
            registerSettingsComponent();
            
            // 2. Добавляем кнопку в основное меню настроек
            addSettingsButton();

            // 3. Сразу же пытаемся применить логотип при загрузке
            applyCustomLogo();

            // 4. Используем MutationObserver для надежности. Он сработает,
            // если Lampa перерисует шапку (например, при переходе между страницами).
            const observer = new MutationObserver(applyCustomLogo);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

})();
