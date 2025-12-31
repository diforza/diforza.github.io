(function () {
    'use strict';

    if (window.plugin_final_interface) return;
    window.plugin_final_interface = true;

    console.log('Final Interface Plugin for Lampa 3.1.2');

    // Ждем полной загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && Lampa.Manifest && Lampa.ContentRows) {
            callback();
        } else {
            setTimeout(function() {
                waitForLampa(callback);
            }, 100);
        }
    }

    // Основная функция инициализации
    function initPlugin() {
        console.log('Initializing final interface plugin...');
        
        // 1. Добавляем стили нового интерфейса
        addInterfaceStyles();
        
        // 2. Используем ContentRows API для перехвата создания интерфейса
        useContentRowsHook();
        
        // 3. Добавляем обработчик для модификации существующего интерфейса
        modifyExistingInterface();
        
        console.log('Final interface plugin initialized');
    }

    // Добавление стилей нового интерфейса
    function addInterfaceStyles() {
        var styles = `
        <style id="new-interface-styles">
        /* Основные стили нового интерфейса */
        .new-interface-mod {
            /* Флаг для модифицированного интерфейса */
        }
        
        .new-interface-mod .full-start__info {
            position: relative !important;
            padding: 0 1.5em !important;
            width: 95% !important;
        }
        
        .new-interface-mod .full-start__title {
            font-size: 4em !important;
            font-weight: 600 !important;
            margin-bottom: 0.5em !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 1 !important;
            line-clamp: 1 !important;
            -webkit-box-orient: vertical !important;
            line-height: 1 !important;
        }
        
        /* Контейнер для деталей */
        .new-interface-details {
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            margin-bottom: 0.1em !important;
            font-size: 1.2em !important;
            gap: 0.5em !important;
            min-height: 1.9em !important;
        }
        
        /* Блоки информации */
        .info-block {
            border: 1px solid rgba(255, 255, 255, 1) !important;
            padding: 0.3em 0.5em !important;
            border-radius: 0 !important;
            white-space: nowrap !important;
            display: inline-flex !important;
            align-items: center !important;
        }
        
        /* Разделитель */
        .info-separator {
            font-size: 1.5em !important;
            font-weight: 900 !important;
            color: rgba(255, 255, 255, 0.8) !important;
            margin: 0 0.2em !important;
            line-height: 1 !important;
        }
        
        /* PG рейтинг */
        .pg-rating {
            font-weight: bold !important;
        }
        
        /* Скрываем элементы */
        .new-interface-mod .full-start__description,
        .new-interface-mod .full-start__rate,
        .new-interface-mod .full-start__split {
            display: none !important;
        }
        
        /* Карточки */
        .new-interface-mod .card--small.card--wide {
            width: 18.5em !important;
        }
        
        /* Адаптация */
        @media (max-width: 767px) {
            .new-interface-mod .full-start__title {
                font-size: 2.5em !important;
            }
            .new-interface-mod .new-interface-details {
                font-size: 1em !important;
            }
        }
        </style>
        `;
        
        $('head').append(styles);
        console.log('Interface styles added');
    }

    // Использование ContentRows API для перехвата
    function useContentRowsHook() {
        if (!Lampa.ContentRows || !Lampa.ContentRows.add) {
            console.log('ContentRows API not available');
            return;
        }
        
        console.log('Using ContentRows API for interface modification');
        
        // Добавляем обработчик для главного экрана
        Lampa.ContentRows.add({
            index: 9999, // Высокий индекс, чтобы быть последним
            screen: ['main'],
            call: function(params, screen) {
                return function(callback) {
                    console.log('ContentRows callback for main screen');
                    
                    // Вызываем оригинальный callback
                    if (typeof callback === 'function') {
                        // Модифицируем интерфейс после его создания
                        setTimeout(function() {
                            applyInterfaceModifications();
                        }, 500);
                    }
                    
                    // Возвращаем пустой результат, чтобы не добавлять новый ряд
                    return;
                };
            }
        });
    }

    // Функция модификации существующего интерфейса
    function modifyExistingInterface() {
        // Периодически проверяем и модифицируем интерфейс
        var checkInterval = setInterval(function() {
            var mainInterface = $('.full-start, .main-screen');
            if (mainInterface.length > 0) {
                applyInterfaceModifications();
                // После успешной модификации проверяем реже
                clearInterval(checkInterval);
                setInterval(applyInterfaceModifications, 2000);
            }
        }, 500);
        
        // Также модифицируем при навигации
        if (Lampa.Listener && Lampa.Listener.on) {
            Lampa.Listener.on('activity:push', function() {
                setTimeout(applyInterfaceModifications, 1000);
            });
            
            Lampa.Listener.on('activity:replace', function() {
                setTimeout(applyInterfaceModifications, 1000);
            });
        }
    }

    // Применение модификаций к интерфейсу
    function applyInterfaceModifications() {
        // Ищем основной интерфейс
        var interfaces = $('.full-start, [class*="main"], [class*="Main"]');
        
        interfaces.each(function() {
            var $interface = $(this);
            
            // Проверяем, не модифицирован ли уже
            if ($interface.hasClass('new-interface-mod')) {
                return;
            }
            
            // Проверяем условия для модификации
            var shouldModify = checkModificationConditions($interface);
            
            if (shouldModify) {
                console.log('Modifying interface element');
                modifyInterfaceElement($interface);
            }
        });
    }

    // Проверка условий для модификации
    function checkModificationConditions($element) {
        // Проверяем URL или другие признаки TMDB/CUB интерфейса
        var url = window.location.href;
        var isTmdb = url.includes('source=tmdb') || url.includes('source=cub') || url.includes('source=surs');
        var isFavorite = url.includes('source=favorite');
        var isMobile = window.innerWidth < 767;
        
        // Не модифицируем избранное и мобильные
        if (isFavorite || isMobile) {
            return false;
        }
        
        // Проверяем наличие элементов интерфейса
        var hasTitle = $element.find('.full-start__title').length > 0;
        var hasInfoLine = $element.find('.full-start__line').length > 0;
        
        return isTmdb && (hasTitle || hasInfoLine);
    }

    // Модификация элемента интерфейса
    function modifyInterfaceElement($interface) {
        // Добавляем маркер модификации
        $interface.addClass('new-interface-mod');
        
        // Модифицируем заголовок
        var $title = $interface.find('.full-start__title');
        if ($title.length > 0) {
            $title.css({
                'font-size': '4em',
                'font-weight': '600',
                'margin-bottom': '0.5em',
                'line-height': '1'
            });
        }
        
        // Модифицируем строку информации
        var $infoLine = $interface.find('.full-start__line');
        if ($infoLine.length > 0) {
            // Сохраняем оригинальный текст
            var originalText = $infoLine.text().trim();
            
            // Создаем новую структуру
            $infoLine.addClass('new-interface-details');
            
            // Разбиваем на части (год, страна, жанры, рейтинг)
            var parts = parseInfoLine(originalText);
            
            // Создаем HTML с блоками
            var newHtml = '';
            parts.forEach(function(part, index) {
                if (part.trim()) {
                    var className = 'info-block';
                    if (part.match(/PG|R|NC-17|G|PG-13/)) {
                        className += ' pg-rating';
                    }
                    newHtml += '<span class="' + className + '">' + part.trim() + '</span>';
                    if (index < parts.length - 1) {
                        newHtml += '<span class="info-separator">︙</span>';
                    }
                }
            });
            
            $infoLine.html(newHtml);
            console.log('Interface line modified');
        }
        
        // Скрываем ненужные элементы
        $interface.find('.full-start__description, .full-start__rate, .full-start__split').hide();
        
        // Добавляем обработчик для обновления PG рейтинга
        addPGRatingHandler($interface);
    }

    // Парсинг строки информации
    function parseInfoLine(text) {
        // Удаляем лишние пробелы и разделители
        var cleaned = text.replace(/\s+/g, ' ').trim();
        
        // Разбиваем по точкам или другим разделителям
        var parts = cleaned.split(/•|·|\.\s+/).map(function(part) {
            return part.trim();
        }).filter(function(part) {
            return part.length > 0;
        });
        
        return parts;
    }

    // Добавление обработчика PG рейтинга
    function addPGRatingHandler($interface) {
        // Глобальная функция для получения PG рейтинга
        window.getEnhancedPGRating = function(data) {
            // Сначала пробуем внешний плагин
            if (typeof window.getInternationalPG === 'function') {
                var rating = window.getInternationalPG(data);
                if (rating) return rating;
            }
            
            // Затем стандартный способ Lampa
            if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb) {
                var defaultRating = Lampa.Api.sources.tmdb.parsePG(data);
                if (defaultRating) return defaultRating;
            }
            
            // Пытаемся извлечь из content_ratings
            if (data && data.content_ratings) {
                var usRating = data.content_ratings.results.find(function(r) {
                    return r.iso_3166_1 === 'US';
                });
                if (usRating && usRating.rating) {
                    return usRating.rating;
                }
            }
            
            return null;
        };
        
        // Обработчик для обновления рейтинга при фокусе
        if (Lampa.Listener && Lampa.Listener.on) {
            Lampa.Listener.on('card:focus', function(e) {
                if (e && e.data) {
                    setTimeout(function() {
                        updatePGRatingInInterface(e.data);
                    }, 300);
                }
            });
        }
    }

    // Обновление PG рейтинга в интерфейсе
    function updatePGRatingInInterface(data) {
        var rating = window.getEnhancedPGRating ? window.getEnhancedPGRating(data) : null;
        if (rating) {
            // Ищем блок с рейтингом
            var $ratingBlock = $('.info-block.pg-rating');
            if ($ratingBlock.length > 0) {
                $ratingBlock.text(rating);
            } else {
                // Добавляем новый блок
                var $details = $('.new-interface-details');
                if ($details.length > 0) {
                    $details.append('<span class="info-separator">︙</span>' +
                                   '<span class="info-block pg-rating">' + rating + '</span>');
                }
            }
        }
    }

    // Инициализация плагина
    waitForLampa(initPlugin);

    // Экспортируем функции для отладки
    window.interfacePlugin = {
        applyModifications: applyInterfaceModifications,
        checkConditions: checkModificationConditions,
        getPGRating: function(data) {
            return window.getEnhancedPGRating ? window.getEnhancedPGRating(data) : null;
        }
    };

    console.log('Final Interface Plugin loaded, waiting for Lampa...');

})();
