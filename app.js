/* 
  SUEZY - Premium Online Law Firm Website Logic
  Created by: N Sai Pracheet Reddy
  Contains Booking, Lawyer Finder, Document Generator, Legal Search, and Client Portal.
*/

// --- 1. GLOBAL STATE & CONFIGS ---
let currentQuizStep = 1;
let quizAnswers = { area: '', location: '', tier: '' };
let currentDocType = 'lease';
let selectedTimeSlotText = '';
let currentBookingStep = 1;
let matchedLawyer = null;

// Mock Indian Legal Search Database
const legalSearchDb = [
  {
    keywords: ['cheque bounce', 'section 138', 'dishonour', 'ni act', 'cheque'],
    act: 'Section 138 - Negotiable Instruments Act, 1881',
    title: 'Dishonour of Cheque for Insufficiency of Funds',
    desc: 'When a cheque is bounced due to insufficient funds, it is a criminal offence in India. The drawee must issue a legal notice to the drawer within 30 days of receiving the return memo.',
    steps: [
      'Obtain Cheque Return Memo from your bank.',
      'Serve a formal Legal Notice to the drawer within 30 days of the memo date.',
      'Provide 15 days to the drawer to make the payment.',
      'If unpaid after 15 days, file a Criminal Complaint in Magistrate Court within 30 days.'
    ]
  },
  {
    keywords: ['domestic violence', 'section 498a', 'cruelty', 'dowry', 'ipc 498a'],
    act: 'Section 498A - Indian Penal Code (IPC) / BNS Section 85',
    title: 'Husband or relative of husband of a woman subjecting her to cruelty',
    desc: 'Cruelty by husband or his family in connection with dowry or mental/physical harassment. This is a cognizable, non-bailable offence in India.',
    steps: [
      'File an FIR at the nearest Police Station or contact the Women Cell (Helpline: 1091).',
      'Seek counseling or domestic protection order under the Protection of Women from Domestic Violence Act, 2005.',
      'Apply for medical check-up if physical injuries exist.'
    ]
  },
  {
    keywords: ['consumer protection', 'fraud', 'deficiency', 'e-commerce refund', 'copra'],
    act: 'Consumer Protection Act, 2019 (COPRA)',
    title: 'Deficiency of Service / Defective Goods',
    desc: 'Provides recourse for consumers against unfair trade practices, defective products, and deficient services by companies in India.',
    steps: [
      'Send a formal grievance to the merchant via email/letter.',
      'File a complaint online through the Integrated Grievance Redressal Mechanism (e-Daakhil portal).',
      'Submit written petition to the District Consumer Forum (for claims up to ₹50 Lakhs).'
    ]
  },
  {
    keywords: ['cyber', 'hacking', 'phishing', 'section 66', 'data leak', 'cyber crime'],
    act: 'Section 66 - Information Technology Act, 2000',
    title: 'Computer Related Offences & Identity Theft',
    desc: 'Deals with unauthorized access to computer systems, data theft, phishing, social media impersonation, and online banking frauds.',
    steps: [
      'Immediately file a complaint on the National Cyber Crime Reporting Portal (cybercrime.gov.in).',
      'Save screenshots, URLs, IP logs, and bank statement evidence.',
      'Report financial fraud to your bank within 3 hours to freeze beneficiary transfers.'
    ]
  },
  {
    keywords: ['anticipatory bail', 'section 438', 'arrest', 'bail', 'crpc 438'],
    act: 'Section 438 - Code of Criminal Procedure (CrPC)',
    title: 'Direction for Grant of Bail to Person Apprehending Arrest',
    desc: 'Allows a person who anticipates arrest on accusation of a non-bailable offence to apply to the Sessions Court or High Court for anticipatory bail.',
    steps: [
      'Draft a detailed petition explaining the baselessness of the accusation.',
      'File before the District Sessions Court or state High Court.',
      'Court evaluates criminal record, severity of charges, and risk of flight before granting bail.'
    ]
  },
  {
    keywords: ['rera', 'builder delay', 'property possession', 'apartment', 'flat delay'],
    act: 'Real Estate (Regulation and Development) Act, 2016 (RERA)',
    title: 'Delay in Property Possession / Structural Defects',
    desc: 'Protects homebuyers from delayed project completion and guarantees refund of interest and compensation from real estate developers.',
    steps: [
      'Verify builder’s RERA registration number on the state portal.',
      'File a formal complaint before the state RERA Authority/Adjudicating Officer.',
      'Demand interest for delay or total refund of deposited amount.'
    ]
  }
];


