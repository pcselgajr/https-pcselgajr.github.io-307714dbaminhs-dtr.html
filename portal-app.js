var signupType='s';
var accounts=[
{id:'student',pw:'student123',type:'student',fname:'Juan',lname:'Dela Cruz',grade:'Grade 10 - Rizal',lrn:'136789012345'},
{id:'teacher',pw:'teacher123',type:'teacher',fname:'Elena',lname:'Bautista',dept:'Mathematics',eid:'T-2024-001'},
{id:'parent',pw:'parent123',type:'parent',fname:'Roberto',lname:'Dela Cruz',childLrn:'136789012345',childName:'Juan Dela Cruz'}
];

// Load signup accounts from Firebase (loaded via loadAllFromFirebase)
function loadSavedAccounts() {
  var saved = loadData('accounts', []);
  saved.forEach(function(a) {
    if (!accounts.find(function(x) { return x.id === a.id; })) {
      accounts.push(a);
    }
  });
}

var curUser=null;

// === RENDER DYNAMIC CONTENT FROM SHARED DATA ===
function renderPortalContent() {
  console.log('renderPortalContent called!');
  // Render stats from settings
  var settings = loadData('settings', DEFAULT_SETTINGS);
  var s1=document.getElementById('pStat1');
  var s2=document.getElementById('pStat2');
  var s3=document.getElementById('pStat3');
  var s4=document.getElementById('pStat4');
  if(s1 && settings.stat1) s1.textContent=settings.stat1;
  if(s2 && settings.stat2) s2.textContent=settings.stat2;
  if(s3 && settings.stat3) s3.textContent=settings.stat3;
  if(s4 && settings.stat4) s4.textContent=settings.stat4;
  // Render enrollment chart from settings
  var grades = ['G7','G8','G9','G10','G11','G12'];
  var defaults = {G7:'210',G8:'198',G9:'185',G10:'172',G11:'250',G12:'232'};
  var vals = [];
  var maxVal = 0;
  grades.forEach(function(g) {
    var v = parseInt(settings['g'+g.replace('G','')]) || parseInt(defaults[g]) || 0;
    vals.push(v);
    if (v > maxVal) maxVal = v;
  });
  grades.forEach(function(g, i) {
    var el = document.getElementById('e'+g);
    var bar = document.getElementById('bar'+g);
    if (el) el.textContent = vals[i];
    if (bar && maxVal > 0) {
      bar.style.width = Math.max(10, Math.round((vals[i]/maxVal)*100)) + '%';
    }
  });
  var news = loadData('news', DEFAULT_NEWS);
  var events = loadData('events', DEFAULT_EVENTS);
  var published = news.filter(function(n) { return n.status === 'Published'; });
  var upcoming = events.filter(function(e) { return e.status === 'Upcoming'; });

  // Render news
  var newsEl = document.getElementById('portalNews');
  console.log('portalNews element:', newsEl ? 'FOUND' : 'NOT FOUND');
  console.log('Published news:', published.length);
  if (newsEl && published.length > 0) {
    var colors = ['ni-a','ni-b','ni-c','ni-d'];
    var icons = ['&#127942;','&#128227;','&#127793;','&#128218;'];
    var html = '';
    // Main featured
    var feat = published[0];
    html += '<div class="ncard nmain"><div class="nimg ' + (feat.image ? '" style="background:none' : colors[0]) + '">' + (feat.image ? '<img src="'+feat.image+'" style="width:100%;height:100%;object-fit:cover">' : icons[0]) + '</div><span class="nbadge">Featured</span><div class="nbody"><div class="ndate">' + formatDate(feat.date) + '</div><h3>' + feat.title + '</h3><p>' + (feat.content || '') + '</p><a href="#" class="nlink">Read more &#8594;</a></div></div>';
    // Side cards
    for (var i = 1; i < Math.min(published.length, 3); i++) {
      var n = published[i];
      html += '<div class="ncard"><div class="nimg ' + (n.image ? '" style="background:none' : colors[i % 4]) + '">' + (n.image ? '<img src="'+n.image+'" style="width:100%;height:100%;object-fit:cover">' : icons[i % 4]) + '</div><div class="nbody"><div class="ndate">' + formatDate(n.date) + '</div><h3>' + n.title + '</h3><p>' + (n.content || '') + '</p><a href="#" class="nlink">Read more &#8594;</a></div></div>';
    }
    newsEl.innerHTML = html;
  }

  // Render events
  var evEl = document.getElementById('portalEvents');
  console.log('portalEvents element:', evEl ? 'FOUND' : 'NOT FOUND');
  console.log('Upcoming events:', upcoming.length);
  if (evEl && upcoming.length > 0) {
    var ehtml = '';
    upcoming.forEach(function(e) {
      var ds = formatDateShort(e.date);
      ehtml += '<div class="ecard"><div class="ebox"><div class="m">' + ds.month + '</div><div class="d">' + ds.day + '</div></div><div class="einfo"><h3>' + e.name + '</h3><p>' + (e.desc || '') + '</p></div><div class="etime">' + e.time + '</div></div>';
    });
    evEl.innerHTML = ehtml;
  }
}

// Run on page load
// Run immediately since script is at bottom of body
// Load data from Firebase, then render
loadAllFromFirebase(function() {
  try {
    renderPortalContent();
    populateSectionDropdowns();
    renderCalendar();
    renderCommunity();
    console.log('Portal content rendered from Firebase!');
  } catch(e) {
    console.error('renderPortalContent ERROR:', e);
  }
});
// Listen for real-time changes from admin
listenForChanges(function() {
  renderPortalContent();
    populateSectionDropdowns();
    renderCalendar();
    renderCommunity();
  console.log('Real-time update received!');
});

// Real-time updates handled by Firebase listener above

// === AUTH FUNCTIONS ===
function openM(m){document.getElementById('authModal').classList.add('act');switchMode(m||'login')}
function closeM(){document.getElementById('authModal').classList.remove('act')}
function switchMode(m){var l=m==='login';document.getElementById('loginForm').style.display=l?'block':'none';document.getElementById('signupForm').style.display=l?'none':'block';document.getElementById('mtL').className='tab'+(l?' act':'');document.getElementById('mtS').className='tab'+(l?'':' act')}
function stab(el){el.parentElement.querySelectorAll('.tab').forEach(function(t){t.className='tab'});el.className='tab act'}
function stype(el,t){stab(el);signupType=t;document.getElementById('fLrn').style.display=t==='s'?'block':'none';document.getElementById('fEmp').style.display=t==='t'?'block':'none';document.getElementById('fChild').style.display=t==='p'?'block':'none';document.getElementById('fGrade').style.display=t==='s'?'block':'none'}

function doLogin(){
loadSavedAccounts();
var id=document.getElementById('liId').value.trim().toLowerCase();
var pw=document.getElementById('liPw').value;
var user=accounts.find(function(a){return (a.id===id||a.lrn===id||a.eid===id||(a.email&&a.email.toLowerCase()===id))&&a.pw===pw});
if(!user){toast('Invalid credentials. Please check your ID and password.','er');return}
curUser=user;closeM();
document.getElementById('publicSite').style.display='none';
if(user.type==='student'){
document.getElementById('studentDash').classList.add('act');
document.getElementById('sdAv').textContent=user.fname[0];
document.getElementById('sdName').textContent=user.fname+' '+user.lname;
document.getElementById('sdWelcome').textContent=user.fname;
}else if(user.type==='teacher'){
document.getElementById('teacherDash').classList.add('act');
setTimeout(function() { loadMyClasses(); }, 200);
document.getElementById('tdAv').textContent=user.fname[0];
document.getElementById('tdName').textContent=user.fname+' '+user.lname;
document.getElementById('tdWelcome').textContent=user.fname;
}else if(user.type==='parent'){
document.getElementById('parentDash').classList.add('act');
document.getElementById('pdAv').textContent=user.fname[0];
document.getElementById('pdName').textContent=user.fname+' '+user.lname;
document.getElementById('pdWelcome').textContent=user.fname;
if(document.getElementById('pdChild'))document.getElementById('pdChild').textContent=user.childName||'Your Child';
setTimeout(function() { loadParentGrades(); loadParentAttendance(); }, 200);
}
toast('Welcome, '+user.fname+'!');
}

function doLogout(){
curUser=null;
document.querySelectorAll('.dash-page').forEach(function(p){p.classList.remove('act')});
document.getElementById('publicSite').style.display='block';
window.scrollTo({top:0});
toast('Logged out successfully');
}

