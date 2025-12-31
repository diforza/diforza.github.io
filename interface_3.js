(function () {
    'use strict';

    if (window.plugin_new_interface_final) return;
    window.plugin_new_interface_final = true;

    console.log('New Interface Plugin (Final) for Lampa 3.1.2');

    // Проверяем наличие Lampa 3.0+
    if (!Lampa || !Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) {
        console.warn('Lampa 3.0+ required');
        return;
    }

    // Глобальный кеш
    var globalInfoCache = {};

    // Добавляем стили сразу
    addStyles();

    // Получаем модули Main
    var mainMaker = Lampa.Maker.map('Main');
    if (!mainMaker || !mainMaker.Items || !mainMaker.Create) {
        console.warn('Cannot access Main modules');
        return;
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

    function wrapMethod(object, methodName, wrapper) {
        if (!object) return;

        var originalMethod = typeof object[methodName] === 'function' ? object[methodName] : null;

        object[methodName] = function () {
            var args = Array.prototype.slice.call(arguments);
            return wrapper.call(this, originalMethod, args);
        };
    }

    function shouldEnableInterface(object) {
        if (!object) return false;
        if (window.innerWidth < 767) return false;
        if (Lampa.Platform && Lampa.Platform.screen && Lampa.Platform.screen('mobile')) return false;
        
        // Ваши условия
        if (object.source === 'tmdb' || object.source === 'cub' || object.source === 'surs') {
            return true;
        }
        
        if (object.source === 'favorite') {
            return false;
        }
        
        return false;
    }

    // ========== КОМПОНЕНТ ИНФОРМАЦИИ ==========

    function InfoPanel() {
        this.html = null;
        this.timer = null;
        this.network = new Lampa.Reguest(); // ВАЖНО: Reguest, а не Request!
        this.loaded = globalInfoCache;
        this.currentUrl = null;
    }

    InfoPanel.prototype.create = function () {
        this.html = $(`<div class="new-interface-info">
            <div class="new-interface-info__body">
                <div class="new-interface-info__head"></div>
                <div class="new-interface-info__title"></div>
                <div class="new-interface-info__details"></div>
                <div class="new-interface-info__description"></div>
            </div>
        </div>`);
    };

    InfoPanel.prototype.render = function (asElement) {
        if (!this.html) this.create();
        return asElement ? this.html[0] : this.html;
    };

    InfoPanel.prototype.update = function (data) {
        if (!data || !this.html) return;

        this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
        this.html.find('.new-interface-info__title').text(data.title);

        // Обновляем фон (как в оригинале)
        Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));

        // Загружаем детали
        this.load(data);
    };

    InfoPanel.prototype.draw = function (data) {
        if (!data || !this.html) return;

        var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
        var head = [];
        var detailsBlocks = [];
        var countries = Lampa.Api.sources.tmdb.parseCountries(data);
        var pgRating = null;

        // Получаем PG рейтинг (ваша логика)
        if (typeof window.getInternationalPG === 'function') {
            pgRating = window.getInternationalPG(data);
        } else {
            pgRating = Lampa.Api.sources.tmdb.parsePG(data);
        }

        // Блок: Год и Страна
        var yearCountry = [];
        if (create !== '0000') yearCountry.push(create);
        if (countries.length > 0) yearCountry.push(countries.join(', '));
        if (yearCountry.length > 0) {
            detailsBlocks.push('<div class="new-interface-info__block"><span>' + yearCountry.join(', ') + '</span></div>');
        }

        // Блок: Жанры
        if (data.genres && data.genres.length > 0) {
            var genres = data.genres.map(function (item) {
                return Lampa.Utils.capitalizeFirstLetter(item.name);
            }).join(' | ');
            detailsBlocks.push('<div class="new-interface-info__block"><span>' + genres + '</span></div>');
        }
        
        // Блок: PG рейтинг
        if (pgRating) {
            detailsBlocks.push('<div class="new-interface-info__block"><span class="new-interface-info__pg">' + pgRating + '</span></div>');
        }

        this.html.find('.new-interface-info__head').empty().append(head.join(', '));
        this.html.find('.new-interface-info__details').html(detailsBlocks.join('<span class="new-interface-info__separator">&#65049;</span>'));
    };

    InfoPanel.prototype.load = function (data) {
        var self = this;

        if (!data || !data.id) return;

        var source = data.source || 'tmdb';
        if (source !== 'tmdb' && source !== 'cub') return;

        var mediaType = data.name ? 'tv' : 'movie';
        var language = Lampa.Storage.get('language');
        var apiUrl = Lampa.TMDB.api(mediaType + '/' + data.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + language);

        this.currentUrl = apiUrl;

        if (this.loaded[apiUrl]) {
            this.draw(this.loaded[apiUrl]);
            return;
        }

        clearTimeout(this.timer);

        this.timer = setTimeout(function () {
            self.network.clear();
            self.network.timeout(5000);
            self.network.silent(apiUrl, function (response) {
                self.loaded[apiUrl] = response;
                if (self.currentUrl === apiUrl) {
                    self.draw(response);
                }
            });
        }, 300);
    };

    InfoPanel.prototype.empty = function () {
        if (this.html) {
            this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
        }
    };

    InfoPanel.prototype.destroy = function () {
        clearTimeout(this.timer);
        this.network.clear();
        this.currentUrl = null;

        if (this.html) {
            this.html.remove();
            this.html = null;
        }
    };

    // ========== СОСТОЯНИЕ ИНТЕРФЕЙСА ==========

    function createInterfaceState(mainInstance) {
        var infoPanel = new InfoPanel();
        infoPanel.create();

        var state = {
            main: mainInstance,
            info: infoPanel,
            attached: false,

            attach: function () {
                if (this.attached) return;

                var container = mainInstance.render(true);
                if (!container) return;

                container.classList.add('new-interface');

                var infoElement = infoPanel.render(true);
                if (infoElement && infoElement.parentNode !== container) {
                    container.insertBefore(infoElement, container.firstChild || null);
                }

                if (mainInstance.scroll && typeof mainInstance.scroll.minus === 'function') {
                    mainInstance.scroll.minus(infoElement);
                }

                this.attached = true;
            },

            update: function (data) {
                if (!data) return;
                infoPanel.update(data);
            },

            reset: function () {
                infoPanel.empty();
            },

            destroy: function () {
                infoPanel.destroy();

                var container = mainInstance.render(true);
                if (container) {
                    container.classList.remove('new-interface');
                }

                this.attached = false;
            }
        };

        return state;
    }

    // ========== ПЕРЕХВАТ МЕТОДОВ ==========

    // 1. Перехватываем onInit в Items
    wrapMethod(mainMaker.Items, 'onInit', function (originalMethod, args) {
        this.__newInterfaceEnabled = shouldEnableInterface(this && this.object);

        if (this.__newInterfaceEnabled) {
            // Отключаем wide режим
            if (this.object) this.object.wide = false;
            this.wide = false;
        }

        if (originalMethod) originalMethod.apply(this, args);
    });

    // 2. Перехватываем onCreate в Create
    wrapMethod(mainMaker.Create, 'onCreate', function (originalMethod, args) {
        if (originalMethod) originalMethod.apply(this, args);
        if (!this.__newInterfaceEnabled) return;

        // Создаем состояние
        if (!this.__interfaceState) {
            this.__interfaceState = createInterfaceState(this);
        }
        
        this.__interfaceState.attach();
    });

    // 3. Перехватываем onAppend в Items
    wrapMethod(mainMaker.Items, 'onAppend', function (originalMethod, args) {
        if (originalMethod) originalMethod.apply(this, args);
        if (!this.__newInterfaceEnabled) return;

        var element = args && args[0];
        var data = args && args[1];

        if (element && data) {
            setupCardHandlers(this, element, data);
        }
    });

    // 4. Перехватываем onDestroy в Items
    wrapMethod(mainMaker.Items, 'onDestroy', function (originalMethod, args) {
        if (this.__interfaceState) {
            this.__interfaceState.destroy();
            delete this.__interfaceState;
        }
        delete this.__newInterfaceEnabled;
        
        if (originalMethod) originalMethod.apply(this, args);
    });

    // ========== ОБРАБОТЧИКИ КАРТОЧЕК ==========

    function setupCardHandlers(itemsInstance, card, cardData) {
        if (!card || card.__newInterfaceHandled) return;
        card.__newInterfaceHandled = true;

        // Добавляем обработчики через use()
        if (typeof card.use === 'function') {
            card.use({
                onFocus: function () {
                    if (itemsInstance.__interfaceState && this.data) {
                        itemsInstance.__interfaceState.update(this.data);
                    }
                },
                onHover: function () {
                    if (itemsInstance.__interfaceState && this.data) {
                        itemsInstance.__interfaceState.update(this.data);
                    }
                },
                onDestroy: function () {
                    delete card.__newInterfaceHandled;
                }
            });
        }

        // Также обновляем при первом фокусе
        if (itemsInstance.__interfaceState && cardData) {
            // Проверяем, активна ли эта карточка
            setTimeout(function() {
                var cardElement = card.render ? card.render(true) : null;
                if (cardElement && cardElement.classList && cardElement.classList.contains('focus')) {
                    itemsInstance.__interfaceState.update(cardData);
                }
            }, 100);
        }
    }

    // ========== СТИЛИ ==========

    function addStyles() {
        var styles = `
        <style id="new-interface-styles">
        .new-interface .card--small.card--wide {
            width: 18.5em;
        }
        
        .new-interface-info {
            position: relative;
            padding: 0em 1.5em 0 1.5em;
        }
        
        .new-interface-info__body {
            width: 95%;
            padding-top: 1.1em;
        }
        
        .new-interface-info__head {
            display: none !important;
        }
        
        .new-interface-info__title {
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
        
        .new-interface-info__details {
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
        }
        
        .new-interface-info__split {
            display: none;
        }

        .new-interface-info__separator {
            margin: 0 0.0em;
            font-size: 1.5em;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .new-interface-info__description {
            display: none !important;
        }
        
        .new-interface .card-more__box {
            padding-bottom: 60%;
        }
        
        .new-interface .full-start__background {
            height: 108%;
            top: -6em;
        }
        
        .new-interface .full-start__rate {
            font-size: 1.3em;
            margin-right: 0;
            display: none;
        }

        .new-interface-info__pg {
            font-size: 1em;
            border: none;
            outline: none;
            background: transparent;
            padding: 0;
            margin: 0;
            display: inline-block;
            line-height: 1;
        }
        
        .new-interface .card__promo {
            display: none;
        }
        
        .new-interface .card.card--wide+.card-more .card-more__box {
            padding-bottom: 60%;
        }
        
        .new-interface .card.card--wide .card-watched {
            display: none !important;
        }
        
        body.light--version .new-interface-info__body {
            width: 69%;
            padding-top: 1.5em;
        }
        
        body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view {
            animation: animation-card-focus 0.2s;
        }
        body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view {
            animation: animation-trigger-enter 0.2s forwards;
        }
        
        @media (max-width: 767px) {
            .new-interface-info__title {
                font-size: 2.5em;
            }
            .new-interface-info__details {
                font-size: 1em;
            }
        }
        </style>
        `;

        Lampa.Template.add('new_interface_style_final', styles);
        $('body').append(Lampa.Template.get('new_interface_style_final', {}, true));
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========

    console.log('New Interface Plugin fully initialized');

})();
