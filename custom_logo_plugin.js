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
    <svg
   version="1.1"
   id="svg229"
   width="160"
   height="148"
   viewBox="0 0 160 148"
   sodipodi:docname="att (1).png"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <defs
     id="defs233" />
  <sodipodi:namedview
     id="namedview231"
     pagecolor="#ffffff"
     bordercolor="#000000"
     borderopacity="0.25"
     inkscape:showpageshadow="2"
     inkscape:pageopacity="0.0"
     inkscape:pagecheckerboard="0"
     inkscape:deskcolor="#d1d1d1"
     showgrid="false" />
  <g
     inkscape:groupmode="layer"
     inkscape:label="Image"
     id="g235">
    <image
       width="160"
       height="148"
       preserveAspectRatio="none"
       xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABvCAMAAAAQafTDAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAL
EwAACxMBAJqcGAAAAwBQTFRFAAAA////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////Bz0LCAAAAQB0Uk5T
AA8nRVZmeIaKh3xbRzARAhU6apnE6v/yyaRxPxwEABtGjfvRlVIDFlyv5/3ou2QaHnPO9vjUHx36
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
AAAASUVORK5CYII=
"
       id="image237" />
  </g>
</svg>
    `;

    /**
     * Функция для кастомизации интерфейса.
     */
    function customizeUI() {
        console.log('Lampa UI Customizer: Applying changes...');

        // Замена логотипа в шапке
        var logoContainer = document.querySelector('.head__logo-icon');
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
