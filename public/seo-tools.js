// Interactive parts of the public tool pages: the house-edge calculator and the Hi-Lo count drill.
(function () {
  var form = document.getElementById('he-form');
  if (form) {
    var calc = function () {
      var f = new FormData(form), d = +f.get('decks');
      var e = ({ 1: -0.48, 2: -0.19, 4: -0.06, 6: 0, 8: 0.02 })[d] + 0.40;
      if (f.get('soft17') === 'H17') e += 0.20;
      if (f.get('das') === 'no') e += 0.14;
      if (f.get('ls') === 'yes') e -= f.get('soft17') === 'H17' ? 0.09 : 0.07;
      if (f.get('rsa') === 'yes') e -= 0.08;
      if (f.get('double') === '10-11') e += 0.18; else if (f.get('double') === '9-11') e += 0.09;
      if (f.get('payout') === '6:5') e += 1.39; else if (f.get('payout') === '1:1') e += 2.27;
      document.getElementById('he-edge').textContent = (e < 0 ? '−' : '') + Math.abs(e).toFixed(2) + '%' + (e < 0 ? ' (player edge)' : '');
      document.getElementById('he-cost').textContent = e > 0 ? 'At $25 a hand and 60 hands an hour, that’s about $' + (e / 100 * 25 * 60).toFixed(2) + ' an hour on average.' : 'A rare game where perfect basic strategy has a slight edge.';
    };
    form.addEventListener('change', calc); calc();
  }

  var start = document.getElementById('cc-start');
  if (start) {
    var ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'], suits = ['♠', '♥', '♦', '♣'];
    var value = function (r) { return ['2', '3', '4', '5', '6'].indexOf(r) >= 0 ? 1 : ['7', '8', '9'].indexOf(r) >= 0 ? 0 : -1; };
    var card = document.getElementById('cc-card'), status = document.getElementById('cc-status'), form2 = document.getElementById('cc-form'), result = document.getElementById('cc-result');
    var count = 0;
    start.addEventListener('click', function () {
      var speed = +document.getElementById('cc-speed').value, n = 0; count = 0;
      start.disabled = true; form2.hidden = true; result.textContent = ''; status.textContent = 'Keep the count…';
      var t = setInterval(function () {
        if (n === 12) { clearInterval(t); card.innerHTML = ''; card.className = 'pc back'; status.textContent = 'What’s the running count?'; form2.hidden = false; start.disabled = false; document.getElementById('cc-answer').focus(); return; }
        var r = ranks[Math.random() * 13 | 0], s = suits[Math.random() * 4 | 0];
        count += value(r); n++;
        card.innerHTML = '<b>' + r + '<i>' + s + '</i></b><em>' + (/[JQK]/.test(r) ? r : s) + '</em>';
        card.className = 'pc flip' + (s === '♥' || s === '♦' ? ' red' : '');
      }, speed);
    });
    form2.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = parseInt(document.getElementById('cc-answer').value, 10);
      result.textContent = v === count ? 'Correct! The count is ' + count + '.' : 'Not quite: the count was ' + (count > 0 ? '+' : '') + count + '.';
      result.className = v === count ? 'ok' : 'bad';
    });
  }
})();