// --- 2. HEADER & NAVIGATION ---
window.addEventListener('scroll', () => {
  const header = document.getElementById('main-header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

function toggleMobileMenu() {
  const navMenu = document.getElementById('nav-menu');
  const hamburger = document.getElementById('hamburger');
  navMenu.classList.toggle('active');
  
  // Quick styling adjustment for mobile overlay menu
  if (navMenu.classList.contains('active')) {
    navMenu.style.display = 'flex';
    navMenu.style.flexDirection = 'column';
    navMenu.style.position = 'absolute';
    navMenu.style.top = '75px';
    navMenu.style.left = '20px';
    navMenu.style.right = '20px';
    navMenu.style.background = 'rgba(12, 22, 48, 0.98)';
    navMenu.style.borderRadius = '20px';
    navMenu.style.padding = '30px';
    navMenu.style.border = '1px solid var(--accent-gold)';
    hamburger.querySelectorAll('span').forEach((el, index) => {
      if (index === 0) el.style.transform = 'rotate(45deg) translate(5px, 5px)';
      if (index === 1) el.style.opacity = '0';
      if (index === 2) el.style.transform = 'rotate(-45deg) translate(5px, -5px)';
    });
  } else {
    navMenu.removeAttribute('style');
    hamburger.querySelectorAll('span').forEach((el) => el.removeAttribute('style'));
  }
}

// Close mobile menu on nav link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    // Remove active markers
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const navMenu = document.getElementById('nav-menu');
    if (navMenu.classList.contains('active')) {
      toggleMobileMenu();
    }
  });
});


// --- 3. ADVOCATE DIRECTORY & GEOLOCATION ---
let userCoordinates = null;
const SUEZY_HQ = { lat: 12.9738, lng: 77.6119 }; // Brigade Road, Bangalore

const lawyersList = [
  {
    name: 'Adv. Ananya Sharma',
    specialty: 'Corporate & Startup',
    subSpecialty: 'Senior Corporate Dispute & Funding Counsel',
    exp: 14,
    cases: 340,
    successRate: 96,
    city: 'Bangalore',
    area: 'Indiranagar',
    lat: 12.9784,
    lng: 77.6408,
    bio: 'Expert in startup incorporation, SHA litigation, and regulatory compliance before NCLT.',
    rating: '4.9/5',
    avatar: '⚖️'
  },
  {
    name: 'Adv. Vikramaditya Roy',
    specialty: 'Corporate & Startup',
    subSpecialty: 'Lead M&A and Commercial Contracts Specialist',
    exp: 11,
    cases: 290,
    successRate: 94,
    city: 'Delhi NCR',
    area: 'Connaught Place',
    lat: 28.6304,
    lng: 77.2177,
    bio: 'Drafted over 800 founders agreements, venture agreements, and manages intellectual property holdings.',
    rating: '4.8/5',
    avatar: '👨‍💼'
  },
  {
    name: 'Adv. Karthik Gowda',
    specialty: 'Property & Civil',
    subSpecialty: 'Real Estate & Land Acquisition Specialist',
    exp: 15,
    cases: 420,
    successRate: 97,
    city: 'Bangalore',
    area: 'Koramangala',
    lat: 12.9352,
    lng: 77.6245,
    bio: '15 years of title clearances, joint development agreement audits, and RERA tribunal representations.',
    rating: '4.9/5',
    avatar: '🏛️'
  },
  {
    name: 'Adv. Sunita Deshmukh',
    specialty: 'Family Law & Wills',
    subSpecialty: 'Family Court Mediator & Estate Planner',
    exp: 12,
    cases: 410,
    successRate: 95,
    city: 'Mumbai',
    area: 'Bandra West',
    lat: 19.0596,
    lng: 72.8295,
    bio: 'Expert in drafting mutual divorces, complex trust deeds, registered wills, and domestic protection cases.',
    rating: '4.8/5',
    avatar: '📜'
  },
  {
    name: 'Adv. Kabir Singh Johar',
    specialty: 'Criminal Law & Bail',
    subSpecialty: 'Criminal Defense & Anticipatory Bail Advocate',
    exp: 18,
    cases: 600,
    successRate: 98,
    city: 'Delhi NCR',
    area: 'Saket',
    lat: 28.5244,
    lng: 77.2066,
    bio: 'Active practitioner in NDPS, PMLA white-collar crimes, and criminal trial representations.',
    rating: '4.9/5',
    avatar: '⚖️'
  },
  {
    name: 'Adv. Priya Malhotra',
    specialty: 'IPR & Trademarks',
    subSpecialty: 'Registered Patent & Trademark Attorney',
    exp: 8,
    cases: 310,
    successRate: 92,
    city: 'Bangalore',
    area: 'Whitefield',
    lat: 12.9698,
    lng: 77.7499,
    bio: 'Specializes in patent prosecutions, trademark opposition briefs, and cyber copyright protections.',
    rating: '4.8/5',
    avatar: '🛡️'
  },
  {
    name: 'Adv. Meenakshi Reddy',
    specialty: 'Property & Civil',
    subSpecialty: 'Civil Litigation & Land Disputes',
    exp: 9,
    cases: 220,
    successRate: 93,
    city: 'Hyderabad',
    area: 'Gachibowli',
    lat: 17.4401,
    lng: 78.3489,
    bio: 'Specialist in injunctions, recovery suits, and lease disputes in High Courts.',
    rating: '4.7/5',
    avatar: '👩‍💼'
  },
  {
    name: 'Adv. Shalini Hegde',
    specialty: 'Family Law & Wills',
    subSpecialty: 'Divorce & Succession Counsel',
    exp: 10,
    cases: 280,
    successRate: 94,
    city: 'Bangalore',
    area: 'Jayanagar',
    lat: 12.9299,
    lng: 77.5824,
    bio: 'Dedicated counsel for family disputes, alimony rights, adoption clearances, and registered wills.',
    rating: '4.8/5',
    avatar: '👩‍💼'
  }
];

