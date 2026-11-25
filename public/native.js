// Native extras inside the iOS/Android apps (Capacitor injects window.Capacitor). Does nothing on the website.
(function () {
  var cap = window.Capacitor;
  var native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  window.FF_NATIVE = native;
  window.ffHaptic = function () {};
  if (!native) return;
  var P = cap.Plugins || {};
  var feel = { tap: 'Light', select: 'Light', tick: 'Light', deal: 'Light', pop: 'Light', coin: 'Light', correct: 'Medium', reveal: 'Medium', energy: 'Medium', freeze: 'Medium', unlock: 'Medium', complete: 'Heavy' };
  window.ffHaptic = function (name) {
    try {
      if (!P.Haptics) return;
      if (name === 'wrong') P.Haptics.notification({ type: 'ERROR' });
      else if (name === 'complete' || name === 'levelup') P.Haptics.notification({ type: 'SUCCESS' });
      else if (feel[name]) P.Haptics.impact({ style: feel[name] });
    } catch (e) { /* haptics unavailable */ }
  };
  document.documentElement.classList.add('is-native');
  function syncBars() {
    if (!P.StatusBar) return;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    P.StatusBar.setStyle({ style: dark ? 'DARK' : 'LIGHT' }).catch(function () {});
  }
  new MutationObserver(syncBars).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  syncBars();
  window.addEventListener('load', function () { if (P.SplashScreen) P.SplashScreen.hide().catch(function () {}); });
  if (P.App) P.App.addListener('backButton', function (e) { if (e.canGoBack) history.back(); else P.App.exitApp(); });
})();