function doSignup(){
var fn=document.getElementById('sf').value.trim();
var ln=document.getElementById('sl').value.trim();
var em=document.getElementById('se').value.trim();
var p1=document.getElementById('sp1').value;
var p2=document.getElementById('sp2').value;
var ag=document.getElementById('sag').checked;
if(!fn||!ln){toast('Please enter your full name.','er');return}
if(!em){toast('Please enter email.','er');return}
if(!p1||p1.length<8){toast('Password must be at least 8 characters.','er');return}
if(p1!==p2){toast('Passwords do not match.','er');return}
if(!ag){toast('Please agree to Terms & Conditions.','er');return}
var newAcc={id:em.toLowerCase(),pw:p1,type:signupType==='s'?'student':signupType==='t'?'teacher':'parent',fname:fn,lname:ln,email:em};
if(signupType==='s'){
newAcc.lrn=document.getElementById('sLrn').value;
newAcc.grade=document.getElementById('sGradeSection').value||'TBA';
if(!newAcc.lrn){toast('Please enter LRN.','er');return}
newAcc.id=newAcc.lrn;
}else if(signupType==='t'){
newAcc.eid=document.getElementById('sEmp').value;
newAcc.dept='TBA';
if(!newAcc.eid){toast('Please enter Employee ID.','er');return}
newAcc.id=newAcc.eid;
}else{
newAcc.childLrn=document.getElementById('sChild').value;
newAcc.childName='Your Child';
if(!newAcc.childLrn){toast('Please enter child LRN.','er');return}
}
accounts.push(newAcc);
// Save account to Firebase
var accts = loadData('accounts', []);
accts.push(newAcc);
saveData('accounts', accts);
// Add to pending signups - load fresh from Firebase first
db.collection('portal_data').doc('pending').get().then(function(doc) {
  var pending = [];
  if (doc.exists) {
    try { pending = JSON.parse(doc.data().data); } catch(e) { pending = []; }
  }
  var maxId = 0;
  pending.forEach(function(p) { if (p.id > maxId) maxId = p.id; });
  pending.unshift({
    id: maxId + 1,
    name: fn + ' ' + ln,
    type: newAcc.type.charAt(0).toUpperCase() + newAcc.type.slice(1),
    email: em,
    idnum: newAcc.lrn || newAcc.eid || newAcc.childLrn || '',
    date: new Date().toISOString().split('T')[0]
  });
  saveData('pending', pending);
  console.log('Signup added to pending! Total pending:', pending.length);
}).catch(function(err) {
  console.error('Error adding to pending:', err);
});

toast('Account created! Welcome, '+fn+'! You can now log in.');
switchMode('login');
document.getElementById('liId').value=newAcc.id;
document.getElementById('liPw').value='';
}

function sdTab(el,id){el.parentElement.querySelectorAll('button').forEach(function(b){b.className=''});el.className='act';['sdGrades','sdSched','sdTasks','sdAtt'].forEach(function(x){document.getElementById(x).style.display=x===id?'block':'none'})}
function tdTab(el,id){el.parentElement.querySelectorAll('button').forEach(function(b){b.className=''});el.className='act';['tdClasses','tdGrade','tdAttendance','tdSchedule','tdAnnounce'].forEach(function(x){var e=document.getElementById(x);if(e)e.style.display=x===id?'block':'none'})}
function pdTab(el,id){el.parentElement.querySelectorAll('button').forEach(function(b){b.className=''});el.className='act';['pdGrades','pdAtt','pdMsg'].forEach(function(x){document.getElementById(x).style.display=x===id?'block':'none'})}

var tt;
function toast(m,c){
var t=document.getElementById('toastEl');
if(!t)return;
t.textContent=m;
t.className='toast'+(c==='er'?' er':'')+' show';
clearTimeout(tt);
tt=setTimeout(function(){t.classList.remove('show')},3500);
}

window.addEventListener('scroll',function(){
var nb=document.getElementById('navbar');
var st=document.getElementById('stt');
if(nb)nb.classList.toggle('scrolled',window.scrollY>50);
if(st)st.classList.toggle('vis',window.scrollY>400);
});

document.querySelectorAll('a[href^="#"]').forEach(function(a){
a.addEventListener('click',function(e){
var h=this.getAttribute('href');
if(h&&h.length>1){
e.preventDefault();
var t=document.querySelector(h);
if(t){t.scrollIntoView({behavior:'smooth'});var nl=document.querySelector('.nlinks');if(nl)nl.classList.remove('open')}
}
});
});

var lpw=document.getElementById('liPw');
if(lpw)lpw.addEventListener('keydown',function(e){if(e.key==='Enter')doLogin()});

// ============================================
// GRADE UPLOAD SYSTEM
// ============================================


function downloadTemplate() {
  var cls = document.getElementById('gradeClass').value;
  var settings = loadData('settings', DEFAULT_SETTINGS);
  var secs = (settings.sections && settings.sections.length > 0) ? settings.sections : DEFAULT_SECTIONS;
  var subjects = getSubjectsForSection(cls, secs);
  
  var students = loadData('students', DEFAULT_STUDENTS);
  var classStudents = students.filter(function(s) { return s.grade === cls && s.status === 'Active'; });
  if (classStudents.length === 0) {
    classStudents = students.filter(function(s) { return s.status === 'Active'; });
  }
  
  var csv = 'LRN,Name,' + subjects.join(',') + '\n';
  classStudents.forEach(function(s) {
    csv += s.lrn + ',' + s.name;
    subjects.forEach(function() { csv += ','; });
    csv += '\n';
  });
  
  var blob = new Blob([csv], {type: 'text/csv'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'grades_' + cls.replace(/\s/g,'_') + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  
  showUploadStatus('Template downloaded! Open in Excel, fill in grades for all subjects, save as CSV, then upload.', 'success');
}

function handleCSVUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var text = e.target.result;
    var lines = text.trim().split('\n');
    
    if (lines.length < 2) {
      showUploadStatus('Error: CSV file is empty or has no data rows.', 'error');
      return;
    }
    
    var header = lines[0].split(',').map(function(h) { return h.trim(); });
    if (header.length < 4) {
      showUploadStatus('Error: CSV must have LRN, Name, and at least one subject column.', 'error');
      return;
    }
    
    var records = [];
    var errors = [];
    for (var i = 1; i < lines.length; i++) {
      var row = lines[i].split(',');
      if (!row[0] || !row[0].trim()) continue;
      
      var lrn = row[0].trim();
      var name = row[1] ? row[1].trim() : '';
      var grades = {};
      var hasError = false;
      
      for (var j = 2; j < header.length && j < row.length; j++) {
        var val = row[j] ? row[j].trim() : '';
        if (val === '') continue;
        var num = parseFloat(val);
        if (isNaN(num) || num < 60 || num > 100) {
          errors.push('Row '+(i+1)+': '+name+' - invalid grade for '+header[j]);
          hasError = true;
          continue;
        }
        grades[header[j]] = Math.round(num * 10) / 10;
      }
      
      // Auto-compute MAPEH (JHS only)
      var ma = grades['Music & Arts'];
      var pe = grades['PE & Health'];
      if (ma !== undefined && pe !== undefined) {
        grades['MAPEH'] = Math.round(((ma + pe) / 2) * 10) / 10;
      }
      
      if (!hasError || Object.keys(grades).length > 0) {
        records.push({lrn: lrn, name: name, grades: grades});
      }
    }
    
    if (records.length === 0) {
      showUploadStatus('Error: No valid records found. ' + errors.join('; '), 'error');
      return;
    }
    
    var cls = document.getElementById('gradeClass').value;
    var settings = loadData('settings', DEFAULT_SETTINGS);
    var secs = (settings.sections && settings.sections.length > 0) ? settings.sections : DEFAULT_SECTIONS;
    var baseSubjects = getSubjectsForSection(cls, secs);
    var allSubjects = baseSubjects.slice();
    if (baseSubjects.indexOf('Music & Arts') > -1) allSubjects.push('MAPEH');
    
    var html = '<div style="margin-bottom:12px"><strong>' + records.length + ' students</strong> parsed';
    if (errors.length > 0) html += ' <span style="color:var(--da)">(' + errors.length + ' warnings)</span>';
    html += '</div>';
    html += '<div style="overflow-x:auto"><table><thead><tr><th>LRN</th><th>Name</th>';
    allSubjects.forEach(function(s) {
      var label = s === 'Mathematics' ? 'Math' : s === 'Music & Arts' ? 'M&A' : s === 'PE & Health' ? 'PE' : s;
      html += '<th style="font-size:11px">' + label + '</th>';
    });
    html += '<th>Average</th><th>Remarks</th></tr></thead><tbody>';
    
    records.forEach(function(r) {
      html += '<tr><td style="font-family:monospace;font-size:11px">' + r.lrn + '</td><td style="font-size:12px">' + r.name + '</td>';
      var total = 0, count = 0;
      allSubjects.forEach(function(s) {
        var v = r.grades[s];
        if (v !== undefined) { total += v; count++; }
        var color = v !== undefined ? (v >= 75 ? '#22c55e' : '#ef4444') : '#ccc';
        html += '<td style="text-align:center;color:' + color + ';font-weight:600;font-size:12px">' + (v !== undefined ? v : '--') + '</td>';
      });
      var avg = count > 0 ? Math.round((total / count) * 10) / 10 : '';
      var remarks = avg >= 75 ? 'Passed' : (avg ? 'Failed' : '');
      var badge = avg >= 75 ? 'b-g' : 'b-r';
      html += '<td style="text-align:center"><strong>' + (avg || '--') + '</strong></td>';
      html += '<td>' + (remarks ? '<span class="badge ' + badge + '">' + remarks + '</span>' : '') + '</td></tr>';
    });
    
    html += '</tbody></table></div>';
    html += '<div style="display:flex;gap:10px;margin-top:16px">';
    html += '<button class="btn btn-p btn-sm" onclick="saveUploadedGrades()">&#128190; Save All Grades</button>';
    html += '<button class="btn btn-s btn-sm" onclick="cancelUpload()">Cancel</button>';
    html += '</div>';
    
    document.getElementById('gradePreview').innerHTML = html;
    window._pendingRecords = records;
    window._pendingClass = cls;
    
    showUploadStatus('CSV parsed! Review grades and click Save.', 'success');
  };
  reader.readAsText(file);
  event.target.value = '';
}

