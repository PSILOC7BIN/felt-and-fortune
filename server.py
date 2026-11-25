"""Dependency-free local application server with SQLite persistence."""
import os, json, sqlite3, secrets, hashlib, hmac, time, re, math, mimetypes, smtplib, threading
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from email.message import EmailMessage
from contextlib import contextmanager
from datetime import date, timedelta
from engine import basic, total, hilo, deviation, INDICES, simulate
import coach
mimetypes.add_type('application/manifest+json', '.webmanifest')
from practice_api import PracticeRoutes, grade_transcript, record_skills, BadTranscript
import economy, quests, account, learning, seo, social
from economy import EconomyRoutes

# Pacing is teaching, not a paywall: it applies to every learner (tests can relax it).
PACING={'daily_new':None,'checkpoints':True}
MIN_AGE=18

ROOT=Path(__file__).parent
DB_PATH=os.environ.get('DATABASE_PATH',str(ROOT/'data'/'ap-toolbox.sqlite3'))
JOBS={}; JOB_LOCK=threading.Lock()
RATE={}; RATE_LOCK=threading.Lock()

@contextmanager
def db():
    conn=sqlite3.connect(DB_PATH,timeout=20)
    conn.row_factory=sqlite3.Row
    conn.execute('PRAGMA foreign_keys=ON')
    try:
        with conn:
            yield conn
    finally:
        conn.close()

def initialize():
    Path(DB_PATH).parent.mkdir(parents=True,exist_ok=True)
    with db() as c:
        c.executescript('''
        PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, username TEXT UNIQUE COLLATE NOCASE, email TEXT UNIQUE COLLATE NOCASE, password TEXT NOT NULL, created REAL);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), expires REAL);
        CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, kind TEXT, owner TEXT REFERENCES users(id), parent TEXT, body TEXT, created REAL, updated REAL);
        CREATE INDEX IF NOT EXISTS record_kind ON records(kind,parent);
        CREATE TABLE IF NOT EXISTS members(bankroll TEXT REFERENCES records(id) ON DELETE CASCADE, user_id TEXT REFERENCES users(id), role TEXT, share REAL DEFAULT 0, PRIMARY KEY(bankroll,user_id));
        CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY, sender TEXT REFERENCES users(id), recipient TEXT REFERENCES users(id), body TEXT, created REAL);
        CREATE TABLE IF NOT EXISTS resets(token TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),expires REAL);
        CREATE TABLE IF NOT EXISTS challenges(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),mode TEXT,body TEXT,answer TEXT,created REAL,answered INTEGER DEFAULT 0,correct INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS plans(user_id TEXT PRIMARY KEY REFERENCES users(id),answers TEXT,plan TEXT,created REAL,updated REAL);
        CREATE TABLE IF NOT EXISTS lesson_progress(user_id TEXT REFERENCES users(id),lesson_id TEXT,best INTEGER,completions INTEGER,updated REAL,PRIMARY KEY(user_id,lesson_id));
        CREATE TABLE IF NOT EXISTS practice_log(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT REFERENCES users(id),tool TEXT,questions INTEGER,correct INTEGER,best_streak INTEGER,seconds INTEGER,day TEXT,created REAL);
        CREATE TABLE IF NOT EXISTS games(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),state TEXT,score INTEGER,finished INTEGER,created REAL);
        CREATE TABLE IF NOT EXISTS skill_stats(user_id TEXT REFERENCES users(id),skill TEXT,attempts INTEGER,misses INTEGER,recent REAL,updated REAL,PRIMARY KEY(user_id,skill));
        CREATE TABLE IF NOT EXISTS feedback(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT REFERENCES users(id),rating INTEGER,area TEXT,page TEXT,comment TEXT,created REAL);
        CREATE TABLE IF NOT EXISTS xp_log(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT REFERENCES users(id),day TEXT,xp INTEGER,lesson_id TEXT,created REAL);
        ''')
        c.executescript(economy.SCHEMA)
        c.executescript(quests.SCHEMA)
        c.executescript(account.SCHEMA)
        c.executescript(learning.SCHEMA)
        c.executescript(social.SCHEMA)

def password_hash(password,salt=None):
    salt=salt or secrets.token_hex(16)
    return salt+':'+hashlib.scrypt(password.encode(),salt=salt.encode(),n=16384,r=8,p=1).hex()

def public_user(row): return {'id':row['id'],'username':row['username'],'email':row['email']}
def unpack(row): return {**dict(row),'body':json.loads(row['body'])}
class ApiError(Exception):
    def __init__(self,message,status=400): self.message=message;self.status=status
def require(ok,msg,status=400):
    if not ok: raise ApiError(msg,status)
def textfield(data,key,maxlen=200,required=True):
    val=str(data.get(key,'')).strip()
    require((bool(val) or not required) and len(val)<=maxlen,f'Invalid {key}.')
    return val
def num(data,key,minimum=-1e9,maximum=1e9,default=0):
    try: val=float(data.get(key,default))
    except (ValueError,TypeError): raise ApiError(f'Invalid {key}.')
    require(math.isfinite(val) and minimum<=val<=maximum,f'Invalid {key}.')
    return val

# The iOS and Android apps (Capacitor) load the interface from inside the app and call the API from these origins.
# They authenticate with a bearer token instead of a cookie, so cross-site request forgery does not apply.
NATIVE_ORIGINS={'capacitor://localhost','https://localhost','ionic://localhost'}

