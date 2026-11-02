const app = document.querySelector("#app");
const stage = document.querySelector("#kiosk-stage");
const nav = document.querySelector(".bottom-nav");
const toast = document.querySelector("#toast");
const splash = document.querySelector("#splash");
const idleWarning = document.querySelector("#idle-warning");
const idleCountdown = document.querySelector("#idle-countdown");
const IDLE_TIMEOUT_MS = 120_000;
const IDLE_WARNING_MS = 15_000;

const staff = [
  { id: "business-office", name: "Business Department Office", role: "Department information", room: "Ka Lama 202", floor: 2, hours: "Confirm with department" },
  { id: "student-services", name: "Student Services", role: "Student support", room: "Ka Lama 104", floor: 1, hours: "Confirm with department" },
  { id: "business-faculty", name: "Business Faculty", role: "Faculty offices", room: "Ka Lama 208", floor: 2, hours: "Confirm with department" },
  { id: "academic-support", name: "Academic Support", role: "Student support", room: "Ka Lama 106", floor: 1, hours: "Confirm with department" },
];

const courses = [
  { day: "Monday", start: "8:00 AM", end: "9:15 AM", title: "Introduction to Business", code: "BUS 120", room: "Room 201", floor: 2, instructor: "L. Pacheco" },
  { day: "Monday", start: "9:30 AM", end: "10:45 AM", title: "Business Communication", code: "BUS 150", room: "Room 104", floor: 1, instructor: "M. Kim" },
  { day: "Monday", start: "11:00 AM", end: "12:15 PM", title: "Computer Applications", code: "ICS 101", room: "Room 208", floor: 2, instructor: "K. Lee" },
  { day: "Tuesday", start: "8:30 AM", end: "9:45 AM", title: "Principles of Marketing", code: "MKT 120", room: "Room 202", floor: 2, instructor: "L. Pacheco" },
  { day: "Tuesday", start: "10:00 AM", end: "11:15 AM", title: "College Success", code: "STSC 101", room: "Room 106", floor: 1, instructor: "D. Nakamura" },
  { day: "Wednesday", start: "8:00 AM", end: "9:15 AM", title: "Introduction to Business", code: "BUS 120", room: "Room 201", floor: 2, instructor: "L. Pacheco" },
  { day: "Wednesday", start: "10:00 AM", end: "11:15 AM", title: "Accounting Principles", code: "ACC 201", room: "Room 204", floor: 2, instructor: "M. Kim" },
  { day: "Thursday", start: "9:00 AM", end: "10:15 AM", title: "Business Communication", code: "BUS 150", room: "Room 104", floor: 1, instructor: "M. Kim" },
  { day: "Friday", start: "8:30 AM", end: "9:45 AM", title: "Principles of Marketing", code: "MKT 120", room: "Room 202", floor: 2, instructor: "L. Pacheco" },
];

const officialSite = "https://maui.hawaii.edu";
const programs = [
  { title: "Business Administration", award: "AAS · CA · CO", summary: "Business, entrepreneurship, accounting, and management.", href: `${officialSite}/programs/busc`, icon: "↗" },
  { title: "Hospitality & Tourism", award: "AAS · CA · CO", summary: "Prepare for leadership in Hawaiʻi’s hospitality industry.", href: `${officialSite}/programs/host`, icon: "✦" },
  { title: "Accounting", award: "AAS · CA", summary: "Learn to measure business activity and communicate financial information.", href: `${officialSite}/programs/accounting`, icon: "＄" },
  { title: "Applied Business & Information Technology", award: "Bachelor of Applied Science", summary: "Combine business, entrepreneurship, and technology skills.", href: `${officialSite}/programs/`, icon: "⌘" },
];

const jobSearches = [
  { title: "Business", query: "business", icon: "↗" },
  { title: "Hospitality & tourism", query: "hospitality", icon: "✦" },
  { title: "Accounting", query: "accounting", icon: "＄" },
  { title: "Technology", query: "information+technology", icon: "⌘" },
];