function saveUploadedGrades() {
  if (!window._pendingRecords || !window._pendingClass) {
    toast('No grades to save. Upload a CSV first.', 'er');
    return;
  }
  
  var cls = window._pendingClass;
  var records = window._pendingRecords;
  var key = 'grades_' + cls.replace(/\s/g, '_');
  
  var existing = loadData(key, {});
  
  records.forEach(function(r) {
    existing[r.lrn] = {name: r.name, grades: r.grades};
  });
  
  saveData(key, existing);
  
  window._pendingRecords = null;
  window._pendingClass = null;
  document.getElementById('gradePreview').innerHTML = '';
  
  toast(records.length + ' students grades saved! Students can now view their grades.', 'su');
  showUploadStatus(records.length + ' students grades saved for ' + cls + '!', 'success');
  
  updateGradeView();
}

function cancelUpload() {
  window._pendingGrades = null;
  window._pendingMeta = null;
  document.getElementById('gradePreview').innerHTML = '';
  document.getElementById('uploadStatus').style.display = 'none';
}

function updateGradeView() {
  var cls = document.getElementById('gradeClass').value;
  var key = 'grades_' + cls.replace(/\s/g, '_');
  var data = loadData(key, {});
  var lrns = Object.keys(data);
  
  var el = document.getElementById('savedGrades');
  if (lrns.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--g5);font-size:14px">No grades uploaded yet. Download template, fill in grades, then upload.</div>';
    return;
  }
  
  var settings = loadData('settings', DEFAULT_SETTINGS);
  var secs = (settings.sections && settings.sections.length > 0) ? settings.sections : DEFAULT_SECTIONS;
  var baseSubjects = getSubjectsForSection(cls, secs);
  var allSubjects = baseSubjects.slice();
  if (baseSubjects.indexOf('Music & Arts') > -1) allSubjects.push('MAPEH');
  var html = '<h4 style="font-size:15px;margin-bottom:12px">&#128202; Grades &mdash; ' + cls + '</h4>';
  html += '<div style="overflow-x:auto"><table><thead><tr><th>LRN</th><th>Name</th>';
  allSubjects.forEach(function(s) {
    var label = s === 'Mathematics' ? 'Math' : s === 'Music & Arts' ? 'M&A' : s === 'PE & Health' ? 'PE' : s;
    html += '<th style="font-size:11px">' + label + '</th>';
  });
  html += '<th>Avg</th><th>Remarks</th></tr></thead><tbody>';
  
  lrns.forEach(function(lrn) {
    var r = data[lrn];
    var g = r.grades || {};
    html += '<tr><td style="font-family:monospace;font-size:11px">' + lrn + '</td><td style="font-size:12px">' + r.name + '</td>';
    var total = 0, count = 0;
    allSubjects.forEach(function(s) {
      var v = g[s];
      if (v !== undefined) { total += v; count++; }
      html += '<td style="text-align:center;font-size:12px">' + (v !== undefined ? v : '--') + '</td>';
    });
    var avg = count > 0 ? Math.round((total / count) * 10) / 10 : '';
    var remarks = avg >= 75 ? 'Passed' : (avg ? 'Failed' : '');
    var badge = avg >= 75 ? 'b-g' : 'b-r';
    html += '<td style="text-align:center"><strong>' + (avg || '--') + '</strong></td>';
    html += '<td>' + (remarks ? '<span class="badge ' + badge + '">' + remarks + '</span>' : '') + '</td></tr>';
  });
  
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function showUploadStatus(msg, type) {
  var el = document.getElementById('uploadStatus');
  el.style.display = 'block';
  el.textContent = msg;
  if (type === 'success') {
    el.style.background = 'var(--sub)';
    el.style.color = 'var(--su)';
    el.style.border = '1px solid var(--su)';
  } else {
    el.style.background = 'var(--dab)';
    el.style.color = 'var(--da)';
    el.style.border = '1px solid var(--da)';
  }
}

// Update student dashboard to load grades from Firebase
function loadStudentGrades() {
  if (!curUser || curUser.type !== 'student') return;
  var lrn = curUser.lrn;
  if (!lrn) return;
  
  var grades = null;
  var keys = Object.keys(_cache);
  
  keys.forEach(function(k) {
    if (k.startsWith('grades_')) {
      var data = _cache[k];
      if (data && data[lrn]) {
        grades = data[lrn];
      }
    }
  });
  
  if (!grades || !grades.grades) return;
  
  var el = document.getElementById('sdGrades');
  if (!el) return;
  
  var g = grades.grades;
  var allSubjects = Object.keys(g);
  var html = '<h3>&#128202; My Grades</h3>';
  html += '<div style="overflow-x:auto"><table><thead><tr><th>Subject</th><th>Final Grade</th><th>Remarks</th></tr></thead><tbody>';
  
  var total = 0, count = 0;
  allSubjects.forEach(function(s) {
    var v = g[s];
    if (v === undefined) return;
    total += v; count++;
    var remarks = v >= 75 ? 'Passed' : 'Failed';
    var badge = v >= 75 ? 'b-g' : 'b-r';
    var isMAPEH = s === 'MAPEH';
    html += '<tr style="' + (isMAPEH ? 'background:#f0f7ff;font-weight:600' : '') + '">';
    html += '<td>' + (isMAPEH ? '&#128900; ' : '') + s + '</td>';
    html += '<td style="text-align:center"><strong>' + v + '</strong></td>';
    html += '<td><span class="badge ' + badge + '">' + remarks + '</span></td></tr>';
  });
  
  var avg = count > 0 ? Math.round((total / count) * 10) / 10 : '';
  html += '<tr style="background:#f9f9f9;border-top:2px solid #ddd"><td><strong>General Average</strong></td>';
  html += '<td style="text-align:center"><strong style="font-size:18px;color:' + (avg >= 75 ? '#22c55e' : '#ef4444') + '">' + avg + '</strong></td>';
  html += '<td><span class="badge ' + (avg >= 75 ? 'b-g' : 'b-r') + '">' + (avg >= 75 ? 'Passed' : 'Failed') + '</span></td></tr>';
  
  html += '</tbody></table></div>';
  el.innerHTML = html;
}



// ============================================
// ATTENDANCE UPLOAD SYSTEM
// ============================================

