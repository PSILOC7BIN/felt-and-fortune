// Where the app finds its API. Empty on the website (same server); the native build sets the hosted URL.
window.FF_API_BASE = '';

// First-party funnel events (no third-party trackers). An anonymous id ties pre-signup steps together.
window.ffTrack = function (name, props) {
  try {
    var anon = localStorage.getItem('ff-anon');
    if (!anon) { anon = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('ff-anon', anon); }
    var token = window.FF_API_BASE && localStorage.getItem('ff-token');
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    fetch((window.FF_API_BASE || '') + '/api/events', { method: 'POST', headers: headers, credentials: 'same-origin', keepalive: true, body: JSON.stringify({ name: name, anon: anon, props: props || {} }) }).catch(function () {});
  } catch (e) { /* analytics must never break the page */ }
};