// Haversine Distance Formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Tab Switching inside Finder
function switchFinderTab(tabName) {
  document.querySelectorAll('.finder-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.finder-tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById(`btn-tab-directory`).classList.remove('active');
  document.getElementById(`btn-tab-quiz`).classList.remove('active');

  const activeTabContent = document.getElementById(`finder-${tabName}-view`);
  activeTabContent.style.display = 'block';
  setTimeout(() => activeTabContent.classList.add('active'), 10);
  document.getElementById(`btn-tab-${tabName}`).classList.add('active');
  
  if (tabName === 'directory') {
    renderLawyersDirectory(lawyersList, userCoordinates);
  }
}

// Render the Directory Grid
function renderLawyersDirectory(list, userCoords = null) {
  const grid = document.getElementById('lawyers-directory-grid');
  if (!grid) return;

  // If userCoords are active, calculate distance and sort list
  let preparedList = list.map(lawyer => {
    let distance = null;
    let distanceLabel = '';
    if (userCoords) {
      distance = getDistance(userCoords.lat, userCoords.lng, lawyer.lat, lawyer.lng);
      distanceLabel = `${distance.toFixed(1)} km away`;
    } else {
      // Calculate relative to SUEZY Bangalore HQ
      distance = getDistance(SUEZY_HQ.lat, SUEZY_HQ.lng, lawyer.lat, lawyer.lng);
      distanceLabel = `${distance.toFixed(1)} km from SUEZY HQ`;
    }
    return { ...lawyer, distance, distanceLabel };
  });

  if (userCoords) {
    preparedList.sort((a, b) => a.distance - b.distance);
  }

  if (preparedList.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: span 3; text-align: center; padding: 40px; border: 1px dashed var(--border-color); border-radius: 6px; background: rgba(16, 27, 59, 0.2);">
        <h4>No Advocates Found</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">No advocates match the selected criteria. Try resetting the filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = preparedList.map(lawyer => {
    return `
      <div class="glass-card lawyer-dir-card" style="animation: slideUp 0.4s ease;">
        <div class="lawyer-profile" style="background: transparent; border: none; padding: 0; margin-bottom: 15px; display: flex; gap: 15px;">
          <div class="lawyer-avatar" style="width: 70px; height: 70px; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${lawyer.avatar}</div>
          <div>
            <h4 style="font-size: 1.25rem; margin-bottom: 2px;">${lawyer.name}</h4>
            <div class="specialty" style="margin-bottom: 2px; font-size: 0.85rem; color: var(--accent-gold); font-weight: 500;">${lawyer.subSpecialty}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">📍 ${lawyer.area}, ${lawyer.city}</div>
          </div>
        </div>
        
        <p class="bio" style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; height: 55px; line-height: 1.5;">${lawyer.bio}</p>

        <!-- Stats row (Experience, Cases, Success) -->
        <div class="lawyer-dir-stats">
          <div class="dir-stat-item">
            <div class="dir-stat-val">${lawyer.exp} Yrs</div>
            <div class="dir-stat-lbl">Exp</div>
          </div>
          <div class="dir-stat-item">
            <div class="dir-stat-val">${lawyer.cases}+</div>
            <div class="dir-stat-lbl">Solved</div>
          </div>
          <div class="dir-stat-item">
            <div class="dir-stat-val">${lawyer.successRate}%</div>
            <div class="dir-stat-lbl">Success</div>
          </div>
        </div>

        <div class="lawyer-dir-meta">
          <span class="distance-badge">${lawyer.distanceLabel}</span>
          <button class="btn btn-primary" onclick="openBookingModal('${lawyer.specialty} Advisory', '${lawyer.name}')" style="padding: 8px 16px; font-size: 0.8rem; border-radius: 4px;">Book Now</button>
        </div>
      </div>
    `;
  }).join('');
}

// Filtering Logic
function filterLawyersDirectory() {
  const practiceFilter = document.getElementById('filter-practice-area').value;
  const cityFilter = document.getElementById('filter-city').value;

  let filtered = lawyersList.filter(lawyer => {
    const matchPractice = (practiceFilter === 'all' || lawyer.specialty === practiceFilter);
    const matchCity = (cityFilter === 'all' || lawyer.city === cityFilter);
    return matchPractice && matchCity;
  });

  renderLawyersDirectory(filtered, userCoordinates);
}