function downloadAttTemplate() {
  var cls = document.getElementById('attClass').value;
  var students = loadData('students', DEFAULT_STUDENTS);
  var classStudents = students.filter(function(s) { return s.grade === cls && s.status === 'Active'; });
  if (classStudents.length === 0) {
    classStudents = students.filter(function(s) { return s.status === 'Active'; });
  }
  
  var csv = 'LRN,Name,Days Present,Days Absent,Days Late,Total School Days\n';
  classStudents.forEach(function(s) {
    csv += s.lrn + ',' + s.name + ',,,,\n';
  });
  
  var blob = new Blob([csv], {type: 'text/csv'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'attendance_' + cls.replace(/\s/g,'_') + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  
  showAttStatus('Template downloaded! Fill in attendance data, save as CSV, then upload.', 'success');
}

function handleAttUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var text = e.target.result;
    var lines = text.trim().split('\n');
    
    if (lines.length < 2) {
      showAttStatus('Error: CSV is empty.', 'error');
      return;
    }
    
    var records = [];
    for (var i = 1; i < lines.length; i++) {
      var row = lines[i].split(',');
      if (!row[0] || !row[0].trim()) continue;
      
      var lrn = row[0].trim();
      var name = row[1] ? row[1].trim() : '';
      var present = parseInt(row[2]) || 0;
      var absent = parseInt(row[3]) || 0;
      var late = parseInt(row[4]) || 0;
      var totalDays = parseInt(row[5]) || 0;
      
      if (totalDays === 0) totalDays = present + absent;
      var rate = totalDays > 0 ? Math.round((present / totalDays) * 1000) / 10 : 0;
      
      records.push({lrn: lrn, name: name, present: present, absent: absent, late: late, totalDays: totalDays, rate: rate});
    }
    
    if (records.length === 0) {
      showAttStatus('Error: No valid records found.', 'error');
      return;
    }
    
    var cls = document.getElementById('attClass').value;
    
    var html = '<div style="margin-bottom:12px"><strong>' + records.length + ' students</strong> parsed</div>';
    html += '<div style="overflow-x:auto"><table><thead><tr><th>LRN</th><th>Name</th><th>Present</th><th>Absent</th><th>Late</th><th>Total Days</th><th>Rate</th></tr></thead><tbody>';
    
    records.forEach(function(r) {
      var rateColor = r.rate >= 90 ? '#22c55e' : (r.rate >= 80 ? '#f59e0b' : '#ef4444');
      html += '<tr><td style="font-family:monospace;font-size:11px">' + r.lrn + '</td>';
      html += '<td style="font-size:12px">' + r.name + '</td>';
      html += '<td style="text-align:center;color:#22c55e;font-weight:600">' + r.present + '</td>';
      html += '<td style="text-align:center;color:#ef4444;font-weight:600">' + r.absent + '</td>';
      html += '<td style="text-align:center;color:#f59e0b;font-weight:600">' + r.late + '</td>';
      html += '<td style="text-align:center">' + r.totalDays + '</td>';
      html += '<td style="text-align:center;color:' + rateColor + ';font-weight:700">' + r.rate + '%</td></tr>';
    });
    
    html += '</tbody></table></div>';
    html += '<div style="display:flex;gap:10px;margin-top:16px">';
    html += '<button class="btn btn-p btn-sm" onclick="saveAttendance()">&#128190; Save Attendance</button>';
    html += '<button class="btn btn-s btn-sm" onclick="cancelAtt()">Cancel</button>';
    html += '</div>';
    
    document.getElementById('attPreview').innerHTML = html;
    window._pendingAtt = records;
    window._pendingAttClass = cls;
    
    showAttStatus('CSV parsed! Review and click Save.', 'success');
  };
  reader.readAsText(file);
  event.target.value = '';
}

function saveAttendance() {
  if (!window._pendingAtt || !window._pendingAttClass) {
    toast('No attendance to save.', 'er');
    return;
  }
  
  var cls = window._pendingAttClass;
  var records = window._pendingAtt;
  var key = 'attendance_' + cls.replace(/\s/g, '_');
  
  var data = {};
  records.forEach(function(r) {
    data[r.lrn] = {name: r.name, present: r.present, absent: r.absent, late: r.late, totalDays: r.totalDays, rate: r.rate};
  });
  
  saveData(key, data);
  
  window._pendingAtt = null;
  window._pendingAttClass = null;
  document.getElementById('attPreview').innerHTML = '';
  
  toast(records.length + ' attendance records saved!', 'su');
  showAttStatus(records.length + ' records saved for ' + cls + '!', 'success');
  updateAttView();
}

function cancelAtt() {
  window._pendingAtt = null;
  window._pendingAttClass = null;
  document.getElementById('attPreview').innerHTML = '';
  var el = document.getElementById('attUploadStatus');
  if (el) el.style.display = 'none';
}

function updateAttView() {
  var cls = document.getElementById('attClass').value;
  var key = 'attendance_' + cls.replace(/\s/g, '_');
  var data = loadData(key, {});
  var lrns = Object.keys(data);
  
  var el = document.getElementById('savedAttendance');
  if (!el) return;
  if (lrns.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--g5);font-size:14px">No attendance records yet. Download template, fill in data, then upload.</div>';
    return;
  }
  
  var html = '<h4 style="font-size:15px;margin-bottom:12px">&#128203; Saved Attendance &mdash; ' + cls + '</h4>';
  html += '<div style="overflow-x:auto"><table><thead><tr><th>LRN</th><th>Name</th><th>Present</th><th>Absent</th><th>Late</th><th>Total</th><th>Rate</th></tr></thead><tbody>';
  
  lrns.forEach(function(lrn) {
    var r = data[lrn];
    var rateColor = r.rate >= 90 ? '#22c55e' : (r.rate >= 80 ? '#f59e0b' : '#ef4444');
    html += '<tr><td style="font-family:monospace;font-size:11px">' + lrn + '</td>';
    html += '<td style="font-size:12px">' + r.name + '</td>';
    html += '<td style="text-align:center">' + r.present + '</td>';
    html += '<td style="text-align:center">' + r.absent + '</td>';
    html += '<td style="text-align:center">' + r.late + '</td>';
    html += '<td style="text-align:center">' + r.totalDays + '</td>';
    html += '<td style="text-align:center;color:' + rateColor + ';font-weight:700">' + r.rate + '%</td></tr>';
  });
  
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function showAttStatus(msg, type) {
  var el = document.getElementById('attUploadStatus');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = msg;
  if (type === 'success') {
    el.style.background = 'var(--sub)'; el.style.color = 'var(--su)'; el.style.border = '1px solid var(--su)';
  } else {
    el.style.background = 'var(--dab)'; el.style.color = 'var(--da)'; el.style.border = '1px solid var(--da)';
  }
}

// Load student attendance from Firebase
function loadStudentAttendance() {
  if (!curUser || curUser.type !== 'student') return;
  var lrn = curUser.lrn;
  if (!lrn) return;
  
  var attendance = null;
  var keys = Object.keys(_cache);
  keys.forEach(function(k) {
    if (k.startsWith('attendance_')) {
      var data = _cache[k];
      if (data && data[lrn]) {
        attendance = data[lrn];
      }
    }
  });
  
  var el = document.getElementById('sdAttContent');
  if (!el) return;
  
  if (!attendance) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--g5)">No attendance records yet.</div>';
    return;
  }
  
  var r = attendance;
  var rateColor = r.rate >= 90 ? '#22c55e' : (r.rate >= 80 ? '#f59e0b' : '#ef4444');
  var rateLabel = r.rate >= 90 ? 'Excellent' : (r.rate >= 80 ? 'Good' : 'Needs Improvement');
  
  var html = '<h3>&#128203; My Attendance Record</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:20px 0">';
  html += '<div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:#22c55e">' + r.present + '</div><div style="font-size:12px;color:#666;margin-top:4px">Days Present</div></div>';
  html += '<div style="background:#fef2f2;border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:#ef4444">' + r.absent + '</div><div style="font-size:12px;color:#666;margin-top:4px">Days Absent</div></div>';
  html += '<div style="background:#fffbeb;border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:#f59e0b">' + r.late + '</div><div style="font-size:12px;color:#666;margin-top:4px">Days Late</div></div>';
  html += '<div style="background:#f8fafc;border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:#334155">' + r.totalDays + '</div><div style="font-size:12px;color:#666;margin-top:4px">Total School Days</div></div>';
  html += '</div>';
  
  // Attendance rate bar
  html += '<div style="background:#f7f7f7;border-radius:20px;height:32px;overflow:hidden;margin:16px 0">';
  html += '<div style="height:100%;background:linear-gradient(90deg,' + rateColor + ',' + rateColor + '80);border-radius:20px;width:' + r.rate + '%;display:flex;align-items:center;justify-content:center;transition:width 1s ease">';
  html += '<span style="color:#fff;font-size:13px;font-weight:700">' + r.rate + '% Attendance Rate</span>';
  html += '</div></div>';
  html += '<div style="text-align:center;font-size:14px;color:' + rateColor + ';font-weight:600">' + rateLabel + '</div>';
  
  el.innerHTML = html;
}


