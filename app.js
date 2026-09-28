const DB='decodearena_db_v2',SESSION='decodearena_session_v2';
const missions=[
{id:'m1',t:'Python Logic: Bitwise Masking',c:'coding',d:'HARD',xp:400,min:30},
{id:'m2',t:'German B2: Technical Vocabulary',c:'language',d:'MEDIUM',xp:250,min:15},
{id:'m3',t:'Logical Reasoning: Syllogisms',c:'logic',d:'EASY',xp:150,min:12},
{id:'m4',t:'Java: Array Optimization',c:'coding',d:'MEDIUM',xp:300,min:20}];
const badges=[['🏆','First Solver','Complete a mission'],['⚡','Speed Demon','Complete a challenge'],['🛡️','Squad Member','Join the squad'],['🔥','Streak Starter','Reach a 3-day streak']];
const $=id=>document.getElementById(id);
const db=()=>JSON.parse(localStorage.getItem(DB)||'{"users":[]}');
const save=x=>localStorage.setItem(DB,JSON.stringify(x));
const user=()=>{let e=localStorage.getItem(SESSION);return db().users.find(x=>x.email===e)};
const rank=x=>x>=5000?'Champion':x>=2500?'Elite':x>=1000?'Pro':x>=500?'Advanced':x>=100?'Novice':'Recruit';
const next=x=>{for(const [n,r] of [[100,'Novice'],[500,'Advanced'],[1000,'Pro'],[2500,'Elite'],[5000,'Champion']])if(x<n)return[r,n-x];return['Champion',0]};
const update=(u)=>{let d=db(),i=d.users.findIndex(x=>x.email===u.email);d.users[i]=u;save(d)};
const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[x]));
function toast(s){let e=document.createElement('div');e.className='toast';e.textContent=s;document.body.appendChild(e);setTimeout(()=>e.remove(),2500)}
function modal(s){$('modalBody').innerHTML=s;$('modal').classList.remove('hide')}
function close(){ $('modal').classList.add('hide') }