// Geolocation Locator Action
function locateUserAndSortLawyers() {
  const btn = document.getElementById('btn-locate-user');
  const banner = document.getElementById('gps-status-banner');
  
  btn.classList.add('btn-secondary');
  btn.disabled = true;
  btn.innerText = '📡 Scanning GPS...';

  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    resetLocateBtn();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      banner.style.display = 'block';
      banner.innerHTML = `📍 GPS Location active! Showing nearest advocates based on your position (Lat: ${userCoordinates.lat.toFixed(4)}, Lng: ${userCoordinates.lng.toFixed(4)}).`;
      
      // Sort and render
      filterLawyersDirectory();
      resetLocateBtn(true);
    },
    (error) => {
      console.warn('Geolocation error:', error);
      banner.style.display = 'block';
      banner.innerHTML = `⚠️ Location access denied or unavailable. Showing distances relative to SUEZY Bangalore HQ.`;
      
      // Fallback relative to HQ
      userCoordinates = null;
      filterLawyersDirectory();
      resetLocateBtn(false);
    },
    { timeout: 8000 }
  );

  function resetLocateBtn(success = false) {
    btn.classList.remove('btn-secondary');
    btn.disabled = false;
    btn.innerHTML = success ? '✓ Location Active' : '📍 Find Near Me';
  }
}

// --- 3. LAWYER FINDER QUIZ (FALLBACK/COMPLEMENTARY) ---
function selectQuizOption(step, value) {
  // Toggle selection highlight
  const stepContainer = document.querySelector(`.quiz-step[data-step="${step}"]`);
  const buttons = stepContainer.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  
  event.target.classList.add('selected');
  
  if (step === 1) quizAnswers.area = value;
  if (step === 2) quizAnswers.location = value;
  if (step === 3) quizAnswers.tier = value;
}

function nextQuizStep() {
  // Validate selection made
  if (currentQuizStep === 1 && !quizAnswers.area) {
    alert('Please select a legal area to proceed.');
    return;
  }
  if (currentQuizStep === 2 && !quizAnswers.location) {
    alert('Please select your location to proceed.');
    return;
  }
  
  const currentElem = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
  currentElem.classList.remove('active');
  
  currentQuizStep++;
  const nextElem = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
  nextElem.classList.add('active');
  
  updateQuizProgress();
}

function prevQuizStep() {
  const currentElem = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
  currentElem.classList.remove('active');
  
  currentQuizStep--;
  const prevElem = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
  prevElem.classList.add('active');
  
  updateQuizProgress();
}

function updateQuizProgress() {
  const progress = document.getElementById('quiz-progress');
  const percentage = ((currentQuizStep - 1) / 3) * 100;
  progress.style.width = `${percentage}%`;
}

function finishQuiz() {
  if (!quizAnswers.tier) {
    alert('Please select an advocate tier to proceed.');
    return;
  }
  
  // Matching algorithm
  const pool = lawyersList.filter(lawyer => lawyer.specialty === quizAnswers.area);
  // Pick lawyer based on selection
  let selectedIndex = 0;
  if (quizAnswers.tier.includes('Senior') && pool.length > 1) {
    const sorted = [...pool].sort((a,b) => b.exp - a.exp);
    matchedLawyer = sorted[0];
  } else if (pool.length > 1) {
    const sorted = [...pool].sort((a,b) => a.exp - b.exp);
    matchedLawyer = sorted[0];
  } else {
    matchedLawyer = pool[0] || lawyersList[0];
  }
  
  // Render results
  document.getElementById('res-name').innerText = matchedLawyer.name;
  document.getElementById('res-specialty').innerText = `${matchedLawyer.subSpecialty} (${quizAnswers.tier})`;
  document.getElementById('res-bio').innerText = matchedLawyer.bio;
  document.getElementById('res-loc').innerText = matchedLawyer.city;
  document.getElementById('res-avatar').innerText = matchedLawyer.avatar;
  
  // Hide step 3, show results step
  document.querySelector('.quiz-step[data-step="3"]').classList.remove('active');
  const resultsElem = document.querySelector('.quiz-step[data-step="results"]');
  resultsElem.classList.add('active');
  
  const progress = document.getElementById('quiz-progress');
  progress.style.width = '100%';
}

function resetQuiz() {
  quizAnswers = { area: '', location: '', tier: '' };
  currentQuizStep = 1;
  
  document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
  
  document.querySelector('.quiz-step[data-step="results"]').classList.remove('active');
  document.querySelector('.quiz-step[data-step="1"]').classList.add('active');
  
  updateQuizProgress();
}

function bookQuizLawyer() {
  if (matchedLawyer) {
    openBookingModal(quizAnswers.area, matchedLawyer.name);
  } else {
    openBookingModal();
  }
}


