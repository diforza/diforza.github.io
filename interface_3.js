(function () {
    'use strict';

    if (window.interface_overrider) return;
    window.interface_overrider = true;

    console.log('Interface Style Overrider Plugin');

    // Основная функция для перехвата и модификации
    function overrideInterfaceStyles() {
        console.log('Overriding interface styles...');
        
        // 1. Добавляем новые стили с !important
        var overrideCSS = `
        <style id="interface-override">
        /* Скрываем заголовок */
        .new-interface-info__head {
            display: none !important;
        }
        
        /* Увеличиваем название */
        .new-interface-info__title {
            font-size: 4em !important;
            font-weight: 600 !important;
            margin-bottom: 0.5em !important;
            line-height: 1 !important;
        }
        
        /* Преобразуем строку в блоки */
        .new-interface-info__details {
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            gap: 0.5em !important;
            min-height: 1.9em !important;
            margin-bottom: 0.1em !important;
        }
        
        /* Создаем блоки для элементов */
        .new-interface-info__details > * {
            border: 1px solid rgba(255, 255, 255, 1) !important;
            padding: 0.3em 0.5em !important;
            border-radius: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            white-space: nowrap !important;
        }
        
        /* Специальные стили для разделителей */
        .new-interface-info__split {
            font-size: 1.5em !important;
            font-weight: 900 !important;
            color: rgba(255, 255, 255, 0.8) !important;
            margin: 0 0.2em !important;
            border: none !important;
            padding: 0 !important;
        }
        
        /* Скрываем описание */
        .new-interface-info__description {
            display: none !important;
        }
        
        /* Скрываем рейтинг */
        .full-start__rate {
            display: none !important;
        }
        </style>
        `;
        
        // Удаляем если уже есть
        $('#interface-override').remove();
        
        // Добавляем
        $('head').append(overrideCSS);
        
        console.log('Interface styles overridden');
    }

    // Функция для перехвата данных перед отображением
    function interceptData() {
        console.log('Attempting to intercept data flow...');
        
        // Пробуем найти сетевые запросы оригинального плагина
        if (window.Lampa && Lampa.Reguest) {
            console.log('Found Lampa.Reguest, attempting to intercept...');
            
            // Сохраняем оригинальный silent метод
            var originalSilent = Lampa.Reguest.prototype.silent;
            
            // Переопределяем
            Lampa.Reguest.prototype.silent = function(url, callback) {
                // Создаем обертку для callback
                var wrappedCallback = function(data) {
                    console.log('Intercepted data for:', url);
                    
                    // Модифицируем данные перед передачей
                    if (data && data.genres) {
                        // Можно модифицировать данные здесь
                        console.log('Data intercepted, has genres:', data.genres.length);
                    }
                    
                    // Вызываем оригинальный callback
                    if (callback) callback(data);
                };
                
                // Вызываем оригинальный метод с нашим callback
                return originalSilent.call(this, url, wrappedCallback);
            };
            
            console.log('Successfully intercepted network requests');
        }
    }

    // Мониторинг появления интерфейса
    function monitorInterface() {
        console.log('Starting interface monitor...');
        
        var observer = new MutationObserver(function(mutations) {
            var foundInterface = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    $(mutation.addedNodes).each(function() {
                        if (this.nodeType === 1) {
                            if ($(this).hasClass('new-interface') || 
                                $(this).find('.new-interface').length > 0 ||
                                $(this).hasClass('new-interface-info')) {
                                foundInterface = true;
                            }
                        }
                    });
                }
            });
            
            if (foundInterface) {
                console.log('New interface detected!');
                
                // Применяем стили
                overrideInterfaceStyles();
                
                // Модифицируем контент
                setTimeout(modifyContent, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Также проверяем сразу
        if ($('.new-interface').length > 0 || $('.new-interface-info').length > 0) {
            console.log('Interface already exists');
            overrideInterfaceStyles();
            setTimeout(modifyContent, 100);
        }
    }

    // Модификация контента
    function modifyContent() {
        console.log('Modifying interface content...');
        
        // Ищем все блоки с деталями
        $('.new-interface-info__details').each(function() {
            var $details = $(this);
            var currentHTML = $details.html();
            
            if (currentHTML && currentHTML.includes('●')) {
                console.log('Found details to modify');
                
                // Заменяем разделители
                var newHTML = currentHTML.replace(/<span class="new-interface-info__split">●<\/span>/g, 
                    '<span class="new-interface-info__split" style="font-size:1.5em;font-weight:900;color:rgba(255,255,255,0.8);margin:0 0.2em;">︙</span>');
                
                // Добавляем классы к элементам
                newHTML = newHTML.replace(/>([^<]+)</g, function(match, content) {
                    if (content.trim() && !content.includes('new-interface-info__split')) {
                        return '><span class="info-block" style="border:1px solid white;padding:0.3em 0.5em;border-radius:0;display:inline-flex;align-items:center;">' + content + '</span><';
                    }
                    return match;
                });
                
                $details.html(newHTML);
            }
        });
    }

    // Инициализация
    function init() {
        console.log('Interface Overrider Plugin starting...');
        
        // Применяем стили сразу
        overrideInterfaceStyles();
        
        // Пробуем перехватить данные
        setTimeout(interceptData, 500);
        
        // Начинаем мониторинг
        monitorInterface();
        
        // Периодическая проверка
        setInterval(function() {
            if ($('.new-interface-info__details').length > 0) {
                modifyContent();
            }
        }, 2000);
    }

    // Запускаем
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 2000);
        });
    } else {
        setTimeout(init, 2000);
    }

})();
