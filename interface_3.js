(function () {
    'use strict';

    /**********************************************************
     * ПРОВЕРКА ВЕРСИИ
     **********************************************************/
    if (!window.Lampa || Lampa.Manifest.app_digital < 300) return;

    if (window.plugin_new_interface_v3_ready) return;
    window.plugin_new_interface_v3_ready = true;

    /**********************************************************
     * INFO BLOCK
     **********************************************************/
    function InfoBlock() {
        let html, timer;
        let loaded = {};
        let network = new Lampa.Request();

        this.create = function () {
            html = $(`
                <div class="new-interface-info">
                    <div class="new-interface-info__body">
                        <div class="new-interface-info__title"></div>
                        <div class="new-interface-info__details"></div>
                    </div>
                </div>
            `);
        };

        this.update = function (data) {
            if (!data) return;

            html.find('.new-interface-info__title')
                .text(data.title || data.name || '');

            if (data.backdrop_path) {
                Lampa.Background.change(
                    Lampa.Api.img(data.backdrop_path, 'w500')
                );
            }

            this.load(data);
        };

        this.load = function (data) {
            clearTimeout(timer);

            let url = Lampa.TMDB.api(
                (data.name ? 'tv' : 'movie') + '/' + data.id +
                '?append_to_response=content_ratings,release_dates&language=' +
                Lampa.Storage.get('language')
            );

            if (loaded[url]) return this.draw(loaded[url]);

            timer = setTimeout(() => {
                network.silent(url, (movie) => {
                    loaded[url] = movie;
                    this.draw(movie);
                });
            }, 300);
        };

        this.draw = function (data) {
            let year = (data.release_date || data.first_air_date || '').slice(0, 4);
            let countries = Lampa.Api.sources.tmdb.parseCountries(data);
            let genres = (data.genres || []).map(g =>
                Lampa.Utils.capitalizeFirstLetter(g.name)
            );

            let pg = null;
            if (typeof window.getInternationalPG === 'function') {
                pg = window.getInternationalPG(data);
            } else {
                pg = Lampa.Api.sources.tmdb.parsePG(data);
            }

            let blocks = [];

            if (year || countries.length) {
                blocks.push(
                    `<div class="new-interface-info__block">${
                        [year, countries.join(', ')].filter(Boolean).join(', ')
                    }</div>`
                );
            }

            if (genres.length) {
                blocks.push(
                    `<div class="new-interface-info__block">${genres.join(' | ')}</div>`
                );
            }

            if (pg) {
                blocks.push(
                    `<div class="new-interface-info__block new-interface-info__pg">${pg}</div>`
                );
            }

            html.find('.new-interface-info__details').html(
                blocks.join('<span class="new-interface-info__separator">︙</span>')
            );
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            network.clear();
            html && html.remove();
            html = null;
            loaded = {};
        };
    }

    /**********************************************************
     * MAIN COMPONENT (Main → Line → Card)
     **********************************************************/
    function NewInterfaceComponent(object) {

        let info = new InfoBlock();
        info.create();

        let component = Lampa.Maker.make('Main', object);

        component.use({

            onCreate() {
                this.activity.loader(true);
            },

            onBuild(data) {
                this.build(data);
                this.activity.loader(false);
            },

            onInstance(line) {

                line.use({
                    onFocus(card) {
                        info.update(card.data);
                    },
                    onHover(card) {
                        info.update(card.data);
                    }
                });

                line.use({
                    onInstance(card, card_data) {
                        card.use({
                            onEnter() {
                                Lampa.Router.call('full', card_data);
                            }
                        });
                    }
                });
            }
        });

        let originalRender = component.render.bind(component);

        component.render = function () {
            let html = $('<div class="new-interface"></div>');
            html.append('<img class="full-start__background">');
            html.append(info.render());
            html.append(originalRender());
            return html;
        };

        return component;
    }

    /**********************************************************
     * CONTENT ROW (РЕАЛЬНАЯ ТОЧКА ПОДКЛЮЧЕНИЯ)
     **********************************************************/
    Lampa.ContentRows.add({
        index: 0,
        screen: ['main', 'category'],
        call: (params, screen) => {

            return function (call) {

                call({
                    title: Lampa.Lang.translate('full_title'),
                    results: [],
                    params: {
                        createInstance: (data) => NewInterfaceComponent(data),

                        module: Lampa.Maker.module('Main').only(
                            'Create',
                            'Build',
                            'Callback'
                        )
                    }
                });
            };
        }
    });

    /**********************************************************
     * STYLES (ПОЛНЫЕ, ВНУТРИ ПЛАГИНА)
     **********************************************************/
    Lampa.Template.add('new_interface_style_v3_full', `
        <style>
        .new-interface-info {
            padding: 0 1.5em;
        }

        .new-interface-info__body {
            width: 95%;
            padding-top: 1.1em;
        }

        .new-interface-info__title {
            font-size: 4em;
            font-weight: 600;
            margin-bottom: 0.5em;
            line-height: 1;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
        }

        .new-interface-info__details {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0;
            font-size: 1.2em;
        }

        .new-interface-info__block {
            border: 1px solid rgba(255,255,255,1);
            padding: 0.3em 0.5em;
            white-space: nowrap;
        }

        .new-interface-info__separator {
            font-size: 1.5em;
            font-weight: 900;
            margin: 0 0.2em;
            opacity: 0.8;
        }

        .new-interface .full-start__background {
            height: 108%;
            top: -6em;
        }

        .new-interface .card.card--wide .card-watched {
            display: none !important;
        }

        .new-interface .card__promo {
            display: none;
        }
        </style>
    `);

    $('body').append(
        Lampa.Template.get('new_interface_style_v3_full', {}, true)
    );

})();

