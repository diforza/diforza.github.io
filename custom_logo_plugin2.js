(function () {
    'use strict';

    // Проверка, чтобы плагина не был запущен дважды
    if (window.LampaCustomLogoPlugin) return;
    window.LampaCustomLogoPlugin = true;

    // Ключ, по которому SVG будет храниться в памяти Lampa
    const STORAGE_KEY = 'my_plugin_custom_logo_svg';

    /**
     * Функция, которая находит и заменяет логотип.
     * Она берет SVG из настроек и вставляет его на страницу.
     */
    function applyCustomLogo() {
        // Важно: используем селектор с точкой, так как это класс CSS.
        // Вы писали, что у вас заработал вариант без точки, что очень необычно.
        // Если этот вариант не сработает, попробуйте снова убрать точку.
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
     * Добавляем новый раздел в настройки Lampa.
     * Это самый правильный и стабильный способ.
     */
    function addSettingsPage() {
        // Создаем описание нашего нового пункта в настройках
        const settingsComponent = {
            component: 'lampa_custom_logo_settings', // Уникальное имя для нашего компонента
            // Внешний вид нашего поля для ввода
            template: `
                <div class="settings-folder">
                    <div class="settings-folder__title">Мой логотип</div>
                    <div class="settings-folder__content">
                        <div class="settings-input settings-input--textarea">
                           <div class="settings-input__title">SVG-код вашего логотипа</div>
                           <div class="settings-input__content">
                              <textarea class="settings-input__textarea" placeholder="Вставьте сюда полный SVG-код вашего логотипа..."></textarea>
                           </div>
                        </div>
                        <div class="settings-input__descr">
                            После вставки кода перезагрузите Lampa (или перейдите на главную), чтобы увидеть изменения.
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
            }
        };

        // Регистрируем наш компонент в системе настроек Lampa
        Lampa.Settings.add(settingsComponent);
    }
    
    /**
     * Главная логика плагина
     */
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            // 1. Добавляем страницу настроек
            addSettingsPage();

            // 2. Сразу же пытаемся применить логотип при загрузке
            applyCustomLogo();

            // 3. Используем MutationObserver для надежности. Он сработает,
            // если Lampa перерисует шапку (например, при переходе между страницами).
            const observer = new MutationObserver(applyCustomLogo);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

})();