const surveyChoices = [
  "More campus events",
  "Career workshops",
  "More study spaces",
  "More student clubs",
];

const roomsByFloor = {
  1: [
    { number: "101", label: "Main office", kind: "Office" },
    { number: "102", label: "Student services", kind: "Support" },
    { number: "104", label: "Classroom", kind: "Class" },
    { number: "105", label: "Study space", kind: "Study" },
    { number: "106", label: "Academic support", kind: "Support" },
    { number: "107", label: "Classroom", kind: "Class" },
    { number: "108", label: "Restrooms", kind: "Facility" },
    { number: "109", label: "Lounge", kind: "Common" },
    { number: "110", label: "Classroom", kind: "Class" },
  ],
  2: [
    { number: "201", label: "Classroom", kind: "Class" },
    { number: "202", label: "Business office", kind: "Office" },
    { number: "203", label: "Computer lab", kind: "Lab" },
    { number: "204", label: "Classroom", kind: "Class" },
    { number: "205", label: "Faculty offices", kind: "Office" },
    { number: "206", label: "Study space", kind: "Study" },
    { number: "207", label: "Restrooms", kind: "Facility" },
    { number: "208", label: "Classroom", kind: "Class" },
    { number: "209", label: "Meeting room", kind: "Common" },
  ],
};

const state = {
  page: "welcome",
  floor: 1,
  room: null,
  day: "Monday",
  staffId: null,
  surveySubmitted: false,
  surveyChoice: null,
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2800);
};

function showSplash() {
  clearIdleTimers();
  hideIdleWarning();
  state.page = "home";
  state.room = null;
  state.surveyChoice = null;
  state.surveySubmitted = false;
  render();
  document.querySelector(".app-shell").setAttribute("aria-hidden", "true");
  document.body.classList.add("splash-active");
  splash.hidden = false;
  splash.setAttribute("aria-hidden", "false");
  splash.classList.remove("is-opening", "is-exiting");
  splash.classList.add("is-returning");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      splash.classList.remove("is-returning");
      document.querySelector("[data-splash-enter]").focus({ preventScroll: true });
    });
  });
}

function enterKiosk() {
  if (splash.hidden || splash.classList.contains("is-opening")) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const openingDuration = reducedMotion ? 0 : 900;
  const fadeDuration = reducedMotion ? 0 : 850;
  splash.classList.add("is-opening");
  splash.setAttribute("aria-hidden", "true");
  document.querySelector(".app-shell").setAttribute("aria-hidden", "false");
  state.page = "home";
  render();
  window.setTimeout(() => {
    splash.classList.add("is-exiting");
    window.setTimeout(() => {
      splash.hidden = true;
      document.body.classList.remove("splash-active");
      app.querySelector(".welcome").setAttribute("tabindex", "-1");
      app.querySelector(".welcome").focus({ preventScroll: true });
      resetIdleTimer();
    }, fadeDuration);
  }, openingDuration);
}

function setPage(page) {
  state.page = page;
  if (page !== "profile") state.staffId = null;
  render();
  resetIdleTimer();
  app.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  showSplash();
}

function fitKioskStage() {
  const scale = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
  stage.style.setProperty("--stage-scale", String(scale));
}