// --- 4. LEGAL DOCUMENT GENERATOR ---
const docFormFields = {
  lease: `
    <div class="form-group full-width">
      <label for="f-address">Premises Physical Address</label>
      <input type="text" id="f-address" value="Flat 402, Golden Enclave, Sector 56, Gurgaon, Haryana" required>
    </div>
    <div class="form-group">
      <label for="f-landlord">Landlord Full Name</label>
      <input type="text" id="f-landlord" value="Rajesh Malhotra" required>
    </div>
    <div class="form-group">
      <label for="f-tenant">Tenant Full Name</label>
      <input type="text" id="f-tenant" value="Anoop Srivastava" required>
    </div>
    <div class="form-group">
      <label for="f-rent">Monthly Rent (INR)</label>
      <input type="number" id="f-rent" value="25000" required>
    </div>
    <div class="form-group">
      <label for="f-deposit">Security Deposit (INR)</label>
      <input type="number" id="f-deposit" value="50000" required>
    </div>
    <div class="form-group">
      <label for="f-startdate">Lease Start Date</label>
      <input type="date" id="f-startdate" value="2026-07-01" required>
    </div>
    <div class="form-group">
      <label for="f-duration">Lease Duration (Months)</label>
      <select id="f-duration">
        <option value="11" selected>11 Months</option>
        <option value="24">2 Years</option>
        <option value="36">3 Years</option>
      </select>
    </div>
  `,
  nda: `
    <div class="form-group">
      <label for="f-disclosing">Disclosing Party</label>
      <input type="text" id="f-disclosing" value="SUEZY Technologies Pvt Ltd" required>
    </div>
    <div class="form-group">
      <label for="f-receiving">Receiving Party</label>
      <input type="text" id="f-receiving" value="Karan Mehta Consulting" required>
    </div>
    <div class="form-group full-width">
      <label for="f-purpose">Purpose of Disclosure</label>
      <input type="text" id="f-purpose" value="Evaluating a prospective software partnership and joint code audit." required>
    </div>
    <div class="form-group">
      <label for="f-date">Effective Date</label>
      <input type="date" id="f-date" value="2026-06-10" required>
    </div>
    <div class="form-group">
      <label for="f-state">Governing Court/State</label>
      <input type="text" id="f-state" value="Bangalore, Karnataka" required>
    </div>
  `,
  founders: `
    <div class="form-group">
      <label for="f-startup">Startup Name</label>
      <input type="text" id="f-startup" value="Suezy Logistics India" required>
    </div>
    <div class="form-group">
      <label for="f-state">State of Incorporation</label>
      <input type="text" id="f-state" value="Karnataka" required>
    </div>
    <div class="form-group">
      <label for="f-f1-name">Founder 1 Name</label>
      <input type="text" id="f-f1-name" value="N Sai Pracheet Reddy" required>
    </div>
    <div class="form-group">
      <label for="f-f1-equity">Founder 1 Equity (%)</label>
      <input type="number" id="f-f1-equity" value="60" required>
    </div>
    <div class="form-group">
      <label for="f-f2-name">Founder 2 Name</label>
      <input type="text" id="f-f2-name" value="Rohan Deshmukh" required>
    </div>
    <div class="form-group">
      <label for="f-f2-equity">Founder 2 Equity (%)</label>
      <input type="number" id="f-f2-equity" value="40" required>
    </div>
    <div class="form-group full-width">
      <label for="f-vesting">Vesting Schedule Details</label>
      <input type="text" id="f-vesting" value="4-Year vesting with a 1-Year cliff period, on a quarterly basis." required>
    </div>
  `
};

function setDocType(type) {
  currentDocType = type;
  
  // Highlight active button
  const btns = document.querySelectorAll('.doc-type-btn');
  btns.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Load fields
  const form = document.getElementById('doc-builder-form');
  form.innerHTML = docFormFields[type];
  
  updateDocumentPreview();
}

