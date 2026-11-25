import unittest, tempfile, threading, json, urllib.request, urllib.error, http.cookiejar, time, hashlib
from http.server import ThreadingHTTPServer
import server


class Client:
    def __init__(self,base):
        self.base=base;self.jar=http.cookiejar.CookieJar();self.opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))
    def call(self,path,method='GET',body=None,origin=None):
        headers={'Content-Type':'application/json'}
        if origin: headers['Origin']=origin
        req=urllib.request.Request(self.base+path,data=json.dumps(body or {}).encode() if method!='GET' else None,headers=headers,method=method)
        try:
            with self.opener.open(req) as res: return res.status,json.load(res)
        except urllib.error.HTTPError as e: return e.code,json.load(e)

class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory();cls.previous=server.DB_PATH;server.DB_PATH=cls.tmp.name+'/test.sqlite';server.initialize()
        cls.http=ThreadingHTTPServer(('127.0.0.1',0),server.Handler);cls.base='http://127.0.0.1:'+str(cls.http.server_port)
        cls.thread=threading.Thread(target=cls.http.serve_forever,daemon=True);cls.thread.start()
        server.Handler.log_message=lambda *args:None
    @classmethod
    def tearDownClass(cls):
        cls.http.shutdown();cls.http.server_close();server.DB_PATH=cls.previous;cls.tmp.cleanup()
    def setUp(self):
        with server.RATE_LOCK: server.RATE.clear()
        self.prefix=server.secrets.token_hex(4)
        self.a=self.create('alice');self.b=self.create('bob');self.c=self.create('carol')
        self.bank=self.a.call('/api/records?kind=bankroll')[1]['records'][0]['id']
    def create(self,name):
        client=Client(self.base);client.username=name+self.prefix
        status,result=client.call('/api/signup','POST',{'username':client.username,'email':client.username+'@example.test','password':'Test-password-only-42'})
        self.assertEqual(status,200,result);client.user=result['user'];return client
    def record(self,client,kind,body,parent=None): return client.call('/api/records','POST',{'kind':kind,'body':body,'parent':parent})
    def session(self,client=None):
        return self.record(client or self.a,'session',{'date':'2026-09-14','game':'Blackjack','hours':2,'profit':100,'ev':25,'fields':{'table':'A'}},self.bank)
    def member(self,role='viewer',share=20): return self.a.call('/api/members','POST',{'bankroll':self.bank,'username':self.b.username,'role':role,'share':share})
    def test_native_app_uses_bearer_token(self):
        app='capacitor://localhost'
        def call(path,method='GET',body=None,token=None):
            headers={'Content-Type':'application/json','Origin':app}
            if token: headers['Authorization']='Bearer '+token
            req=urllib.request.Request(self.base+path,data=json.dumps(body or {}).encode() if method!='GET' else None,headers=headers,method=method)
            try:
                with urllib.request.urlopen(req) as res: return res.status,json.load(res),res.headers
            except urllib.error.HTTPError as e: return e.code,json.load(e),e.headers
        status,body,headers=call('/api/login','POST',{'email':self.a.username+'@example.test','password':'Test-password-only-42'})
        self.assertEqual(status,200);token=body['token']
        self.assertIsNone(headers.get('Set-Cookie'));self.assertEqual(headers.get('Access-Control-Allow-Origin'),app)
        self.assertEqual(call('/api/me',token=token)[1]['user']['username'],self.a.username)
        self.assertIsNone(call('/api/me')[1]['user'])
        self.assertEqual(call('/api/logout','POST',token=token)[0],200)
        self.assertIsNone(call('/api/me',token=token)[1]['user'])
        # The website never receives a token in the response body.
        self.assertNotIn('token',self.a.call('/api/login','POST',{'email':self.a.username+'@example.test','password':'Test-password-only-42'})[1])
        req=urllib.request.Request(self.base+'/api/me',method='OPTIONS',headers={'Origin':'https://evil.example'})
        with self.assertRaises(urllib.error.HTTPError): urllib.request.urlopen(req)
    def test_auth_cookie_and_logout(self):
        self.assertTrue(any(c.name=='ap_session' and c.has_nonstandard_attr('HttpOnly') for c in self.a.jar))
        self.assertEqual(self.a.call('/api/logout','POST')[0],200)
        self.assertEqual(self.a.call('/api/records?kind=session')[0],401)
        self.assertEqual(self.a.call('/api/login','POST',{'email':self.a.username+'@example.test','password':'wrong'})[0],401)
        self.assertEqual(self.a.call('/api/login','POST',{'email':self.a.username+'@example.test','password':'Test-password-only-42'})[0],200)
    def test_change_password_revokes_other_sessions(self):
        second=Client(self.base)
        second.call('/api/login','POST',{'email':self.a.username+'@example.test','password':'Test-password-only-42'})
        self.assertEqual(self.a.call('/api/change-password','POST',{'current':'wrong','password':'Replacement-test-only-42'})[0],400)
        self.assertEqual(self.a.call('/api/change-password','POST',{'current':'Test-password-only-42','password':'Replacement-test-only-42'})[0],200)
        self.assertEqual(second.call('/api/records?kind=bankroll')[0],401)
        self.assertEqual(self.a.call('/api/records?kind=bankroll')[0],200)
        self.assertEqual(second.call('/api/login','POST',{'email':self.a.username+'@example.test','password':'Test-password-only-42'})[0],401)
        self.assertEqual(second.call('/api/login','POST',{'email':self.a.username+'@example.test','password':'Replacement-test-only-42'})[0],200)
    def test_invalid_calendar_currency_and_record_body(self):
        self.assertEqual(self.record(self.a,'session',{'date':'2026-02-30','game':'Blackjack'},self.bank)[0],400)
        self.assertEqual(self.record(self.a,'bankroll',{'name':'Invalid','currency':'$'})[0],400)
        self.assertEqual(self.record(self.a,'session','bad',self.bank)[0],400)
    def test_private_record_isolation(self):
        status,r=self.session();self.assertEqual(status,201)
        self.assertEqual(self.b.call('/api/records?kind=session')[1]['records'],[])
        self.assertEqual(self.b.call('/api/records/'+r['record']['id'],'DELETE')[0],403)
        self.assertEqual(self.b.call('/api/members?bankroll='+self.bank)[0],404)
    def test_owner_editor_viewer_permissions(self):
        self.assertEqual(self.member()[0],200)
        self.assertEqual(self.session(self.b)[0],403)
        self.member('editor')
        status,r=self.session(self.b);self.assertEqual(status,201)
        self.assertEqual(self.a.call('/api/records/'+r['record']['id'],'PATCH',{'body':{'date':'2026-09-15','game':'Poker','hours':4,'profit':-200,'ev':10}})[0],200)
        own=self.session()[1]['record']
        self.assertEqual(self.b.call('/api/records/'+own['id'],'DELETE')[0],403)
        self.assertEqual(len(self.b.call('/api/records?kind=session')[1]['records']),2)
        self.assertEqual(self.b.call('/api/members','POST',{'bankroll':self.bank,'username':self.c.username})[0],403)
    def test_revoking_membership_hides_data(self):
        self.session();self.member()
        self.assertEqual(len(self.b.call('/api/records?kind=session')[1]['records']),1)
        self.a.call('/api/members','DELETE',{'bankroll':self.bank,'username':self.b.username})
        self.assertEqual(self.b.call('/api/records?kind=session')[1]['records'],[])
    def test_shares_are_normalized_and_reject_overallocation(self):
        self.member('editor',40)
        members=self.a.call('/api/members?bankroll='+self.bank)[1]['members'];self.assertEqual(sum(m['share'] for m in members),100)
        self.assertEqual(self.a.call('/api/members','POST',{'bankroll':self.bank,'username':self.c.username,'role':'editor','share':80})[0],400)
        members=self.a.call('/api/members?bankroll='+self.bank)[1]['members'];self.assertEqual(len(members),2)
    def test_messages_only_visible_to_participants(self):
        self.assertEqual(self.a.call('/api/messages','POST',{'recipient':self.b.username,'text':'Test message'})[0],200)
        self.assertEqual(len(self.b.call('/api/messages')[1]['messages']),1)
        self.assertEqual(self.c.call('/api/messages')[1]['messages'],[])
    def test_forum_and_reviews_are_shared(self):
        status,r=self.record(self.a,'thread',{'title':'Test thread','category':'General','text':'Test content'});self.assertEqual(status,201)
        id=r['record']['id']
        self.assertEqual(self.record(self.b,'reply',{'text':'Test reply'},id)[0],201)
        self.assertEqual(len(self.c.call('/api/records?kind=reply&parent='+id)[1]['records']),1)
        self.assertEqual(self.b.call('/api/records/'+id,'DELETE')[0],403)
        self.a.call('/api/records/'+id,'DELETE');self.assertEqual(self.c.call('/api/records?kind=reply&parent='+id)[1]['records'],[])
    def test_training_answer_replay_and_spoofing(self):
        q=self.a.call('/api/drill/new','POST',{'mode':'career'})[1]
        self.assertNotIn('answer',q)
        self.assertEqual(self.b.call('/api/drill/answer','POST',{'id':q['id'],'answer':'H'})[0],400)
        answer=self.a.call('/api/drill/answer','POST',{'id':q['id'],'answer':'H','correct':True})
        self.assertEqual(answer[0],200)
        self.assertEqual(self.a.call('/api/drill/answer','POST',{'id':q['id'],'answer':'H'})[0],400)
        progress=self.a.call('/api/progress')[1]['progress'];self.assertEqual(progress[0]['attempts'],1)
    def test_json_origin_and_validation(self):
        self.assertEqual(self.a.call('/api/profile','PATCH',{'username':'ValidName'},origin='https://evil.example')[0],403)
        host=self.base.split('//')[1]
        self.assertEqual(self.a.call('/api/feedback','POST',{'rating':4,'area':'other'},origin='https://'+host)[0],201)
        self.assertEqual(self.record(self.a,'session',{'date':'bad','game':'B','hours':-2,'profit':0,'ev':0},self.bank)[0],400)
        self.assertEqual(self.record(self.a,'bankroll',{'name':'Bad','initial':float('nan'),'currency':'USD'})[0],400)
    def test_reset_token_single_use_and_session_revocation(self):
        token='test-reset-token';digest=hashlib.sha256(token.encode()).hexdigest()
        with server.db() as c: c.execute('INSERT INTO resets VALUES(?,?,?)',(digest,self.a.user['id'],time.time()+60))
        anon=Client(self.base)
        self.assertEqual(anon.call('/api/reset-password','POST',{'token':token,'password':'New-test-password-123'})[0],200)
        self.assertEqual(self.a.call('/api/records?kind=session')[0],401)
        self.assertEqual(anon.call('/api/reset-password','POST',{'token':token,'password':'Another-test-password'})[0],400)
    def test_simulation_job_access_and_completion(self):
        status,job=self.a.call('/api/simulate','POST',{'rounds':1000,'seed':12});self.assertEqual(status,202)
        path='/api/simulate/'+job['id'];self.assertEqual(self.b.call(path)[0],404)
        for _ in range(100):
            result=self.a.call(path)[1]
            if result['status']!='running': break
            time.sleep(.02)
        self.assertEqual(result['status'],'done');self.assertEqual(result['result']['rounds'],1000)
    def test_public_routes_and_no_billing_gate(self):
        anon=Client(self.base)
        self.assertEqual(anon.call('/api/charts')[0],200)
        with urllib.request.urlopen(self.base+'/dashboard/training/basic') as res:
            self.assertIn(b'Felt & Fortune',res.read());self.assertIn("script-src 'self'",res.headers['Content-Security-Policy'])
        self.assertEqual(self.a.call('/api/records?kind=bankroll')[0],200)

if __name__=='__main__': unittest.main()
