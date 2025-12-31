(function () {
    'use strict';

    if (window.plugin_interface_minimal) return;
    window.plugin_interface_minimal = true;

    console.log('Minimal Interface Plugin for Lampa 3.1.2');

    // Функция проверки условий
    function shouldUseNewInterface(object) {
        if (!object) return false;
        
        var useNewInterface = false;
        
        if (object.source == 'tmdb' || object.source == 'cub' || object.source == 'surs') {
            useNewInterface = true;
        }
        
        if (object.source == 'favorite') {
            useNewInterface = false;
        }
        
        if (window.innerWidth < 767) {
            useNewInterface = false;
        }
        
        console.log('Interface decision:', {
            source: object.source,
            useNewInterface: useNewInterface,
            width: window.innerWidth
        });
        
        return useNewInterface;
    }

    // Основная функция перехвата
    function initPlugin() {
        console.log('Initializing minimal interface plugin...');
        
        // 1. Добавляем стили нового интерфейса
        addStyles();
        
        // 2. Перехватываем создание Main компонентов
        interceptMainCreation();
        
        console.log('Minimal interface plugin ready');
    }

    function addStyles() {
        Lampa.Template.add('new_interface_style', `
            <style>
            /* Добавляем классы нового интерфейса к существующим элементам */
            .full-start.full .full-start__info {
                /* Переопределяем стили инфо-блока */
                position: relative;
                padding: 0em 1.5em 0 1.5em;
            }
            
            .full-start.full .full-start__info .full-start__title {
                font-size: 4em;
                font-weight: 600;
                margin-bottom: 0.5em;
                overflow: hidden;
                -o-text-overflow: ".";
                text-overflow: ".";
                display: -webkit-box;
                -webkit-line-clamp: 1;
                line-clamp: 1;
                -webkit-box-orient: vertical;
                margin-left: -0.03em;
                line-height: 1;
            }
            
            .full-start.full .full-start__info .full-start__line {
                margin-bottom: 0.1em;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                min-height: 1.9em;
                font-size: 1.2em;
                gap: 0.0em;
            }
            
            .new-interface-info__block {
                border: 1px solid rgba(255, 255, 255, 1);
                padding: 0.3em 0.5em;
                border-radius: 0.0em;
                display: flex;
                align-items: center;
                white-space: nowrap;
                box-sizing: border-box;
                margin-right: 0.5em;
            }
            
            .new-interface-info__separator {
                margin: 0 0.5em;
                font-size: 1.5em;
                font-weight: 900;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Скрываем элементы, которые не нужны */
            .full-start__description {
                display: none !important;
            }
            
            .full-start__rate {
                display: none !important;
            }
            
            /* Адаптация для мобильных */
            @media (max-width: 767px) {
                .full-start.full .full-start__info .full-start__title {
                    font-size: 2.5em;
                }
                .full-start.full .full-start__info .full-start__line {
                    font-size: 1em;
                }
            }
            </style>
        `);
        
        $('body').append(Lampa.Template.get('new_interface_style', {}, true));
    }

    function interceptMainCreation() {
        // Способ 1: Через переопределение старых классов
        if (Lampa.InteractionMain) {
            var OriginalInteractionMain = Lampa.InteractionMain;
            
            Lampa.InteractionMain = function(object) {
                console.log('InteractionMain intercepted for:', object.source);
                
                if (shouldUseNewInterface(object)) {
                    console.log('Applying new interface styles to', object.source);
                    // Создаем оригинальный компонент
                    var instance = new OriginalInteractionMain(object);
                    
                    // Модифицируем его после создания
                    modifyInstance(instance, object);
                    
                    return instance;
                }
                
                return new OriginalInteractionMain(object);
            };
            
            console.log('InteractionMain interception complete');
        }
        
        // Способ 2: Через события (если первый не работает)
        if (Lampa.Listener && Lampa.Listener.on) {
            Lampa.Listener.on('component:ready', function(e) {
                console.log('Component ready:', e);
                // Можно попробовать модифицировать компонент после его готовности
            });
        }
    }

    function modifyInstance(instance, object) {
        // Эта функция будет модифицировать созданный экземпляр
        // Добавляем наши классы и стили
        setTimeout(function() {
            // Ищем элементы интерфейса и добавляем им наши классы
            $('.full-start').addClass('new-interface');
            $('.full-start__info').addClass('new-interface-info');
            $('.full-start__line').addClass('new-interface-info__details');
            
            console.log('Interface classes applied');
        }, 1000);
    }

    // Альтернативный подход: модификация через ContentRows API
    function useContentRowsAPI() {
        if (Lampa.ContentRows && Lampa.ContentRows.add) {
            console.log('Using ContentRows API');
            
            // Можно попробовать добавить кастомный ряд с нашим интерфейсом
            Lampa.ContentRows.add({
                index: 0,
                screen: ['main'],
                call: function(params, screen) {
                    return function(call) {
                        // Возвращаем кастомный интерфейс
                        call({
                            title: 'Custom Interface',
                            component: 'custom',
                            source: 'tmdb'
                        });
                    };
                }
            });
        }
    }

    // Запускаем плагин
    if (window.Lampa && Lampa.Manifest) {
        // Ждем полной загрузки
        setTimeout(initPlugin, 2000);
        
        // Также пробуем ContentRows API
        setTimeout(useContentRowsAPI, 3000);
    }

})();