function updateDocumentPreview() {
  const preview = document.getElementById('doc-preview-content');
  let content = '';
  
  if (currentDocType === 'lease') {
    const address = document.getElementById('f-address')?.value || '[Address]';
    const landlord = document.getElementById('f-landlord')?.value || '[Landlord]';
    const tenant = document.getElementById('f-tenant')?.value || '[Tenant]';
    const rent = document.getElementById('f-rent')?.value || '0';
    const deposit = document.getElementById('f-deposit')?.value || '0';
    const startdate = document.getElementById('f-startdate')?.value || '[Date]';
    const duration = document.getElementById('f-duration')?.value || '11';
    
    content = `
      <div class="stamp-duty">
        INDIA NON JUDICIAL STAMP DUTY<br>
        GOVERNMENT OF KARNATAKA<br>
        Value: ₹ 100 &nbsp;&nbsp;|&nbsp;&nbsp; Reference ID: SZ-LD-883201
      </div>
      <h2>RESIDENTIAL LEASE AGREEMENT</h2>
      <p>This Rental Agreement is made and executed on this <strong>${startdate}</strong> at Bangalore by and between:</p>
      <p><strong>${landlord}</strong>, hereinafter referred to as the <strong>"LANDLORD"</strong> (which expression shall mean and include his heirs, successors, legal representatives, and assigns) of the ONE PART;</p>
      <p>AND</p>
      <p><strong>${tenant}</strong>, hereinafter referred to as the <strong>"TENANT"</strong> (which expression shall mean and include his heirs, successors, legal representatives, and assigns) of the OTHER PART;</p>
      <p>WHEREAS the Landlord is the absolute owner of the residential premises situated at <strong>${address}</strong>.</p>
      
      <p><strong>NOW THIS AGREEMENT WITNESSETH AND IT IS MUTUALLY AGREED AS FOLLOWS:</strong></p>
      <p>1. <strong>DURATION:</strong> The lease shall be for a fixed duration of <strong>${duration} Months</strong> commencing from ${startdate}.</p>
      <p>2. <strong>RENT:</strong> The Tenant shall pay to the Landlord a monthly rent of <strong>INR ${parseInt(rent).toLocaleString('en-IN')}</strong> on or before the 5th day of every calendar month.</p>
      <p>3. <strong>SECURITY DEPOSIT:</strong> The Tenant has deposited a sum of <strong>INR ${parseInt(deposit).toLocaleString('en-IN')}</strong> as interest-free security deposit, which shall be refunded upon vacant possession.</p>
      <p>4. <strong>MAINTENANCE:</strong> Minor repairs shall be borne by the Tenant, whereas major structural faults shall be repaired by the Landlord.</p>
      
      <div class="sig-line">
        <div class="sig-box">Landlord Signature</div>
        <div class="sig-box">Tenant Signature</div>
      </div>
    `;
  } else if (currentDocType === 'nda') {
    const disclosing = document.getElementById('f-disclosing')?.value || '[Disclosing Party]';
    const receiving = document.getElementById('f-receiving')?.value || '[Receiving Party]';
    const purpose = document.getElementById('f-purpose')?.value || '[Purpose]';
    const date = document.getElementById('f-date')?.value || '[Date]';
    const state = document.getElementById('f-state')?.value || '[State]';
    
    content = `
      <div class="stamp-duty">
        INDIA NON JUDICIAL STAMP DUTY<br>
        Value: ₹ 200 &nbsp;&nbsp;|&nbsp;&nbsp; Reference ID: SZ-NDA-901428
      </div>
      <h2>MUTUAL NON-DISCLOSURE AGREEMENT</h2>
      <p>This Mutual Non-Disclosure Agreement (the "Agreement") is entered into and made effective as of <strong>${date}</strong> (the "Effective Date"), by and between:</p>
      <p><strong>${disclosing}</strong>, with its registered office in India, (hereinafter referred to as the "Disclosing Party");</p>
      <p>AND</p>
      <p><strong>${receiving}</strong>, with its principal business address in India, (hereinafter referred to as the "Receiving Party").</p>
      <p>WHEREAS, the parties wish to evaluate a business relationship for the purpose of: <strong>${purpose}</strong>.</p>
      
      <p><strong>AGREEMENT DETAILS:</strong></p>
      <p>1. <strong>CONFIDENTIAL INFORMATION:</strong> Includes all technical, financial, marketing, and code assets shared between the parties.</p>
      <p>2. <strong>RESTRICTIONS:</strong> The Receiving Party shall hold Confidential Information in strict trust and restrict access only to employees requiring access for the purpose.</p>
      <p>3. <strong>GOVERNING LAW:</strong> This Agreement shall be governed and construed in accordance with the laws of India and subject to courts in <strong>${state}</strong>.</p>
      <p>4. <strong>TERM:</strong> The obligations of confidentiality shall remain in effect for a period of three (3) years from the Effective Date.</p>
      
      <div class="sig-line">
        <div class="sig-box">Disclosing Party Authorized Sign</div>
        <div class="sig-box">Receiving Party Authorized Sign</div>
      </div>
    `;
  } else if (currentDocType === 'founders') {
    const startup = document.getElementById('f-startup')?.value || '[Startup Name]';
    const state = document.getElementById('f-state')?.value || '[State]';
    const f1 = document.getElementById('f-f1-name')?.value || '[Founder 1]';
    const f1Eq = document.getElementById('f-f1-equity')?.value || '50';
    const f2 = document.getElementById('f-f2-name')?.value || '[Founder 2]';
    const f2Eq = document.getElementById('f-f2-equity')?.value || '50';
    const vesting = document.getElementById('f-vesting')?.value || '[Vesting Details]';
    
    content = `
      <div class="stamp-duty">
        INDIA NON JUDICIAL STAMP DUTY<br>
        Value: ₹ 500 &nbsp;&nbsp;|&nbsp;&nbsp; Reference ID: SZ-FA-109482
      </div>
      <h2>FOUNDERS AGREEMENT</h2>
      <p>This Founders Agreement is entered into as of this date by and between the undersigned founders, who intend to register and operate a corporate entity under the name <strong>${startup}</strong> in the state of <strong>${state}</strong>, India.</p>
      
      <p><strong>FOUNDERS DETAILS & INITIAL CAPITAL:</strong></p>
      <ul>
        <li><strong>${f1}</strong>: Owner of <strong>${f1Eq}%</strong> of voting common stock.</li>
        <li><strong>${f2}</strong>: Owner of <strong>${f2Eq}%</strong> of voting common stock.</li>
      </ul>
      
      <p><strong>TERMS OF OPERATION:</strong></p>
      <p>1. <strong>ROLES & RESPONSIBILITIES:</strong> The founders agree to dedicate full-time focus to development, management, and technology build of ${startup}.</p>
      <p>2. <strong>EQUITY VESTING:</strong> Share distribution is subject to vesting constraints described as: <strong>${vesting}</strong>. If a founder leaves early, unvested shares return to treasury.</p>
      <p>3. <strong>INTELLECTUAL PROPERTY:</strong> All IP generated by the founders in connection with the startup is automatically assigned solely to the company.</p>
      <p>4. <strong>DISPUTE RESOLUTION:</strong> Any dispute arising shall be settled via arbitration under the Arbitration & Conciliation Act, 1996 in ${state}.</p>
      
      <div class="sig-line">
        <div class="sig-box">Founder 1: ${f1}</div>
        <div class="sig-box">Founder 2: ${f2}</div>
      </div>
    `;
  }
  
  preview.innerHTML = content;
}

