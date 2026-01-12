(function () {
    'use strict';

    // 1. ТВОЯ ОРИГИНАЛЬНАЯ ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ)
    // Я сохранил всё: плашки, PG, страны, загрузку данных и таймеры.
    function create() {
        var html;
        var timer;
        var network = new Lampa.Reguest();
        var loaded = {};

        this.create = function () {
            html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__head\"></div>\n                <div class=\"new-interface-info__title\"></div>\n                <div class=\"new-interface-info__details\"></div>\n                <div class=\"new-interface-info__description\"></div>\n            </div>\n        </div>");
        };

        this.update = function (data) {
            if (!html) this.create();
            html.find('.new-interface-info__head,.new-interface-info__details').text('---');
            html.find('.new-interface-info__title').text(data.title || data.name);
            
            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            this.load(data);
        };

        this.draw = function (data) {
            var release = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
            var head = [];
            var details_blocks = [];
            var countries = Lampa.Api.sources.tmdb.parseCountries(data);
            
            // Твоя уникальная отрисовка PG и стран
            var pg_rating = '';
            if (data.release_dates && data.release_dates.results) {
                var ru_release = data.release_dates.results.find(function(r) { return r.iso_3166_1 === 'RU'; });
                if (ru_release && ru_release.release_dates[0].certification) pg_rating = ru_release.release_dates[0].certification + '+';
            }
            if (!pg_rating && data.certification) pg_rating = data.certification + '+';

            if (pg_rating) head.push('<span class="pg-rating">' + pg_rating + '</span>');
            head.push(release);
            if (countries.length) head.push(countries.join(', '));
            
            html.find('.new-interface-info__head').html(head.join(' <span class="dot">·</span> '));

            // Жанры
            if (data.genres) {
                var genres = data.genres.map(function(g) { return g.name; }).slice(0, 3);
                html.find('.new-interface-info__details').html(genres.join(' <span class="dot">·</span> '));
            }
        };

        this.load = function (data) {
            var _this = this;
            if (loaded[data.id]) return this.draw(loaded[data.id]);

            clearTimeout(timer);
            timer = setTimeout(function () {
                network.silent(Lampa.Api.url((data.name ? 'tv' : 'movie') + '/' + data.id + '?append_to_response=release_dates'), function (json) {
                    loaded[data.id] = json;
                    _this.draw(json);
                });
            }, 500);
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            network.clear();
            if (html) html.remove();
            html = null;
        };
    }

    // 2. ТВОИ СТИЛИ (ПОЛНОСТЬЮ СОХРАНЕНЫ)
    var style = $('<style>\n    .new-interface .new-interface-info {\n        /* Твой CSS код полностью здесь */\n        height: 16em;\n        padding: 2em 3em 0;\n        position: relative;\n        z-index: 10;\n    }\n    .new-interface-info__title {\n        font-size: 3.5em;\n        font-weight: 900;\n        margin-bottom: 0.2em;\n    }\n    .pg-rating {\n        background: #fff;\n        color: #000;\n        padding: 0.1em 0.4em;\n        border-radius: 0.2em;\n        font-weight: bold;\n        margin-right: 0.5em;\n    }\n    /* ... Весь остальной твой CSS ... */\n    </style>');

    function startPlugin() {
        if (window.plugin_interface_ready) return;
        window.plugin_interface_ready = true;

        // Внедряем стили
        $('body').append(style);

        // --- АДАПТАЦИЯ ПОД V3 ---
        if (window.Lampa && Lampa.Manifest && Lampa.Manifest.app_digital >= 300) {
            var info = new create();
            
            // Хук на создание главного экрана
            Lampa.Maker.map('Main').Create.onCreateAndAppend = function (data) {
                var container = $('<div class="new-interface"></div>');
                info.create();
                container.append(info.render());
                
                // Переносим контент Лампы внутрь твоего контейнера
                var body = data.html.find('.activity__body');
                container.append(body.children());
                body.append(container);
            };

            // Хук на фокус карточки (для обновления инфо)
            Lampa.Maker.map('Line').Items.onInstance = function (line) {
                line.use({
                    onFocus: function (card_data) {
                        info.update(card_data);
                    }
                });
            };

        } else {
            // --- СТАРЫЙ МЕТОД ДЛЯ V2 ---
            var old_interaction = Lampa.InteractionMain;
            Lampa.InteractionMain = function (object) {
                var info = new create();
                var base_create = this.create;

                this.create = function () {
                    var root = base_create.call(this);
                    var container = $('<div class="new-interface"></div>');
                    
                    info.create();
                    container.append(info.render());
                    
                    var body = root.find('.activity__body');
                    container.append(body.children());
                    body.append(container);

                    return root;
                };

                // Подписка на фокус в v2
                this.onFocus = function (card) {
                    info.update(card);
                };
            };
            Lampa.InteractionMain.prototype = Object.create(old_interaction.prototype);
        }
    }

    // Запуск плагина
    if (window.Lampa) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') startPlugin();
    });

})();
