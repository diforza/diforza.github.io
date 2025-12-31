(function () {
    'use strict';

    if (window.plugin_interface_trace) return;
    window.plugin_interface_trace = true;

    console.log('=== Lampa Component Trace Plugin ===');
    console.log('Tracking ALL component creation...');

    // 1. Трассировка Activity.push - основной способ навигации
    var originalActivityPush = Lampa.Activity.push;
    Lampa.Activity.push = function() {
        console.log('🔵 Activity.push called with arguments:', arguments[0]);
        console.trace('Activity.push stack trace');
        return originalActivityPush.apply(this, arguments);
    };

    // 2. Трассировка создания Main компонента через любой метод
    var MainClass = Lampa.Maker.get('Main');
    if (MainClass) {
        // Сохраняем оригинальный конструктор
        var OriginalMainConstructor = MainClass;
        
        // Перехватываем создание через new MainClass()
        var intercepted = false;
        
        // Создаем прокси для класса Main
        function MainProxy(object) {
            console.log('🎯 Main constructor called DIRECTLY!');
            console.log('Object:', object);
            console.log('Source:', object.source);
            console.trace('Main constructor stack');
            
            // Проверяем условия для нашего интерфейса
            var useCustomInterface = false;
            if (object.source == 'tmdb' || object.source == 'cub' || object.source == 'surs') {
                useCustomInterface = true;
                console.log('✅ Would use custom interface!');
            }
            
            if (!useCustomInterface) {
                console.log('❌ Using original interface');
                return new OriginalMainConstructor(object);
            }
            
            // Здесь будет создание нашего интерфейса
            console.log('🚀 Should create custom interface here');
            
            // Пока возвращаем оригинальный
            return new OriginalMainConstructor(object);
        }
        
        // Пытаемся подменить класс в Maker
        try {
            Lampa.Maker.map('Main').CustomMain = MainProxy;
            console.log('Main class proxy registered in Maker.map');
        } catch(e) {
            console.log('Could not register in Maker.map:', e);
        }
    }

    // 3. Трассировка всех вызовов new
    var originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        var element = originalCreateElement.call(this, tagName);
        if (tagName === 'div') {
            // Можно добавить отслеживание создания div элементов
            var stack = new Error().stack;
            if (stack.includes('Main') || stack.includes('main')) {
                console.log('📄 div created for Main component');
            }
        }
        return element;
    };

    // 4. Мониторинг создания компонентов через подписку на события
    if (Lampa.Listener && Lampa.Listener.on) {
        Lampa.Listener.on('component:create', function(e) {
            console.log('📦 component:create event:', e);
        });
        
        Lampa.Listener.on('activity:create', function(e) {
            console.log('🎭 activity:create event:', e);
        });
    }

    // 5. Добавляем кнопку для включения расширенного логгирования
    var debugBtn = $('<button style="position:fixed;top:10px;left:10px;z-index:999999;background:red;color:white;padding:10px;">DEBUG ON</button>');
    var debugActive = false;
    
    debugBtn.on('click', function() {
        debugActive = !debugActive;
        $(this).text(debugActive ? 'DEBUG OFF' : 'DEBUG ON');
        $(this).css('background', debugActive ? 'green' : 'red');
        
        if (debugActive) {
            // Включаем супер-дебаг
            console.log('=== SUPER DEBUG ACTIVATED ===');
            
            // Логируем все вызовы методов
            var methodsToTrace = ['build', 'create', 'render', 'start', 'toggle'];
            methodsToTrace.forEach(function(method) {
                if (window[method]) {
                    var original = window[method];
                    window[method] = function() {
                        console.log('🔧 Global ' + method + ' called');
                        return original.apply(this, arguments);
                    };
                }
            });
        }
    });
    
    $('body').append(debugBtn);

    console.log('=== Component Trace Plugin Loaded ===');

})();