function printDocument() {
  window.print();
}

function copyGeneratedDocText() {
  const preview = document.getElementById('doc-preview-content');
  const tempText = preview.innerText;
  
  navigator.clipboard.writeText(tempText).then(() => {
    alert('Document content copied to clipboard successfully!');
  }).catch(err => {
    console.error('Error copying text: ', err);
  });
}

// Initial form load
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('doc-builder-form');
  if (form) {
    form.innerHTML = docFormFields['lease'];
    updateDocumentPreview();
  }
  
  // Load initial lawyers directory list
  if (typeof lawyersList !== 'undefined') {
    renderLawyersDirectory(lawyersList);
  }
});


// --- 5. LEGAL REFERENCE SEARCH ENGINE ---
function fillSearchTag(tagText) {
  const input = document.getElementById('law-search-input');
  input.value = tagText;
  performLawSearch();
}

function handleSearchKey(event) {
  if (event.key === 'Enter') {
    performLawSearch();
  }
}

function performLawSearch() {
  const query = document.getElementById('law-search-input').value.toLowerCase().trim();
  const resultsContainer = document.getElementById('search-results');
  
  if (!query) {
    resultsContainer.classList.remove('active');
    return;
  }
  
  // Search logic
  const matches = legalSearchDb.filter(item => {
    return item.keywords.some(kw => query.includes(kw)) || 
           item.act.toLowerCase().includes(query) || 
           item.title.toLowerCase().includes(query);
  });
  
  let html = '';
  if (matches.length > 0) {
    matches.forEach(match => {
      const stepItems = match.steps.map(s => `<li>${s}</li>`).join('');
      html += `
        <div class="law-card">
          <div class="law-card-header">
            <div>
              <div class="law-act">${match.act}</div>
              <h3 class="law-title">${match.title}</h3>
            </div>
            <button onclick="openBookingModal('Legal Inquiry: ${match.title}')" class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.8rem; border-radius: 4px;">Ask lawyer</button>
          </div>
          <p class="law-desc">${match.desc}</p>
          <div class="law-steps">
            <div class="law-steps-title">Recommended Legal Procedure:</div>
            <ul>
              ${stepItems}
            </ul>
          </div>
        </div>
      `;
    });
  } else {
    html = `
      <div style="text-align: center; padding: 40px; border: 1px dashed var(--border-color); border-radius: 6px; background: rgba(16, 27, 59, 0.2);">
        <h4>No Specific Matches Found</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">We couldn't find a standard template search. Please consult our empanelled advocates for personalized advice.</p>
        <button onclick="openBookingModal()" class="btn btn-primary" style="margin-top: 16px;">Ask a lawyer directly</button>
      </div>
    `;
  }
  
  resultsContainer.innerHTML = html;
  resultsContainer.classList.add('active');
}


// --- 6. SECURE CLIENT CASE PORTAL ---
function handlePortalLogin(event) {
  event.preventDefault();
  const caseIdInput = document.getElementById('portal-case-id').value.trim();
  
  if (caseIdInput === 'SZ-2026-8893') {
    document.getElementById('portal-login').style.display = 'none';
    document.getElementById('portal-dashboard').style.display = 'grid';
    document.getElementById('display-case-id').innerText = `CASE: ${caseIdInput}`;
  } else {
    alert('Invalid Case ID. Please check your credentials or enter the test code: SZ-2026-8893');
  }
}

function logoutPortal() {
  document.getElementById('portal-dashboard').style.display = 'none';
  document.getElementById('portal-login').style.display = 'block';
  document.getElementById('portal-case-id').value = '';
}

