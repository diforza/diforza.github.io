(function () {
    'use strict';

    if (window.uiCustomizerPluginLoaded) return;
    window.uiCustomizerPluginLoaded = true;

    function customizeUI() {
        console.log('Lampa UI Customizer: Applying changes...');

        var logo = document.querySelector('.head__logo-icon');
        if (logo) {
            logo.remove();
            console.log('Lampa UI Customizer: Logo removed.');
        }

        var notice = document.querySelector('.head__action.open--notice.notice--icon') ||
                     document.querySelector('.head__action[data-action="notice"]');
        if (notice) {
            notice.remove();
            console.log('Lampa UI Customizer: Notice icon removed.');
        }

        var feed = document.querySelector('.head__action.open--feed') ||
                   document.querySelector('.head__action[data-action="feed"]') ||
                   document.querySelector('.menu__item[data-action="feed"]');
        if (feed) {
            feed.remove();
            console.log('Lampa UI Customizer: Feed icon removed.');
        }
    }

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            customizeUI();
        }
    });

})();
