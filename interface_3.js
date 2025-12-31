(function () {
    'use strict';

    if (window.plugin_interface_debug) return;
    window.plugin_interface_debug = true;

    console.log('=== Lampa Interface Debug Plugin ===');
    console.log('Lampa version:', Lampa.Manifest.app_digital);
    
    // Исследуем структуру Lampa
    console.log('=== Lampa Global ===');
    console.log('Lampa keys:', Object.keys(Lampa).filter(k => typeof Lampa[k] === 'function' || typeof Lampa[k] === 'object'));
    
    console.log('=== Maker System ===');
    if (Lampa.Maker) {
        console.log('Maker exists');
        console.log('Maker.list():', Lampa.Maker.list ? Lampa.Maker.list() : 'no list method');
        
        // Ищем Main класс
        try {
            var MainClass = Lampa.Maker.get('Main');
            console.log('Main class found:', MainClass);
            console.log('Main class prototype:', Object.getPrototypeOf(MainClass || {}));
        } catch(e) {
            console.log('Error getting Main class:', e);
        }
    }
    
    // Ищем, как создаются компоненты
    console.log('=== Activity System ===');
    if (Lampa.Activity) {
        console.log('Activity methods:', Object.keys(Lampa.Activity).filter(k => typeof Lampa.Activity[k] === 'function'));
    }
    
    // Мониторим создание компонентов
    var originalPush = Lampa.Activity ? Lampa.Activity.push : null;
    if (originalPush) {
        Lampa.Activity.push = function() {
            console.log('Activity.push called with:', arguments);
            console.trace('Activity.push stack');
            return originalPush.apply(this, arguments);
        };
        console.log('Activity.push patched for monitoring');
    }
    
    // Проверяем наличие старых классов
    console.log('=== Old Classes Check ===');
    console.log('Lampa.InteractionMain:', typeof Lampa.InteractionMain);
    console.log('Lampa.InteractionLine:', typeof Lampa.InteractionLine);
    console.log('Lampa.Card:', typeof Lampa.Card);
    
    // Создаем тестовый плагин для перехвата
    function createTestPlugin() {
        console.log('Creating test plugin...');
        
        // Пробуем найти, как создаются Main компоненты
        if (Lampa.Maker && Lampa.Maker.make) {
            console.log('Testing Maker.make...');
            
            // Перехватываем создание Main через Maker
            var originalMake = Lampa.Maker.make;
            Lampa.Maker.make = function(type, data, modules) {
                console.log('Maker.make called:', type, data);
                
                if (type === 'Main') {
                    console.log('Main component creation intercepted!');
                    console.log('Source:', data.source);
                    console.log('Data:', data);
                    
                    // Проверяем условия для нашего интерфейса
                    var useCustomInterface = false;
                    if (data.source == 'tmdb' || data.source == 'cub' || data.source == 'surs') {
                        useCustomInterface = true;
                    }
                    
                    if (data.source == 'favorite') {
                        useCustomInterface = false;
                    }
                    
                    console.log('Use custom interface:', useCustomInterface);
                    
                    if (useCustomInterface) {
                        // Здесь будет наш кастомный интерфейс
                        console.log('Would create custom interface');
                        // Пока просто возвращаем оригинальный
                    }
                }
                
                return originalMake.call(this, type, data, modules);
            };
            
            console.log('Maker.make patched');
        }
        
        // Пробуем другой подход - через события
        if (Lampa.Listener && Lampa.Listener.on) {
            Lampa.Listener.on('activity:create', function(e) {
                console.log('Activity create event:', e);
            });
            
            Lampa.Listener.on('activity:push', function(e) {
                console.log('Activity push event:', e);
            });
        }
    }
    
    // Запускаем тест
    createTestPlugin();
    
    // Добавляем стили для теста
    Lampa.Template.add('debug_style', `
        <style>
        .debug-overlay {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: #0f0;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 999999;
            border: 2px solid #0f0;
            border-radius: 5px;
            display: none;
        }
        .debug-overlay.active {
            display: block;
        }
        </style>
    `);
    $('body').append(Lampa.Template.get('debug_style', {}, true));
    
    // Создаем оверлей для отладки
    var overlay = $('<div class="debug-overlay">Debug: Plugin loaded</div>');
    $('body').append(overlay);
    
    // Кнопка для включения/выключения дебага
    var debugButton = $('<button style="position:fixed;bottom:10px;right:10px;z-index:999999;">Debug</button>');
    debugButton.on('click', function() {
        overlay.toggleClass('active');
    });
    $('body').append(debugButton);
    
    console.log('=== Debug Plugin Loaded ===');

})();
