// ============================================
// DBAMINHS FIREBASE DATA LAYER
// Replaces localStorage with Cloud Firestore
// ============================================

var firebaseConfig = {
  apiKey: "AIzaSyBV3UhpZNgn19cvgAHqckNniGTu8fX8gXw",
  authDomain: "dbaminhs-bd727.firebaseapp.com",
  projectId: "dbaminhs-bd727",
  storageBucket: "dbaminhs-bd727.firebasestorage.app",
  messagingSenderId: "459830769786",
  appId: "1:459830769786:web:8f537cc381e242222a63c3"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
console.log("Firebase connected!");

// Cache for fast access
var _cache = {};

// Load data from Firestore (returns from cache first, then updates)
function loadData(key, defaults) {
  if (_cache[key]) return _cache[key];
  return JSON.parse(JSON.stringify(defaults));
}

// Save data to Firestore AND cache
function saveData(key, data) {
  _cache[key] = data;
  db.collection('portal_data').doc(key).set({
    data: JSON.stringify(data),
    updated: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    console.log('Saved to Firebase:', key);
  }).catch(function(err) {
    console.error('Firebase save error:', key, err);
  });
}

// Load ALL data from Firestore into cache (called on page load)
function loadAllFromFirebase(callback) {
  db.collection('portal_data').get().then(function(snapshot) {
    snapshot.forEach(function(doc) {
      try {
        _cache[doc.id] = JSON.parse(doc.data().data);
      } catch(e) {}
    });
    console.log('All data loaded from Firebase! Keys:', Object.keys(_cache).join(', '));
    if (callback) callback();
  }).catch(function(err) {
    console.error('Firebase load error:', err);
    if (callback) callback();
  });
}

// Listen for real-time changes (for portal to auto-update when admin edits)
function listenForChanges(callback) {
  db.collection('portal_data').onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'modified' || change.type === 'added') {
        try {
          _cache[change.doc.id] = JSON.parse(change.doc.data().data);
          console.log('Real-time update:', change.doc.id);
        } catch(e) {}
      }
    });
    if (callback) callback();
  });
}

function getNextId(arr) {
  var max = 0;
  arr.forEach(function(item) { if (item.id > max) max = item.id; });
  return max + 1;
}

function formatDate(d) {
  if (!d) return '';
  var dt = new Date(d + 'T00:00:00');
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
}

function formatDateShort(d) {
  var dt = new Date(d + 'T00:00:00');
  var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return { month: months[dt.getMonth()], day: dt.getDate() };
}

function resetAllData() {
  ['news','events','students','teachers','pending','settings','accounts'].forEach(function(key) {
    db.collection('portal_data').doc(key).delete();
  });
  _cache = {};
}

// ============================================
// DEFAULT DATA (used as fallback)
// ============================================
var DEFAULT_NEWS = [
  {id:1,title:'DBAMINHS Students Excel at Regional Science Fair',cat:'Achievement',date:'2026-04-02',status:'Published',content:'Our Grade 10 students brought home gold and silver medals at the Regional Science and Technology Fair held in Batangas City.'},
  {id:2,title:'Enrollment for SY 2026-2027 Now Open',cat:'Announcement',date:'2026-03-28',status:'Published',content:'Online and walk-in enrollment is now open for all grade levels.'},
  {id:3,title:'Brigada Eskwela Volunteer Registration',cat:'Community',date:'2026-03-20',status:'Published',content:'Join us in preparing our school for the new academic year!'},
  {id:4,title:'National Reading Month Celebration',cat:'Academic',date:'2026-03-15',status:'Draft',content:'Celebrating the joy of reading across all grade levels.'},
  {id:5,title:'Division Athletics Meet Champions',cat:'Achievement',date:'2026-03-10',status:'Published',content:'DBAMINHS athletes won multiple medals at the Division Athletics Meet.'}
];
var DEFAULT_EVENTS = [
  {id:1,name:'Recognition Day',date:'2026-04-10',time:'8:00 AM',venue:'School Gymnasium',status:'Upcoming',desc:'Awards ceremony for outstanding students'},
  {id:2,name:'Moving Up Ceremony - Grade 10',date:'2026-04-15',time:'9:00 AM',venue:'School Covered Court',status:'Upcoming',desc:'Students advancing to Senior High'},
  {id:3,name:'Graduation - Grade 12',date:'2026-04-18',time:'2:00 PM',venue:'School Gymnasium',status:'Upcoming',desc:'Commencement exercises'},
  {id:4,name:'Brigada Eskwela 2026',date:'2026-05-20',time:'7:00 AM',venue:'School Campus',status:'Upcoming',desc:'School clean-up and preparation'},
  {id:5,name:'First Day of Classes SY 2026-2027',date:'2026-06-02',time:'7:30 AM',venue:'All Classrooms',status:'Upcoming',desc:'New school year begins'}
];
var DEFAULT_STUDENTS = [
  {id:1,lrn:'136789012345',name:'Juan Dela Cruz',grade:'Grade 10 - Rizal',contact:'09171234567',status:'Active'},
  {id:2,lrn:'136789012346',name:'Maria Santos',grade:'Grade 9 - Mabini',contact:'09181234567',status:'Active'},
  {id:3,lrn:'136789012347',name:'Pedro Reyes',grade:'Grade 11 - ABM',contact:'09191234567',status:'Active'},
  {id:4,lrn:'136789012348',name:'Ana Garcia',grade:'Grade 7 - Bonifacio',contact:'09201234567',status:'Active'},
  {id:5,lrn:'136789012349',name:'Carlos Mendoza',grade:'Grade 12 - HUMSS',contact:'09211234567',status:'Active'},
  {id:6,lrn:'136789012350',name:'Sofia Villanueva',grade:'Grade 8 - Luna',contact:'09221234567',status:'Inactive'}
];
var DEFAULT_TEACHERS = [
  {id:1,eid:'T-2024-001',name:'Mrs. Elena Bautista',dept:'Mathematics',pos:'Head Teacher III',contact:'09171111111'},
  {id:2,eid:'T-2024-002',name:'Mr. Ricardo Torres',dept:'Science',pos:'Teacher II',contact:'09172222222'},
  {id:3,eid:'T-2024-003',name:'Ms. Patricia Lim',dept:'English',pos:'Teacher I',contact:'09173333333'},
  {id:4,eid:'T-2024-004',name:'Mr. Jose Fernandez',dept:'Filipino',pos:'Master Teacher I',contact:'09174444444'},
  {id:5,eid:'T-2024-005',name:'Mrs. Carmen Ramos',dept:'TLE',pos:'Teacher III',contact:'09175555555'}
];
var DEFAULT_PENDING = [
  {id:1,name:'Angelo Martinez',type:'Student',email:'angelo@email.com',idnum:'136789012351',date:'2026-04-03'},
  {id:2,name:'Rica Gonzales',type:'Parent',email:'rica@email.com',idnum:'136789012345',date:'2026-04-02'},
  {id:3,name:'Mark Villanueva',type:'Student',email:'mark@email.com',idnum:'136789012352',date:'2026-04-01'}
];
var DEFAULT_SETTINGS = {
  schoolName:'Dr. Bonifacio A. Masilungan Integrated National High School',
  schoolId:'307714',schoolYear:'2025-2026',address:'Brgy. Lalayat, San Jose, Batangas',
  phone:'(043) 332 8939',email:'307714@deped.gov.ph',
  motto:'Nurturing Minds, Building Futures, Serving the Community',principal:'',division:'Division of Batangas',sections:['Grade 7 - Bonifacio','Grade 8 - Luna','Grade 9 - Mabini','Grade 10 - Rizal','Grade 11 - ABM','Grade 11 - HUMSS','Grade 12 - ABM','Grade 12 - HUMSS']
};


