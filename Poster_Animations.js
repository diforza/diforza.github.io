(function () {
  'use strict';

  if (window.posterAnimationsPluginLoaded) return;
  window.posterAnimationsPluginLoaded = true;

  const STORAGE_KEY = 'poster_animations_choice';
  const STYLE_ID = 'poster-animations-style';

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
}
`,
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
}
`,
    wobble2D: `
.card.focus .card__view,
.card.hover .card__view {
  animation: wobble2D 0.8s ease infinite !important;
}
@keyframes wobble2D {
  0%, 100% { transform: scale(1.02) rotate(0deg); }
  25%      { transform: scale(1.02) rotate(5deg); }
  75%      { transform: scale(1.02) rotate(-5deg); }
}
`,
    wobblePoster: `
.card.focus .card__view,
.card.hover .card__view {
  animation: wobblePoster 2.5s ease-in-out infinite !important;
}
@keyframes wobblePoster {
  0%   { transform: perspective(1000px) scale(1.08) rotateY(-15deg); }
  50%  { transform: perspective(1000px) scale(1.08) rotateY(15deg); }
  100% { transform: perspective(1000px) scale(1.08) rotateY(-15deg); }
}
`,
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
}
`,
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
}
`,
    wobblePerspective: `
.card.focus .card__view,
.card.hover .card__view {
  animation: wobblePerspective 1.2s ease forwards;
  z-index: 2;
}
@keyframes wobblePerspective {
  0%   { transform: perspective(1000px) scale(1) rotateY(0deg); }
  25%  { transform: perspective(1000px) scale(1.05) rotateY(-10deg); }
  50%  { transform: perspective(1000px) scale(1.05) rotateY(10deg); }
  75%  { transform: perspective(1000px) scale(1.05) rotateY(-5deg); }
  100% { transform: perspective(1000px) scale(1) rotateY(0deg); }
}
`,
    zoomBounce: `
.card.focus .card__view,
.card.hover .card__view {
  animation: zoomBounce 0.8s ease forwards;
  z-index: 2;
}
@keyframes zoomBounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); }
  70%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}
`
  };

  const BASE_FIXES = `
.card.focus { outline: none !important; box-shadow: none !important; }
`;

  function ensureStyleEl() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.type = 'text/css';
      document.head.appendChild(style);
    }
    return style;
  }

  function applyAnimationPreset() {
    const choice = Lampa.Storage.get(STORAGE_KEY, 'off');
    const style = ensureStyleEl();
    const css = (choice && CSS_MAP[choice]) ? BASE_FIXES + CSS_MAP[choice] : '';
    style.textContent = css;
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
        'zoomWobble': 'Zoom + Wobble',
        'zoomFlip': 'Zoom + Flip',
        'wobblePerspective': 'Wobble + Perspective',
        'zoomBounce': 'Zoom + Bounce'
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

  Lampa.Listener.follow('app', function (e) {
    if (e.type === 'ready') {
      applyAnimationPreset();
    }
  });
})();

