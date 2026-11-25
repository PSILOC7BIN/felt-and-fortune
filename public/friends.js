// Friends: follow players by username and compare this week's XP, streaks, and skill ratings.
import { esc, $, $$, g, ace, Sound } from './ui.js';

export async function friendsPage(ctx) {
  const { api } = ctx;
  const paint = r => {
    const days = Math.max(0, Math.ceil((new Date(r.weekEnds + 'T00:00:00') - new Date()) / 86400000));
    ctx.$('#page').innerHTML = `<div class="friends-page">
      <header class="page-hero"><div><h1>Friends</h1><p class="muted">Follow friends to compare this week’s XP, streaks, and skill ratings. Followers see only those three things.</p></div><span class="chip">${g('users')} ${r.followers} follower${r.followers === 1 ? '' : 's'}</span></header>
      <form class="friend-add panel" id="friend-add"><label for="friend-name">Add a friend by username</label><div class="flex"><input id="friend-name" name="username" autocomplete="off" required maxlength="30" placeholder="username"><button type="submit" class="primary">Follow</button></div></form>
      <section class="panel"><div class="side-head"><h3>${g('trophy')} This week</h3><span class="muted small">Resets in ${days} day${days === 1 ? '' : 's'}</span></div>
        ${r.board.length > 1 ? `<ol class="friend-board">${r.board.map((p, i) => `<li class="${p.me ? 'me' : ''}"><span class="rank">${i + 1}</span><span class="avatar">${esc(p.username[0].toUpperCase())}</span><span class="who"><b>${esc(p.username)}${p.me ? ' (you)' : ''}</b><small>${g('flame')} ${p.streak} day streak${p.rating ? ` · rating ${p.rating}` : ''}</small></span><b class="xp">${p.weekXp} XP</b>${p.me ? '' : `<button type="button" class="icon-btn" data-unfollow="${esc(p.username)}" aria-label="Unfollow ${esc(p.username)}" title="Unfollow">${g('close')}</button>`}</li>`).join('')}</ol>`
          : `<div class="empty-review">${ace('wink', 'ace-md')}<p class="muted">Learning is more fun with company. Follow a friend to start a weekly race.</p></div>`}</section></div>`;
    $('#friend-add').onsubmit = async e => {
      e.preventDefault();
      try { paint(await api('/api/friends', 'POST', { username: $('#friend-name').value })); Sound.play('pop'); ctx.toast('Following!'); } catch (err) { ctx.toast(err.message); }
    };
    $$('[data-unfollow]').forEach(b => b.onclick = async () => { paint(await api('/api/friends/remove', 'POST', { username: b.dataset.unfollow })); ctx.toast('Unfollowed.'); });
  };
  paint(await api('/api/friends'));
}