// ============================================
// DYNAMIC SECTIONS FROM SETTINGS
// ============================================
var DEFAULT_SECTIONS = [
  {name:'Grade 7 - Bonifacio',cluster:'JHS'},{name:'Grade 8 - Luna',cluster:'JHS'},
  {name:'Grade 9 - Mabini',cluster:'JHS'},{name:'Grade 10 - Rizal',cluster:'JHS'},
  {name:'Grade 11 - ABM',cluster:'Business'},{name:'Grade 11 - HUMSS',cluster:'ASSH'},
  {name:'Grade 12 - ABM',cluster:'Business'},{name:'Grade 12 - HUMSS',cluster:'ASSH'}
];

function populateSectionDropdowns() {
  var settings = loadData('settings', DEFAULT_SETTINGS);
  var secs = (settings.sections && settings.sections.length > 0) ? settings.sections : DEFAULT_SECTIONS;
  
  var dropdowns = ['gradeClass', 'attClass', 'schedClass', 'announceClass', 'sGradeSection'];
  dropdowns.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var current = el.value;
    el.innerHTML = '';
    if (id === 'announceClass') {
      var opt = document.createElement('option');
      opt.value = 'All My Classes';
      opt.textContent = 'All My Classes';
      el.appendChild(opt);
    }
    if (id === 'sGradeSection') {
      var opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Select Section';
      el.appendChild(opt);
    }
    secs.forEach(function(s) {
      var name = typeof s === 'object' ? s.name : s;
      var cluster = typeof s === 'object' ? s.cluster : '';
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name + (cluster ? ' [' + cluster + ']' : '');
      el.appendChild(opt);
    });
    if (current) el.value = current;
  });
  console.log('Section dropdowns populated:', secs.length, 'sections');
}



// ============================================
// PARENT DASHBOARD - LIVE GRADES & ATTENDANCE
// ============================================

function loadParentGrades() {
  if (!curUser || curUser.type !== 'parent') return;
  var lrn = curUser.childLrn;
  if (!lrn) return;
  
  var grades = null;
  var childName = curUser.childName || 'Your Child';
  
  var keys = Object.keys(_cache);
  keys.forEach(function(k) {
    if (k.startsWith('grades_')) {
      var data = _cache[k];
      if (data && data[lrn]) {
        grades = data[lrn];
        if (grades.name) childName = grades.name;
      }
    }
  });
  
  var el = document.getElementById('pdGradesContent');
  if (!el) return;
  
  if (!grades || !grades.grades) {
    el.innerHTML = '<h3>&#128202; Child\'s Grades &mdash; ' + childName + '</h3>' +
      '<div style="text-align:center;padding:32px;color:var(--g5)">' +
      '<div style="font-size:48px;margin-bottom:12px">&#128203;</div>' +
      '<p>No grades uploaded yet for your child (LRN: ' + lrn + ').</p>' +
      '<p style="font-size:13px;margin-top:8px">Grades will appear here once the teacher uploads them.</p></div>';
    return;
  }
  
  var g = grades.grades;
  var allSubjects = Object.keys(g);
  var html = '<h3>&#128202; Child\'s Grades &mdash; ' + childName + '</h3>';
  html += '<div style="overflow-x:auto"><table><thead><tr><th>Subject</th><th>Final Grade</th><th>Remarks</th></tr></thead><tbody>';
  
  var total = 0, count = 0;
  allSubjects.forEach(function(s) {
    var v = g[s];
    if (v === undefined) return;
    total += v; count++;
    var remarks = v >= 75 ? 'Passed' : 'Failed';
    var badge = v >= 75 ? 'b-g' : 'b-r';
    var isMAPEH = s === 'MAPEH';
    html += '<tr style="' + (isMAPEH ? 'background:#f0f7ff;font-weight:600' : '') + '">';
    html += '<td>' + (isMAPEH ? '&#128900; ' : '') + s + '</td>';
    html += '<td style="text-align:center"><strong>' + v + '</strong></td>';
    html += '<td><span class="badge ' + badge + '">' + remarks + '</span></td></tr>';
  });
  
  var avg = count > 0 ? Math.round((total / count) * 10) / 10 : '';
  html += '<tr style="background:#f9f9f9;border-top:2px solid #ddd"><td><strong>General Average</strong></td>';
  html += '<td style="text-align:center"><strong style="font-size:18px;color:' + (avg >= 75 ? '#22c55e' : '#ef4444') + '">' + avg + '</strong></td>';
  html += '<td><span class="badge ' + (avg >= 75 ? 'b-g' : 'b-r') + '">' + (avg >= 75 ? 'Passed' : 'Failed') + '</span></td></tr>';
  html += '</tbody></table></div>';
  
  el.innerHTML = html;
  
  // Update parent stat cards
  var statEls = document.querySelectorAll('#parentDash .dash-stat b');
  if (statEls.length >= 1 && avg) statEls[0].textContent = avg;
}

function loadParentAttendance() {
  if (!curUser || curUser.type !== 'parent') return;
  var lrn = curUser.childLrn;
  if (!lrn) return;
  
  var attendance = null;
  var keys = Object.keys(_cache);
  keys.forEach(function(k) {
    if (k.startsWith('attendance_')) {
      var data = _cache[k];
      if (data && data[lrn]) {
        attendance = data[lrn];
      }
    }
  });
  
  var el = document.getElementById('pdAttContent');
  if (!el) return;
  
  if (!attendance) {
    el.innerHTML = '<h3>&#128203; Child\'s Attendance</h3>' +
      '<div style="text-align:center;padding:32px;color:var(--g5)">' +
      '<div style="font-size:48px;margin-bottom:12px">&#128203;</div>' +
      '<p>No attendance records yet.</p>' +
      '<p style="font-size:13px;margin-top:8px">Attendance will appear here once the teacher uploads it.</p></div>';
    return;
  }
  
  var r = attendance;
  var rateColor = r.rate >= 90 ? '#22c55e' : (r.rate >= 80 ? '#f59e0b' : '#ef4444');
  var rateLabel = r.rate >= 90 ? 'Excellent' : (r.rate >= 80 ? 'Good' : 'Needs Improvement');
  
  var html = '<h3>&#128203; Child\'s Attendance Record</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:20px 0">';
  html += '<div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:#22c55e">' + r.present + '</div><div style="font-size:12px;color:#666;margin-top:4px">Days Present</div></div>';
  html += '<div style="background:#fef2f2;border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:#ef4444">' + r.absent + '</div><div style="font-size:12px;color:#666;margin-top:4px">Days Absent</div></div>';
  html += '<div style="background:#fffbeb;border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:#f59e0b">' + r.late + '</div><div style="font-size:12px;color:#666;margin-top:4px">Days Late</div></div>';
  html += '<div style="background:#f8fafc;border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:#334155">' + r.totalDays + '</div><div style="font-size:12px;color:#666;margin-top:4px">Total School Days</div></div>';
  html += '</div>';
  
  html += '<div style="background:#f7f7f7;border-radius:20px;height:32px;overflow:hidden;margin:16px 0">';
  html += '<div style="height:100%;background:linear-gradient(90deg,' + rateColor + ',' + rateColor + '80);border-radius:20px;width:' + r.rate + '%;display:flex;align-items:center;justify-content:center;transition:width 1s ease">';
  html += '<span style="color:#fff;font-size:13px;font-weight:700">' + r.rate + '% Attendance Rate</span>';
  html += '</div></div>';
  html += '<div style="text-align:center;font-size:14px;color:' + rateColor + ';font-weight:600">' + rateLabel + '</div>';
  
  el.innerHTML = html;
  
  // Update parent stat card for attendance
  var statEls = document.querySelectorAll('#parentDash .dash-stat b');
  if (statEls.length >= 2) statEls[1].textContent = r.rate + '%';
}



// ============================================
// SCHEDULE UPLOAD SYSTEM
// ============================================

