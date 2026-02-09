// == Global PG Rating Provider ==
// Специальная версия для карточек из поиска
(function() {
    'use strict';

    // Ваша оригинальная функция getInternationalPG остается без изменений
    window.getInternationalPG = function(data) {
        if (!data) return null;

        let pg_rating = null;
        const method = data.name ? 'tv' : 'movie';

        // --- ПОИСК РЕЙТИНГА ДЛЯ ФИЛЬМОВ (Movie) ---
        if (method === 'movie' && data.release_dates && data.release_dates.results) {
            const usRelease = data.release_dates.results.find(r => r.iso_3166_1 === 'US');
            if (usRelease && usRelease.release_dates && usRelease.release_dates.length > 0) {
                const certification = usRelease.release_dates.slice(-1)[0].certification;
                if (certification && certification !== '') {
                    pg_rating = certification;
                }
            }
            if (!pg_rating) {
                for (const countryData of data.release_dates.results) {
                    if (countryData.release_dates && countryData.release_dates.length > 0) {
                        const certification = countryData.release_dates.slice(-1)[0].certification;
                        if (certification && certification !== '') {
                            pg_rating = certification;
                            break;
                        }
                    }
                }
            }
        }

        // --- ПОИСК РЕЙТИНГА ДЛЯ СЕРИАЛОВ (TV Show) ---
        if (method === 'tv' && data.content_ratings && data.content_ratings.results) {
            const usContentRating = data.content_ratings.results.find(r => r.iso_3166_1 === 'US');
            if (usContentRating && usContentRating.rating && usContentRating.rating !== '') {
                pg_rating = usContentRating.rating;
            }
            if (!pg_rating) {
                const anyContentRating = data.content_ratings.results.find(r => r.rating && r.rating !== '');
                if (anyContentRating) {
                    pg_rating = anyContentRating.rating;
                }
            }
        }

        // --- СИНХРОНИЗАЦИЯ ДЛЯ КАРТОЧКИ ---
        if (!window.last_pg_rating_by_id) window.last_pg_rating_by_id = {};
        if (data.id && pg_rating) {
            window.last_pg_rating_by_id[data.id] = String(pg_rating).trim();
        }

        return pg_rating;
    };

    console.log('PG override for search cards initialized');

    // === СПЕЦИАЛЬНАЯ ОБРАБОТКА ДЛЯ ПОИСКОВЫХ КАРТОЧЕК ===
    
    // Карта замен русских рейтингов на международные
    const pgMap = {
        '0+': 'G',
        '6+': 'PG',
        '12+': 'PG-13',
        '16+': 'R',
        '18+': 'NC-17',
        'NR': 'Not Rated'
    };

    // Функция для поиска и замены всех PG рейтингов на странице
    function replaceAllPG() {
        // Ищем все элементы с цифровыми рейтингами
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Принимаем текстовые узлы с русскими рейтингами
                    const text = node.textContent.trim();
                    if (node.nodeType === 3 && (text.match(/^\d+\+?$/) || pgMap[text])) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            },
            false
        );

        let nodes = [];
        let node;
        while (node = walker.nextNode()) {
            nodes.push(node);
        }

        // Заменяем найденные рейтинги
        nodes.forEach(node => {
            const text = node.textContent.trim();
            if (pgMap[text]) {
                node.textContent = pgMap[text];
            }
        });

        // Также проверяем элементы с рейтингами
        document.querySelectorAll('[class*="age"], [class*="pg"], .certification, .card__age, .card__pg, .details__age, .details__pg').forEach(element => {
            const text = element.textContent.trim();
            if (pgMap[text]) {
                element.textContent = pgMap[text];
            }
        });
    }

    // === ПЕРЕХВАТ ОТКРЫТИЯ КАРТОЧКИ ИЗ ПОИСКА ===
    
    // Мониторим клики на поисковых результатах
    document.addEventListener('click', function(e) {
        // Проверяем, кликнули ли на карточку в поиске
        let target = e.target;
        let isSearchCard = false;
        
        // Ищем родительскую карточку
        for (let i = 0; i < 8; i++) {
            if (!target || target === document.body) break;
            
            // Проверяем, находится ли элемент в поисковых результатах
            if (target.classList && (
                target.classList.contains('card') ||
                target.classList.contains('search-item') ||
                target.closest('.search-results') ||
                target.closest('[class*="search"]')
            )) {
                isSearchCard = true;
                break;
            }
            
            target = target.parentElement;
        }
        
        // Если кликнули на карточку из поиска, запускаем обновление
        if (isSearchCard) {
            console.log('Clicked on search card, updating PG...');
            
            // Даем время на загрузку карточки
            setTimeout(() => {
                replaceAllPG();
                // Дополнительные проверки
                setTimeout(replaceAllPG, 500);
                setTimeout(replaceAllPG, 1000);
                setTimeout(replaceAllPG, 1500);
            }, 300);
        }
    }, true);

    // === ПЕРЕХВАТ ЗАПРОСОВ TMDB ДЛЯ КАРТОЧЕК ===
    
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const request = args[0];
        const url = typeof request === 'string' ? request : (request ? request.url || '' : '');
        
        // Перехватываем запросы деталей фильмов/сериалов
        if (url && typeof url === 'string' && url.includes('api.themoviedb.org') && 
            (url.includes('/movie/') || url.includes('/tv/'))) {
            
            console.log('Intercepting TMDB details request:', url);
            
            return originalFetch.apply(this, args).then(response => {
                if (!response.ok) return response;
                
                const clone = response.clone();
                
                return clone.json().then(data => {
                    // Модифицируем данные
                    if (data && data.id) {
                        const intPg = window.getInternationalPG(data);
                        if (intPg) {
                            // Сохраняем оригинальный рейтинг
                            if (data.certification && !data.original_certification) {
                                data.original_certification = data.certification;
                            }
                            // Устанавливаем международный
                            data.certification = intPg;
                            data.international_pg = intPg;
                            
                            console.log(`PG override for ${data.id}: ${data.original_certification || 'none'} -> ${intPg}`);
                        }
                    }
                    
                    // Создаем новый Response
                    return new Response(JSON.stringify(data), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                }).catch(error => {
                    console.warn('PG JSON parse error:', error);
                    return response;
                });
            }).catch(error => {
                console.warn('PG fetch error:', error);
                return response;
            });
        }
        
        return originalFetch.apply(this, args);
    };

    // === АГРЕССИВНЫЙ ОБНОВИТЕЛЬ DOM ===
    
    // MutationObserver для отслеживания появления новых карточек
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // Element node
                        // Проверяем, появилась ли карточка или модальное окно
                        if (node.classList && (
                            node.classList.contains('card') ||
                            node.classList.contains('modal') ||
                            node.classList.contains('overlay') ||
                            node.classList.contains('details') ||
                            node.querySelector('.card, .modal, .overlay, .details')
                        )) {
                            shouldUpdate = true;
                            break;
                        }
                        
                        // Проверяем элементы с рейтингами
                        if (node.classList && (
                            node.classList.contains('card__age') ||
                            node.classList.contains('card__pg') ||
                            node.classList.contains('details__age') ||
                            node.classList.contains('details__pg')
                        )) {
                            shouldUpdate = true;
                            break;
                        }
                    }
                }
            }
            
            if (shouldUpdate) break;
        }
        
        if (shouldUpdate) {
            setTimeout(replaceAllPG, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // === ИНИЦИАЛИЗАЦИЯ ===
    
    // Запускаем периодическую проверку
    setInterval(replaceAllPG, 2000);
    
    // Обновляем при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(replaceAllPG, 1000);
        setTimeout(replaceAllPG, 3000);
    });
    
    // Если страница уже загружена
    if (document.readyState !== 'loading') {
        setTimeout(replaceAllPG, 500);
    }
    
    // Обновляем при навигации
    window.addEventListener('popstate', function() {
        setTimeout(replaceAllPG, 500);
    });
    
    // Создаем собственное событие pushstate
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
        originalPushState.apply(this, args);
        window.dispatchEvent(new Event('pushstate'));
        setTimeout(replaceAllPG, 500);
    };
    
    window.addEventListener('pushstate', function() {
        setTimeout(replaceAllPG, 500);
    });
    
    // Экспортируем функцию для ручного обновления
    window.forceUpdatePG = replaceAllPG;
    
    console.log('PG override for search cards ready');

})();
