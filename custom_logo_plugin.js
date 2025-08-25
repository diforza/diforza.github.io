(function () {
    'use strict';

    // Проверяем, не был ли плагин уже запущен
    if (window.uiCustomizerPluginLoaded) return;
    window.uiCustomizerPluginLoaded = true;

    /**
     * Вставьте сюда SVG-код вашего логотипа.
     * Откройте ваш .svg файл в текстовом редакторе и скопируйте его содержимое сюда,
     * заключив в обратные кавычки (`).
     */
    const myCustomLogoSVG = `
    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 511.999 511.999" style="enable-background:new 0 0 511.999 511.999;" xml:space="preserve">
<g>
	<g>
		<path fill="#fff" d="M508.745,246.041c-4.574-6.257-113.557-153.206-252.748-153.206S7.818,239.784,3.249,246.035
			c-4.332,5.936-4.332,13.987,0,19.923c4.569,6.257,113.557,153.206,252.748,153.206s248.174-146.95,252.748-153.201
			C513.083,260.028,513.083,251.971,508.745,246.041z M255.997,385.406c-102.529,0-191.33-97.533-217.617-129.418
			c26.253-31.913,114.868-129.395,217.617-129.395c102.524,0,191.319,97.516,217.617,129.418
			C447.361,287.923,358.746,385.406,255.997,385.406z"/>
	</g>
</g>
<g>
	<g>
		<path fill="#fff" d="M255.997,154.725c-55.842,0-101.275,45.433-101.275,101.275s45.433,101.275,101.275,101.275
			s101.275-45.433,101.275-101.275S311.839,154.725,255.997,154.725z M255.997,323.516c-37.23,0-67.516-30.287-67.516-67.516
			s30.287-67.516,67.516-67.516s67.516,30.287,67.516,67.516S293.227,323.516,255.997,323.516z"/>
	</g>
</g>

</svg>
    `;

    /**
     * Функция для кастомизации интерфейса.
     */
    function customizeUI() {
        console.log('Lampa UI Customizer: Applying changes...');

        // Замена логотипа в шапке
        var logoContainer = document.querySelector('head__logo-icon');
        if (logoContainer) {
            logoContainer.innerHTML = myCustomLogoSVG; // <-- Вот она, магия!
            console.log('Lampa UI Customizer: Logo replaced.');
        }

        // Удаление значка уведомлений
        var notice = document.querySelector('.head__action.open--notice.notice--icon') ||
                     document.querySelector('.head__action[data-action="notice"]');
        if (notice) {
            notice.remove();
            console.log('Lampa UI Customizer: Notice icon removed.');
        }

        // Удаление значка ленты
        var feed = document.querySelector('.head__action.open--feed') ||
                   document.querySelector('.head__action[data-action="feed"]') ||
                   document.querySelector('.menu__item[data-action="feed"]');
        if (feed) {
            feed.remove();
            console.log('Lampa UI Customizer: Feed icon removed.');
        }
    }

    /**
     * Главная логика плагина.
     */
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            customizeUI();
        }
    });

})();
