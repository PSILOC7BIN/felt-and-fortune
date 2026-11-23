from pathlib import Path
p=Path(__file__).resolve().parents[1]/'public/app.js'
s=p.read_text(encoding='utf-8')
s=s.replace('routeVersion=0,cleanup=()=>{},','routeVersion=0,cleanup=()=>{},cleanupNav=()=>{},')
s=s.replace("cleanup=()=>document.removeEventListener('keydown',closeNav);","cleanupNav=()=>document.removeEventListener('keydown',closeNav);")
s=s.replace('cleanup();cleanup=()=>{};','cleanup();cleanupNav();cleanup=()=>{};cleanupNav=()=>{};')
s=s.replace("$(url.hash)?.scrollIntoView({behavior:'smooth'});", "document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({behavior:'smooth'});")
s=s.replace("$('.navlinks')?.classList.remove('open');return;", "$('.navlinks')?.classList.remove('open');$('#nav-menu')?.setAttribute('aria-expanded','false');return;")
s=s.replace("$('#profile-form').onsubmit=", "passwordSettings();$('#profile-form').onsubmit=")
insert='''function passwordSettings(){
 const panel=document.createElement('form');panel.id='password-form';panel.className='panel mt';
 panel.innerHTML=`<h3>Change password</h3><div class="grid three">${field('current','Current password','','password','required autocomplete="current-password"')}${field('new-password','New password','','password','required minlength="10" maxlength="256" autocomplete="new-password"')}${field('confirm-password','Confirm new password','','password','required minlength="10" autocomplete="new-password"')}</div><p class="field-hint">Changing your password signs out your other sessions.</p><p class="form-error" role="alert"></p><button class="primary">Update Password</button>`;
 $('#page').append(panel);panel.onsubmit=async e=>{e.preventDefault();const d=formData(panel);const error=$('.form-error',panel);error.textContent='';if(d['new-password']!==d['confirm-password']){error.textContent='Passwords do not match.';return;}const b=$('button',panel);b.disabled=true;try{await api('/api/change-password','POST',{current:d.current,password:d['new-password']});panel.reset();toast('Password updated. Other sessions signed out.');}catch(e){error.textContent=e.message;}finally{b.disabled=false;}};
}

'''
s=s.replace('function legalPage(kind)',insert+'function legalPage(kind)')
s=s.replace("<a href=\"/auth/forgot-password\">Reset password by email →</a>","${configInfo.recoveryConfigured?'<a href=\"/auth/forgot-password\">Reset password by email →</a>':'<p class=\"field-hint\">Email recovery is not enabled for this local preview. You can change your password below.</p>'}")
s=s.replace("$('#sim-form').onsubmit=async e=>{e.preventDefault();if(running)return;", "$('#sim-form').onsubmit=async e=>{e.preventDefault();if(running)return;")
s=s.replace("localStorage.setItem('simulation-config',JSON.stringify(cfg));running=true;", "if(cfg.playMode==='deviations'&&(cfg.decks!==6||cfg.h17||cfg.surrender)){$('.form-error').textContent='For Hi-Lo indices, choose six decks, S17, and turn off surrender.';return;}localStorage.setItem('simulation-config',JSON.stringify(cfg));running=true;")
s=s.replace("if(!series[0]?.length)return", "if(!series[0]?.length||(series[0].length===1&&series[0][0][0]===0))return")
s=s.replace('Simulated Bankroll Path','Simulated Profit Path').replace("labels:['Bankroll path']", "labels:['Profit path']").replace("labels[0]==='Bankroll path'","labels[0]==='Profit path'")
p.write_text(s,encoding='utf-8')
