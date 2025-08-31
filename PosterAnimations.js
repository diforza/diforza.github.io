(function () {
  'use-strict';

  if (window.posterAnimationsPluginLoaded) return;
  window.posterAnimationsPluginLoaded = true;

  const STORAGE_KEY = 'poster_animations_choice';
  const STYLE_ID = 'poster-animations-style';
  const FOCUS_STYLE_ID = 'poster-focus-style';

  function applyOpacityToHex(hex, opacity) {
    if (!hex.startsWith('#') || hex.length !== 7) {
      return hex;
    }
    const alpha = Math.round(opacity * 255);
    let alphaHex = alpha.toString(16);
    if (alphaHex.length < 2) {
      alphaHex = '0' + alphaHex;
    }
    return hex + alphaHex;
  }

  const CSS_MAP = {
    off: '',
    zoomSpin: `
      .card.focus .card__view,
      .card.hover .card__view {
        animation: zoomSpin 0.6s ease;
        transform: scale(1.1);
        z-index: 2;
      }
      @keyframes zoomSpin {
        0%   { transform: scale(1) rotate(0deg); }
        50%  { transform: scale(1.1) rotate(180deg); }
        100% { transform: scale(1.1) rotate(360deg); }
      }`,
    flipSpin: `
      .card.focus .card__view,
      .card.hover .card__view {
        animation: flipSpin 0.5s ease;
        transform: scale(1.1);
        z-index: 2;
        transform-style: preserve-3d;
        backface-visibility: hidden;
      }
      @keyframes flipSpin {
        0%   { transform: scale(1) rotateY(0deg); }
        50%  { transform: scale(1.1) rotateY(90deg); }
        100% { transform: scale(1.1) rotateY(180deg); }
      }`,
    wobble2D: `
      .card.focus .card__view,
      .card.hover .card__view {
        animation: wobble2D 0.8s ease infinite !important;
      }
      @keyframes wobble2D {
        0%, 100% { transform: scale(1.02) rotate(0deg); }
        25%      { transform: scale(1.02) rotate(5deg); }
        75%      { transform: scale(1.02) rotate(-5deg); }
      }`,
    wobblePoster: `
      .card.focus .card__view,
      .card.hover .card__view {
        animation: wobblePoster 2s ease-in-out infinite !important;
      }
      @keyframes wobblePoster {
        0%   { transform: perspective(1000px) scale(1.05) rotateY(-12deg); }
        50%  { transform: perspective(1000px) scale(1.05) rotateY(12deg); }
        100% { transform: perspective(1000px) scale(1.05) rotateY(-12deg); }
      }`,
    zoomWobble: `
      .card.focus .card__view,
      .card.hover .card__view {
        animation: zoomWobble 1s ease forwards;
        z-index: 2;
      }
      @keyframes zoomWobble {
        0%   { transform: scale(1) rotate(0deg); }
        30%  { transform: scale(1.1) rotate(-5deg); }
        60%  { transform: scale(1.1) rotate(5deg); }
        100% { transform: scale(1) rotate(0deg); }
      }`,
    zoomFlip: `
      .card.focus .card__view,
      .card.hover .card__view {
        animation: zoomFlip 0.8s ease forwards;
        transform-style: preserve-3d;
        backface-visibility: hidden;
        z-index: 2;
      }
      @keyframes zoomFlip {
        0%   { transform: scale(1) rotateY(0deg); }
        50%  { transform: scale(1.1) rotateY(90deg); }
        100% { transform: scale(1) rotateY(0deg); }
      }`,
    wobblePerspective: `
      .card.focus .card__view,
      .card.hover .card__view {
        animation: wobblePerspective 1.2s ease forwards;
        z-index: 2;
      }
      @keyframes wobblePerspective {
        0%   { transform: perspective(1000px) scale(1) rotateY(0deg); }
        25%  { transform: perspective(1000px) scale(1.1) rotateY(-15deg); }
        50%  { transform: perspective(1000px) scale(1.1) rotateY(15deg); }
        75%  { transform: perspective(1000px) scale(1.1) rotateY(-7deg); }
        100% { transform: perspective(1000px) scale(1) rotateY(0deg); }
      }
      .card__view.wobble-poster-noscale {
        animation: wobblePosterNoScale 2s ease-in-out infinite !important;
      }
      @keyframes wobblePosterNoScale {
        0%   { transform: perspective(1000px) scale(1) rotateY(-12deg); }
        50%  { transform: perspective(1000px) scale(1) rotateY(12deg); }
        100% { transform: perspective(1000px) scale(1) rotateY(-12deg); }
      }`,
    wobbleShift: `
      .card.focus .card__view,
      .card.hover .card__view {
        animation: wobbleShift 1.2s ease-in-out infinite !important;
        transform-origin: center center;
      }
      @keyframes wobbleShift {
        0%   { transform: perspective(1000px) scale(1.03) rotateY(-5deg) translateX(2px); }
        50%  { transform: perspective(1000px) scale(1.03) rotateY(5deg) translateX(-2px); }
        100% { transform: perspective(1000px) scale(1.03) rotateY(-5deg) translateX(2px); }
      }`
  };

  const BASE_FIXES = `
    .card.focus { outline: none !important; box-shadow: none !important; position: relative; z-index: 50; }
    .card.hover { position: relative; z-index: 50; }
  `;

  function ensureStyleEl(id) {
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      style.type = 'text/css';
      document.head.appendChild(style);
    }
    return style;
  }

  function applyAnimationPreset() {
    const choice = Lampa.Storage.get(STORAGE_KEY, 'off');
    const style = ensureStyleEl(STYLE_ID);
    style.textContent = (choice && CSS_MAP[choice]) ? BASE_FIXES + CSS_MAP[choice] : '';

    if (choice === 'wobblePerspective') {
      enableHybridEffect();
    } else {
      disableHybridEffect();
    }
  }
  
  function enableHybridEffect() {
    document.addEventListener('animationend', handleAnimationEnd, true);
    document.addEventListener('mouseout', handleMouseOut, true);
  }

  function disableHybridEffect() {
    document.removeEventListener('animationend', handleAnimationEnd, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.querySelectorAll('.card__view.wobble-poster-noscale').forEach(el => {
        el.classList.remove('wobble-poster-noscale');
    });
  }

  function handleAnimationEnd(e) {
    if (e.animationName === 'wobblePerspective') {
      const view = e.target;
      if (view.classList.contains('card__view') && (view.closest('.card.focus') || view.closest('.card.hover'))) {
        view.classList.add('wobble-poster-noscale');
      }
    }
  }

  function handleMouseOut(e) {
    if (!e.target || typeof e.target.closest !== 'function') return;

    const card = e.target.closest('.card');
    if (card) {
      const view = card.querySelector('.card__view');
      if (view) {
        view.classList.remove('wobble-poster-noscale');
      }
    }
  }

  function applyFocusStyle() {
    const choice = Lampa.Storage.get('poster_focus_style', 'glow');
    const color = Lampa.Storage.get('poster_focus_color', '#FFFF00');
    const thickness = Lampa.Storage.get('poster_focus_thickness', '0.25em');
    const glowColor = Lampa.Storage.get('poster_focus_glow', '#FFFAFA');
    const intensity = Lampa.Storage.get('poster_focus_glow_intensity', 'normal');
    const opacity = parseFloat(Lampa.Storage.get('poster_focus_glow_opacity', '1.0'));

    const glow = applyOpacityToHex(glowColor, opacity);

    let shadow;
    switch (intensity) {
      case 'light':
        shadow = `0 0 6px 1px ${glow}`;
        break;
      case 'medium':
        shadow = `0 0 8px 2px ${glow}, 0 0 16px 4px ${glow}`;
        break;
      case 'strong':
        shadow = `0 0 14px 3px ${glow}, 0 0 28px 10px ${glow}`;
        break;
      default: // normal
        shadow = `0 0 10px 2px ${glow}, 0 0 20px 6px ${glow}`;
        break;
    }

    const FOCUS_STYLES = {
      default: ``,
      none: `
        .card.focus, .card.hover {
          outline: none !important;
          box-shadow: none !important;
        }
      `,
      glow: `
        .card.focus, .card.hover {
          outline: none !important;
          box-shadow: none !important;
        }
        .card__view { position: relative; }
        .card.focus .card__view::after,
        .card.hover .card__view::after {
          content: "";
          position: absolute;
          top: 0.2em; left: 0.2em; right: 0.2em; bottom: 0.2em;
          border: ${thickness} solid ${color};
          box-shadow: ${shadow};
          pointer-events: none;
        }
      `
    };

    const style = ensureStyleEl(FOCUS_STYLE_ID);
    style.textContent = FOCUS_STYLES[choice] || '';
  }

  Lampa.SettingsApi.addComponent({
    component: 'poster_animations_settings',
    name: 'Анимации постеров',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
  });

  Lampa.SettingsApi.addParam({
    component: 'poster_animations_settings',
    param: {
      name: STORAGE_KEY,
      type: 'select',
      values: {
        'off': 'Выключено',
        'zoomSpin': 'Zoom Spin',
        'flipSpin': 'Flip Spin',
        'wobble2D': 'Wobble 2D',
        'wobblePoster': 'Wobble Poster',
        'zoomWobble': 'Zoom Wobble',
        'zoomFlip': 'Zoom Flip',
        'wobblePerspective': 'Wobble Perspective',
        'wobbleShift': 'Wobble Shift'
      },
      'default': 'off'
    },
    field: {
      name: 'Выбор анимации',
      description: 'Выберите эффект для постеров при фокусе/наведении.'
    },
    onChange: function (value) {
      Lampa.Storage.set(STORAGE_KEY, value);
      applyAnimationPreset();
      Lampa.Noty.show('Анимация обновлена');
    }
  });

  Lampa.SettingsApi.addParam({
    component: 'poster_animations_settings',
    param: {
      name: 'poster_focus_style',
      type: 'select',
      values: {
        'default': 'Стандартная рамка',
        'none': 'Без рамки',
        'glow': 'Свечение'
      },
      default: 'glow'
    },
    field: {
      name: 'Фокус постеров',
      description: 'Выберите стиль рамки/свечения при фокусе.'
    },
    onChange: function(value){
      Lampa.Storage.set('poster_focus_style', value);
      applyFocusStyle();
      Lampa.Noty.show('Стиль рамки обновлён');
    }
  });

  Lampa.SettingsApi.addParam({
    component: 'poster_animations_settings',
    param: {
      name: 'poster_focus_color',
      type: 'select',
      values: {
        '#FFFF00': 'Жёлтый',
        '#00FF00': 'Зелёный',
        '#FF0000': 'Красный',
        '#00BFFF': 'Синий',
        '#FFFFFF': 'Белый',
        '#FF8C00': 'Оранжевый',
        '#8A2BE2': 'Фиолетовый',
        '#4B0082': 'Индиго',
        '#00CED1': 'Бирюзовый',
        '#7B68EE': 'Васильковый',
        '#00FA9A': 'Весенний зелёный',
        '#008080': 'Морская волна'
      },
      default: '#FFFF00'
    },
    field: {
      name: 'Цвет рамки'
    },
    onChange: function(value){
      Lampa.Storage.set('poster_focus_color', value);
      applyFocusStyle();
    }
  });

  Lampa.SettingsApi.addParam({
    component: 'poster_animations_settings',
    param: {
      name: 'poster_focus_thickness',
      type: 'select',
      values: {
        '0.15em': 'Тонкая',
        '0.25em': 'Обычная',
        '0.4em': 'Толстая'
      },
      default: '0.25em'
    },
    field: {
      name: 'Толщина рамки'
    },
    onChange: function(value){
      Lampa.Storage.set('poster_focus_thickness', value);
      applyFocusStyle();
    }
  });

  Lampa.SettingsApi.addParam({
    component: 'poster_animations_settings',
    param: {
      name: 'poster_focus_glow',
      type: 'select',
      values: {
        '#FFFAFA': 'Белое свечение',
        '#FFFF00': 'Жёлтое свечение',
        '#00FF00': 'Зелёное свечение',
        '#FF0000': 'Красное свечение',
        '#00BFFF': 'Синее свечение',
        '#FF8C00': 'Оранжевое свечение',
        '#8A2BE2': 'Фиолетовое свечение',
        '#4B0082': 'Индиго свечение',
        '#00CED1': 'Бирюзовое свечение',
        '#7B68EE': 'Васильковое свечение',
        '#00FA9A': 'Весеннее зелёное свечение',
        '#008080': 'Свечение морской волны'
      },
      default: '#FFFAFA'
    },
    field: {
      name: 'Цвет свечения'
    },
    onChange: function(value){
      Lampa.Storage.set('poster_focus_glow', value);
      applyFocusStyle();
    }
  });

  Lampa.SettingsApi.addParam({
    component: 'poster_animations_settings',
    param: {
      name: 'poster_focus_glow_intensity',
      type: 'select',
      values: {
        'light': 'Слабое',
        'medium': 'Среднее',
        'normal': 'Нормальное',
        'strong': 'Сильное'
      },
      default: 'normal'
    },
    field: {
      name: 'Интенсивность свечения'
    },
    onChange: function(value){
      Lampa.Storage.set('poster_focus_glow_intensity', value);
      applyFocusStyle();
    }
  });

  Lampa.SettingsApi.addParam({
    component: 'poster_animations_settings',
    param: {
      name: 'poster_focus_glow_opacity',
      type: 'select',
      values: {
        '1.0': '100% (Непрозрачный)',
        '0.75': '75%',
        '0.5': '50%',
        '0.25': '25%'
      },
      default: '1.0'
    },
    field: {
      name: 'Прозрачность свечения'
    },
    onChange: function(value){
      Lampa.Storage.set('poster_focus_glow_opacity', value);
      applyFocusStyle();
    }
  });

  Lampa.Listener.follow('app', function (e) {
    if (e.type === 'ready') {
      applyAnimationPreset();
      applyFocusStyle();
    }
  });
})();