function markCurrentNav() {
  const activePage = state.page === "welcome" ? "home" : state.page === "profile" || state.page === "map" || state.page === "directory" || state.page === "classes" ? "find" : state.page === "menu" || state.page === "events" || state.page === "campus" || state.page === "survey" ? "more" : state.page;
  nav.querySelectorAll("button").forEach((button) => {
    if (button.dataset.page === activePage) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function homeView() {
  return `
    <div class="home-view">
      <section class="welcome">
        <div class="eyebrow">Ulu · Grow where you are rooted</div>
        <h1>Grow where<br>you are rooted.</h1>
        <p>One Maui Nui. One Maui College. Learn, grow, and strengthen the community that is home.</p>
      </section>
      <section class="home-paths" aria-labelledby="home-paths-title">
        <div class="home-section-heading">
          <div><div class="eyebrow">Your next step</div><h2 id="home-paths-title">Find your path</h2></div>
          <span>Start wherever you are.</span>
        </div>
        <div class="home-tile-grid">
          <button class="home-tile home-tile-programs" type="button" data-page="programs">
            <span class="home-tile-copy"><span class="home-tile-kicker">Learn</span><strong>Explore programs</strong><span>Find a program that moves you.</span></span>
            <span class="home-tile-arrow" aria-hidden="true">↗</span>
          </button>
          <button class="home-tile home-tile-find" type="button" data-page="find">
            <span class="home-tile-copy"><span class="home-tile-kicker">Find your way</span><strong>Explore campus</strong><span>Rooms, people, and classes.</span></span>
            <span class="home-tile-arrow" aria-hidden="true">↗</span>
          </button>
          <button class="home-tile home-tile-campus" type="button" data-page="events">
            <span class="home-tile-copy"><span class="home-tile-kicker">Be part of it</span><strong>Campus life</strong><span>See what’s happening at UHMC.</span></span>
            <span class="home-tile-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
      </section>
    </div>
  `;
}

function directoryView() {
  return `
    <div class="page-title"><div class="eyebrow">Ka Lama Building</div><h1>People & offices</h1><p>Find a staff member, office, or student service.</p></div>
    <div class="list-stack">${staff.map((person) => `
      <button class="list-card" type="button" data-staff="${person.id}">
        <span class="avatar">${person.name.split(" ").map((part) => part[0]).join("")}</span>
        <span class="list-copy"><strong>${person.name}</strong><span>${person.role}<br>${person.room}</span></span>
        <span class="list-arrow" aria-hidden="true">›</span>
      </button>`).join("")}
    </div>
    <p class="demo-note">Sample directory for prototype review. Replace with confirmed staff names, offices, hours, and contact details before deployment.</p>
  `;
}

function profileView() {
  const person = staff.find((entry) => entry.id === state.staffId);
  if (!person) return directoryView();
  return `
    <button class="back-link" type="button" data-page="directory">← Back to people & offices</button>
    <section class="card profile-card">
      <span class="avatar">${person.name.split(" ").map((part) => part[0]).join("")}</span>
      <div><div class="eyebrow">Ka Lama directory</div><h1>${person.name}</h1><div class="role">${person.role}</div></div>
      <div class="detail-list">
        <div class="detail-row"><span>Office</span><strong>${person.room}</strong></div>
        <div class="detail-row"><span>Office hours</span><strong>${person.hours}</strong></div>
        <div class="detail-row"><span>Contact</span><strong>Confirm with UHMC</strong></div>
      </div>
      <button class="secondary-button" type="button" data-route-room="${person.room.match(/\d+/)?.[0] ?? ""}">Show office on map</button>
    </section>
    <p class="demo-note">Sample directory details. Confirm current campus information before publishing.</p>
  `;
}

function mapView() {
  const rooms = roomsByFloor[state.floor];
  const selected = rooms.find((room) => room.number === state.room);
  return `
    <div class="page-title"><div class="eyebrow">Ka Lama Building</div><h1>Building map</h1><p>Choose a floor, then tap a room to see its location.</p></div>
    <div class="floor-tabs" role="group" aria-label="Select floor">
      <button class="tab-button" type="button" data-floor="1" aria-pressed="${state.floor === 1}">First floor</button>
      <button class="tab-button" type="button" data-floor="2" aria-pressed="${state.floor === 2}">Second floor</button>
    </div>
    <div class="map-layout">
      <section class="floor-plan" aria-label="Illustrative floor map">
        <span class="map-label north">↑ North</span><span class="map-label hall">Main hallway</span>
        <div class="room-grid">${rooms.map((room) => `
          <button type="button" class="room-button${state.room === room.number ? " selected" : ""}" data-room="${room.number}" aria-pressed="${state.room === room.number}">
            ${room.number}<span>${room.label}</span>
          </button>`).join("")}
        </div>
      </section>
      <aside class="map-side">
        <section class="info-card route-card">
          <h3>${selected ? `Room ${selected.number}` : "Choose a destination"}</h3>
          <p>${selected ? `${selected.label} · ${selected.kind}` : "Tap a room on the floor plan to see its details and suggested route."}</p>
          ${selected ? `<div class="route-line"><span class="route-dot"></span><span>From the main entrance, continue along the main hallway. Take the stairs or elevator to floor ${state.floor}, then follow the room signs.</span></div>` : ""}
        </section>
        <section class="info-card"><h3>Getting around</h3><p>Elevator, stairs, and accessible entrances are shown as general wayfinding points. Ask the main office for assistance.</p></section>
        <section class="info-card"><h3>Map key</h3><p>Tap any room to select it. Selected rooms are highlighted in green.</p></section>
      </aside>
    </div>
    <p class="demo-note">Illustrative floor plan for prototype review only; room numbers, paths, entrances, and accessibility details must be verified on site.</p>
  `;
}

function classesView() {
  const dayCourses = courses.filter((course) => course.day === state.day);
  return `
    <div class="page-title"><div class="eyebrow">Ka Lama Building</div><h1>Class schedule</h1><p>Find a class and the room where it meets.</p></div>
    <div class="day-tabs" role="group" aria-label="Select day">${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => `
      <button class="day-button" type="button" data-day="${day}" aria-pressed="${state.day === day}">${day.slice(0, 3)}</button>`).join("")}
    </div>
    <div class="schedule-list">${dayCourses.length ? dayCourses.map((course) => `
      <button class="schedule-row" type="button" data-route-room="${course.room.match(/\d+/)?.[0] ?? ""}" data-floor="${course.floor}">
        <span class="schedule-time">${course.start}<br>– ${course.end}</span>
        <span><strong>${course.title}</strong><span>${course.code} · ${course.instructor}</span></span>
        <span class="room-tag">${course.room}</span>
      </button>`).join("") : `<div class="empty-state">No sample classes are listed for this day.</div>`}
    </div>
    <p class="demo-note">Sample timetable for prototype review. Term dates, current class offerings, room assignments, and instructor details must be confirmed before publishing.</p>
  `;
}

function programsView() {
  return `
    <div class="page-title"><div class="eyebrow">UH Maui College</div><h1>Find your future</h1><p>Explore a UHMC program. Tap a card to open official program information.</p></div>
    <div class="program-grid">
      ${programs.map((program) => `
        <a class="program-card" href="${program.href}" target="_blank" rel="noopener noreferrer">
          <span class="program-icon" aria-hidden="true">${program.icon}</span>
          <span class="eyebrow">${program.award}</span>
          <strong>${program.title}</strong>
          <span class="program-summary">${program.summary}</span>
          <span class="program-arrow">View program ↗</span>
        </a>`).join("")}
    </div>
    <a class="primary-button website-cta" href="${officialSite}/programs/" target="_blank" rel="noopener noreferrer">Browse all UHMC programs <span class="arrow" aria-hidden="true">↗</span></a>
  `;
}

function findView() {
  return `
    <div class="page-title"><div class="eyebrow">Ka Lama Building</div><h1>Find your way</h1><p>Choose a destination. No search needed.</p></div>
    <div class="quick-grid find-grid">
      <button class="quick-card" type="button" data-page="map"><span class="tile-icon" aria-hidden="true">⌖</span><span><strong>Building map</strong><small>Browse rooms on both floors</small></span><span class="tile-arrow" aria-hidden="true">›</span></button>
      <button class="quick-card" type="button" data-page="directory"><span class="tile-icon" aria-hidden="true">◎</span><span><strong>People & offices</strong><small>Staff, office hours, and contacts</small></span><span class="tile-arrow" aria-hidden="true">›</span></button>
      <button class="quick-card" type="button" data-page="classes"><span class="tile-icon" aria-hidden="true">▤</span><span><strong>Class schedule</strong><small>Browse classes by weekday</small></span><span class="tile-arrow" aria-hidden="true">›</span></button>
    </div>
    <p class="demo-note">Room map, directory, and schedule shown here are prototype examples. Confirm with UHMC before relying on them for wayfinding.</p>
  `;
}

function jobsView() {
  return `
    <div class="page-title"><div class="eyebrow">Take the next step</div><h1>Explore job opportunities</h1><p>Pick an area to open current Maui-area job listings. No search terms to type.</p></div>
    <div class="job-grid">${jobSearches.map((job) => {
      const url = `https://www.indeed.com/jobs?q=${job.query}&l=Maui%2C%20HI`;
      return `<a class="job-card" href="${url}" target="_blank" rel="noopener noreferrer">
        <span class="tile-icon" aria-hidden="true">${job.icon}</span>
        <strong>${job.title}</strong>
        <span>See current listings near Maui <span aria-hidden="true">↗</span></span>
      </a>`;
    }).join("")}</div>
    <p class="demo-note">Job listings open on Indeed and may change. UHMC does not endorse individual postings; verify details directly with employers.</p>
  `;
}

function surveyView() {
  return `
    <div class="page-title"><div class="eyebrow">Student voice</div><h1>What would you like to see more of on campus?</h1><p>Tap one answer. No typing or personal information needed.</p></div>
    <div class="survey-options">${surveyChoices.map((choice, index) => `
      <button class="survey-option${state.surveyChoice === choice ? " selected" : ""}" type="button" data-vote="${index}" aria-pressed="${state.surveyChoice === choice}">
        <span class="survey-number">${index + 1}</span><strong>${choice}</strong><span class="tile-arrow" aria-hidden="true">›</span>
      </button>`).join("")}</div>
    ${state.surveySubmitted ? `<div class="survey-thanks" role="status"><strong>Mahalo for sharing your idea.</strong><span>This is a prototype poll. Connect an approved campus survey before collecting or reporting kiosk responses.</span></div>` : ""}
    <p class="demo-note">This prototype does not save or transmit votes. Connect an approved survey service to collect anonymous responses from both kiosks.</p>
  `;
}

function moreView() {
  return `
    <div class="page-title"><div class="eyebrow">More campus information</div><h1>Campus life</h1><p>Events, student feedback, dining, and campus links.</p></div>
    <div class="more-grid">
      <button class="more-card" type="button" data-page="events"><span class="tile-icon" aria-hidden="true">✦</span><strong>Events & announcements</strong><span>Campus activities and updates</span></button>
      <button class="more-card" type="button" data-page="survey"><span class="tile-icon" aria-hidden="true">♡</span><strong>Student voice</strong><span>Answer a one-tap campus poll</span></button>
      <button class="more-card" type="button" data-page="menu"><span class="tile-icon" aria-hidden="true">☼</span><strong>Cafeteria menu</strong><span>Daily menu and dining hours</span></button>
      <button class="more-card" type="button" data-page="campus"><span class="tile-icon" aria-hidden="true">↗</span><strong>Campus map</strong><span>Landmarks and student services</span></button>
      <a class="more-card" href="${officialSite}" target="_blank" rel="noopener noreferrer"><span class="tile-icon" aria-hidden="true">UH</span><strong>UH Maui College website</strong><span>Official campus information ↗</span></a>
    </div>
  `;
}

function menuView() {
  return `
    <button class="back-link" type="button" data-page="more">← More campus information</button>
    <div class="page-title"><div class="eyebrow">Dining on campus</div><h1>Cafeteria</h1><p>Today's menu and hours at a glance.</p></div>
    <section class="campus-hero"><h2>Campus dining</h2><p>Check with the cafeteria team for today's availability, allergens, and service hours.</p></section>
    <div class="section-heading"><div><div class="eyebrow">Sample menu</div><h2>Today's picks</h2></div></div>
    <div class="menu-grid">
      <article class="menu-item"><strong>Local plate</strong><p>Steamed rice, seasonal vegetables, and a rotating island-style entrée.</p></article>
      <article class="menu-item"><strong>Garden bowl</strong><p>Fresh greens, local vegetables, and your choice of dressing.</p></article>
      <article class="menu-item"><strong>Grab & go</strong><p>Sandwiches, fruit, and snacks for a quick break between classes.</p></article>
      <article class="menu-item"><strong>Hours</strong><p>Weekdays · 7:30 AM–2:00 PM<br>Hours may vary during breaks.</p></article>
    </div>
    <p class="demo-note">Illustrative sample menu and hours only. Replace with the cafeteria's current menu and verified service information.</p>
  `;
}

function eventsView() {
  return `
    <button class="back-link" type="button" data-page="more">← More campus information</button>
    <div class="page-title"><div class="eyebrow">Connect & participate</div><h1>Events & announcements</h1><p>Find campus activities, workshops, and student opportunities.</p></div>
    <section class="campus-hero"><h2>What's happening at UHMC?</h2><p>See current campus news and featured events on the official UH Maui College website.</p><a class="primary-button" href="${officialSite}" target="_blank" rel="noopener noreferrer" style="margin-top:22px">Open UHMC website <span class="arrow" aria-hidden="true">↗</span></a></section>
    <section class="info-card" style="margin-top:18px"><h3>Events for the kiosk</h3><p>A live campus calendar or approved event feed can be connected here so announcements stay current without manual searching.</p></section>
  `;
}

function campusView() {
  return `
    <button class="back-link" type="button" data-page="more">← More campus information</button>
    <div class="page-title"><div class="eyebrow">UH Maui College</div><h1>Campus map</h1><p>Use these campus landmarks to orient yourself. Select Ka Lama for a room-by-room view.</p></div>
    <section class="campus-hero"><h2>Start at Ka Lama</h2><p>Find offices, classrooms, and student services in the Ka Lama Building.</p><button class="primary-button" type="button" data-page="map" style="margin-top:22px">Open building map <span class="arrow" aria-hidden="true">→</span></button><a class="text-button campus-link" href="${officialSite}" target="_blank" rel="noopener noreferrer">Open official UHMC website ↗</a></section>
    <div class="section-heading"><div><div class="eyebrow">Campus landmarks</div><h2>Find your next stop</h2></div></div>
    <div class="list-stack">
      <div class="list-card"><span class="avatar">KL</span><span class="list-copy"><strong>Ka Lama Building</strong><span>Classrooms, business department, student services</span></span></div>
      <div class="list-card"><span class="avatar">LC</span><span class="list-copy"><strong>Library & Learning Center</strong><span>Study resources and academic support</span></span></div>
      <div class="list-card"><span class="avatar">CC</span><span class="list-copy"><strong>Campus cafeteria</strong><span>Dining and grab-and-go options</span></span></div>
    </div>
    <p class="demo-note">Landmark descriptions are illustrative. Add the verified UHMC campus map link, routes, and accessible paths before publishing.</p>
  `;
}

const views = {
  welcome: homeView,
  home: homeView,
  programs: programsView,
  find: findView,
  jobs: jobsView,
  survey: surveyView,
  directory: directoryView,
  profile: profileView,
  map: mapView,
  classes: classesView,
  more: moreView,
  menu: menuView,
  events: eventsView,
  campus: campusView,
};

function render() {
  app.innerHTML = (views[state.page] || homeView)();
  markCurrentNav();
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.vote !== undefined) {
    state.surveyChoice = surveyChoices[Number(target.dataset.vote)];
    state.surveySubmitted = true;
    render();
    return;
  }
  if (target.dataset.page) {
    setPage(target.dataset.page);
    return;
  }
  if (target.dataset.staff) {
    state.staffId = target.dataset.staff;
    setPage("profile");
    return;
  }
  if (target.dataset.routeRoom) {
    const number = target.dataset.routeRoom;
    const floor = Number(target.dataset.floor || (Number(number) >= 200 ? 2 : 1));
    state.floor = floor;
    state.room = number;
    setPage("map");
    return;
  }
  if (target.dataset.floor) {
    state.floor = Number(target.dataset.floor);
    state.room = null;
    render();
    return;
  }
  if (target.dataset.room) {
    state.room = target.dataset.room;
    render();
    return;
  }
  if (target.dataset.day) {
    state.day = target.dataset.day;
    render();
    return;
  }
});

nav.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (button) setPage(button.dataset.page);
});

document.querySelector("[data-action='back']").addEventListener("click", goBack);
document.querySelector(".brand").addEventListener("click", () => setPage("home"));

let idleTimer;
let idleWarningTimer;
let idleCountdownTimer;
function clearIdleTimers() {
  window.clearTimeout(idleTimer);
  window.clearTimeout(idleWarningTimer);
  window.clearInterval(idleCountdownTimer);
}

function hideIdleWarning() {
  idleWarning.hidden = true;
  idleWarning.setAttribute("aria-hidden", "true");
}

function showIdleWarning() {
  if (splash.hidden === false) return;
  idleWarning.hidden = false;
  idleWarning.setAttribute("aria-hidden", "false");
  idleCountdown.textContent = String(IDLE_WARNING_MS / 1000);
  idleWarning.querySelector("[data-idle-stay]").focus({ preventScroll: true });

  const deadline = Date.now() + IDLE_WARNING_MS;
  idleCountdownTimer = window.setInterval(() => {
    idleCountdown.textContent = String(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
  }, 250);
  idleWarningTimer = window.setTimeout(showSplash, IDLE_WARNING_MS);
}

function resetIdleTimer() {
  clearIdleTimers();
  if (!splash.hidden) return;
  hideIdleWarning();
  idleTimer = window.setTimeout(showIdleWarning, IDLE_TIMEOUT_MS - IDLE_WARNING_MS);
}

["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
  document.addEventListener(eventName, (event) => {
    if (event.target instanceof Element && event.target.closest("#idle-warning")) return;
    resetIdleTimer();
  }, { passive: true });
});
idleWarning.addEventListener("click", (event) => {
  if (event.target === idleWarning) resetIdleTimer();
});
idleWarning.querySelector("[data-idle-stay]").addEventListener("click", resetIdleTimer);

function updateClock() {
  const currentTime = new Intl.DateTimeFormat("en-US", {
    weekday: "short", hour: "numeric", minute: "2-digit",
  }).format(new Date());
  document.querySelector("#clock").textContent = currentTime;
  document.querySelector("#splash-clock").textContent = currentTime;
}

updateClock();
window.setInterval(updateClock, 30000);
fitKioskStage();
window.addEventListener("resize", fitKioskStage);
window.visualViewport?.addEventListener("resize", fitKioskStage);
render();

const splashEnter = document.querySelector("[data-splash-enter]");
const splashSlides = [...splash.querySelectorAll(".splash-slide")];
let activeSplashSlide = splashSlides.findIndex((slide) => slide.classList.contains("is-active"));

window.setInterval(() => {
  if (splash.hidden || splash.classList.contains("is-exiting") || splashSlides.length < 2) return;
  splashSlides[activeSplashSlide].classList.remove("is-active");
  activeSplashSlide = (activeSplashSlide + 1) % splashSlides.length;
  splashSlides[activeSplashSlide].classList.add("is-active");
}, 5000);

splashEnter.addEventListener("click", enterKiosk);