function downloadSchedTemplate() {
  var cls = document.getElementById('schedClass').value;
  
  var csv = 'Day,Time,Subject,Teacher,Room\n';
  var days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  days.forEach(function(d) {
    csv += d + ',,,,\n';
  });
  
  var blob = new Blob([csv], {type: 'text/csv'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'schedule_' + cls.replace(/\s/g,'_') + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  
  showSchedStatus('Template downloaded! Fill in the schedule, save as CSV, then upload.', 'success');
}

function handleSchedUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var text = e.target.result;
    var lines = text.trim().split('\n');
    
    if (lines.length < 2) {
      showSchedStatus('Error: CSV is empty.', 'error');
      return;
    }
    
    var records = [];
    for (var i = 1; i < lines.length; i++) {
      var row = lines[i].split(',');
      if (!row[0] || !row[0].trim()) continue;
      
      var day = row[0].trim();
      var time = row[1] ? row[1].trim() : '';
      var subject = row[2] ? row[2].trim() : '';
      var teacher = row[3] ? row[3].trim() : '';
      var room = row[4] ? row[4].trim() : '';
      
      if (!time && !subject) continue;
      
      records.push({day: day, time: time, subject: subject, teacher: teacher, room: room});
    }
    
    if (records.length === 0) {
      showSchedStatus('Error: No valid records found.', 'error');
      return;
    }
    
    var cls = document.getElementById('schedClass').value;
    
    var html = '<div style="margin-bottom:12px"><strong>' + records.length + ' entries</strong> parsed</div>';
    html += '<div style="overflow-x:auto"><table><thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th></tr></thead><tbody>';
    
    var dayColors = {Monday:'#e8733a',Tuesday:'#0891b2',Wednesday:'#7c3aed',Thursday:'#059669',Friday:'#dc2626'};
    records.forEach(function(r) {
      var color = dayColors[r.day] || '#666';
      html += '<tr><td style="font-weight:600;color:' + color + '">' + r.day + '</td>';
      html += '<td>' + r.time + '</td>';
      html += '<td style="font-weight:600">' + r.subject + '</td>';
      html += '<td>' + r.teacher + '</td>';
      html += '<td>' + r.room + '</td></tr>';
    });
    
    html += '</tbody></table></div>';
    html += '<div style="display:flex;gap:10px;margin-top:16px">';
    html += '<button class="btn btn-p btn-sm" onclick="saveSchedule()">&#128190; Save Schedule</button>';
    html += '<button class="btn btn-s btn-sm" onclick="cancelSched()">Cancel</button>';
    html += '</div>';
    
    document.getElementById('schedPreview').innerHTML = html;
    window._pendingSched = records;
    window._pendingSchedClass = cls;
    
    showSchedStatus('CSV parsed! Review and click Save.', 'success');
  };
  reader.readAsText(file);
  event.target.value = '';
}

function saveSchedule() {
  if (!window._pendingSched || !window._pendingSchedClass) {
    toast('No schedule to save.', 'er');
    return;
  }
  
  var cls = window._pendingSchedClass;
  var records = window._pendingSched;
  var key = 'schedule_' + cls.replace(/\s/g, '_');
  
  saveData(key, records);
  
  window._pendingSched = null;
  window._pendingSchedClass = null;
  document.getElementById('schedPreview').innerHTML = '';
  
  toast(records.length + ' schedule entries saved!', 'su');
  showSchedStatus(records.length + ' entries saved for ' + cls + '!', 'success');
  updateSchedView();
}

function cancelSched() {
  window._pendingSched = null;
  window._pendingSchedClass = null;
  document.getElementById('schedPreview').innerHTML = '';
  var el = document.getElementById('schedUploadStatus');
  if (el) el.style.display = 'none';
}

function updateSchedView() {
  var cls = document.getElementById('schedClass').value;
  var key = 'schedule_' + cls.replace(/\s/g, '_');
  var data = loadData(key, []);
  
  var el = document.getElementById('savedSchedule');
  if (!el) return;
  if (!data || data.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--g5);font-size:14px">No schedule uploaded yet.</div>';
    return;
  }
  
  var dayColors = {Monday:'#e8733a',Tuesday:'#0891b2',Wednesday:'#7c3aed',Thursday:'#059669',Friday:'#dc2626'};
  var html = '<h4 style="font-size:15px;margin-bottom:12px">&#128197; Saved Schedule &mdash; ' + cls + '</h4>';
  html += '<div style="overflow-x:auto"><table><thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th></tr></thead><tbody>';
  
  data.forEach(function(r) {
    var color = dayColors[r.day] || '#666';
    html += '<tr><td style="font-weight:600;color:' + color + '">' + r.day + '</td>';
    html += '<td>' + r.time + '</td>';
    html += '<td style="font-weight:600">' + r.subject + '</td>';
    html += '<td>' + r.teacher + '</td>';
    html += '<td>' + r.room + '</td></tr>';
  });
  
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function showSchedStatus(msg, type) {
  var el = document.getElementById('schedUploadStatus');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = msg;
  if (type === 'success') {
    el.style.background = 'var(--sub)'; el.style.color = 'var(--su)'; el.style.border = '1px solid var(--su)';
  } else {
    el.style.background = 'var(--dab)'; el.style.color = 'var(--da)'; el.style.border = '1px solid var(--da)';
  }
}

// Load student schedule from Firebase
function loadStudentSchedule() {
  if (!curUser || curUser.type !== 'student') return;
  var grade = curUser.grade;
  if (!grade) return;
  
  var key = 'schedule_' + grade.replace(/\s/g, '_');
  var data = loadData(key, []);
  
  var el = document.getElementById('sdSchedContent');
  if (!el) return;
  
  if (!data || data.length === 0) {
    el.innerHTML = '<h3>&#128197; Class Schedule</h3><div style="text-align:center;padding:32px;color:var(--g5)"><div style="font-size:48px;margin-bottom:12px">&#128197;</div><p>No schedule uploaded yet.</p><p style="font-size:13px;margin-top:8px">Schedule will appear here once your adviser uploads it.</p></div>';
    return;
  }
  
  var days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  var dayColors = {Monday:'#e8733a',Tuesday:'#0891b2',Wednesday:'#7c3aed',Thursday:'#059669',Friday:'#dc2626'};
  
  var html = '<h3>&#128197; Class Schedule</h3>';
  
  days.forEach(function(day) {
    var entries = data.filter(function(r) { return r.day === day; });
    if (entries.length === 0) return;
    
    var color = dayColors[day] || '#666';
    html += '<div style="margin-bottom:16px">';
    html += '<h4 style="font-size:14px;color:' + color + ';margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid ' + color + '40">' + day + '</h4>';
    html += '<div style="display:flex;flex-direction:column;gap:6px">';
    
    entries.forEach(function(r) {
      html += '<div style="display:flex;gap:12px;padding:8px 12px;background:var(--g1);border-radius:8px;border-left:3px solid ' + color + ';align-items:center;flex-wrap:wrap">';
      html += '<span style="font-family:monospace;font-size:13px;color:var(--g5);min-width:90px">' + r.time + '</span>';
      html += '<span style="font-weight:600;flex:1;min-width:120px">' + r.subject + '</span>';
      html += '<span style="font-size:13px;color:var(--g5)">' + r.teacher + '</span>';
      if (r.room) html += '<span style="font-size:12px;padding:2px 8px;background:' + color + '15;color:' + color + ';border-radius:12px">' + r.room + '</span>';
      html += '</div>';
    });
    
    html += '</div></div>';
  });
  
  el.innerHTML = html;
}



// ============================================
// MY CLASSES - AUTO-GENERATED FROM DATA
// ============================================

