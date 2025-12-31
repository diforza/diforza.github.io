(function () {
    'use strict';

    if (!window.Lampa || Lampa.Manifest.app_digital < 300) return;

    Lampa.Listener.on('app:ready', function () {

        // визуальный маркер
        document.body.insertAdjacentHTML(
            'beforeend',
            '<div style="position:fixed;top:10px;right:10px;z-index:99999;background:#2196f3;color:#fff;padding:10px;font-size:14px">INTERFACE 3 ACTIVE</div>'
        );

        // корректное добавление строки
        Lampa.ContentRows.add({
            name: 'custom_interface',
            title: 'Мой интерфейс',
            type: 'list',
            results: [],
            nomore: true
        });
    });

})();
