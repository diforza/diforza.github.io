(function () {
    'use strict';

    if (window.plugin_new_interface_ready) return;
    window.plugin_new_interface_ready = true;

    console.log('New Interface Plugin for Lampa 3.1.2');

    // Проверяем наличие необходимых компонентов Lampa
    if (!Lampa || !Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) {
        console.warn('Lampa 3.0+ required for this plugin');
        return;
    }

    // Добавляем стили
    addStyles();

    // Получаем модули Main
    var mainMaker = Lampa.Maker.map('Main');
    if (!mainMaker || !mainMaker.Items || !mainMaker.Create) {
        console.warn('Could not access Main modules');
        return;
    }

    // Обертка для методов
    function wrapMethod(object, methodName, wrapper) {
        if (!object || typeof object[methodName] !== 'function') return;
        
        var originalMethod = object[methodName];
        
        object[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            return wrapper.call(this, originalMethod, args);
        };
    }

    // Проверка условий для нового интерфейса
    function shouldEnableNewInterface(object) {
        if (!object) return false;
        
        // Не использовать на мобильных
        if (window.innerWidth < 767) return false;
        if (Lampa.Platform && Lampa.Platform.screen && Lampa.Platform.screen('mobile')) return false;
        
        // Только для определенных источников
        if (object.source === 'tmdb' || object.source === 'cub' || object.source === 'surs') {
            return true;
        }
        
        // Не для избранного
        if (object.source === 'favorite') {
            return false;
        }
        
        return false;
    }

    // Компонент информации
    function InfoComponent() {
        this.html = null;
        this.timer = null;
        this.network = new Lampa.Request();
        this.loaded = {};
    }

    InfoComponent.prototype.create = function() {
        this.html = $(`<div class="new-interface-info">
            <div class="new-interface-info__body">
                <div class="new-interface-info__head"></div>
                <div class="new-interface-info__title"></div>
                <div class="new-interface-info__details"></div>
                <div class="new-interface-info__description"></div>
            </div>
        </div>`);
    };

    InfoComponent.prototype.update = function(data) {
        if (!this.html) this.create();
        
        this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
        this.html.find('.new-interface-info__title').text(data.title);
        
        // Обновляем фон
        Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
        
        // Загружаем детальную информацию
        this.load(data);
    };

    InfoComponent.prototype.draw = function(data) {
        if (!this.html) return;
        
        var createYear = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
        var head = [];
        var detailsBlocks = [];
        var countries = Lampa.Api.sources.tmdb.parseCountries(data);
        var pgRating = null;

        // Получаем PG рейтинг
        if (typeof window.getInternationalPG === 'function') {
            pgRating = window.getInternationalPG(data);
        } else {
            pgRating = Lampa.Api.sources.tmdb.parsePG(data);
        }

        // Блок: Год и Страна
        var yearCountry = [];
        if (createYear !== '0000') yearCountry.push(createYear);
        if (countries.length > 0) yearCountry.push(countries.join(', '));
        if (yearCountry.length > 0) {
            detailsBlocks.push('<div class="new-interface-info__block"><span>' + yearCountry.join(', ') + '</span></div>');
        }

        // Блок: Жанры
        if (data.genres && data.genres.length > 0) {
            var genres = data.genres.map(function(item) {
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

    InfoComponent.prototype.load = function(data) {
        var self = this;
        
        clearTimeout(this.timer);
        var url = Lampa.TMDB.api((data.name ? 'tv' : 'movie') + '/' + data.id + 
                   '?api_key=' + Lampa.TMDB.key() + 
                   '&append_to_response=content_ratings,release_dates&language=' + 
                   Lampa.Storage.get('language'));
        
        if (this.loaded[url]) {
            this.draw(this.loaded[url]);
            return;
        }
        
        this.timer = setTimeout(function() {
            self.network.clear();
            self.network.timeout(5000);
            self.network.silent(url, function(movie) {
                self.loaded[url] = movie;
                self.draw(movie);
            });
        }, 300);
    };

    InfoComponent.prototype.render = function(asElement) {
        if (!this.html) this.create();
        return asElement ? this.html[0] : this.html;
    };

    InfoComponent.prototype.empty = function() {
        if (this.html) {
            this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
        }
    };

    InfoComponent.prototype.destroy = function() {
        if (this.html) {
            this.html.remove();
            this.html = null;
        }
        this.loaded = {};
    };

    // Перехватываем создание Main
    wrapMethod(mainMaker.Create, 'onCreate', function(originalMethod, args) {
        // Вызываем оригинальный метод
        if (originalMethod) originalMethod.apply(this, args);
        
        // Проверяем, нужно ли включать новый интерфейс
        var object = this.object;
        var useNewInterface = shouldEnableNewInterface(object);
        
        if (useNewInterface) {
            console.log('Enabling new interface for:', object.source);
            
            // Создаем компонент информации
            this.infoComponent = new InfoComponent();
            this.infoComponent.create();
            
            // Добавляем в DOM
            var container = this.render(true);
            if (container) {
                container.classList.add('new-interface');
                container.insertBefore(this.infoComponent.render(true), container.firstChild);
            }
            
            // Настраиваем обработчики для карточек
            if (this.items && Array.isArray(this.items)) {
                this.items.forEach(function(item) {
                    setupCardHandlers(item, this);
                }.bind(this));
            }
        }
        
        this.__useNewInterface = useNewInterface;
    });

    // Перехватываем добавление элементов
    wrapMethod(mainMaker.Items, 'onAppend', function(originalMethod, args) {
        // Вызываем оригинальный метод
        if (originalMethod) originalMethod.apply(this, args);
        
        // Если новый интерфейс включен
        if (this.__useNewInterface && args && args.length >= 2) {
            var element = args[0];
            var data = args[1];
            
            if (element && data) {
                setupCardHandlers(element, this);
            }
        }
    });

    // Настройка обработчиков для карточки
    function setupCardHandlers(card, mainInstance) {
        if (!card || card.__newInterfaceHandled) return;
        
        card.__newInterfaceHandled = true;
        
        // Используем модульную систему для добавления обработчиков
        if (typeof card.use === 'function') {
            card.use({
                onFocus: function() {
                    if (mainInstance.infoComponent && this.data) {
                        mainInstance.infoComponent.update(this.data);
                    }
                },
                onHover: function() {
                    if (mainInstance.infoComponent && this.data) {
                        mainInstance.infoComponent.update(this.data);
                    }
                }
            });
        }
    }

    // Добавление стилей
    function addStyles() {
        var styles = `
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
        `;
        
        Lampa.Template.add('new_interface_styles', styles);
        $('body').append(Lampa.Template.get('new_interface_styles', {}, true));
    }

    console.log('New Interface Plugin initialized');

})();