function loadMyClasses() {
  var el = document.getElementById('tdClassesContent');
  if (!el) return;
  
  var keys = Object.keys(_cache);
  var classMap = {};
  
  // Scan grades data
  keys.forEach(function(k) {
    if (k.startsWith('grades_')) {
      var section = k.replace('grades_', '').replace(/_/g, ' ');
      if (!classMap[section]) classMap[section] = {students: 0, hasGrades: false, hasAttendance: false, hasSchedule: false};
      var data = _cache[k];
      if (data) {
        classMap[section].students = Object.keys(data).length;
        classMap[section].hasGrades = true;
      }
    }
  });
  
  // Scan attendance data
  keys.forEach(function(k) {
    if (k.startsWith('attendance_')) {
      var section = k.replace('attendance_', '').replace(/_/g, ' ');
      if (!classMap[section]) classMap[section] = {students: 0, hasGrades: false, hasAttendance: false, hasSchedule: false};
      classMap[section].hasAttendance = true;
      if (!classMap[section].students) {
        classMap[section].students = Object.keys(_cache[k]).length;
      }
    }
  });
  
  // Scan schedule data
  keys.forEach(function(k) {
    if (k.startsWith('schedule_')) {
      var section = k.replace('schedule_', '').replace(/_/g, ' ');
      if (!classMap[section]) classMap[section] = {students: 0, hasGrades: false, hasAttendance: false, hasSchedule: false};
      classMap[section].hasSchedule = true;
    }
  });
  
  var sections = Object.keys(classMap);
  
  if (sections.length === 0) {
    el.innerHTML = '<h3>&#128218; My Classes</h3><div style="text-align:center;padding:32px;color:var(--g5)"><div style="font-size:48px;margin-bottom:12px">&#128218;</div><p>No class data yet.</p><p style="font-size:13px;margin-top:8px">Upload grades, attendance, or schedule in the other tabs to see your classes here.</p></div>';
    return;
  }
  
  var html = '<h3>&#128218; My Classes <span style="font-size:14px;color:var(--g5);font-weight:400">(' + sections.length + ' sections)</span></h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-top:16px">';
  
  sections.forEach(function(sec) {
    var c = classMap[sec];
    html += '<div style="background:var(--g1);border-radius:12px;padding:18px;border:1px solid var(--g2)">';
    html += '<div style="font-weight:700;font-size:15px;margin-bottom:10px">' + sec + '</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
    html += '<span style="font-size:12px;padding:3px 10px;border-radius:12px;background:#e8733a20;color:#e8733a;font-weight:600">&#128100; ' + c.students + ' students</span>';
    html += '</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    html += '<span style="font-size:11px;padding:2px 8px;border-radius:8px;background:' + (c.hasGrades ? '#05966920' : '#eee') + ';color:' + (c.hasGrades ? '#059669' : '#aaa') + '">' + (c.hasGrades ? '&#10003;' : '&#10007;') + ' Grades</span>';
    html += '<span style="font-size:11px;padding:2px 8px;border-radius:8px;background:' + (c.hasAttendance ? '#0891b220' : '#eee') + ';color:' + (c.hasAttendance ? '#0891b2' : '#aaa') + '">' + (c.hasAttendance ? '&#10003;' : '&#10007;') + ' Attendance</span>';
    html += '<span style="font-size:11px;padding:2px 8px;border-radius:8px;background:' + (c.hasSchedule ? '#7c3aed20' : '#eee') + ';color:' + (c.hasSchedule ? '#7c3aed' : '#aaa') + '">' + (c.hasSchedule ? '&#10003;' : '&#10007;') + ' Schedule</span>';
    html += '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  el.innerHTML = html;
}



// ============================================
// SCHOOL CALENDAR
// ============================================

function goToCalendar() {
  var el = document.getElementById('schoolCalendar');
  if (el) el.scrollIntoView({behavior:'smooth'});
}

var calMonth = new Date().getMonth();
var calYear = new Date().getFullYear();

function renderCalendar() {
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var el = document.getElementById('calMonthYear');
  var grid = document.getElementById('calGrid');
  if (!el || !grid) return;
  
  el.textContent = months[calMonth] + ' ' + calYear;
  
  var events = loadData('events', DEFAULT_EVENTS);
  
  // Get event dates for this month
  var eventDates = {};
  events.forEach(function(ev) {
    if (!ev.date) return;
    var d = new Date(ev.date + 'T00:00:00');
    if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
      var day = d.getDate();
      if (!eventDates[day]) eventDates[day] = [];
      eventDates[day].push(ev);
    }
  });
  
  var firstDay = new Date(calYear, calMonth, 1).getDay();
  var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  var today = new Date();
  var isCurrentMonth = today.getMonth() === calMonth && today.getFullYear() === calYear;
  var todayDate = today.getDate();
  
  var html = '';
  
  // Empty cells before first day
  for (var i = 0; i < firstDay; i++) {
    html += '<div style="padding:8px;min-height:50px"></div>';
  }
  
  // Day cells
  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = isCurrentMonth && d === todayDate;
    var hasEvent = eventDates[d];
    var isSunday = (firstDay + d - 1) % 7 === 0;
    
    var bg = isToday ? '#e8733a' : (hasEvent ? '#FFF3EB' : '#f8f8f8');
    var color = isToday ? '#fff' : (isSunday ? '#e8733a' : '#333');
    var border = hasEvent ? '2px solid #e8733a' : '1px solid #eee';
    var cursor = hasEvent ? 'pointer' : 'default';
    
    html += '<div onclick="' + (hasEvent ? 'showDayEvents(' + d + ')' : '') + '" style="padding:6px;min-height:50px;border-radius:8px;background:' + bg + ';border:' + border + ';cursor:' + cursor + ';position:relative;transition:all .2s">';
    html += '<div style="font-size:14px;font-weight:' + (isToday || hasEvent ? '700' : '400') + ';color:' + color + '">' + d + '</div>';
    
    if (hasEvent) {
      var count = eventDates[d].length;
      html += '<div style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);display:flex;gap:2px">';
      for (var j = 0; j < Math.min(count, 3); j++) {
        html += '<div style="width:5px;height:5px;border-radius:50%;background:#e8733a"></div>';
      }
      html += '</div>';
    }
    
    html += '</div>';
  }
  
  grid.innerHTML = html;
}

function showDayEvents(day) {
  var events = loadData('events', DEFAULT_EVENTS);
  var dayEvents = events.filter(function(ev) {
    if (!ev.date) return false;
    var d = new Date(ev.date + 'T00:00:00');
    return d.getDate() === day && d.getMonth() === calMonth && d.getFullYear() === calYear;
  });
  
  var el = document.getElementById('calEventDetails');
  if (!el || dayEvents.length === 0) return;
  
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var html = '<h4 style="font-size:15px;margin-bottom:12px;color:#e8733a">' + months[calMonth] + ' ' + day + ', ' + calYear + '</h4>';
  
  dayEvents.forEach(function(ev) {
    var statusColor = ev.status === 'Upcoming' ? '#059669' : (ev.status === 'Completed' ? '#666' : '#ef4444');
    html += '<div style="padding:12px;background:#fff;border-radius:10px;margin-bottom:8px;border-left:3px solid #e8733a">';
    html += '<div style="font-weight:700;font-size:15px">' + ev.name + '</div>';
    html += '<div style="display:flex;gap:12px;margin-top:6px;font-size:13px;color:#666;flex-wrap:wrap">';
    if (ev.time) html += '<span>&#128336; ' + ev.time + '</span>';
    if (ev.venue) html += '<span>&#128205; ' + ev.venue + '</span>';
    html += '<span style="color:' + statusColor + ';font-weight:600">' + ev.status + '</span>';
    html += '</div>';
    if (ev.desc) html += '<p style="margin-top:6px;font-size:13px;color:#555">' + ev.desc + '</p>';
    html += '</div>';
  });
  
  el.innerHTML = html;
  el.style.display = 'block';
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  document.getElementById('calEventDetails').style.display = 'none';
  renderCalendar();
}



// ============================================
// TEACHER RESOURCES (PASSWORD PROTECTED)
// ============================================

