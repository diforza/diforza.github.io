(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;
    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) {
        // Этот файл рассчитан на Lampa 3.x (app_digital >= 300).
        // Для 2.x можешь продолжать использовать свой старый interface.js
        return;
    }

    // =========================
    //   InterfaceInfo (как в твоём старом плагине)
    //   - блок с год/страна/жанры/PG
    //   - PG из global_pg.js при наличии
    //   - описание скрыто
    // =========================

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

            // Заголовок
            this.html
                .find('.new-interface-info__title')
                .text(data.title || data.name || '');

            // Описание — как в твоём плагине: скрыто / не трогаем
            // this.html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));

            // Фон
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

            // PG из global_pg.js, если есть, иначе стандартный TMDB PG
            let pg_rating = null;
            if (typeof window.getInternationalPG === 'function') {
                pg_rating = window.getInternationalPG(movie);
            } else {
                pg_rating = Lampa.Api.sources.tmdb.parsePG(movie);
            }

            const details_blocks = [];

            // Блок: Год и страна
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

            // Блок: Жанры
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

            // Блок: PG
            if (pg_rating) {
                details_blocks.push(
                    '<div class="new-interface-info__block"><span class="new-interface-info__pg">' +
                    pg_rating +
                    '</span></div>'
                );
            }

            // head можно оставить пустым/служебным (ты его всё равно скрываешь стилями)
            html.find('.new-interface-info__head').empty();

            // Строка деталей с разделителем между блоками
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

    // =========================
    //   Стили для 3.x (взяты из твоего interface.js)
    //   – широкие постеры, инфо-плашки, скрытое описание, скрытый TMDB-рейтинг
    // =========================

    function addStyleV3() {
        if (addStyleV3.added) return;
        addStyleV3.added = true;

        Lampa.Template.add(
            'new_interface_style_v3',
            `
<style>
/* Общие стили для карточек постеров */
.new-interface .card--small.card--wide {
    width: 18.5em; /* Ширина широких постеров */
}

/* === НАСТРАИВАЕМЫЕ ПАРАМЕТРЫ ИНФО-БЛОКА === */

/* Основной контейнер информационного блока (включает название и инфо-строку) */
.new-interface-info {
    position: relative;
    padding: 0em 1.5em 0 1.5em; 
}

/* Внутренний контейнер для названия и деталей (год, жанры, PG) */
.new-interface-info__body {
    width: 95%; 
    padding-top: 1.1em;
}

/* Полностью скрываем старый заголовок */
.new-interface-info__head {
    display: none !important; 
}

/* Название фильма */
.new-interface-info__title {
    font-size: 4em;
    font-weight: 600;
    margin-bottom: 0.5em; 
    overflow: hidden;
    -o-text-overflow: ".";
    text-overflow: ".";
    display: -webkit-box;
    -webkit-line-clamp: 1; /* Обрезать название до одной строки */
    line-clamp: 1;
    -webkit-box-orient: vertical;
    margin-left: -0.03em;
    line-height: 1;
}

/* Контейнер для инфо-плашек (Год/Страна, Жанры, PG) */
.new-interface-info__details {
    margin-bottom: 0.1em; 
    display: flex; 
    flex-wrap: wrap;
    align-items: center;
    min-height: 1.9em;
    font-size: 1em;
}

/* Отдельная инфо-плашка */
.new-interface-info__block {
    display: inline-flex;
    align-items: center;
    padding: 0.25em 0.6em;
    border-radius: 0.7em;
    background: rgba(0, 0, 0, 0.65);
    margin-right: 0.4em;
    margin-bottom: 0.3em;
}

/* Текст внутри плашки */
.new-interface-info__block span {
    font-size: 0.95em;
    line-height: 1.2;
    white-space: nowrap;
}

/* Разделитель между плашками */
.new-interface-info__separator {
    margin-right: 0.4em;
    margin-bottom: 0.3em;
    opacity: 0.7;
}

/* Блок с описанием фильма (скрыт) */
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

/* Старый рейтинг TMDB (скрыт) */
.new-interface .full-start__rate {
    font-size: 1.3em;
    margin-right: 0;
    display: none; 
}

/* Стиль для PG-рейтинга внутри его плашки */
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

/* Скрываем промо-карточки */
.new-interface .card__promo {
    display: none;
}

/* "Просмотрено" на широких карточках */
.new-interface .card.card--wide .card-watched {
    display: none !important;
}

/* Стиль для контейнера "Подробнее" рядом с широкой карточкой */
.new-interface .card.card--wide + .card-more .card-more__box {
    padding-bottom: 60%;
}

/* Светлая тема — немного подправим размеры */
body.light--version .new-interface-info__body {
    width: 69%;
    padding-top: 1.5em;
}

/* Анимации для карточек */
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

    // =========================
    //   Логика под Lampa.Maker (3.x)
    // =========================

    function wrap(target, method, handler) {
        if (!target) return;
        const original = typeof target[method] === 'function' ? target[method] : null;
        target[method] = function (...args) {
            return handler.call(this, original, args);
        };
    }

    function shouldUseNewInterface(object) {
        if (!object) return false;

        // как в твоём плагине: не трогаем избранное, малые экраны и прочее
        if (object.source === 'favorite') return false;
        if (window.innerWidth < 767) return false;

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
                    // scroll.minus в 3.x умеет работать с DOM-элементом
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
                const path =
                    data && data.backdrop_path
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

    // Подготовка линий: широкие постеры
    function prepareLineData(element) {
        if (!element) return;
        if (Array.isArray(element.results)) {
            Lampa.Utils.extendItemsParams(element.results, {
                style: { name: 'wide' }
            });
        }
    }

    // Немного стилей заголовков под карточками (обрезка в 2 строки)
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

        card.params = card.params || {};
        card.params.style = card.params.style || {};
        if (!card.params.style.name) card.params.style.name = 'wide';

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
        const container =
            line && typeof line.render === 'function' ? line.render(true) : null;
        if (!container || !container.querySelector) return null;

        const focus =
            container.querySelector('.selector.focus') ||
            container.querySelector('.focus');

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

        // инициализация
        wrap(mainMap.Items, 'onInit', function (original, args) {
            if (original) original.apply(this, args);
            this.__newInterfaceEnabled = shouldUseNewInterface(this && this.object);
        });

        // создание основного контейнера
        wrap(mainMap.Create, 'onCreate', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const state = ensureState(this);
            state.attach();
        });

        // подготовка данных линии до рендеринга карточек
        wrap(mainMap.Create, 'onCreateAndAppend', function (original, args) {
            const element = args && args[0];
            if (this.__newInterfaceEnabled && element) {
                prepareLineData(element);
            }
            return original ? original.apply(this, args) : undefined;
        });

        // навешиваем обработчики на линии и карточки
        wrap(mainMap.Items, 'onAppend', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const item = args && args[0];
            const element = args && args[1];
            if (item && element) attachLineHandlers(this, item, element);
        });

        // убираем состояние при уничтожении
        wrap(mainMap.Items, 'onDestroy', function (original, args) {
            if (this.__newInterfaceState) {
                this.__newInterfaceState.destroy();
                delete this.__newInterfaceState;
            }
            delete this.__newInterfaceEnabled;
            if (original) original.apply(this, args);
        });
    }

    // стартуем сразу, т.к. это версия только для 3.x
    startPluginV3();
})();