class Handler(BaseHTTPRequestHandler, PracticeRoutes, EconomyRoutes):
    server_version='FeltAndFortune/1.0'
    def log_message(self,fmt,*args):
        # Do not log reset tokens, passwords, or message contents.
        if args and isinstance(args[0],str): print(self.command,urlparse(self.path).path)
    def send_json(self,data,status=200,cookie=None):
        raw=json.dumps(data,allow_nan=False).encode()
        self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store')
        if cookie and not self.native(): self.send_header('Set-Cookie',cookie)
        self.cors_headers()
        self.security_headers();self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
    def security_headers(self):
        self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','same-origin');self.send_header('X-Frame-Options','DENY')
        self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src https://www.youtube-nocookie.com; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'")
    def native(self): return self.headers.get('Origin') in NATIVE_ORIGINS
    def cors_headers(self):
        if self.native():
            self.send_header('Access-Control-Allow-Origin',self.headers['Origin']);self.send_header('Vary','Origin')
            self.send_header('Access-Control-Allow-Headers','Content-Type, Authorization');self.send_header('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE')
            self.send_header('Access-Control-Max-Age','600')
    def do_OPTIONS(self):
        # CORS preflight for the native apps only.
        self.send_response(204 if self.native() else 403);self.cors_headers();self.send_header('Content-Length','0');self.end_headers()
    def do_GET(self): self.dispatch()
    def do_POST(self): self.dispatch()
    def do_PATCH(self): self.dispatch()
    def do_DELETE(self): self.dispatch()
    def dispatch(self):
        try:
            path=urlparse(self.path).path
            if path.startswith('/api/'):
                self.data={}
                if self.command!='GET':
                    origin=self.headers.get('Origin')
                    # Same-host requests only. Behind an HTTPS proxy or tunnel the page origin is https://<Host>.
                    host=self.headers.get('Host','')
                    allowed={f'http://{host}',f'https://{host}'}
                    if os.environ.get('PUBLIC_ORIGIN'): allowed={os.environ['PUBLIC_ORIGIN'].rstrip('/')}
                    require(not origin or origin in allowed or origin in NATIVE_ORIGINS,'Origin not allowed.',403)
                    require(self.headers.get('Content-Type','').startswith('application/json'),'JSON required.',415)
                    length=int(self.headers.get('Content-Length','0'));require(0<length<=2000000,'Request too large.',413)
                    self.data=json.loads(self.rfile.read(length))
                    require(isinstance(self.data,dict),'Invalid JSON object.')
                with db() as c:
                    self.c=c;self.user=None
                    token=self.session_token()
                    if token:
                        self.user=c.execute('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?',(hashlib.sha256(token.encode()).hexdigest(),time.time())).fetchone()
                    return self.api(path)
            require(self.command=='GET','Method not allowed.',405)
            origin=os.environ.get('PUBLIC_ORIGIN','').rstrip('/') or f"http://{self.headers.get('Host','localhost')}"
            special={'/sitemap.xml':('application/xml',lambda:seo.sitemap(origin)),'/robots.txt':('text/plain; charset=utf-8',lambda:seo.robots(origin))}
            if path in seo.PAGES or path in special:
                ctype,make=special.get(path,('text/html; charset=utf-8',seo.PAGES.get(path)))
                raw=make().encode();self.send_response(200);self.send_header('Content-Type',ctype);self.send_header('Cache-Control','public, max-age=600');self.security_headers()
                self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw);return
            rel=path.lstrip('/')
            if rel in ('','index.html') and os.environ.get('FF_BUNDLE')=='1' and (ROOT/'public'/'dist'/'index.html').is_file(): rel='dist/index.html'
            file=(ROOT/'public'/rel).resolve()
            public=(ROOT/'public').resolve()
            require(file.is_relative_to(public),'Not found.',404)
            if not file.is_file():
                require('.' not in Path(path).name,'Not found.',404)
                file=public/'dist'/'index.html' if os.environ.get('FF_BUNDLE')=='1' and (public/'dist'/'index.html').is_file() else public/'index.html'
            raw=file.read_bytes();self.send_response(200)
            self.send_header('Content-Type',mimetypes.guess_type(str(file))[0] or 'application/octet-stream');self.send_header('Cache-Control','no-cache');self.security_headers()
            self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
        except ApiError as e: self.send_json({'error':e.message},e.status)
        except (ValueError,KeyError,TypeError,json.JSONDecodeError): self.send_json({'error':'Invalid request data.'},400)
        except sqlite3.IntegrityError: self.send_json({'error':'That username or email is already in use, or the record conflicts with existing data.'},409)
        except (BrokenPipeError,ConnectionResetError): pass
        except Exception as e:
            print(type(e).__name__,str(e));self.send_json({'error':'The request could not be completed.'},500)
    def session_token(self):
        # Native apps send a bearer token (and never cookies); the website uses the HttpOnly cookie.
        if self.native():
            m=re.fullmatch(r'Bearer ([a-f0-9]{64})',self.headers.get('Authorization',''))
        else:
            m=re.search(r'(?:^|;\s*)ap_session=([a-f0-9]{64})(?:;|$)',self.headers.get('Cookie',''))
        return m[1] if m else None
    def auth(self): require(self.user is not None,'Please sign in to continue.',401)
    def throttle(self,bucket,limit=15):
        key=(self.client_address[0],bucket);now=time.time()
        with RATE_LOCK:
            prior=[x for x in RATE.get(key,[]) if now-x<300]
            require(len(prior)<limit,'Too many attempts. Try again in five minutes.',429)
            RATE[key]=prior+[now]
    def session(self,user):
        token=secrets.token_hex(32)
        self.c.execute('INSERT INTO sessions VALUES(?,?,?)',(hashlib.sha256(token.encode()).hexdigest(),user['id'],time.time()+86400*14))
        self.c.commit()
        secure='; Secure' if os.environ.get('COOKIE_SECURE')=='1' else ''
        body={'user':public_user(user)}
        if self.native(): body['token']=token
        self.send_json(body,cookie=f'ap_session={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600{secure}')
    def record(self,id):
        row=self.c.execute('SELECT * FROM records WHERE id=?',(id,)).fetchone();require(row,'Record not found.',404);return row
    def role(self,bankroll):
        row=self.c.execute('SELECT role FROM members WHERE bankroll=? AND user_id=?',(bankroll,self.user['id'])).fetchone()
        return row['role'] if row else None
    def accessible(self,row,write=False):
        kind=row['kind'];uid=self.user['id']
        if kind=='bankroll': return self.role(row['id'])=='owner' if write else bool(self.role(row['id']))
        if kind in ('session','contribution'):
            role=self.role(row['parent'])
            return role=='owner' or (role=='editor' and row['owner']==uid) if write else bool(role)
        if write: return row['owner']==uid
        return kind in ('thread','reply','casino','review') or row['owner']==uid
    def clean_record(self,kind,data,parent):
        require(isinstance(data,dict),'Record must be an object.')
        if kind=='bankroll':
            currency=textfield(data,'currency',3).upper()
            require(currency in ('USD','EUR','GBP','CAD','AUD'),'Choose a supported currency.')
            return {'name':textfield(data,'name',80),'currency':currency,'initial':num(data,'initial',0),'type':data.get('type','solo') if data.get('type','solo') in ('solo','team','friends') else 'solo'}
        if kind=='session':
            require(re.fullmatch(r'\d{4}-\d{2}-\d{2}',str(data.get('date',''))),'Choose a date.')
            try: date.fromisoformat(data['date'])
            except ValueError: raise ApiError('Choose a valid calendar date.')
            return {'date':data['date'],'game':textfield(data,'game',60),'location':textfield(data,'location',100,False),'hours':num(data,'hours',0,1000),'profit':num(data,'profit'),'ev':num(data,'ev'),'notes':textfield(data,'notes',4000,False),'trip':textfield(data,'trip',100,False),'fields':data.get('fields',{}) if isinstance(data.get('fields',{}),dict) else {}}
        if kind=='contribution': return {'amount':num(data,'amount'),'note':textfield(data,'note',500,False)}
        if kind=='thread': return {'title':textfield(data,'title',150),'category':textfield(data,'category',80),'text':textfield(data,'text',20000)}
        if kind=='reply': return {'text':textfield(data,'text',10000)}
        if kind=='casino': return {'name':textfield(data,'name',120),'city':textfield(data,'city',120),'rules':textfield(data,'rules',2000),'heat':textfield(data,'heat',50),'penetration':num(data,'penetration',0,100),'minBet':num(data,'minBet',0),'lat':num(data,'lat',-90,90),'lng':num(data,'lng',-180,180),'notes':textfield(data,'notes',4000,False)}
        if kind=='review': return {'text':textfield(data,'text',4000),'rating':num(data,'rating',1,5)}
        raise ApiError('Unknown record type.')
    def api(self,path):
        c=self.c;d=self.data;method=self.command
        if path=='/api/me' and method=='GET': return self.send_json({'user':public_user(self.user) if self.user else None,'recoveryConfigured':bool(os.environ.get('SMTP_HOST'))})
        if path=='/api/signup' and method=='POST':
            self.throttle('signup')
            username=textfield(d,'username',30);email=textfield(d,'email',254).lower();pw=textfield(d,'password',256)
            require(re.fullmatch(r'[A-Za-z0-9_-]{3,30}',username),'Username must be 3–30 letters, numbers, hyphens or underscores.')
            require(re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',email),'Enter a valid email address.')
            require(len(pw)>=10,'Use at least 10 characters for your password.')
            birth=int(num(d,'birthYear',1900,date.today().year))
            require(date.today().year-birth>=MIN_AGE,f'Felt & Fortune is for adults {MIN_AGE} and older.',403)
            plan=None
            if d.get('survey') is not None:
                try: answers=coach.validate_answers(d['survey']);plan=coach.build_plan(answers)
                except ValueError as e: raise ApiError(str(e))
            uid=secrets.token_hex(12);c.execute('INSERT INTO users VALUES(?,?,?,?,?)',(uid,username,email,password_hash(pw),time.time()))
            c.execute('INSERT OR IGNORE INTO wallets(user_id,energy,energy_at,birth_year) VALUES(?,?,?,?)',(uid,economy.ENERGY_MAX,time.time(),birth))
            account.track(c,'signup',d.get('anon'),uid,{'survey':plan is not None},self.client_day())
            bid=secrets.token_hex(12);now=time.time()
            c.execute('INSERT INTO records VALUES(?,?,?,?,?,?,?)',(bid,'bankroll',uid,None,json.dumps({'name':'My bankroll','currency':'USD','initial':0,'type':'solo'}),now,now))
            c.execute('INSERT INTO members VALUES(?,?,?,?)',(bid,uid,'owner',100))
            if plan: c.execute('INSERT INTO plans VALUES(?,?,?,?,?)',(uid,json.dumps(answers),json.dumps(plan),now,now))
            return self.session(c.execute('SELECT * FROM users WHERE id=?',(uid,)).fetchone())
        if path=='/api/login' and method=='POST':
            self.throttle('login',30)
            row=c.execute('SELECT * FROM users WHERE email=?',(str(d.get('email','')).lower(),)).fetchone()
            pw=str(d.get('password',''))[:256]
            candidate=password_hash(pw,row['password'].split(':')[0] if row else '0'*32)
            require(row and hmac.compare_digest(candidate,row['password']),'Email or password is incorrect.',401)
            return self.session(row)
        if path=='/api/logout' and method=='POST':
            token=self.session_token()
            if token: c.execute('DELETE FROM sessions WHERE token=?',(hashlib.sha256(token.encode()).hexdigest(),))
            return self.send_json({'ok':True},cookie='ap_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
        if path=='/api/forgot-password' and method=='POST':
            self.throttle('reset',5)
            require(os.environ.get('SMTP_HOST'),'Email recovery is unavailable until the site operator configures email delivery.',503)
            row=c.execute('SELECT * FROM users WHERE email=?',(str(d.get('email','')).lower(),)).fetchone()
            if row:
                token=secrets.token_urlsafe(32);c.execute('INSERT INTO resets VALUES(?,?,?)',(hashlib.sha256(token.encode()).hexdigest(),row['id'],time.time()+1800))
                origin=os.environ.get('PUBLIC_ORIGIN','http://127.0.0.1:8000')
                msg=EmailMessage();msg['Subject']='Reset your Felt & Fortune password';msg['From']=os.environ['SMTP_FROM'];msg['To']=row['email'];msg.set_content(f'Reset your password within 30 minutes: {origin}/auth/reset-password?token={token}')
                with smtplib.SMTP(os.environ['SMTP_HOST'],int(os.environ.get('SMTP_PORT','587')),timeout=15) as smtp:
                    smtp.starttls()
                    if os.environ.get('SMTP_USER'): smtp.login(os.environ['SMTP_USER'],os.environ.get('SMTP_PASSWORD',''))
                    smtp.send_message(msg)
            return self.send_json({'ok':True})
        if path=='/api/reset-password' and method=='POST':
            self.throttle('reset-use',10);pw=textfield(d,'password',256);require(len(pw)>=10,'Use at least 10 characters.')
            row=c.execute('SELECT * FROM resets WHERE token=? AND expires>?',(hashlib.sha256(str(d.get('token','')).encode()).hexdigest(),time.time())).fetchone();require(row,'This reset link is invalid or expired.')
            c.execute('UPDATE users SET password=? WHERE id=?',(password_hash(pw),row['user_id']));c.execute('DELETE FROM resets WHERE user_id=?',(row['user_id'],));c.execute('DELETE FROM sessions WHERE user_id=?',(row['user_id'],));return self.send_json({'ok':True})
        if path=='/api/survey' and method=='GET': return self.send_json({'questions':coach.public_survey()})
        if path=='/api/placement/check' and method=='POST':
            self.throttle('placement',120)
            st=int(num(self.data,'stage',1,5));ans=self.data.get('answers') if isinstance(self.data.get('answers'),dict) else {}
            ok,right,n_q=coach.stage_result(st,ans)
            return self.send_json({'passed':ok,'correct':right,'total':n_q,'stage':coach.STAGES[st],'last':st==max(coach.STAGES)})
        if path=='/api/plan/preview' and method=='POST':
            self.throttle('plan-preview',40)
            try: return self.send_json({'plan':coach.build_plan(d.get('answers'))})
            except ValueError as e: raise ApiError(str(e))
        if path=='/api/events' and method=='POST':
            self.throttle('events',300)
            account.track(c,str(d.get('name','')),d.get('anon'),self.user['id'] if self.user else None,d.get('props') if isinstance(d.get('props'),dict) else None,self.client_day())
            return self.send_json({'ok':True})
        # Strategy charts are public; account data is never public.
        if path=='/api/charts' and method=='GET':
            h17=parse_qs(urlparse(self.path).query).get('h17',['false'])[0]=='true'
            rows=[]
            for label,cards in [(str(n),[10,n-10] if n>=12 else [2,n-2]) for n in range(5,21)]+[(f'A,{n}',[1,n]) for n in range(2,10)]+[(f'{n},{n}',[n,n]) for n in range(1,11)]:
                rows.append({'label':label,'actions':[basic(cards,up,h17) for up in [2,3,4,5,6,7,8,9,10,1]]})
            return self.send_json({'rows':rows,'indices':INDICES})
        self.auth();uid=self.user['id']
        if path=='/api/friends' and method=='GET': return self.send_json(social.friends(c,uid,self.client_day()))
        if path=='/api/friends' and method=='POST':
            self.throttle('follow',60);err=social.follow(c,uid,d.get('username',''));require(not err,err or '')
            return self.send_json(social.friends(c,uid,self.client_day()))
        if path=='/api/friends/remove' and method=='POST':
            social.unfollow(c,uid,d.get('username',''));return self.send_json(social.friends(c,uid,self.client_day()))
        if path=='/api/prefs' and method=='GET': return self.send_json(account.prefs(c,uid))
        if path=='/api/prefs' and method=='POST':
            kw={k:d[k] for k in ('streak_email','news_email') if k in d}
            if 'breakDays' in d: kw['break_until']=time.time()+int(num(d,'breakDays',0,90))*86400
            return self.send_json(account.set_prefs(c,uid,**kw))
        if path=='/api/badges' and method=='GET':
            import badges;return self.send_json(badges.shelf(c,uid,self.client_day()))
        if path=='/api/weakness' and method=='GET': return self.send_json({**learning.weakness(c,uid),'pro':economy.is_pro(c,uid)})
        if path=='/api/skills' and method=='GET': return self.send_json(learning.summary(c,uid,self.client_day()))
        if path=='/api/review' and method=='GET':
            sk=parse_qs(urlparse(self.path).query).get('skill',[None])[0]
            return self.send_json(learning.review(c,uid,economy.is_pro(c,uid),sk if sk in learning.SKILL_NAMES else None))
        if path=='/api/review/dismiss' and method=='POST':
            c.execute('UPDATE mistakes SET cleared=1 WHERE id=? AND user_id=?',(int(num(d,'id',1,10**12)),uid));return self.send_json({'ok':True})
        if path=='/api/review/retry' and method=='POST':
            r=learning.retry(c,uid,int(num(d,'id',1,10**12)),d.get('given'));require(r,'That hand can’t be retried.',404)
            return self.send_json(r)
        if path=='/api/account/export' and method=='GET':
            raw=json.dumps(account.export(c,uid),indent=2,default=str).encode()
            self.send_response(200);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store')
            self.send_header('Content-Disposition','attachment; filename="felt-and-fortune-data.json"');self.cors_headers();self.security_headers()
            self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw);return
        if path=='/api/account/delete' and method=='POST':
            self.throttle('account-delete',5)
            pw=str(d.get('password',''))[:256]
            require(hmac.compare_digest(password_hash(pw,self.user['password'].split(':')[0]),self.user['password']),'That password is incorrect.',400)
            account.delete(c,uid)
            return self.send_json({'ok':True},cookie='ap_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
        if path=='/api/change-password' and method=='POST':
            self.throttle('change-password',10)
            current=str(d.get('current',''))[:256]
            require(hmac.compare_digest(password_hash(current,self.user['password'].split(':')[0]),self.user['password']),'Current password is incorrect.',400)
            password=str(d.get('password',''))
            require(10<=len(password)<=256,'Use 10–256 characters for your new password.')
            c.execute('UPDATE users SET password=? WHERE id=?',(password_hash(password),uid))
            c.execute('DELETE FROM sessions WHERE user_id=?',(uid,))
            c.execute('DELETE FROM resets WHERE user_id=?',(uid,))
            return self.session(c.execute('SELECT * FROM users WHERE id=?',(uid,)).fetchone())
        if path=='/api/profile' and method=='PATCH':
            username=textfield(d,'username',30);require(re.fullmatch(r'[A-Za-z0-9_-]{3,30}',username),'Invalid username.');c.execute('UPDATE users SET username=? WHERE id=?',(username,uid));return self.send_json({'user':public_user(c.execute('SELECT * FROM users WHERE id=?',(uid,)).fetchone())})
        if path=='/api/records' and method=='GET':
            q=parse_qs(urlparse(self.path).query);kind=q.get('kind',[''])[0]
            rows=c.execute('SELECT records.*,users.username FROM records JOIN users ON users.id=records.owner WHERE kind=? ORDER BY created DESC',(kind,)).fetchall()
            return self.send_json({'records':[unpack(r) for r in rows if self.accessible(r) and (not q.get('parent') or r['parent']==q['parent'][0])]})
        if path=='/api/records' and method=='POST':
            kind=d.get('kind');parent=d.get('parent');body=d.get('body',{})
            if kind in ('session','contribution'):
                p=self.record(parent);require(p['kind']=='bankroll' and self.role(parent) in ('owner','editor'),'You cannot edit this bankroll.',403)
            if kind in ('reply','review'):
                p=self.record(parent);require(p['kind']==('thread' if kind=='reply' else 'casino'),'Invalid parent.')
            clean=self.clean_record(kind,body,parent);id=secrets.token_hex(12);now=time.time()
            c.execute('INSERT INTO records VALUES(?,?,?,?,?,?,?)',(id,kind,uid,parent,json.dumps(clean),now,now))
            if kind=='bankroll': c.execute('INSERT INTO members VALUES(?,?,?,?)',(id,uid,'owner',100))
            return self.send_json({'record':unpack(self.record(id))},201)
        if path.startswith('/api/records/') and method in ('PATCH','DELETE'):
            id=path.split('/')[-1];row=self.record(id);require(self.accessible(row,True),'You cannot modify this record.',403)
            if method=='DELETE':
                c.execute('DELETE FROM records WHERE parent=?',(id,));c.execute('DELETE FROM records WHERE id=?',(id,));return self.send_json({'ok':True})
            body=self.clean_record(row['kind'],d.get('body',{}),row['parent'])
            c.execute('UPDATE records SET body=?,updated=? WHERE id=?',(json.dumps(body),time.time(),id));return self.send_json({'record':unpack(self.record(id))})
        if path=='/api/members':
            bid=d.get('bankroll') if method!='GET' else parse_qs(urlparse(self.path).query).get('bankroll',[''])[0]
            require(self.role(bid),'Bankroll not found.',404)
            if method=='GET': return self.send_json({'members':[dict(r) for r in c.execute('SELECT members.*,users.username FROM members JOIN users ON users.id=members.user_id WHERE bankroll=?',(bid,))]})
            require(self.role(bid)=='owner','Only the bankroll owner can change access.',403)
            target=c.execute('SELECT id FROM users WHERE username=?',(d.get('username',''),)).fetchone();require(target,'Ask the teammate to create an account first.',404)
            require(target['id']!=uid,'The owner cannot be removed or demoted.')
            if method=='DELETE':
                c.execute('DELETE FROM members WHERE bankroll=? AND user_id=?',(bid,target['id']))
                others=c.execute("SELECT SUM(share) FROM members WHERE bankroll=? AND role!='owner'",(bid,)).fetchone()[0] or 0
                c.execute("UPDATE members SET share=? WHERE bankroll=? AND role='owner'",(100-others,bid))
                return self.send_json({'ok':True})
            require(method=='POST','Method not allowed.',405);role=d.get('role','viewer');require(role in ('viewer','editor'),'Invalid role.')
            share=num(d,'share',0,100)
            c.execute('INSERT INTO members VALUES(?,?,?,?) ON CONFLICT(bankroll,user_id) DO UPDATE SET role=excluded.role,share=excluded.share',(bid,target['id'],role,share))
            others=c.execute("SELECT SUM(share) FROM members WHERE bankroll=? AND role!='owner'",(bid,)).fetchone()[0] or 0
            require(others<=100,'Team profit shares cannot exceed 100%.')
            c.execute("UPDATE members SET share=? WHERE bankroll=? AND role='owner'",(100-others,bid));return self.send_json({'ok':True})
        if path=='/api/messages' and method=='GET':
            rows=c.execute('SELECT messages.*,a.username sender_name,b.username recipient_name FROM messages JOIN users a ON a.id=sender JOIN users b ON b.id=recipient WHERE sender=? OR recipient=? ORDER BY created',(uid,uid));return self.send_json({'messages':[dict(r) for r in rows]})
        if path=='/api/messages' and method=='POST':
            self.throttle('message',60);target=c.execute('SELECT id FROM users WHERE username=?',(d.get('recipient',''),)).fetchone();require(target,'User not found.',404)
            c.execute('INSERT INTO messages VALUES(?,?,?,?,?)',(secrets.token_hex(12),uid,target['id'],textfield(d,'text',10000),time.time()));return self.send_json({'ok':True})
        if path=='/api/drill/new' and method=='POST':
            mode=d.get('mode','basic');require(mode in ('basic','count','deviation','decks','true-count','checkout','career'),'Unknown drill.')
            # Only one pending challenge per mode, preventing answer mining for career points.
            c.execute('DELETE FROM challenges WHERE user_id=? AND answered=0 AND mode=?',(uid,mode))
            import random
            rng=random.SystemRandom();exercise=rng.choice(['basic','count','deviation','decks','true-count']) if mode in ('checkout','career') else mode
            body={'exercise':exercise,'h17':bool(d.get('h17',False))}
            if exercise=='count':
                cards=[rng.randint(1,13) for _ in range(10)];body['cards']=cards;answer=str(sum(hilo(x) for x in cards))
            elif exercise=='decks':
                half=rng.randint(1,11);body['halves']=half;answer=str(half/2)
            elif exercise=='true-count':
                rc=rng.randint(-20,25);remaining=rng.choice([1,1.5,2,2.5,3,4]);body.update({'running':rc,'remaining':remaining});answer=str(math.floor(rc/remaining))
            elif exercise=='deviation':
                hand,up,index,action=rng.choice(INDICES);cards=[10,hand-10] if hand>=12 else [4,hand-4];tc=rng.randint(-3,7)
                body.update({'cards':cards,'dealer':up,'tc':tc,'index':index});answer=deviation(cards,up,tc)
                body.pop('index')
            else:
                cards=[rng.randint(1,13),rng.randint(1,13)]
                while total(cards)[0]==21: cards=[rng.randint(1,13),rng.randint(1,13)]
                up=rng.randint(1,13);body.update({'cards':cards,'dealer':up});answer=basic(cards,up,body['h17'])
            id=secrets.token_hex(12);c.execute('INSERT INTO challenges(id,user_id,mode,body,answer,created) VALUES(?,?,?,?,?,?)',(id,uid,mode,json.dumps(body),answer,time.time()))
            return self.send_json({'id':id,**body})
        if path=='/api/drill/answer' and method=='POST':
            row=c.execute('SELECT * FROM challenges WHERE id=? AND user_id=?',(d.get('id'),uid)).fetchone();require(row and not row['answered'],'This exercise has already been answered or expired.')
            require(time.time()-row['created']<3600,'This exercise expired. Start a new one.')
            supplied=str(d.get('answer','')).strip();expected=row['answer']
            try: correct=abs(float(supplied)-float(expected))<.001
            except ValueError: correct=supplied==expected
            c.execute('UPDATE challenges SET answered=1,correct=? WHERE id=?',(int(correct),row['id']))
            return self.send_json({'correct':correct,'answer':expected,'seconds':round(time.time()-row['created'],1)})
        if path=='/api/progress' and method=='GET':
            rows=c.execute('SELECT mode,COUNT(*) attempts,SUM(correct) correct FROM challenges WHERE user_id=? AND answered=1 GROUP BY mode',(uid,))
            return self.send_json({'progress':[dict(r) for r in rows]})
        if path=='/api/leaderboard' and method=='GET':
            rows=c.execute("SELECT users.username,COUNT(*) attempts,SUM(correct)*10 score FROM challenges JOIN users ON users.id=user_id WHERE mode='career' AND answered=1 GROUP BY user_id ORDER BY score DESC,attempts ASC LIMIT 50")
            return self.send_json({'players':[dict(r) for r in rows]})
        if path.startswith('/api/path'): return self.path_api(path,method)
        if path=='/api/me/economy' or path.split('/')[2] in ('energy','quests','streak','league','store','billing'): return self.economy_api(path,method,require,ApiError)
        if path=='/api/feedback' and method=='POST':
            self.throttle('feedback',30)
            rating=int(num(d,'rating',1,5));area=str(d.get('area','other'));require(area in ('signup','lesson','practice','track','community','other'),'Choose what you were doing.')
            c.execute('INSERT INTO feedback(user_id,rating,area,page,comment,created) VALUES(?,?,?,?,?,?)',(uid,rating,area,textfield(d,'page',100,False),textfield(d,'comment',2000,False),time.time()))
            return self.send_json({'ok':True},201)
        if path.startswith('/api/practice/') or path.startswith('/api/challenge/'): return self.practice_api(path,method,require,num,ApiError)
        if path=='/api/casinos' and method=='GET':
            # The casino map's data is a Pro feature: never served as a public file.
            require(economy.is_pro(c,self.user['id']),'The Casino Map is part of Felt & Fortune Pro.',402)
            return self.send_json(json.loads((ROOT/'content'/'casinos.json').read_text(encoding='utf-8')))
        if path=='/api/simulate' and method=='POST':
            require(economy.is_pro(c,self.user['id']),'The Bankroll Simulator is part of Felt & Fortune Pro.',402)
            self.throttle('simulate',10)
            with JOB_LOCK:
                for k in list(JOBS):
                    if time.time()-JOBS[k]['created']>3600: del JOBS[k]
                require(sum(j['status']=='running' for j in JOBS.values())<2,'Two simulations are already running. Try again shortly.',429)
                require(not any(j['user']==uid and j['status']=='running' for j in JOBS.values()),'Your simulation is already running.',409)
                id=secrets.token_hex(12);JOBS[id]={'user':uid,'status':'running','created':time.time()}
            config=dict(d)
            def work():
                try:
                    result=simulate(config)
                    with JOB_LOCK: JOBS[id].update({'status':'done','result':result})
                except Exception as e:
                    with JOB_LOCK: JOBS[id].update({'status':'error','error':str(e) if isinstance(e,(ValueError,TypeError)) else 'Simulation failed.'})
            threading.Thread(target=work,daemon=True).start();return self.send_json({'id':id},202)
        if path.startswith('/api/simulate/') and method=='GET':
            with JOB_LOCK:
                job=JOBS.get(path.split('/')[-1]);require(job and job['user']==uid,'Simulation not found.',404);return self.send_json({k:v for k,v in job.items() if k not in ('user','created')})
        raise ApiError('Endpoint not found.',404)

    # ---- Learning path ---------------------------------------------------
    def load_plan(self):
        row=self.c.execute('SELECT plan,answers FROM plans WHERE user_id=?',(self.user['id'],)).fetchone()
        if not row: return None
        plan=json.loads(row['plan'])
        if plan.get('version',1)<3 or plan.get('track') not in coach.TRACKS:
            # Older plans (single track, test-outs): rebuild as one full path. Lesson ids are unchanged, so progress is kept.
            plan=coach.build_plan(json.loads(row['answers']))
            self.c.execute('UPDATE plans SET plan=?,updated=? WHERE user_id=?',(json.dumps(plan),time.time(),self.user['id']))
        return plan
    def client_day(self):
        raw=parse_qs(urlparse(self.path).query).get('day',[''])[0] or str(self.data.get('day',''))
        server_day=date.today()
        try:
            day=date.fromisoformat(raw)
            if abs((day-server_day).days)<=1: return day.isoformat()
        except ValueError: pass
        return server_day.isoformat()
    def path_state(self,plan):
        c=self.c;uid=self.user['id']
        done={r['lesson_id']:r['best'] for r in c.execute('SELECT lesson_id,best FROM lesson_progress WHERE user_id=?',(uid,))}
        order=coach.lesson_order(plan)
        placed=set(plan.get('placed') or plan.get('testedOut') or [])
        tested={l for u in placed for l in [x['id'] for x in coach.UNIT_BY_ID[u]['lessons']]+[u+'-checkpoint',u+'-review'] if u in coach.UNIT_BY_ID}
        today=self.client_day()
        passes={}
        for r in c.execute('SELECT lesson_id,day FROM checkpoint_passes WHERE user_id=?',(uid,)): passes.setdefault(r['lesson_id'],set()).add(r['day'])
        if PACING['checkpoints']:
            for cp,ds in passes.items(): done.setdefault(cp,100)
        else:
            done.update({l:100 for l in order if l.endswith('-checkpoint') and l not in done})
        units=coach.path_units(plan)
        ratings={r['skill']:r['rating'] for r in c.execute('SELECT skill,rating FROM skill_rating WHERE user_id=?',(uid,))}
        pro=economy.is_pro(c,uid)
        if not pro:
            # Free learners get every free unit first, then one solid block of Pro units (never Pro, free, Pro again).
            units=[u for u in units if not u['pro']]+[u for u in units if u['pro']]
            order=[l['id'] for u in units for l in u['lessons']]
        # Free learners skip past Pro units and keep going through the free ones.
        pro_lessons=set() if pro else {l['id'] for u in units if u['pro'] for l in u['lessons']}
        current=next((l for l in order if l not in done and l not in tested and l not in pro_lessons),None)
        cur_i=order.index(current) if current else len(order)
        firsts={r['lesson_id']:r['day'] for r in c.execute('SELECT lesson_id,day FROM lesson_first WHERE user_id=?',(uid,))}
        new_today=sum(1 for l,day in firsts.items() if day==today and not l.endswith(('-review','-checkpoint')))
        pacing={'newToday':new_today,'dailyNew':PACING['daily_new']}
        for u in units:
            for l in u['lessons']:
                if l['id'] in done: l['status']='done';l['best']=done[l['id']]
                elif l['id'] in tested: l['status']='tested'
                elif l['id'] in pro_lessons: l['status']='pro'
                elif l['id']==current: l['status']='current'
                else: l['status']='locked' if order.index(l['id'])>cur_i else 'open'
                if l.get('checkpoint'):
                    # Checkpoints open once the unit's skill ratings reach their targets: practice raises them.
                    l['gate']=[{**gt,'name':learning.SKILL_NAMES.get(gt['skill'],gt['skill']),'rating':round(ratings.get(gt['skill'],learning.START)),
                                'met':ratings.get(gt['skill'],learning.START)>=gt['target']} for gt in u['gate']]
                    if l['status']=='current' and not all(x['met'] for x in l['gate']):
                        l['status']='gated';pacing['blocked']='checkpoint-gate';pacing['gate']=l['gate']
        economy.apply_freezes(c,uid,today)
        streak=economy.streak_info(c,uid,today)[0]
        by_day=dict(c.execute('SELECT day,SUM(xp) FROM xp_log WHERE user_id=? GROUP BY day',(uid,)).fetchall())
        week=[{'day':(date.fromisoformat(today)-timedelta(days=i)).isoformat()} for i in range(6,-1,-1)]
        for w in week: w['xp']=by_day.get(w['day'],0)
        finished=sum(1 for l in order if l in done and l not in tested)
        tracks=[]
        if not current and pro_lessons: pacing['blocked']='pro'
        return {'plan':plan,'units':units,'current':current,'tracks':tracks,'pacing':pacing,'pro':pro,'stats':{'xp':sum(by_day.values()),'todayXp':by_day.get(today,0),'dailyXp':plan['dailyXp'],'streak':streak,'week':week,'done':finished,'total':sum(1 for l in order if l not in tested),'placed':len(placed)}}
    def path_api(self,path,method):
        c=self.c;uid=self.user['id'];d=self.data
        if path=='/api/path' and method=='GET':
            plan=self.load_plan()
            return self.send_json(self.path_state(plan) if plan else {'plan':None})
        if path=='/api/path/plan' and method=='POST':
            self.throttle('plan',30)
            try: answers=coach.validate_answers(d.get('answers'));plan=coach.build_plan(answers)
            except ValueError as e: raise ApiError(str(e))
            require(not c.execute('SELECT 1 FROM lesson_progress WHERE user_id=? LIMIT 1',(uid,)).fetchone(),'Your path is set once you start learning. It already covers the whole course.',409)
            now=time.time()
            c.execute('INSERT INTO plans VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET answers=excluded.answers,plan=excluded.plan,updated=excluded.updated',(uid,json.dumps(answers),json.dumps(plan),now,now))
            return self.send_json(self.path_state(plan))
        if path=='/api/path/track' and method=='POST':
            raise ApiError('Paths can’t be switched. Every path covers the whole course; yours is ordered for your goals.',410)
        if path=='/api/path/goal' and method=='POST':
            plan=self.load_plan();require(plan,'Build your plan first.',409)
            minutes=int(num(d,'minutes',5,20));require(minutes in (5,10,15,20),'Choose 5, 10, 15, or 20 minutes.')
            state=self.path_state(plan)
            remaining=sum(1 for u in state['units'] for l in u['lessons'] if l['status'] in ('current','open','locked'))
            per={5:1,10:2,15:3,20:4}[minutes];days=max(1,-(-remaining//per))
            plan.update(minutes=minutes,lessonsPerDay=per,dailyXp=per*15,remainingLessons=remaining,days=days,finish=(date.today()+timedelta(days=days)).isoformat())
            c.execute('UPDATE plans SET plan=?,updated=? WHERE user_id=?',(json.dumps(plan),time.time(),uid))
            return self.send_json(self.path_state(plan))
        m=re.fullmatch(r'/api/path/lesson/([a-z0-9-]{2,24})(/complete)?',path)
        require(m,'Endpoint not found.',404)
        plan=self.load_plan();require(plan,'Build your plan first.',409)
        unit,lesson=coach.find_lesson(m[1]);require(lesson and m[1] in coach.lesson_order(plan),'Lesson not found.',404)
        state=self.path_state(plan)
        status=next(l['status'] for u in state['units'] for l in u['lessons'] if l['id']==m[1])
        require(status!='locked','Finish the earlier lessons to unlock this one.',403)
        require(status!='pro','This unit is part of Felt & Fortune Pro.',402)
        if status=='gated':
            need=next(l['gate'] for u in state['units'] for l in u['lessons'] if l['id']==m[1])
            raise ApiError('Raise '+' and '.join(f"{x['name']} to {x['target']}" for x in need if not x['met'])+' to open this checkpoint. Practice or replay this unit’s lessons.',423)
        if status=='rest':
            msg={'daily-cap':f'You’ve learned {PACING["daily_new"]} new lessons today. New lessons stick better with sleep in between, so the next one opens tomorrow. Practice and reviews are open now.',
                 'checkpoint-wait':'Checkpoints open the day after you finish a unit, so you’re showing what you remember, not what you just saw.',
                 'checkpoint-again':'Nice pass! Pass this checkpoint once more on a different day to unlock the next unit.'}[state['pacing'].get('blocked','daily-cap')]
            raise ApiError(msg,423)
        if not m[2]:
            require(method=='GET','Method not allowed.',405)
            if not economy.has_energy(c,uid): return self.send_json({'error':'You’re out of Energy for now.','outOfEnergy':True},402)
            steps=coach.resolve_steps(lesson['steps'],style=plan.get('style','mix'))
            return self.send_json({'lesson':{'id':lesson['id'],'title':lesson['title'],'unit':{'id':unit['id'],'title':unit['title'],'color':unit['color'],'tool':unit['tool']},'steps':steps}})
        require(method=='POST','Method not allowed.',405)
        self.throttle('lesson-complete',120)
        # The server re-grades every answer; the browser's own score is not trusted.
        choices={s['prompt']:s['answer'] for s in lesson['steps'] if s['type']=='choice'}
        try: originals,first,_,skills=grade_transcript(d.get('results'),choices)
        except BadTranscript as e: raise ApiError(str(e))
        require(originals==coach.expected_questions(lesson['steps'],plan.get('style','mix')),'These lesson results are incomplete. Please finish the lesson again.')
        record_skills(c,uid,skills)
        learning.record(c,uid,d['results'],choices,'lesson:'+m[1],self.client_day())
        from practice_api import grade_item
        energy_result=economy.settle(c,uid,[grade_item(it,choices) for it in d['results']])
        accuracy=round(100*first/originals)
        today=self.client_day()
        if lesson.get('checkpoint'):
            passed=accuracy>=coach.CHECKPOINT_PASS
            if passed: c.execute('INSERT OR IGNORE INTO checkpoint_passes VALUES(?,?,?,?)',(uid,m[1],today,accuracy));quests.record(c,uid,today,'checkpoint',pct=accuracy)
            xp=10 if passed else 5
            c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)',(uid,today,xp,m[1],time.time()))
            stars=economy.add_stars(c,uid,10,'checkpoint',today) if passed else 0
            stars+=self.goal_bonus(plan,today,xp)
            return self.send_json({'xp':xp,'accuracy':accuracy,'first':False,'checkpoint':{'passed':passed,'need':coach.CHECKPOINT_PASS},'stars':stars,'energy':energy_result,**self.path_state(plan)})
        first=c.execute('SELECT 1 FROM lesson_progress WHERE user_id=? AND lesson_id=?',(uid,m[1])).fetchone() is None
        xp=(10 if first else 5)+(5 if accuracy==100 else 0)
        c.execute('INSERT INTO lesson_progress VALUES(?,?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET best=MAX(best,excluded.best),completions=completions+1,updated=excluded.updated',(uid,m[1],accuracy,1,time.time()))
        c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)',(uid,today,xp,m[1],time.time()))
        quests.record(c,uid,today,'lesson',tool=None if first else 'replay',pct=accuracy)
        stars=0
        if first:
            c.execute('INSERT OR IGNORE INTO lesson_first VALUES(?,?,?)',(uid,m[1],today))
            account.track(c,'lesson_complete',None,uid,{'lesson':m[1]},today)
            if c.execute('SELECT COUNT(*) FROM lesson_first WHERE user_id=?',(uid,)).fetchone()[0]==1: account.track(c,'first_lesson',None,uid,None,today)
            stars+=economy.add_stars(c,uid,10,'lesson',today)
        stars+=self.goal_bonus(plan,today,xp)
        return self.send_json({'xp':xp,'accuracy':accuracy,'first':first,'stars':stars,'energy':energy_result,**self.path_state(plan)})
    def goal_bonus(self,plan,today,just_earned):
        """20 Stars the moment today's XP first reaches the daily goal."""
        total=self.c.execute('SELECT COALESCE(SUM(xp),0) FROM xp_log WHERE user_id=? AND day=?',(self.user['id'],today)).fetchone()[0]
        goal=plan.get('dailyXp',15) if plan else 15
        if total>=goal and total-just_earned<goal: return economy.add_stars(self.c,self.user['id'],20,'daily-goal',today)
        return 0

def reminder_loop():
    """Trial-ending and renewal notices, checked every hour."""
    while True:
        try:
            with db() as c: account.run_reminders(c)
        except Exception as e: print('reminders', type(e).__name__, e)
        time.sleep(3600)

if __name__=='__main__':
    initialize()
    threading.Thread(target=reminder_loop,daemon=True).start()
    host=os.environ.get('HOST','127.0.0.1');port=int(os.environ.get('PORT','8000'))
    print(f'Felt & Fortune free preview: http://{host}:{port}',flush=True)
    ThreadingHTTPServer((host,port),Handler).serve_forever()