function openResourcesModal() {
  var modal = document.getElementById('resourcesModal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.getElementById('resPassInput').value = '';
  document.getElementById('resPassError').style.display = 'none';
  
  // Reset to password screen
  document.getElementById('resModalContent').innerHTML = 
    '<h2 style="margin-bottom:8px">&#128274; Teacher Resources</h2>' +
    '<p style="color:#666;margin-bottom:20px">Enter password to access resources</p>' +
    '<div style="display:flex;gap:8px;margin-bottom:16px">' +
    '<input id="resPassInput" type="password" placeholder="Enter password" style="flex:1;padding:12px 16px;border:1.5px solid #ddd;border-radius:10px;font-size:15px" onkeypress="if(event.key===\'Enter\')checkResPassword()">' +
    '<button onclick="checkResPassword()" style="padding:12px 24px;background:#e8733a;color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer">Open</button>' +
    '</div>' +
    '<div id="resPassError" style="display:none;color:#ef4444;font-size:13px"></div>';
  
  setTimeout(function() {
    var inp = document.getElementById('resPassInput');
    if (inp) inp.focus();
  }, 100);
}

function closeResModal() {
  var modal = document.getElementById('resourcesModal');
  if (modal) modal.style.display = 'none';
}

function checkResPassword() {
  var input = document.getElementById('resPassInput');
  if (!input) return;
  var pw = input.value;
  
  var res = loadData('resources', {password:'', links:[]});
  
  if (!res.password) {
    document.getElementById('resPassError').style.display = 'block';
    document.getElementById('resPassError').textContent = 'No password set yet. Contact admin.';
    return;
  }
  
  if (pw !== res.password) {
    document.getElementById('resPassError').style.display = 'block';
    document.getElementById('resPassError').textContent = 'Incorrect password. Try again.';
    input.value = '';
    input.focus();
    return;
  }
  
  // Password correct - show resources
  showResources(res.links || []);
}

function showResources(links) {
  var el = document.getElementById('resModalContent');
  if (!el) return;
  
  var html = '<h2 style="margin-bottom:4px">&#128194; Teacher Resources</h2>';
  html += '<p style="color:#666;margin-bottom:20px;font-size:14px">' + links.length + ' resources available</p>';
  
  if (links.length === 0) {
    html += '<div style="text-align:center;padding:32px;color:#999"><div style="font-size:48px;margin-bottom:12px">&#128194;</div><p>No resources added yet.</p><p style="font-size:13px">Ask the admin to add resource links.</p></div>';
    el.innerHTML = html;
    return;
  }
  
  var catColors = {Modules:'#e8733a',Textbooks:'#1a365d',Handouts:'#059669',Worksheets:'#7c3aed',Training:'#0891b2',Forms:'#dc2626',General:'#666'};
  
  // Group by category
  var grouped = {};
  links.forEach(function(l) {
    var cat = l.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(l);
  });
  
  Object.keys(grouped).forEach(function(cat) {
    var color = catColors[cat] || '#666';
    html += '<div style="margin-bottom:18px">';
    html += '<h4 style="font-size:14px;color:' + color + ';margin-bottom:10px;padding-bottom:4px;border-bottom:2px solid ' + color + '30">' + cat + '</h4>';
    
    grouped[cat].forEach(function(l) {
      html += '<a href="' + l.url + '" target="_blank" style="display:block;text-decoration:none;color:inherit;padding:12px 14px;background:#f8f8f8;border-radius:10px;margin-bottom:8px;border:1px solid #eee;transition:all .2s">';
      html += '<div style="display:flex;align-items:center;gap:10px">';
      html += '<div style="width:36px;height:36px;border-radius:8px;background:' + color + '15;display:flex;align-items:center;justify-content:center;font-size:18px">&#128279;</div>';
      html += '<div style="flex:1"><div style="font-weight:600;font-size:14px;color:#333">' + l.title + '</div>';
      if (l.desc) html += '<div style="font-size:12px;color:#888;margin-top:2px">' + l.desc + '</div>';
      html += '</div>';
      html += '<span style="color:' + color + ';font-size:13px">Open &#8599;</span>';
      html += '</div></a>';
    });
    
    html += '</div>';
  });
  
  el.innerHTML = html;
}



// ============================================
// COMMUNITY SECTIONS RENDERING
// ============================================

function renderCommunity() {
  renderAchieveWall();
  renderGalleryWall();
  renderHistoryTimeline();
  renderAlumniWall();
}

function renderAchieveWall() {
  var data = loadData('achievements', []);
  var el = document.getElementById('achieveWall');
  if (!el) return;
  if (data.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:#999;grid-column:1/-1">No achievements posted yet.</div>';
    return;
  }
  var catColors = {Academic:'#e8733a',Sports:'#1a365d',Arts:'#7c3aed',Community:'#059669',School:'#dc2626'};
  var catIcons = {Academic:'&#127942;',Sports:'&#9917;',Arts:'&#127912;',Community:'&#129309;',School:'&#127979;'};
  var html = '';
  data.forEach(function(a) {
    var color = catColors[a.cat] || '#666';
    var icon = catIcons[a.cat] || '&#127942;';
    html += '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border-left:4px solid ' + color + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">';
    html += '<span style="font-size:28px">' + icon + '</span>';
    html += '<span style="font-size:12px;padding:3px 10px;border-radius:12px;background:' + color + '15;color:' + color + ';font-weight:600">' + (a.cat||'') + ' ' + (a.year||'') + '</span>';
    html += '</div>';
    html += '<h4 style="font-size:15px;margin-bottom:6px;color:#1a202c">' + a.title + '</h4>';
    if (a.desc) html += '<p style="font-size:13px;color:#666;line-height:1.5">' + a.desc + '</p>';
    html += '</div>';
  });
  el.innerHTML = html;
}

function renderGalleryWall() {
  var data = loadData('gallery', []);
  var el = document.getElementById('galleryWall');
  if (!el) return;
  if (data.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:#999;grid-column:1/-1">No photo albums yet.</div>';
    return;
  }
  var html = '';
  data.forEach(function(a) {
    var coverBg = a.cover ? 'url(' + a.cover + ')' : 'linear-gradient(135deg,#e8733a,#f09a5e)';
    html += '<a href="' + a.url + '" target="_blank" style="text-decoration:none;color:inherit">';
    html += '<div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);transition:transform .2s;cursor:pointer" onmouseover="this.style.transform=\'translateY(-3px)\'" onmouseout="this.style.transform=\'none\'">';
    html += '<div style="height:140px;background:' + coverBg + ';background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center">';
    if (!a.cover) html += '<span style="font-size:40px;opacity:.8">&#128248;</span>';
    html += '</div>';
    html += '<div style="padding:14px">';
    html += '<h4 style="font-size:14px;margin-bottom:4px">' + a.title + '</h4>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<span style="font-size:12px;color:#999">' + (a.cat||'') + '</span>';
    html += '<span style="font-size:11px;color:#e8733a;font-weight:600">View Album &#8599;</span>';
    html += '</div></div></div></a>';
  });
  el.innerHTML = html;
}

function renderHistoryTimeline() {
  var data = loadData('history', []);
  var el = document.getElementById('historyTimeline');
  if (!el) return;
  if (data.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:#999">No milestones yet.</div>';
    return;
  }
  data.sort(function(a,b){return (a.year||0)-(b.year||0);});
  var html = '<div style="position:relative;padding-left:30px">';
  html += '<div style="position:absolute;left:10px;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#e8733a,#1a365d);border-radius:3px"></div>';
  data.forEach(function(a, i) {
    var isLast = i === data.length - 1;
    html += '<div style="position:relative;margin-bottom:24px;padding-left:20px">';
    html += '<div style="position:absolute;left:-24px;top:4px;width:14px;height:14px;border-radius:50%;background:' + (isLast ? '#e8733a' : '#fff') + ';border:3px solid #e8733a;z-index:1"></div>';
    html += '<div style="background:#fff;border-radius:12px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.05)">';
    html += '<span style="font-size:12px;padding:2px 10px;border-radius:12px;background:#e8733a15;color:#e8733a;font-weight:700">' + (a.year||'') + '</span>';
    html += '<h4 style="font-size:15px;margin:8px 0 4px;color:#1a202c">' + a.title + '</h4>';
    if (a.desc) html += '<p style="font-size:13px;color:#666;line-height:1.5">' + a.desc + '</p>';
    html += '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderAlumniWall() {
  var data = loadData('alumni', []);
  var el = document.getElementById('alumniWall');
  if (!el) return;
  if (data.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:#999;grid-column:1/-1">No alumni information yet.</div>';
    return;
  }
  data.sort(function(a,b){return (b.year||0)-(a.year||0);});
  var html = '';
  data.forEach(function(a) {
    html += '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);text-align:center">';
    html += '<div style="font-size:36px;margin-bottom:8px">&#127891;</div>';
    html += '<h4 style="font-size:16px;color:#1a365d;margin-bottom:4px">Batch ' + (a.year||'') + '</h4>';
    if (a.title) html += '<p style="font-size:13px;color:#e8733a;font-weight:600;margin-bottom:6px">' + a.title + '</p>';
    if (a.desc) html += '<p style="font-size:12px;color:#666;margin-bottom:10px">' + a.desc + '</p>';
    if (a.url) html += '<a href="' + a.url + '" target="_blank" style="font-size:12px;color:#e8733a;text-decoration:none;font-weight:600">Connect with Batch &#8599;</a>';
    html += '</div>';
  });
  el.innerHTML = html;
}

// Hook into login to load grades
var _origLogin = doLogin;
doLogin = function() {
  _origLogin();
  if (curUser) {
    setTimeout(function() { loadStudentGrades(); loadStudentAttendance(); loadStudentSchedule(); }, 100);
  }
};
