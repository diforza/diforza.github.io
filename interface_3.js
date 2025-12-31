(function () {
    'use strict';

    if (window.interface_plugin_v4) return;
    window.interface_plugin_v4 = true;

    console.log('Interface Plugin v4 for Lampa 3.1.2');

    // Конфигурация
    var config = {
        enabled: true,
        debug: true,
        targetSources: ['tmdb', 'cub', 'surs'],
        excludeSources: ['favorite'],
        minWidth: 768,
        checkInterval: 1000,
        maxChecks: 30
    };

    // Стили нового интерфейса
    var interfaceStyles = `
    <style id="new-interface-css">
    /* Основные стили нового интерфейса */
    .interface-v4 .full-start__info {
        position: relative !important;
        padding: 0 1.5em !important;
        width: 95% !important;
    }
    
    .interface-v4 .full-start__title {
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
    
    /* Контейнер для деталей с блоками */
    .interface-v4 .full-start__line {
        display: flex !important;
        flex-wrap: wrap !important;
        align-items: center !important;
        margin-bottom: 0.1em !important;
        font-size: 1.2em !important;
        gap: 0.5em !important;
        min-height: 1.9em !important;
    }
    
    /* Блоки информации */
    .info-block-v4 {
        border: 1px solid rgba(255, 255, 255, 1) !important;
        padding: 0.3em 0.5em !important;
        border-radius: 0 !important;
        white-space: nowrap !important;
        display: inline-flex !important;
        align-items: center !important;
        margin-right: 0 !important;
    }
    
    /* Разделитель */
    .info-separator-v4 {
        font-size: 1.5em !important;
        font-weight: 900 !important;
        color: rgba(255, 255, 255, 0.8) !important;
        margin: 0 0.2em !important;
        line-height: 1 !important;
    }
    
    /* PG рейтинг */
    .pg-rating-v4 {
        font-weight: bold !important;
    }
    
    /* Скрываем ненужные элементы */
    .interface-v4 .full-start__description,
    .interface-v4 .full-start__rate,
    .interface-v4 .full-start__split {
        display: none !important;
    }
    
    /* Карточки */
    .interface-v4 .card--small.card--wide {
        width: 18.5em !important;
    }
    
    /* Адаптация для мобильных */
    @media (max-width: 767px) {
        .interface-v4 .full-start__title {
            font-size: 2.5em !important;
        }
        .interface-v4 .full-start__line {
            font-size: 1em !important;
        }
    }
    </style>
    `;

    // Основной класс плагина
    function InterfacePlugin() {
        this.initialized = false;
        this.stylesAdded = false;
        this.observer = null;
        this.checkCount = 0;
    }

    InterfacePlugin.prototype.init = function() {
        if (this.initialized) return;
        
        console.log('Initializing Interface Plugin v4');
        
        // 1. Добавляем стили
        this.addStyles();
        
        // 2. Начинаем мониторинг DOM
        this.startMonitoring();
        
        // 3. Настраиваем обработчики событий
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('Interface Plugin v4 initialized');
    };

    InterfacePlugin.prototype.addStyles = function() {
        if (this.stylesAdded) return;
        
        $('head').append(interfaceStyles);
        this.stylesAdded = true;
        
        if (config.debug) console.log('Interface styles added');
    };

    InterfacePlugin.prototype.startMonitoring = function() {
        var self = this;
        
        // Используем MutationObserver для отслеживания изменений DOM
        this.observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    self.checkAndModifyInterface();
                }
            });
        });
        
        // Начинаем наблюдение
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Также периодически проверяем
        var interval = setInterval(function() {
            self.checkCount++;
            self.checkAndModifyInterface();
            
            if (self.checkCount > config.maxChecks) {
                clearInterval(interval);
                if (config.debug) console.log('Stopped periodic checks');
            }
        }, config.checkInterval);
        
        // Первая проверка
        setTimeout(function() {
            self.checkAndModifyInterface();
        }, 2000);
        
        if (config.debug) console.log('DOM monitoring started');
    };

    InterfacePlugin.prototype.setupEventListeners = function() {
        var self = this;
        
        // При навигации проверяем интерфейс
        if (Lampa.Listener && Lampa.Listener.on) {
            Lampa.Listener.on('activity:push', function() {
                setTimeout(function() {
                    self.checkAndModifyInterface();
                }, 1500);
            });
            
            Lampa.Listener.on('activity:replace', function() {
                setTimeout(function() {
                    self.checkAndModifyInterface();
                }, 1500);
            });
        }
        
        // Также проверяем при фокусе на карточке
        $(document).on('focusin', function() {
            setTimeout(function() {
                self.checkAndModifyInterface();
            }, 300);
        });
    };

    InterfacePlugin.prototype.shouldModify = function() {
        // Проверяем URL
        var url = window.location.href;
        var currentSource = this.getCurrentSource();
        
        // Проверяем источник
        var isTargetSource = config.targetSources.includes(currentSource);
        var isExcludedSource = config.excludeSources.includes(currentSource);
        var isMobile = window.innerWidth < config.minWidth;
        
        if (config.debug) {
            console.log('Source check:', {
                currentSource: currentSource,
                isTargetSource: isTargetSource,
                isExcludedSource: isExcludedSource,
                isMobile: isMobile,
                width: window.innerWidth
            });
        }
        
        return isTargetSource && !isExcludedSource && !isMobile;
    };

    InterfacePlugin.prototype.getCurrentSource = function() {
        var url = window.location.href;
        var match = url.match(/source=([^&]+)/);
        return match ? match[1] : 'tmdb'; // По умолчанию TMDB
    };

    InterfacePlugin.prototype.checkAndModifyInterface = function() {
        if (!this.shouldModify()) {
            if (config.debug) console.log('Skipping interface modification');
            return;
        }
        
        // Ищем основной интерфейс
        var $interface = this.findMainInterface();
        
        if ($interface.length === 0) {
            if (config.debug && this.checkCount < 5) {
                console.log('Main interface not found yet');
            }
            return;
        }
        
        // Проверяем, не модифицирован ли уже
        if ($interface.hasClass('interface-v4')) {
            return;
        }
        
        // Модифицируем интерфейс
        this.modifyInterface($interface);
    };

    InterfacePlugin.prototype.findMainInterface = function() {
        // Пробуем разные селекторы для поиска основного интерфейса
        var selectors = [
            '.full-start',
            '.main-screen',
            '.full-start.full',
            '[class*="full"]',
            '[class*="main"]',
            '.full-start__body'
        ];
        
        for (var i = 0; i < selectors.length; i++) {
            var $element = $(selectors[i]);
            if ($element.length > 0) {
                if (config.debug && this.checkCount < 3) {
                    console.log('Found interface with selector:', selectors[i]);
                }
                return $element;
            }
        }
        
        return $();
    };

    InterfacePlugin.prototype.modifyInterface = function($interface) {
        if (config.debug) console.log('Modifying interface');
        
        // Добавляем маркер модификации
        $interface.addClass('interface-v4');
        
        // Модифицируем заголовок
        this.modifyTitle($interface);
        
        // Модифицируем строку информации
        this.modifyInfoLine($interface);
        
        // Скрываем ненужные элементы
        this.hideUnwantedElements($interface);
        
        // Обновляем PG рейтинг если нужно
        this.updatePGRating();
        
        if (config.debug) console.log('Interface modified successfully');
    };

    InterfacePlugin.prototype.modifyTitle = function($interface) {
        var $title = $interface.find('.full-start__title').first();
        if ($title.length > 0) {
            $title.css({
                'font-size': '4em',
                'font-weight': '600',
                'margin-bottom': '0.5em',
                'line-height': '1'
            });
        }
    };

    InterfacePlugin.prototype.modifyInfoLine = function($interface) {
        var $infoLine = $interface.find('.full-start__line').first();
        if ($infoLine.length === 0) return;
        
        // Сохраняем оригинальный текст
        var originalText = $infoLine.text().trim();
        if (!originalText) return;
        
        // Очищаем текущее содержимое
        $infoLine.empty();
        
        // Разбиваем на части
        var parts = this.parseInfoText(originalText);
        
        // Добавляем блоки
        this.addInfoBlocks($infoLine, parts);
    };

    InterfacePlugin.prototype.parseInfoText = function(text) {
        // Удаляем лишние пробелы
        var cleaned = text.replace(/\s+/g, ' ').trim();
        
        // Разбиваем по разным разделителям
        var parts = [];
        
        // Пробуем разные разделители
        var separators = [/•/g, /·/g, /\s-\s/g, /\s\/\s/g];
        
        for (var i = 0; i < separators.length; i++) {
            if (cleaned.match(separators[i])) {
                parts = cleaned.split(separators[i])
                    .map(function(p) { return p.trim(); })
                    .filter(function(p) { return p.length > 0; });
                break;
            }
        }
        
        // Если не нашли разделителей, возвращаем как один блок
        if (parts.length === 0) {
            parts = [cleaned];
        }
        
        return parts;
    };

    InterfacePlugin.prototype.addInfoBlocks = function($container, parts) {
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (!part) continue;
            
            // Определяем класс для блока
            var blockClass = 'info-block-v4';
            if (part.match(/PG|R|NC-17|G|PG-13|TV-MA|TV-14|TV-PG/)) {
                blockClass += ' pg-rating-v4';
            }
            
            // Добавляем блок
            $container.append('<span class="' + blockClass + '">' + part + '</span>');
            
            // Добавляем разделитель (кроме последнего)
            if (i < parts.length - 1) {
                $container.append('<span class="info-separator-v4">︙</span>');
            }
        }
    };

    InterfacePlugin.prototype.hideUnwantedElements = function($interface) {
        $interface.find('.full-start__description, .full-start__rate, .full-start__split').hide();
    };

    InterfacePlugin.prototype.updatePGRating = function() {
        // Функция для обновления PG рейтинга
        // Может быть вызвана из других плагинов
        window.updateInterfacePGRating = function(rating) {
            if (!rating) return;
            
            // Ищем блок PG рейтинга
            var $pgBlock = $('.pg-rating-v4');
            if ($pgBlock.length > 0) {
                $pgBlock.text(rating);
            } else {
                // Добавляем новый блок
                var $infoLine = $('.interface-v4 .full-start__line');
                if ($infoLine.length > 0) {
                    // Добавляем разделитель если есть другие блоки
                    if ($infoLine.find('.info-block-v4').length > 0) {
                        $infoLine.append('<span class="info-separator-v4">︙</span>');
                    }
                    $infoLine.append('<span class="info-block-v4 pg-rating-v4">' + rating + '</span>');
                }
            }
        };
    };

    // Инициализация плагина
    function init() {
        // Ждем загрузки DOM и Lampa
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(createPlugin, 1000);
            });
        } else {
            setTimeout(createPlugin, 1000);
        }
    }

    function createPlugin() {
        var plugin = new InterfacePlugin();
        plugin.init();
        
        // Экспортируем для отладки
        window.interfacePlugin = plugin;
        
        // Добавляем глобальную функцию для принудительной модификации
        window.forceInterfaceModification = function() {
            plugin.checkAndModifyInterface();
            console.log('Interface modification forced');
        };
    }

    // Запускаем плагин
    init();

})();
