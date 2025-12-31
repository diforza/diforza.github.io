(function () {
    'use strict';

    if (window.plugin_interface_ready) return;
    window.plugin_interface_ready = true;

    console.log('New Interface Plugin for Lampa 3.1.2');

    // Компонент информации (адаптированный для Lampa 3.0+)
    function CreateInfo(object) {
        var html;
        var timer;
        var network = new Lampa.Request();
        var loaded = {};

        this.create = function () {
            html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__head\"></div>\n                <div class=\"new-interface-info__title\"></div>\n                <div class=\"new-interface-info__details\"></div>\n                <div class=\"new-interface-info__description\"></div>\n            </div>\n        </div>");
        };

        this.update = function (data) {
            if (!html) return;
            
            html.find('.new-interface-info__head,.new-interface-info__details').text('---');
            html.find('.new-interface-info__title').text(data.title);
            
            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            this.load(data);
        };

        this.draw = function (data) {
            if (!html) return;
            
            var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
            var head = [];
            var details_blocks = [];
            var countries = Lampa.Api.sources.tmdb.parseCountries(data);
            var pg_rating = null;

            // Получаем PG-рейтинг
            if (typeof window.getInternationalPG === 'function') {
                pg_rating = window.getInternationalPG(data);
            } else {
                pg_rating = Lampa.Api.sources.tmdb.parsePG(data);
            }

            // Блок: Год и Страна
            var year_country_content = [];
            if (create !== '0000') year_country_content.push(create);
            if (countries.length > 0) year_country_content.push(countries.join(', '));
            if (year_country_content.length > 0) {
                details_blocks.push('<div class="new-interface-info__block"><span>' + year_country_content.join(', ') + '</span></div>');
            }

            // Блок: Жанры
            if (data.genres && data.genres.length > 0) {
                var genres_content = data.genres.map(function (item) {
                    return Lampa.Utils.capitalizeFirstLetter(item.name);
                }).join(' | ');
                details_blocks.push('<div class="new-interface-info__block"><span>' + genres_content + '</span></div>');
            }
            
            // Блок: Рейтинг PG
            if (pg_rating) {
                details_blocks.push('<div class="new-interface-info__block"><span class="new-interface-info__pg">' + pg_rating + '</span></div>');
            }

            html.find('.new-interface-info__head').empty().append(head.join(', ')); 
            html.find('.new-interface-info__details').html(details_blocks.join('<span class="new-interface-info__separator">&#65049;</span>')); 
        };

        this.load = function (data) {
            var _this = this;

            clearTimeout(timer);
            var url = Lampa.TMDB.api((data.name ? 'tv' : 'movie') + '/' + data.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));
            if (loaded[url]) return this.draw(loaded[url]);
            timer = setTimeout(function () {
                network.clear();
                network.timeout(5000);
                network.silent(url, function (movie) {
                    loaded[url] = movie;
                    _this.draw(movie);
                });
            }, 300);
        };

        this.render = function () {
            return html;
        };

        this.empty = function () {};

        this.destroy = function () {
            if (html) {
                html.remove();
                html = null;
            }
            loaded = {};
        };
    }

    // Новый интерфейс, совместимый с Lampa 3.0+
    function NewInterface(object) {
        var network = new Lampa.Request();
        var scroll;
        var items = [];
        var html = $('<div class="new-interface"><img class="full-start__background"></div>');
        var active = 0;
        var info;
        var lezydata;
        var background_img = html.find('.full-start__background');
        var background_last = '';
        var background_timer;
        
        // Для совместимости
        this.activity = null;
        this.next = null;
        this.object = object;

        this.create = function () {
            console.log('NewInterface create');
            info = new CreateInfo(object);
            info.create();
            
            // Создаем скролл
            scroll = Lampa.Maker.make('Scroll', {
                mask: true,
                over: true,
                scroll_by_item: true
            });
            
            html.append(info.render());
            html.append(scroll.render());
        };

        this.build = function (data) {
            console.log('NewInterface build with', data.length, 'items');
            var _this = this;
            
            lezydata = data;
            
            // Добавляем первые 2 элемента
            var count = Math.min(2, data.length);
            for (var i = 0; i < count; i++) {
                this.append(data[i], i === 0);
            }

            // Настраиваем скролл
            scroll.use({
                onEnd: function() {
                    console.log('Scroll end');
                    _this.loadNext();
                }
            });

            if (this.activity) {
                this.activity.loader(false);
                this.activity.toggle();
            }
            
            // Фокус на первый элемент
            if (items.length > 0) {
                setTimeout(function() {
                    items[0].toggle();
                }, 100);
            }
        };

        this.append = function (element, focus) {
            var _this = this;

            if (element.ready) return;
            element.ready = true;
            
            // Создаем карточку через Maker
            var card = Lampa.Maker.make('Card', {
                title: element.title || element.name,
                poster: element.poster_path,
                backdrop: element.backdrop_path,
                year: element.release_date || element.first_air_date,
                rating: element.vote_average,
                data: element,
                params: {
                    style: {
                        name: 'wide'
                    }
                }
            });

            // Добавляем обработчики
            card.use({
                onFocus: function() {
                    if (info) info.update(element);
                    _this.background(element);
                    
                    var index = items.indexOf(card);
                    if (index !== -1) {
                        active = index;
                    }
                },
                onEnter: function() {
                    Lampa.Activity.push({
                        url: element.url,
                        component: 'full',
                        source: object.source,
                        card: element,
                        object: object
                    });
                }
            });

            scroll.append(card.render());
            items.push(card);

            if (focus) {
                setTimeout(function() {
                    card.toggle();
                }, 50);
            }
        };

        this.background = function (elem) {
            var new_background = Lampa.Api.img(elem.backdrop_path, 'w1280');
            clearTimeout(background_timer);
            if (new_background == background_last) return;
            background_timer = setTimeout(function () {
                background_img.removeClass('loaded');

                background_img[0].onload = function () {
                    background_img.addClass('loaded');
                };

                background_img[0].onerror = function () {
                    background_img.removeClass('loaded');
                };

                background_last = new_background;
                setTimeout(function () {
                    background_img[0].src = background_last;
                }, 300);
            }, 1000);
        };

        this.start = function () {
            var _this = this;

            Lampa.Controller.add('content', {
                link: this,
                toggle: function toggle() {
                    if (_this.activity && _this.activity.canRefresh()) return false;

                    if (items.length) {
                        items[active].toggle();
                    }
                },
                left: function left() {
                    _this.up();
                },
                right: function right() {
                    _this.down();
                },
                up: function up() {
                    Lampa.Controller.toggle('head');
                },
                down: function down() {
                    if (items.length) {
                        items[active].toggle();
                    }
                },
                back: function() {
                    Lampa.Activity.backward();
                }
            });
            
            Lampa.Controller.toggle('content');
        };

        this.down = function () {
            if (active < items.length - 1) {
                active++;
                if (items[active]) {
                    items[active].toggle();
                }
            }
        };

        this.up = function () {
            if (active > 0) {
                active--;
                if (items[active]) {
                    items[active].toggle();
                }
            } else {
                Lampa.Controller.toggle('head');
            }
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            network.clear();
            if (scroll) scroll.destroy();
            if (info) info.destroy();
            html.remove();
            items = [];
        };
    }

    // Функция проверки условий для нового интерфейса
    function shouldUseNewInterface(object) {
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
        
        if (Lampa.Manifest.app_digital < 153) {
            useNewInterface = false;
        }
        
        return useNewInterface;
    }

    // Перехватчик для Lampa.InteractionMain (старый способ)
    function patchInteractionMain() {
        var OriginalInteractionMain = Lampa.InteractionMain;
        
        Lampa.InteractionMain = function(object) {
            console.log('InteractionMain called with source:', object.source);
            
            if (shouldUseNewInterface(object)) {
                console.log('Creating NewInterface via InteractionMain');
                return new NewInterface(object);
            } else {
                console.log('Using Original InteractionMain');
                return new OriginalInteractionMain(object);
            }
        };
        
        console.log('InteractionMain patched');
    }

    // Перехватчик для Lampa.Maker.make (новый способ)
    function patchMakerMake() {
        var originalMake = Lampa.Maker.make;
        
        Lampa.Maker.make = function(type, data, modules) {
            console.log('Maker.make called for type:', type, 'source:', data ? data.source : 'none');
            
            if (type === 'Main' && data && shouldUseNewInterface(data)) {
                console.log('Creating NewInterface via Maker.make');
                var instance = new NewInterface(data);
                
                // Для совместимости с системой модулей
                if (modules && typeof modules === 'function') {
                    // Пропускаем модули, но сохраняем возможность их применения
                    instance.modulesApplied = true;
                }
                
                return instance;
            }
            
            return originalMake.call(this, type, data, modules);
        };
        
        console.log('Maker.make patched');
    }

    // Добавление стилей
    function addStyles() {
        Lampa.Template.add('new_interface_style', `
            <style>
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
            
            @media (max-width: 767px) {
                .new-interface-info__title {
                    font-size: 2.5em;
                }
                .new-interface-info__details {
                    font-size: 1em;
                }
            }
            </style>
        `);
        
        $('body').append(Lampa.Template.get('new_interface_style', {}, true));
    }

    // Основная функция инициализации плагина
    function initPlugin() {
        console.log('Initializing New Interface Plugin...');
        
        // Добавляем стили
        addStyles();
        
        // Патчим оба способа создания компонентов
        patchInteractionMain();
        patchMakerMake();
        
        // Также пробуем патчить через Maker.map для полной совместимости
        try {
            Lampa.Maker.map('Main').CustomInterface = {
                onConstructor: function(object) {
                    console.log('Maker.map onConstructor called for:', object.source);
                    
                    if (shouldUseNewInterface(object)) {
                        console.log('Creating NewInterface via Maker.map');
                        return new NewInterface(object);
                    }
                    
                    // Возвращаем undefined, чтобы использовать стандартное создание
                    return undefined;
                }
            };
            
            // Добавляем модуль
            if (!Lampa.Maker.map('Main').modules) {
                Lampa.Maker.map('Main').modules = {};
            }
            Lampa.Maker.map('Main').modules.CustomInterface = Lampa.Maker.map('Main').CustomInterface;
            
            console.log('Maker.map patched');
        } catch (e) {
            console.warn('Could not patch Maker.map:', e);
        }
        
        console.log('New Interface Plugin initialized successfully');
    }

    // Запуск плагина
    if (window.Lampa && Lampa.Manifest && Lampa.Maker) {
        initPlugin();
    } else {
        // Ждем загрузки Lampa
        var checkInterval = setInterval(function() {
            if (window.Lampa && Lampa.Manifest && Lampa.Maker) {
                clearInterval(checkInterval);
                initPlugin();
            }
        }, 100);
    }

})();
