(function () {
    'use strict';

    // Проверяем версию Lampa
    if (Lampa.Manifest.app_digital < 300) {
        console.warn('New Interface Plugin requires Lampa 3.0 or higher');
        return;
    }

    if (window.plugin_interface_ready) return;
    
    // Компонент информации (без изменений)
    function CreateInfo(object) {
        var html;
        var timer;
        var network = new Lampa.Request();
        var loaded = {};

        this.create = function () {
            html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__head\"></div>\n                <div class=\"new-interface-info__title\"></div>\n                <div class=\"new-interface-info__details\"></div>\n                <div class=\"new-interface-info__description\"></div>\n            </div>\n        </div>");
        };

        this.update = function (data) {
            html.find('.new-interface-info__head,.new-interface-info__details').text('---');
            html.find('.new-interface-info__title').text(data.title);
            
            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            this.load(data);
        };

        this.draw = function (data) {
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
            html.remove();
            loaded = {};
            html = null;
        };
    }

    // Создаем кастомный класс Main
    function NewInterfaceMain(object) {
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
        var next_wait = false;
        var next_func = null;
        
        // Ссылка на activity
        this.activity = null;

        this.create = function () {
            info = new CreateInfo(object);
            info.create();
            
            // Создаем scroll через Maker
            scroll = Lampa.Maker.make('Scroll', {
                mask: true,
                over: true,
                scroll_by_item: true
            }, function(module) {
                return module.toggle(module.MASK.base);
            });
            
            // Получаем элемент scroll и добавляем его в html
            var scrollElement = scroll.render();
            html.append(info.render());
            html.append(scrollElement);
        };

        this.empty = function () {
            var button;

            if (object.source == 'tmdb') {
                button = $('<div class="empty__footer"><div class="simple-button selector">' + Lampa.Lang.translate('change_source_on_cub') + '</div></div>');
                button.find('.selector').on('hover:enter', function () {
                    Lampa.Storage.set('source', 'cub');
                    Lampa.Activity.replace({
                        source: 'cub'
                    });
                });
            }

            var empty = new Lampa.Empty();
            html.append(empty.render(button));
            this.start = empty.start.bind(empty);
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.build = function (data) {
            var _this = this;
            
            lezydata = data;
            
            // Добавляем первые 2 элемента
            var viewCount = Math.min(2, data.length);
            for (var i = 0; i < viewCount; i++) {
                this.append(data[i], i === 0);
            }

            // Настраиваем события scroll
            scroll.use({
                onEnd: function() {
                    _this.loadNext();
                },
                onWheel: function(step) {
                    if (step > 0) _this.down();
                    else if (active > 0) _this.up();
                }
            });

            this.activity.loader(false);
            this.activity.toggle();
            
            // Если есть элементы, фокусируемся на первом
            if (items.length > 0) {
                setTimeout(function() {
                    items[0].toggle();
                }, 100);
            }
        };

        this.loadNext = function () {
            var _this = this;

            if (next_func && !next_wait && items.length) {
                next_wait = true;
                next_func(function (new_data) {
                    next_wait = false;
                    new_data.forEach(function(item) {
                        _this.append(item);
                    });
                }, function () {
                    next_wait = false;
                });
            }
        };

        this.next = function(func) {
            next_func = func;
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
            }, function(module) {
                return module.toggle(module.MASK.base);
            });

            // Добавляем обработчики событий
            card.use({
                onFocus: function() {
                    info.update(element);
                    _this.background(element);
                    
                    // Обновляем активный индекс
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

            // Добавляем карточку в scroll
            scroll.append(card.render());
            items.push(card);

            // Фокусируемся если нужно
            if (focus) {
                setTimeout(function() {
                    card.toggle();
                }, 50);
            }
        };

        this.back = function () {
            Lampa.Activity.backward();
        };

        this.down = function () {
            if (active < items.length - 1) {
                active++;
                items[active].toggle();
                scroll.update(items[active].render());
            }
        };

        this.up = function () {
            if (active > 0) {
                active--;
                items[active].toggle();
                scroll.update(items[active].render());
            } else {
                Lampa.Controller.toggle('head');
            }
        };

        this.start = function () {
            var _this = this;

            Lampa.Controller.add('content', {
                link: this,
                toggle: function toggle() {
                    if (_this.activity.canRefresh()) return false;

                    if (items.length) {
                        items[active].toggle();
                    }
                },
                update: function update() {},
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

        this.refresh = function () {
            this.activity.loader(true);
            this.activity.need_refresh = true;
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
            lezydata = null;
        };
    }

    function startPlugin() {
        window.plugin_interface_ready = true;
        
        // Сохраняем оригинальный Main класс
        var OriginalMain = Lampa.Maker.get('Main');
        
        // Создаем обертку для определения, какой интерфейс использовать
        function InterfaceSelector(object) {
            // Проверяем условия для использования нового интерфейса
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
            
            // Используем новый интерфейс
            if (useNewInterface) {
                return new NewInterfaceMain(object);
            }
            // Или стандартный
            else {
                return new OriginalMain(object);
            }
        }
        
        // Переопределяем создание Main
        Lampa.Maker.map('Main').NewInterface = {
            onConstructor: function(object) {
                return InterfaceSelector(object);
            }
        };
        
        // Добавляем стили
        Lampa.Template.add('new_interface_style', `
            <style>
            /* Общие стили для карточек постеров */
            .new-interface .card--small.card--wide {
                width: 18.5em; /* Ширина широких постеров */
            }
            
            /* === НАСТРАИВАЕМЫЕ ПАРАМЕТРЫ ИНФО-БЛОКА === */

            /* Основной контейнер информационного блока (включает название и инфо-строку) */
            .new-interface-info {
                position: relative;
                /* Отступ сверху и с боков от границ экрана. 
                   Регулирует общее вертикальное положение всего инфо-блока. */
                padding: 0em 1.5em 0 1.5em; 
            }
            
            /* Внутренний контейнер для названия и деталей (год, жанры, PG) */
            .new-interface-info__body {
                /* Ширина контента. Увеличена для лучшего размещения плашек. 
                   Можно уменьшить, если блоки слишком растягиваются. */
                width: 95%; 
                padding-top: 1.1em; /* Внутренний отступ сверху. Обычно не трогаем, чтобы не сдвигать название. */
            }
            
            /* Полностью скрываем старый заголовок (пунктир) */
            .new-interface-info__head {
                display: none !important; 
            }
            
            /* Название фильма */
            .new-interface-info__title {
                font-size: 4em; /* Размер шрифта названия */
                font-weight: 600; /* Жирность названия */
                /* Отступ ПОД названием. 
                   Увеличьте, чтобы опустить инфо-строку ниже. Уменьшите, чтобы поднять. 
                   Это ключевой параметр для "воздуха" между названием и инфо-строкой. */
                margin-bottom: 0.5em; 
                overflow: hidden;
                -o-text-overflow: ".";
                text-overflow: ".";
                display: -webkit-box;
                -webkit-line-clamp: 1; /* Обрезать название до одной строки */
                line-clamp: 1;
                -webkit-box-orient: vertical;
                margin-left: -0.03em;
                line-height: 1; /* Высота строки названия */
            }
            
            /* Контейнер для инфо-плашек (Год/Страна, Жанры, PG) */
            .new-interface-info__details {
                /* Отступ ПОД инфо-строкой. 
                   Увеличьте, чтобы опустить постеры. Уменьшите, чтобы поднять постеры. 
                   Это ключевой параметр для "воздуха" между инфо-строкой и постерами. */
                margin-bottom: 0.1em; 
                display: flex; 
                flex-wrap: wrap; /* Разрешает перенос плашек на следующую строку, если не хватает места */
                align-items: center; /* Выравнивает плашки по центру по вертикали */
                min-height: 1.9em; /* Минимальная высота контейнера плашек */
                /* Размер шрифта текста ВНУТРИ плашек. 
                   Увеличьте для более крупных плашек, уменьшите для более мелких. */
                font-size: 1.2em; 
                /* Отступ МЕЖДУ плашками и разделителями. 
                   Уменьшите для более плотного расположения, увеличьте для большего расстояния. */
                gap: 0.0em; 
            }

            /* Стиль для каждой отдельной инфо-плашки (Год, Страна, Жанры, PG) */
            .new-interface-info__block {
                /* Рамка вокруг плашки. 
                   Цвет: rgba(255, 255, 255, 0.3) - белый с прозрачностью. 
                   Толщина: 1px. Стиль: solid. */
                border: 1px solid rgba(255, 255, 255, 1); 
                /* Внутренние отступы ВНУТРИ плашки (сверху/снизу и слева/справа). 
                   Регулируют высоту и ширину плашки, а также "воздух" для текста. 
                   Увеличьте для более высоких/широких плашек. */
                padding: 0.3em 0.5em; 
                border-radius: 0.0em; /* Скругление углов рамки */
                display: flex;
                align-items: center;
                white-space: nowrap; /* Запрещает перенос текста внутри плашки (остается на одной строке) */
                box-sizing: border-box; /* Важно для корректного расчета размеров с учетом padding и border */
            }
            
            /* Скрываем старый разделитель */
            .new-interface-info__split {
                display: none; 
            }

            /* Новый вертикальный разделитель (︙) */
            .new-interface-info__separator {
                /* Отступы вокруг разделителя (сверху/снизу и слева/справа). 
                   Регулируют расстояние между разделителем и плашками. */
                margin: 0 0.0em; 
                /*Размер шрифта разделителя. 
                   Настройте, чтобы он соответствовал высоте плашек.*/
                font-size: 1.5em; 
                font-weight: 900; /* Очень жирный, как вы просили */
                color: rgba(255, 255, 255, 0.8); /* Цвет разделителя */
                line-height: 1; /* Важно для выравнивания по вертикали */
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Блок с описанием фильма (скрыт по вашему запросу) */
            .new-interface-info__description {
                display: none !important; 
            }
            
            /* Стиль для блока "Подробнее" */
            .new-interface .card-more__box {
                padding-bottom: 60%;
            }
            
            /* Стиль для фонового изображения */
            .new-interface .full-start__background {
                height: 108%;
                top: -6em;
            }
            
            /* Старый рейтинг TMDB (скрыт по вашему запросу) */
            .new-interface .full-start__rate {
                font-size: 1.3em;
                margin-right: 0;
                display: none; 
            }

            /* Стиль для PG-рейтинга внутри его плашки */
            .new-interface-info__pg {
                font-size: 1em;  /* Размер шрифта для самого текста PG (относительно родительской плашки) */
                border: none; /* Убеждаемся, что нет лишних рамок */
                outline: none; 
                background: transparent; 
                padding: 0; 
                margin: 0; 
                display: inline-block; /* Для лучшего контроля над расположением */
                line-height: 1; /* Важно для выравнивания текста PG внутри плашки */
            }
            
            /* Скрываем промо-карточки */
            .new-interface .card__promo {
                display: none;
            }
            
            /* Стиль для контейнера "Подробнее" рядом с широкой карточкой */
            .new-interface .card.card--wide+.card-more .card-more__box {
                padding-bottom: 60%;
            }
            
            /* Скрываем индикатор "Просмотрено" на широких карточках */
            .new-interface .card.card--wide .card-watched {
                display: none !important;
            }
            
            /* Стиль для светлой версии темы (body.light--version) */
            body.light--version .new-interface-info__body {
                width: 69%;
                padding-top: 1.5em;
            }
            
            body.light--version .new-interface-info {
               /* Высота убрана */
            }

            /* Анимации для карточек */
            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view{
                animation: animation-card-focus 0.2s
            }
            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view{
                animation: animation-trigger-enter 0.2s forwards
            }
            
            /* Адаптация для мобильных */
            @media (max-width: 767px) {
                .new-interface-info__title {
                    font-size: 2.5em;
                }
                .new-interface-info__details {
                    font-size: 1em;
                    flex-direction: column;
                    align-items: flex-start;
                }
                .new-interface-info__separator {
                    display: none;
                }
            }
            </style>
        `);
        
        $('body').append(Lampa.Template.get('new_interface_style', {}, true));
        
        // Включаем наш модуль
        Lampa.Maker.map('Main').modules.NewInterface = Lampa.Maker.map('Main').NewInterface;
        
        console.log('New Interface Plugin loaded for Lampa 3.0+');
    }

    // Ждем загрузки Lampa
    if (window.Lampa && Lampa.Manifest) {
        startPlugin();
    } else {
        document.addEventListener('lampa-loaded', startPlugin);
    }

})();
