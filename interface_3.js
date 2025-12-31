(function () {
    alert('PLUGIN START');

    document.body.insertAdjacentHTML(
        'beforeend',
        '<div style="position:fixed;top:20px;left:20px;z-index:999999;background:red;color:white;padding:20px;font-size:20px">PLUGIN WORKS</div>'
    );
})();