function switchPortalTab(tabName, clickedEl) {
  // Toggle menu item states
  const menuItems = document.querySelectorAll('.portal-menu-item');
  menuItems.forEach(item => item.classList.remove('active'));
  clickedEl.classList.add('active');
  
  // Toggle tabs
  const tabs = document.querySelectorAll('.portal-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  const targetTab = document.getElementById(`tab-${tabName}`);
  targetTab.classList.add('active');
}

function sendClientMessage(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  
  const chatMessagesBox = document.getElementById('chat-messages-box');
  
  // Append client message
  const clientBubble = document.createElement('div');
  clientBubble.className = 'chat-bubble client';
  clientBubble.innerText = text;
  chatMessagesBox.appendChild(clientBubble);
  
  input.value = '';
  chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
  
  // Mock lawyer automated responder based on message keywords
  setTimeout(() => {
    let reply = "Thank you for the message. I will review this case detail and get back to you shortly.";
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('evidence') || lowerText.includes('document')) {
      reply = "Please upload the copy of the document/evidence to our Secure Document Vault tab, so I can review it before drawing the court replication.";
    } else if (lowerText.includes('hearing') || lowerText.includes('date')) {
      reply = "Yes, our hearing is scheduled for June 25, 2026. As mentioned, physical presence is not needed. I will submit the written pleading arguments.";
    } else if (lowerText.includes('cost') || lowerText.includes('fee') || lowerText.includes('payment')) {
      reply = "The current court filing fee and advocate fee are cleared. Next billing will only be initiated post submission of the arguments.";
    }
    
    const lawyerBubble = document.createElement('div');
    lawyerBubble.className = 'chat-bubble lawyer';
    lawyerBubble.innerText = reply;
    chatMessagesBox.appendChild(lawyerBubble);
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
  }, 1200);
}

function triggerMockUpload() {
  document.getElementById('mock-file-input').click();
}

function handleMockUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const grid = document.getElementById('vault-items-grid');
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  
  const newItem = document.createElement('div');
  newItem.className = 'vault-item';
  newItem.style.animation = 'slideUp 0.4s ease';
  newItem.innerHTML = `
    <div class="vault-icon">📄</div>
    <div class="vault-name" title="${file.name}">${file.name}</div>
    <div class="vault-size">${sizeMb} MB</div>
    <a href="#" class="vault-download" onclick="alert('Downloading uploaded file (mock)...'); return false;">⬇ Download</a>
  `;
  
  grid.appendChild(newItem);
  alert(`File "${file.name}" uploaded successfully to secure case vault.`);
}


// --- 7. BOOKING WIZARD MODAL ---
function openBookingModal(serviceName = null, lawyerName = null) {
  // Reset date limit to today or future dates only
  const dateInput = document.getElementById('consult-date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  
  if (serviceName) {
    const serviceSelect = document.getElementById('consult-service');
    serviceSelect.value = serviceName;
  }
  
  // Reset fields & slots
  selectedTimeSlotText = '';
  document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
  
  currentBookingStep = 1;
  document.querySelectorAll('.booking-wizard-step').forEach(step => step.classList.remove('active'));
  document.querySelector('.booking-wizard-step[data-bstep="1"]').classList.add('active');
  
  const modal = document.getElementById('booking-modal');
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
}

function closeBookingModal(event) {
  // Close if clicked on overlay outside box
  if (event.target.id === 'booking-modal') {
    hideBookingModal();
  }
}

function hideBookingModal() {
  const modal = document.getElementById('booking-modal');
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

function selectTimeSlot(slotText, element) {
  selectedTimeSlotText = slotText;
  document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
  element.classList.add('selected');
}

function nextBookingStep() {
  const service = document.getElementById('consult-service').value;
  const date = document.getElementById('consult-date').value;
  
  if (currentBookingStep === 1) {
    if (!date) {
      alert('Please select a date.');
      return;
    }
    if (!selectedTimeSlotText) {
      alert('Please select an available time slot.');
      return;
    }
    
    // Go to step 2
    document.querySelector('.booking-wizard-step[data-bstep="1"]').classList.remove('active');
    currentBookingStep = 2;
    document.querySelector('.booking-wizard-step[data-bstep="2"]').classList.add('active');
  }
}

function prevBookingStep() {
  if (currentBookingStep === 2) {
    document.querySelector('.booking-wizard-step[data-bstep="2"]').classList.remove('active');
    currentBookingStep = 1;
    document.querySelector('.booking-wizard-step[data-bstep="1"]').classList.add('active');
  }
}

function submitBooking(event) {
  event.preventDefault();
  
  const name = document.getElementById('client-fullname').value;
  const phone = document.getElementById('client-phone').value;
  const email = document.getElementById('client-email').value;
  const service = document.getElementById('consult-service').value;
  const date = document.getElementById('consult-date').value;
  
  // Generate random booking ID
  const refIdNum = Math.floor(1000 + Math.random() * 9000);
  const refId = `SZ-B${refIdNum}`;
  
  // Populate success values
  document.getElementById('booking-ref-id').innerText = refId;
  document.getElementById('summary-date').innerText = `Date: ${date}`;
  document.getElementById('summary-time').innerText = `Time Slot: ${selectedTimeSlotText}`;
  document.getElementById('summary-service').innerText = `Practice Area: ${service}`;
  document.getElementById('summary-name').innerText = name;
  
  // Clear forms
  document.getElementById('booking-step1-form').reset();
  document.getElementById('booking-step2-form').reset();
  
  // Go to success step
  document.querySelector('.booking-wizard-step[data-bstep="2"]').classList.remove('active');
  currentBookingStep = 3;
  document.querySelector('.booking-wizard-step[data-bstep="3"]').classList.add('active');
}
