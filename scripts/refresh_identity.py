"""One-time migration to the approved Felt & Fortune identity."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'public/app.js'
s=p.read_text(encoding='utf-8-sig')
start=s.index('<section class="hero">')
end=s.index('<section class="section" id="training">',start)
s=s[:start]+'''<section class="hero"><div class="hero-layout"><div class="hero-copy"><div class="hero-kicker">A little practice. A clearer picture.</div><h1>Know your cards.<span>Find your rhythm.</span></h1><p class="lead">Your place to learn blackjack, sharpen your decisions, and understand the numbers behind every session. A full set of tools, free for everyone.</p><div class="hero-actions"><a class="button primary large" href="${user?paths.dashboard:'/auth/signup'}">${user?'Open your workspace':'Find your starting hand'} ${icon('arrow')}</a><a class="button ghost" href="/#training">Try a drill ↓</a></div><p class="byline">No subscription. No trial clock. Just room to improve.</p></div><figure class="hero-art"><img src="/felt-and-fortune-cover.png" alt="Vintage playing cards on olive felt" fetchpriority="high"><figcaption><span>FELT & FORTUNE</span><span>GOOD HABITS START HERE.</span></figcaption></figure></div><div class="hero-strip"><span>Always free to explore</span><span>Learn · Practice · Model · Reflect</span><span>Made for the curious player</span></div></section><section class="section tool-collection"><div class="container"><div class="collection-head"><h2>Make yourself at home.</h2><p>Choose a tool. Build a habit.</p></div>${toolTiles()}</div></section>'''+s[end:]
insert="""
function toolTiles(compact=false){return `<div class="tool-grid ${compact?'compact-tools':''}">${[['basic','brain','Practice','Build better decisions.'],['simulate','calc','Explore','Put your assumptions to the test.'],['results','chart','Reflect','See the story of your sessions.'],['tutorial','book','Learn','Start with the fundamentals.']].map(([k,i,t,d])=>`<a href="${paths[k]}" class="tool-tile">${icon(i)}<span class="tile-arrow" aria-hidden="true">↗</span><strong>${t}</strong><small>${d}</small></a>`).join('')}</div>`;}
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
"""
s=s.replace('function sectionHead(',insert+'\nfunction sectionHead(')
s=s.replace('new Date().toISOString().slice(0,10)','localDate()')
s=s.replace('stroke="#304150"','stroke="#cabb9e"').replace('fill="#7e95a8"','fill="#73604e"').replace('#51d7a8','#69734a').replace('#39bfff','#a54c2d')
s=s.replace('aria-label="Toolbox"','aria-label="Workspace navigation"').replace('>Toolbox <span>','>Workspace <span>').replace("'Open Toolbox'","'Open Workspace'")
s=s.replace('<aside class="sidebar">${brand()}','<aside class="sidebar" id="workspace-navigation">${brand()}<button class="ghost side-dismiss" id="side-dismiss" aria-label="Close navigation">${icon(\'close\')}</button>')
s=s.replace('</aside><main id="main"','</aside><button class="sidebar-shade" id="sidebar-shade" aria-label="Close navigation" tabindex="-1"></button><main id="main"')
s=s.replace('id="side-toggle" aria-label="Toggle sidebar"','id="side-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="workspace-navigation"')
s=s.replace("$('#side-toggle').onclick=()=>$('.sidebar').classList.toggle('open');", "const toggleNav=open=>{$('.sidebar').classList.toggle('open',open);$('#side-toggle').setAttribute('aria-expanded',String(open));if(open)$('#side-dismiss').focus();else $('#side-toggle').focus();};$('#side-toggle').onclick=()=>toggleNav(!$('.sidebar').classList.contains('open'));$('#side-dismiss').onclick=()=>toggleNav(false);$('#sidebar-shade').onclick=()=>toggleNav(false);const closeNav=e=>{if(e.key==='Escape'&&$('.sidebar')?.classList.contains('open'))toggleNav(false);};document.addEventListener('keydown',closeNav);cleanup=()=>document.removeEventListener('keydown',closeNav);")
s=s.replace('+`<div class="toolbar"><select id="bank-select"', '+(key===\'dashboard\'?`<section class="dashboard-tools" aria-label="Quick tools"><h2>Your next good habit.</h2>${toolTiles(true)}</section>`:\'\')+`<div class="toolbar"><select id="bank-select"')
s=s.replace("const body=await res.json();if(!res.ok)","const body=await res.json();if(res.status===401&&user){user=null;go('/auth/login');}if(!res.ok)")
s=s.replace("if(location.hash)setTimeout(()=>$(location.hash)?.scrollIntoView(),50)","if(location.hash)setTimeout(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(),50)")
s=s.replace("if(!user){history.replaceState({},'','/auth/login');authPage('login');return;}","if(!user){sessionStorage.setItem('after-login',path);history.replaceState({},'','/auth/login');authPage('login');return;}")
s=s.replace("user=result.user;go(paths.dashboard);", "user=result.user;const next=sessionStorage.getItem('after-login');sessionStorage.removeItem('after-login');go(Object.values(paths).includes(next)?next:paths.dashboard);")
p.write_text(s,encoding='utf-8')
p=root/'public/index.html';s=p.read_text();s=s.replace('content="#171b1f"','content="#f4e6ca"').replace('<script defer','<link rel="stylesheet" href="/theme.css"><script defer');p.write_text(s)
