// == Movie Logos | Clean and Working ==

(function () {
    'use strict';

    // --- Plugin Code-Level Settings ---
    // Configure text appearance for different elements in the info panel.
    // These settings are only available by editing the plugin file directly.
    var textSettings = {
        description: {
            fontSize: '1.5em',      /* Размер шрифта описания (напр. '1.2em', '16px') */
            color: '#ffffff',       /* Цвет текста описания (напр. '#ffffff', 'rgba(255,255,255,0.9)') */
            fontWeight: '700',      /* Толщина шрифта описания (напр. 'normal', 'bold', '300', '600') */
            lineHeight: '1.1',      /* Межстрочное расстояние описания (напр. '1.5', '20px') */
            letterSpacing: 'normal',/* Межбуквенное расстояние описания (напр. 'normal', '0.5px') */
            textShadow: '1px 1px 2px #000',      /* Обводка текста описания (напр. 'none', '1px 1px 2px #000') */
            fontStyle: 'italic',    /* Стиль шрифта описания (напр. 'normal', 'italic') */
            lineClamp: '3'          /* Количество строк описания (напр. '3', '5', 'none') */
        },
        genreAndPgLine: {
            fontSize: '1.3em',        /* Размер шрифта строки жанров и PG (напр. '1em', '14px') */
            color: '#ffffff',       /* Цвет текста строки жанров и PG */
            fontWeight: '500',   /* Толщина шрифта строки жанров и PG */
            lineHeight: '1.5',      /* Межстрочное расстояние строки жанров и PG */
            letterSpacing: 'normal',/* Межбуквенное расстояние строки жанров и PG */
            textShadow: '1px 1px 2px #000',      /* Обводка текста строки жанров и PG */
            fontStyle: 'italic'    /* Стиль шрифта строки жанров и PG (напр. 'normal', 'italic') */
        }
    };

    // --- Plugin Layout Code-Level Settings ---
    // Configure sizes, margins, and spacing for interface blocks and posters.
    // These settings are only available by editing the plugin file directly.
    var layoutSettings = {
        infoBlock: {
            heightWide: '24em',     /* Высота инфо-блока для широких постеров (напр. '24em', '350px') */
            heightVertical: '21em', /* Высота инфо-блока для вертикальных постеров */
            marginTop: '-0.5em'        /* Отступ сверху от шапки до инфо-блока (напр. '0em', '20px', '-1em' для поднятия) */
        },
        posterBlock: {
            marginTop: '1em',       /* Отступ сверху от инфо-блока до блока постеров (напр. '0em', '20px' для раздвижения) */
            paddingBottom: '1.5em'    /* Отступ снизу от ряда с карточками до нижнего края (напр. '1em', '50px') */
        },
        verticalCards: {
            width: '10.5em',          /* Ширина вертикальных карточек (по умолчанию 12em) */
            marginHorizontal: '0.5em', /* Горизонтальный отступ между вертикальными карточками */
            marginVertical: '0.5em' /* Вертикальный отступ между рядами вертикальных карточек */
        },
         backgroundOverlay: {
              opacity: '0.5' /* Прозрачность затемняющей маски фона (от '0' до '1'). Чем выше значение, тем сильнее затемнение. */
        }
    };

   
    // --- Language Strings ---
    if (window.Lampa && Lampa.Lang) {
        Lampa.Lang.add({
            additional_ratings_title: {
                 ru: "Настройки интерфейса",
                 en: "Interface Settings",
                 uk: "Налаштування інтерфейсу"
            },
            logo_toggle_name: {
                ru: "Логотип вместо заголовка",
                en: "Logo Instead of Title",
                uk: "Логотип замість заголовка"
            },
            logo_toggle_desc: {
                ru: "Заменяет текстовый заголовок фильма логотипом",
                en: "Replaces movie text title with a logo",
                uk: "Замінює текстовый заголовок логотипом"
            },
            settings_show: {
                ru: "Показать",
                en: "Show",
                uk: "Показати"
            },
            settings_hide: {
                ru: "Скрыть",
                en: "Hide",
                uk: "Приховати"
            },
            full_notext: {
                en: 'No description',
                ru: 'Нет описания',
                uk: 'Немає опису'
            },
            info_panel_logo_height_name: {
                ru: "Размер логотипа в инфо-панели",
                en: "Logo Size in Info Panel",
                uk: "Висота логотипу в інфо-панели"
            },
            info_panel_logo_height_desc: {
                ru: "Максимальная высота логотипа в инфо-панели",
                en: "Maximum logo height in the info panel",
                uk: "Максимальна висота логотипу в інфо-панели"
            },
            poster_display_type_name: {
                ru: "Тип отображения постеров",
                en: "Poster Display Type",
                uk: "Тип відображення постерів"
            },
            poster_display_type_descr: {
                ru: "Выберите, как отображать постеры в списке: широкие или вертикальные.",
                en: "Choose how to display posters in the list: wide or vertical.",
                uk: "Оберіть, як відображати постери у списку: широкі або вертикальні."
            },
            poster_type_wide_label: {
                ru: "Широкие",
                en: "Wide",
                uk: "Широкі"
            },
            poster_type_vertical_label: {
                ru: "Вертикальные",
                en: "Vertical",
                uk: "Вертикальні"
            }
        });
    }

    // --- Settings UI Registration ---
    if (window.Lampa && Lampa.SettingsApi) {
        var settingsComponent = 'mdblist_interface_settings';

        Lampa.SettingsApi.addComponent({
            component: settingsComponent,
            name: Lampa.Lang.translate('additional_ratings_title'),
            icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" xml:space="preserve" width="32" height="32" fill="currentColor"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7z M12,15c-1.65,0-3-1.35-3-3 c0-1.65,1.35-3,3-3s3,1.35,3,3C15,13.65,13.65,15,12,15z" /></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: settingsComponent,
            param: {
                name: 'show_logo_instead_of_title',
                type: 'select',
                values: {
                    'true': Lampa.Lang.translate('settings_show'),
                    'false': Lampa.Lang.translate('settings_hide')
                },
                'default': 'false'
            },
            field: {
                name: Lampa.Lang.translate('logo_toggle_name'),
                description: Lampa.Lang.translate('logo_toggle_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('show_logo_instead_of_title', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: settingsComponent,
            param: {
                name: 'info_panel_logo_max_height',
                type: 'select',
                values: {
                    '50': '50px', '75': '75px', '100': '100px', '125': '125px', '150': '150px',
                    '175': '175px', '200': '200px', '225': '225px', '250': '250px',
                    '300': '300px', '350': '350px', '400': '400px', '450': '450px', '500': '500px'
                },
                'default': '100'
            },
            field: {
                name: Lampa.Lang.translate('info_panel_logo_height_name'),
                description: Lampa.Lang.translate('info_panel_logo_height_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('info_panel_logo_max_height', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: settingsComponent,
            param: {
                name: 'poster_display_type',
                type: 'select',
                values: {
                    'wide': Lampa.Lang.translate('poster_type_wide_label'),
                    'vertical': Lampa.Lang.translate('poster_type_vertical_label')
                },
                'default': 'wide'
            },
            field: {
                name: Lampa.Lang.translate('poster_display_type_name'),
                description: Lampa.Lang.translate('poster_display_type_descr')
            },
            onChange: function(value) {
                Lampa.Storage.set('poster_display_type', value);
            }
        });

    } else {
        console.error("MDBList_Plugin_Restored: Lampa.SettingsApi not available.");
    }

    var network = (window.Lampa && Lampa.Reguest) ? new Lampa.Reguest() : null; // Global network instance

    function create() {
        var html;
        var timer;
        var networkCreatePanel = new Lampa.Reguest(); // Instance for create() methods like load() and new displayLogoOrTitle()
        var loaded = {};

        this.create = function () {
            html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__head\"></div>\n                <div class=\"new-interface-info__title\"></div>\n                <div class=\"new-interface-info__details\"></div>\n                <div class=\"new-interface-info__description\"></div>\n            </div>\n        </div>");
        };

        this.update = function(data_card) {
            if (!html) {
                console.error("create.update: 'html' element not ready.");
                return;
            }
             var actual_title = data_card.title || data_card.name; 
             if (!data_card || !data_card.id || !actual_title) { 
                 html.find('.new-interface-info__head, .new-interface-info__title, .new-interface-info__details, .new-interface-info__description').empty().text('---');
                 html.find('.new-interface-info__title').removeClass('title-contains-logo');
                 return;
            }
             if (!data_card.method) data_card.method = data_card.name ? 'tv' : 'movie';

            html.find('.new-interface-info__head, .new-interface-info__details').html('---');
            var backgroundPath = data_card.backdrop_path || data_card.poster_path;
            Lampa.Background.change(Lampa.Api.img(backgroundPath, 'w200'));

            var descriptionText = data_card.overview || Lampa.Lang.translate('full_notext');
            html.find('.new-interface-info__description').text(descriptionText);

            var showLogosSetting = Lampa.Storage.get('show_logo_instead_of_title', 'false');
            var showLogos = (showLogosSetting === 'true' || showLogosSetting === true);

            var descElement = html.find('.new-interface-info__description');
            if (descElement.length) {
                var currentLineClamp = textSettings.description.lineClamp === 'none' ? 'none' : textSettings.description.lineClamp;
                var currentFontStyle = textSettings.description.fontStyle;
                var targetLineClamp = showLogos ? '2' : (textSettings.description.lineClamp === 'none' ? 'none' : textSettings.description.lineClamp);
                descElement.css({
                    '-webkit-line-clamp': targetLineClamp,
                    'line-clamp': targetLineClamp,
                    'font-style': currentFontStyle
                });
            }

            if (showLogos && data_card.method && actual_title) {
                this.displayLogoOrTitle(data_card);
            } else if (actual_title) {
                html.find('.new-interface-info__title').text(actual_title).removeClass('title-contains-logo');
            } else {
                html.find('.new-interface-info__title').empty().removeClass('title-contains-logo');
            }

            this.draw(data_card);
            this.load(data_card);
        };

        this.draw = function (data_to_draw) {
            if (!data_to_draw) return;

            var create_year = ((data_to_draw.release_date || data_to_draw.first_air_date || '0000') + '').slice(0, 4);
            var head = [];
            var countries = Lampa.Api.sources.tmdb.parseCountries(data_to_draw);
            var pg = Lampa.Api.sources.tmdb.parsePG(data_to_draw);

            var allDetailsItems = [];

            if (data_to_draw.genres && data_to_draw.genres.length > 0) {
                var genresHtmlBlock = data_to_draw.genres.map(function (item) {
                    return '<span>' + Lampa.Utils.capitalizeFirstLetter(item.name) + '</span>';
                }).join('<span class="details-separator genre-item-separator">&#10247;</span>');
                allDetailsItems.push(genresHtmlBlock);
            }

            if (pg) {
                allDetailsItems.push('<span class="full-start__pg">' + pg + '</span>');
            }

            if (create_year !== '0000') head.push('<span>' + create_year + '</span>');
            if (countries.length > 0) head.push(countries.join(', '));
            html.find('.new-interface-info__head').html(head.join('<span>, </span>'));

            let combinedDetailsHtml = '';
            if (allDetailsItems.length > 0) {
                combinedDetailsHtml = `<div class="combined-details-line">${allDetailsItems.join('<span class="details-separator block-separator">&#10247;</span>')}</div>`;
            }
            html.find('.new-interface-info__details').html(combinedDetailsHtml || '---');
        };

        this.load = function (data_card) {
            var _this = this;
            clearTimeout(timer);
            var method_for_tmdb = data_card.method || (data_card.name ? 'tv' : 'movie');
            var url = Lampa.TMDB.api(method_for_tmdb + '/' + data_card.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));

            if (loaded[url]) {
                let final_data_from_cache = Object.assign({}, loaded[url]);
                final_data_from_cache.method = method_for_tmdb;
                if(!final_data_from_cache.title && data_card.title) final_data_from_cache.title = data_card.title;
                if(!final_data_from_cache.name && data_card.name) final_data_from_cache.name = data_card.name;
                return this.draw(final_data_from_cache);
            }

            timer = setTimeout(function () {
                networkCreatePanel.clear();
                var current_timeout_load = (typeof config !== 'undefined' && config.request_timeout) ? config.request_timeout : 5000;
                networkCreatePanel.timeout(current_timeout_load);
                networkCreatePanel.silent(url, function (movie_details_tmdb) {
                    loaded[url] = movie_details_tmdb;
                    let final_movie_data = Object.assign({}, data_card, movie_details_tmdb);
                    final_movie_data.method = method_for_tmdb;
                    _this.draw(final_movie_data);
                }, function (xhr, status) {
                    console.error(`create.load: TMDB request failed for ID ${data_card.id}. Status: ${status}`);
                    _this.draw(data_card);
                });
            }, 300);
        };

        this.render = function () { return html; };

        this.displayLogoOrTitle = function(movieData) {
            if (!html) return;
            var titleElement = html.find('.new-interface-info__title');
            if (!titleElement.length) return;

            var actual_movie_title = movieData.title || movieData.name;

            if (!movieData || !movieData.id || !movieData.method || !actual_movie_title) {
                titleElement.empty().removeClass('title-contains-logo');
                return;
            }

            var id = movieData.id;
            var method = movieData.method;
            var apiKey = Lampa.TMDB.key();
            var language = Lampa.Storage.get('language');
            var apiUrl = Lampa.TMDB.api((method === 'tv' ? 'tv/' : 'movie/') + id + '/images?api_key=' + apiKey + (language ? '&language=' + language + ',null' : '&include_image_language=null'));

            titleElement.text(actual_movie_title).removeClass('title-contains-logo');

            networkCreatePanel.clear(); 
            networkCreatePanel.timeout(7000); 
            networkCreatePanel.silent(apiUrl, function (response) {
                var logoPath = null;
                if (response && response.logos && response.logos.length > 0) {
                    var pngLogo = response.logos.find(logo => logo.file_path && !logo.file_path.endsWith('.svg'));
                    logoPath = pngLogo ? pngLogo.file_path : response.logos[0].file_path; 
                }

                var currentTitleElement = html.find('.new-interface-info__title'); 
                if (currentTitleElement && currentTitleElement.length) {
                    if (logoPath) {
                        var selectedHeight = Lampa.Storage.get('info_panel_logo_max_height', '100'); 
                        if (!/^\d+$/.test(selectedHeight)) selectedHeight = '100';

                        var imageSize = 'original'; 
                        
                        // Styles for the image itself
                        var imgStyleAttr = `max-height: ${selectedHeight}px; max-width: 100%; height: auto; width: auto; display: block; object-fit: contain;`;
                        // Styles for the new wrapper div
                        var wrapperDivStyleAttr = `max-width: 42em; margin-top: 5px; margin-bottom: 5px;`; 

                        var imgUrl = Lampa.TMDB.image('/t/p/' + imageSize + logoPath);
                        // Wrap img in a div with max-width: 42em
                        var imgTagHtml = `<div style="${wrapperDivStyleAttr}"><img src="${imgUrl}" style="${imgStyleAttr}" alt="${actual_movie_title} Logo" /></div>`;
                        
                        currentTitleElement.empty().html(imgTagHtml).addClass('title-contains-logo');
                    } else {
                        currentTitleElement.text(actual_movie_title).removeClass('title-contains-logo'); 
                    }
                }
            }, function(xhr, status) { 
                var currentTitleElement = html.find('.new-interface-info__title'); 
                if (currentTitleElement && currentTitleElement.length) {
                    currentTitleElement.text(actual_movie_title || '').removeClass('title-contains-logo'); 
                }
            });
        };


        this.empty = function () {
            if(html) {
                html.find('.new-interface-info__head, .new-interface-info__title, .new-interface-info__details, .new-interface-info__description').empty().text('---');
                html.find('.new-interface-info__title').removeClass('title-contains-logo');
            }
        };
        this.destroy = function () {
            if(html) html.remove();
            loaded = {}; html = null;
            if(networkCreatePanel) networkCreatePanel.clear();
        };
    }

    function component(object) {
        var networkCompList = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: false, over: true, scroll_by_item: true });
        var items = [];
        var html = $('<div class="new-interface"><img class="full-start__background"></div>');
        var active = 0;
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var info;
        var lezydata;
        var viewall = Lampa.Storage.field('card_views_type') == 'view' || Lampa.Storage.field('navigation_type') == 'mouse';
        var background_img = html.find('.full-start__background');
        var background_last = '';
        var background_timer;

        this.create = function () {};
        this.empty = function () {
            var button;
            if (object.source == 'tmdb') {
                button = $('<div class="empty__footer"><div class="simple-button selector">' + Lampa.Lang.translate('change_source_on_cub') + '</div></div>');
                button.find('.selector').on('hover:enter', function () {
                    Lampa.Storage.set('source', 'cub');
                    Lampa.Activity.replace({ source: 'cub' });
                });
            }
            var empty_page_results = new Lampa.Empty();
            html.append(empty_page_results.render(button));
            this.start = empty_page_results.start;
            this.activity.loader(false);
            this.activity.toggle();
        };
        this.loadNext = function () {
            var _this = this;
            if (this.next_page && typeof this.next_page === 'function' && !this.next_wait && items.length) {
                this.next_wait = true;
                this.next_page(function (new_data_obj) {
                    _this.next_wait = false;
                    var new_data_list = (new_data_obj && new_data_obj.results && Array.isArray(new_data_obj.results)) ? new_data_obj.results : new_data_obj;
                    if(new_data_list && new_data_list.length){
                        new_data_list.forEach(_this.append.bind(_this));
                    }
                }, function () { _this.next_wait = false; });
            }
        };
        this.push = function () {};
        this.build = function (data_param) {
            var _this2 = this;
            var data_list = (data_param && data_param.results && Array.isArray(data_param.results)) ? data_param.results : data_param;
            if (data_param && typeof data_param.next_page === 'function') {
                this.next_page = data_param.next_page;
            } else { this.next_page = null; }

            lezydata = data_list;
            info = new create(object);
            info.create();
            scroll.minus(info.render());
            var currentPosterType = Lampa.Storage.get('poster_display_type', 'wide');
            html.removeClass('poster-type-wide poster-type-vertical').addClass('poster-type-' + currentPosterType);
            (data_list || []).slice(0, viewall ? (data_list || []).length : 2).forEach(this.append.bind(this));
            html.append(info.render());
            html.append(scroll.render());

            if (newlampa) {
                Lampa.Layer.update(html);
                Lampa.Layer.visible(scroll.render(true));
                scroll.onEnd = this.loadNext.bind(this);
                scroll.onWheel = function (step) {
                    if (!Lampa.Controller.own(_this2)) _this2.start();
                    if (step > 0) _this2.down();
                    else if (active > 0) _this2.up();
                };
            }
            var firstItemData = null;
            if (items.length > 0 && items[0] && items[0].data) {
                firstItemData = items[0].data;
            } else if (data_list && data_list.length > 0 && data_list[0]) {
                firstItemData = data_list[0];
            }
            if (firstItemData) {
                active = 0;
                if(!firstItemData.method) firstItemData.method = firstItemData.name ? 'tv' : 'movie';
                if(!firstItemData.title && firstItemData.name) firstItemData.title = firstItemData.name;
                info.update(firstItemData);
                this.background(firstItemData);
            } else { if (info) info.empty(); }
            this.activity.loader(false);
            this.activity.toggle();
        };
        this.background = function (elem) {
            var imagePath = elem.backdrop_path || elem.poster_path || elem.cover || elem.poster;
            if (!imagePath) {
                background_img.removeClass('loaded').attr('src', '');
                background_last = ''; return;
            }
            var new_background = Lampa.Api.img(imagePath, 'w1280');
            clearTimeout(background_timer);
            if (new_background == background_last && background_img.hasClass('loaded')) return;
            var animation_time = parseInt(Lampa.Storage.get('interface_background_animation_time', '700'), 10) || 700;
            background_timer = setTimeout(function () {
                background_img.removeClass('loaded');
                if (background_img[0]) {
                    background_img[0].onload = function () { background_img.addClass('loaded'); };
                    background_img[0].onerror = function () { background_img.removeClass('loaded'); };
                    background_img[0].src = new_background;
                }
                background_last = new_background;
            }, new_background === background_last ? 50 : animation_time);
        };
        this.append = function (element) {
            if (element.ready) return;
            var _this3 = this;
            element.ready = true;
            var currentPosterTypeSetting = Lampa.Storage.get('poster_display_type', 'wide');
            var useWideCards = (currentPosterTypeSetting === 'wide');
            var item = new Lampa.InteractionLine(element, {
                url: element.url, card_small: true, cardClass: element.cardClass,
                genres: object.genres, object: object, card_wide: useWideCards, nomore: element.nomore
            });
            item.create();
            item.onDown = this.down.bind(this); item.onUp = this.up.bind(this); item.onBack = this.back.bind(this);
            item.onToggle = function () { active = items.indexOf(item); };
            if (this.onMore) item.onMore = this.onMore.bind(this);
            item.onFocus = function (elem_data) {
                if (!elem_data.method) elem_data.method = elem_data.name ? 'tv' : 'movie';
                if (!elem_data.title && elem_data.name) elem_data.title = elem_data.name;
                if(info) info.update(elem_data); _this3.background(elem_data);
            };
            item.onHover = function (elem_data) {
                if (!elem_data.method) elem_data.method = elem_data.name ? 'tv' : 'movie';
                if (!elem_data.title && elem_data.name) elem_data.title = elem_data.name;
                if(info) info.update(elem_data); _this3.background(elem_data);
            };
            item.onFocusMore = function() { if(info) info.empty(); };
            scroll.append(item.render());
            items.push(item);
        };
        this.back = function () { Lampa.Activity.backward(); };
        this.down = function () {
            if (!items.length) return;
            active++; active = Math.min(active, items.length - 1);
            if (!viewall && lezydata) {
                var items_to_show = active + 2;
                if (items.length < items_to_show && items.length < lezydata.length) {
                    lezydata.slice(items.length, items_to_show).forEach(this.append.bind(this));
                }
            }
            if(items[active]) items[active].toggle();
            if(scroll && items[active]) scroll.update(items[active].render());
        };
        this.up = function () {
            if (active <= 0) { Lampa.Controller.toggle('head'); return; }
            active--;
            if(items[active]) items[active].toggle();
            if(scroll && items[active]) scroll.update(items[active].render());
        };
        this.start = function () {
            var _this4 = this;
            Lampa.Controller.add('content', {
                link: this,
                toggle: function toggle() { if (_this4.activity.canRefresh()) return false; if (items.length) { items[active].toggle(); } },
                update: function update() {},
                left: function left() { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                right: function right() { Navigator.move('right'); },
                up: _this4.up.bind(_this4), down: _this4.down.bind(_this4), back: this.back
            });
            Lampa.Controller.toggle('content');
        };
        this.refresh = function () { this.activity.loader(true); this.activity.need_refresh = true; };
        this.pause = function () {}; this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            clearTimeout(background_timer);
            if(networkCompList) networkCompList.clear();
            Lampa.Arrays.destroy(items);
            if(scroll) scroll.destroy(); if (info) info.destroy(); if (html) html.remove();
            items = null; networkCompList = null; lezydata = null; info = null; html = null;
        };
    }

    var new_interface = component;
    var old_interface;

    function startPlugin() {
        if (!window.Lampa || !Lampa.Utils || !Lampa.Lang || !Lampa.Storage || !Lampa.TMDB || !Lampa.Template || !Lampa.Reguest || !Lampa.Api || !Lampa.InteractionLine || !Lampa.Scroll || !Lampa.Activity || !Lampa.Controller || !Lampa.SettingsApi || !Lampa.Listener ) {
            console.error("MDBList_Plugin_Restored: Missing Lampa components");
            return;
        }

        window.plugin_interface_ready = true;
        old_interface = Lampa.InteractionMain;

        if (Lampa.Listener && network) {
            Lampa.Listener.follow("full", function(eventData) {
                var storageKey = 'show_logo_instead_of_title';
                try {
                    var showLogos = (Lampa.Storage.get(storageKey, 'false') === 'true' || Lampa.Storage.get(storageKey, false) === true);

                    if (eventData.type === 'complite' && showLogos) {
                        var movie = eventData.data.movie;
                        var display_title = movie.title || movie.name;

                        if (movie && movie.id && display_title) {
                            movie.method = movie.method || (movie.name ? 'tv' : 'movie');
                            var id = movie.id;

                            var initialTargetElement = $(eventData.object.activity.render()).find(".full-start-new__title");

                            if (initialTargetElement.length > 0) {
                                initialTargetElement.text(display_title).removeClass('title-contains-logo');

                                if (!network) { console.error("Listener (Full): Global network missing."); return; }

                                var apiKey = Lampa.TMDB.key();
                                var language = Lampa.Storage.get('language');
                                var apiUrl = Lampa.TMDB.api((movie.method === 'tv' ? 'tv/' : 'movie/') + id + '/images?api_key=' + apiKey + (language ? '&language=' + language + ',null' : '&include_image_language=null'));

                                network.clear();
                                var timeoutValueListener = (typeof config !== 'undefined' && config.request_timeout) ? config.request_timeout : 7000;
                                network.timeout(timeoutValueListener);
                                network.silent(apiUrl, function (response) {
                                    var logoPath = null;
                                    if (response && response.logos && response.logos.length > 0) {
                                        var langLogos = response.logos.filter(logo => logo.iso_639_1 === language && logo.file_path && !logo.file_path.endsWith('.svg'));
                                        var nullLangLogos = response.logos.filter(logo => (logo.iso_639_1 === null || logo.iso_639_1 === 'xx' || logo.iso_639_1 === '') && logo.file_path && !logo.file_path.endsWith('.svg'));
                                        var anyPngLogos = response.logos.filter(logo => logo.file_path && !logo.file_path.endsWith('.svg'));

                                        if (langLogos.length > 0) logoPath = langLogos[0].file_path;
                                        else if (nullLangLogos.length > 0) logoPath = nullLangLogos[0].file_path;
                                        else if (anyPngLogos.length > 0) logoPath = anyPngLogos[0].file_path;
                                        else if (response.logos[0] && response.logos[0].file_path) logoPath = response.logos[0].file_path;
                                    }

                                    var currentTargetElement = $(eventData.object.activity.render()).find(".full-start-new__title");
                                    if (currentTargetElement.length > 0) {
                                        if (logoPath) {
                                            var selectedHeight = Lampa.Storage.get('info_panel_logo_max_height', '60'); 
                                            if (!/^\d+$/.test(selectedHeight)) { selectedHeight = '75'; }
                                            var imageSize = 'original';
                                            
                                            // Styles for the image itself
                                            var imgStyleAttr = `max-height: ${selectedHeight}px; max-width: 100%; height: auto; width: auto; display: block; object-fit: contain;`;
                                            // Styles for the new wrapper div
                                            var wrapperDivStyleAttr = `max-width: 42em; margin-top: 5px; margin-bottom: 5px;`; 

                                            var imgUrl = Lampa.TMDB.image('/t/p/' + imageSize + logoPath);
                                            // Wrap img in a div
                                            var imgTagHtml = `<div style="${wrapperDivStyleAttr}"><img src="${imgUrl}" style="${imgStyleAttr}" alt="${display_title} Logo" /></div>`;
                                            
                                            currentTargetElement.empty().html(imgTagHtml).addClass('title-contains-logo');
                                        } else {
                                            currentTargetElement.text(display_title).removeClass('title-contains-logo');
                                        }
                                    }
                                }, function(xhr, status) {
                                     console.error(`Listener (Full ID: ${id}): API Error ${status}. Ensuring text remains.`);
                                     var currentTargetElement = $(eventData.object.activity.render()).find(".full-start-new__title");
                                      if (currentTargetElement && currentTargetElement.length) {
                                          if(display_title) {
                                             currentTargetElement.text(display_title).removeClass('title-contains-logo');
                                          } else {
                                             currentTargetElement.empty().removeClass('title-contains-logo');
                                          }
                                      }
                                });
                            }
                        }
                    }
                } catch (e) { console.error("Logo Listener (Full): Error in callback:", e); }
            });
        } else {
             console.error("Logo Feature: Lampa.Listener or Global Network Instance not available. Full card TMDB logo disabled.");
        }


        Lampa.InteractionMain = function (object_param) {
            var currentActivityName = Lampa.Activity.active ? Lampa.Activity.active.name : '';
            var objectComponent = object_param ? object_param.component : '';
            if (objectComponent === 'bookmarks' || objectComponent === 'favorite' || currentActivityName === 'bookmarks' || currentActivityName === 'favorite') {
                return new old_interface(object_param);
            }
            if (window.innerWidth < 767) { return new old_interface(object_param); }
            return new new_interface(object_param);
        };

        var style_id = 'mdb_list_interface_styles';
        $('style[data-id="' + style_id + '"]').remove();
        $('style[data-id^="mdb_list_interface_style"]').remove();
        $('style[data-id^="new_interface_style_"]').remove();

        Lampa.Template.add(style_id, `
            <style data-id="${style_id}">
            /* --- Общие стили для new-interface --- */
            .new-interface { }
            .new-interface .full-start__background {
                position: absolute; left: 0; top: 0; width: 100%; height: 100%;
                object-fit: cover; object-position: center center; z-index: -1; opacity: 0;
                transition: opacity 0.7s ease-in-out; filter: brightness(1.05);
            }
            .new-interface .full-start__background.loaded { opacity: ${layoutSettings.backgroundOverlay.opacity}; }
            .new-interface .full-start__background:after,
            .full-start-new__background-overlay { display: none !important; }

            /* --- Стили для Инфо-панели по умолчанию (для широких постеров) --- */
            .new-interface.poster-type-wide .new-interface-info,
            .new-interface .new-interface-info {
                position: relative; padding: 1.5em;
                height: ${layoutSettings.infoBlock.heightWide};
                margin-top: ${layoutSettings.infoBlock.marginTop};
            }
            .new-interface.poster-type-wide .new-interface-info__body,
            .new-interface .new-interface-info__body {
                width: 80%; padding-top: 1.1em;
            }
            .new-interface.poster-type-wide .new-interface-info__head,
            .new-interface .new-interface-info__head {
                color: rgba(255, 255, 255, 0.6); margin-bottom: 1em;
                font-size: 1.3em; min-height: 1em;
            }
            .new-interface.poster-type-wide .new-interface-info__head span,
            .new-interface .new-interface-info__head span { color: #fff; }

            .new-interface.poster-type-wide .new-interface-info__title,
            .new-interface .new-interface-info__title {
                font-size: 4em; font-weight: 600; margin-bottom: 0.3em;
                overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
                -webkit-line-clamp: 1; line-clamp: 1;
                -webkit-box-orient: vertical;
                margin-left: -0.03em; line-height: 1.3; min-height: 1.3em;
                text-align: left; 
            }
            /* Стили для контейнера заголовка, когда в нем логотип */
            .new-interface-info__title.title-contains-logo {
                min-height: auto !important;
                line-height: 1 !important; 
                margin-bottom: 10px !important; 
                font-size: initial !important; 
                display: flex !important; 
                justify-content: flex-start; /* Align wrapper div to the left */
                align-items: center; 
            }
            .full-start-new__title.title-contains-logo { /* Для полной карточки фильма */
                min-height: auto !important;
                line-height: 1 !important;
                margin-bottom: 10px !important;
                font-size: initial !important;
                display: flex !important;
                justify-content: flex-start; /* Align wrapper div to the left */
                align-items: center; 
            }

            .new-interface.poster-type-wide .new-interface-info__details,
            .new-interface .new-interface-info__details {
                margin-bottom: 1em; display: block;
            }

            .new-interface.poster-type-wide .combined-details-line,
            .new-interface .combined-details-line {
                margin-top: 0.5em;
                line-height: ${textSettings.genreAndPgLine.lineHeight};
                font-size: ${textSettings.genreAndPgLine.fontSize};
                color: ${textSettings.genreAndPgLine.color};
                font-weight: ${textSettings.genreAndPgLine.fontWeight};
                letter-spacing: ${textSettings.genreAndPgLine.letterSpacing};
                text-shadow: ${textSettings.genreAndPgLine.textShadow};
                font-style: ${textSettings.genreAndPgLine.fontStyle};
                display: flex; flex-wrap: wrap; align-items: center;
            }

            .new-interface .details-separator {
                margin: 0 0.4em;
                font-size: 0.8em;
                font-weight: bold;
                color: rgba(255,255,255,0.5);
                vertical-align: middle;
            }
            .new-interface .full-start__pg {
                font-size: 0.9em;
                background-color: rgba(0, 0, 0, 0.1);
                color: #fff;
                padding: 0.3em 0.6em;
                border-radius: 0.25em;
                border: 2px solid rgb(139, 0, 0);
                line-height: 1.2;
                text-align: center;
            }

            .new-interface.poster-type-wide .new-interface-info__description,
            .new-interface .new-interface-info__description {
                font-size: ${textSettings.description.fontSize};
                font-weight: ${textSettings.description.fontWeight};
                line-height: ${textSettings.description.lineHeight};
                color: ${textSettings.description.color};
                letter-spacing: ${textSettings.description.letterSpacing};
                text-shadow: ${textSettings.description.textShadow};
                font-style: ${textSettings.description.fontStyle};
                overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
                -webkit-box-orient: vertical;
                width: 70%;
                margin-top: 1em;
            }

            /* --- Стили для постеров и списка по умолчанию (широкие) --- */
            .new-interface.poster-type-wide .card--small.card--wide { width: 18.3em; }
            .new-interface.poster-type-wide > .scroll,
            .new-interface > .scroll {
                margin-top: ${layoutSettings.posterBlock.marginTop};
                padding-bottom: ${layoutSettings.posterBlock.paddingBottom};
                mask: none !important;
            }

            /* --- Адаптация для ВЕРТИКАЛЬНЫХ постеров --- */
            .new-interface.poster-type-vertical .new-interface-info {
                height: ${layoutSettings.infoBlock.heightVertical};
                padding: 1em; margin-top: ${layoutSettings.infoBlock.marginTop};
            }
            .new-interface.poster-type-vertical .new-interface-info__body {
                width: 90%; padding-top: 0.8em;
            }
            .new-interface.poster-type-vertical .new-interface-info__title {
                font-size: 3.2em; margin-bottom: 0.2em;
            }
            .new-interface.poster-type-vertical .new-interface-info__description {
                font-size: ${textSettings.description.fontSize};
                font-weight: ${textSettings.description.fontWeight};
                line-height: ${textSettings.description.lineHeight};
                color: ${textSettings.description.color};
                letter-spacing: ${textSettings.description.letterSpacing};
                text-shadow: ${textSettings.description.textShadow};
                font-style: ${textSettings.description.fontStyle};
                width: 80%;
                margin-top: 1em;
            }

            .new-interface.poster-type-vertical > .scroll {
                margin-top: ${layoutSettings.posterBlock.marginTop};
                padding-bottom: ${layoutSettings.posterBlock.paddingBottom};
                mask: none !important;
            }
            .new-interface.poster-type-vertical .card--small {
                width: ${layoutSettings.verticalCards.width};
                margin: ${layoutSettings.verticalCards.marginVertical} ${layoutSettings.verticalCards.marginHorizontal};
            }
            .new-interface.poster-type-vertical .card--small.card--wide {
                width: ${layoutSettings.verticalCards.width} !important;
            }

            /* Остальные стили */
            .new-interface .card-more__box { padding-bottom: 80%; }
            .new-interface .card__promo { display: none; }
            .new-interface .card.card--wide+.card-more .card-more__box { padding-bottom: 95%; }
            .new-interface .card.card--wide .card-watched { display: none !important; }
            body.light--version .new-interface-info__body { width: 69%; padding-top: 1.5em; }
            body.light--version .new-interface-info { height: 25.3em; }
            body.advanced--animation:not(.no--animation) .new-interface .card--small.focus .card__view { animation: animation-card-focus 0.2s; }
            body.advanced--animation:not(.no--animation) .new-interface .card--small.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            </style>
            `);
        $('body').append(Lampa.Template.get(style_id, {}, true));
    }

    if (!window.plugin_interface_ready) {
        startPlugin();
    }

})();
