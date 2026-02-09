(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;
    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;

    class InterfaceInfo {
        constructor() {
            this.html = null;
            this.timer = null;
            this.network = new Lampa.Reguest();
            this.loaded = {};
        }

        create() {
            if (this.html) return;

            this.html = $(
                `<div class="new-interface-info">
                    <div class="new-interface-info__body">
                        <div class="new-interface-info__head"></div>
                        <div class="new-interface-info__title"></div>
                        <div class="new-interface-info__details"></div>
                        <div class="new-interface-info__description"></div>
                    </div>
                </div>`
            );
        }

        render(js) {
            if (!this.html) this.create();
            return js ? this.html[0] : this.html;
        }

        update(data) {
            if (!data) return;
            if (!this.html) this.create();

            this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
            this.html.find('.new-interface-info__title').text(data.title || data.name || '');

            if (data.backdrop_path) {
                Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            }

            this.load(data);
        }

        draw(movie) {
            if (!this.html || !movie) return;

            const html = this.html;
            const createYear = ((movie.release_date || movie.first_air_date || '0000') + '').slice(0, 4);
            const countries = Lampa.Api.sources.tmdb.parseCountries(movie);

            let pg_rating = null;
            if (typeof window.getInternationalPG === 'function') {
                pg_rating = window.getInternationalPG(movie);
            } else {
                pg_rating = Lampa.Api.sources.tmdb.parsePG(movie);
            }

            const details_blocks = [];

            const year_country_content = [];
            if (createYear !== '0000') year_country_content.push(createYear);
            if (countries.length > 0) year_country_content.push(countries.join(', '));
            if (year_country_content.length > 0) {
                details_blocks.push(
                    '<div class="new-interface-info__block"><span>' +
                    year_country_content.join(', ') +
                    '</span></div>'
                );
            }

            if (movie.genres && movie.genres.length > 0) {
                const genres_content = movie.genres
                    .map(function (item) {
                        return Lampa.Utils.capitalizeFirstLetter(item.name);
                    })
                    .join(' | ');
                details_blocks.push(
                    '<div class="new-interface-info__block"><span>' +
                    genres_content +
                    '</span></div>'
                );
            }

            if (pg_rating) {
                details_blocks.push(
                    '<div class="new-interface-info__block"><span class="new-interface-info__pg">' +
                    pg_rating +
                    '</span></div>'
                );
            }

            html.find('.new-interface-info__head').empty();
            html.find('.new-interface-info__details').html(
                details_blocks.join('<span class="new-interface-info__separator">&#65049;</span>')
            );
        }

        load(data) {
            if (!data || !data.id) return;

            const _this = this;
            clearTimeout(this.timer);

            const type = data.name ? 'tv' : 'movie';
            const url = Lampa.TMDB.api(
                type +
                '/' +
                data.id +
                '?api_key=' +
                Lampa.TMDB.key() +
                '&append_to_response=content_ratings,release_dates&language=' +
                Lampa.Storage.get('language')
            );

            if (this.loaded[url]) {
                this.draw(this.loaded[url]);
                return;
            }

            this.timer = setTimeout(function () {
                _this.network.clear();
                _this.network.timeout(5000);
                _this.network.silent(url, function (movie) {
                    _this.loaded[url] = movie;
                    _this.draw(movie);
                });
            }, 300);
        }

        empty() {
            if (!this.html) return;
            this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
        }

        destroy() {
            clearTimeout(this.timer);
            this.network.clear();
            this.loaded = {};
            if (this.html) {
                this.html.remove();
                this.html = null;
            }
        }
    }

    function addStyleV3() {
        if (addStyleV3.added) return;
        addStyleV3.added = true;

        Lampa.Template.add(
            'new_interface_style_v3',
            `
<style>
.new-interface .card.card--wide {
    width: 18.5em !important;
    min-width: 18.5em !important;
    max-width: 18.5em !important;
    flex: 0 0 18.5em !important;
}

/* Специальные стили для карточек истории просмотра - только если у них есть класс history-card */
.new-interface .card.card--small.history-card {
    width: 10.5em !important;
    min-width: 10.5em !important;
    max-width: 10.5em !important;
    flex: 0 0 10.5em !important;
}

.new-interface .card.card--small.history-card .card__view {
    padding-bottom: 150% !important;
}

/* Фиксируем отступы между рядами */
.new-interface .items-line {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
}

.new-interface .items-line__body {
    margin-top: 0.5em !important;
    margin-bottom: 1.5em !important;
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

.new-interface-info__block span {
    font-size: 0.95em;
    line-height: 1.2;
    white-space: nowrap;
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

.new-interface .card.card--wide .card-watched {
    display: none !important;
}

.new-interface .card.card--wide + .card-more .card-more__box {
    padding-bottom: 60%;
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
</style>
`
        );

        $('body').append(Lampa.Template.get('new_interface_style_v3', {}, true));
    }

    function wrap(target, method, handler) {
        if (!target) return;
        const original = typeof target[method] === 'function' ? target[method] : null;
        target[method] = function (...args) {
            return handler.call(this, original, args);
        };
    }

    function shouldUseNewInterface(object) {
        if (!object) return false;
        if (window.innerWidth < 767) return false;

        // Собираем все признаки в одну строку для поиска
        var context = (object.url + '|' + object.source + '|' + object.intent + '|' + object.component).toLowerCase();

        // Список стоп-слов для всех языков
        var stopWords = [
            'favorite', 'bookmarks', 'book', 'history', 
            'избранное', 'закладки', 'история',
            'wath', 'like', 'queue'
        ];

        // Проверяем, есть ли хоть одно стоп-слово в контексте страницы
        var isLibrary = stopWords.some(function(word) {
            return context.indexOf(word) !== -1;
        });

        if (isLibrary) return false;

        return true;
    }

    function createInterfaceState(main) {
        const info = new InterfaceInfo();
        info.create();

        const background = document.createElement('img');
        background.className = 'full-start__background';

        const state = {
            main,
            info,
            background,
            backgroundTimer: null,
            backgroundLast: '',
            attached: false,

            attach() {
                if (this.attached) return;

                const container = main.render(true);
                if (!container) return;

                container.classList.add('new-interface');

                if (!background.parentElement) {
                    container.insertBefore(background, container.firstChild || null);
                }

                const infoNode = info.render(true);
                if (infoNode && infoNode.parentNode !== container) {
                    if (background.parentElement === container) {
                        container.insertBefore(infoNode, background.nextSibling);
                    } else {
                        container.insertBefore(infoNode, container.firstChild || null);
                    }
                }

                if (main.scroll && typeof main.scroll.minus === 'function') {
                    main.scroll.minus(infoNode);
                }

                this.attached = true;
            },

            update(data) {
                if (!data) return;
                info.update(data);
                this.updateBackground(data);
            },

            updateBackground(data) {
                const path = data && data.backdrop_path
                    ? Lampa.Api.img(data.backdrop_path, 'w1280')
                    : '';

                if (!path || path === this.backgroundLast) return;

                clearTimeout(this.backgroundTimer);

                this.backgroundTimer = setTimeout(() => {
                    background.classList.remove('loaded');

                    background.onload = () => background.classList.add('loaded');
                    background.onerror = () => background.classList.remove('loaded');

                    this.backgroundLast = path;

                    setTimeout(() => {
                        background.src = this.backgroundLast;
                    }, 300);
                }, 1000);
            },

            reset() {
                info.empty();
            },

            destroy() {
                clearTimeout(this.backgroundTimer);
                info.destroy();

                const container = main.render(true);
                if (container) container.classList.remove('new-interface');

                if (background && background.parentNode) {
                    background.parentNode.removeChild(background);
                }

                this.attached = false;
            }
        };

        return state;
    }

    function ensureState(main) {
        if (main.__newInterfaceState) return main.__newInterfaceState;
        const state = createInterfaceState(main);
        main.__newInterfaceState = state;
        return state;
    }

    function prepareLineData(element) {
        if (!element) return;
        
        // Определяем, является ли это ряд истории просмотра
        const isHistoryLine = element.title && (
            element.title.toLowerCase().includes('вы смотр') ||
            element.title.toLowerCase().includes('continue') ||
            element.title.toLowerCase().includes('продолжить') ||
            element.title.toLowerCase().includes('history') ||
            element.title.toLowerCase().includes('watching')
        );
        
        if (Array.isArray(element.results)) {
            Lampa.Utils.extendItemsParams(element.results, {
                style: { 
                    name: isHistoryLine ? 'small' : 'wide' // Для истории используем вертикальные карточки
                }
            });
            
            // Добавляем специальный класс для карточек истории
            if (isHistoryLine) {
                element.results.forEach(item => {
                    item.className = (item.className || '') + ' history-card';
                });
            }
        }
    }

    function updateCardTitle(card) {
        if (!card || typeof card.render !== 'function') return;

        const element = card.render(true);
        if (!element) return;

        if (!element.isConnected) {
            clearTimeout(card.__newInterfaceLabelTimer);
            card.__newInterfaceLabelTimer = setTimeout(() => updateCardTitle(card), 50);
            return;
        }

        clearTimeout(card.__newInterfaceLabelTimer);

        const seek = element.querySelector('.new-interface-card-title');
        if (seek && seek.parentNode) {
            seek.style.display = 'block';
            seek.style.height = '2.5em';
            seek.style.overflow = 'hidden';
            seek.style.textOverflow = 'ellipsis';
            seek.style.display = '-webkit-box';
            seek.style.webkitLineClamp = '2';
            seek.style.webkitBoxOrient = 'vertical';
            seek.style.fontSize = '1em';
            seek.style.lineHeight = '1.25';
            seek.style.marginTop = '0.5em';
            seek.style.color = '#fff';
        }
        card.__newInterfaceLabel = null;
    }

    function decorateCard(state, card) {
        if (!card || card.__newInterfaceCard || typeof card.use !== 'function' || !card.data)
            return;

        card.__newInterfaceCard = true;

        // Сохраняем оригинальный стиль карточки, не перезаписываем его
        card.params = card.params || {};
        card.params.style = card.params.style || {};
        
        // Определяем, является ли это карточкой истории просмотра
        const isHistoryCard = card.data.className && card.data.className.includes('history-card');
        
        // Если стиль уже установлен, не меняем его
        if (!card.params.style.name) {
            card.params.style.name = isHistoryCard ? 'small' : 'wide';
        }

        card.use({
            onFocus() {
                state.update(card.data);
            },
            onHover() {
                state.update(card.data);
            },
            onTouch() {
                state.update(card.data);
            },
            onVisible() {
                updateCardTitle(card);
            },
            onUpdate() {
                updateCardTitle(card);
            },
            onDestroy() {
                clearTimeout(card.__newInterfaceLabelTimer);
                if (card.__newInterfaceLabel && card.__newInterfaceLabel.parentNode) {
                    card.__newInterfaceLabel.parentNode.removeChild(card.__newInterfaceLabel);
                }
                card.__newInterfaceLabel = null;
                delete card.__newInterfaceCard;
            }
        });

        updateCardTitle(card);
    }

    function getCardData(card, element, index = 0) {
        if (card && card.data) return card.data;
        if (element && Array.isArray(element.results))
            return element.results[index] || element.results[0];
        return null;
    }

    function getDomCardData(node) {
        if (!node) return null;

        let current = node && node.jquery ? node[0] : node;

        while (current && !current.card_data) {
            current = current.parentNode;
        }

        return current && current.card_data ? current.card_data : null;
    }

    function getFocusedCardData(line) {
        const container = line && typeof line.render === 'function' ? line.render(true) : null;
        if (!container || !container.querySelector) return null;

        const focus = container.querySelector('.selector.focus') || container.querySelector('.focus');
        return getDomCardData(focus);
    }

    function attachLineHandlers(main, line, element) {
        if (line.__newInterfaceLine) return;
        line.__newInterfaceLine = true;

        const state = ensureState(main);
        const applyToCard = (card) => decorateCard(state, card);

        line.use({
            onInstance(card) {
                applyToCard(card);
            },
            onActive(card, itemData) {
                const current = getCardData(card, itemData);
                if (current) state.update(current);
            },
            onToggle() {
                setTimeout(() => {
                    const domData = getFocusedCardData(line);
                    if (domData) state.update(domData);
                }, 32);
            },
            onMore() {
                state.reset();
            },
            onDestroy() {
                state.reset();
                delete line.__newInterfaceLine;
            }
        });

        if (Array.isArray(line.items) && line.items.length) {
            line.items.forEach(applyToCard);
        }

        if (line.last) {
            const lastData = getDomCardData(line.last);
            if (lastData) state.update(lastData);
        }
    }

    function startPluginV3() {
        if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) return;
        if (window.plugin_interface_ready_v3) return;
        window.plugin_interface_ready_v3 = true;

        addStyleV3();

        const mainMap = Lampa.Maker.map('Main');
        if (!mainMap || !mainMap.Items || !mainMap.Create) return;

        wrap(mainMap.Items, 'onInit', function (original, args) {
            if (original) original.apply(this, args);
            this.__newInterfaceEnabled = shouldUseNewInterface(this && this.object);
        });

        wrap(mainMap.Create, 'onCreate', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const state = ensureState(this);
            state.attach();
        });

        wrap(mainMap.Create, 'onCreateAndAppend', function (original, args) {
            const element = args && args[0];
            if (this.__newInterfaceEnabled && element) {
                prepareLineData(element);
            }
            return original ? original.apply(this, args) : undefined;
        });

        wrap(mainMap.Items, 'onAppend', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const item = args && args[0];
            const element = args && args[1];
            if (item && element) attachLineHandlers(this, item, element);
        });

        wrap(mainMap.Items, 'onDestroy', function (original, args) {
            if (this.__newInterfaceState) {
                this.__newInterfaceState.destroy();
                delete this.__newInterfaceState;
            }
            delete this.__newInterfaceEnabled;
            if (original) original.apply(this, args);
        });
    }

    startPluginV3();
})();
