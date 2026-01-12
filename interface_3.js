(function () {
    'use strict';

    // 1. ТВОЯ ЛОГИКА ОРИСОВКИ (БЕ ИЗМЕНЕНИЙ)
    function create() {
        var html;
        var timer;
        var network = new (Lampa.Reguest || Lampa.Request)();
        var loaded = {};

        this.create = function () {
            html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__head\"></div>\n                <div class=\"new-interface-info__title\"></div>\n                <div class=\"new-interface-info__details\"></div>\n                <div class=\"new-interface-info__description\"></div>\n            </div>\n        </div>");
        };

        this.update = function (data) {
            if (!data) return;
            if (!html) this.create();
            html.find('.new-interface-info__head,.new-interface-info__details').text('---');
            html.find('.new-interface-info__title').text(data.title || data.name || '');
            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            this.load(data);
        };

        this.draw = function (data) {
            if (!html) return;
            var release = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
            var head = [];
            var countries = Lampa.Api.sources.tmdb.parseCountries(data);
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
                }, function() { _this.draw(data); });
            }, 500);
        };

        this.render = function () { return html; };
    }

    // 2. СТИЛИ
    var style = $('<style>.new-interface .new-interface-info { height: 16em; padding: 2em 3em 0; position: relative; z-index: 10; }.new-interface-info__title { font-size: 3.5em; font-weight: 900; margin-bottom: 0.2em; }.pg-rating { background: #fff; color: #000; padding: 0.1em 0.4em; border-radius: 0.2em; font-weight: bold; margin-right: 0.5em; }.new-interface .activity__body { margin-top: 0 !important; }.dot { margin: 0 0.4em; opacity: 0.5; }</style>');

    function startPlugin() {
        if (window.plugin_interface_ready) return;
        window.plugin_interface_ready = true;
        $('body').append(style);

        // Универсальная обертка для методов Maker
        function wrap(object, method, new_call) {
            if (!object || !object[method]) return;
            var old = object[method];
            object[method] = function () {
                var args = Array.prototype.slice.call(arguments);
                var res = old.apply(this, args);
                try {
                    new_call.apply(this, [args[0]]); // Передаем первый аргумент (data)
                } catch (e) {
                    console.log('Interface Error in ' + method + ':', e);
                }
                return res;
            };
        }

        // --- ЛОГИКА ДЛЯ v3 (Maker) ---
        if (window.Lampa && Lampa.Manifest && Lampa.Manifest.app_digital >= 300) {
            var info = new create();

            wrap(Lampa.Maker.map('Main').Create, 'onCreateAndAppend', function (data) {
                // Ищем HTML контейнер везде, где он может быть
                var $root = (data && data.html) || this.html;
                
                // Если не нашли в аргументах, ищем через активную активность (последний шанс)
                if (!$root || typeof $root.find !== 'function') {
                    var active = Lampa.Activity.active();
                    if (active && active.activity && active.activity.render) $root = active.activity.render();
                }

                if ($root && typeof $root.find === 'function') {
                    var body = $root.find('.activity__body');
                    if (body.length && !body.parent().hasClass('new-interface')) {
                        var container = $('<div class="new-interface"></div>');
                        info.create();
                        container.append(info.render());
                        container.append(body.children());
                        body.append(container);
                    }
                }
            });

            wrap(Lampa.Maker.map('Line').Items, 'onInstance', function (card) {
                if (card && card.use) {
                    card.use({
                        onFocus: function (card_data) {
                            info.update(card_data);
                        }
                    });
                }
            });

        } else {
            // --- ЛОГИКА ДЛЯ v2 ---
            var old_interaction = Lampa.InteractionMain;
            Lampa.InteractionMain = function (object) {
                var info = new create();
                var base_create = this.create;
                this.create = function () {
                    var root = base_create.call(this);
                    var body = root.find('.activity__body');
                    var container = $('<div class="new-interface"></div>');
                    info.create();
                    container.append(info.render());
                    container.append(body.children());
                    body.append(container);
                    return root;
                };
                this.onFocus = function (card) { info.update(card); };
            };
            if (old_interaction) Lampa.InteractionMain.prototype = Object.create(old_interaction.prototype);
        }
    }

    if (window.Lampa) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