// ============================================
// SUBJECT DEFINITIONS PER CLUSTER
// ============================================
var CLUSTER_SUBJECTS = {
  'JHS': ['Filipino','English','Mathematics','Science','AP','EsP','TLE','Music & Arts','PE & Health'],
  'SHS-Core': ['Mabisang Komunikasyon','Effective Communication','General Mathematics','General Science','Life and Career Skills','Pag-aaral ng Kasaysayan at Lipunang Pilipino'],
  'ASSH': ['Arts 1','Arts 2','Citizenship and Civic Engagement','Contemporary Literature 1','Contemporary Literature 2','Creative Composition 1','Creative Composition 2','Filipino 1','Filipino 2','Filipino Identity Through the Arts','Introduction to Philosophy','Leadership and Management in the Arts','Malikhaing Pagsulat','Philippine Governance','Social Sciences Theory and Practice'],
  'Business': ['Business 1 - Basic Accounting','Business 2 - Business Finance','Business 3 - Business Economics','Contemporary Marketing','Entrepreneurship','Intro to Organization and Management'],
  'STEM': ['Biology 1','Biology 2','Chemistry 1','Chemistry 2','Earth and Space Science 1','Earth and Space Science 2','Finite Mathematics 1','Finite Mathematics 2','Physics 1','Physics 2'],
  'Sports': ['Human Movement 1','Human Movement 2','Physical Education 1','Physical Education 2','Sports Activity Management','Sports Coaching','Sports Officiating'],
  'ICT': ['Broadband Installation','Computer Programming (.NET Technology)','Computer Programming (Java)','Computer Programming (Oracle Database)','Computer Systems Servicing','Contact Center Services']
};

function getSubjectsForSection(sectionName, sections) {
  var sec = null;
  var name = sectionName.toLowerCase();
  if (sections) {
    for (var i = 0; i < sections.length; i++) {
      if (typeof sections[i] === 'object' && sections[i].name === sectionName) {
        sec = sections[i]; break;
      }
    }
  }
  
  var cluster = sec ? sec.cluster : null;
  
  // Auto-detect cluster from section name if not assigned
  if (!cluster) {
    if (name.indexOf('grade 7') > -1 || name.indexOf('grade 8') > -1 || name.indexOf('grade 9') > -1 || name.indexOf('grade 10') > -1) {
      cluster = 'JHS';
    } else if (name.indexOf('abm') > -1 || name.indexOf('business') > -1) {
      cluster = 'Business';
    } else if (name.indexOf('humss') > -1 || name.indexOf('assh') > -1 || name.indexOf('arts') > -1) {
      cluster = 'ASSH';
    } else if (name.indexOf('ict') > -1 || name.indexOf('computer') > -1 || name.indexOf('programming') > -1) {
      cluster = 'ICT';
    } else if (name.indexOf('stem') > -1 || name.indexOf('tech') > -1) {
      cluster = 'STEM';
    } else if (name.indexOf('sports') > -1 || name.indexOf('pe') > -1) {
      cluster = 'Sports';
    } else if (name.indexOf('grade 11') > -1 || name.indexOf('grade 12') > -1) {
      cluster = 'ASSH';
    } else {
      cluster = 'JHS';
    }
  }
  
  if (cluster === 'JHS') return CLUSTER_SUBJECTS['JHS'];
  var subjects = CLUSTER_SUBJECTS['SHS-Core'].slice();
  if (CLUSTER_SUBJECTS[cluster]) {
    subjects = subjects.concat(CLUSTER_SUBJECTS[cluster]);
  }
  return subjects;
}
