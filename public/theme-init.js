// Apply the saved appearance before the page paints (Automatic follows the device setting).
(function () {
  var pref = 'auto';
  try { pref = localStorage.getItem('ff-theme') || 'auto'; } catch (e) { /* storage blocked */ }
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function apply() {
    var dark = pref === 'dark' || (pref === 'auto' && media && media.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#000000' : '#F2F2F7');
  }
  window.ffSetTheme = function (value) { pref = value; try { localStorage.setItem('ff-theme', value); } catch (e) { /* ignore */ } apply(); };
  window.ffTheme = function () { return pref; };
  if (media && media.addEventListener) media.addEventListener('change', apply);
  apply();
})();