$('signupForm').onsubmit=e=>{e.preventDefault();let d=db(),email=$('email').value.trim().toLowerCase();if(d.users.some(x=>x.email===email)){ $('signupMsg').textContent='Email already registered. Please login.';return}let u={id:Date.now(),name:$('name').value.trim(),email,dob:$('dob').value,password:$('password').value,xp:0,streak:0,done:[]};d.users.push(u);save(d);localStorage.setItem(SESSION,email);open();toast('Account created successfully!')};
$('loginForm').onsubmit=e=>{e.preventDefault();let email=$('lemail').value.trim().toLowerCase(),u=db().users.find(x=>x.email===email&&x.password===$('lpassword').value);if(!u){$('loginMsg').textContent='Incorrect email or password.';return}localStorage.setItem(SESSION,email);open();toast('Welcome back!')};
$('loginLink').onclick=()=>{$('signup').classList.add('hide');$('login').classList.remove('hide')};
$('signupLink').onclick=()=>{$('login').classList.add('hide');$('signup').classList.remove('hide')};
function open(){$('auth').classList.add('hide');$('app').classList.remove('hide');nav('dashboard')}
function logout(){localStorage.removeItem(SESSION);location.reload()}
function render(){
 let u=user();if(!u)return;
 let d=db(),sorted=[...d.users].sort((a,b)=>b.xp-a.xp),pos=sorted.findIndex(x=>x.email===u.email)+1,n=next(u.xp),done=u.done.length,goal=Math.min(100,done/4*100);
 $('welcome').textContent=u.name;$('topXP').textContent=u.xp.toLocaleString();$('topStreak').textContent=u.streak;$('topLevel').textContent=rank(u.xp);$('rankText').textContent='Rank: '+rank(u.xp);$('rank').textContent='#'+pos;$('xp').textContent=u.xp;$('streak').textContent=u.streak;$('goal').textContent=goal+'%';$('goalText').textContent=done+' of 4 missions done';$('nextRank').textContent=n[0];$('remaining').textContent=n[1]?'('+n[1]+' XP remaining)':'';
 $('xpbar').style.width=(u.xp%500)/5+'%';$('weekly').textContent=Math.min(35000,u.xp*2).toLocaleString()+' / 35,000 XP';$('weeklybar').style.width=Math.min(100,u.xp/175)+'%';$('sideXP').textContent=(u.xp*2).toLocaleString()+' XP';
 $('dots').innerHTML=['M','T','W','T','F','S','S'].map((x,i)=>`<span style="display:inline-flex;width:18px;height:18px;border-radius:50%;margin-right:4px;border:1px solid #adc6ff;align-items:center;justify-content:center;font-size:9px;background:${i<u.streak?'#4d8eff55':'transparent'}">${x}</span>`).join('');
 renderMissions('all');$('roster').innerHTML=[[u.name+' (You)',u.xp],['Maya Lin',1920],['David K.',1400],['Priya Sharma',1180],['Chen Wei',900]].map(x=>`<div class="member"><span>${esc(x[0])}</span><b>+${x[1].toLocaleString()} XP</b></div>`).join('');
 let sk=[['Coding',Math.min(95,25+u.xp/50)],['Logic',Math.min(90,25+u.xp/60)],['Languages',Math.min(85,40+u.xp/100)],['Decision Making',Math.min(92,30+u.xp/55)]];$('skills').innerHTML=sk.map(x=>`<div class="skill"><div class="skillhead"><span>${x[0]}</span><span>${Math.round(x[1])}%</span></div><div class="bar"><span style="width:${x[1]}%"></span></div></div>`).join('');
 $('badges').innerHTML=badges.map(x=>`<div class="badge">${x[0]} <b>${x[1]}</b><small>${x[2]}</small></div>`).join('');
}
function renderMissions(filter){
 let u=user();$('missions').innerHTML=missions.filter(m=>filter==='all'||m.c===filter).map(m=>{let done=u.done.includes(m.id);return`<div class="mission ${done?'done':''}"><div><h3>${esc(m.t)}</h3><p>${m.d} · +${m.xp} XP · ${m.min} min · ${done?'Completed':'Ready'}</p></div>${done?'<button class="secondary">✓ Done</button>':`<button class="primary start" data-id="${m.id}">Start</button>`}</div>`}).join('');
document.querySelectorAll('.start').forEach(b=>b.onclick=()=>start(b.dataset.id));
}
function start(id){let m=missions.find(x=>x.id===id);modal(`<h2>${esc(m.t)}</h2><p>Demo coding task: write your solution and submit it. The submit action stores your result in the browser database and awards XP.</p><div class="card"><h3>Test case</h3><p>Input: [-2,1,-3,4,-1,2,1,-5,4]<br>Expected maximum sum: 6</p><button id="submit" class="primary">Submit & earn +${m.xp} XP</button></div>`);$('submit').onclick=()=>{let u=user();if(!u.done.includes(id)){u.done.push(id);u.xp+=m.xp;u.streak=Math.max(1,u.streak+1);update(u);close();render();toast(`Mission complete! +${m.xp} XP`)}}}
function nav(page){
document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
if(page==='dashboard'){$('dashboard').classList.add('active');$('generic').classList.remove('active');render();return}
$('dashboard').classList.remove('active');$('generic').classList.add('active');
let u=user(),titles={ai:'🧠 AI Tasks',arena:'⌨ Code Arena',challenges:'🎯 Challenges',compete:'⚔️ Competition Hub',squads:'👥 Learning Squads',leaderboard:'🏆 Leaderboard',skills:'📊 Skills Analytics',rewards:'🎖 Rewards',planner:'📅 Study Planner',admin:'⚙ Admin',profile:'👤 Your Profile'};
let body='';
if(page==='profile')body=`<div class="card"><div class="row"><span>Name</span><b>${esc(u.name)}</b></div><div class="row"><span>Email</span><b>${esc(u.email)}</b></div><div class="row"><span>Date of birth</span><b>${esc(u.dob)}</b></div><div class="row"><span>XP</span><b>${u.xp}</b></div><button id="logout" class="primary" style="margin-top:15px">Logout</button></div>`;
else if(page==='leaderboard'){body='<div class="cards">'+[...db().users].sort((a,b)=>b.xp-a.xp).map((x,i)=>`<div class="card"><h3>#${i+1} ${esc(x.name)}</h3><p>${x.xp.toLocaleString()} XP · ${rank(x.xp)}</p></div>`).join('')+'</div>'}
else body=`<div class="cards"><div class="card"><h3>Connected account</h3><p>${esc(u.email)}</p></div><div class="card"><h3>Your XP</h3><p>${u.xp.toLocaleString()} XP</p></div><div class="card"><h3>Action</h3><p>Complete missions to update your database and dashboard.</p><button id="back" class="primary">Go to Dashboard</button></div></div>`;
$('genericContent').innerHTML=`<div class="generic"><h1>${titles[page]||page}</h1><p>This section is connected to your DECodeArena account.</p>${body}</div>`;
$('logout')?.addEventListener('click',logout);$('back')?.addEventListener('click',()=>nav('dashboard'));
}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>nav(b.dataset.page));
document.querySelectorAll('#filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderMissions(b.dataset.filter)});
$('quick').onclick=$('heroMatch').onclick=$('join').onclick=()=>start('m4');
$('challenge').onclick=()=>start('m4');
$('preview').onclick=()=>modal('<h2>Preview Test Cases</h2><p>Input: [-2,1,-3,4,-1,2,1,-5,4]</p><p>Expected maximum subarray sum: 6</p>');
$('coach').onclick=()=>modal('<h2>🤖 AI Coach</h2><p>Focus on algorithmic problem solving today. Complete one coding mission and review its edge cases.</p>');
$('plan').onclick=()=>nav('planner');$('avatar').onclick=()=>nav('profile');$('bell').onclick=()=>modal('<h2>🔔 Notifications</h2><p>Your progress is saved automatically in the browser database.</p>');$('close').onclick=close;
if(localStorage.getItem(SESSION)&&user())open();
