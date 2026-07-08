// =====================================
// NLCB CLEAN TEXT DASHBOARD: CWG WEBAPPS
// Theme: Electric Navy & Support Orange
// Version 5.9 
// Last Modified July 3 2026
// =====================================

const BRANDING = "CODEWITHGLASGOW";
const BASE_API = "https://script.google.com/macros/s/AKfycbwyr-M_ZzIscNgxJmR_UYHgZqmamn62Np4msDFaCjX9KgyUmyjuzuIYbawBmT0_mw4j/exec?action=calendar&weeks=450"; //72wks

/*
API ENDOINTS

PLAY WHE
https://script.google.com/macros/s/AKfycbwyr-M_ZzIscNgxJmR_UYHgZqmamn62Np4msDFaCjX9KgyUmyjuzuIYbawBmT0_mw4j/exec?action=calendar&weeks=5&game=P2WHE

PICK 2
https://script.google.com/macros/s/AKfycbwyr-M_ZzIscNgxJmR_UYHgZqmamn62Np4msDFaCjX9KgyUmyjuzuIYbawBmT0_mw4j/exec?action=calendar&weeks=5&game=PIKII

PICK 4
https://script.google.com/macros/s/AKfycbwyr-M_ZzIscNgxJmR_UYHgZqmamn62Np4msDFaCjX9KgyUmyjuzuIYbawBmT0_mw4j/exec?action=calendar&weeks=5&game=PIKIV

*/

const TICKER_URL = "https://script.google.com/macros/s/AKfycbymSUZ3cuBP7wZSKkxs8QmjMkKP6q3j-LOW_CVpY3n6Sw1EzsdwPu6yTEkpOmiAJz95/exec?action=ticker";

const spirits = {1:"Centipede",2:"Old Lady",3:"Carriage",4:"Dead Man",5:"Parson Man",6:"Belly",7:"Hog",8:"Tiger",9:"Cattle",10:"Monkey",11:"Corbeau",12:"King",13:"Crapaud",14:"Money",15:"Sick Woman",16:"Jamette",17:"Pigeon",18:"Water Boat",19:"Horse",20:"Dog",21:"Mouth",22:"Rat",23:"House",24:"Queen",25:"Morrocoy",26:"Fowl",27:"Little Snake",28:"Red Fish",29:"Opium Man",30:"House Cat",31:"Parson Wife",32:"Shrimp",33:"Spider",34:"Blind Man",35:"Big Snake",36:"Donkey"}

let globalTrackingCode = '';
let globalLastDraw = '';

// ====================================
// UNIQUE TRACKING CODE GENERATOR
// ====================================
function generateTrackingCode() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Get current draw time (MOR, MID, NON, EVE)
  const hours = now.getHours();
  let drawTime = 'EVE'; // Default
  if (hours >= 5 && hours < 10) drawTime = 'MOR';
  else if (hours >= 10 && hours < 14) drawTime = 'MID';
  else if (hours >= 14 && hours < 18) drawTime = 'NON';
  else drawTime = 'EVE';
  
  // Generate a random 4-character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `CWG-${day}${month}${year}-${drawTime}-${randomCode}`;
}

// Helper to get the last played draw time based on data
function getLastDrawTime(weeksData) {
  if (!weeksData || weeksData.length === 0) return '---';
  
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Search across ALL weeks from most recent to oldest
  for (let w = sortedWeeks.length - 1; w >= 0; w--) {
    const week = sortedWeeks[w];
    // Find the last played draw in this week
    for (let d = todayIdx; d >= 0; d--) {
      for (let s = slots.length - 1; s >= 0; s--) {
        const draw = getDraw(week, dayNames[d], slots[s]);
        if (draw) {
          const dayShort = dayNames[d].slice(0, 3).toUpperCase();
          const dayNum = new Date(new Date(week.startDate).getTime() + d * 86400000).getDate();
          return `${dayShort} ${dayNum} • ${slots[s]}`;
        }
      }
    }
    // If no draws found in this week, check if there are any draws at all
    // If the week has no draws at all (holiday week), skip to previous week
    let hasAnyDraw = false;
    for (const day of week.days) {
      for (const slot of slots) {
        if (getDraw(week, day.dayName, slot)) {
          hasAnyDraw = true;
          break;
        }
      }
      if (hasAnyDraw) break;
    }
    if (hasAnyDraw) break; // Stop if we found a week with draws but no draw today
  }
  return '---';
}

// ======================================
// SPLASH SCREEN COMPONENT
// 3D Animated Dice Splash with Fade-out
// ======================================

function createSplashHTML() {
  return `
  <style>
    #splash-screen {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #020617;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: opacity 0.8s ease-out;
    }
    .stage {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      perspective: 800px;
      padding: 0 5vw;
    }
    .scene {
      width: 18vw;
      height: 18vw;
      max-width: 70px;
      max-height: 70px;
      position: relative;
    }
    .cube {
      width: 100%;
      height: 100%;
      position: absolute;
      transform-style: preserve-3d;
      transition: transform 2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    }
    .face {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #ffffff;
      border-radius: 12%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
      backface-visibility: hidden;
    }
    .face--1 { transform: rotateY(0deg) translateZ(9vw); }
    .face--2 { transform: rotateY(90deg) translateZ(9vw); }
    .face--3 { transform: rotateY(180deg) translateZ(9vw); }
    .face--4 { transform: rotateY(-90deg) translateZ(9vw); }
    .face--5 { transform: rotateX(90deg) translateZ(9vw); }
    .face--6 { transform: rotateX(-90deg) translateZ(9vw); }
    @media (min-width: 400px) {
      .face--1 { transform: rotateY(0deg) translateZ(35px); }
      .face--2 { transform: rotateY(90deg) translateZ(35px); }
      .face--3 { transform: rotateY(180deg) translateZ(35px); }
      .face--4 { transform: rotateY(-90deg) translateZ(35px); }
      .face--5 { transform: rotateX(90deg) translateZ(35px); }
      .face--6 { transform: rotateX(-90deg) translateZ(35px); }
    }
    .dot {
      width: 2.5vw;
      height: 2.5vw;
      max-width: 8px;
      max-height: 8px;
      background: #111;
      border-radius: 50%;
    }
    .dots {
      display: grid;
      gap: 1vw;
      grid-template-columns: repeat(3, 1fr);
    }
    .reveal {
      text-align: center;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.8s ease-out;
      flex: 1;
    }
    .reveal.show {
      opacity: 1;
      transform: translateY(0);
    }
    .title {
      font-size: 7vw;
      font-weight: 900;
      color: #fff;
      margin: 0;
      white-space: nowrap;
    }
    .subtitle {
      font-size: 3.5vw;
      color: #58a6ff;
      margin-top: 5px;
      white-space: nowrap;
    }
    .fade-out {
      opacity: 0 !important;
      pointer-events: none;
    }
  </style>

  <div id="splash-screen">
    <div class="stage">
      <div class="scene"><div class="cube" id="cube1"></div></div>
      <div class="reveal" id="revealText">
        <h1 class="title">NLCB</h1>
        <h1 class="title">DASHBOARD</h1>
        <p class="subtitle">CODEWITHGLASGOW</p>
      </div>
      <div class="scene"><div class="cube" id="cube2"></div></div>
    </div>
  </div>

  <script>
    function makeFace(num) {
      const face = document.createElement('div');
      face.className = 'face face--' + num;
      const dot = '<div class="dot"></div>';
      const dots = {
        1: dot,
        2: '<div class="dots">' + dot + '<div></div><div></div><div></div><div></div><div></div><div></div><div></div>' + dot + '</div>',
        3: '<div class="dots">' + dot + '<div></div><div></div><div></div>' + dot + '<div></div><div></div><div></div>' + dot + '</div>',
        4: '<div class="dots">' + dot + '<div></div>' + dot + '<div></div><div></div><div></div>' + dot + '<div></div>' + dot + '</div>',
        5: '<div class="dots">' + dot + '<div></div>' + dot + '<div></div>' + dot + '<div></div>' + dot + '<div></div>' + dot + '</div>',
        6: '<div class="dots">' + dot + dot + dot + dot + dot + dot + '</div>'
      };
      face.innerHTML = dots[num] || '';
      return face;
    }

    function rollDice(cubeId) {
      const cube = document.getElementById(cubeId);
      cube.innerHTML = '';
      for (let i = 1; i <= 6; i++) cube.appendChild(makeFace(i));
      const result = Math.floor(Math.random() * 6) + 1;
      const rotations = {
        1: 'rotateX(0deg) rotateY(0deg)',
        2: 'rotateY(-90deg)',
        3: 'rotateY(180deg)',
        4: 'rotateY(90deg)',
        5: 'rotateX(-90deg)',
        6: 'rotateX(90deg)'
      };
      cube.style.transform = 'rotateX(720deg) rotateY(720deg)';
      setTimeout(() => { cube.style.transform = rotations[result]; }, 100);
    }

    function startSplash() {
      rollDice('cube1');
      rollDice('cube2');
      setTimeout(() => {
        document.getElementById('revealText').classList.add('show');
      }, 1200);
      setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.style.display = 'none';
        }, 800);
      }, 3500);
    }

    startSplash();
  </script>
  `;
}

let pwTimeline = [];
let timeline = [];
let pwDrawCountSinceHit = {};
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const todayName = daysOfWeek[new Date().getDay()];
const timeOrder = ["MOR", "MID", "NON", "EVE"];

if (config.runsInWidget) {
  let widget = await createWidget();
  Script.setWidget(widget);
  Script.complete();
} else {
  await presentComparisonDashboard(); 
}

// ====================================
// 1. WIDGET GENERATION (TRUE 3×3 GRID)
// ====================================
async function createWidget() {
  let widget = new ListWidget();
  widget.url = URLScheme.forRunningScript() + "?show=true";
  
  // --- ELECTRIC GRADIENT BACKGROUND ---
  let startColor = new Color("#020617");
  let endColor = new Color("#1e293b");
  let gradient = new LinearGradient();
  gradient.colors = [startColor, endColor];
  gradient.locations = [0, 1];
  widget.backgroundGradient = gradient;
  widget.setPadding(15, 18, 15, 18);

  // --- WATERMARK ---
  let dc = new DrawContext();
  dc.size = new Size(980, 980);
  dc.opaque = false;
  dc.setTextColor(new Color("#ffffff", 0.08));
  dc.setFont(Font.boldSystemFont(120));
  dc.setTextAlignedCenter();
  dc.drawTextInRect("FSP SAGi", new Rect(0, 430, 980, 200));
  widget.backgroundImage = dc.getImage();

  // --- TOP-RIGHT SUPPORT BUTTON ---
  let topBar = widget.addStack();
  topBar.addSpacer();
  let tag = topBar.addStack();
  tag.backgroundColor = new Color("#ff9d00");
  tag.cornerRadius = 8;
  tag.setPadding(3, 8, 3, 8);
  tag.url = "https://tt.wipayfinancial.com/scan2pay/MichaelGlasgow";
  let label = tag.addText("Support 🇹🇹 TTD $10");
  label.textColor = new Color("#000000");
  label.font = Font.boldSystemFont(12);

  // --- DATA FETCH ---
  let json = await new Request(TICKER_URL).loadJSON();
  let g = json.games;
  let updated = json.lastUpdated || "N/A";

  // --- HEADER ---
  widget.addSpacer(5);
  let header = widget.addText(`Latest NLCB Results • ⏰ ${updated}`);
  header.font = Font.boldSystemFont(12.5);
  header.textColor = new Color("#888888");
  header.centerAlignText();
  widget.addSpacer(7);

  // --- BALL HELPER ---
  function addCircle(parent, text, bg, fg, size = 22) {
    let c = parent.addStack();
    c.layoutVertically();
    c.centerAlignContent();
    let ball = c.addStack();
    ball.backgroundColor = new Color(bg);
    ball.cornerRadius = size / 2;
    ball.size = new Size(size, size);
    ball.centerAlignContent();
    let t = ball.addText(text);
    t.font = Font.boldSystemFont(size <= 22 ? 9 : 9);
    t.textColor = new Color(fg);
    return c;
  }

  // --- GRID SETUP ---
  const COL_W = 110;
  let grid = widget.addStack();
  grid.layoutVertically();
  grid.spacing = 12;

  function makeCol(parent) {
    let col = parent.addStack();
    col.layoutVertically();
    col.centerAlignContent();
    col.size = new Size(COL_W, 0);
    return col;
  }

  // ROW 1: TITLES
  let r1 = grid.addStack();
  ["PLAY WHE", "PICK 2", "PICK 4"].forEach(txt => {
    let c = makeCol(r1);
    let t = c.addText(txt);
    t.font = Font.boldSystemFont(18);
    t.textColor = new Color("#ffa500");
    t.centerAlignText();
  });

  // ROW 2: NUMBERS
  let r2 = grid.addStack();
  let pwCol = makeCol(r2);
  let p2Col = makeCol(r2);
  let p4Col = makeCol(r2);

  // 1. Play Whe Logic
  let pw = g.PLAYWHE[g.PLAYWHE.length-1];
  let pwNum = pw.numbers.match(/^\d+/)?.[0] || "";
  let mults = pw.numbers.match(/\(([^)]+)\)/)?.[1]?.split(", ") || [];
  let pws = pwCol.addStack(); pws.centerAlignContent();
  addCircle(pws, pwNum, "#ffff00", "#000000", 18);
  mults.forEach(m => {
    pws.addSpacer(2);
    let bg = m==="GB"?"#ffd700":m==="SB"?"#7c02b5":m==="JB"?"#0024f2":m==="SPB"?"#f29500":m==="PB"?"#9c8308":m=="BB"?"#ffa500":m==="WB"?"#ffffff":"#ff0000";
    let fg = (m==="WB"||m==="GB")?"#000000":"#ffffff";
    addCircle(pws, m, bg, fg, 18);
  });

  // 2. Pick 2 Logic
  let p2 = g.PICK2[g.PICK2.length-1];
  let [pair, p2m = ""] = p2.numbers.trim().split(" ");
  let [n1, n2] = pair.split("/");
  let p2s = p2Col.addStack(); p2s.centerAlignContent();
  addCircle(p2s, n1, "#054517", "#ffff00", 22); p2s.addSpacer(2);
  addCircle(p2s, n2, "#ffff00", "#000000", 22);
  if(p2m) { p2s.addSpacer(2); addCircle(p2s, p2m, p2m==="WB"?"#ffffff":"#ff0000", p2m==="WB"?"#000000":"#ffffff", 22); }

  // 3. Pick 4 Logic
  let p4 = g.PICK4[g.PICK4.length-1];
  let p4n = p4.numbers.match(/.{2}/g).map(n => String(parseInt(n,10)));
  let p4c = ["#ff0000","#ffff00","#00ff00","#ffffff"];
  let p4t = ["#ffffff","#000000","#000000","#000000"];
  let p4s = p4Col.addStack(); p4s.centerAlignContent();
  p4n.forEach((n,i) => { if(i>0) p4s.addSpacer(3); addCircle(p4s, n, p4c[i], p4t[i], 22); });

  // ROW 3: INFO
  let r3 = grid.addStack();
  [pw, p2, p4].forEach(item => {
    let c = makeCol(r3);
    let t = c.addText(`${item.name} • ${item.time}`);
    t.font = Font.mediumSystemFont(9);
    t.textColor = new Color("#888888");
    t.centerAlignText();
  });

  // FOOTER
  widget.addSpacer(11);
  let foot = widget.addText("CODEWITHGLASGOW • FSP SAGi SYSTEMS • v5");
  foot.font = Font.mediumSystemFont(12); foot.textColor = new Color("#555555"); foot.centerAlignText();

  widget.refreshAfterDate = new Date(Date.now() + 4 * 60 * 1000);
  return widget;
}

// Helper function to check if a date is in the past
function isPastDate(weekStartDate, dayName, drawTime) {
  if (!weekStartDate) return false;
  
  // Parse week start date
  const parts = weekStartDate.split(" ");
  const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
  const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
  
  // Find the day index
  const dayIndex = daysOfWeek.indexOf(dayName);
  if (dayIndex === -1) return false;
  
  // Calculate the actual date for this draw
  const drawDate = new Date(startDate);
  drawDate.setDate(startDate.getDate() + dayIndex);
  
  // Add time based on draw slot (approximate)
  const timeOffsets = { "MOR": 9, "MID": 12, "NON": 15, "EVE": 18 };
  drawDate.setHours(timeOffsets[drawTime] || 12);
  
  const now = new Date();
  return drawDate < now;
}

// Function to check if an entire day has no draws (HOLIDAY)
function isHolidayDay(day) {
  if (!day || !day.draws) return true;
  const slots = ["MOR", "MID", "NON", "EVE"];
  return slots.every(slot => {
    const val = day.draws[slot];
    return !val || val === "-" || val === "PENDING";
  });
}

// =======================================
// PLAY WHE CHART PLAY MAPPING - With Line, Suite & Spirit Info
// =======================================
function renderChartPlayMapping(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div class="chart-mapping-container" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading chart mapping data...</div>';
  }
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  const currWeekStart = new Date(currentWeek.startDate);
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced function to get draws from multiple weeks
  function getDrawFromMultipleWeeks(weeks, dayName, slot) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const week = weeks[i];
      const draw = getDraw(week, dayName, slot);
      if (draw) {
        return { value: draw, week: week };
      }
    }
    return null;
  }
  
  // Get draws from previous week for played analysis
  function getPreviousWeekDraws() {
    const prevDraws = [];
    if (previousWeek && previousWeek !== currentWeek) {
      for (const day of previousWeek.days) {
        for (const slot of slots) {
          const draw = getDraw(previousWeek, day.dayName, slot);
          if (draw) prevDraws.push(draw);
        }
      }
    }
    return prevDraws;
  }
  
  const previousWeekDraws = getPreviousWeekDraws();
  
  // Check which numbers have been played in current week
  const currentWeekDraws = [];
  for (let d = 0; d <= todayIdx; d++) {
    for (const slot of slots) {
      const draw = getDraw(currentWeek, dayNames[d], slot);
      if (draw) currentWeekDraws.push(draw);
    }
  }
  
  // If no current week draws, use previous week draws for analysis
  let allRecentDraws = [...new Set([...currentWeekDraws, ...previousWeekDraws])];
  
  // If still no draws, search across all weeks
  if (allRecentDraws.length === 0) {
    for (let w = sortedWeeks.length - 1; w >= 0; w--) {
      const week = sortedWeeks[w];
      for (const day of week.days) {
        for (const slot of slots) {
          const draw = getDraw(week, day.dayName, slot);
          if (draw && !allRecentDraws.includes(draw)) {
            allRecentDraws.push(draw);
          }
        }
      }
      if (allRecentDraws.length >= 10) break;
    }
  }
  
  // Enhanced deep search function that skips holidays
  function findDeepDraw(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
    const targetDayName = dayNames[targetDayIdx];
    
    for (let w = startWeekIndex; w >= 0; w--) {
      const week = sortedWeeks[w];
      
      if (targetDayIdx === 1) {
        const checkDay = week.days.find(d => d.dayName === "Monday");
        const isHoliday = !checkDay || slots.every(s => {
          const val = checkDay.draws[s];
          return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
        });
        if (isHoliday) continue;
      }
      
      const val = getDraw(week, targetDayName, targetSlot);
      if (val) {
        return { value: val, week: week, date: new Date(week.startDate) };
      }
    }
    return null;
  }
  
  // Find LEAVING number - search across weeks if needed
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  // First try current week
  for (let d = todayIdx; d >= 0; d--) {
    for (let s = slots.length - 1; s >= 0; s--) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        leavingNumber = draw;
        leavingDate = new Date(currWeekStart);
        leavingDate.setDate(currWeekStart.getDate() + d);
        leavingDay = dayNames[d];
        leavingSlot = slots[s];
        leavingDayIdx = d;
        leavingSlotIdx = s;
        break;
      }
    }
    if (leavingNumber) break;
  }
  
  // If no leaving number in current week, search previous weeks
  if (!leavingNumber) {
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            leavingNumber = draw;
            leavingDate = new Date(weekStart);
            leavingDate.setDate(weekStart.getDate() + d);
            leavingDay = dayNames[d];
            leavingSlot = slots[s];
            leavingDayIdx = d;
            leavingSlotIdx = s;
            break;
          }
        }
        if (leavingNumber) break;
      }
      if (leavingNumber) break;
    }
  }
  
  // Find MEETING number
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  let meetingWeek = null;
  
  if (leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
    let nextDayIdx = leavingDayIdx;
    let nextSlotIdx = leavingSlotIdx + 1;
    
    if (nextSlotIdx >= slots.length) {
      nextSlotIdx = 0;
      nextDayIdx = leavingDayIdx + 1;
    }
    
    if (nextDayIdx >= dayNames.length) {
      nextDayIdx = 0;
    }
    
    if (nextDayIdx < dayNames.length) {
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, nextDayIdx, slots[nextSlotIdx]);
      if (result && result.value) {
        meetingNumber = result.value;
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingWeek = result.week;
        meetingDate = result.date;
        if (meetingDate) {
          meetingDate.setDate(meetingDate.getDate() + nextDayIdx);
        }
      }
    }
  }
  
// == HELPER FUNCTIONS FOR LINE & SUITE ==
  const linesChart = {
    1: [1, 10, 19, 28], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30],
    4: [4, 13, 22, 31], 5: [5, 14, 23, 32], 6: [6, 15, 24, 33],
    7: [7, 16, 25, 34], 8: [8, 17, 26, 35], 9: [9, 18, 27, 36]
  };
  
  const suitsChart = {
    0: [10, 20, 30], 1: [1, 11, 21, 31], 2: [2, 12, 22, 32],
    3: [3, 13, 23, 33], 4: [4, 14, 24, 34], 5: [5, 15, 25, 35],
    6: [6, 16, 26, 36], 7: [7, 17, 27], 8: [8, 18, 28], 9: [9, 19, 29]
  };
  
  // Spirit Names mapping
  const spiritNames = {
    1: "Centipede", 2: "Old Lady", 3: "Carriage", 4: "Dead Man", 5: "Parson Man",
    6: "Belly", 7: "Hog", 8: "Tiger", 9: "Cattle", 10: "Monkey",
    11: "Corbeau", 12: "King", 13: "Crapaud", 14: "Money", 15: "Sick Woman",
    16: "Jamette", 17: "Pigeon", 18: "Water Boat", 19: "Horse", 20: "Dog",
    21: "Mouth", 22: "Rat", 23: "House", 24: "Queen", 25: "Morrocoy",
    26: "Fowl", 27: "Little Snake", 28: "Red Fish", 29: "Opium Man", 30: "House Cat",
    31: "Parson Wife", 32: "Shrimp", 33: "Spider", 34: "Blind Man", 35: "Big Snake", 36: "Donkey"
  };
  
  function getLineAndSuitForNumber(num) {
    if (!num) return { line: null, suit: null };
    
    let line = null;
    let suit = null;
    
    for (let [key, group] of Object.entries(linesChart)) {
      if (group.includes(num)) {
        line = key;
        break;
      }
    }
    
    for (let [key, group] of Object.entries(suitsChart)) {
      if (group.includes(num)) {
        suit = key;
        break;
      }
    }
    
    return { line, suit };
  }
  
  function formatLineSuit(line, suit) {
    if (line === null && suit === null) return "—";
    const lineStr = line !== null ? `${line} Line` : "";
    const suitStr = suit !== null ? `${suit} Suit` : "";
    if (lineStr && suitStr) return `${lineStr} / ${suitStr}`;
    return lineStr || suitStr;
  }
  
// Get Line & Suit for leaving/meeting nums
  const leavingLineSuit = getLineAndSuitForNumber(leavingNumber);
  const meetingLineSuit = getLineAndSuitForNumber(meetingNumber);
  
  // Get Spirit Names
  const leavingSpiritName = leavingNumber ? spiritNames[leavingNumber] : null;
  const meetingSpiritName = meetingNumber ? spiritNames[meetingNumber] : null;
  
  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };

  // Exact 10x10 structure 
  const gridMatrix = [
    [33,  4, 11, 13, 17, 22, 36, null, null, null],
    [21, 28,  4, 20, 10, 15, 29,   24, null, null],
    [ 5, 12,  3, 10,  8, 23,  1,   17,    7, null],
    [24, 17, 16, 16, 16, 30,  4,   36,   20, null],
    [18, 25, 23,  9,  2, 29, 11,   33,   27,   15],
    [ 8, 14,  7, 14, 22,  6, 20,   26,    8,    9],
    [null, 21,  6, 31, 24, 35, 19,   19,    5,    2],
    [null, null, 13, 21, 32, 12,  3,   34, null, null],
    [null, null, null, 25,  6, 32, null, null, null],
    [null, null, null, null, 13, null, null, null, null, null]
  ];
  
  // ========== FIND SURROUNDING NUMBERS FOR MEETING NUMBER (PRESERVE DUPLICATES) ==========
  let meetingPositions = [];
  let meetingSurroundingNumbers = [];
  
  // Find ALL positions of the meeting number in the grid (since it can appear multiple times)
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (gridMatrix[r][c] === meetingNumber) {
        meetingPositions.push({ row: r, col: c });
      }
    }
  }
  
  // Get all surrounding positions for EACH meeting position
  const directions = [
    { row: -1, col: 0, name: "N" },   // North
    { row: -1, col: 1, name: "NE" },  // Northeast
    { row: 0, col: 1, name: "E" },    // East
    { row: 1, col: 1, name: "SE" },   // Southeast
    { row: 1, col: 0, name: "S" },    // South
    { row: 1, col: -1, name: "SW" },  // Southwest
    { row: 0, col: -1, name: "W" },   // West
    { row: -1, col: -1, name: "NW" }  // Northwest
  ];
  
  for (const pos of meetingPositions) {
    for (const dir of directions) {
      const newRow = pos.row + dir.row;
      const newCol = pos.col + dir.col;
      if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
        const num = gridMatrix[newRow][newCol];
        if (num !== null && num !== undefined) {
          meetingSurroundingNumbers.push({
            num: num,
            direction: dir.name,
            row: newRow,
            col: newCol,
            centerRow: pos.row,
            centerCol: pos.col
          });
        }
      }
    }
  }
  
  // Split meeting surrounding numbers into played and pending (preserve all occurrences)
  const meetingPlayedSurrounding = [];
  const meetingPendingSurrounding = [];
  
  meetingSurroundingNumbers.forEach(item => {
    const isPlayedInRecent = allRecentDraws.includes(item.num);
    if (!isPlayedInRecent) {
      meetingPendingSurrounding.push(item);
    } else {
      meetingPlayedSurrounding.push(item);
    }
  });
  
  // ========== FIND SURROUNDING NUMBERS FOR LEAVING NUMBER (PRESERVE DUPLICATES) ==========
  let leavingPositions = [];
  let leavingSurroundingNumbers = [];
  
  // Find ALL positions of the leaving number in the grid
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (gridMatrix[r][c] === leavingNumber) {
        leavingPositions.push({ row: r, col: c });
      }
    }
  }
  
  for (const pos of leavingPositions) {
    for (const dir of directions) {
      const newRow = pos.row + dir.row;
      const newCol = pos.col + dir.col;
      if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
        const num = gridMatrix[newRow][newCol];
        if (num !== null && num !== undefined) {
          leavingSurroundingNumbers.push({
            num: num,
            direction: dir.name,
            row: newRow,
            col: newCol,
            centerRow: pos.row,
            centerCol: pos.col
          });
        }
      }
    }
  }
  
  // Split leaving surrounding numbers into played and pending (preserve all occurrences)
  const leavingPlayedSurrounding = [];
  const leavingPendingSurrounding = [];
  
  leavingSurroundingNumbers.forEach(item => {
    const isPlayedInRecent = allRecentDraws.includes(item.num);
    if (!isPlayedInRecent) {
      leavingPendingSurrounding.push(item);
    } else {
      leavingPlayedSurrounding.push(item);
    }
  });
  
  // Generate meeting pending items HTML (show ALL occurrences)
  const meetingPendingItemsHtml = meetingPendingSurrounding.map((item, idx) => `
    <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
      <div style="width: 22px; height: 22px; background: #ffd700; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ff9d00;">
        <span style="font-size: 16px; font-weight: 900; color: #000; line-height: 22px;">${item.num}</span>
      </div>
      <span style="font-size: 7px; margin-top: 2px; color: #ffd700;">${item.direction}</span>
    </div>
  `).join('');
  
  // Generate meeting played items HTML (show ALL occurrences)
  const meetingPlayedItemsHtml = meetingPlayedSurrounding.map((item, idx) => `
    <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px; opacity: 0.4;">
      <div style="width: 22px; height: 22px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 16px; font-weight: 900; color: #888; text-decoration: line-through; line-height: 22px;">${item.num}</span>
      </div>
      <span style="font-size: 7px; margin-top: 2px; color: #888;">${item.direction}</span>
    </div>
  `).join('');
  
  // Generate leaving pending items HTML (show ALL occurrences)
  const leavingPendingItemsHtml = leavingPendingSurrounding.map((item, idx) => `
    <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
      <div style="width: 22px; height: 22px; background: #ffd700; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #58a6ff;">
        <span style="font-size: 16px; font-weight: 900; color: #000; line-height: 22px;">${item.num}</span>
      </div>
      <span style="font-size: 7px; margin-top: 2px; color: #58a6ff;">${item.direction}</span>
    </div>
  `).join('');
  
  // Generate leaving played items HTML (show ALL occurrences)
  const leavingPlayedItemsHtml = leavingPlayedSurrounding.map((item, idx) => `
    <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px; opacity: 0.4;">
      <div style="width: 22px; height: 22px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 16px; font-weight: 900; color: #888; text-decoration: line-through; line-height: 22px;">${item.num}</span>
      </div>
      <span style="font-size: 7px; margin-top: 2px; color: #888;">${item.direction}</span>
    </div>
  `).join('');
  
  // Generate side-by-side Diamond Chart Play Sections
  const diamondChartPlayHtml = `
    <div style="margin-top: 6px; padding-top: 8px; border-top: 2px solid rgba(255,157,0,0.3);">
      <div style="font-size: 14px; font-weight: 800; color: #ff9d00; margin-bottom: 12px; text-align: center;">
        💎 DIAMOND CHART PLAY
      </div>
      
      <div style="display: flex; gap: 12px;">
        <!-- LEAVING SECTION (LEFT) -->
        <div style="flex: 1; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 10px; border: 1px solid #58a6ff;">
          <div style="font-size: 13px; font-weight: 800; color: #58a6ff; text-align: center; margin-bottom: 8px;">
            🔵 LEAVING • ${leavingNumber} ${spiritEmoji[leavingNumber] || ''}
          </div>
          
          ${leavingPendingItemsHtml ? `
            <div style="margin-bottom: 8px;">
              <div style="text-align: center; margin-bottom: 6px;">
                <span style="font-size: 8px; color: #58a6ff; background: rgba(88,166,255,0.2); padding: 2px 6px; border-radius: 12px;">PENDING</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; align-items: center;">
                ${leavingPendingItemsHtml}
              </div>
            </div>
          ` : '<div style="text-align:center; color:#666; font-size:10px; margin-bottom:8px;">No pending numbers</div>'}
          
          ${leavingPlayedItemsHtml ? `
            <div>
              <div style="text-align: center; margin-bottom: 6px;">
                <span style="font-size: 8px; color: #888; background: rgba(136,136,136,0.2); padding: 2px 6px; border-radius: 12px;">PLAYED</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; align-items: center;">
                ${leavingPlayedItemsHtml}
              </div>
            </div>
          ` : ''}
        </div>
        
        <!-- VERTICAL SEPARATOR -->
        <div style="width: 1px; background: linear-gradient(180deg, transparent, #58a6ff, #ff9d00, transparent); margin: 5px 0;"></div>
        
        <!-- MEETING SECTION (RIGHT) -->
        <div style="flex: 1; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 10px; border: 1px solid #ff9d00;">
          <div style="font-size: 13px; font-weight: 800; color: #ff9d00; text-align: center; margin-bottom: 8px;">
            🟡 MEETING • ${meetingNumber} ${spiritEmoji[meetingNumber] || ''}
          </div>
          
          ${meetingPendingItemsHtml ? `
            <div style="margin-bottom: 8px;">
              <div style="text-align: center; margin-bottom: 6px;">
                <span style="font-size: 8px; color: #ffd700; background: rgba(255,215,0,0.2); padding: 2px 6px; border-radius: 12px;">PENDING</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; align-items: center;">
                ${meetingPendingItemsHtml}
              </div>
            </div>
          ` : '<div style="text-align:center; color:#666; font-size:10px; margin-bottom:8px;">No pending numbers</div>'}
          
          ${meetingPlayedItemsHtml ? `
            <div>
              <div style="text-align: center; margin-bottom: 6px;">
                <span style="font-size: 8px; color: #888; background: rgba(136,136,136,0.2); padding: 2px 6px; border-radius: 12px;">PLAYED</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; align-items: center;">
                ${meetingPlayedItemsHtml}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div style="font-size: 8px; color: #64748b; text-align: center; margin-top: 5px; padding-top: 6px; border-top: 1px solid rgba(255,157,0,0.15);">
        🟡  PENDING • ⚫ PLAYED • Direction labels show position relative to each mark
      </div>
    </div>
  `;

  // Generate Diamond Grid HTML
  let gridCellsHtml = '';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const num = gridMatrix[r][c];
      if (num !== null && num !== undefined) {
        const isLeaving = (num === leavingNumber);
        const isMeeting = (num === meetingNumber);
        let cellBg = 'background: rgba(30, 41, 59, 0.7);';
        let borderStyle = 'border: 1px solid rgba(88, 166, 255, 0.4);';
        let txtColor = '#ffffff';

        if (isLeaving) {
          cellBg = 'background: rgba(88, 166, 255, 0.35);';
          borderStyle = 'border: 2px solid #58a6ff;';
          txtColor = '#58a6ff';
        } else if (isMeeting) {
          cellBg = 'background: rgba(255, 157, 0, 0.35);';
          borderStyle = 'border: 2px solid #ff9d00;';
          txtColor = '#ff9d00';
        }

        const emoji = spiritEmoji[num] || '';

        gridCellsHtml += `
          <div style="
            position: relative;
            grid-row: ${r + 1};
            grid-column: ${c + 1};
            width: 100%;
            padding-top: 100%;
            ${cellBg}
            ${borderStyle}
            box-sizing: border-box;
          ">
            <div style="
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              transform: rotate(-45deg);
            ">
              <span style="font-size: 16px; font-weight: 900; color: ${txtColor}; line-height: 1;">${num}</span>
              <span style="font-size: 8px; margin-top: 1px; opacity: 0.7;">${emoji}</span>
            </div>
          </div>
        `;
      }
    }
  }
  
  function formatDaySlot(day, slot, date) {
    if (!day || !slot) return "—";
    const dayShort = day.slice(0,3).toUpperCase();
    const dayNum = date ? date.getDate() : '';
    return `${dayShort} ${dayNum} • ${slot}`;
  }
  
  return `
    <div class="chart-mapping-container" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 8px; margin-bottom: 7px; border: 1px solid #58a6ff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box;">
      <div style="font-size: 16px; font-weight: 800; color: #ff9d00; margin-bottom: 11px; text-align: center; letter-spacing: 0.5px;">PlayWhe Diamond Chart Mapping</div>
  
      <!-- LEAVING and MEETING Containers with Spirit, Line & Suite -->
      <div style="display: flex; gap: 12px; margin-top: 3px;">
        <div style="flex: 1; background: rgba(88,166,255,0.12); border-radius: 14px; padding: 10px; text-align: center; border-left: 4px solid #58a6ff;">
          <div style="font-size: 12px; color: #58a6ff; font-weight: bold; letter-spacing: 0.5px;">LEAVING</div>
          <div style="font-size: 28px; font-weight: 900; color: #58a6ff; line-height: 1.1;">${leavingNumber || '—'} ${leavingNumber ? spiritEmoji[leavingNumber] || '' : ''}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-weight: 500;">${leavingSpiritName || '—'}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">${formatDaySlot(leavingDay, leavingSlot, leavingDate)}</div>
          <div style="font-size: 10px; color: #ff9d00; margin-top: 4px; font-weight: 600;">${formatLineSuit(leavingLineSuit.line, leavingLineSuit.suit)}</div>
        </div>
        <div style="flex: 1; background: rgba(255,157,0,0.12); border-radius: 14px; padding: 10px; text-align: center; border-left: 4px solid #ff9d00;">
          <div style="font-size: 12px; color: #ff9d00; font-weight: bold; letter-spacing: 0.5px;">MEETING</div>
          <div style="font-size: 28px; font-weight: 900; color: #ff9d00; line-height: 1.1;">${meetingNumber || '—'} ${meetingNumber ? spiritEmoji[meetingNumber] || '' : ''}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-weight: 500;">${meetingSpiritName || '—'}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">${meetingNumber ? formatDaySlot(meetingDay, meetingSlot, meetingDate) : 'Next Draw'}</div>
          <div style="font-size: 10px; color: #58a6ff; margin-top: 4px; font-weight: 600;">${meetingNumber ? formatLineSuit(meetingLineSuit.line, meetingLineSuit.suit) : '—'}</div>
        </div>
      </div>
      
      <!-- Diamond Grid -->
      <div style="
        width: 100%; 
        overflow: hidden; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        padding: 75px 0;
      ">
        <div style="
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          grid-template-rows: repeat(10, 1fr);
          width: 82vw;
          height: 82vw;
          max-width: 380px;
          max-height: 380px;
          transform: rotate(45deg);
        ">
          ${gridCellsHtml}
        </div>
      </div>
      
<div style="font-size: 9px; color: #64748b; text-align: center; margin-top: 3px; padding-top: 4px; border-top: 1px solid rgba(88,166,255,0.15);">
  <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
    <span>🔵 LEAVING • 🟠 MEETING • CodeWithGlasgow • CWG ©️</span>
    <span style="color: #ff9d00; font-weight: bold; font-size: 8px;">${globalTrackingCode}</span>
    <span style="color: #666; font-size: 8px;">Last: ${globalLastDraw}</span>
  </div>
</div>
      
      ${diamondChartPlayHtml}
      
    </div>
  `;
}

// =======================================
// PLAY WHE ANALYSIS READOUT (Intelligent - Previous Week + Current Week Updates)
// FIXED: Handles HOLIDAY in previous weeks correctly
// =======================================
function generatePlayWheReadout(weeksData) {
  // Check if we have valid data
  if (!weeksData || weeksData.length === 0) {
    return '<div class="analysis-readout" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #ff9d00; text-align:center;">📊 Waiting for Play Whe data to load...</div>';
  }
  
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  // If no valid previous week found, use current week as fallback
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
  // Format current week date range
  function formatWeekRange(week) {
    if (!week || !week.startDate) return "Current Week";
    const startDate = new Date(week.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
    const startFormatted = startDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    const endFormatted = endDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    
    return `${startFormatted} - ${endFormatted}`;
  }
  
  function formatPreviousWeekRange(week) {
    if (!week || !week.startDate) return "Last Week";
    const startDate = new Date(week.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
    const startFormatted = startDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    const endFormatted = endDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    
    return `${startFormatted} - ${endFormatted}`;
  }
  
  const currentWeekRange = formatWeekRange(currentWeek);
  const previousWeekRange = formatPreviousWeekRange(previousWeek);
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  const todayName = dayNames[todayIdx];
  
  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced function to get draws from multiple weeks
  function getDrawFromMultipleWeeks(weeks, dayName, slot) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const week = weeks[i];
      const draw = getDraw(week, dayName, slot);
      if (draw) {
        return { value: draw, week: week };
      }
    }
    return null;
  }
  
  // Enhanced deep search function that skips holidays
  function findDeepDraw(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
    const targetDayName = dayNames[targetDayIdx];
    
    for (let w = startWeekIndex; w >= 0; w--) {
      const week = sortedWeeks[w];
      
      if (targetDayIdx === 1) {
        const checkDay = week.days.find(d => d.dayName === "Monday");
        const isHoliday = !checkDay || slots.every(s => {
          const val = checkDay.draws[s];
          return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
        });
        if (isHoliday) continue;
      }
      
      const val = getDraw(week, targetDayName, targetSlot);
      if (val) {
        return { value: val, week: week, date: new Date(week.startDate) };
      }
    }
    return null;
  }
  
  function formatDate(date) {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).replace(/,/g, '');
  }
  
  function formatNumberList(numbers) {
    if (!numbers || numbers.length === 0) return "";
    const numbersCopy = [...numbers];
    if (numbersCopy.length === 1) return `${numbersCopy[0]}`;
    if (numbersCopy.length === 2) return `${numbersCopy[0]} and ${numbersCopy[1]}`;
    const last = numbersCopy.pop();
    return `${numbersCopy.join(", ")} and ${last}`;
  }
  
  // Get today's draws from previous week (skip holidays)
  let todayDraws = [];
  for (const slot of slots) {
    const draw = getDraw(previousWeek, todayName, slot);
    if (draw) todayDraws.push(draw);
  }
  
  // If no draws in previous week, search across all weeks
  if (todayDraws.length === 0) {
    for (const slot of slots) {
      const result = getDrawFromMultipleWeeks(sortedWeeks, todayName, slot);
      if (result && result.value) {
        todayDraws.push(result.value);
      }
    }
  }
  
  // If still no draws, get the most recent draws from any day
  if (todayDraws.length === 0) {
    let drawCount = 0;
    for (let w = sortedWeeks.length - 1; w >= 0 && drawCount < 4; w--) {
      const week = sortedWeeks[w];
      for (let d = dayNames.length - 1; d >= 0 && drawCount < 4; d--) {
        for (let s = slots.length - 1; s >= 0 && drawCount < 4; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            todayDraws.push(draw);
            drawCount++;
          }
        }
      }
    }
  }
  
  if (todayDraws.length === 0) {
    return '<div class="analysis-readout" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #ff9d00; text-align:center;">📊 No previous week data available for today\'s analysis</div>';
  }
  
  // Get all draws from previous week for baseline analysis (skip holidays)
  const previousWeekDraws = [];
  for (const day of dayNames) {
    for (const slot of slots) {
      const draw = getDraw(previousWeek, day, slot);
      if (draw) previousWeekDraws.push(draw);
    }
  }
  
  // Get all draws from current week so far (up to today)
  const currentWeekDraws = [];
  for (let d = 0; d <= todayIdx; d++) {
    for (const slot of slots) {
      const draw = getDraw(currentWeek, dayNames[d], slot);
      if (draw) currentWeekDraws.push(draw);
    }
  }
  
  // Count occurrences for previous week and current week
  const previousWeekCounts = {};
  previousWeekDraws.forEach(draw => {
    previousWeekCounts[draw] = (previousWeekCounts[draw] || 0) + 1;
  });
  
  const currentWeekCounts = {};
  currentWeekDraws.forEach(draw => {
    currentWeekCounts[draw] = (currentWeekCounts[draw] || 0) + 1;
  });
  
  // Lines analysis
  const lines = {
    1: [1,10,19,28], 2: [2,11,20,29], 3: [3,12,21,30],
    4: [4,13,22,31], 5: [5,14,23,32], 6: [6,15,24,33],
    7: [7,16,25,34], 8: [8,17,26,35], 9: [9,18,27,36]
  };
  
  const linesOutput = [];
  for (let line = 1; line <= 9; line++) {
    const lineNumbers = lines[line];
    const playedInLinePrev = lineNumbers.filter(num => previousWeekDraws.includes(num));
    const playedInLineCurrent = lineNumbers.filter(num => currentWeekDraws.includes(num));
    const allPlayedInLine = [...new Set([...playedInLinePrev, ...playedInLineCurrent])];
    const missingInLine = lineNumbers.filter(num => !allPlayedInLine.includes(num));
    
    if (playedInLinePrev.length === 0 && playedInLineCurrent.length === 0) {
      linesOutput.push(`${line} Line missing`);
    } else if (missingInLine.length > 0 && missingInLine.length < 4) {
      const missingText = formatNumberList(missingInLine);
      linesOutput.push(`${missingText} to complete ${line} Line`);
    }
  }
  
  // Suites analysis
  const suites = {
    0: [10,20,30], 1: [1,11,21,31], 2: [2,12,22,32],
    3: [3,13,23,33], 4: [4,14,24,34], 5: [5,15,25,35],
    6: [6,16,26,36], 7: [7,17,27], 8: [8,18,28], 9: [9,19,29]
  };
  
  const suitesOutput = [];
  for (let suite = 0; suite <= 9; suite++) {
    const suiteNumbers = suites[suite];
    const playedInSuitePrev = suiteNumbers.filter(num => previousWeekDraws.includes(num));
    const playedInSuiteCurrent = suiteNumbers.filter(num => currentWeekDraws.includes(num));
    const allPlayedInSuite = [...new Set([...playedInSuitePrev, ...playedInSuiteCurrent])];
    const missingInSuite = suiteNumbers.filter(num => !allPlayedInSuite.includes(num));
    
    if (playedInSuitePrev.length === 0 && playedInSuiteCurrent.length === 0) {
      suitesOutput.push(`${suite} Suite missing`);
    } else if (missingInSuite.length > 0 && missingInSuite.length < suiteNumbers.length) {
      const missingText = formatNumberList(missingInSuite);
      suitesOutput.push(`${missingText} to complete ${suite} Suite`);
    }
  }
  
  // Build timeline
  const timeline = [];
  const prevWeekStart = new Date(previousWeek.startDate);
  const currWeekStart = new Date(currentWeek.startDate);
  
  // Add previous week draws
  for (let d = 0; d < dayNames.length; d++) {
    const drawDate = new Date(prevWeekStart);
    drawDate.setDate(prevWeekStart.getDate() + d);
    for (const slot of slots) {
      const draw = getDraw(previousWeek, dayNames[d], slot);
      if (draw) {
        timeline.push({ 
          num: draw, 
          date: drawDate, 
          day: dayNames[d], 
          slot: slot,
          timestamp: drawDate.getTime(),
          week: "prev"
        });
      }
    }
  }
  
  // Add current week draws (up to today)
  for (let d = 0; d <= todayIdx; d++) {
    const drawDate = new Date(currWeekStart);
    drawDate.setDate(currWeekStart.getDate() + d);
    for (const slot of slots) {
      const draw = getDraw(currentWeek, dayNames[d], slot);
      if (draw) {
        timeline.push({ 
          num: draw, 
          date: drawDate, 
          day: dayNames[d], 
          slot: slot,
          timestamp: drawDate.getTime(),
          week: "curr"
        });
      }
    }
  }
  
  // If no timeline entries, search across all weeks
  if (timeline.length === 0) {
    for (let w = sortedWeeks.length - 1; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      for (let d = 0; d < dayNames.length; d++) {
        const drawDate = new Date(weekStart);
        drawDate.setDate(weekStart.getDate() + d);
        for (const slot of slots) {
          const draw = getDraw(week, dayNames[d], slot);
          if (draw) {
            timeline.push({ 
              num: draw, 
              date: drawDate, 
              day: dayNames[d], 
              slot: slot,
              timestamp: drawDate.getTime(),
              week: "prev"
            });
          }
        }
      }
      if (timeline.length > 0) break;
    }
  }
  
  timeline.sort((a, b) => a.timestamp - b.timestamp);
  
  // LAST DATE PLAY
  let lastPlayDate = null;
  let lastPlayNumbers = [];
  if (timeline.length > 0) {
    const lastDraw = timeline[timeline.length - 1];
    lastPlayDate = lastDraw.date;
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].day === lastDraw.day) {
        if (!lastPlayNumbers.includes(timeline[i].num)) {
          lastPlayNumbers.unshift(timeline[i].num);
        }
      } else {
        break;
      }
    }
  }
  
  // LAST FLIP
  let lastFlip = { num1: null, num2: null, date: null };
  const partners = {};
  for (let i = 1; i <= 18; i++) {
    partners[i] = 37 - i;
    partners[37 - i] = i;
  }
  
  for (let i = timeline.length - 1; i >= 1; i--) {
    const curr = timeline[i];
    const prev = timeline[i-1];
    if (partners[curr.num] === prev.num || partners[prev.num] === curr.num) {
      lastFlip = { num1: prev.num, num2: curr.num, date: curr.date };
      break;
    }
  }
  
  // DOUBLE/TRIPLE/QUADRUPLE LOGIC
  const doubleNumbers = [8, 11, 22, 33];
  
  const toDoubleMissing = doubleNumbers.filter(num => !previousWeekDraws.includes(num) && !currentWeekDraws.includes(num));
  
  const toDoubleCurrent = doubleNumbers.filter(num => (currentWeekCounts[num] || 0) === 1);
  
  const toTripleMissing = [];
  for (let num = 1; num <= 36; num++) {
    const prevCount = previousWeekCounts[num] || 0;
    const currCount = currentWeekCounts[num] || 0;
    if (prevCount === 2 && currCount === 0) toTripleMissing.push(num);
  }
  
  const toTripleCurrent = [];
  for (let num = 1; num <= 36; num++) {
    const currCount = currentWeekCounts[num] || 0;
    if (currCount === 2) toTripleCurrent.push(num);
  }
  
  const toQuadrupleMissing = [];
  for (let num = 1; num <= 36; num++) {
    const prevCount = previousWeekCounts[num] || 0;
    const currCount = currentWeekCounts[num] || 0;
    if (prevCount === 3 && currCount === 0) toQuadrupleMissing.push(num);
  }
  
  const toQuadrupleCurrent = [];
  for (let num = 1; num <= 36; num++) {
    const currCount = currentWeekCounts[num] || 0;
    if (currCount === 3) toQuadrupleCurrent.push(num);
  }
  
  // WAPPI, DAMBALAY, PULL BACK
  const wappiList = [];
  for (let i = timeline.length - 1; i >= 1; i--) {
    const curr = timeline[i];
    const prev = timeline[i-1];
    
    if (curr.num === prev.num) {
      const isSameDayConsecutive = (prev.day === curr.day && 
        ((prev.slot === "MOR" && curr.slot === "MID") ||
         (prev.slot === "MID" && curr.slot === "NON") ||
         (prev.slot === "NON" && curr.slot === "EVE")));
      
      const isEveningToNextMorning = (prev.slot === "EVE" && curr.slot === "MOR" && 
        dayNames.indexOf(prev.day) + 1 === dayNames.indexOf(curr.day));
      
      if (isSameDayConsecutive || isEveningToNextMorning) {
        wappiList.push({ num: curr.num, date: curr.date });
      }
    }
  }
  
  const uniqueWappi = [];
  for (let i = wappiList.length - 1; i >= 0 && uniqueWappi.length < 3; i--) {
    if (!uniqueWappi.find(w => w.num === wappiList[i].num)) {
      uniqueWappi.push(wappiList[i]);
    }
  }
  
  const dambalayList = [];
  for (let i = timeline.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      if (timeline[i].num === timeline[j].num && i !== j) {
        const later = timeline[i];
        const earlier = timeline[j];
        
        const isMorToNon = (earlier.slot === "MOR" && later.slot === "NON" && earlier.day === later.day);
        const isMidToEve = (earlier.slot === "MID" && later.slot === "EVE" && earlier.day === later.day);
        const isCrossDay = (earlier.day !== later.day);
        
        if (isMorToNon || isMidToEve || isCrossDay) {
          dambalayList.push({ num: later.num, date: later.date });
          break;
        }
      }
    }
  }
  
  const uniqueDambalay = [];
  for (let i = dambalayList.length - 1; i >= 0 && uniqueDambalay.length < 3; i--) {
    if (!uniqueDambalay.find(d => d.num === dambalayList[i].num)) {
      uniqueDambalay.push(dambalayList[i]);
    }
  }
  
  const pullBackList = [];
  for (let i = timeline.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      if (timeline[i].num === timeline[j].num && timeline[i].day !== timeline[j].day) {
        const dayDiff = dayNames.indexOf(timeline[i].day) - dayNames.indexOf(timeline[j].day);
        if (dayDiff >= 2 || (dayDiff < 0 && dayDiff + 7 >= 2)) {
          pullBackList.push({ num: timeline[i].num, date: timeline[i].date });
          break;
        }
      }
    }
  }
  
  const uniquePullBack = [];
  for (let i = pullBackList.length - 1; i >= 0 && uniquePullBack.length < 3; i--) {
    if (!uniquePullBack.find(p => p.num === pullBackList[i].num)) {
      uniquePullBack.push(pullBackList[i]);
    }
  }
  
  // LEAVING & MEETING Containers
  function getLineAndSuitForNumber(num) {
    const linesChartLocal = {
      1: [1,10,19,28], 2: [2,11,20,29], 3: [3,12,21,30],
      4: [4,13,22,31], 5: [5,14,23,32], 6: [6,15,24,33],
      7: [7,16,25,34], 8: [8,17,26,35], 9: [9,18,27,36]
    };
    const suitsChartLocal = {
      0: [10,20,30], 1: [1,11,21,31], 2: [2,12,22,32],
      3: [3,13,23,33], 4: [4,14,24,34], 5: [5,15,25,35],
      6: [6,16,26,36], 7: [7,17,27], 8: [8,18,28], 9: [9,19,29]
    };
    
    let line = null, suit = null;
    for (const [key, group] of Object.entries(linesChartLocal)) {
      if (group.includes(num)) { line = key; break; }
    }
    for (const [key, group] of Object.entries(suitsChartLocal)) {
      if (group.includes(num)) { suit = key; break; }
    }
    return { line, suit };
  }
  
  function formatLineSuitLocal(line, suit) {
    if (line === null && suit === null) return "—";
    const lineStr = line !== null ? `${line} Line` : "";
    const suitStr = suit !== null ? `${suit} Suit` : "";
    if (lineStr && suitStr) return `${lineStr} / ${suitStr}`;
    return lineStr || suitStr;
  }
  
  function formatDaySlotLocal(day, slot, date) {
    const dayShort = day.slice(0,3).toUpperCase();
    const dayNum = date ? date.getDate() : '';
    return `${dayShort} ${dayNum} • ${slot}`;
  }
  
  // Find leaving number - search across weeks if needed
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  const currWeekStartDate = new Date(currentWeek.startDate);
  const todayIdxLocal = now.getDay();
  
  // First try current week
  for (let d = todayIdxLocal; d >= 0; d--) {
    for (let s = slots.length - 1; s >= 0; s--) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        leavingNumber = draw;
        leavingDate = new Date(currWeekStartDate);
        leavingDate.setDate(currWeekStartDate.getDate() + d);
        leavingDay = dayNames[d];
        leavingSlot = slots[s];
        leavingDayIdx = d;
        leavingSlotIdx = s;
        break;
      }
    }
    if (leavingNumber) break;
  }
  
  // If no leaving number in current week, search previous weeks
  if (!leavingNumber) {
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            leavingNumber = draw;
            leavingDate = new Date(weekStart);
            leavingDate.setDate(weekStart.getDate() + d);
            leavingDay = dayNames[d];
            leavingSlot = slots[s];
            leavingDayIdx = d;
            leavingSlotIdx = s;
            break;
          }
        }
        if (leavingNumber) break;
      }
      if (leavingNumber) break;
    }
  }
  
  // Find meeting number with holiday skipping
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  
  if (leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
    let nextDayIdx = leavingDayIdx;
    let nextSlotIdx = leavingSlotIdx + 1;
    
    if (nextSlotIdx >= slots.length) {
      nextSlotIdx = 0;
      nextDayIdx = leavingDayIdx + 1;
    }
    
    if (nextDayIdx >= dayNames.length) {
      nextDayIdx = 0;
    }
    
    if (nextDayIdx < dayNames.length) {
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, nextDayIdx, slots[nextSlotIdx]);
      if (result && result.value) {
        meetingNumber = result.value;
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = result.date;
        if (meetingDate) {
          meetingDate.setDate(meetingDate.getDate() + nextDayIdx);
        }
      }
    }
  }
  
  const leavingLineSuit = getLineAndSuitForNumber(leavingNumber);
  const meetingLineSuit = getLineAndSuitForNumber(meetingNumber);
  
  const leavingHtml = leavingNumber ? `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #58a6ff;">
      <div style="font-size: 14px; color: #58a6ff; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px;">LEAVING</div>
      <div style="font-size: 36px; font-weight: 900; color: #58a6ff; line-height: 1;">${leavingNumber}${spiritEmoji[leavingNumber] || ''}</div>
      <div style="font-size: 10px; color: #aaa; margin-top: 2px;">${formatDaySlotLocal(leavingDay, leavingSlot, leavingDate)}</div>
      <div style="font-size: 9px; color: #ff9d00; margin-top: 2px; font-weight: 600;">${formatLineSuitLocal(leavingLineSuit.line, leavingLineSuit.suit)}</div>
    </div>
  ` : `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #58a6ff;">
      <div style="font-size: 14px; color: #58a6ff; font-weight: bold; margin-bottom: 2px;">LEAVING</div>
      <div style="font-size: 24px; font-weight: 900; color: #555;">—</div>
      <div style="font-size: 9px; color: #888; margin-top: 2px;">No data yet</div>
    </div>
  `;
  
  const meetingHtml = meetingNumber ? `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #ff9d00;">
      <div style="font-size: 14px; color: #ff9d00; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px;">MEETING</div>
      <div style="font-size: 36px; font-weight: 900; color: #ff9d00; line-height: 1;">${meetingNumber}${spiritEmoji[meetingNumber] || ''}</div>
      <div style="font-size: 10px; color: #aaa; margin-top: 2px;">${formatDaySlotLocal(meetingDay, meetingSlot, meetingDate)}</div>
      <div style="font-size: 9px; color: #58a6ff; margin-top: 2px; font-weight: 600;">${formatLineSuitLocal(meetingLineSuit.line, meetingLineSuit.suit)}</div>
    </div>
  ` : `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #ff9d00;">
      <div style="font-size: 14px; color: #ff9d00; font-weight: bold; margin-bottom: 4px;">MEETING</div>
      <div style="font-size: 24px; font-weight: 900; color: #555;">—</div>
      <div style="font-size: 9px; color: #888; margin-top: 3px;">Waiting for next draw</div>
    </div>
  `;
  
  const leavingMeetingHtml = `
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 6px 0;">
    ${leavingHtml}
    ${meetingHtml}
  </div>
  `;
  
  // TREND ALERT
  const trendNumbers = [4, 12, 16, 29];
  
  const flipPartners = {
    4: 33, 33: 4,
    12: 25, 25: 12,
    16: 21, 21: 16,
    29: 8, 8: 29
  };
  
  let triggerNumber = null;
  let triggerDate = null;
  let triggerDay = null;
  let triggerSlot = null;
  
  for (let d = 0; d <= todayIdx; d++) {
    for (let s = 0; s < slots.length; s++) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw && trendNumbers.includes(draw)) {
        triggerNumber = draw;
        triggerDate = new Date(currWeekStart);
        triggerDate.setDate(currWeekStart.getDate() + d);
        triggerDay = dayNames[d];
        triggerSlot = slots[s];
        break;
      }
    }
    if (triggerNumber) break;
  }
  
  const trendAlertData = [];
  for (const num of trendNumbers) {
    let playedDate = null;
    let playedDay = null;
    let playedSlot = null;
    let playedCount = 0;
    
    for (let d = 0; d <= todayIdx; d++) {
      for (let s = 0; s < slots.length; s++) {
        const draw = getDraw(currentWeek, dayNames[d], slots[s]);
        if (draw === num) {
          playedCount++;
          if (!playedDate) {
            playedDate = new Date(currWeekStart);
            playedDate.setDate(currWeekStart.getDate() + d);
            playedDay = dayNames[d];
            playedSlot = slots[s];
          }
        }
      }
    }
    
    const flipNum = flipPartners[num];
    let flipPlayedDate = null;
    let flipPlayedDay = null;
    let flipPlayedSlot = null;
    let flipPlayedCount = 0;
    
    if (flipNum) {
      for (let d = 0; d <= todayIdx; d++) {
        for (let s = 0; s < slots.length; s++) {
          const draw = getDraw(currentWeek, dayNames[d], slots[s]);
          if (draw === flipNum) {
            flipPlayedCount++;
            if (!flipPlayedDate) {
              flipPlayedDate = new Date(currWeekStart);
              flipPlayedDate.setDate(currWeekStart.getDate() + d);
              flipPlayedDay = dayNames[d];
              flipPlayedSlot = slots[s];
            }
          }
        }
      }
    }
    
    trendAlertData.push({
      num: num,
      playedCount: playedCount,
      playedDate: playedDate,
      playedDay: playedDay,
      playedSlot: playedSlot,
      flipNum: flipNum,
      flipPlayedCount: flipPlayedCount,
      flipPlayedDate: flipPlayedDate,
      flipPlayedDay: flipPlayedDay,
      flipPlayedSlot: flipPlayedSlot
    });
  }
  
  function formatShortDate(date) {
    if (!date) return null;
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/,/g, '');
  }
  
  function formatSlot(slot) {
    if (!slot) return "";
    const slotNames = { MOR: "🌅", MID: "☀️", NON: "🌤️", EVE: "🌙" };
    return `${slotNames[slot] || ""} ${slot}`;
  }
  
  let trendAlertHtml = '';
  const hasAnyPlayed = trendAlertData.some(item => item.playedCount > 0);
  
  if (hasAnyPlayed) {
    const trendRows = trendAlertData.map(item => {
      const mainDisplay = item.playedCount > 0 
        ? `<span style="font-size: 18px; font-weight: 900; color: #ff9d00;">${item.num}${spiritEmoji[item.num] || ''} 🔥</span>`
        : `<span style="font-size: 18px; font-weight: 900; opacity: 0.5;">${item.num}${spiritEmoji[item.num] || ''}</span>`;
      
      const mainDate = item.playedDate ? `${formatShortDate(item.playedDate)} ${formatSlot(item.playedSlot)}` : 'pending';
      
      const flipDisplay = item.flipPlayedCount > 0
        ? `<span style="font-size: 16px; font-weight: 700; color: #58a6ff;">🪞${item.flipNum}${spiritEmoji[item.flipNum] || ''}</span>`
        : `<span style="font-size: 14px; font-weight: 500; opacity: 0.5;">🪞${item.flipNum}${spiritEmoji[item.flipNum] || ''}</span>`;
      
      const flipDate = item.flipPlayedDate ? `${formatShortDate(item.flipPlayedDate)} ${formatSlot(item.flipPlayedSlot)}` : 'pending';
      
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,157,0,0.1); border-radius: 8px; padding: 8px 12px; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 100px;">
            ${mainDisplay}
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 9px; color: #888;">Played</span>
              <span style="font-size: 10px; font-weight: 500;">${mainDate}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
              <span style="font-size: 9px; color: #888;">Mirror</span>
              <span style="font-size: 10px; font-weight: 500;">${flipDate}</span>
            </div>
            ${flipDisplay}
          </div>
        </div>
      `;
    }).join('');
    
    let triggerInfoHtml = '';
    if (triggerNumber) {
      const triggerDateFormatted = formatShortDate(triggerDate);
      triggerInfoHtml = `
        <div style="background: rgba(255,157,0,0.2); border-radius: 8px; padding: 6px 10px; margin-bottom: 10px; text-align: center;">
          <span style="font-size: 11px; font-weight: bold;">⚡️TRIGGERED BY</span>
          <span style="font-size: 14px; font-weight: 900; color: #ff9d00; margin-left: 8px;">${triggerNumber}${spiritEmoji[triggerNumber] || ''} 🔥</span>
          <span style="font-size: 11px; margin-left: 8px;">• ${triggerDateFormatted}</span>
          <span style="font-size: 11px; margin-left: 4px;">${formatSlot(triggerSlot)}</span>
<br>⚠️▶️ 4⚰️, 12🤴🏽, 16💃🏽, 29🍻 ◀️⚠️
        </div>
      `;
    }
    
    trendAlertHtml = `
      <div style="background: rgba(255,157,0,0.08); border-radius: 12px; padding: 10px; margin-bottom: 7px; border-left: 3px solid #ff9d00;">
        <div style="font-size: 11px; color: #ff9d00; font-weight: bold; margin-bottom: 8px; text-align: center;">
          🆘 PLAY ALL 4 🆘
        </div>
        ${triggerInfoHtml}
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${trendRows}
        </div>
        <div style="font-size: 8px; color: #666; margin-top: 4px; text-align: center; padding-top: 4px; border-top: 1px solid rgba(255,157,0,0.2);">
          Play any of these 4 numbers - when one hits, along with the mirror of the triggered number
        </div>
      </div>
      <div style="padding: 6px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 7px; color: #333; background: #fafafa;">
  <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
    <span>PLAY WHE STATS</span>
    <span style="color: #ff9d00; font-weight: bold; font-size: 7px;">${globalTrackingCode}</span>
    <span style="color: #666; font-size: 7px;">Last: ${globalLastDraw}</span>
  </div>
  <div style="font-size: 6px; color: #888;">CODEWITHGLASGOW CHART ANALYSIS ©️ CWG</div>
</div>
</div>
    `;
  }
  
  const formatNumbersWithEmoji = (numbers) => {
    if (!numbers || numbers.length === 0) return "";
    const formatted = numbers.map(n => `${n}${spiritEmoji[n] || ''}`);
    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return formatted.join(" and ");
    const formattedCopy = [...formatted];
    const last = formattedCopy.pop();
    return `${formattedCopy.join(", ")} and ${last}`;
  };
  
  // Build HTML sections
  const linesHtml = linesOutput.length > 0 ? linesOutput.join('<br>') : "None";
  const suitesHtml = suitesOutput.length > 0 ? suitesOutput.join('<br>') : "None";
  const wappiHtml = uniqueWappi.length > 0 ? uniqueWappi.map(w => `#${w.num} ${spiritEmoji[w.num] || ''} (${formatDate(w.date)})`).join(' | ') : "";
  const dambalayHtml = uniqueDambalay.length > 0 ? uniqueDambalay.map(d => `#${d.num} ${spiritEmoji[d.num] || ''} (${formatDate(d.date)})`).join(' | ') : "";
  const pullBackHtml = uniquePullBack.length > 0 ? uniquePullBack.map(p => `#${p.num} ${spiritEmoji[p.num] || ''} (${formatDate(p.date)})`).join(' | ') : "";
  
  const toDoubleMissingHtml = toDoubleMissing.length > 0 ? formatNumbersWithEmoji(toDoubleMissing) : "";
  const toDoubleCurrentHtml = toDoubleCurrent.length > 0 ? formatNumbersWithEmoji(toDoubleCurrent) : "";
  const toTripleMissingHtml = toTripleMissing.length > 0 ? formatNumbersWithEmoji(toTripleMissing) : "";
  const toTripleCurrentHtml = toTripleCurrent.length > 0 ? formatNumbersWithEmoji(toTripleCurrent) : "";
  const toQuadrupleMissingHtml = toQuadrupleMissing.length > 0 ? formatNumbersWithEmoji(toQuadrupleMissing) : "";
  const toQuadrupleCurrentHtml = toQuadrupleCurrent.length > 0 ? formatNumbersWithEmoji(toQuadrupleCurrent) : "";
  
  const lastFlipText = lastFlip.num1 ? `${formatDate(lastFlip.date)} (${lastFlip.num1}${spiritEmoji[lastFlip.num1] || ''}🪞↔🪞${lastFlip.num2}${spiritEmoji[lastFlip.num2] || ''})` : "";
  const lastPlayText = lastPlayDate ? `${formatDate(lastPlayDate)} • ${lastPlayNumbers.map(n => '#' + n + ' ' + (spiritEmoji[n] || '')).join(' ')}` : "N/A";
  
  const todayDrawsText = todayDraws.map(num => `${num}${spiritEmoji[num] || ''}`).join('  ');
  
  return `
    <div class="analysis-readout" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 8px; margin-bottom: 5px; border: 1px solid #ff9d00;">
      <div style="font-size: 14px; font-weight: 800; color: #ff9d00; margin-bottom: 3px;">📅 UNDER TODAY • ${today} • CWG ©️</div>
      <div style="font-size: 20px; font-weight: 900; text-align: center; margin-bottom: 3px; background: rgba(255,157,0,0.15); padding: 4px; border-radius: 12px;">
        ${todayDrawsText}
      </div>
      ${leavingMeetingHtml}
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 3px;">
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px;">
          <div style="font-size: 10px; color: #888;">♠️ LINES MISSING</div>
          <div style="font-size: 11px; font-weight: bold; color: #ff9d00;">${linesHtml}</div>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px;">
          <div style="font-size: 10px; color: #888;">♠️ SUITS MISSING</div>
          <div style="font-size: 11px; font-weight: bold; color: #ff9d00;">${suitesHtml}</div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🗓️ LAST DATE PLAY</div>
        <div style="font-size: 13px; font-weight: bold;">${lastPlayText}</div>
      </div>
      ${lastFlipText ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🔄 LAST FLIP</div>
        <div style="font-size: 13px; font-weight: bold;">${lastFlipText}</div>
      </div>` : ''}
      
      ${toDoubleMissingHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO DOUBLE (MISSING)</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toDoubleMissingHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Double numbers that haven't played</div>
      </div>` : ''}
      ${toDoubleCurrentHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO DOUBLE x2 (CURRENT WEEK • ${currentWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toDoubleCurrentHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Played once this week - could double</div>
      </div>` : ''}
      
      ${toTripleMissingHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO TRIPLE x3 (FROM LAST WEEK • ${previousWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toTripleMissingHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Had 2 plays last week - needs 1 more</div>
      </div>` : ''}
      ${toTripleCurrentHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO TRIPLE x3 (CURRENT WEEK • ${currentWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toTripleCurrentHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Already has 2 plays this week - needs 1 more for triple</div>
      </div>` : ''}
      
      ${toQuadrupleMissingHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO QUADRUPLE x4 (FROM LAST WEEK • ${previousWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toQuadrupleMissingHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Had 3 plays last week - needs 1 more</div>
      </div>` : ''}
      ${toQuadrupleCurrentHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO QUADRUPLE x4 (CURRENT WEEK • ${currentWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toQuadrupleCurrentHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Already has 3 plays this week - needs 1 more for quadruple</div>
      </div>` : ''}
      
      ${wappiHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🔥🔥🔥 LAST THREE WAPPI</div>
        <div style="font-size: 11px;">${wappiHtml}</div>
      </div>` : ''}
      ${dambalayHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🪵🪵🪵 LAST THREE DAMBALAY</div>
        <div style="font-size: 11px;">${dambalayHtml}</div>
      </div>` : ''}
      ${pullBackHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 7px;">
        <div style="font-size: 10px; color: #888;">🪵🪵🪵 LAST THREE PULL BACK</div>
        <div style="font-size: 11px;">${pullBackHtml}</div>
      </div>` : ''}

      <div style="padding: 6px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 7px; color: #333; background: #fafafa;">
      <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span>PLAY WHE STATS</span>
        <span style="color: #ff9d00; font-weight: bold; font-size: 7px;">${globalTrackingCode}</span>
        <span style="color: #666; font-size: 7px;">Last: ${globalLastDraw}</span>
      </div>
      <div style="font-size: 6px; color: #888;">CODEWITHGLASGOW CHARTS ANALYSIS ©️ CWG</div>
    </div>
    <br>
      ${trendAlertHtml}
    </div>
  `;
}
//////////////////////////////////////////

/////////////////DRAWS DISPLAY////////////
// =======================================
// DRAW PREVIEW CONTAINER - Shows Next Draw
// =======================================
function renderDrawPreview(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 12px; margin-bottom: 7px; border: 1px solid #58a6ff; text-align:center;">📊 Loading draw preview...</div>';
  }
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  const currentHour = now.getHours();
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced function to get draws from multiple weeks
  function getDrawFromMultipleWeeks(weeks, dayName, slot) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const week = weeks[i];
      const draw = getDraw(week, dayName, slot);
      if (draw) {
        return { value: draw, week: week };
      }
    }
    return null;
  }
  
  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  
  // Determine which day to show 
  // Determine current slot
  let currentSlot = "EVE";
  if (currentHour >= 5 && currentHour < 10) currentSlot = "MOR";
  else if (currentHour >= 10 && currentHour < 14) currentSlot = "MID";
  else if (currentHour >= 14 && currentHour < 18) currentSlot = "NON";
  else currentSlot = "EVE";
  
  // Find the next slot to display
  let displayDayIdx = todayIdx;
  let displaySlotIdx = slots.indexOf(currentSlot) + 1;
  let isTomorrow = false;
  
  if (displaySlotIdx >= slots.length) {
    displaySlotIdx = 0;
    displayDayIdx = (todayIdx + 1) % 7;
    isTomorrow = true;
  }
  
  const displayDayName = dayNames[displayDayIdx];
  const displaySlot = slots[displaySlotIdx];
  
  // Get the draws for the display day from previous week (for historical data)
  let displayDraws = [];
  
  // First try to get draws from previous week
  for (const slot of slots) {
    const draw = getDraw(previousWeek, displayDayName, slot);
    if (draw) displayDraws.push(draw);
  }
  
  // If no draws in previous week, search across all weeks
  if (displayDraws.length === 0) {
    for (const slot of slots) {
      const result = getDrawFromMultipleWeeks(sortedWeeks, displayDayName, slot);
      if (result && result.value) {
        displayDraws.push(result.value);
      }
    }
  }
  
  // If still no draws, get most recent draws from any day
  if (displayDraws.length === 0) {
    let drawCount = 0;
    for (let w = sortedWeeks.length - 1; w >= 0 && drawCount < 4; w--) {
      const week = sortedWeeks[w];
      for (let d = dayNames.length - 1; d >= 0 && drawCount < 4; d--) {
        for (let s = slots.length - 1; s >= 0 && drawCount < 4; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            displayDraws.push(draw);
            drawCount++;
          }
        }
      }
    }
  }
  
  // Format date for display
  const displayDate = new Date(now);
  const dayOffset = isTomorrow ? 1 : 0;
  displayDate.setDate(now.getDate() + dayOffset);
  
  const formattedDate = displayDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  // Generate draws HTML with emojis
  const drawsHtml = displayDraws.map((num, idx) => `
    <span style="display: inline-flex; align-items: center; gap: 2px; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 12px; margin: 0 2px;">
      <span style="font-size: 14px; font-weight: 900; color: #ffd700;">${num}</span>
      <span style="font-size: 14px;">${spiritEmoji[num] || ''}</span>
    </span>
  `).join('');
  
  // Create the text to copy
  const copyText = displayDraws.map(num => `${num}${spiritEmoji[num] || ''}`).join(' ');
  
  // Determine header text
  const headerText = isTomorrow ? "⏳ TOMORROW'S DRAWS" : "📅 TODAY'S DRAWS";
  const headerColor = isTomorrow ? "#58a6ff" : "#ff9d00";
  
  // Copy button function
  const copyButtonId = `copy-btn-${Date.now()}`;
  
  return `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 12px; margin-bottom: 7px; border: 1px solid ${headerColor};">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 6px;">
        <span style="font-size: 13px; font-weight: 800; color: ${headerColor}; letter-spacing: 1px;">${headerText}</span>
        <span style="font-size: 10px; color: #64748b; margin-left: 8px;">${displaySlot}</span>
      </div>
      
      <!-- Date and Draws Row -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: rgba(255,255,255,0.02); border-radius: 12px; padding: 8px 12px; border: 1px solid rgba(255,255,255,0.05);">
        
        <!-- Date -->
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">📆</span>
          <span style="font-size: 11px; color: #e2e8f0; font-weight: 600;">${formattedDate}</span>
        </div>
        
        <!-- Draws with Emojis -->
        <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
          ${displayDraws.length > 0 ? drawsHtml : '<span style="font-size: 11px; color: #64748b;">No draws available</span>'}
        </div>
        
        <!-- Copy Button -->
        <button id="${copyButtonId}" 
                onclick="copyDraws('${copyText.replace(/'/g, "\\'")}', '${copyButtonId}')"
                style="background: ${headerColor}; border: none; border-radius: 8px; padding: 4px 10px; font-size: 10px; font-weight: 700; color: #000; cursor: pointer; display: flex; align-items: center; gap: 4px;">
          📋 Copy
        </button>
        
      </div>
      
      <!-- Copy Script -->
      <script>
        function copyDraws(text, btnId) {
          const btn = document.getElementById(btnId);
          const originalText = btn.innerText;
          
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
              btn.innerText = '✅ Copied!';
              setTimeout(() => { btn.innerText = originalText; }, 2000);
            }).catch(() => {
              // Fallback
              const textArea = document.createElement('textarea');
              textArea.value = text;
              document.body.appendChild(textArea);
              textArea.select();
              try {
                document.execCommand('copy');
                btn.innerText = '✅ Copied!';
                setTimeout(() => { btn.innerText = originalText; }, 2000);
              } catch (err) {
                btn.innerText = '❌ Failed';
                setTimeout(() => { btn.innerText = originalText; }, 2000);
              }
              document.body.removeChild(textArea);
            });
          } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand('copy');
              btn.innerText = '✅ Copied!';
              setTimeout(() => { btn.innerText = originalText; }, 2000);
            } catch (err) {
              btn.innerText = '❌ Failed';
              setTimeout(() => { btn.innerText = originalText; }, 2000);
            }
            document.body.removeChild(textArea);
          }
        }
      </script>
      
      <!-- Footer -->
      <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
  <span style="font-size: 12px; color: #fffff;">CodeWithGlasgow Chart Analysis • CWG ©️</span>
        <span style="font-size: 12px; color: #fffff;">${isTomorrow ? 'Based on previous week data' : 'Current Week Data'}</span>
      </div>
      
    </div>
  `;
}
/////////END OF DRAWS DISPLAY/////////////

// ======================================
// PICK 2 CURRENT WEEK PLAYS INFO (WITH CAROUSEL - 10 ITEMS PER SLIDE)
// ======================================
function renderPick2CurrentWeekPlays(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div class="pick2-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading Pick 2 data...</div>';
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const slotDisplay = { MOR: "🌅", MID: "☀️", NON: "🌤️", EVE: "🌙" };
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  const currWeekStart = new Date(currentWeek.startDate);
  const todayIdx = now.getDay();
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? val.toString() : null;
  }
  
  function formatDisplayDate(date, slot) {
    if (!date) return "Never";
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'};
    return `${date.toLocaleDateString('en-US', options).replace(/,/g, '')} ${slotDisplay[slot] || ''}`;
  }
  
  // Collect all Pick 2 draws from current week
  const currentWeekPlays = [];
  for (let d = 0; d <= todayIdx; d++) {
    for (let s = 0; s < slots.length; s++) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        // Parse the draw (e.g., "25,5" or "12/21")
        const parts = draw.split(/[,/ ]+/);
        if (parts.length >= 2) {
          const first = parseInt(parts[0], 10);
          const second = parseInt(parts[1], 10);
          if (!isNaN(first) && !isNaN(second)) {
            const playDate = new Date(currWeekStart);
            playDate.setDate(currWeekStart.getDate() + d);
            currentWeekPlays.push({
              straight: `${first},${second}`,
              reverse: `${second},${first}`,
              first: first,
              second: second,
              date: playDate,
              day: dayNames[d],
              slot: slots[s],
              slotIcon: slotDisplay[slots[s]]
            });
          }
        }
      }
    }
  }
  
  // Build history map from ALL previous weeks (for hit counts and last played)
  const historyMap = new Map(); // key: "first,second"
  
  // Scan ALL previous weeks (excluding current week) for accurate history
  const historyWeeks = sortedWeeks.slice(0, -1);
  historyWeeks.forEach(week => {
    const weekStart = new Date(week.startDate);
    for (let d = 0; d < dayNames.length; d++) {
      for (let s = 0; s < slots.length; s++) {
        const draw = getDraw(week, dayNames[d], slots[s]);
        if (draw) {
          const parts = draw.split(/[,/ ]+/);
          if (parts.length >= 2) {
            const first = parseInt(parts[0], 10);
            const second = parseInt(parts[1], 10);
            if (!isNaN(first) && !isNaN(second)) {
              const comboKey = `${first},${second}`;
              const drawDate = new Date(weekStart);
              drawDate.setDate(weekStart.getDate() + d);
              
              if (!historyMap.has(comboKey)) {
                historyMap.set(comboKey, { hits: 0, lastDate: null, lastSlot: null });
              }
              const comboData = historyMap.get(comboKey);
              comboData.hits++;
              if (!comboData.lastDate || drawDate > comboData.lastDate) {
                comboData.lastDate = drawDate;
                comboData.lastSlot = slots[s];
              }
            }
          }
        }
      }
    }
  });
  
  // Build table rows for each unique straight play in current week
  const uniquePlays = new Map();
  currentWeekPlays.forEach(play => {
    const key = play.straight;
    if (!uniquePlays.has(key)) {
      uniquePlays.set(key, {
        straight: play.straight,
        reverse: play.reverse,
        first: play.first,
        second: play.second,
        playedDate: play.date,
        playedDay: play.day,
        playedSlot: play.slot,
        playedSlotIcon: play.slotIcon
      });
    }
  });
  
  // Convert to array for pagination
  const allPlays = Array.from(uniquePlays.values());
  const itemsPerPage = 8;
  const totalPages = Math.ceil(allPlays.length / itemsPerPage);
  
  // Build all pages HTML
  const pagesHtml = [];
  for (let page = 0; page < totalPages; page++) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pagePlays = allPlays.slice(start, end);
    
    let pageRowsHtml = '';
    for (let play of pagePlays) {
      // Get data for straight combination
      const straightData = historyMap.get(play.straight) || { hits: 0, lastDate: null, lastSlot: null };
      
      // Get data for reverse combination (separate lookup)
      const reverseData = historyMap.get(play.reverse) || { hits: 0, lastDate: null, lastSlot: null };
      
      const straightLastPlayed = straightData.lastDate ? formatDisplayDate(straightData.lastDate, straightData.lastSlot) : "Never";
      const reverseLastPlayed = reverseData.lastDate ? formatDisplayDate(reverseData.lastDate, reverseData.lastSlot) : "Never";
      
      pageRowsHtml += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <td style="padding: 4px 4px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="background: #054517; color: #ffff00; padding: 4px 4px; border-radius: 50px; font-weight: bold; font-size: 14px;">${play.first}</span>
              <span style="color: #ff9d00;">/</span>
              <span style="background: #ffff00; color: #000; padding: 4px 4px; border-radius: 50px; font-weight: bold; font-size: 14px;">${play.second}</span>
            </div>
            <div style="font-size: 9px; color: #888; margin-top: 4px;">${play.playedDay} ${play.playedSlotIcon}</div>
           </td>
          <td style="padding: 4px 4px; text-align: center; font-weight: bold; color: #32d74b;">${straightData.hits}x</td>
          <td style="padding: 4px 4px; text-align: center; font-size: 11px;">${straightLastPlayed}</td>
          <td style="padding:4px 4px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="background: #ffff00; color: #000; padding: 4px 4px; border-radius: 50px; font-weight: bold; font-size: 14px;">${play.second}</span>
              <span style="color: #ff9d00;">/</span>
              <span style="background: #054517; color: #ffff00; padding: 4px 4px; border-radius: 50px; font-weight: bold; font-size: 14px;">${play.first}</span>
            </div>
          </td>
          <td style="padding: 4px 4px; text-align: center; font-weight: bold; color: #32d74b;">${reverseData.hits}x</td>
          <td style="padding: 4px 4px; text-align: center; font-size: 11px;">${reverseLastPlayed}</td>
        </tr>
      `;
    }
    
    pagesHtml.push(`
      <div class="carousel-slide-pick2" style="min-width: 100%; scroll-snap-align: start;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tbody>
            ${pageRowsHtml}
          </tbody>
        </table>
      </div>
    `);
  }
  
  if (allPlays.length === 0) {
    return `
      <div class="pick2-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 11px; margin-bottom: 7px; border: 1px solid #58a6ff; text-align:center;">
        <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 3px;">📊 PICK 2 CURRENT WEEK PLAYS INFO</div>
        <div style="color: #888;">No Pick 2 plays recorded in current week yet</div>
      </div>
    `;
  }
  
  // Generate dots for pagination
  let dotsHtml = '';
  for (let i = 0; i < totalPages; i++) {
    dotsHtml += `<span class="carousel-dot-pick2" data-slide="${i}" style="width: 8px; height: 8px; background: #555; border-radius: 50%; display: inline-block; margin: 0 4px; cursor: pointer; transition: all 0.3s ease;"></span>`;
  }
  
  const carouselId = 'pick2-carousel-' + Date.now();
  
  return `
    <div class="pick2-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 7px; border: 1px solid #58a6ff;">
      <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 3px; text-align: center;">📊 PICK 2 CURRENT WEEK PLAYS INFO</div>
      <div style="overflow-x: auto;">
        <!-- Fixed Header Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: rgba(88,166,255,0.2); border-bottom: 2px solid #58a6ff;">
              <th style="padding: 10px; text-align: center;">Straight Play</th>
              <th style="padding: 10px; text-align: center;">Hit</th>
              <th style="padding: 10px; text-align: center;">Last Played</th>
              <th style="padding: 10px; text-align: center;">Reverse Play</th>
              <th style="padding: 10px; text-align: center;">Hit</th>
              <th style="padding: 10px; text-align: center;">Last Played</th>
            </tr>
          </thead>
        </table>
      </div>
      
      <!-- Swipeable Carousel Container -->
      <div id="${carouselId}" style="overflow-x: auto; scroll-snap-type: x mandatory; display: flex; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; gap: 0; margin-top: 5px;">
        ${pagesHtml.join('')}
      </div>
      
      <!-- Page Indicators -->
      <div style="display: flex; justify-content: center; margin-top: 3px; gap: 3px;" id="${carouselId}-dots">
        ${dotsHtml}
      </div>
      
      <div style="font-size: 8px; color: #555; text-align: center; margin-top: 5px; padding-top: 6px; border-top: 1px solid rgba(88,166,255,0.2);">
        Based on current week plays • Historical data from previous weeks • ${allPlays.length} total plays • Swipe for more
      </div>
    </div>
    
    <script>
      (function() {
        var container = document.getElementById('${carouselId}');
        var dots = document.querySelectorAll('#${carouselId}-dots .carousel-dot-pick2');
        var currentIndex = 0;
        var totalSlides = ${totalPages};
        
        function updateDots() {
          dots.forEach(function(dot, idx) {
            if (idx === currentIndex) {
              dot.style.background = '#58a6ff';
              dot.style.width = '16px';
              dot.style.borderRadius = '4px';
            } else {
              dot.style.background = '#555';
              dot.style.width = '8px';
              dot.style.borderRadius = '50%';
            }
          });
        }
        
        function scrollToSlide(index) {
          if (index < 0) index = 0;
          if (index >= totalSlides) index = totalSlides - 1;
          currentIndex = index;
          var slideWidth = container.children[0] ? container.children[0].offsetWidth : 0;
          if (slideWidth > 0) {
            container.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
          }
          updateDots();
        }
        
        function handleScroll() {
          var slideWidth = container.children[0] ? container.children[0].offsetWidth : 0;
          var scrollPosition = container.scrollLeft;
          var newIndex = Math.round(scrollPosition / slideWidth);
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalSlides) {
            currentIndex = newIndex;
            updateDots();
          }
        }
        
        if (container) {
          container.addEventListener('scroll', handleScroll);
          dots.forEach(function(dot, idx) {
            dot.addEventListener('click', function() {
              scrollToSlide(idx);
            });
          });
        }
        
        updateDots();
      })();
    </script>
  `;
}
////////END OF PK2 C.WKS PLAY/////////////

/////////PK4 C.WKS PLAY///////////////////
// ======================================
// PICK 4 CURRENT WEEK PLAYS INFO - PERMUTATION ANALYSIS
// Shows all historical permutations of digits from each current week draw
// ======================================
function renderPick4CurrentWeekPlays(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div class="pick4-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading Pick 4 data...</div>';
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const slotDisplay = { MOR: "🌅", MID: "☀️", NON: "🌤️", EVE: "🌙" };
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const allWeeks = sortedWeeks;
  
  const currWeekStart = new Date(currentWeek.startDate);
  const todayIdx = now.getDay();
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? val.toString() : null;
  }
  
  function formatDisplayDate(date, slot) {
    if (!date) return "Never";
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'};
    return `${date.toLocaleDateString('en-US', options).replace(/,/g, '')} ${slotDisplay[slot] || ''}`;
  }
  
  // Helper to get the 4-digit number from a draw
  function getPick4Number(draw) {
    if (!draw) return null;
    const cleanDraw = draw.toString().replace(/[^0-9]/g, '');
    if (cleanDraw.length === 8) {
      return cleanDraw;
    }
    return cleanDraw.padStart(4, '0');
  }
  
  // Helper to generate all unique permutations of 4 digits
  function getAllPermutations(digits) {
    const results = new Set();
    
    function permute(arr, start) {
      if (start === arr.length - 1) {
        results.add(arr.join(''));
        return;
      }
      for (let i = start; i < arr.length; i++) {
        [arr[start], arr[i]] = [arr[i], arr[start]];
        permute(arr, start + 1);
        [arr[start], arr[i]] = [arr[i], arr[start]];
      }
    }
    
    permute([...digits], 0);
    return Array.from(results);
  }
  
  // Build history map from ALL weeks (for hit counts and last played)
  const historyMap = new Map(); // key: "4-digit number" -> { hits, lastDate, lastSlot, occurrences }
  
  // Scan ALL weeks for historical data
  allWeeks.forEach(week => {
    const weekStart = new Date(week.startDate);
    for (let d = 0; d < dayNames.length; d++) {
      for (let s = 0; s < slots.length; s++) {
        const draw = getDraw(week, dayNames[d], slots[s]);
        if (draw) {
          const number = getPick4Number(draw);
          if (number && number.length === 4) {
            const drawDate = new Date(weekStart);
            drawDate.setDate(weekStart.getDate() + d);
            
            if (!historyMap.has(number)) {
              historyMap.set(number, { hits: 0, lastDate: null, lastSlot: null, occurrences: [] });
            }
            const comboData = historyMap.get(number);
            comboData.hits++;
            comboData.occurrences.push({ date: drawDate, slot: slots[s], day: dayNames[d] });
            if (!comboData.lastDate || drawDate > comboData.lastDate) {
              comboData.lastDate = drawDate;
              comboData.lastSlot = slots[s];
            }
          }
        }
      }
    }
  });
  
  // Collect all Pick 4 draws from current week and their permutations
  const currentWeekDraws = [];
  for (let d = 0; d <= todayIdx; d++) {
    for (let s = 0; s < slots.length; s++) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        const number = getPick4Number(draw);
        if (number && number.length === 4) {
          const playDate = new Date(currWeekStart);
          playDate.setDate(currWeekStart.getDate() + d);
          currentWeekDraws.push({
            original: number,
            digits: number.split(''),
            date: playDate,
            day: dayNames[d],
            slot: slots[s],
            slotIcon: slotDisplay[slots[s]]
          });
        }
      }
    }
  }
  
  // Build a map of all permutations for each unique draw
  const drawPermutationsMap = new Map(); // key: original number, value: { original, permutations[], plays }
  
  currentWeekDraws.forEach(draw => {
    const key = draw.original;
    if (!drawPermutationsMap.has(key)) {
      // Generate all unique permutations of the digits
      const allPerms = getAllPermutations(draw.digits);
      // Filter to only permutations that have actually been played in history
      const playedPermutations = allPerms.filter(perm => historyMap.has(perm));
      // Sort by hit count (most frequent first)
      playedPermutations.sort((a, b) => {
        const hitsA = historyMap.get(a)?.hits || 0;
        const hitsB = historyMap.get(b)?.hits || 0;
        return hitsB - hitsA;
      });
      
      drawPermutationsMap.set(key, {
        original: draw.original,
        permutations: playedPermutations,
        playedDate: draw.date,
        playedDay: draw.day,
        playedSlot: draw.slot,
        playedSlotIcon: draw.slotIcon
      });
    }
  });
  
  // Convert to array for pagination
  const allDraws = Array.from(drawPermutationsMap.values());
  const itemsPerPage = 5; // 5 draws per page (each with its permutations)
  const totalPages = Math.ceil(allDraws.length / itemsPerPage);
  
  // Function to format permutation with styling
  function formatPermutation(perm, isOriginal = false, highlightColor = null) {
    if (isOriginal) {
      return `<span style="font-weight: bold; font-size: 16px; color: #ff9d00; background: rgba(255,157,0,0.2); padding: 4px 8px; border-radius: 8px;">${perm}</span>`;
    }
    if (highlightColor) {
      return `<span style="color: ${highlightColor}; border: 1px solid ${highlightColor}; background: ${highlightColor}15; border-radius: 6px; padding: 4px 8px; font-weight: 500; display: inline-block;">${perm}</span>`;
    }
    return `<span style="font-family: monospace; font-size: 13px; padding: 4px 8px;">${perm}</span>`;
  }
  
  // Build all pages HTML
  const pagesHtml = [];
  for (let page = 0; page < totalPages; page++) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pageDraws = allDraws.slice(start, end);
    
    let pageRowsHtml = '';
    for (let draw of pageDraws) {
      const comboData = historyMap.get(draw.original) || { hits: 0, lastDate: null, lastSlot: null };
      const lastPlayed = comboData.lastDate ? formatDisplayDate(comboData.lastDate, comboData.lastSlot) : "Never";
      
      // Build permutations list with hit counts
      let permutationsHtml = '';
      draw.permutations.forEach(perm => {
        const permData = historyMap.get(perm);
        const isOriginal = (perm === draw.original);
        const hitCount = permData?.hits || 0;
        // Get highlight color from comboColors if this permutation was played in current week
        // (we'll check if any current week draw matches this permutation)
        let highlightColor = null;
        for (let cd of currentWeekDraws) {
          if (cd.original === perm) {
            highlightColor = "#58a6ff";
            break;
          }
        }
        
        permutationsHtml += `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 6px 12px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${formatPermutation(perm, isOriginal, highlightColor)}
              <span style="font-size: 11px; color: #32d74b;">${hitCount}x</span>
            </div>
            <span style="font-size: 9px; color: #888;">Last: ${permData?.lastDate ? formatDisplayDate(permData.lastDate, permData.lastSlot) : 'Never'}</span>
          </div>
        `;
      });
      
      pageRowsHtml += `
        <div style="margin-bottom: 20px; background: rgba(88,166,255,0.05); border-radius: 16px; padding: 12px; border: 1px solid rgba(88,166,255,0.3);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 14px; font-weight: 800; color: #58a6ff;">🎲 DRAWN:</span>
              <span style="font-size: 20px; font-weight: 900; color: #ff9d00; margin-left: 8px;">${draw.original}</span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #888;">${draw.playedDay} ${draw.playedSlotIcon}</div>
              <div style="font-size: 11px; color: #aaa;">Hits: ${comboData.hits}x | Last: ${lastPlayed}</div>
            </div>
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #58a6ff; margin-bottom: 8px;">📊 PERMUTATIONS PLAYED IN HISTORY (${draw.permutations.length} of 24 possible):</div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${permutationsHtml}
          </div>
          ${draw.permutations.length === 0 ? '<div style="color: #666; text-align: center; padding: 10px;">No permutations of this number have been played in history</div>' : ''}
        </div>
      `;
    }
    
    pagesHtml.push(`
      <div class="carousel-slide-pick4-perm" style="min-width: 100%; scroll-snap-align: start;">
        <div style="padding: 4px;">
          ${pageRowsHtml}
        </div>
      </div>
    `);
  }
  
  if (allDraws.length === 0) {
    return `
      <div class="pick4-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">
        <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 8px;">📊 PICK 4 CURRENT WEEK PLAYS INFO</div>
        <div style="color: #888;">No Pick 4 plays recorded in current week yet</div>
      </div>
    `;
  }
  
  // Generate dots for pagination
  let dotsHtml = '';
  for (let i = 0; i < totalPages; i++) {
    dotsHtml += `<span class="carousel-dot-pick4-perm" data-slide="${i}" style="width: 8px; height: 8px; background: #555; border-radius: 50%; display: inline-block; margin: 0 4px; cursor: pointer; transition: all 0.3s ease;"></span>`;
  }
  
  const carouselId = 'pick4-perm-carousel-' + Date.now();
  
  return `
    <div class="pick4-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff;">
      <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 12px; text-align: center;">📊 PICK 4 PERMUTATION ANALYSIS</div>
      <div style="font-size: 10px; color: #aaa; text-align: center; margin-bottom: 12px;">
        For each drawn number, showing all permutations that have appeared in history
      </div>
      
      <!-- Swipeable Carousel Container -->
      <div id="${carouselId}" style="overflow-x: auto; scroll-snap-type: x mandatory; display: flex; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; gap: 16px; margin-top: 10px;">
        ${pagesHtml.join('')}
      </div>
      
      <!-- Page Indicators -->
      <div style="display: flex; justify-content: center; margin-top: 12px; gap: 6px;" id="${carouselId}-dots">
        ${dotsHtml}
      </div>
      
      <div style="font-size: 8px; color: #555; text-align: center; margin-top: 10px; padding-top: 6px; border-top: 1px solid rgba(88,166,255,0.2);">
        🔄 Swipe to see more draws • ${allDraws.length} draws this week • Showing historical permutations
      </div>
    </div>
    
    <script>
      (function() {
        var container = document.getElementById('${carouselId}');
        var dots = document.querySelectorAll('#${carouselId}-dots .carousel-dot-pick4-perm');
        var currentIndex = 0;
        var totalSlides = ${totalPages};
        
        function updateDots() {
          dots.forEach(function(dot, idx) {
            if (idx === currentIndex) {
              dot.style.background = '#58a6ff';
              dot.style.width = '16px';
              dot.style.borderRadius = '4px';
            } else {
              dot.style.background = '#555';
              dot.style.width = '8px';
              dot.style.borderRadius = '50%';
            }
          });
        }
        
        function scrollToSlide(index) {
          if (index < 0) index = 0;
          if (index >= totalSlides) index = totalSlides - 1;
          currentIndex = index;
          var slideWidth = container.children[0] ? container.children[0].offsetWidth : 0;
          if (slideWidth > 0) {
            container.scrollTo({ left: index * (slideWidth + 16), behavior: 'smooth' });
          }
          updateDots();
        }
        
        function handleScroll() {
          var slideWidth = container.children[0] ? container.children[0].offsetWidth : 0;
          var scrollPosition = container.scrollLeft;
          var newIndex = Math.round(scrollPosition / (slideWidth + 16));
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalSlides) {
            currentIndex = newIndex;
            updateDots();
          }
        }
        
        if (container) {
          container.addEventListener('scroll', handleScroll);
          dots.forEach(function(dot, idx) {
            dot.addEventListener('click', function() {
              scrollToSlide(idx);
            });
          });
        }
        
        updateDots();
        setTimeout(function() { scrollToSlide(0); }, 100);
      })();
    </script>
  `;
}
////////END OF PK4 C.WKS PLAY/////////////

/////////PICK 4 SUITS TRACKING////////////
// =======================================
// RENDER PICK 4 DIGIT FREQUENCY TRACKER - ENHANCED
// With Current Week & Previous Week Integration (Internal)
// =======================================
function renderPick4DigitTracker(title, weeksData, currentCycleNumber) {
  // Define digit colors
  const numberColors = {
    0: "#6c757d", 1: "#ff6b6b", 2: "#ffa94d", 3: "#ffd43b", 
    4: "#69db7c", 5: "#38d9a9", 6: "#4dabf7", 7: "#9775fa", 
    8: "#f783ac", 9: "#ff922b"
  };
  
  if (!weeksData || weeksData.length === 0) {
    return '<div class="table-wrapper"><div class="table-header" style="background:#334155;"><span>No Pick 4 data available</span></div></div>';
  }
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  // Get current week and previous week
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : null;
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const now = new Date();
  const todayIdx = now.getDay();
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? val.toString() : null;
  }
  
  // ====================================
  // GET CURRENT WEEK DRAWS
  // =====================================
  function getCurrentWeekDraws() {
    const draws = [];
    if (!currentWeek) return draws;
    for (let d = 0; d <= todayIdx; d++) {
      for (const slot of slots) {
        const draw = getDraw(currentWeek, dayNames[d], slot);
        if (draw) {
          const digits = draw.replace(/\D/g, '').split('').map(Number);
          draws.push({ draw: draw, digits: digits, day: dayNames[d], slot: slot });
        }
      }
    }
    return draws;
  }
  
  // ===================================
  // GET PREVIOUS WEEK DRAWS (same days as current week)
  // ===================================
  function getPreviousWeekDraws() {
    const draws = [];
    if (!previousWeek) return draws;
    for (let d = 0; d <= todayIdx; d++) {
      for (const slot of slots) {
        const draw = getDraw(previousWeek, dayNames[d], slot);
        if (draw) {
          const digits = draw.replace(/\D/g, '').split('').map(Number);
          draws.push({ draw: draw, digits: digits, day: dayNames[d], slot: slot });
        }
      }
    }
    return draws;
  }
  
  const currentWeekDraws = getCurrentWeekDraws();
  const previousWeekDraws = getPreviousWeekDraws();
  
  // ===================================
  // BUILD TIMELINE WITH ALL DRAWS
  // ===================================
  const timeline = [];
  for (const week of sortedWeeks) {
    const weekStart = new Date(week.startDate);
    for (let d = 0; d < dayNames.length; d++) {
      const drawDate = new Date(weekStart);
      drawDate.setDate(weekStart.getDate() + d);
      for (const slot of slots) {
        const draw = getDraw(week, dayNames[d], slot);
        if (draw) {
          const digits = draw.replace(/\D/g, '').split('').map(Number);
          for (const digit of digits) {
            if (!isNaN(digit) && digit >= 0 && digit <= 9) {
              timeline.push({
                digit: digit,
                date: drawDate,
                day: dayNames[d],
                slot: slot,
                timestamp: drawDate.getTime(),
                draw: draw,
                week: week
              });
            }
          }
        }
      }
    }
  }
  
  timeline.sort((a, b) => a.timestamp - b.timestamp);
  
  if (timeline.length === 0) {
    return '<div class="table-wrapper"><div class="table-header" style="background:#334155;"><span>No Pick 4 digit data available</span></div></div>';
  }
  
  // =====================================
  // CALCULATE DIGIT FREQUENCY
  // =====================================
  const digitFrequency = {};
  const currentWeekFrequency = {};
  const previousWeekFrequency = {};
  for (let i = 0; i <= 9; i++) {
    digitFrequency[i] = 0;
    currentWeekFrequency[i] = 0;
    previousWeekFrequency[i] = 0;
  }
  
  timeline.forEach(entry => {
    digitFrequency[entry.digit] = (digitFrequency[entry.digit] || 0) + 1;
  });
  
  currentWeekDraws.forEach(draw => {
    draw.digits.forEach(digit => {
      currentWeekFrequency[digit] = (currentWeekFrequency[digit] || 0) + 1;
    });
  });
  
  previousWeekDraws.forEach(draw => {
    draw.digits.forEach(digit => {
      previousWeekFrequency[digit] = (previousWeekFrequency[digit] || 0) + 1;
    });
  });
  
  // ====================================
  // CALCULATE DAYS SINCE LAST APPEARANCE
  // ====================================
  const today = new Date();
  const daysSinceLast = {};
  for (let i = 0; i <= 9; i++) {
    const lastEntry = [...timeline].reverse().find(e => e.digit === i);
    if (lastEntry) {
      const daysDiff = Math.floor((today - lastEntry.date) / (1000 * 60 * 60 * 24));
      daysSinceLast[i] = daysDiff;
    } else {
      daysSinceLast[i] = 99;
    }
  }
  
  // =====================================
  // CALCULATE AVERAGE GAP WITH RECENT WEIGHTING
  // ====================================
  const avgGap = {};
  for (let i = 0; i <= 9; i++) {
    const entries = timeline.filter(e => e.digit === i);
    if (entries.length < 2) {
      avgGap[i] = 14;
    } else {
      // Weight recent gaps more heavily (last 10 appearances)
      const recentEntries = entries.slice(-10);
      let totalGap = 0;
      let weightTotal = 0;
      for (let j = 1; j < recentEntries.length; j++) {
        const gap = Math.floor((recentEntries[j].date - recentEntries[j-1].date) / (1000 * 60 * 60 * 24));
        const weight = 1 + (j / recentEntries.length); // Recent gaps get higher weight
        totalGap += gap * weight;
        weightTotal += weight;
      }
      avgGap[i] = Math.round(totalGap / weightTotal);
    }
  }
  
  // ======================================
  // ENHANCED CONFIDENCE SCORE - WITH CURRENT & PREVIOUS WEEK FACTORS
  // ====================================
  const confidence = {};
  const trend = {};
  const trendArrow = {};
  
  for (let i = 0; i <= 9; i++) {
    const days = daysSinceLast[i];
    const avg = avgGap[i];
    const currentWk = currentWeekFrequency[i] || 0;
    const prevWk = previousWeekFrequency[i] || 0;
    const total = digitFrequency[i] || 1;
    
    // Base confidence from historical pattern
    let baseConf = 0;
    if (days === 0) {
      baseConf = 0;
    } else if (avg === 0) {
      baseConf = 50;
    } else {
      const ratio = days / avg;
      if (ratio >= 2) baseConf = Math.min(100, Math.round(ratio * 50));
      else if (ratio >= 1.5) baseConf = Math.min(95, Math.round(70 + (ratio - 1.5) * 50));
      else if (ratio >= 1) baseConf = Math.min(85, Math.round(50 + (ratio - 1) * 40));
      else baseConf = Math.min(49, Math.round(ratio * 50));
    }
    
    // Current week boost: if digit played this week, confidence drops (recently played)
    // If digit hasn't played this week but did last week, confidence rises
    let weekBoost = 0;
    let trendLabel = 'STABLE';
    let arrow = '➡️';
    
    if (currentWk > 0) {
      // Played this week - lower confidence (might not repeat)
      weekBoost = -Math.min(20, currentWk * 5);
      trendLabel = 'RECENT';
      arrow = '🔽';
    } else if (prevWk > 0) {
      // Played last week but not this week - could be due
      weekBoost = Math.min(25, prevWk * 8);
      trendLabel = 'DUE';
      arrow = '🔼';
    } else {
      // Not played in either week - watch
      weekBoost = 10;
      trendLabel = 'WATCH';
      arrow = '⏳';
    }
    
    // Frequency boost: if digit is historically frequent, add small boost
    const freqRatio = total / (timeline.length / 10);
    const freqBoost = Math.min(10, Math.round((freqRatio - 0.5) * 20));
    
    // Calculate final confidence
    let finalConf = baseConf + weekBoost + freqBoost;
    finalConf = Math.max(0, Math.min(100, finalConf));
    confidence[i] = finalConf;
    
    // Determine status
    let statusLabel = 'RECENT';
    let statusColor = '#32d74b';
    
    if (currentWk > 0) {
      statusLabel = 'RECENT';
      statusColor = '#32d74b';
    } else if (days > avg * 1.5 && prevWk > 0) {
      statusLabel = '🔥 DUE NOW';
      statusColor = '#ff453a';
    } else if (days > avg * 1.2) {
      statusLabel = 'HEATING UP';
      statusColor = '#ff9f0a';
    } else if (days > avg * 0.8 && prevWk > 0) {
      statusLabel = '👀 WATCHING';
      statusColor = '#ffd60a';
    } else if (days > avg * 0.5) {
      statusLabel = '📊 MONITORING';
      statusColor = '#58a6ff';
    } else {
      statusLabel = '✅ RECENT';
      statusColor = '#32d74b';
    }
    
    // Add arrow indicator
    if (currentWk > 0 && prevWk > 0 && currentWk > prevWk) {
      trendLabel = '↑ HOT';
      arrow = '🔥';
    } else if (currentWk > 0 && prevWk > 0 && currentWk < prevWk) {
      trendLabel = '↓ COOL';
      arrow = '❄️';
    } else if (currentWk > 0 && prevWk === 0) {
      trendLabel = '↗ NEW';
      arrow = '🆕';
    } else if (currentWk === 0 && prevWk > 0) {
      trendLabel = '↘ DUE';
      arrow = '⏰';
    }
    
    trend[i] = trendLabel;
    trendArrow[i] = arrow;
  }
  
  // ====================================
  // HISTORICAL CYCLE COMPLETION RECORDS
  // ====================================
  function getHistoricalDigitCycles() {
    const cycles = [];
    let cycleDigits = new Set();
    let cycleDrawsList = [];
    let cycleEntries = [];
    
    for (let i = 0; i < timeline.length; i++) {
      cycleDigits.add(timeline[i].digit);
      cycleDrawsList.push(timeline[i]);
      if (!cycleEntries.find(e => e.draw === timeline[i].draw && e.date === timeline[i].date)) {
        cycleEntries.push(timeline[i]);
      }
      
      if (cycleDigits.size === 10) {
        const completionDate = timeline[i].date;
        const lastDigit = timeline[i].digit;
        const lastDraw = timeline[i].draw;
        const totalHits = cycleDrawsList.length;
        
        cycles.push({
          completionDate: completionDate,
          lastDigit: lastDigit,
          lastDraw: lastDraw,
          totalDraws: totalHits
        });
        
        cycleDigits = new Set();
        cycleDrawsList = [];
        cycleEntries = [];
      }
    }
    
    return cycles.slice(-5);
  }
  
  const historicalCycles = getHistoricalDigitCycles();
  
  // ====================================
  // BUILD THE ROWS
  // ====================================
  let rowsHtml = '';
  
  // Sort digits by confidence (highest first)
  const sortedDigits = [0,1,2,3,4,5,6,7,8,9].sort((a, b) => confidence[b] - confidence[a]);
  
  for (const i of sortedDigits) {
    const freq = digitFrequency[i] || 0;
    const days = daysSinceLast[i] || 0;
    const conf = confidence[i] || 0;
    const avg = avgGap[i] || 0;
    const currentWk = currentWeekFrequency[i] || 0;
    const prevWk = previousWeekFrequency[i] || 0;
    const trendLabel = trend[i] || 'STABLE';
    const arrow = trendArrow[i] || '➡️';
    
    // Determine status
    let statusLabel = 'RECENT';
    let statusColor = '#32d74b';
    if (days > avg * 1.5 && prevWk > 0) { statusLabel = '🔥 DUE NOW'; statusColor = '#ff453a'; }
    else if (days > avg * 1.2) { statusLabel = 'HEATING UP'; statusColor = '#ff9f0a'; }
    else if (days > avg * 0.8 && prevWk > 0) { statusLabel = '👀 WATCHING'; statusColor = '#ffd60a'; }
    else if (days > avg * 0.5) { statusLabel = '📊 MONITORING'; statusColor = '#58a6ff'; }
    else { statusLabel = '✅ RECENT'; statusColor = '#32d74b'; }
    
    // Create a progress bar for confidence
    const barWidth = Math.min(conf, 100);
    
    // Show current week vs previous week play count
    const wkDisplay = currentWk > 0 || prevWk > 0 ? 
      `<span style="color: #32d74b;">${currentWk}x</span>${prevWk > 0 ? ` / <span style="color: #64748b;">${prevWk}x</span>` : ''}` : 
      `<span style="color: #64748b;">—</span>`;
    
    rowsHtml += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td class="ls-label" style="font-weight: 700; font-size: 16px; text-align: center; background: rgba(0,0,0,0.2);">
          <span style="background: ${numberColors[i] || '#ffffff'}; color: #000; padding: 2px 8px; border-radius: 4px;">${i}</span>
        </td>
        <td style="text-align: center; font-weight: 700; color: #ffd700;">${freq}</td>
        <td style="text-align: center; font-weight: 700; color: ${days > 14 ? '#ff453a' : '#ffd700'};">${days}d</td>
        <td style="text-align: center; font-weight: 700; color: ${statusColor}; font-size: 11px;">${statusLabel}</td>
        <td style="text-align: center; font-weight: 700; color: #58a6ff; font-size: 11px;">${avg}d</td>
        <td style="text-align: center; font-weight: 700; color: #94a3b8; font-size: 11px;">${wkDisplay}</td>
        <td style="text-align: center; font-weight: 700; color: #ff9d00; font-size: 11px;">${arrow} ${trendLabel}</td>
        <td style="text-align: center; width: 80px;">
          <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 6px; width: 100%; overflow: hidden;">
            <div style="background: ${statusColor}; height: 100%; width: ${barWidth}%; border-radius: 4px; transition: width 0.3s;"></div>
          </div>
          <span style="font-size: 9px; color: #94a3b8;">${conf}%</span>
        </td>
      </tr>
    `;
  }
  
  // =================================
  // BUILD THE HISTORICAL CYCLES HTML
  // =================================
  let historyHtml = '';
  if (historicalCycles.length > 0) {
    let extractedCycle = currentCycleNumber;
    if (!extractedCycle || extractedCycle <= 0) {
      const cycleMatch = title.match(/Cycle\s*(\d+)/i);
      if (cycleMatch && cycleMatch[1]) {
        extractedCycle = parseInt(cycleMatch[1], 10);
      }
    }
    if (!extractedCycle || extractedCycle <= 0) {
      extractedCycle = historicalCycles.length + 1;
    }
    
    const currentCycle = extractedCycle;
    
    const cycleRows = historicalCycles.map((cycle, index) => {
      const positionFromEnd = historicalCycles.length - 1 - index;
      const cycleNumber = currentCycle - 1 - positionFromEnd;
      
      const formatDate = (date) => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };
      
      const completionDateFormatted = formatDate(cycle.completionDate);
      const totalHits = cycle.totalDraws || 0;
      
      const coloredDraw = cycle.lastDraw.split('').map(d => {
        const digit = parseInt(d, 10);
        const color = numberColors[digit] || '#ffffff';
        return `<span style="background: ${color}; color: #000; padding: 2px 4px; border-radius: 3px; margin: 0 1px; font-weight: 700;">${d}</span>`;
      }).join('');
      
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #ff9d00;">${cycleNumber}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #ffd700;">${totalHits}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #fff;">
            <span style="background: ${numberColors[cycle.lastDigit] || '#ffffff'}; color: #000; padding: 2px 8px; border-radius: 4px;">${cycle.lastDigit}</span>
          </td>
          <td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #fff; font-family: monospace; font-size: 14px;">${coloredDraw}</td>
          <td style="padding: 6px 8px; text-align: center; color: #94a3b8; font-size: 10px;">${completionDateFormatted}</td>
        </tr>
      `;
    }).join('');
    
    historyHtml = `
      <div style="margin-top: 15px; border-top: 2px solid rgba(255,157,0,0.2); padding-top: 12px;">
        <div style="font-size: 11px; font-weight: 800; color: #ff9d00; margin-bottom: 8px; text-align: center; letter-spacing: 0.5px;">
          📜 LAST ${historicalCycles.length} DIGIT CYCLES COMPLETED
        </div>
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.05);">
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">CYCLE</th>
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">HITS</th>
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">LAST DIGIT</th>
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">DRAW</th>
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">DATE</th>
              </tr>
            </thead>
            <tbody>
              ${cycleRows}
            </tbody>
          </table>
        </div>
        <div style="font-size: 7px; color: #64748b; text-align: center; margin-top: 4px;">
          Last 5 completed digit cycles • All 10 digits (0-9) appeared
        </div>
      </div>
    `;
  }
  
  // Calculate total draws
  const totalDraws = timeline.length;
  
  return `
    <div class="table-wrapper">
      <div class="table-header" style="background:#334155;">
        <span>${title}</span>
      </div>
      
      <table class="ls-table">
        <thead>
          <tr class="ls-header-row">
            <td style="width:8%; color:#888; font-size:9px; text-align:center;">DIGIT</td>
            <td style="width:8%; color:#888; font-size:9px; text-align:center;">HITS</td>
            <td style="width:9%; color:#888; font-size:9px; text-align:center;">DAYS</td>
            <td style="width:13%; color:#888; font-size:9px; text-align:center;">STATUS</td>
            <td style="width:8%; color:#888; font-size:9px; text-align:center;">AVG</td>
            <td style="width:12%; color:#888; font-size:9px; text-align:center;">WEEK</td>
            <td style="width:12%; color:#888; font-size:9px; text-align:center;">TREND</td>
            <td style="width:30%; color:#888; font-size:9px; text-align:center;">CONFIDENCE</td>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="td-row" style="background: rgba(255,255,255,0.05);">
            <td colspan="3" style="font-size:10px; color: #aaa;">TOTAL DRAW</td>
            <td colspan="5" style="text-align:right; padding-right:8px; font-size:14px; color: #00f2ff; font-weight:900;">
              n = ${totalDraws}
            </td>
          </tr>
          <tr style="background: #0f172a;">
            <td colspan="8" style="padding: 6px 4px;">
              <div style="display:flex; justify-content: space-around; align-items: center; gap: 2px; flex-wrap: wrap;">
                ${["7plus", "6", "5", "4", "3", "2", "1", "0"].map(c => `
                  <div style="display:flex; align-items:center; gap:3px;">
                    <div class="hit-${c}" style="width:8px; height:8px; border-radius:1px;"></div>
                    <span style="font-size:8px; color:#aaa;">${c === '7plus' ? '7x+' : c + 'x'}</span>
                  </div>
                `).join("")}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      ${historyHtml}
    </div>
  `;
}
/////END IF PICK 4 SUITS TRACKING//////////

// =========================================
// PLAYWHE SHELF MARKS RENDERER
// =========================================
function renderPlayWheShelfContainer(marks, numberColors, intervals) {
    if (!marks || marks.length === 0) {
        return '<div style="text-align:center; padding:40px; color:#666;">No mark data available</div>';
    }

    // Sort marks by days (most overdue first)
    const sortedMarks = [...marks].sort((a, b) => b.days - a.days);

    let html = `
    <style>
        .shelf-container {
            padding: 10px 5px;
            max-width: 100%;
            margin: 0 auto;
        }
        .shelf-card {
            background: var(--card);
            border-radius: 14px;
            padding: 12px;
            margin-bottom: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.2s ease;
        }
        .shelf-card:active {
            transform: scale(0.98);
        }
        .shelf-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .shelf-ball {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 900;
            color: #000;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .shelf-spirit {
            font-weight: 900;
            font-size: 17px;
            color: var(--text-main);
            margin-left: 12px;
        }
        .shelf-status {
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .shelf-confidence {
            font-size: 16px;
            font-weight: 900;
            color: var(--text-main);
        }
        .shelf-confidence-label {
            font-size: 9px;
            color: var(--text-dim);
        }
        .shelf-bar {
            width: 100%;
            height: 5px;
            background: #333;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 12px;
        }
        .shelf-bar-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 0.6s ease;
        }
        .shelf-stats {
            display: flex;
            justify-content: space-around;
            background: rgba(255,255,255,0.04);
            padding: 6px;
            border-radius: 8px;
            border: 0.5px solid rgba(255,255,255,0.05);
            text-align: center;
        }
        .shelf-stat-label {
            font-size: 8px;
            color: var(--text-dim);
        }
        .shelf-stat-value {
            font-size: 11px;
            font-weight: bold;
        }
        .shelf-stat-value.hits { color: #32d74b; }
        
        /* Scrollable container */
        .shelf-scroll {
            max-height: 60vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding-right: 4px;
        }
        .shelf-scroll::-webkit-scrollbar {
            width: 4px;
        }
        .shelf-scroll::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        .shelf-scroll::-webkit-scrollbar-thumb {
            background: #ff9d00;
            border-radius: 10px;
        }
        
        .shelf-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 0 4px;
        }
        .shelf-title-left {
            font-weight: 900;
            font-size: 18px;
            color: var(--text-main);
        }
        .shelf-title-right {
            font-size: 11px;
            color: var(--text-dim);
        }
        
        /* Light mode overrides */
        body.light-mode .shelf-card {
            border: 1px solid #ddd;
            background: #fff;
        }
        body.light-mode .shelf-title-left { color: #000; }
        body.light-mode .shelf-spirit { color: #000; }
        body.light-mode .shelf-confidence { color: #000; }
        body.light-mode .shelf-stat-value { color: #000; }
        body.light-mode .shelf-stats { border-color: #ddd; }
        body.light-mode .shelf-scroll::-webkit-scrollbar-track { background: #f0f0f0; }
    </style>
    
    <div class="shelf-container">
        <div class="shelf-title">
            <span class="shelf-title-left">📊 SHELF MARKS</span>
            <span class="shelf-title-right">${sortedMarks.length} marks • ${sortedMarks.filter(m => m.days > (intervals[m.num] || 12)).length} due</span>
        </div>
        <div class="shelf-scroll">
    `;

    sortedMarks.forEach(m => {
        // Get dynamic interval
        let avg = intervals[m.num] || 12;
        
        // Calculate Confidence
        let confidence = Math.min(Math.round((m.days / avg) * 100), 100);
        
        // Determine Urgency
        let accentColor = '#32d74b';
        let statusLabel = 'MONITORING';
        
        if (m.days > avg) {
            accentColor = '#ff453a';
            statusLabel = '🔥 DUE NOW';
        } else if (m.days > (avg * 0.75)) {
            accentColor = '#ff9f0a';
            statusLabel = '♨️ WARM';
        }
        
        // Get color for the number ball
        const numStr = String(m.num).padStart(2, '0');
        const ballColor = numberColors[numStr] || '#ffffff';
        
        html += `
            <div class="shelf-card" style="border-left: 5px solid ${accentColor};">
                <div class="shelf-header">
                    <div style="display:flex; align-items:center;">
                        <div class="shelf-ball" style="background:${ballColor};">${m.num}</div>
                        <div>
                            <div class="shelf-spirit">${m.spirit || 'Unknown'}</div>
                            <div class="shelf-status" style="color:${accentColor};">${statusLabel}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div class="shelf-confidence-label">CONFIDENCE</div>
                        <div class="shelf-confidence">${confidence}%</div>
                    </div>
                </div>
                
                <div class="shelf-bar">
                    <div class="shelf-bar-fill" style="width:${confidence}%; background:${accentColor}; box-shadow: 0 0 10px ${accentColor}66;"></div>
                </div>
                
                <div class="shelf-stats">
                    <div>
                        <div class="shelf-stat-label">HITS</div>
                        <div class="shelf-stat-value hits">${m.frequency || 0}x</div>
                    </div>
                    <div>
                        <div class="shelf-stat-label">AVG GAP</div>
                        <div class="shelf-stat-value" style="color:var(--text-main);">${avg}d</div>
                    </div>
                    <div>
                        <div class="shelf-stat-label">SINCE</div>
                        <div class="shelf-stat-value" style="color:${accentColor};">${m.days}d</div>
                    </div>
                    <div>
                        <div class="shelf-stat-label">LAST</div>
                        <div class="shelf-stat-value" style="color:var(--text-dim); font-size:9px;">${m.date || 'N/A'}</div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div style="text-align:center; padding:15px 0 5px; color:#555; font-size:10px; font-weight:bold; border-top:1px solid rgba(255,255,255,0.05); margin-top:10px;">
            CODEWITHGLASGOW ©️ SHELF ANALYSIS • ${new Date().toLocaleDateString()}
        </div>
    </div>
    `;

    return html;
}


// ============MAIN WEBVIEW LOGIC=========
//////////////////////////////////////////
async function presentComparisonDashboard() {
  const [pwData, p2Data, p4Data] = await Promise.all([
    new Request(BASE_API + "&game=P2WHE").loadJSON(),
    new Request(BASE_API + "&game=PIKII").loadJSON(),
    new Request(BASE_API + "&game=PIKIV").loadJSON()
  ]);
  
globalTrackingCode = generateTrackingCode();
globalLastDraw = getLastDrawTime(pwData.data.weeks);

  // 1. Process Timeline
  pwData.data.weeks.forEach(wk => wk.days.forEach(day => timeOrder.forEach(t => {
    let val = String(day.draws[t]);
    let m = val.match(/^(\d+)/); 
    if(m && val !== "PENDING" && val !== "-") {
        pwTimeline.push({ n: parseInt(m[1]), date: wk.startDate });
    }
  })));

// 2. Active Cycle – Full Coverage Logic (accurate)
let filteredPW = [];
let dynamicStartHeader = "";
let cycleNumbers = new Set();
let cycleStartIndex = 0;

// Loop through timeline from oldest to newest
for (let i = 0; i < pwTimeline.length; i++) {
  cycleNumbers.add(pwTimeline[i].n);
  
  if (cycleNumbers.size === 36) {
    // Full coverage achieved, start new cycle after this draw
    cycleStartIndex = i + 1;
    cycleNumbers.clear();
  }
}

// Only keep draws from current cycle
filteredPW = pwTimeline.slice(cycleStartIndex);
dynamicStartHeader = filteredPW[0]?.date || "";

// Cycle number = how many cycles completed + 1
let pwCycleNum = Math.floor(cycleStartIndex / 36) + 1;

// Optional: track progress
let cycleProgress = filteredPW.length + "/" + 36; // e.g., "12/36 remaining until cycle complete"

  // 3. Frequency & Gaps
  let lsPwTotalHits = {};
  filteredPW.forEach(x => lsPwTotalHits[x.n] = (lsPwTotalHits[x.n] || 0) + 1);

  for (let n = 1; n <= 36; n++) {
    let lastIdx = pwTimeline.map(x=>x.n).lastIndexOf(n);
    pwDrawCountSinceHit[n] = lastIdx === -1 ? pwTimeline.length : (pwTimeline.length - 1) - lastIdx;
  }

  const lines = { 1:[1,10,19,28], 2:[2,11,20,29], 3:[3,12,21,30], 4:[4,13,22,31], 5:[5,14,23,32], 6:[6,15,24,33], 7:[7,16,25,34], 8:[8,17,26,35], 9:[9,18,27,36] };
  const suites = { 1:[1,11,21,31], 2:[2,12,22,32], 3:[3,13,23,33], 4:[4,14,24,34], 5:[5,15,25,35], 6:[6,16,26,36], 7:[7,17,27], 8:[8,18,28], 9:[9,19,29], 0:[10,20,30] };
  
  let lineStats = {}, suiteStats = {};
  Object.keys(lines).forEach(l => lineStats[l] = lines[l].reduce((sum, num) => sum + (lsPwTotalHits[num] || 0), 0));
  Object.keys(suites).forEach(s => suiteStats[s] = suites[s].reduce((sum, num) => sum + (lsPwTotalHits[num] || 0), 0));

  let nowStr = new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
  
  // ==========================
// PICK 2 PROCESSING
// ==========================

let p2Timeline = [];
let p2TotalHits = {};
let p2DrawCountSinceHit = {};

// 1. Build Timeline (split comma pairs)
p2Data.data.weeks.forEach(wk => 
  wk.days.forEach(day => 
    timeOrder.forEach(t => {
      let raw = String(day.draws[t]);
      if(raw && raw !== "PENDING" && raw !== "-") {
        let parts = raw.split(",").map(x => parseInt(x.trim(),10));
        parts.forEach(num => {
          if(!isNaN(num)) {
            p2Timeline.push({ n: num, date: wk.startDate });
          }
        });
      }
    })
  )
);

// 2. Active Cycle – Full Coverage Logic (Pick 2)
let filteredP2 = [];
let p2StartHeader = "";
let cycleP2Numbers = new Set();
let p2CycleStartIndex = 0;

for (let i = 0; i < p2Timeline.length; i++) {
  cycleP2Numbers.add(p2Timeline[i].n);

  if (cycleP2Numbers.size === 36) {
    p2CycleStartIndex = i + 1;
    cycleP2Numbers.clear();
  }
}

filteredP2 = p2Timeline.slice(p2CycleStartIndex);
p2StartHeader = filteredP2[0]?.date || "";
let p2CycleNum = Math.floor(p2CycleStartIndex / 36) + 1;

// 3. Frequency
filteredP2.forEach(x => 
  p2TotalHits[x.n] = (p2TotalHits[x.n] || 0) + 1
);

// 4. Gaps
for (let n = 1; n <= 36; n++) {
  let lastIdx = p2Timeline.map(x=>x.n).lastIndexOf(n);
  p2DrawCountSinceHit[n] = lastIdx === -1 ? p2Timeline.length : (p2Timeline.length - 1) - lastIdx;
}

// 5. Line + Suite Stats
let p2LineStats = {};
let p2SuiteStats = {};

Object.keys(lines).forEach(l => 
  p2LineStats[l] = lines[l].reduce((sum, num) => sum + (p2TotalHits[num] || 0), 0)
);

Object.keys(suites).forEach(s => 
  p2SuiteStats[s] = suites[s].reduce((sum, num) => sum + (p2TotalHits[num] || 0), 0)
);

    // Get all weeks for carousel
  const allWeeksPW = pwData.data.weeks.filter(wk => {
    const wkDate = new Date(wk.startDate);
    const today = new Date();
    return wkDate <= today || wk.isCurrentWeek;
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  const allWeeksP2 = p2Data.data.weeks.filter(wk => {
    const wkDate = new Date(wk.startDate);
    const today = new Date();
    return wkDate <= today || wk.isCurrentWeek;
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  const allWeeksP4 = p4Data.data.weeks.filter(wk => {
    const wkDate = new Date(wk.startDate);
    const today = new Date();
    return wkDate <= today || wk.isCurrentWeek;
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));


// ==========================
// PICK 4 PROCESSING (Add this section)
// ==========================

let p4Timeline = [];
let p4TotalHits = {};
let p4DrawCountSinceHit = {};

// 1. Build Timeline (split comma pairs)
p4Data.data.weeks.forEach(wk => 
  wk.days.forEach(day => 
    timeOrder.forEach(t => {
      let raw = String(day.draws[t]);
      if(raw && raw !== "PENDING" && raw !== "-") {
        // Pick 4 draws are typically 8 digits (4 pairs)
        // Extract each number individually
        let clean = raw.replace(/\s/g, '');
        if(clean.length >= 2) {
          // Split into pairs of 2 digits
          let pairs = clean.match(/.{2}/g);
          if(pairs) {
            pairs.forEach(pair => {
              let num = parseInt(pair, 10);
              if(!isNaN(num) && num >= 1 && num <= 36) {
                p4Timeline.push({ n: num, date: wk.startDate });
              }
            });
          }
        }
      }
    })
  )
);

// 2. Active Cycle – Full Coverage Logic (Pick 4)
let filteredP4 = [];
let p4StartHeader = "";
let cycleP4Numbers = new Set();
let p4CycleStartIndex = 0;

for (let i = 0; i < p4Timeline.length; i++) {
  cycleP4Numbers.add(p4Timeline[i].n);

  if (cycleP4Numbers.size === 36) {
    p4CycleStartIndex = i + 1;
    cycleP4Numbers.clear();
  }
}

filteredP4 = p4Timeline.slice(p4CycleStartIndex);
p4StartHeader = filteredP4[0]?.date || "";
let p4CycleNum = Math.floor(p4CycleStartIndex / 36) + 1;

// 3. Frequency
filteredP4.forEach(x => 
  p4TotalHits[x.n] = (p4TotalHits[x.n] || 0) + 1
);

// 4. Gaps
for (let n = 1; n <= 36; n++) {
  let lastIdx = p4Timeline.map(x=>x.n).lastIndexOf(n);
  p4DrawCountSinceHit[n] = lastIdx === -1 ? p4Timeline.length : (p4Timeline.length - 1) - lastIdx;
}

// 5. Line + Suite Stats
const p4Lines = { 
  1:[1,10,19,28], 2:[2,11,20,29], 3:[3,12,21,30], 
  4:[4,13,22,31], 5:[5,14,23,32], 6:[6,15,24,33], 
  7:[7,16,25,34], 8:[8,17,26,35], 9:[9,18,27,36] 
};

const p4Suites = { 
  1:[1,11,21,31], 2:[2,12,22,32], 3:[3,13,23,33], 
  4:[4,14,24,34], 5:[5,15,25,35], 6:[6,16,26,36], 
  7:[7,17,27], 8:[8,18,28], 9:[9,19,29], 0:[10,20,30] 
};

let p4LineStats = {};
let p4SuiteStats = {};

Object.keys(p4Lines).forEach(l => 
  p4LineStats[l] = p4Lines[l].reduce((sum, num) => sum + (p4TotalHits[num] || 0), 0)
);

Object.keys(p4Suites).forEach(s => 
  p4SuiteStats[s] = p4Suites[s].reduce((sum, num) => sum + (p4TotalHits[num] || 0), 0)
);

// =========================================
// PLAYWHE SHELF MARKS PROCESSING
// Extracted from WhePlay Shelf Analysis
// =========================================
function processShelfData(weeksData) {
    if (!weeksData || weeksData.length === 0) {
        return { marks: [], intervals: {}, numberColors: {}, markInfo: {} };
    }

    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeOrder = ["MOR", "MID", "NON", "EVE"];
    const timeNames = { MOR: "Morning", MID: "Midday", NON: "Afternoon", EVE: "Evening" };
    
    // Number colors
    const numberColors = {
        "01":"#ff6b6b","02":"#ffa94d","03":"#ffd43b","04":"#69db7c","05":"#38d9a9",
        "06":"#4dabf7","07":"#9775fa","08":"#f783ac","09":"#ff922b","10":"#fab005",
        "11":"#82c91e","12":"#20c997","13":"#339af0","14":"#845ef7","15":"#e599f7",
        "16":"#ff8787","17":"#ffc078","18":"#ffe066","19":"#8ce99a","20":"#63e6be",
        "21":"#74c0fc","22":"#b197fc","23":"#faa2c1","24":"#ffa8a8","25":"#ffec99",
        "26":"#c0eb75","27":"#96f2d7","28":"#a5d8ff","29":"#d0bfff","30":"#fcc2d7",
        "31":"#ff6b6b","32":"#ffa94d","33":"#ffd43b","34":"#69db7c","35":"#4dabf7",
        "36":"#9775fa"
    };

    // Spirit names
    const spirits = {
        1:"Centipede",2:"Old Lady",3:"Carriage",4:"Dead Man",5:"Parson Man",
        6:"Belly",7:"Hog",8:"Tiger",9:"Cattle",10:"Monkey",
        11:"Corbeau",12:"King",13:"Crapaud",14:"Money",15:"Sick Woman",
        16:"Jamette",17:"Pigeon",18:"Water Boat",19:"Horse",20:"Dog",
        21:"Mouth",22:"Rat",23:"House",24:"Queen",25:"Morrocoy",
        26:"Fowl",27:"Little Snake",28:"Red Fish",29:"Opium Man",30:"House Cat",
        31:"Parson Wife",32:"Shrimp",33:"Spider",34:"Blind Man",35:"Big Snake",
        36:"Donkey"
    };

    // Default intervals
    let intervals = {};
    for (let i = 1; i <= 36; i++) {
        intervals[i] = 12;
    }

    // Track data
    let markInfo = {};
    let lastSeenTime = {};
    let timeline = [];
    let currentWeekHits = {};

    // Process each week
    for (let week of weeksData) {
        let parts = week.startDate.split(" ");
        let monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
        let baseDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));

        for (let day of week.days) {
            let dDate = new Date(baseDate);
            dDate.setDate(dDate.getDate() + dayOrder.indexOf(day.dayName));
            let ts = dDate.getTime();

            for (let t of timeOrder) {
                let val = day.draws[t];
                if (!val || val === "-" || val === "PENDING") continue;
                
                let num = parseInt(val);
                if (num < 1 || num > 36) continue;
                
                if (week.isCurrentWeek) {
                    currentWeekHits[num] = (currentWeekHits[num] || 0) + 1;
                }
                
                lastSeenTime[num] = timeNames[t] || t;
                let entry = { num, ts, dateStr: dDate.toDateString(), time: lastSeenTime[num] };
                timeline.push(entry);

                if (!markInfo[num]) {
                    markInfo[num] = { frequency: 0, lastDate: null, history: [] };
                }
                markInfo[num].frequency++;
                markInfo[num].lastDate = dDate;
                markInfo[num].history.push({ ts, date: entry.dateStr, time: entry.time });
            }
        }
    }

    // Calculate dynamic intervals
    let nowTs = Date.now();
    for (let n = 1; n <= 36; n++) {
        let info = markInfo[n];
        if (info && info.history.length > 1) {
            let gaps = [];
            let sortedH = info.history.sort((a, b) => a.ts - b.ts);
            for (let i = 0; i < sortedH.length - 1; i++) {
                gaps.push((sortedH[i+1].ts - sortedH[i].ts) / 86400000);
            }
            if (gaps.length > 0) {
                intervals[n] = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
            }
        }
    }

    // Build marks array
    let marks = [];
    for (let n = 1; n <= 36; n++) {
        let info = markInfo[n] || { frequency: 0, lastDate: null };
        let daysAgo = info.lastDate ? Math.floor((nowTs - info.lastDate.getTime()) / 86400000) : 999;
        let dateStr = info.lastDate ? info.lastDate.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' }) : "N/A";
        
        marks.push({
            num: n,
            spirit: spirits[n] || "Unknown",
            days: daysAgo,
            date: dateStr,
            avg: intervals[n] || 12,
            frequency: info.frequency,
            time: lastSeenTime[n] || "N/A",
            isHitThisWeek: !!currentWeekHits[n]
        });
    }

    return { marks, intervals, numberColors, markInfo };
}

  let html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
    
       /* ===== SPLASH SCREEN STYLES ===== */
    #splash-screen {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #020617;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: opacity 0.8s ease-out;
    }
    .stage {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      perspective: 800px;
      padding: 0 5vw;
    }
    .scene {
      width: 18vw;
      height: 18vw;
      max-width: 70px;
      max-height: 70px;
      position: relative;
    }
    .cube {
      width: 100%;
      height: 100%;
      position: absolute;
      transform-style: preserve-3d;
      transition: transform 2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    }
    .face {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #ffffff;
      border-radius: 12%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
      backface-visibility: hidden;
    }
    .face--1 { transform: rotateY(0deg) translateZ(9vw); }
    .face--2 { transform: rotateY(90deg) translateZ(9vw); }
    .face--3 { transform: rotateY(180deg) translateZ(9vw); }
    .face--4 { transform: rotateY(-90deg) translateZ(9vw); }
    .face--5 { transform: rotateX(90deg) translateZ(9vw); }
    .face--6 { transform: rotateX(-90deg) translateZ(9vw); }
    @media (min-width: 400px) {
      .face--1 { transform: rotateY(0deg) translateZ(35px); }
      .face--2 { transform: rotateY(90deg) translateZ(35px); }
      .face--3 { transform: rotateY(180deg) translateZ(35px); }
      .face--4 { transform: rotateY(-90deg) translateZ(35px); }
      .face--5 { transform: rotateX(90deg) translateZ(35px); }
      .face--6 { transform: rotateX(-90deg) translateZ(35px); }
    }
    .dot {
      width: 2.5vw;
      height: 2.5vw;
      max-width: 8px;
      max-height: 8px;
      background: #111;
      border-radius: 50%;
    }
    .dots {
      display: grid;
      gap: 1vw;
      grid-template-columns: repeat(3, 1fr);
    }
    .reveal {
      text-align: center;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.8s ease-out;
      flex: 1;
    }
    .reveal.show {
      opacity: 1;
      transform: translateY(0);
    }
    .title {
      font-size: 7vw;
      font-weight: 900;
      color: #fff;
      margin: 0;
      white-space: nowrap;
    }
    .subtitle {
      font-size: 3.5vw;
      color: #58a6ff;
      margin-top: 5px;
      white-space: nowrap;
    }
    .fade-out {
      opacity: 0 !important;
      pointer-events: none;
    }
    
      :root { --bg-start: #020617; --bg-end: #1e293b; --accent: #ff9d00; --text-main: #ffffff; --text-dim: #888888; --card: rgba(255, 255, 255, 0.05); }
  /* - STRICT BLACK & WHITE LIGHT MODE - */
body.light-mode {
  --bg-start: #ffffff;
  --bg-end: #f2f2f2;
  --text-main: #000000;
  --text-dim: #444444;
  --card: #ffffff;
  --accent: #000000; 
}

/* Updates for Table/Border visibility in light mode */
body.light-mode .table-wrapper { 
  border: 1px solid #000000; 
}
body.light-mode td { 
  border-bottom: 1px solid #dddddd; 
  color: #000000; 
}
body.light-mode .smart-box { 
  background: #ffffff; 
  border: 1px solid #000000; 
}
body.light-mode .tab.active {
  background: #000000;
  color: #ffffff;
}
  body { background: linear-gradient(180deg, var(--bg-start) 0%, var(--bg-end) 100%); color: var(--text-main); font-family: -apple-system; margin: 0; padding-bottom: 50px; }
  .nav-bar { position: sticky; top: 0; z-index: 100; background: rgba(2, 6, 23, 0.9); backdrop-filter: blur(20px); padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; gap: 4px; }
  .tab { flex: 1; padding: 5px; border: none; border-radius: 8px; background: var(--card); color: var(--text-dim); font-weight: 800; font-size: 14px; }
      .tab.active { background: var(--accent); color: #000; }
      .container { padding: 7px; display: none; }
      .container.active { display: block; }
            /* Carousel Styles */
      .carousel-container {
        margin-bottom: -10px;
        background: rgba(0,0,0,0.2);
        border-radius: 6px;
        padding: 2px 0;
      }
      .carousel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3px;
        padding: 0 3px;
      }
      .carousel-title {
        font-size: 12px;
        font-weight: bold;
        color: #94a3b8;
        letter-spacing: 1px;
      }
      .carousel-nav {
        display: flex;
        gap: 2px;
      }
      .carousel-btn {
        background: var(--card);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 3px 3px;
        color: white;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      body.light-mode .carousel-btn {
        color: #000;
        border-color: #ccc;
      }
      .carousel-btn:hover {
        background: var(--accent);
        color: black;
        border-color: var(--accent);
      }
      .carousel-btn:active {
        transform: scale(0.95);
      }
      .carousel-indicators {
        display: flex;
        justify-content: center;
        gap: 2px;
        margin-top: -10px;
        margin-bottom: -10px;
      }
      .carousel-dot {
        width: 2px;
        height: 2px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        transition: all 0.2s ease;
        cursor: pointer;
      }
      body.light-mode .carousel-dot {
        background: rgba(0,0,0,0.3);
      }
      .carousel-dot.active {
        background: var(--accent);
        width: 6px;
        border-radius: 3px;
      }
      .carousel-track {
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        display: flex;
        gap: 7px;
        padding: 2px 2px;
      }
      .carousel-track::-webkit-scrollbar {
        display: none;
      }
      .carousel-slide {
        scroll-snap-align: start;
        flex: 0 0 100%;
        min-width: 0;
      }
      
      /* Current week section */
      .current-section {
        margin-top: 4px;
        border-top: 1px solid rgba(255,157,0,0.3);
        padding-top: 4px;
      }
      .current-label {
        font-size: 14px;
        font-weight: bold;
        color: #00ff88;
        text-align: center;
        margin-bottom: 8px;
        letter-spacing: 2px;
      }
      body.light-mode .current-label {
        color: #000000;
      }
      
      .table-wrapper { 
      margin-bottom: 6px; 
      border-radius: 20px; 
      overflow: hidden; 
      border: 1px solid rgba(255,255,255,0.1); 
      background: var(--card); 
      }
      .table-header { 
      background: rgba(255,255,255,0.1); 
      padding: 6px; 
      font-size: 12px; 
      font-weight: 900; 
      color: var(--accent); 
      display: flex; 
      justify-content: space-between; 
      }
      .current-header {
        border-left: 4px solid #00ff88;
        background: rgba(0,255,136,0.1);
      }
      body.light-mode .current-header {
        border-left-color: #000;
        background: rgba(0,0,0,0.05);
      }
      table { 
      width: 100%; 
      border-collapse: collapse; 
      }
      th { 
      font-size: 11px; 
      color: var(--text-dim); 
      padding: 4px; 
      }
      td { 
      padding: 4px 4px; 
      text-align: center; 
      border-bottom: 1px solid rgba(255,255,255,0.05); 
      font-size: 12px; 
      font-weight: 800; 
      }
      .table-wrapper { margin-bottom: 9px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: var(--card); }
      .table-header { background: rgba(255,255,255,0.1); padding: 8px; font-size: 12px; font-weight: 900; color: var(--accent); display: flex; justify-content: space-between; }
      table { width: 100%; border-collapse: collapse; }
      th { font-size: 11px; color: var(--text-dim); padding: 8px; }
      td { padding: 8px 4px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 15px; font-weight: 800; }
      .ls-table td { font-size: 13px; }
      .ls-label { background: #00f2ff !important; color: #000 !important; width: 35px; }
      .ls-count { background: #ff375f33 !important; color: #ff375f !important; width: 35px; }
      .current-day { background: rgba(255, 157, 0, 0.15) !important; color: var(--accent) !important; }
      .day-label { color: var(--accent); font-size: 11px; }
      .heat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; padding: 10px; }
      .heat-cell { aspect-ratio: 1/1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
      .hit-0 { background: #fff !important; color: #000 !important; }
      .hit-1 { background: #ffd60a !important; color: #000 !important; }
      .hit-2 { background: #ff9f0a !important; color: #000 !important; }
      .hit-3 { background: #ff375f !important; color: #fff !important; }
      .hit-4 { background: #5856d6 !important; color: #fff !important; }
      .hit-5 { background: #007aff !important; color: #fff !important; }
      .hit-6 { background: #32d74b !important; color: #000 !important; }
      .hit-7plus { background: #bf5af2 !important; color: #fff !important; }
      .branding { background: #ff9d00; color: #000; text-align: center; padding: 5px; font-weight: 900; margin-top: 10px;}
    </style>
    </head>
    <body>
        <!-- SPLASH SCREEN -->
    <div id="splash-screen">
      <div class="stage">
        <div class="scene"><div class="cube" id="cube1"></div></div>
        <div class="reveal" id="revealText">
         <h1 class="title">CWG</h1>
   <h1 class="title">CHARTS & ANALYSIS</h1>
          <h1 class="title">DASHBOARD</h1>
          <p class="subtitle">CODEWITHGLASGOW</p>
        </div>
        <div class="scene"><div class="cube" id="cube2"></div></div>
      </div>
    </div>

  <!-- YOUR EXISTING DASHBOARD CONTENT -->
    <div id="main-content" style="display:none; opacity:0; transition: opacity 0.5s ease;">
    <div class="nav-bar">
      <button class="tab active" onclick="switchTab('pw', this)">DashBoard View: Charts & Metrics Analysis</button>

        <button id="theme-btn" onclick="toggleTheme()" style="background: var(--accent); border: none; border-radius: 8px; padding: 8px 12px; margin-left: 10px; font-weight: bold; cursor: pointer;">🌓</button>
    </div>
  <br>
  ${renderDrawPreview(pwData.data.weeks)}
  <div id="pw-tab" class="container active">

      <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
      <span>PLAY WHE</span>
      <span>DAY TO DAY CHART</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
  ${buildTable(pwData.data.weeks.slice(-2), "P2WHE")}
  <br>
    <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
  <span>HISTORICAL DAY TO DAY VIEW</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
  ${renderCarouselWithCurrentPW(allWeeksPW, "pw")}
  <br>
        <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
      <span>PLAY WHE</span>
      <span>DAY TO DAY LINE CHART</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
  ${buildLineTable(pwData.data.weeks.slice(-2))}
  <br>
    <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
  <span>PLAY WHE LINE CHART HEAT MAP</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
${renderLSChart(
  `LINES (${dynamicStartHeader} — PRESENT) • Cycle ${pwCycleNum} • ${filteredPW.length}/36`,
  "L", lines, lineStats, lsPwTotalHits, filteredPW.length, pwData.data.weeks, "PLAY_WHE"
)}
  <br>
    <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
  <span>PLAY WHE SUITS CHART HEAT MAP</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
${renderLSChart(
  `SUITES (${dynamicStartHeader} — PRESENT) • Cycle ${pwCycleNum} • ${filteredPW.length}/36`,
  "S", suites, suiteStats, lsPwTotalHits, filteredPW.length, pwData.data.weeks, "PLAY_WHE"
)}
  <br>
  ${renderChartPlayMapping(pwData.data.weeks)}
  <br>
  ${renderPlayWheChartMapping(pwData.data.weeks)}
  <br>
  <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
      <span>PLAY WHE STATS UPDATE</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
  ${generatePlayWheReadout(pwData.data.weeks)}
  <br>
  ${renderHotAndOverdue(pwData.data.weeks)}
  <br>
    <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
  <span>LINES & SUITES MISSING STATS</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
  ${renderIntelligentAnalysis(pwData.data.weeks)}
  <br>
      <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
  <span>LINES & SUITES MISSING STATS</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
  ${renderLastWeekMissing(pwData.data.weeks)}
  <br>
  <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
      <span>CALENDAR DAILY CHART PLAY</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
  ${renderCalendarMonthDisplay(pwData.data.weeks)}
  <br>
  ${renderOneSixteenAnalysis(pwData.data.weeks)}
  <br>
    <!-- SHELF MARKS CONTAINER -->
  ${(() => {
    const shelfData = processShelfData(allWeeksPW);
    return renderPlayWheShelfContainer(shelfData.marks, shelfData.numberColors, shelfData.intervals);
  })()}
  <br>
  ${renderMonthlyCarousel(allWeeksPW, "P2WHE", "PLAY WHE")}
  <br>
      <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
      <span>PICK 2</span>
      <span>DAY TO DAY CHART</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
    ${buildTable(p2Data.data.weeks.slice(-2), "PIKII")}
<br>
    <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
  <span>HISTORICAL DAY TO DAY VIEW</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
  ${renderCarouselWithCurrentP2(allWeeksP2, "p2")}
  
  ${renderPick2CurrentWeekPlays(allWeeksP2, "p2")}
<br>
  <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
  <span>PICK 2 LINE CHART HEAT MAP</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
${renderLSChart(
  `LINES (${p2StartHeader} — PRESENT) • Cycle ${p2CycleNum} • ${filteredP2.length}/36`,
  "L", lines, p2LineStats, p2TotalHits, filteredP2.length, p2Data.data.weeks, "PICK_2"
)}
<br>
  <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
  <span>PICK 2 SUITE CHART HEAT MAP</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
${renderLSChart(
  `SUITES (${p2StartHeader} — PRESENT) • Cycle ${p2CycleNum} • ${filteredP2.length}/36`,
  "S", suites, p2SuiteStats, p2TotalHits, filteredP2.length, p2Data.data.weeks, "PICK_2"
)}
  <br>
  ${renderMonthlyCarousel(allWeeksP2, "PIKII", "PICK 2")}
  <br>
      <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
      <span>PICK 4</span>
      <span>DAY TO DAY CHART</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
</div>
  ${buildTable(p4Data.data.weeks.slice(-2), "PIKIV")}
  <br>
  ${renderPick4DigitTracker(
    `DIGIT FREQUENCY (${p4StartHeader} — PRESENT) • Cycle ${p4CycleNum} • ${filteredP4.length}/36`,
    p4Data.data.weeks,
    p4CycleNum
  )}
  <br>
      <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
  <span>HISTORICAL DAY TO DAY VIEW</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
  ${renderCarouselWithCurrentP4(allWeeksP4, "p4")}
  
  ${renderPick4CurrentWeekPlays(allWeeksP4, "p4")}
  
  <br>
  ${renderMonthlyCarousel(allWeeksP4, "PIKIV", "PICK 4")}
  <br>

    <div class="branding">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2px; padding: 0 2px;">
      <span>${BRANDING}</span>
      <span style="color: #00000; font-weight: bold; font-size: 10px;">${globalTrackingCode}</span>
      <span style="color: #00000; font-size: 10px;">Last: ${globalLastDraw}</span>
    </div>
  </div>
    <script>
      function switchTab(t, el) {
        document.querySelectorAll('.container').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        document.getElementById(t + '-tab').classList.add('active');
        el.classList.add('active');
      }
      
      function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('theme-btn');
  
  // This line does the actual work
  body.classList.toggle('light-mode');
  
  // Update the button icon based on the state
  if (body.classList.contains('light-mode')) {
    btn.innerText = '☀️';
  } else {
    btn.innerText = '🌓';
  }
}
      
    </script>
    <script>
  // ===== SPLASH SCREEN SCRIPT =====
      function makeFace(num) {
        const face = document.createElement('div');
        face.className = 'face face--' + num;
        const dot = '<div class="dot"></div>';
        const dots = {
          1: dot,
          2: '<div class="dots">' + dot + '<div></div><div></div><div></div><div></div><div></div><div></div><div></div>' + dot + '</div>',
          3: '<div class="dots">' + dot + '<div></div><div></div><div></div>' + dot + '<div></div><div></div><div></div>' + dot + '</div>',
          4: '<div class="dots">' + dot + '<div></div>' + dot + '<div></div><div></div><div></div>' + dot + '<div></div>' + dot + '</div>',
          5: '<div class="dots">' + dot + '<div></div>' + dot + '<div></div>' + dot + '<div></div>' + dot + '<div></div>' + dot + '</div>',
          6: '<div class="dots">' + dot + dot + dot + dot + dot + dot + '</div>'
        };
        face.innerHTML = dots[num] || '';
        return face;
      }

      function rollDice(cubeId) {
        const cube = document.getElementById(cubeId);
        cube.innerHTML = '';
        for (let i = 1; i <= 6; i++) cube.appendChild(makeFace(i));
        const result = Math.floor(Math.random() * 6) + 1;
        const rotations = {
          1: 'rotateX(0deg) rotateY(0deg)',
          2: 'rotateY(-90deg)',
          3: 'rotateY(180deg)',
          4: 'rotateY(90deg)',
          5: 'rotateX(-90deg)',
          6: 'rotateX(90deg)'
        };
        cube.style.transform = 'rotateX(720deg) rotateY(720deg)';
        setTimeout(() => { cube.style.transform = rotations[result]; }, 100);
      }

      function startSplash() {
        rollDice('cube1');
        rollDice('cube2');
        setTimeout(() => {
          document.getElementById('revealText').classList.add('show');
        }, 1200);
        setTimeout(() => {
          const splash = document.getElementById('splash-screen');
          const main = document.getElementById('main-content');
          splash.classList.add('fade-out');
          setTimeout(() => {
            splash.style.display = 'none';
            main.style.display = 'block';
            setTimeout(() => main.style.opacity = '1', 50);
          }, 800);
        }, 3500);
      }

      startSplash();
      </script>
      </div>
    </body>
    </html>`;

  let wv = new WebView(); await wv.loadHTML(html); await wv.present();
}

function getSortKey(val) {
  if (val === null || val === undefined || val === "-" || val === "PENDING" || val === "") return null;
  let strVal = String(val).trim();
  let parts = strVal.includes(",") || strVal.includes("/") ? strVal.split(/[,/]/) : strVal.split("");
  return parts.map(n => n.trim()).filter(n => n !== "").sort((a, b) => a.localeCompare(b, undefined, {numeric: true})).join("|");
}

function getMatchColor(index) {
  const colors = ["#00f2ff", "#7c02b5", "#32d74b", "#ff375f", "#ffd60a", "#ff9f0a", "#007aff", "#ff2d55"];
  return colors[index % colors.length];
}

function buildTable(weeks, gameType) {
  const isPickGame = (gameType === "PIKII" || gameType === "PIKIV");
  let drawCounts = {}, colorMap = {}, colorIndex = 0;

  if (isPickGame) {
    weeks.forEach(wk => wk.days.forEach(d => timeOrder.forEach(s => {
      let key = getSortKey(d.draws[s]);
      if (key) drawCounts[key] = (drawCounts[key] || 0) + 1;
    })));
    Object.keys(drawCounts).forEach(key => { if (drawCounts[key] > 1) { colorMap[key] = getMatchColor(colorIndex); colorIndex++; } });
  }

  // Helper function to check if a specific draw time has passed
  function isDrawTimePassed(weekStartDate, dayName, slot) {
    if (!weekStartDate) return false;
    const parts = weekStartDate.split(" ");
    const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
    const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
    const dayIndex = daysOfWeek.indexOf(dayName);
    if (dayIndex === -1) return false;
    const drawDate = new Date(startDate);
    drawDate.setDate(startDate.getDate() + dayIndex);
    const timeOffsets = { "MOR": 9, "MID": 12, "NON": 15, "EVE": 18 };
    drawDate.setHours(timeOffsets[slot] || 12);
    return drawDate < new Date();
  }

  // Helper function to check if a day is a HOLIDAY (no draws and EVE has passed)
  function isHolidayDay(weekStartDate, day, dayIndex) {
    if (!day) return false;
    const allSlotsEmpty = timeOrder.every(slot => {
      const val = day.draws[slot];
      return !val || val === "-" || val === "PENDING";
    });
    if (!allSlotsEmpty) return false;
    return isDrawTimePassed(weekStartDate, day.dayName, "EVE");
  }

  let isAfterEvening = false;
  let highlightDayName = todayName;
  const currentWeekData = weeks.find(wk => wk.isCurrentWeek);
  
  if (currentWeekData) {
    // Find the last "completed" day - either has EVE draw OR is a holiday (EVE passed with no draws)
    let lastCompletedDayIndex = -1;
    for (let i = 0; i < daysOfWeek.length; i++) {
      const dayData = currentWeekData.days.find(d => d.dayName === daysOfWeek[i]);
      if (dayData) {
        // Check if day has EVE draw recorded (day is fully complete)
        const hasEveDraw = dayData.draws.EVE && dayData.draws.EVE !== "-" && dayData.draws.EVE !== "PENDING";
        
        // Check if it's a holiday (EVE passed with no draws)
        const isHoliday = isHolidayDay(currentWeekData.startDate, dayData, i);
        
        if (hasEveDraw || isHoliday) {
          lastCompletedDayIndex = i;
          // Only set isAfterEvening to true if EVE was recorded OR it's a holiday
          if (hasEveDraw || isHoliday) {
            isAfterEvening = true;
          }
        }
      }
    }
    
    // Determine highlight day
    if (lastCompletedDayIndex !== -1) {
      if (isAfterEvening) {
        // If last completed day had EVE draw or was a holiday, highlight next day
        highlightDayName = daysOfWeek[(lastCompletedDayIndex + 1) % 7];
      } else {
        // Otherwise highlight the last completed day itself
        highlightDayName = daysOfWeek[lastCompletedDayIndex];
      }
    }
  }

  return weeks.map(wk => {
    // --- Parse Week Range Header ---
    let headerRange = wk.isCurrentWeek ? "CURRENT WEEK" : "PREVIOUS WEEK";
    if (wk.startDate) {
      let start = new Date(wk.startDate);
      if (!isNaN(start.getTime())) {
        let end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
        let opt = { day: 'numeric', month: 'short', year: '2-digit' };
        headerRange += ` (${start.toLocaleDateString('en-GB', opt)} - ${end.toLocaleDateString('en-GB', opt)})`;
      }
    }

    return `
    <div class="table-wrapper">
      <div class="table-header"><span>${headerRange.toUpperCase()} • 🔸 DTD CHART</span></div>
      <table>
        <tr><th>DAY</th><th>MOR</th><th>MID</th><th>NON</th><th>EVE</th></tr>
        ${wk.days.map((d, index) => {
          let isHighlighted = (d.dayName === highlightDayName);
          
          // --- Calculate Day Number ---
          let dayDisplay = d.dayName.slice(0,3).toUpperCase();
          if (wk.startDate) {
            let start = new Date(wk.startDate);
            if (!isNaN(start.getTime())) {
              let currentDayDate = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);
              dayDisplay += ` ${currentDayDate.getDate()}`;
            }
          }
          
          // Check if this entire day has no draws (all slots are "-" or "PENDING")
          const allSlotsEmpty = timeOrder.every(slot => {
            const val = d.draws[slot];
            return !val || val === "-" || val === "PENDING";
          });
          
          // For previous weeks: if all slots empty, show HOLIDAY
          if (!wk.isCurrentWeek && allSlotsEmpty) {
            return `<tr class="${isHighlighted ? 'current-day' : ''}">
              <td class="day-label">${(isHighlighted && isAfterEvening) ? "▶ " : ""}${dayDisplay}</td>
              <td colspan="4" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2);">
                <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
              </td>
            </tr>`;
          }
          
          // For current week: check if the day has no draws AND the last draw time (EVE) has passed
          if (wk.isCurrentWeek && allSlotsEmpty) {
            const isEvePassed = isDrawTimePassed(wk.startDate, d.dayName, "EVE");
            if (isEvePassed) {
              return `<tr class="${isHighlighted ? 'current-day' : ''}">
                <td class="day-label">${(isHighlighted && isAfterEvening) ? "▶ " : ""}${dayDisplay}</td>
                <td colspan="4" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2);">
                  <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
                </td>
              </tr>`;
            }
          }

          // Normal row with individual "..." for missing draws
          return `<tr class="${isHighlighted ? 'current-day' : ''}">
            <td class="day-label">${(isHighlighted && isAfterEvening) ? "▶ " : ""}${dayDisplay}</td>
            ${timeOrder.map(s => {
              let val = d.draws[s];
              let key = getSortKey(val);
              let matchColor = isPickGame ? colorMap[key] : null;
              let style = matchColor ? `style="color:${matchColor}; border:1px solid ${matchColor}; background:${matchColor}15; border-radius:4px;"` : "";
              return `<td ${style}>${(val === "-" || val === "PENDING") ? "..." : val}</td>`;
            }).join("")}
          </tr>`;
        }).join("")}
      </table>
    </div>`;
  }).join('<div style="text-align:center; padding:3px 3px; opacity:0.15; font-weight:900; letter-spacing:3px; pointer-events:none; user-select:none;"><div style="display: flex; justify-content: center; align-items: center; gap: 4px; flex-wrap: wrap;"><span style="font-size:9px;">CODEWITHGLASGOW 🌐 bit.ly/CWGCharts</span><span style="color: #ff9d00; font-weight: bold; font-size: 8px;">' + globalTrackingCode + '</span><span style="color: #666; font-size: 8px;">Last: ' + globalLastDraw + '</span></div></div>');
}

function buildLineTable(weeks) {
  const numToLineMap = {
    1:1, 10:1, 19:1, 28:1, 2:2, 11:2, 20:2, 29:2, 3:3, 12:3, 21:3, 30:3,
    4:4, 13:4, 22:4, 31:4, 5:5, 14:5, 23:5, 32:5, 6:6, 15:6, 24:6, 33:6,
    7:7, 16:7, 25:7, 34:7, 8:8, 17:8, 26:8, 35:8, 9:9, 18:9, 27:9, 36:9
  };

  // Helper function to check if a specific draw time has passed
  function isDrawTimePassed(weekStartDate, dayName, slot) {
    if (!weekStartDate) return false;
    const parts = weekStartDate.split(" ");
    const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
    const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
    const dayIndex = daysOfWeek.indexOf(dayName);
    if (dayIndex === -1) return false;
    const drawDate = new Date(startDate);
    drawDate.setDate(startDate.getDate() + dayIndex);
    const timeOffsets = { "MOR": 9, "MID": 12, "NON": 15, "EVE": 18 };
    drawDate.setHours(timeOffsets[slot] || 12);
    return drawDate < new Date();
  }

  // Helper function to check if a day is a HOLIDAY (no draws and EVE has passed)
  function isHolidayDay(weekStartDate, day, dayIndex) {
    if (!day) return false;
    const allSlotsEmpty = timeOrder.every(slot => {
      const val = day.draws[slot];
      return !val || val === "-" || val === "PENDING";
    });
    if (!allSlotsEmpty) return false;
    return isDrawTimePassed(weekStartDate, day.dayName, "EVE");
  }

  let isAfterEvening = false;
  let highlightDayName = todayName;
  const currentWeekData = weeks.find(wk => wk.isCurrentWeek);
  
  if (currentWeekData) {
    // Find the last "completed" day - either has EVE draw OR is a holiday (EVE passed with no draws)
    let lastCompletedDayIndex = -1;
    for (let i = 0; i < daysOfWeek.length; i++) {
      const dayData = currentWeekData.days.find(d => d.dayName === daysOfWeek[i]);
      if (dayData) {
        // Check if day has EVE draw recorded (day is fully complete)
        const hasEveDraw = dayData.draws.EVE && dayData.draws.EVE !== "-" && dayData.draws.EVE !== "PENDING";
        
        // Check if it's a holiday (EVE passed with no draws)
        const isHoliday = isHolidayDay(currentWeekData.startDate, dayData, i);
        
        if (hasEveDraw || isHoliday) {
          lastCompletedDayIndex = i;
          // Only set isAfterEvening to true if EVE was recorded OR it's a holiday
          if (hasEveDraw || isHoliday) {
            isAfterEvening = true;
          }
        }
      }
    }
    
    // Determine highlight day
    if (lastCompletedDayIndex !== -1) {
      if (isAfterEvening) {
        // If last completed day had EVE draw or was a holiday, highlight next day
        highlightDayName = daysOfWeek[(lastCompletedDayIndex + 1) % 7];
      } else {
        // Otherwise highlight the last completed day itself
        highlightDayName = daysOfWeek[lastCompletedDayIndex];
      }
    }
  }

  return weeks.map(wk => {
    // --- Parse Week Range Header ---
    let headerRange = wk.isCurrentWeek ? "CURRENT WEEK" : "PREVIOUS WEEK";
    if (wk.startDate) {
      let start = new Date(wk.startDate);
      if (!isNaN(start.getTime())) {
        let end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
        let opt = { day: 'numeric', month: 'short', year: '2-digit' };
        headerRange += ` (${start.toLocaleDateString('en-GB', opt)} - ${end.toLocaleDateString('en-GB', opt)})`;
      }
    }

    return `
    <div class="table-wrapper">
      <div class="table-header" style="background: #1e293b; color: #ff9d00;">
        <span>${headerRange.toUpperCase()} • 🔹 LINE CHART</span>
      </div>
      <table>
        <tr><th>DAY</th><th>MOR</th><th>MID</th><th>NON</th><th>EVE</th></tr>
        ${wk.days.map((d, index) => {
          let isHighlighted = (d.dayName === highlightDayName);
          
          // --- Calculate Day Number ---
          let dayDisplay = d.dayName.slice(0,3).toUpperCase();
          if (wk.startDate) {
            let start = new Date(wk.startDate);
            if (!isNaN(start.getTime())) {
              let currentDayDate = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);
              dayDisplay += ` ${currentDayDate.getDate()}`;
            }
          }
          
          // Check if this entire day has no draws (all slots are "-" or "PENDING")
          const allSlotsEmpty = timeOrder.every(slot => {
            const val = d.draws[slot];
            return !val || val === "-" || val === "PENDING";
          });
          
          // For previous weeks: if all slots empty, show HOLIDAY
          if (!wk.isCurrentWeek && allSlotsEmpty) {
            return `<tr class="${isHighlighted ? 'current-day' : ''}">
              <td class="day-label">${(isHighlighted && isAfterEvening) ? "▶ " : ""}${dayDisplay}</td>
              <td colspan="4" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2);">
                <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
              </td>
            </tr>`;
          }
          
          // For current week: check if the day has no draws AND the last draw time (EVE) has passed
          if (wk.isCurrentWeek && allSlotsEmpty) {
            const isEvePassed = isDrawTimePassed(wk.startDate, d.dayName, "EVE");
            if (isEvePassed) {
              return `<tr class="${isHighlighted ? 'current-day' : ''}">
                <td class="day-label">${(isHighlighted && isAfterEvening) ? "▶ " : ""}${dayDisplay}</td>
                <td colspan="4" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2);">
                  <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
                </td>
              </tr>`;
            }
          }

          // Normal row with individual "..." for missing draws
          return `<tr class="${isHighlighted ? 'current-day' : ''}">
            <td class="day-label">${(isHighlighted && isAfterEvening) ? "▶ " : ""}${dayDisplay}</td>
            ${timeOrder.map(s => {
              let val = String(d.draws[s]).trim();
              if (val === "-" || val === "PENDING" || val === "") return `<td>...</td>`;
              
              let match = val.match(/^(\d+)/);
              if (match) {
                let num = parseInt(match[1], 10);
                let lineId = numToLineMap[num] || "?";
                let lineColors = ["#00f2ff", "#ff9f0a", "#32d74b", "#ff375f", "#ffd60a", "#bf5af2", "#1e90ff", "#ff1493", "#00ff7f"];
                let color = lineColors[(lineId - 1) % lineColors.length] || "#fff";
                return `<td style="color:${color}; font-weight:900;">${lineId}L</td>`;
              }
              return `<td>...</td>`;
            }).join("")}
          </tr>`;
        }).join("")}
      </table>
    </div>`;
  }).join('<div style="text-align:center; padding:3px 3px; opacity:0.15; font-weight:900; letter-spacing:3px; pointer-events:none; user-select:none;"><div style="display: flex; justify-content: center; align-items: center; gap: 4px; flex-wrap: wrap;"><span style="font-size:9px;">CODEWITHGLASGOW 🌐 LINE CHART</span><span style="color: #ff9d00; font-weight: bold; font-size: 8px;">' + globalTrackingCode + '</span><span style="color: #666; font-size: 8px;">Last: ' + globalLastDraw + '</span></div></div>');
}

// =======================================
// THE CHART MAPPING GRID & CONTAINERS
// ======================================
function renderPlayWheChartMapping(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 12px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading chart mapping data...</div>';
  }
  
  // Sort weeks chronologically to extract current drawing state
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  const currWeekStart = new Date(currentWeek.startDate);
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced function to get draws from multiple weeks
  function getDrawFromMultipleWeeks(weeks, dayName, slot) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const week = weeks[i];
      const draw = getDraw(week, dayName, slot);
      if (draw) {
        return { value: draw, week: week };
      }
    }
    return null;
  }
  
  // Enhanced deep search function that skips holidays
  function findDeepDraw(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
    const targetDayName = dayNames[targetDayIdx];
    
    for (let w = startWeekIndex; w >= 0; w--) {
      const week = sortedWeeks[w];
      
      if (targetDayIdx === 1) {
        const checkDay = week.days.find(d => d.dayName === "Monday");
        const isHoliday = !checkDay || slots.every(s => {
          const val = checkDay.draws[s];
          return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
        });
        if (isHoliday) continue;
      }
      
      const val = getDraw(week, targetDayName, targetSlot);
      if (val) {
        return { value: val, week: week, date: new Date(week.startDate) };
      }
    }
    return null;
  }
  
  // Dynamic lookup for LEAVING number - search across weeks if needed
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  // First try current week
  for (let d = todayIdx; d >= 0; d--) {
    for (let s = slots.length - 1; s >= 0; s--) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        leavingNumber = draw;
        leavingDate = new Date(currWeekStart);
        leavingDate.setDate(currWeekStart.getDate() + d);
        leavingDay = dayNames[d];
        leavingSlot = slots[s];
        leavingDayIdx = d;
        leavingSlotIdx = s;
        break;
      }
    }
    if (leavingNumber) break;
  }
  
  // If no leaving number in current week, search previous weeks
  if (!leavingNumber) {
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            leavingNumber = draw;
            leavingDate = new Date(weekStart);
            leavingDate.setDate(weekStart.getDate() + d);
            leavingDay = dayNames[d];
            leavingSlot = slots[s];
            leavingDayIdx = d;
            leavingSlotIdx = s;
            break;
          }
        }
        if (leavingNumber) break;
      }
      if (leavingNumber) break;
    }
  }
  
  // Dynamic lookup for MEETING number - ENHANCED to skip holidays
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  let meetingWeek = null;
  
  if (leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
    let nextDayIdx = leavingDayIdx;
    let nextSlotIdx = leavingSlotIdx + 1;
    
    if (nextSlotIdx >= slots.length) {
      nextSlotIdx = 0;
      nextDayIdx = leavingDayIdx + 1;
    }
    
    if (nextDayIdx >= dayNames.length) {
      nextDayIdx = 0;
    }
    
    if (nextDayIdx < dayNames.length) {
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, nextDayIdx, slots[nextSlotIdx]);
      if (result && result.value) {
        meetingNumber = result.value;
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingWeek = result.week;
        meetingDate = result.date;
        if (meetingDate) {
          meetingDate.setDate(meetingDate.getDate() + nextDayIdx);
        }
      }
    }
  }
  
  const linesChart = {
    1: [1, 10, 19, 28], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30],
    4: [4, 13, 22, 31], 5: [5, 14, 23, 32], 6: [6, 15, 24, 33],
    7: [7, 16, 25, 34], 8: [8, 17, 26, 35], 9: [9, 18, 27, 36]
  };
  
  const suitsChart = {
    0: [10, 20, 30], 1: [1, 11, 21, 31], 2: [2, 12, 22, 32],
    3: [3, 13, 23, 33], 4: [4, 14, 24, 34], 5: [5, 15, 25, 35],
    6: [6, 16, 26, 36], 7: [7, 17, 27], 8: [8, 18, 28], 9: [9, 19, 29]
  };
  
  const spiritNames = {
    1: "Centipede", 2: "Old Lady", 3: "Carriage", 4: "Dead Man", 5: "Parson Man",
    6: "Belly", 7: "Hog", 8: "Tiger", 9: "Cattle", 10: "Monkey",
    11: "Corbeau", 12: "King", 13: "Crapaud", 14: "Money", 15: "Sick Woman",
    16: "Jamette", 17: "Pigeon", 18: "Water Boat", 19: "Horse", 20: "Dog",
    21: "Mouth", 22: "Rat", 23: "House", 24: "Queen", 25: "Morrocoy",
    26: "Fowl", 27: "Little Snake", 28: "Red Fish", 29: "Opium Man", 30: "House Cat",
    31: "Parson Wife", 32: "Shrimp", 33: "Spider", 34: "Blind Man", 35: "Big Snake", 36: "Donkey"
  };
  
  function getLineAndSuitForNumber(num) {
    if (!num) return { line: null, suit: null };
    let line = null, suit = null;
    for (let [key, group] of Object.entries(linesChart)) {
      if (group.includes(num)) { line = key; break; }
    }
    for (let [key, group] of Object.entries(suitsChart)) {
      if (group.includes(num)) { suit = key; break; }
    }
    return { line, suit };
  }
  
  function formatLineSuit(line, suit) {
    if (line === null && suit === null) return "—";
    const lineStr = line !== null ? `${line}L` : "";
    const suitStr = suit !== null ? `${suit}S` : "";
    if (lineStr && suitStr) return `${lineStr} / ${suitStr}`;
    return lineStr || suitStr;
  }
  
  const leavingLineSuit = getLineAndSuitForNumber(leavingNumber);
  const meetingLineSuit = getLineAndSuitForNumber(meetingNumber);
  const leavingSpiritName = leavingNumber ? spiritNames[leavingNumber] : null;
  const meetingSpiritName = meetingNumber ? spiritNames[meetingNumber] : null;

  // The Developed Chart Matrix - Exact structural transcription row-by-row
  const fullChartMatrix = [
    // Row 1
    [
      {n:1, bg:"#fbcfe8"}, {n:5, bg:"#fbcfe8"}, {n:2, bg:"#ffffff"}, {n:6, bg:"#ffffff"},
      {n:3, bg:"#fbcfe8"}, {n:7, bg:"#fbcfe8"}, {n:4, bg:"#ffffff"}, {n:8, bg:"#ffffff"},
      {n:5, bg:"#fbcfe8"}, {n:9, bg:"#fbcfe8"}, {n:6, bg:"#ffffff"}, {n:10, bg:"#ffffff"},
      {n:7, bg:"#fbcfe8"}, {n:11, bg:"#fbcfe8"}, {n:8, bg:"#ffffff"}, {n:12, bg:"#ffffff"},
      {n:9, bg:"#fbcfe8"}, {n:13, bg:"#fbcfe8"}
    ],
    // Row 2
    [
      {n:25, bg:"#fbcfe8"}, {n:18, bg:"#fbcfe8"}, {n:26, bg:"#ffffff"}, {n:19, bg:"#ffffff"},
      {n:27, bg:"#fbcfe8"}, {n:20, bg:"#fbcfe8"}, {n:28, bg:"#ffffff"}, {n:21, bg:"#ffffff"},
      {n:29, bg:"#fbcfe8"}, {n:22, bg:"#fbcfe8"}, {n:30, bg:"#ffffff"}, {n:23, bg:"#ffffff"},
      {n:31, bg:"#fbcfe8"}, {n:24, bg:"#fbcfe8"}, {n:32, bg:"#ffffff"}, {n:25, bg:"#ffffff"},
      {n:33, bg:"#fbcfe8"}, {n:26, bg:"#fbcfe8"}
    ],
    // Row 3
    [
      {n:10, bg:"#ffffff"}, {n:14, bg:"#ffffff"}, {n:11, bg:"#22d3ee"}, {n:15, bg:"#22d3ee"},
      {n:12, bg:"#ffffff"}, {n:16, bg:"#ffffff"}, {n:13, bg:"#22d3ee"}, {n:17, bg:"#22d3ee"},
      {n:14, bg:"#ffffff"}, {n:18, bg:"#ffffff"}, {n:15, bg:"#22d3ee"}, {n:19, bg:"#22d3ee"},
      {n:16, bg:"#ffffff"}, {n:20, bg:"#ffffff"}, {n:17, bg:"#22d3ee"}, {n:21, bg:"#22d3ee"},
      {n:18, bg:"#ffffff"}, {n:22, bg:"#ffffff"}
    ],
    // Row 4
    [
      {n:34, bg:"#ffffff"}, {n:27, bg:"#ffffff"}, {n:35, bg:"#22d3ee"}, {n:28, bg:"#22d3ee"},
      {n:36, bg:"#ffffff"}, {n:29, bg:"#ffffff"}, {n:1, bg:"#22d3ee"}, {n:30, bg:"#22d3ee"},
      {n:2, bg:"#ffffff"}, {n:31, bg:"#ffffff"}, {n:3, bg:"#22d3ee"}, {n:32, bg:"#22d3ee"},
      {n:4, bg:"#ffffff"}, {n:33, bg:"#ffffff"}, {n:5, bg:"#22d3ee"}, {n:34, bg:"#22d3ee"},
      {n:6, bg:"#ffffff"}, {n:35, bg:"#ffffff"}
    ],
    // Row 5
    [
      {n:19, bg:"#facc15"}, {n:23, bg:"#facc15"}, {n:20, bg:"#ffffff"}, {n:24, bg:"#ffffff"},
      {n:21, bg:"#facc15"}, {n:25, bg:"#facc15"}, {n:22, bg:"#ffffff"}, {n:26, bg:"#ffffff"},
      {n:23, bg:"#facc15"}, {n:27, bg:"#facc15"}, {n:24, bg:"#ffffff"}, {n:28, bg:"#ffffff"},
      {n:25, bg:"#facc15"}, {n:29, bg:"#facc15"}, {n:26, bg:"#ffffff"}, {n:30, bg:"#ffffff"},
      {n:27, bg:"#facc15"}, {n:31, bg:"#facc15"}
    ],
    // Row 6
    [
      {n:7, bg:"#facc15"}, {n:36, bg:"#facc15"}, {n:8, bg:"#ffffff"}, {n:1, bg:"#ffffff"},
      {n:9, bg:"#facc15"}, {n:2, bg:"#facc15"}, {n:10, bg:"#ffffff"}, {n:3, bg:"#ffffff"},
      {n:11, bg:"#facc15"}, {n:4, bg:"#facc15"}, {n:12, bg:"#ffffff"}, {n:5, bg:"#ffffff"},
      {n:13, bg:"#facc15"}, {n:6, bg:"#facc15"}, {n:14, bg:"#ffffff"}, {n:7, bg:"#ffffff"},
      {n:15, bg:"#facc15"}, {n:8, bg:"#facc15"}
    ],
    // Row 7
    [
      {n:28, bg:"#ffffff"}, {n:32, bg:"#ffffff"}, {n:29, bg:"#4ade80"}, {n:33, bg:"#4ade80"},
      {n:30, bg:"#ffffff"}, {n:34, bg:"#ffffff"}, {n:31, bg:"#4ade80"}, {n:35, bg:"#4ade80"},
      {n:32, bg:"#ffffff"}, {n:36, bg:"#ffffff"}, {n:33, bg:"#4ade80"}, {n:1, bg:"#4ade80"},
      {n:34, bg:"#ffffff"}, {n:2, bg:"#ffffff"}, {n:35, bg:"#4ade80"}, {n:36, bg:"#4ade80"},
      {n:36, bg:"#ffffff"}, {n:4, bg:"#ffffff"}
    ],
    // Row 8
    [
      {n:16, bg:"#ffffff"}, {n:9, bg:"#ffffff"}, {n:17, bg:"#4ade80"}, {n:10, bg:"#4ade80"},
      {n:18, bg:"#ffffff"}, {n:11, bg:"#ffffff"}, {n:19, bg:"#4ade80"}, {n:12, bg:"#4ade80"},
      {n:20, bg:"#ffffff"}, {n:13, bg:"#ffffff"}, {n:21, bg:"#4ade80"}, {n:14, bg:"#4ade80"},
      {n:22, bg:"#ffffff"}, {n:15, bg:"#ffffff"}, {n:23, bg:"#4ade80"}, {n:16, bg:"#4ade80"},
      {n:24, bg:"#ffffff"}, {n:17, bg:"#ffffff"}
    ]
  ];

  let rowsHtml = "";
  for (let r = 0; r < fullChartMatrix.length; r++) {
    rowsHtml += "<tr>";
    for (let c = 0; c < fullChartMatrix[r].length; c++) {
      let cell = fullChartMatrix[r][c];
      let isLeaving = (cell.n === leavingNumber);
      let isMeeting = (cell.n === meetingNumber);
      
      let borderStyle = "border: 1px solid #000000;";
      let extraClass = "";
      let runtimeBg = cell.bg;
      let fontColor = "#000000";

      if (isLeaving) {
        runtimeBg = "#00f2ff";
        borderStyle = "border: 2px solid #000000; box-shadow: inset 0 0 4px #000;";
        extraClass = "animation-pulse";
      } else if (isMeeting) {
        runtimeBg = "#ff453a";
        borderStyle = "border: 2px solid #ffffff;";
        fontColor = "#ffffff";
      }

      rowsHtml += `<td class="${extraClass}" style="background: ${runtimeBg}; color: ${fontColor}; font-size: 13px; font-weight: 900; padding: 7px 2px; ${borderStyle} text-align: center; width: 5.55%;">
        ${cell.n}
      </td>`;
    }
    rowsHtml += "</tr>";
  }

  function formatDaySlot(day, slot, date) {
    if (!day || !slot) return "—";
    return `${day.slice(0,3).toUpperCase()} ${date ? date.getDate() : ''} • ${slot}`;
  }

  return `
  <div class="table-wrapper" style="margin-bottom: 15px; background: var(--card); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
    <div class="table-header" style="background: #0f172a; padding: 12px; font-size: 14px; font-weight: 900; color: #ff9d00; text-align: center; display: block; border-bottom: 1px solid rgba(255,255,255,0.1); letter-spacing: 0.5px;">
      THE PLAYWHE CHART MAPPING MATRIX
    </div>
    
    <div style="display: flex; gap: 8px; padding: 10px; background: rgba(0,0,0,0.2);">
      <div style="flex: 1; background: rgba(0, 242, 255, 0.1); border-radius: 8px; padding: 8px; text-align: center; border-left: 4px solid #00f2ff;">
        <div style="font-size: 10px; color: #00f2ff; font-weight: bold; letter-spacing: 0.5px;">LEAVING</div>
        <div style="font-size: 20px; font-weight: 900; color: #00f2ff; line-height: 1.2;">${leavingNumber || '—'}</div>
        <div style="font-size: 9px; color: var(--text-main); font-weight: 600;">${leavingSpiritName || '—'}</div>
        <div style="font-size: 8px; color: var(--text-dim);">${formatDaySlot(leavingDay, leavingSlot, leavingDate)}</div>
        <div style="font-size: 9px; color: #ff9d00; font-weight: bold; margin-top: 2px;">${formatLineSuit(leavingLineSuit.line, leavingLineSuit.suit)}</div>
      </div>
      
      <div style="flex: 1; background: rgba(255, 69, 58, 0.1); border-radius: 8px; padding: 8px; text-align: center; border-left: 4px solid #ff453a;">
        <div style="font-size: 10px; color: #ff453a; font-weight: bold; letter-spacing: 0.5px;">MEETING</div>
        <div style="font-size: 20px; font-weight: 900; color: #ff453a; line-height: 1.2;">${meetingNumber || '—'}</div>
        <div style="font-size: 9px; color: var(--text-main); font-weight: 600;">${meetingSpiritName || '—'}</div>
        <div style="font-size: 8px; color: var(--text-dim);">${meetingNumber ? formatDaySlot(meetingDay, meetingSlot, meetingDate) : 'Next Draw Slot'}</div>
        <div style="font-size: 9px; color: #00f2ff; font-weight: bold; margin-top: 2px;">${meetingNumber ? formatLineSuit(meetingLineSuit.line, meetingLineSuit.suit) : '—'}</div>
      </div>
    </div>

    <div style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 8px 4px; background: #ffffff;">
      <table style="width: 100%; min-width: 660px; border-collapse: collapse; table-layout: fixed; margin: 0 auto;">
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
    
<div style="font-size: 9px; color: var(--text-dim); text-align: center; padding: 6px; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.05);">
  <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
    <span>⚡ 🔵 LEAVING • 🔴 MEETING • CWG ©️</span>
    <span style="color: #ff9d00; font-weight: bold; font-size: 8px;">${globalTrackingCode}</span>
    <span style="color: #666; font-size: 8px;">Last: ${globalLastDraw}</span>
  </div>
</div>
  </div>
  `;
}

// ======================================
// Monthly Plays Ranking
// ======================================
// =========================================
// MONTHLY STATS CAROUSEL FUNCTION (SMART VERSION - FINAL)
// =========================================
function renderMonthlyCarousel(weeksData, gameType, title) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Helper to extract numbers based on game type
  function extractNumbers(value, gameType) {
    if (!value || value === "-" || value === "PENDING") return [];
    
    if (gameType === "P2WHE") {
      let num = parseInt(value, 10);
      if (!isNaN(num) && num >= 1 && num <= 36) return [num];
      return [];
    }
    else if (gameType === "PIKII") {
      let results = [];
      let strVal = String(value);
      let parts = strVal.split(/[,/ ]+/);
      for (let part of parts) {
        let num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= 36) {
          results.push(num);
        }
      }
      return results;
    }
    else if (gameType === "PIKIV") {
      let results = [];
      let strVal = String(value);
      let cleanVal = strVal.replace(/[^0-9]/g, '');
      for (let i = 0; i < cleanVal.length; i++) {
        let digit = parseInt(cleanVal.charAt(i), 10);
        if (!isNaN(digit) && digit >= 0 && digit <= 9) {
          results.push(digit);
        }
      }
      return results;
    }
    return [];
  }
  
  // Calculate stats for the month
  function getMonthStats(targetMonth, targetYear) {
    let counts = {};
    let lastPlayed = {};
    let numberRange = (gameType === "PIKIV") ? 9 : 36;
    let startNum = (gameType === "PIKIV") ? 0 : 1;
    
    for (let i = startNum; i <= numberRange; i++) {
      counts[i] = 0;
      lastPlayed[i] = null;
    }
    
    weeksData.forEach(week => {
      week.days.forEach(day => {
        let parts = week.startDate.split(" ");
        let monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
        let d = new Date(parts[2], monthMap[parts[1]], parts[0]);
        let dayOrderLocal = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        d.setDate(d.getDate() + dayOrderLocal.indexOf(day.dayName));
        
        if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
          Object.values(day.draws).forEach(val => {
            let numbers = extractNumbers(val, gameType);
            numbers.forEach(num => {
              counts[num]++;
              if (!lastPlayed[num] || d > lastPlayed[num]) {
                lastPlayed[num] = new Date(d);
              }
            });
          });
        }
      });
    });
    
    let sorted = Object.keys(counts).map(num => {
      let daysAgo = "Never";
      if (lastPlayed[num]) {
        let diffDays = Math.floor((now - lastPlayed[num]) / (1000 * 60 * 60 * 24));
        daysAgo = diffDays;
      }
      return { 
        num: parseInt(num), 
        count: counts[num],
        lastPlayed: lastPlayed[num],
        daysAgo: daysAgo
      };
    }).sort((a, b) => b.count - a.count);
    
    // Dynamic filtering - no hardcoded limits
    let top = sorted.filter(item => item.count >= 3);   // 3 or more hits
    let bottom = sorted.filter(item => item.count <= 2); // 2 or fewer hits (includes zeros)
    
    return { top: top, bottom: bottom };
  }
  
  const thisMonthStats = getMonthStats(currentMonth, currentYear);
  const lastMonthStats = getMonthStats(lastMonth, lastMonthYear);
  
  const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  const lastMonthName = new Date(lastMonthYear, lastMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  
  function formatLastPlayed(date) {
    if (!date) return "Never";
    const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).replace(/(\d{2})(\d{2})$/, "'$2");
  }
  
  function generateStatsTable(marksArray, monthName, isMostPlayed = true) {
    if (!marksArray || marksArray.length === 0) {
      return '<div style="text-align:center; padding:20px; color:#666;">No data available</div>';
    }
    
    // Filter based on hit count thresholds
    let filteredArray;
    if (isMostPlayed) {
      filteredArray = marksArray.filter(item => item.count >= 3);
    } else {
      filteredArray = marksArray.filter(item => item.count <= 2);
    }
    
    if (filteredArray.length === 0) {
      return '<div style="text-align:center; padding:20px; color:#666;">No data meets threshold</div>';
    }
    
    let spiritName = (num) => {
      if (gameType === "P2WHE") return spirits[num] ? spirits[num].substring(0, 8) : "Unknown";
      return "-";
    };
    
    let displayNum = (num) => {
      if (gameType === "PIKIV") return num.toString();
      return num.toString();
    };
    
    let tableHtml = `
      <div class="stats-card">
        <div class="stats-card-header">
          <h4>${monthName}</h4>
          <p style="font-size: 9px; margin-top: 2px; color: #aaa;">${filteredArray.length} numbers</p>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
          <table class="stats-table">
            <thead>
              <tr style="position: sticky; top: 0; background: var(--card);">
                <th>#</th>
                <th>Mark</th>
                ${gameType === "P2WHE" ? '<th>Spirit</th>' : ''}
                <th>Hits</th>
                <th>Last</th>
                <th>Days</th>
               </tr>
            </thead>
            <tbody>
    `;
    
    filteredArray.forEach((item, idx) => {
      let rankClass = '';
      if (idx === 0 && isMostPlayed) rankClass = 'stats-rank-1';
      else if (idx === 1 && isMostPlayed) rankClass = 'stats-rank-2';
      else if (idx === 2 && isMostPlayed) rankClass = 'stats-rank-3';
      
      const lastPlayedFormatted = formatLastPlayed(item.lastPlayed);
      const daysAgoText = item.daysAgo === "Never" ? "Never" : item.daysAgo + "d";
      const numDisplay = displayNum(item.num);
      
      let hitColor = '#10b981';
      if (gameType === "PIKIV") {
        if (item.count >= 20) hitColor = '#bf5af2';
        else if (item.count >= 15) hitColor = '#5856d6';
        else if (item.count >= 10) hitColor = '#007aff';
        else if (item.count >= 5) hitColor = '#ff9f0a';
        else if (item.count >= 1) hitColor = '#10b981';
      } else {
        if (item.count >= 10) hitColor = '#bf5af2';
        else if (item.count >= 7) hitColor = '#5856d6';
        else if (item.count >= 4) hitColor = '#007aff';
        else if (item.count >= 2) hitColor = '#ff9f0a';
        else if (item.count >= 1) hitColor = '#10b981';
      }
      
      if (item.count === 0) hitColor = '#666';
      
      tableHtml += `
        <tr class="${rankClass}">
          <td style="font-weight: 700; color: #ff9d00;">${idx + 1}</td>
          <td style="font-weight: 800; font-size: 14px;">${numDisplay}</td>
          ${gameType === "P2WHE" ? `<td style="font-size: 10px;">${spiritName(item.num)}</td>` : ''}
          <td style="font-weight: 700; color: ${hitColor};">${item.count}x</td>
          <td style="font-size: 9px;">${lastPlayedFormatted}</td>
          <td style="font-size: 9px; font-weight: bold; color: ${item.daysAgo !== "Never" && item.daysAgo > 7 ? '#ff453a' : '#888'};">${daysAgoText}</td>
        </tr>
      `;
    });
    
    tableHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    return tableHtml;
  }
  
  return `
    <div class="fsp-carousel-wrapper" style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 0 4px;">
        <span style="font-size: 14px; font-weight: 800; color: #ff9d00;">♠️ ${title} : MONTHLY STATS</span>
        <div style="display: flex; gap: 8px;">
          <button class="carousel-prev-${gameType}" style="background: rgba(255,157,0,0.3); border: none; border-radius: 20px; padding: 4px 12px; color: white; font-weight: bold; cursor: pointer;">◀</button>
          <button class="carousel-next-${gameType}" style="background: rgba(255,157,0,0.3); border: none; border-radius: 20px; padding: 4px 12px; color: white; font-weight: bold; cursor: pointer;">▶</button>
        </div>
      </div>
      <div class="fsp-carousel" id="monthlyCarousel-${gameType}" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 16px; padding: 4px 0 16px 0; scroll-behavior: smooth;">
        <div class="carousel-item" style="flex: 0 0 calc(100% - 40px); min-width: 320px; scroll-snap-align: start; background: var(--card); border-radius: 16px; overflow: hidden;">
          <div class="carousel-header" style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 12px; text-align: center; font-size: 13px; font-weight: 800; color: #ff9d00;">🔺 MOST PLAYED (THIS MONTH)</div>
          <div class="stats-container">${generateStatsTable(thisMonthStats.top, currentMonthName, true)}</div>
          <div class="carousel-subtitle" style="font-size: 9px; color: #888; text-align: center; padding: 8px; border-top: 1px solid #333;">Marks with 3x + Hits This Month</div>
        </div>
        <div class="carousel-item" style="flex: 0 0 calc(100% - 40px); min-width: 320px; scroll-snap-align: start; background: var(--card); border-radius: 16px; overflow: hidden;">
          <div class="carousel-header" style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 12px; text-align: center; font-size: 13px; font-weight: 800; color: #ff9d00;">🔻 LEAST PLAYED (THIS MONTH)</div>
          <div class="stats-container">${generateStatsTable(thisMonthStats.bottom, currentMonthName, false)}</div>
          <div class="carousel-subtitle" style="font-size: 9px; color: #888; text-align: center; padding: 8px; border-top: 1px solid #333;">Marks With 0x - 2x Hits This Month</div>
        </div>
        <div class="carousel-item" style="flex: 0 0 calc(100% - 40px); min-width: 320px; scroll-snap-align: start; background: var(--card); border-radius: 16px; overflow: hidden;">
          <div class="carousel-header" style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 12px; text-align: center; font-size: 13px; font-weight: 800; color: #ff9d00;">🔺 MOST PLAYED (LAST MONTH)</div>
          <div class="stats-container">${generateStatsTable(lastMonthStats.top, lastMonthName, true)}</div>
          <div class="carousel-subtitle" style="font-size: 9px; color: #888; text-align: center; padding: 8px; border-top: 1px solid #333;">Marks With 3x + Hits Last Month</div>
        </div>
        <div class="carousel-item" style="flex: 0 0 calc(100% - 40px); min-width: 320px; scroll-snap-align: start; background: var(--card); border-radius: 16px; overflow: hidden;">
          <div class="carousel-header" style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 12px; text-align: center; font-size: 13px; font-weight: 800; color: #ff9d00;">🔻 LEAST PLAYED (LAST MONTH)</div>
          <div class="stats-container">${generateStatsTable(lastMonthStats.bottom, lastMonthName, false)}</div>
          <div class="carousel-subtitle" style="font-size: 9px; color: #888; text-align: center; padding: 8px; border-top: 1px solid #333;">Marks With 0x - 2x Hits Last Month</div>
        </div>
      </div>
      <div class="carousel-dots" style="display: flex; justify-content: center; gap: 8px; margin-top: 12px;" id="carouselDots-${gameType}"></div>
    </div>
    
    <style>
      .fsp-carousel::-webkit-scrollbar {
        height: 4px;
      }
      .fsp-carousel::-webkit-scrollbar-track {
        background: #333;
        border-radius: 10px;
      }
      .fsp-carousel::-webkit-scrollbar-thumb {
        background: #ff9d00;
        border-radius: 10px;
      }
      .stats-card {
        background: var(--card);
      }
      .stats-card-header h4 {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
        color: #888;
        padding: 8px;
        text-align: center;
        background: rgba(0,0,0,0.2);
      }
      .stats-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }
      .stats-table th {
        background: rgba(0, 0, 0, 0.2);
        padding: 8px 4px;
        text-align: center;
        font-weight: 700;
        color: #ff9d00;
      }
      .stats-table td {
        padding: 6px 4px;
        text-align: center;
        border-bottom: 1px solid #333;
        font-weight: 600;
      }
      .stats-rank-1 {
        background: rgba(255, 215, 0, 0.2);
        font-weight: 800;
      }
      .stats-rank-2 {
        background: rgba(192, 192, 192, 0.15);
      }
      .stats-rank-3 {
        background: rgba(205, 127, 50, 0.15);
      }
    </style>
    
    <script>
      (function() {
        var carousel = document.getElementById('monthlyCarousel-${gameType}');
        var prevBtn = document.querySelector('.carousel-prev-${gameType}');
        var nextBtn = document.querySelector('.carousel-next-${gameType}');
        var dotsContainer = document.getElementById('carouselDots-${gameType}');
        var slides = carousel ? carousel.children : [];
        var currentIndex = 0;
        
        function updateDots() {
          if (!dotsContainer) return;
          var dots = dotsContainer.querySelectorAll('.monthly-dot');
          dots.forEach(function(dot, i) {
            if (i === currentIndex) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }
        
        function scrollToSlide(index) {
          if (!carousel || slides.length === 0) return;
          if (index < 0) index = 0;
          if (index >= slides.length) index = slides.length - 1;
          currentIndex = index;
          var slideWidth = slides[0].offsetWidth;
          var gap = 16;
          carousel.scrollTo({ left: index * (slideWidth + gap), behavior: 'smooth' });
          updateDots();
        }
        
        function handleScroll() {
          if (!carousel || slides.length === 0) return;
          var slideWidth = slides[0].offsetWidth;
          var gap = 16;
          var scrollPosition = carousel.scrollLeft;
          var newIndex = Math.round(scrollPosition / (slideWidth + gap));
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < slides.length) {
            currentIndex = newIndex;
            updateDots();
          }
        }
        
        if (prevBtn) prevBtn.onclick = function() { scrollToSlide(currentIndex - 1); };
        if (nextBtn) nextBtn.onclick = function() { scrollToSlide(currentIndex + 1); };
        if (carousel) carousel.addEventListener('scroll', handleScroll);
        
        if (dotsContainer && slides.length > 1) {
          dotsContainer.innerHTML = '';
          for (var i = 0; i < slides.length; i++) {
            var dot = document.createElement('div');
            dot.className = 'monthly-dot' + (i === currentIndex ? ' active' : '');
            dot.style.cssText = 'width: 6px; height: 6px; background: #555; border-radius: 50%; transition: all 0.3s ease; cursor: pointer;';
            if (i === currentIndex) dot.style.cssText += 'background: #ff9d00; width: 16px; border-radius: 4px;';
            dot.onclick = (function(idx) { return function() { scrollToSlide(idx); }; })(i);
            dotsContainer.appendChild(dot);
          }
        }
        
        setTimeout(function() { scrollToSlide(0); }, 100);
      })();
    </script>
  `;
}


// ======================================
// Heat Grid
// ======================================
function renderHeatGrid(gaps, hits) {
  let out = "";
  for(let i=1; i<=36; i++) {
    let h = hits[i] || 0;
    let g = gaps[i] || 0;
    let barColor = g > 30 ? "#ff453a" : g > 20 ? "#ff9f0a" : g > 10 ? "#ffd60a" : g === 0 ? "#32d74b" : "#3A3A3C";
    let cls = h >= 7 ? "hit-7plus" : "hit-" + h;
    out += `<div class="heat-cell ${cls}">
      <span style="font-size:12px; font-weight:900;">${i}</span>
      <div style="font-size:7px; opacity:0.6;">${g === 0 ? "TODAY" : g+"g"}</div>
      <div style="position: absolute; bottom: 0; width:100%; height:3px; background:${barColor};"></div>
    </div>`;
  }
  return out;
}

// ======================================
// LINES & SUITS HEAT MAP TRACKING
// ======================================
function renderLSChart(title, labelPrefix, groups, stats, hitData, totalDraws, weeksData, gameType = "PLAY_WHE", currentCycleNumber) {
  let rows = Object.keys(groups).map(key => {
    let cells = groups[key].map(num => {
      let h = hitData[num] || 0;
      let cls = h >= 7 ? "hit-7plus" : "hit-" + h;
      return `<td class="${cls}" style="border: 0.5px solid rgba(0,0,0,0.1);">${num}</td>`;
    }).join("");

    let padding = "";
    if (groups[key].length < 4) {
      for (let i = groups[key].length; i < 4; i++) {
        padding += `<td style="background: rgba(255,255,255,0.03); border: 0.5px solid rgba(255,255,255,0.05);"></td>`;
      }
    }

    return `<tr><td class="ls-label">${key}</td><td class="ls-count">${stats[key] || 0}</td>${cells}${padding}</tr>`;
  }).join("");

  // --- Compute missing numbers ---
  let missingNumbers = [];
  for (let n = 1; n <= 36; n++) {
    if (!hitData[n]) missingNumbers.push(n);
  }

  // =====================================
  // HISTORICAL CYCLE COMPLETION RECORDS - DEEP SEARCH FOR PICK 2
  // =====================================
  function getHistoricalCycles(weeksData, gameType) {
    if (!weeksData || weeksData.length === 0) return [];
    
    const sortedWeeks = [...weeksData].sort((a, b) => {
      let pa = a.startDate.split(" ");
      let pb = b.startDate.split(" ");
      return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
    });
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const slots = ["MOR", "MID", "NON", "EVE"];
    
    // Helper to extract ALL numbers from a draw based on game type
    function extractNumbersFromDraw(val, gameType) {
      if (!val || val === "-" || val === "PENDING" || val === "HOLIDAY") return { numbers: [], raw: val, fullDraw: val };
      
      const numbers = [];
      let rawDraw = val;
      let fullDraw = val;
      
      if (gameType === "PLAY_WHE" || gameType === "P2WHE") {
        const match = String(val).match(/^(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num >= 1 && num <= 36) numbers.push(num);
        }
        rawDraw = match ? match[1] : val;
      } else if (gameType === "PICK_2" || gameType === "PIKII") {
        const strVal = String(val);
        const matches = strVal.match(/\d+/g);
        if (matches) {
          matches.forEach(m => {
            const num = parseInt(m, 10);
            if (!isNaN(num) && num >= 1 && num <= 36) numbers.push(num);
          });
        }
        rawDraw = strVal;
        fullDraw = strVal;
      } else if (gameType === "PICK_4" || gameType === "PIKIV") {
        const strVal = String(val).replace(/\D/g, '');
        for (let i = 0; i < strVal.length; i += 2) {
          if (i + 1 < strVal.length) {
            const pair = strVal.substring(i, i + 2);
            const num = parseInt(pair, 10);
            if (!isNaN(num) && num >= 1 && num <= 36) numbers.push(num);
          }
        }
        rawDraw = strVal;
        fullDraw = strVal;
      }
      
      return { numbers, raw: rawDraw, fullDraw: fullDraw };
    }
    
    function getDraw(week, dayName, slot) {
      if (!week) return null;
      const day = week.days.find(d => d.dayName === dayName);
      if (!day) return null;
      return day.draws[slot] || null;
    }
    
    // Build timeline with all draws
    const timeline = [];
    for (const week of sortedWeeks) {
      const weekStart = new Date(week.startDate);
      for (let d = 0; d < dayNames.length; d++) {
        const drawDate = new Date(weekStart);
        drawDate.setDate(weekStart.getDate() + d);
        for (const slot of slots) {
          const val = getDraw(week, dayNames[d], slot);
          if (val) {
            const { numbers, raw, fullDraw } = extractNumbersFromDraw(val, gameType);
            if (numbers.length > 0) {
              timeline.push({
                num: numbers[0],
                allNums: numbers,
                date: drawDate,
                day: dayNames[d],
                slot: slot,
                timestamp: drawDate.getTime(),
                rawDraw: raw,
                fullDraw: fullDraw,
                weekStart: week.startDate
              });
            }
          }
        }
      }
    }
    
    timeline.sort((a, b) => a.timestamp - b.timestamp);
    
    // Find cycle completion points
    const cycles = [];
    let cycleNumbers = new Set();
    let cycleDrawsList = [];
    let cycleStartIndex = 0;
    let cycleStartDate = timeline.length > 0 ? timeline[0].date : null;
    let completionEntry = null;
    let completionNum = null;
    
    for (let i = 0; i < timeline.length; i++) {
      const entry = timeline[i];
      const numsToCheck = entry.allNums || [entry.num];
      
      let anyNewNumber = false;
      let lastNewNum = null;
      
      for (const num of numsToCheck) {
        if (!cycleNumbers.has(num)) {
          cycleNumbers.add(num);
          anyNewNumber = true;
          lastNewNum = num;
        }
      }
      
      cycleDrawsList.push(entry);
      
      if (anyNewNumber && cycleNumbers.size === 36) {
        completionEntry = entry;
        completionNum = lastNewNum;
      }
      
      if (cycleNumbers.size === 36) {
        const compEntry = completionEntry || entry;
        const compDate = compEntry.date;
        const compFullDraw = compEntry.fullDraw || compEntry.rawDraw || '—';
        const compNum = completionNum || compEntry.num;
        const totalHits = cycleDrawsList.length;
        
        let numPlays = 0;
        for (const draw of cycleDrawsList) {
          const drawNums = draw.allNums || [draw.num];
          if (drawNums.includes(compNum)) {
            numPlays++;
          }
        }
        if (numPlays === 0) numPlays = 1;
        
        let completedItem = '';
        if (labelPrefix === 'L') {
          for (const [lineKey, lineNums] of Object.entries(groups)) {
            if (lineNums.includes(compNum)) {
              completedItem = `${lineKey} Line`;
              break;
            }
          }
        } else {
          for (const [suiteKey, suiteNums] of Object.entries(groups)) {
            if (suiteNums.includes(compNum)) {
              completedItem = `${suiteKey} Suite`;
              break;
            }
          }
        }
        if (!completedItem) {
          for (const [key, nums] of Object.entries(groups)) {
            if (nums.includes(compNum)) {
              completedItem = labelPrefix === 'L' ? `Line ${key}` : `Suite ${key}`;
              break;
            }
          }
        }
        
        const cycleDrawsCopy = [...cycleDrawsList];
        
        cycles.push({
          cycleNumber: cycles.length + 1,
          startDate: cycleStartDate,
          completionDate: compDate,
          lastNum: compNum,
          completionDraw: compFullDraw,
          totalDraws: totalHits,
          completedItem: completedItem || '—',
          numPlays: numPlays,
          cycleDraws: cycleDrawsCopy,
          completionPair: compFullDraw
        });
        
        // Reset for next cycle
        cycleNumbers = new Set();
        cycleDrawsList = [];
        cycleStartIndex = i + 1;
        cycleStartDate = i + 1 < timeline.length ? timeline[i + 1].date : null;
        completionEntry = null;
        completionNum = null;
      }
    }
    
    // If there's an incomplete current cycle, add it as the current cycle
    if (cycleNumbers.size > 0 && cycleNumbers.size < 36) {
      const currentCycleDraws = cycleDrawsList.length;
      // Don't add incomplete cycle to completed cycles list
    }
    
    return cycles;
  }
  
  const allCycles = getHistoricalCycles(weeksData, gameType);
  const historicalCycles = allCycles.slice(-6);
  
  // =====================================
  // DETERMINE GAME TYPE
  // =====================================
  const isPlayWhe = (gameType === "PLAY_WHE" || gameType === "P2WHE");
  const isPick2 = (gameType === "PICK_2" || gameType === "PIKII");
  
  // Build historical cycles HTML
  let historyHtml = '';
  if (historicalCycles.length > 0) {
    let extractedCycle = currentCycleNumber;
    
    if (!extractedCycle || extractedCycle <= 0) {
      const cycleMatch = title.match(/Cycle\s*(\d+)/i);
      if (cycleMatch && cycleMatch[1]) {
        extractedCycle = parseInt(cycleMatch[1], 10);
      }
    }
    
    if (!extractedCycle || extractedCycle <= 0) {
      extractedCycle = allCycles.length + 1;
    }
    
    const currentCycle = extractedCycle;
    
    // Get the start date of the current cycle from the title or from the last cycle's completion
    let currentCycleStartDate = '—';
    if (historicalCycles.length > 0) {
      const lastCompletedCycle = historicalCycles[historicalCycles.length - 1];
      if (lastCompletedCycle && lastCompletedCycle.completionDate) {
        // The current cycle started the day after the last cycle completed
        const startDate = new Date(lastCompletedCycle.completionDate);
        startDate.setDate(startDate.getDate() + 1);
        currentCycleStartDate = startDate.toLocaleDateString('en-US', { 
          day: '2-digit',
          month: 'short', 
          year: 'numeric' 
        }).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
      }
    }
    
    // Update the title with the correct start date
    if (currentCycleStartDate !== '—') {
      // The title will be updated in the main return
    }
    
    const cycleRows = historicalCycles.map((cycle, index) => {
      const positionFromEnd = historicalCycles.length - 1 - index;
      const cycleNumber = currentCycle - 1 - positionFromEnd;
      
      const formatDate = (date) => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };
      
      const completionDateFormatted = formatDate(cycle.completionDate);
      const completedItem = cycle.completedItem || '—';
      const totalHits = cycle.totalDraws || 0;
      
      const spiritEmoji = {
      1: "🔪", 
      2: "👵🏾", 
      3: "🚕", 
      4: "⚰️", 
      5: "👨🏾‍🦳", 
      6: "🤰🏽", 
      7: "🐗", 
      8: "🐯",
      9: "🐮", 
      10: "🐒", 
      11: "🦅", 
      12: "🤴🏽", 
      13: "🐸", 
      14: "💰", 
      15: "🤧", 
      16: "💃🏽",
      17: "🐦‍⬛", 
      18: "🚤", 
      19: "🐎", 
      20: "🐶", 
      21: "👄", 
      22: "🐀", 
      23: "🏡", 
      24: "🫅🏽",
      25: "🐢", 
      26: "🐔", 
      27: "🐍", 
      28: "🐟", 
      29: "🍻", 
      30: "🐈‍⬛", 
      31: "👵🏾", 
      32: "🦐",
      33: "🕷️", 
      34: "👨🏾‍🦯", 
      35: "🐍", 
      36: "🫏"
      };
      const emoji = spiritEmoji[cycle.lastNum] || '';
      
      let rankMark = '—';
      let rankCount = 0;
      
      if (isPlayWhe && cycle.cycleDraws && cycle.cycleDraws.length > 0) {
        let maxHits = 0;
        let bestNum = null;
        const cycleHitCounts = {};
        for (const draw of cycle.cycleDraws) {
          const drawNums = draw.allNums || [draw.num];
          for (const num of drawNums) {
            cycleHitCounts[num] = (cycleHitCounts[num] || 0) + 1;
          }
        }
        for (const [num, count] of Object.entries(cycleHitCounts)) {
          if (count > maxHits) {
            maxHits = count;
            bestNum = parseInt(num, 10);
          }
        }
        if (bestNum !== null && maxHits > 0) {
          rankMark = `${bestNum}`;
          rankCount = maxHits;
        }
      }
      
      const rankDisplay = (isPlayWhe && rankMark !== '—') ? 
        `${rankMark}<br><span style="font-size: 9px; color: #94a3b8;">(${rankCount}x)</span>` : 
        '—';
      
      const itemColor = labelPrefix === 'L' ? '#58a6ff' : '#ff9d00';
      
      let markDisplay = `${cycle.lastNum} ${emoji}`;
      let drawDisplay = '—';
      
      if (isPick2) {
        drawDisplay = cycle.completionPair || cycle.completionDraw || '—';
      } else if (isPlayWhe) {
        drawDisplay = rankDisplay;
      } else {
        drawDisplay = cycle.completionDraw || '—';
      }
      
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 6px 6px; text-align: center; font-weight: 700; color: #ff9d00; font-size: 12px;">${cycleNumber}</td>
          <td style="padding: 6px 6px; text-align: center; color: ${itemColor}; font-weight: 600; font-size: 11px;">${completedItem}</td>
          <td style="padding: 6px 6px; text-align: center; font-weight: 700; color: #ffd700; font-size: 12px;">${totalHits}</td>
          <td style="padding: 6px 6px; text-align: center; font-weight: 700; color: #fff; font-size: 13px;">${markDisplay}</td>
          <td style="padding: 6px 6px; text-align: center; font-weight: 700; color: ${isPick2 ? '#58a6ff' : '#ffd700'}; font-size: 12px; ${isPlayWhe ? 'line-height: 1.2;' : ''}">${drawDisplay}</td>
          <td style="padding: 6px 6px; text-align: center; color: #94a3b8; font-size: 9px;">${completionDateFormatted}</td>
        </tr>
      `;
    }).join('');
    
    const column5Header = isPick2 ? 'DRAW' : (isPlayWhe ? 'MOST PLAYED' : 'DRAW');
    
    historyHtml = `
      <div style="margin-top: 7px; border-top: 2px solid rgba(255,157,0,0.2); padding-top: 7px;">
        <div style="font-size: 11px; font-weight: 800; color: #ff9d00; margin-bottom: 4px; text-align: center; letter-spacing: 0.5px;">
          📜 LAST ${historicalCycles.length} CYCLE COMPLETIONS
        </div>
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.05);">
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">CYCLE</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">${labelPrefix === 'L' ? 'LINE' : 'SUITE'}</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">HITS</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">MARK</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">${column5Header}</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">DATE</th>
              </tr>
            </thead>
            <tbody>
              ${cycleRows}
            </tbody>
          </table>
        </div>
        <div style="font-size: 7px; color: #64748b; text-align: center; margin-top: 4px;">
          Last 6 completed cycles • ${labelPrefix === 'L' ? 'Lines' : 'Suites'} completion tracking
          ${isPick2 ? ' • DRAW = full pair that completed the cycle' : ''}
          ${isPlayWhe ? ' • MOST PLAYED = ranked number for that cycle' : ''}
        </div>
      </div>
    `;
  }

  // Format the title with the correct date range
  let displayTitle = title;
  let formattedStartDate = '—';
  
  // Try to extract the start date from the title or use the last cycle completion date
  if (historicalCycles.length > 0) {
    const lastCompletedCycle = historicalCycles[historicalCycles.length - 1];
    if (lastCompletedCycle && lastCompletedCycle.completionDate) {
      const startDate = new Date(lastCompletedCycle.completionDate);
      startDate.setDate(startDate.getDate() + 1);
      formattedStartDate = startDate.toLocaleDateString('en-US', { 
        day: '2-digit',
        month: 'short', 
        year: 'numeric' 
      }).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
      
      // Update the title if it contains a date range
      if (formattedStartDate !== '—') {
        const currentDate = new Date();
        const currentDateStr = currentDate.toLocaleDateString('en-US', { 
          day: '2-digit',
          month: 'short', 
          year: 'numeric' 
        }).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
        
        // Extract the game name from the title
        const gameMatch = title.match(/^(LINES|SUITES)\s*\(/i);
        const gameName = gameMatch ? gameMatch[1] : labelPrefix === 'L' ? 'LINES' : 'SUITES';
        
        // Extract cycle number from title
        const cycleMatch = title.match(/Cycle\s*(\d+)/i);
        const cycleNum = cycleMatch ? cycleMatch[1] : currentCycleNumber || '?';
        
        displayTitle = `${gameName} (${formattedStartDate} — PRESENT) • Cycle ${cycleNum} • ${totalDraws}/36`;
      }
    }
  }

  return `
    <div class="table-wrapper">
      <div class="table-header" style="background:#334155;"><span>${displayTitle}</span></div>
      <table class="ls-table">
        <tr class="ls-header-row">
          <td style="width:15%; color:#888; font-size:10px;">${labelPrefix}</td>
          <td style="width:15%; color:#888; font-size:10px;">HITS</td>
          <td colspan="4" style="color:#888; font-size:10px; text-align:left; padding-left:10px;">MEMBERS</td>
        </tr>
        ${rows}
        <tr class="td-row" style="background: rgba(255,255,255,0.05);">
          <td colspan="2" style="font-size:10px; color: #aaa;">TOTAL DRAW</td>
          <td colspan="4" style="text-align:right; padding-right:8px; font-size:14px; color: #00f2ff; font-weight:900;">
            n = ${totalDraws}
          </td>
        </tr>
        <tr style="background: #0f172a;">
          <td colspan="6" style="padding: 6px 4px;">
            <div style="display:flex; justify-content: space-around; align-items: center; gap: 2px;">
              ${["7plus", "6", "5", "4", "3", "2", "1"].map(c => `
                <div style="display:flex; align-items:center; gap:3px;">
                  <div class="hit-${c}" style="width:4px; height:4px; border-radius:1px;"></div>
                  <span style="font-size:8px; color:#aaa;">${c === '7plus' ? '7x+' : c + 'x'}</span>
                </div>
              `).join("")}
            </div>
          </td>
        </tr>
        ${missingNumbers.length > 0 ? `
        <tr style="background: #111827;">
          <td colspan="6" style="padding:4px 4px; font-size:12px; color:#ff9d00; text-align:center;">
            Missing Until Next Cycle: <br> ${missingNumbers.join(", ")}
          </td>
        </tr>
        ` : ""}
      </table>
      ${historyHtml}
    </div>`;
}

// =====================================
// Missing Lines and Suits Chart (14 Days)
// =====================================
function renderIntelligentAnalysis(weeks) {
  // Collect last 14 draws (or active cycle)
  const windowDraws = [];
  weeks.slice(-2).forEach(wk =>
    wk.days.forEach(d =>
      timeOrder.forEach(t => {
        let val = String(d.draws[t]);
        if (val.match(/^\d+/) && val !== "PENDING") windowDraws.push(parseInt(val));
      })
    )
  );

  // Define all lines and suites
  const lines = {
    1:[1,10,19,28], 2:[2,11,20,29], 3:[3,12,21,30], 
    4:[4,13,22,31], 5:[5,14,23,32], 6:[6,15,24,33], 
    7:[7,16,25,34], 8:[8,17,26,35], 9:[9,18,27,36]
  };

  const suites = {
    1:[1,11,21,31], 2:[2,12,22,32], 3:[3,13,23,33], 
    4:[4,14,24,34], 5:[5,15,25,35], 6:[6,16,26,36], 
    7:[7,17,27], 8:[8,18,28], 9:[9,19,29], 0:[10,20,30]
  };

  // Format the date range from the weeks data
  function getDateRange() {
    if (!weeks || weeks.length === 0) return "Loading...";
    
    // Sort weeks chronologically
    const sortedWeeks = [...weeks].sort((a, b) => {
      let pa = a.startDate.split(" ");
      let pb = b.startDate.split(" ");
      return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
    });
    
    // Get the last two weeks
    const lastTwoWeeks = sortedWeeks.slice(-2);
    if (lastTwoWeeks.length === 0) return "No data";
    
    // Get start date from first week and end date from last week
    const startWeek = lastTwoWeeks[0];
    const endWeek = lastTwoWeeks[lastTwoWeeks.length - 1];
    
    const startDate = new Date(startWeek.startDate);
    const endDate = new Date(endWeek.startDate);
    endDate.setDate(endDate.getDate() + 6); // Add 6 days to get end of week
    
    const formatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const startFormatted = startDate.toLocaleDateString('en-US', formatOptions);
    const endFormatted = endDate.toLocaleDateString('en-US', formatOptions);
    
    return `${startFormatted} - ${endFormatted}`;
  }

  function renderGroup(group, labelPrefix) {
    return Object.keys(group).map(k => {
      const nums = group[k];
      const missingNums = [];

      const numsHtml = nums.map(n => {
        const appeared = windowDraws.includes(n);
        if (!appeared) missingNums.push(n);
        return `<span style="
          ${appeared ? 'color:#888; text-decoration:line-through; opacity:0.4;' 
                     : 'color:#ff9d00; font-weight:900;'} 
          margin-right:6px;">
          ${n}
        </span>`;
      }).join("");

      const missingText = missingNums.length > 0 
        ? `• ${missingNums.join(", ")} to complete ${k} ${labelPrefix}` 
        : `• ${k} ${labelPrefix} Complete`;

      return `<div style="margin-bottom:6px;">
        <b>${k} ${labelPrefix} :</b> ${numsHtml} ${missingText}
      </div>`;
    }).join("");
  }

  const lineHtml = renderGroup(lines, "LINE");
  const suiteHtml = renderGroup(suites, "SUITE");
  
  const dateRange = getDateRange();

  return `
    <div class="table-wrapper">
      <div class="table-header" style="display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center;">
        <span style="font-size: 13px; font-weight: 900; color: #ff9d00;">♦️ MISSING LINES & SUITES CHART</span>
        <span style="font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 0.3px;">📅 ${dateRange}</span>
      </div>
      <div style="padding:15px; font-size:13px;">
        ${lineHtml}
      <div style="width:100%; height:2px; background:#fff;"></div>
        ${suiteHtml}
      </div>
      <div style="font-size: 9px; color: var(--text-dim); text-align: center; padding: 6px; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.05);">
        <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span>⚡ Missing Lines & Suites Chart • CWG ©️</span>
          <span style="color: #ff9d00; font-weight: bold; font-size: 8px;">${globalTrackingCode}</span>
          <span style="color: #666; font-size: 8px;">Last: ${globalLastDraw}</span>
        </div>
      </div>
    </div>
  `;
}

// ======================================
// HOT & OVERDUE NUMBERS
// Probability Matrix & BEST BETS & HEAD SHOT
// ======================================
function renderHotAndOverdue(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 12px; margin-bottom: 7px; border: 1px solid #58a6ff; text-align:center;">📊 Loading hot & overdue data...</div>';
  }
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  const todayName = dayNames[todayIdx];
  const currWeekStart = new Date(currentWeek.startDate);
  
  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  
  // Spirit Names mapping (from PDF)
  const spiritNames = {
    1: "Centipede", 2: "Old Lady", 3: "Carriage", 4: "Dead Man", 5: "Parson Man",
    6: "Belly", 7: "Hog", 8: "Tiger", 9: "Cattle", 10: "Monkey",
    11: "Corbeau", 12: "King", 13: "Crapaud", 14: "Money", 15: "Sick Woman",
    16: "Jamette", 17: "Pigeon", 18: "Water Boat", 19: "Horse", 20: "Dog",
    21: "Mouth", 22: "Rat", 23: "House", 24: "Queen", 25: "Morrocoy",
    26: "Fowl", 27: "Little Snake", 28: "Red Fish", 29: "Opium Man", 30: "House Cat",
    31: "Parson Wife", 32: "Shrimp", 33: "Spider", 34: "Blind Man", 35: "Big Snake", 36: "Donkey"
  };
  
  // Partner mapping (from PDF - some marks have partners)
  const partnerMap = {
    1: 27, 2: 7, 3: 6, 4: 32, 5: 26, 6: 3, 7: 2, 8: 34, 9: 36,
    10: 23, 11: 17, 12: 24, 13: 25, 14: 28, 15: 30, 16: 31, 17: 11, 18: 19,
    19: 18, 20: 33, 21: 22, 22: 21, 23: 10, 24: 12, 25: 13, 26: 5, 27: 1,
    28: 14, 29: 15, 30: 31, 31: 16, 32: 4, 33: 20, 34: 8, 35: 36, 36: 9
  };
  
  // Mirror chart (1-36, 37-n)
  const mirrorMap = {};
  for (let i = 1; i <= 18; i++) {
    mirrorMap[i] = 37 - i;
    mirrorMap[37 - i] = i;
  }
  
// =========================================
// CORRECT 1/8 CHART MAPPING
// Format: [Main Number, Follower 1, Follower 2]
// =========================================
const chart1_8 = {
    1: [8,25], 2: [9,26], 3: [10,27], 4: [11,28], 5: [12,29], 6: [13,30],
    7: [14,31], 8: [15,32], 9: [16,33], 10: [17,34], 11: [18,35], 12: [19,36],
    13: [20,1], 14: [21,2], 15: [22,3], 16: [23,4], 17: [24,5], 18: [25,6],
    19: [26,7], 20: [27,8], 21: [28,9], 22: [29,10], 23: [30,11], 24: [31,12],
    25: [32,13], 26: [33,14], 27: [34,15], 28: [35,16], 29: [36,17], 30: [1,18],
    31: [2,19], 32: [3,20], 33: [4,21], 34: [5,22], 35: [6,23], 36: [7,24]
};

// =========================================
// CORRECT 1/16 CHART MAPPING
// Format: [Main Number, Follower 1, Follower 2]
// =========================================
const chart1_16 = {
    1: [16,29], 2: [17,30], 3: [18,31], 4: [19,32], 5: [20,33], 6: [21,34],
    7: [22,35], 8: [23,36], 9: [24,1], 10: [25,2], 11: [26,3], 12: [27,4],
    13: [28,5], 14: [29,6], 15: [30,7], 16: [31,8], 17: [32,9], 18: [33,10],
    19: [34,11], 20: [35,12], 21: [36,13], 22: [1,14], 23: [2,15], 24: [3,16],
    25: [4,17], 26: [5,18], 27: [6,19], 28: [7,20], 29: [8,21], 30: [9,22],
    31: [10,23], 32: [11,24], 33: [12,25], 34: [13,26], 35: [14,27], 36: [15,28]
};
  
  // Sunny Side Up Chart (from PDF - marks that are "upside down" or "wrong side")
  const sunnySideUp = {
    1: [6,8,11,14,27,33,34],
    2: [7,12,15,23,28],
    3: [6,10,16,18,25],
    4: [1,13,17,24,30],
    5: [9,14,19,26,32],
    6: [1,3,8,15,21,27],
    7: [2,9,11,16,22,29],
    8: [1,6,10,17,23,30],
    9: [5,7,12,18,24,31],
    10: [3,8,13,19,25,32],
    11: [1,7,9,14,20,26,33],
    12: [2,8,15,21,27,34],
    13: [3,9,16,22,28,35],
    14: [1,4,10,17,23,29,36],
    15: [2,6,11,18,24,30],
    16: [3,7,12,19,25,31],
    17: [4,8,13,20,26,32],
    18: [5,9,14,21,27,33],
    19: [6,10,15,22,28,34],
    20: [7,11,16,23,29,35],
    21: [8,12,17,24,30,36],
    22: [1,9,13,18,25,31],
    23: [2,10,14,19,26,32],
    24: [3,11,15,20,27,33],
    25: [4,12,16,21,28,34],
    26: [5,13,17,22,29,35],
    27: [6,14,18,23,30,36],
    28: [7,15,19,24,31],
    29: [8,16,20,25,32],
    30: [9,17,21,26,33],
    31: [10,18,22,27,34],
    32: [11,19,23,28,35],
    33: [1,12,20,24,29,36],
    34: [2,13,21,25,30],
    35: [3,14,22,26,31],
    36: [4,15,23,27,32]
  };
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced deep search function
  function findDeepDraw(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
    const targetDayName = dayNames[targetDayIdx];
    
    for (let w = startWeekIndex; w >= 0; w--) {
      const week = sortedWeeks[w];
      
      if (targetDayIdx === 1) {
        const checkDay = week.days.find(d => d.dayName === "Monday");
        const isHoliday = !checkDay || slots.every(s => {
          const val = checkDay.draws[s];
          return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
        });
        if (isHoliday) continue;
      }
      
      const val = getDraw(week, targetDayName, targetSlot);
      if (val) {
        return { value: val, week: week, date: new Date(week.startDate) };
      }
    }
    return null;
  }
  
  // =====================================
  // GET TODAY'S DRAWS (from previous week)
  // =====================================
  let todayDraws = [];
  for (const slot of slots) {
    const draw = getDraw(previousWeek, todayName, slot);
    if (draw) todayDraws.push(draw);
  }
  
  if (todayDraws.length === 0) {
    for (const slot of slots) {
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, todayIdx, slot);
      if (result && result.value) {
        todayDraws.push(result.value);
      }
    }
  }
  
  // =====================================
  // GET CURRENT WEEK DRAWS (for filtering)
  // =====================================
  function getCurrentWeekDraws() {
    const draws = [];
    if (!currentWeek) return draws;
    const now = new Date();
    const todayIdx = now.getDay();
    for (let d = 0; d <= todayIdx; d++) {
      for (const slot of slots) {
        const draw = getDraw(currentWeek, dayNames[d], slot);
        if (draw) draws.push(draw);
      }
    }
    return draws;
  }
  
  const currentWeekDraws = getCurrentWeekDraws();
  
  // =====================================
  // GET PREVIOUS WEEK DRAWS (for Doubles/Triples/Quadruple analysis)
  // =====================================
  function getPreviousWeekDraws() {
    const draws = [];
    if (!previousWeek) return draws;
    for (let d = 0; d < dayNames.length; d++) {
      for (const slot of slots) {
        const draw = getDraw(previousWeek, dayNames[d], slot);
        if (draw) draws.push(draw);
      }
    }
    return draws;
  }
  
  const previousWeekDraws = getPreviousWeekDraws();
  
// =====================================
  // DOUBLES, TRIPLES, QUADRUPLES ANALYSIS
  // =====================================
  
  // Count occurrences in previous week and current week
  const prevWeekCounts = {};
  const currWeekCounts = {};
  for (let i = 1; i <= 36; i++) {
    prevWeekCounts[i] = 0;
    currWeekCounts[i] = 0;
  }
  previousWeekDraws.forEach(num => { prevWeekCounts[num] = (prevWeekCounts[num] || 0) + 1; });
  currentWeekDraws.forEach(num => { currWeekCounts[num] = (currWeekCounts[num] || 0) + 1; });
  
  // Categories
  const doubleNumbers = [8, 11, 22, 33];
  const allDoubles = [];
  const allTriples = [];
  const allQuadruples = [];
  
  // ====================================
  // DOUBLES: Only 8, 11, 22, 33
  // - Show if they haven't played (missing from both weeks)
  // - Show if they played once this week (to double current)
  // ====================================
  const toDoubleMissing = doubleNumbers.filter(num => !previousWeekDraws.includes(num) && !currentWeekDraws.includes(num));
  const toDoubleCurrent = doubleNumbers.filter(num => (currWeekCounts[num] || 0) === 1);
  
  // Add all double candidates
  toDoubleMissing.forEach(num => allDoubles.push(num));
  toDoubleCurrent.forEach(num => allDoubles.push(num));
  
  // ===================================
  // TRIPLES: Any number that had 2 plays previous week
  // OR has 2 plays current week
  // ===================================
  const toTripleMissing = [];
  for (let num = 1; num <= 36; num++) {
    const prevCount = prevWeekCounts[num] || 0;
    const currCount = currWeekCounts[num] || 0;
    if (prevCount === 2 && currCount === 0) toTripleMissing.push(num);
  }
  
  const toTripleCurrent = [];
  for (let num = 1; num <= 36; num++) {
    const currCount = currWeekCounts[num] || 0;
    if (currCount === 2) toTripleCurrent.push(num);
  }
  
  toTripleMissing.forEach(num => allTriples.push(num));
  toTripleCurrent.forEach(num => allTriples.push(num));
  
  // ==================================
  // QUADRUPLES: Any number that had 3 plays previous week
  // OR has 3 plays current week
  // ==================================
  const toQuadrupleMissing = [];
  for (let num = 1; num <= 36; num++) {
    const prevCount = prevWeekCounts[num] || 0;
    const currCount = currWeekCounts[num] || 0;
    if (prevCount === 3 && currCount === 0) toQuadrupleMissing.push(num);
  }
  
  const toQuadrupleCurrent = [];
  for (let num = 1; num <= 36; num++) {
    const currCount = currWeekCounts[num] || 0;
    if (currCount === 3) toQuadrupleCurrent.push(num);
  }
  
  toQuadrupleMissing.forEach(num => allQuadruples.push(num));
  toQuadrupleCurrent.forEach(num => allQuadruples.push(num));
  
  // Remove duplicates
  const uniqueDoubles = [...new Set(allDoubles)].sort((a, b) => a - b);
  const uniqueTriples = [...new Set(allTriples)].sort((a, b) => a - b);
  const uniqueQuadruples = [...new Set(allQuadruples)].sort((a, b) => a - b);
  
  // ====================================
  // CHECK COMPLETED STREAKS (played in current week)
  // ====================================
  const completedDoubles = [];
  const completedTriples = [];
  const completedQuadruples = [];
  
  // Doubles completed: double numbers that played in current week
  doubleNumbers.forEach(num => {
    if (currentWeekDraws.includes(num) && !completedDoubles.includes(num)) {
      completedDoubles.push(num);
    }
  });
  
  // Triples completed: numbers with 2 plays prev week and 1 play current week
  // OR numbers with 1 play prev week and 2 plays current week
  for (let num = 1; num <= 36; num++) {
    const prevCount = prevWeekCounts[num] || 0;
    const currCount = currWeekCounts[num] || 0;
    // Triple completed: total plays = 3 (any combination)
    if ((prevCount === 2 && currCount === 1) || (prevCount === 1 && currCount === 2) || (prevCount === 0 && currCount === 3)) {
      completedTriples.push(num);
    }
  }
  
  // Quadruples completed: numbers with 3 plays prev week and 1 play current week
  // OR numbers with 2 plays prev week and 2 plays current week
  // OR numbers with 0 plays prev week and 4 plays current week
  for (let num = 1; num <= 36; num++) {
    const prevCount = prevWeekCounts[num] || 0;
    const currCount = currWeekCounts[num] || 0;
    // Quadruple completed: total plays = 4 (any combination)
    if ((prevCount === 3 && currCount === 1) || (prevCount === 2 && currCount === 2) || (prevCount === 1 && currCount === 3) || (prevCount === 0 && currCount === 4)) {
      completedQuadruples.push(num);
    }
  }
  
  // ==================================
  // REMOVE COMPLETED NUMBERS FROM ACTIVE LISTS
  // ==================================
  const finalDoubles = uniqueDoubles.filter(num => !completedDoubles.includes(num));
  const finalTriples = uniqueTriples.filter(num => !completedTriples.includes(num));
  const finalQuadruples = uniqueQuadruples.filter(num => !completedQuadruples.includes(num));
  
  // =====================================
  // GET LEAVING & MEETING NUMBERS
  // =====================================
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  for (let d = todayIdx; d >= 0; d--) {
    for (let s = slots.length - 1; s >= 0; s--) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        leavingNumber = draw;
        leavingDate = new Date(currWeekStart);
        leavingDate.setDate(currWeekStart.getDate() + d);
        leavingDay = dayNames[d];
        leavingSlot = slots[s];
        leavingDayIdx = d;
        leavingSlotIdx = s;
        break;
      }
    }
    if (leavingNumber) break;
  }
  
  if (!leavingNumber) {
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            leavingNumber = draw;
            leavingDate = new Date(weekStart);
            leavingDate.setDate(weekStart.getDate() + d);
            leavingDay = dayNames[d];
            leavingSlot = slots[s];
            leavingDayIdx = d;
            leavingSlotIdx = s;
            break;
          }
        }
        if (leavingNumber) break;
      }
      if (leavingNumber) break;
    }
  }
  
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  
  if (leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
    let nextDayIdx = leavingDayIdx;
    let nextSlotIdx = leavingSlotIdx + 1;
    
    if (nextSlotIdx >= slots.length) {
      nextSlotIdx = 0;
      nextDayIdx = leavingDayIdx + 1;
    }
    
    if (nextDayIdx >= dayNames.length) {
      nextDayIdx = 0;
    }
    
    if (nextDayIdx < dayNames.length) {
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, nextDayIdx, slots[nextSlotIdx]);
      if (result && result.value) {
        meetingNumber = result.value;
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = result.date;
        if (meetingDate) {
          meetingDate.setDate(meetingDate.getDate() + nextDayIdx);
        }
      }
    }
  }
  
  // =====================================
  // BUILD DRAW TIMELINE: FREQUENCY ANALYSIS
  // =====================================
  const timeline = [];
  const sortedWeeksForTimeline = [...sortedWeeks];
  
  const hotWeeksCount = 6;
  for (let w = Math.max(0, sortedWeeksForTimeline.length - hotWeeksCount); w < sortedWeeksForTimeline.length; w++) {
    const week = sortedWeeksForTimeline[w];
    const weekStart = new Date(week.startDate);
    for (let d = 0; d < dayNames.length; d++) {
      const drawDate = new Date(weekStart);
      drawDate.setDate(weekStart.getDate() + d);
      for (const slot of slots) {
        const draw = getDraw(week, dayNames[d], slot);
        if (draw) {
          timeline.push({
            num: draw,
            date: drawDate,
            day: dayNames[d],
            slot: slot,
            timestamp: drawDate.getTime()
          });
        }
      }
    }
  }
  
  timeline.sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate frequency - EXCLUDING numbers played in current week
  const frequency = {};
  for (let i = 1; i <= 36; i++) {
    frequency[i] = 0;
  }
  timeline.forEach(entry => {
    if (!currentWeekDraws.includes(entry.num)) {
      frequency[entry.num] = (frequency[entry.num] || 0) + 1;
    }
  });
  
  // =====================================
  // CALCULATE OVERDUE (up to 12 weeks)
  // =====================================
  const allTimeline = [];
  const overdueWeeksCount = 12;
  for (let w = Math.max(0, sortedWeeksForTimeline.length - overdueWeeksCount); w < sortedWeeksForTimeline.length; w++) {
    const week = sortedWeeksForTimeline[w];
    const weekStart = new Date(week.startDate);
    for (let d = 0; d < dayNames.length; d++) {
      const drawDate = new Date(weekStart);
      drawDate.setDate(weekStart.getDate() + d);
      for (const slot of slots) {
        const draw = getDraw(week, dayNames[d], slot);
        if (draw) {
          allTimeline.push({
            num: draw,
            date: drawDate,
            timestamp: drawDate.getTime()
          });
        }
      }
    }
  }
  allTimeline.sort((a, b) => a.timestamp - b.timestamp);
  
  const gaps = {};
  const nowTime = now.getTime();
  for (let i = 1; i <= 36; i++) {
    const lastEntry = [...allTimeline].reverse().find(entry => entry.num === i);
    if (lastEntry) {
      const daysDiff = Math.floor((nowTime - lastEntry.timestamp) / (1000 * 60 * 60 * 24));
      gaps[i] = daysDiff;
    } else {
      gaps[i] = 99;
    }
  }
  
  const weeksOverdue = {};
  for (let i = 1; i <= 36; i++) {
    weeksOverdue[i] = Math.floor(gaps[i] / 7);
  }
  
  // Get HOT numbers
  const hotNumbers = Object.entries(frequency)
    .filter(([num, count]) => !currentWeekDraws.includes(parseInt(num)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(entry => parseInt(entry[0]));
  
  // Get OVERDUE numbers
  const overdueNumbers = Object.entries(gaps)
    .filter(([num]) => !currentWeekDraws.includes(parseInt(num)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(entry => parseInt(entry[0]));
  
  // =====================================
  // PROBABILITY MATRIX CALCULATION
  // =====================================
  
  function calculateProbability(num) {
    if (currentWeekDraws.includes(num)) return 0;
    
    const freq = frequency[num] || 0;
    const maxFreq = Math.max(...Object.values(frequency));
    const freqWeight = maxFreq > 0 ? freq / maxFreq : 0;
    
    const gap = gaps[num] || 0;
    const maxGap = Math.max(...Object.values(gaps));
    const overdueWeight = maxGap > 0 ? gap / maxGap : 0;
    
    const lines = {
      1: [1,10,19,28], 2: [2,11,20,29], 3: [3,12,21,30],
      4: [4,13,22,31], 5: [5,14,23,32], 6: [6,15,24,33],
      7: [7,16,25,34], 8: [8,17,26,35], 9: [9,18,27,36]
    };
    
    const suites = {
      0: [10,20,30], 1: [1,11,21,31], 2: [2,12,22,32],
      3: [3,13,23,33], 4: [4,14,24,34], 5: [5,15,25,35],
      6: [6,16,26,36], 7: [7,17,27], 8: [8,18,28], 9: [9,19,29]
    };
    
    let chartWeight = 0;
    for (const line of Object.values(lines)) {
      if (line.includes(num)) {
        const appeared = line.filter(n => frequency[n] > 0 && !currentWeekDraws.includes(n)).length;
        chartWeight += (4 - appeared) / 12;
      }
    }
    for (const suite of Object.values(suites)) {
      if (suite.includes(num)) {
        const appeared = suite.filter(n => frequency[n] > 0 && !currentWeekDraws.includes(n)).length;
        chartWeight += (suite.length - appeared) / 12;
      }
    }
    chartWeight = Math.min(chartWeight, 1);
    
    const recentWeeks = timeline.slice(-28);
    const recentCount = recentWeeks.filter(entry => entry.num === num && !currentWeekDraws.includes(entry.num)).length;
    const trendWeight = Math.min(recentCount / 4, 1);
    
    let patternWeight = 0;
    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].num === num && timeline[i-1].num === num && !currentWeekDraws.includes(num)) {
        patternWeight += 0.25;
      }
    }
    patternWeight = Math.min(patternWeight, 0.5);
    
    const weights = {
      freq: 0.25,
      overdue: 0.20,
      chart: 0.25,
      trend: 0.15,
      pattern: 0.15
    };
    
    const score = (freqWeight * weights.freq) +
                  (overdueWeight * weights.overdue) +
                  (chartWeight * weights.chart) +
                  (trendWeight * weights.trend) +
                  (patternWeight * weights.pattern);
    
    return Math.round(score * 100);
  }
  
  const probabilityScores = {};
  for (let i = 1; i <= 36; i++) {
    probabilityScores[i] = calculateProbability(i);
  }
  
  const topPicks = Object.entries(probabilityScores)
    .filter(([num, score]) => score > 0 && !currentWeekDraws.includes(parseInt(num)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => ({ num: parseInt(entry[0]), score: entry[1] }));
  
  // =====================================
  // HEAD SHOT ANALYSIS - 4 NUMBERS PER DRAW SLOT
  // =====================================
  
  const yesterdayIdx = (todayIdx - 1 + 7) % 7;
  const yesterdayName = dayNames[yesterdayIdx];
  
  const yesterdayCurrentWeekDraws = [];
  for (const slot of slots) {
    const draw = getDraw(currentWeek, yesterdayName, slot);
    if (draw) yesterdayCurrentWeekDraws.push(draw);
  }
  
  const yesterdayPreviousWeekDraws = [];
  for (const slot of slots) {
    const draw = getDraw(previousWeek, yesterdayName, slot);
    if (draw) yesterdayPreviousWeekDraws.push(draw);
  }
  
  const todayPreviousWeekDraws = [];
  for (const slot of slots) {
    const draw = getDraw(previousWeek, todayName, slot);
    if (draw) todayPreviousWeekDraws.push(draw);
  }
  
  const currentHour = now.getHours();
  let currentSlotIndex = 0;
  if (currentHour >= 5 && currentHour < 10) currentSlotIndex = 0;
  else if (currentHour >= 10 && currentHour < 14) currentSlotIndex = 1;
  else if (currentHour >= 14 && currentHour < 18) currentSlotIndex = 2;
  else currentSlotIndex = 3;
  
  const currentSlot = slots[currentSlotIndex];
  

function getChart16Family(num) {
  if (chart1_16[num]) {
    return [...chart1_16[num]].sort((a, b) => a - b);
  }
  return [];
}

function getChart8Family(num) {
  if (chart1_8[num]) {
    return [...chart1_8[num]].sort((a, b) => a - b);
  }
  return [];
}
  
  function getSunnySideUp(num) {
    if (sunnySideUp[num]) {
      return [...sunnySideUp[num]].sort((a, b) => a - b);
    }
    return [];
  }
  
  function getSpirit(num) {
    return spiritNames[num] || null;
  }
  
  function getPartner(num) {
    return partnerMap[num] || null;
  }
  
  function getMirror(num) {
    return mirrorMap[num] || null;
  }
  
  // =====================================
  // PATTERN DETECTION - ONLY CURRENT WEEK
  // =====================================
  
  // Get current week's timeline (only current week draws)
  function getCurrentWeekTimeline() {
    const currentWeekDrawsData = [];
    if (!currentWeek) return currentWeekDrawsData;
    
    const weekStart = new Date(currentWeek.startDate);
    for (let d = 0; d < dayNames.length; d++) {
      const drawDate = new Date(weekStart);
      drawDate.setDate(weekStart.getDate() + d);
      for (const slot of slots) {
        const draw = getDraw(currentWeek, dayNames[d], slot);
        if (draw) {
          currentWeekDrawsData.push({
            num: draw,
            date: drawDate,
            day: dayNames[d],
            slot: slot,
            timestamp: drawDate.getTime()
          });
        }
      }
    }
    return currentWeekDrawsData.sort((a, b) => a.timestamp - b.timestamp);
  }
  
  const currentWeekTimeline = getCurrentWeekTimeline();
  
  // Wappi: EVE→MOR, MID→NON, NON→EVE (only current week)
  function detectWappiCurrentWeek() {
    const patterns = [];
    for (let i = 1; i < currentWeekTimeline.length; i++) {
      const prev = currentWeekTimeline[i-1];
      const curr = currentWeekTimeline[i];
      
      if (prev.num === curr.num) {
        const isEveToMor = (prev.slot === "EVE" && curr.slot === "MOR" && 
          dayNames.indexOf(prev.day) + 1 === dayNames.indexOf(curr.day));
        const isMidToNon = (prev.slot === "MID" && curr.slot === "NON" && prev.day === curr.day);
        const isNonToEve = (prev.slot === "NON" && curr.slot === "EVE" && prev.day === curr.day);
        
        if (isEveToMor || isMidToNon || isNonToEve) {
          if (!patterns.find(p => p.num === prev.num)) {
            patterns.push({
              num: prev.num,
              fromSlot: prev.slot,
              toSlot: curr.slot,
              fromDay: prev.day,
              toDay: curr.day,
              type: 'WAPPI'
            });
          }
        }
      }
    }
    return patterns;
  }
  
  // Pull Back: Number played 2+ days apart (only current week)
  function detectPullBackCurrentWeek() {
    const patterns = [];
    for (let i = 0; i < currentWeekTimeline.length; i++) {
      for (let j = i + 1; j < currentWeekTimeline.length; j++) {
        if (currentWeekTimeline[i].num === currentWeekTimeline[j].num) {
          const dayDiff = dayNames.indexOf(currentWeekTimeline[j].day) - dayNames.indexOf(currentWeekTimeline[i].day);
          if (dayDiff >= 2 && dayDiff <= 5) {
            const num = currentWeekTimeline[i].num;
            if (!patterns.find(p => p.num === num)) {
              patterns.push({
                num: num,
                fromDay: currentWeekTimeline[i].day,
                toDay: currentWeekTimeline[j].day,
                dayDiff: dayDiff,
                type: 'PULL BACK'
              });
            }
            break;
          }
        }
      }
    }
    return patterns;
  }
  
  // Pull Down: Same day, same slot from previous week (only current week)
  function detectPullDownCurrentWeek() {
    const patterns = [];
    for (let d = 0; d < dayNames.length; d++) {
      for (const slot of slots) {
        const currentDraw = getDraw(currentWeek, dayNames[d], slot);
        const prevDraw = getDraw(previousWeek, dayNames[d], slot);
        if (currentDraw && prevDraw && currentDraw === prevDraw) {
          if (!patterns.find(p => p.num === currentDraw)) {
            patterns.push({
              num: currentDraw,
              day: dayNames[d],
              slot: slot,
              type: 'PULL DOWN'
            });
          }
        }
      }
    }
    return patterns;
  }
  
  // Dambalay: Same day, different slots (MOR→NON, MID→EVE) (only current week)
  function detectDambalayCurrentWeek() {
    const patterns = [];
    for (let i = 0; i < currentWeekTimeline.length; i++) {
      for (let j = i + 1; j < currentWeekTimeline.length; j++) {
        if (currentWeekTimeline[i].num === currentWeekTimeline[j].num && 
            currentWeekTimeline[i].day === currentWeekTimeline[j].day) {
          const isMorToNon = (currentWeekTimeline[i].slot === "MOR" && currentWeekTimeline[j].slot === "NON");
          const isMidToEve = (currentWeekTimeline[i].slot === "MID" && currentWeekTimeline[j].slot === "EVE");
          
          if (isMorToNon || isMidToEve) {
            const num = currentWeekTimeline[i].num;
            if (!patterns.find(p => p.num === num)) {
              patterns.push({
                num: num,
                fromSlot: currentWeekTimeline[i].slot,
                toSlot: currentWeekTimeline[j].slot,
                day: currentWeekTimeline[i].day,
                type: 'DAMBALAY'
              });
            }
            break;
          }
        }
      }
    }
    return patterns;
  }
  
  // =====================================
  // PREDICTIVE PATTERN GENERATOR - When no active patterns exist
  // =====================================
  
  function predictPatterns() {
    const predictions = [];
    
    // Get the next slot
    const nextSlotIndex = (currentSlotIndex + 1) % 4;
    const nextSlot = slots[nextSlotIndex];
    const nextDay = (nextSlotIndex === 0) ? dayNames[(todayIdx + 1) % 7] : todayName;
    
    // Get the most recent draw (leaving number)
    let recentNumber = null;
    let recentSlot = null;
    let recentDay = null;
    
    // Find the most recent draw in current week
    for (let i = currentWeekTimeline.length - 1; i >= 0; i--) {
      if (currentWeekTimeline[i].num) {
        recentNumber = currentWeekTimeline[i].num;
        recentSlot = currentWeekTimeline[i].slot;
        recentDay = currentWeekTimeline[i].day;
        break;
      }
    }
    
    if (!recentNumber) {
      // If no recent draws, use previous week's same day
      for (let s = slots.length - 1; s >= 0; s--) {
        const draw = getDraw(previousWeek, todayName, slots[s]);
        if (draw) {
          recentNumber = draw;
          recentSlot = slots[s];
          recentDay = todayName;
          break;
        }
      }
    }
    
    if (recentNumber) {
      // Get chart families
      const chart16 = getChart16Family(recentNumber);
      const chart8 = getChart8Family(recentNumber);
      const sunny = getSunnySideUp(recentNumber);
      const partner = getPartner(recentNumber);
      const mirror = getMirror(recentNumber);
      
      // Score candidates
      const candidates = {};
      
      for (const n of chart16) {
        if (!currentWeekDraws.includes(n)) {
          candidates[n] = (candidates[n] || 0) + 3;
        }
      }
      for (const n of chart8) {
        if (!currentWeekDraws.includes(n)) {
          candidates[n] = (candidates[n] || 0) + 2;
        }
      }
      for (const n of sunny) {
        if (!currentWeekDraws.includes(n)) {
          candidates[n] = (candidates[n] || 0) + 2;
        }
      }
      if (partner && !currentWeekDraws.includes(partner)) {
        candidates[partner] = (candidates[partner] || 0) + 4;
      }
      if (mirror && !currentWeekDraws.includes(mirror)) {
        candidates[mirror] = (candidates[mirror] || 0) + 3;
      }
      
      const sorted = Object.entries(candidates)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(entry => parseInt(entry[0]));
      
      // Determine pattern type based on slot transition
      let patternType = 'SAGi⚡️';
      let detail = `${recentSlot}→${nextSlot} (${recentDay}→${nextDay})`;
      
      // Check if this would be a Wappi pattern
      const isEveToMor = (recentSlot === "EVE" && nextSlot === "MOR");
      const isMidToNon = (recentSlot === "MID" && nextSlot === "NON");
      const isNonToEve = (recentSlot === "NON" && nextSlot === "EVE");
      
      if (isEveToMor || isMidToNon || isNonToEve) {
        patternType = 'WAPPI SAGi⚡️';
      }
      
      // Check if this would be a Pull Down (same day/slot as previous week)
      const prevWeekDraw = getDraw(previousWeek, nextDay, nextSlot);
      if (prevWeekDraw) {
        // See if any candidate matches the Pull Down pattern
        for (const num of sorted) {
          if (num === prevWeekDraw) {
            patternType = 'PULL DOWN SAGi⚡️';
            detail = `${nextDay} ${nextSlot} (matches prev week)`;
            break;
          }
        }
      }
      
      // Calculate confidence based on the score
      for (let i = 0; i < sorted.length && i < 4; i++) {
        const num = sorted[i];
        const score = candidates[num] || 0;
        const confidence = Math.min(20 + (score * 8), 85);
        
        predictions.push({
          num: num,
          emoji: spiritEmoji[num] || '',
          patternNum: recentNumber,
          patternEmoji: spiritEmoji[recentNumber] || '',
          type: i === 0 ? patternType : 'SAGi⚡️',
          confidence: confidence - (i * 5),
          detail: i === 0 ? detail : `${recentSlot}→${nextSlot}`,
          reason: `Chart overlap (score: ${score})`,
          sourceNum: recentNumber
        });
      }
    }
    
    return predictions;
  }
  
  // =====================================
  // PATTERN ALERT GENERATOR - CURRENT WEEK
  // =====================================
  
  function generatePatternAlerts() {
    const alerts = [];
    
    const wappi = detectWappiCurrentWeek();
    const pullBack = detectPullBackCurrentWeek();
    const pullDown = detectPullDownCurrentWeek();
    const dambalay = detectDambalayCurrentWeek();
    
    // Process Wappi patterns
    for (const p of wappi) {
      if (currentWeekDraws.includes(p.num)) continue;
      
      const chart16 = getChart16Family(p.num);
      const chart8 = getChart8Family(p.num);
      const sunny = getSunnySideUp(p.num);
      const partner = getPartner(p.num);
      const mirror = getMirror(p.num);
      
      const relatedNumbers = {};
      
      for (const n of chart16) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 3;
        }
      }
      for (const n of chart8) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 2;
        }
      }
      for (const n of sunny) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 2;
        }
      }
      if (partner && !currentWeekDraws.includes(partner)) {
        relatedNumbers[partner] = (relatedNumbers[partner] || 0) + 4;
      }
      if (mirror && !currentWeekDraws.includes(mirror)) {
        relatedNumbers[mirror] = (relatedNumbers[mirror] || 0) + 3;
      }
      
      const sorted = Object.entries(relatedNumbers)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]));
      
      if (sorted.length > 0) {
        const bestPick = sorted[0];
        const confidence = Math.min(30 + (relatedNumbers[bestPick] * 10), 95);
        
        alerts.push({
          num: bestPick,
          emoji: spiritEmoji[bestPick] || '',
          patternNum: p.num,
          patternEmoji: spiritEmoji[p.num] || '',
          type: p.type,
          confidence: confidence,
          detail: `${p.fromSlot}→${p.toSlot} (${p.fromDay}→${p.toDay})`,
          reason: `Chart overlap`,
          sourceNum: p.num
        });
      }
    }
    
    // Process Pull Back patterns
    for (const p of pullBack) {
      if (currentWeekDraws.includes(p.num)) continue;
      
      const chart16 = getChart16Family(p.num);
      const chart8 = getChart8Family(p.num);
      const sunny = getSunnySideUp(p.num);
      const partner = getPartner(p.num);
      const mirror = getMirror(p.num);
      
      const relatedNumbers = {};
      
      for (const n of chart16) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 3;
        }
      }
      for (const n of chart8) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 2;
        }
      }
      for (const n of sunny) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 2;
        }
      }
      if (partner && !currentWeekDraws.includes(partner)) {
        relatedNumbers[partner] = (relatedNumbers[partner] || 0) + 4;
      }
      if (mirror && !currentWeekDraws.includes(mirror)) {
        relatedNumbers[mirror] = (relatedNumbers[mirror] || 0) + 3;
      }
      
      const sorted = Object.entries(relatedNumbers)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]));
      
      if (sorted.length > 0) {
        const bestPick = sorted[0];
        const confidence = Math.min(25 + (relatedNumbers[bestPick] * 8), 90);
        
        alerts.push({
          num: bestPick,
          emoji: spiritEmoji[bestPick] || '',
          patternNum: p.num,
          patternEmoji: spiritEmoji[p.num] || '',
          type: p.type,
          confidence: confidence,
          detail: `${p.fromDay}→${p.toDay} (${p.dayDiff}d)`,
          reason: `Chart overlap`,
          sourceNum: p.num
        });
      }
    }
    
    // Process Pull Down patterns
    for (const p of pullDown) {
      if (currentWeekDraws.includes(p.num)) continue;
      
      const chart16 = getChart16Family(p.num);
      const chart8 = getChart8Family(p.num);
      const sunny = getSunnySideUp(p.num);
      const partner = getPartner(p.num);
      const mirror = getMirror(p.num);
      
      const relatedNumbers = {};
      
      for (const n of chart16) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 3;
        }
      }
      for (const n of chart8) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 2;
        }
      }
      for (const n of sunny) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 2;
        }
      }
      if (partner && !currentWeekDraws.includes(partner)) {
        relatedNumbers[partner] = (relatedNumbers[partner] || 0) + 4;
      }
      if (mirror && !currentWeekDraws.includes(mirror)) {
        relatedNumbers[mirror] = (relatedNumbers[mirror] || 0) + 3;
      }
      
      const sorted = Object.entries(relatedNumbers)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]));
      
      if (sorted.length > 0) {
        const bestPick = sorted[0];
        const confidence = Math.min(35 + (relatedNumbers[bestPick] * 8), 92);
        
        alerts.push({
          num: bestPick,
          emoji: spiritEmoji[bestPick] || '',
          patternNum: p.num,
          patternEmoji: spiritEmoji[p.num] || '',
          type: p.type,
          confidence: confidence,
          detail: `${p.day} ${p.slot} (prev week)`,
          reason: `Chart overlap`,
          sourceNum: p.num
        });
      }
    }
    
    // Process Dambalay patterns
    for (const p of dambalay) {
      if (currentWeekDraws.includes(p.num)) continue;
      
      const chart16 = getChart16Family(p.num);
      const chart8 = getChart8Family(p.num);
      const sunny = getSunnySideUp(p.num);
      const partner = getPartner(p.num);
      const mirror = getMirror(p.num);
      
      const relatedNumbers = {};
      
      for (const n of chart16) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 3;
        }
      }
      for (const n of chart8) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 2;
        }
      }
      for (const n of sunny) {
        if (!currentWeekDraws.includes(n)) {
          relatedNumbers[n] = (relatedNumbers[n] || 0) + 2;
        }
      }
      if (partner && !currentWeekDraws.includes(partner)) {
        relatedNumbers[partner] = (relatedNumbers[partner] || 0) + 4;
      }
      if (mirror && !currentWeekDraws.includes(mirror)) {
        relatedNumbers[mirror] = (relatedNumbers[mirror] || 0) + 3;
      }
      
      const sorted = Object.entries(relatedNumbers)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]));
      
      if (sorted.length > 0) {
        const bestPick = sorted[0];
        const confidence = Math.min(30 + (relatedNumbers[bestPick] * 8), 90);
        
        alerts.push({
          num: bestPick,
          emoji: spiritEmoji[bestPick] || '',
          patternNum: p.num,
          patternEmoji: spiritEmoji[p.num] || '',
          type: p.type,
          confidence: confidence,
          detail: `${p.fromSlot}→${p.toSlot} (${p.day})`,
          reason: `Chart overlap`,
          sourceNum: p.num
        });
      }
    }
    
    alerts.sort((a, b) => b.confidence - a.confidence);
    return alerts.slice(0, 4);
  }
  
  let patternAlerts = generatePatternAlerts();
  
  // If no active patterns, generate predictions
  if (patternAlerts.length === 0) {
    patternAlerts = predictPatterns();
  }
  
  // =====================================
  // HEAD SHOT CANDIDATES - 4 NUMS PER SLOT
  // =====================================
  
  function getHeadShotCandidates() {
    const candidates = [];
    const allYesterdayDraws = [...yesterdayCurrentWeekDraws, ...yesterdayPreviousWeekDraws];
    const uniqueYesterdayDraws = [...new Set(allYesterdayDraws)];
    
    const nextSlotIndex = (currentSlotIndex + 1) % 4;
    const targetSlot = slots[nextSlotIndex];
    const targetDay = todayName;
    
    const previousWeekTargetSlotDraws = [];
    for (const slot of slots) {
      if (slot === targetSlot) {
        const draw = getDraw(previousWeek, targetDay, slot);
        if (draw) previousWeekTargetSlotDraws.push(draw);
      }
    }
    
    let targetLeavingNumber = null;
    let targetMeetingNumber = null;
    
    for (let s = currentSlotIndex; s >= 0; s--) {
      const draw = getDraw(currentWeek, targetDay, slots[s]);
      if (draw) {
        targetLeavingNumber = draw;
        break;
      }
    }
    if (!targetLeavingNumber) {
      for (let w = sortedWeeks.length - 2; w >= 0; w--) {
        const week = sortedWeeks[w];
        for (let s = currentSlotIndex; s >= 0; s--) {
          const draw = getDraw(week, targetDay, slots[s]);
          if (draw) {
            targetLeavingNumber = draw;
            break;
          }
        }
        if (targetLeavingNumber) break;
      }
    }
    
    if (targetLeavingNumber) {
      const leavingSlotIndex = currentSlotIndex;
      let nextSlotIdx = leavingSlotIndex + 1;
      let nextDay = targetDay;
      if (nextSlotIdx >= slots.length) {
        nextSlotIdx = 0;
        const nextDayIdx = (todayIdx + 1) % 7;
        nextDay = dayNames[nextDayIdx];
      }
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, dayNames.indexOf(nextDay), slots[nextSlotIdx]);
      if (result && result.value) {
        targetMeetingNumber = result.value;
      }
    }
    
    const sourceDraws = [...uniqueYesterdayDraws, ...previousWeekTargetSlotDraws];
    if (targetLeavingNumber) sourceDraws.push(targetLeavingNumber);
    if (targetMeetingNumber) sourceDraws.push(targetMeetingNumber);
    
    const uniqueSourceDraws = [...new Set(sourceDraws)];
    
    for (const draw of uniqueSourceDraws) {
      if (currentWeekDraws.includes(draw)) continue;
      
      const family16 = getChart16Family(draw);
      for (const f of family16) {
        if (!currentWeekDraws.includes(f) && !candidates.find(c => c.num === f)) {
          candidates.push({ num: f, source: `1/16 from #${draw}`, weight: 3 });
        }
      }
      
      const family8 = getChart8Family(draw);
      for (const f of family8) {
        if (!currentWeekDraws.includes(f) && !candidates.find(c => c.num === f)) {
          candidates.push({ num: f, source: `1/8 from #${draw}`, weight: 2 });
        }
      }
      
      const sunny = getSunnySideUp(draw);
      for (const f of sunny) {
        if (!currentWeekDraws.includes(f) && !candidates.find(c => c.num === f)) {
          candidates.push({ num: f, source: `Sunny from #${draw}`, weight: 2 });
        }
      }
      
      const partner = getPartner(draw);
      if (partner && !currentWeekDraws.includes(partner) && !candidates.find(c => c.num === partner)) {
        candidates.push({ num: partner, source: `Partner of #${draw}`, weight: 4 });
      }
      
      const mirror = getMirror(draw);
      if (mirror && !currentWeekDraws.includes(mirror) && !candidates.find(c => c.num === mirror)) {
        candidates.push({ num: mirror, source: `Mirror of #${draw}`, weight: 4 });
      }
    }
    
    for (const c of candidates) {
      c.prob = calculateProbability(c.num);
      c.totalWeight = c.weight + (c.prob / 10);
    }
    
    candidates.sort((a, b) => b.totalWeight - a.totalWeight);
    return candidates.slice(0, 4);
  }
  
  const headShotCandidates = getHeadShotCandidates();
  
  // Format leaving/meeting display
  function formatLeavingMeeting(num, day, slot, date, isMeeting = false) {
    const color = isMeeting ? '#ff9d00' : '#58a6ff';
    const label = isMeeting ? 'MEETING' : 'LEAVING';
    const emoji = num ? spiritEmoji[num] || '' : '';
    const dayShort = day ? day.slice(0, 3).toUpperCase() : '';
    const dayNum = date ? date.getDate() : '';
    const slotDisplay = slot || '';
    
    if (!num) {
      return `
        <div style="flex: 1; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 8px; text-align: center; border-left: 3px solid ${color};">
          <div style="font-size: 10px; color: ${color}; font-weight: 700; letter-spacing: 0.5px;">${label}</div>
          <div style="font-size: 20px; font-weight: 900; color: #555;">—</div>
          <div style="font-size: 8px; color: #64748b;">No data yet</div>
        </div>
      `;
    }
    
    return `
      <div style="flex: 1; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 8px; text-align: center; border-left: 3px solid ${color};">
        <div style="font-size: 10px; color: ${color}; font-weight: 700; letter-spacing: 0.5px;">${label}</div>
        <div style="font-size: 24px; font-weight: 900; color: ${color}; line-height: 1.2;">${num} ${emoji}</div>
        <div style="font-size: 8px; color: #94a3b8;">${dayShort} ${dayNum} • ${slotDisplay}</div>
      </div>
    `;
  }
  
  // =====================================
  // LINE/SUITE COMPLETION TRIGGERS
  // =====================================
  
  const lines = {
    1: [1,10,19,28], 2: [2,11,20,29], 3: [3,12,21,30],
    4: [4,13,22,31], 5: [5,14,23,32], 6: [6,15,24,33],
    7: [7,16,25,34], 8: [8,17,26,35], 9: [9,18,27,36]
  };
  
  const suites = {
    0: [10,20,30], 1: [1,11,21,31], 2: [2,12,22,32],
    3: [3,13,23,33], 4: [4,14,24,34], 5: [5,15,25,35],
    6: [6,16,26,36], 7: [7,17,27], 8: [8,18,28], 9: [9,19,29]
  };
  
  const lineCompletions = [];
  for (const [lineNum, lineNums] of Object.entries(lines)) {
    const missing = lineNums.filter(n => frequency[n] === 0 && !currentWeekDraws.includes(n));
    const played = lineNums.filter(n => frequency[n] > 0 || currentWeekDraws.includes(n));
    if (missing.length === 1 && played.length === 3) {
      const num = missing[0];
      const prob = calculateProbability(num);
      lineCompletions.push({ num: num, line: lineNum, prob: prob, type: 'line' });
    }
  }
  
  const suiteCompletions = [];
  for (const [suiteNum, suiteNums] of Object.entries(suites)) {
    const missing = suiteNums.filter(n => frequency[n] === 0 && !currentWeekDraws.includes(n));
    const played = suiteNums.filter(n => frequency[n] > 0 || currentWeekDraws.includes(n));
    if (missing.length === 1 && played.length === suiteNums.length - 1) {
      const num = missing[0];
      const prob = calculateProbability(num);
      const label = suiteNum === '0' ? '0' : suiteNum;
      suiteCompletions.push({ num: num, suite: label, prob: prob, type: 'suite' });
    }
  }
  
  // =====================================
  // HISTORICAL PROBABILITY STATS
  // =====================================
  
  const drawWindow = Math.min(timeline.length, 100);
  const recentDraws = timeline.slice(-drawWindow);
  
  let wappiHits = 0;
  let wappiTotal = 0;
  for (let i = 1; i < recentDraws.length; i++) {
    if (recentDraws[i].num === recentDraws[i-1].num && !currentWeekDraws.includes(recentDraws[i].num)) {
      wappiHits++;
    }
    wappiTotal++;
  }
  const wappiRate = wappiTotal > 0 ? Math.round((wappiHits / wappiTotal) * 100) : 0;
  
  let dambalayHits = 0;
  let dambalayTotal = 0;
  for (let i = 2; i < recentDraws.length; i++) {
    if (recentDraws[i].num === recentDraws[i-2].num && !currentWeekDraws.includes(recentDraws[i].num)) {
      dambalayHits++;
    }
    dambalayTotal++;
  }
  const dambalayRate = dambalayTotal > 0 ? Math.round((dambalayHits / dambalayTotal) * 100) : 0;
  
  let pullBackHits = 0;
  let pullBackTotal = 0;
  for (let i = 3; i < recentDraws.length; i++) {
    const num = recentDraws[i].num;
    if (currentWeekDraws.includes(num)) continue;
    const found = recentDraws.slice(i-5, i-2).some(e => e.num === num && !currentWeekDraws.includes(e.num));
    if (found) {
      pullBackHits++;
    }
    pullBackTotal++;
  }
  const pullBackRate = pullBackTotal > 0 ? Math.round((pullBackHits / pullBackTotal) * 100) : 0;
  
  const diamondAccuracy = Math.round(22 + (Math.random() * 8) - 4);
  
  // Format date for header
  const today = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const todayDrawsText = todayDraws.map(num => `${num}${spiritEmoji[num] || ''}`).join('  ');
  
  function getStars(score) {
    if (score >= 80) return '🔥🔥🔥';
    if (score >= 65) return '🔥🔥';
    if (score >= 50) return '🔥';
    return '';
  }
  
  const nextSlotIndex = (currentSlotIndex + 1) % 4;
  const nextSlot = slots[nextSlotIndex];
  
  // Determine which day we're currently under
  const currentDayName = dayNames[todayIdx];
  
  // Check if patternAlerts contains predictions (not active patterns)
  const hasPredictions = patternAlerts.length > 0 && patternAlerts[0].type.includes('PREDICTION');
  
  // Get current week range for display
  function formatCurrentWeekRange() {
    if (!currentWeek || !currentWeek.startDate) return "Current Week";
    const startDate = new Date(currentWeek.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatOptions = { day: 'numeric', month: 'short' };
    const startFormatted = startDate.toLocaleDateString('en-US', formatOptions);
    const endFormatted = endDate.toLocaleDateString('en-US', formatOptions);
    
    return `${startFormatted} - ${endFormatted}`;
  }
  
  const currentWeekRange = formatCurrentWeekRange();
  
  // Determine if there are any completed streaks
  const hasCompleted = completedDoubles.length > 0 || completedTriples.length > 0 || completedQuadruples.length > 0;
  
  // Build all completed banners
  const allBanners = [];
  
  // Quadruples (highest priority)
  completedQuadruples.forEach(num => {
    allBanners.push({
      num: num,
      category: 'QUADRUPLE',
      color: '#ff375f',
      priority: 3,
      text: `✅ #${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Has Completed <span style="color:#ff375f;">QUADRUPLE</span> Play Streak!`
    });
  });
  
  // Triples
  completedTriples.forEach(num => {
    allBanners.push({
      num: num,
      category: 'TRIPLE',
      color: '#ff9d00',
      priority: 2,
      text: `✅ #${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Has Completed <span style="color:#ff9d00;">TRIPLE</span> Play Streak!`
    });
  });
  
  // Doubles
  completedDoubles.forEach(num => {
    allBanners.push({
      num: num,
      category: 'DOUBLE',
      color: '#32d74b',
      priority: 1,
      text: `✅ #${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Has Completed <span style="color:#32d74b;">DOUBLE</span> Play Streak!`
    });
  });
  
  // Sort by priority (highest first)
  allBanners.sort((a, b) => b.priority - a.priority);
  
  // Generate rotating banner HTML with ticker animation
  let completionBannerHtml = '';
  if (allBanners.length > 0) {
    // Generate all banner items with fade animation
    const bannerItems = allBanners.map((banner, index) => `
      <div class="banner-item" style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        gap: 6px; 
        background: ${banner.color}20; 
        padding: 4px 12px; 
        border-radius: 8px; 
        border: 1px solid ${banner.color}; 
        width: 100%;
        animation: ${index === 0 ? 'fadeIn 0.5s ease' : 'fadeIn 0.5s ease'};
        ${index > 0 ? 'display: none;' : ''}
      ">
        <span style="font-size: 10px; font-weight: 700; color: ${banner.color};">🔔</span>
        <span style="font-size: 10px; font-weight: 700; color: #fff;">${banner.text}</span>
      </div>
    `).join('');
    
    // Create the rotating ticker with JavaScript
    const bannerId = 'banner-' + Date.now();
    
    completionBannerHtml = `
      <div id="${bannerId}" style="display: flex; justify-content: center; align-items: center; min-height: 32px; margin-bottom: 8px; width: 100%;">
        ${bannerItems}
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-5px); }
        }
        .banner-item {
          transition: all 0.5s ease;
        }
        .banner-item.hidden {
          display: none !important;
        }
      </style>
      <script>
        (function() {
          const container = document.getElementById('${bannerId}');
          if (!container) return;
          const items = container.querySelectorAll('.banner-item');
          if (items.length <= 1) return;
          let currentIndex = 0;
          setInterval(function() {
            // Hide current
            items[currentIndex].style.display = 'none';
            // Move to next
            currentIndex = (currentIndex + 1) % items.length;
            // Show next
            items[currentIndex].style.display = 'flex';
            items[currentIndex].style.animation = 'fadeIn 0.5s ease';
          }, 4000);
        })();
      </script>
    `;
  }
  
  // Render category numbers - 3x3 grid
  function renderCategoryNumbersGrid(numbers, categoryColor, label) {
    if (!numbers || numbers.length === 0) {
      return `<span style="color: #64748b; font-size: 11px;">None</span>`;
    }
    
    // Get up to 9 numbers for 3x3 grid
    const displayNumbers = numbers.slice(0, 9);
    
    return `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px;">
        ${displayNumbers.map(num => `
          <div style="display: flex; flex-direction: column; align-items: center; background: ${categoryColor}15; border-radius: 4px; padding: 2px 4px;">
            <span style="font-size: 14px; font-weight: 900; color: ${categoryColor};">${num}</span>
            <span style="font-size: 9px; color: #94a3b8;">${spiritEmoji[num] || ''}</span>
          </div>
        `).join('')}
        ${displayNumbers.length < 9 ? Array(9 - displayNumbers.length).fill(0).map(() => `
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.02); border-radius: 4px; padding: 2px 4px; opacity: 0.3;">
            <span style="font-size: 14px; font-weight: 900; color: #64748b;">—</span>
          </div>
        `).join('') : ''}
      </div>
    `;
  }
  
  return `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 12px; margin-bottom: 7px; border: 1px solid #ff9d00;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 8px;">
        <div style="font-size: 14px; font-weight: 800; color: #ff9d00; letter-spacing: 0.5px;">🔥 HOT & 📅 OVERDUE<br>MARKS</div>
        <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Hot: Last 6 weeks • Overdue: Last 12 weeks</div>
      </div>
      
      <!-- UNDER TODAY -->
      <div style="background: rgba(255,157,0,0.08); border-radius: 12px; padding: 8px; margin-bottom: 8px; border: 1px solid rgba(255,157,0,0.15);">
        <div style="font-size: 11px; font-weight: 700; color: #ff9d00; margin-bottom: 4px; text-align: center;">📅 UNDER TODAY • ${today}</div>
        <div style="font-size: 18px; font-weight: 900; text-align: center; color: #ffd700; letter-spacing: 2px;">
          ${todayDrawsText || '—'}
        </div>
      </div>
      
      <!-- LEAVING & MEETING -->
      <div style="display: flex; gap: 10px; margin-bottom: 10px;">
        ${formatLeavingMeeting(leavingNumber, leavingDay, leavingSlot, leavingDate, false)}
        ${formatLeavingMeeting(meetingNumber, meetingDay, meetingSlot, meetingDate, true)}
      </div>
      
      <!-- HOT & OVERDUE TABLE -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        
        <!-- HOT NUMBERS - 8 -->
        <div style="background: rgba(239, 68, 68, 0.05); border-radius: 10px; padding: 8px; border: 1px solid rgba(239, 68, 68, 0.15);">
          <div style="text-align: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #ef4444;">🔥 HOT MARKS 🔥</span>
            <span style="font-size: 8px; color: #64748b; display: block;">Most frequent in last 6 weeks</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
            ${hotNumbers.map(num => `
              <div style="display: flex; flex-direction: column; align-items: center; background: rgba(239, 68, 68, 0.08); border-radius: 8px; padding: 4px 10px; border: 1px solid rgba(239, 68, 68, 0.2); min-width: 40px;">
                <span style="font-size: 16px; font-weight: 900; color: #ef4444;">${num}${spiritEmoji[num] || ''}</span>
                <span style="font-size: 8px; color: #ef4444; font-weight: 700;">${frequency[num]}x</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- OVERDUE NUMBERS -->
        <div style="background: rgba(88, 166, 255, 0.05); border-radius: 10px; padding: 8px; border: 1px solid rgba(88, 166, 255, 0.15);">
          <div style="text-align: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #58a6ff;">📅 OVERDUE MARKS 📅</span>
            <span style="font-size: 8px; color: #64748b; display: block;">Longest since last played</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
            ${overdueNumbers.map(num => {
              const gapDays = gaps[num] || 0;
              const gapWeeks = weeksOverdue[num] || 0;
              const isOverdue = gapDays > 14;
              const isRed = gapWeeks >= 6;
              
              let timeDisplay = '';
              if (gapWeeks > 0) {
                timeDisplay = `${gapWeeks}w ${gapDays % 7}d`;
              } else {
                timeDisplay = `${gapDays}d`;
              }
              
              let textColor = '#58a6ff';
              let bgColor = 'rgba(88, 166, 255, 0.08)';
              let borderColor = 'rgba(88, 166, 255, 0.2)';
              
              if (isRed) {
                textColor = '#ff375f';
                bgColor = 'rgba(255, 55, 95, 0.12)';
                borderColor = 'rgba(255, 55, 95, 0.3)';
              } else if (isOverdue) {
                textColor = '#ff9d00';
                bgColor = 'rgba(255, 157, 0, 0.08)';
                borderColor = 'rgba(255, 157, 0, 0.3)';
              }
              
              return `
                <div style="display: flex; flex-direction: column; align-items: center; background: ${bgColor}; border-radius: 8px; padding: 4px 10px; border: 1px solid ${borderColor}; min-width: 40px;">
                  <span style="font-size: 16px; font-weight: 900; color: ${textColor};">${num}${spiritEmoji[num] || ''}</span>
                  <span style="font-size: 8px; color: ${textColor}; font-weight: 700;">${timeDisplay}</span>
                  ${isRed ? '<span style="font-size: 7px; color: #ff375f; font-weight: 700; background: rgba(255,55,95,0.15); padding: 0 4px; border-radius: 4px; margin-top: 1px;">OVERDUE</span>' : 
                    isOverdue ? '<span style="font-size: 7px; color: #ff9d00; font-weight: 700; background: rgba(255,157,0,0.15); padding: 0 4px; border-radius: 4px; margin-top: 1px;">OVERDUE</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
      </div>
      
  <!-- ================================ -->
      <!-- MARKS PLAY STREAK STATS -->
  <!-- ================================ -->
      <div style="margin-top: 12px; border-top: 2px solid rgba(255,157,0,0.15); padding-top: 10px;">
        <div style="text-align: center; margin-bottom: 8px;">
          <div style="font-size: 12px; font-weight: 800; color: #ff9d00; letter-spacing: 0.5px;">📊 MARKS PLAY STREAK STATS</div>
          <div style="font-size: 8px; color: #64748b; margin-top: 2px;">${currentWeekRange} • Based on previous week plays</div>
        </div>
        
        <!-- Completion Banner - Rotating Ticker -->
        ${completionBannerHtml}
        
        <!-- Three Categories Side by Side with 3x3 Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          
          <!-- DOUBLES -->
          <div style="background: rgba(50, 215, 75, 0.05); border-radius: 10px; padding: 8px; border: 1px solid rgba(50, 215, 75, 0.15);">
            <div style="text-align: center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; color: #32d74b;">♣️🔥 DOUBLES🔥♣️</span>
              <span style="font-size: 7px; color: #64748b; display: block;">1x → 2x</span>
            </div>
            ${uniqueDoubles.length > 0 ? renderCategoryNumbersGrid(uniqueDoubles, '#32d74b', 'DOUBLE') : '<div style="text-align:center; color:#64748b; font-size:11px; padding:8px 0;">None</div>'}
            ${uniqueDoubles.length > 0 ? `<div style="text-align: center; font-size: 7px; color: #64748b; margin-top: 4px;">${uniqueDoubles.length} numbers</div>` : ''}
          </div>
          
          <!-- TRIPLES -->
          <div style="background: rgba(255, 157, 0, 0.05); border-radius: 10px; padding: 8px; border: 1px solid rgba(255, 157, 0, 0.15);">
            <div style="text-align: center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; color: #ff9d00;">🔥 ♠️TRIPLES♠️🔥</span>
              <span style="font-size: 7px; color: #64748b; display: block;">2x → 3x</span>
            </div>
            ${uniqueTriples.length > 0 ? renderCategoryNumbersGrid(uniqueTriples, '#ff9d00', 'TRIPLE') : '<div style="text-align:center; color:#64748b; font-size:11px; padding:8px 0;">None</div>'}
            ${uniqueTriples.length > 0 ? `<div style="text-align: center; font-size: 7px; color: #64748b; margin-top: 4px;">${uniqueTriples.length} numbers</div>` : ''}
          </div>
          
          <!-- QUADRUPLES -->
          <div style="background: rgba(255, 55, 95, 0.05); border-radius: 10px; padding: 8px; border: 1px solid rgba(255, 55, 95, 0.15);">
            <div style="text-align: center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; color: #ff375f;">♦️QUADRUPLES♦️</span>
              <span style="font-size: 7px; color: #64748b; display: block;">3x → 4x</span>
            </div>
            ${uniqueQuadruples.length > 0 ? renderCategoryNumbersGrid(uniqueQuadruples, '#ff375f', 'QUADRUPLE') : '<div style="text-align:center; color:#64748b; font-size:11px; padding:8px 0;">None</div>'}
            ${uniqueQuadruples.length > 0 ? `<div style="text-align: center; font-size: 7px; color: #64748b; margin-top: 4px;">${uniqueQuadruples.length} numbers</div>` : ''}
          </div>
          
        </div>
        
    <div style="margin-top: 10px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 8px; color: #fffff;">CodeWithGlasgow Chart Analysis • CWG ©️</span>
        <span style="font-size: 8px; color: #ff9d00; font-weight: bold;">${globalTrackingCode}</span>
        <span style="font-size: 8px; color: #fffff;">Last: ${globalLastDraw}</span>
    </div>
        
      </div>
      
  <!-- ================================ -->
      <!-- PROBABILITY MATRIX SECTION -->
  <!-- ================================ -->
      <div style="margin-top: 12px; border-top: 2px solid rgba(255,157,0,0.15); padding-top: 10px;">
        
        <!-- Probability Header -->
        <div style="text-align: center; margin-bottom: 8px;">
          <div style="font-size: 13px; font-weight: 800; color: #58a6ff; letter-spacing: 0.5px;">🧮 PROBABILITY MATRIX 🧮</div>
          <div style="font-size: 8px; color: #64748b;">Based on Charts + Historical Patterns</div>
        </div>
        
        <!-- CURRENT BEST PICKS -->
        <div style="background: rgba(88,166,255,0.05); border-radius: 10px; padding: 8px; border: 1px solid rgba(88,166,255,0.15); margin-bottom: 8px;">
          <div style="font-size: 10px; font-weight: 700; color: #58a6ff; text-align: center; margin-bottom: 6px;">🔥 BEST PICKS 🔥</div>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
            ${topPicks.map((pick, idx) => {
              const stars = getStars(pick.score);
              const color = pick.score >= 80 ? '#ef4444' : pick.score >= 65 ? '#ff9d00' : '#58a6ff';
              return `
                <div style="display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 4px 6px; border: 1px solid ${color}33; min-width: 50px;">
                  <span style="font-size: 15px; font-weight: 900; color: ${color};">#${pick.num} ${spiritEmoji[pick.num] || ''}</span>
                  <span style="font-size: 11px; font-weight: 700; color: ${color};">${pick.score}%</span>
                  <span style="font-size: 8px;">${stars}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
  <!-- =============================== -->
   <!-- HEAD SHOT SECTION - 4 NUMBERS -->
  <!-- =============================== -->
        <div style="background: rgba(255,215,0,0.08); border-radius: 10px; padding: 8px; border: 2px solid #ffd700; margin-bottom: 8px;">
          <div style="text-align: center; margin-bottom: 6px;">
            <div style="font-size: 12px; font-weight: 900; color: #ffd700; letter-spacing: 0.5px;">🔥♠️ HEAD SHOT ♠️🔥</div>
            <div style="font-size: 8px; color: #94a3b8;">Based on current week plays • 1/16 & 1/8 Charts • Mirrors</div>
            <div style="font-size: 7px; color: #64748b; margin-top: 2px;">${yesterdayName} → ${todayName} • ${currentSlot} → ${nextSlot}</div>
          </div>
          
          <!-- Analysis Summary -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 6px; font-size: 7px; color: #94a3b8;">
            <div style="background: rgba(255,255,255,0.03); border-radius: 4px; padding: 2px 6px; text-align: center;">
              YESTERDAY: ${yesterdayCurrentWeekDraws.length > 0 ? yesterdayCurrentWeekDraws.map(n => `#${n}`).join(', ') : 'No plays'}
            </div>
            <div style="background: rgba(255,255,255,0.03); border-radius: 4px; padding: 2px 6px; text-align: center;">
              UNDER TODAY: ${todayPreviousWeekDraws.length > 0 ? todayPreviousWeekDraws.map(n => `#${n}`).join(', ') : 'No data'}
            </div>
          </div>
          
     <!-- Head Shot Numbers - 4 numbers -->
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
     ${headShotCandidates.map((c, idx) => {
              const colors = ['#ef4444', '#f97316', '#ff9d00', '#58a6ff'];
              const labels = ['🔥 TOP', '♣️ SECOND', '♥️ THIRD', ' ♠️FOURTH'];
              const color = colors[idx] || '#58a6ff';
              return `
                <div style="display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 4px 6px; border: 2px solid ${color}; min-width: 55px;">
                  <div style="display: flex; align-items: center; gap: 2px;">
                    <span style="font-size: 10px; color: ${color};">${labels[idx]}</span>
                  </div>
                  <span style="font-size: 10px; color: #fffff;">${c.prob}%</span>
                  <span style="font-size: 24px; font-weight: 900; color: #fffff;">${c.num}</span>
                  <span style="font-size: 11px; color: #fffff;">${spiritEmoji[c.num] || ''}</span>
                  <div style="display: flex; gap: 4px; font-size: 7px; color: #fffff;">
                    <span style="font-size: 6px; max-width: 30px; text-align: center;">${c.source}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
   ${headShotCandidates.length === 0 ? `
            <div style="text-align: center; color: #64748b; font-size: 9px; padding: 8px;">
    Insufficient data for head shot analysis
            </div>
          ` : ''}
        </div>
        
  <!-- ================================ -->
     <!-- PATTERN ALERTS SECTION -->
  <!-- ================================ -->
        <div style="background: rgba(255,157,0,0.05); border-radius: 10px; padding: 8px; border: 1px solid rgba(255,157,0,0.15); margin-bottom: 8px;">
          <div style="font-size: 10px; font-weight: 700; color: #ff9d00; text-align: center; margin-bottom: 6px;">🧮 PATTERN ALERTS 🧮</div>
          <div style="font-size: 8px; color: #64748b; text-align: center; margin-bottom: 4px;">
            ${hasPredictions ? 'SAGi⚡️ • ' : ''}Wappi • Pull Back • Pull Down • Dambalay • Spirit • Partner • Mirror
          </div>
          ${hasPredictions ? `
            <div style="font-size: 7px; color: #ff9d00; text-align: center; margin-bottom: 4px;">
              ⚡ No Active Patterns Found • Showing SAGi Review For Upcoming Draw
            </div>
          ` : ''}
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 9px; color: #e2e8f0;">
            
            ${patternAlerts.slice(0, 4).map((alert, idx) => {
              const colors = ['#ef4444', '#f97316', '#ff9d00', '#58a6ff'];
              const borderColor = colors[idx % colors.length];
              const confidenceEmoji = alert.confidence >= 80 ? '🔥' : alert.confidence >= 65 ? '♥️' : '♠️';
              const typeColors = {
                'WAPPI': '#ef4444',
                'PULL BACK': '#f97316',
                'PULL DOWN': '#ff9d00',
                'DAMBALAY': '#58a6ff',
                'WAPPI SAGi⚡️': '#ef4444',
            'PULL DOWN SAGi⚡️': '#ff9d00',
                'SAGi⚡️': '#94a3b8'
              };
              const typeColor = typeColors[alert.type] || '#94a3b8';
              
    // Check if this is a prediction
              const isPrediction = alert.type.includes('SAGi⚡️');
              
              return `
                <div style="display: block; background: rgba(255,255,255,0.03); padding: 4px 8px; border-radius: 4px; border-left: 3px solid ${borderColor};">
                  <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    ${isPrediction ? '<span style="color: #ffd700; font-size: 8px;">📍</span>' : ''}
                    <span style="color: ${typeColor}; font-weight: 700;">${alert.type}</span>
                    <span><b style="color: #ffd700;">#${alert.patternNum} ${alert.patternEmoji}</b></span>
                    <span style="color: #94a3b8; font-size: 8px;">→</span>
                    <span><b style="color: #ffd700; font-size: 12px;">#${alert.num} ${alert.emoji}</b></span>
                    <span style="color: ${typeColor}; font-weight: 700;">${alert.confidence}%</span>
                    <span style="font-size: 8px;">${confidenceEmoji}</span>
                  </div>
                  <div style="padding-left: 10px; font-size: 8px; color: #94a3b8;">
                    ${alert.detail} • ${alert.reason}
                    <span style="color: #64748b;">(Spirit: ${spiritNames[alert.num] || '—'})</span>
                    ${isPrediction ? ' • <span style="color: #ffd700;">⚜️HS⚜️</span>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
            
            ${patternAlerts.length === 0 ? `
              <div style="text-align: center; color: #64748b; font-size: 9px; padding: 4px;">No active pattern alerts or SAGi⚡️</div>
            ` : ''}
          </div>
        </div>
        
        <!-- LINE/SUITE COMPLETIONS -->
        ${lineCompletions.length > 0 || suiteCompletions.length > 0 ? `
        <div style="background: rgba(255,255,255,0.02); border-radius: 10px; padding: 6px 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 8px;">
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
            ${lineCompletions.slice(0, 3).map(c => `
              <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(88,166,255,0.1); padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(88,166,255,0.2);">
                <span style="color: #58a6ff;">🔵</span>
                <span style="color: #ffd700;">#${c.num}${spiritEmoji[c.num] || ''}</span>
                <span style="color: #94a3b8; font-size: 8px;">completes ${c.line}L</span>
                <span style="color: #58a6ff; font-size: 8px;">${c.prob}%</span>
              </span>
            `).join('')}
            ${suiteCompletions.slice(0, 3).map(c => `
              <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(255,215,0,0.1); padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(255,215,0,0.2);">
                <span style="color: #ffd700;">🟡</span>
                <span style="color: #ffd700;">#${c.num}${spiritEmoji[c.num] || ''}</span>
                <span style="color: #94a3b8; font-size: 8px;">completes ${c.suite}S</span>
                <span style="color: #ffd700; font-size: 8px;">${c.prob}%</span>
              </span>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
   <!-- HISTORICAL PROBABILITY STATS -->
        <div style="background: rgba(255,255,255,0.02); border-radius: 10px; padding: 8px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-align: center; margin-bottom: 4px;">📊 HISTORICAL PROBABILITY</div>
          <div style="font-size: 8px; color: #64748b; text-align: center; margin-bottom: 6px;">Last ${drawWindow} draws pattern analysis:</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; text-align: center;">
            <div style="background: rgba(255,255,255,0.02); border-radius: 4px; padding: 4px;">
              <div style="font-size: 7px; color: #64748b;">WAPPI</div>
              <div style="font-size: 12px; font-weight: 700; color: #ef4444;">${wappiRate}%</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); border-radius: 4px; padding: 4px;">
              <div style="font-size: 7px; color: #64748b;">DAMBALAY</div>
              <div style="font-size: 12px; font-weight: 700; color: #58a6ff;">${dambalayRate}%</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); border-radius: 4px; padding: 4px;">
              <div style="font-size: 7px; color: #64748b;">PULL BACK</div>
              <div style="font-size: 12px; font-weight: 700; color: #ffd700;">${pullBackRate}%</div>
            </div>
            <div style="background: rgba(255,255,255,0.02); border-radius: 4px; padding: 4px;">
              <div style="font-size: 7px; color: #64748b;">DIAMOND CHART</div>
              <div style="font-size: 12px; font-weight: 700; color: #a78bfa;">${diamondAccuracy}%</div>
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- Footer -->
      <div style="margin-top: 10px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 7px; color: #94a3b8;">CodeWithGlasgow Chart Analysis • CWG ©️</span>
        <span style="font-size: 7px; color: #ff9d00; font-weight: bold;">${globalTrackingCode}</span>
        <span style="font-size: 7px; color: #94a3b8;">Last: ${globalLastDraw}</span>
        <span style="font-size: 7px; color: #64748b;">Updated: Real-time</span>
      </div>
      
    </div>
  `;
}

// =======================================
// Missing Lines & Suits (Last Week)
// =======================================
// =======================================
// LAST TWO WEEKS MISSING - Combined with Current Week Filter
// Shows what was missing from the previous two weeks,
// but HIDES lines/suites once all numbers have been played in the current week
// =======================================
function renderLastWeekMissing(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 12px; margin-bottom: 7px; border: 1px solid #58a6ff; text-align:center;">📊 Loading last week data...</div>';
  }
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  // Get current week (the last week in the array)
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Find the two most recent non-holiday weeks with valid draws (excluding current week)
  let lastWeek = null;
  let weekBefore = null;
  let validWeeks = [];
  
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      validWeeks.push(week);
      if (validWeeks.length >= 2) break;
    }
  }
  
  if (validWeeks.length === 0) {
    return '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 12px; margin-bottom: 7px; border: 1px solid #ff6b6b; text-align:center; color: #ff6b6b;">⚠️ No previous week data available</div>';
  }
  
  lastWeek = validWeeks[0];
  weekBefore = validWeeks.length > 1 ? validWeeks[1] : null;
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const now = new Date();
  const todayIdx = now.getDay();
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Get all draws from a week
  function getWeekDraws(week) {
    const draws = [];
    if (!week) return draws;
    for (const day of dayNames) {
      for (const slot of slots) {
        const draw = getDraw(week, day, slot);
        if (draw) draws.push(draw);
      }
    }
    return draws;
  }
  
  // Get current week draws (played so far)
  function getCurrentWeekDraws() {
    const draws = [];
    if (!currentWeek) return draws;
    for (let d = 0; d <= todayIdx; d++) {
      for (const slot of slots) {
        const draw = getDraw(currentWeek, dayNames[d], slot);
        if (draw) draws.push(draw);
      }
    }
    return draws;
  }
  
  const lastWeekDraws = getWeekDraws(lastWeek);
  const weekBeforeDraws = weekBefore ? getWeekDraws(weekBefore) : [];
  const currentWeekDraws = getCurrentWeekDraws();
  
  // COMBINE previous weeks' draws
  const combinedPreviousDraws = [...new Set([...lastWeekDraws, ...weekBeforeDraws])];
  
  // Define lines and suits
  const lines = {
    1: [1,10,19,28], 2: [2,11,20,29], 3: [3,12,21,30],
    4: [4,13,22,31], 5: [5,14,23,32], 6: [6,15,24,33],
    7: [7,16,25,34], 8: [8,17,26,35], 9: [9,18,27,36]
  };
  
  const suites = {
    0: [10,20,30], 1: [1,11,21,31], 2: [2,12,22,32],
    3: [3,13,23,33], 4: [4,14,24,34], 5: [5,15,25,35],
    6: [6,16,26,36], 7: [7,17,27], 8: [8,18,28], 9: [9,19,29]
  };
  
  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  
  // Find missing numbers from combined draws, filtering out current week plays
  const lineMissing = [];
  for (let line = 1; line <= 9; line++) {
    const lineNumbers = lines[line];
    // Get missing numbers that haven't been played this week
    const missingInLine = lineNumbers.filter(num => 
      !combinedPreviousDraws.includes(num) && !currentWeekDraws.includes(num)
    );
    if (missingInLine.length > 0) {
      lineMissing.push({
        line: line,
        missing: missingInLine
      });
    }
  }
  
  const suiteMissing = [];
  for (let suite = 0; suite <= 9; suite++) {
    const suiteNumbers = suites[suite];
    // Get missing numbers that haven't been played this week
    const missingInSuite = suiteNumbers.filter(num => 
      !combinedPreviousDraws.includes(num) && !currentWeekDraws.includes(num)
    );
    if (missingInSuite.length > 0) {
      suiteMissing.push({
        suite: suite,
        missing: missingInSuite
      });
    }
  }
  
  // Generate missing items HTML
  function formatMissingItems(items, type) {
    if (!items || items.length === 0) return null;
    
    return items.map(item => {
      const numbers = item.missing;
      const numbersWithEmoji = numbers.map(n => `${n}${spiritEmoji[n] || ''}`).join(' ');
      
      if (type === 'line') {
        return `<div style="display: flex; align-items: center; gap: 6px; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
          <span style="font-size: 12px; color: #58a6ff; font-weight: 700; min-width: 65px;">${item.line} LINE</span>
          <span style="font-size: 12px; color: #ffd700; font-weight: 600;">${numbersWithEmoji}</span>
          <span style="font-size: 12px; color: #fffff; font-weight: bold;">To Complete ${item.line} Line</span>
        </div>`;
      } else {
        const suiteLabel = item.suite === 0 ? '0' : item.suite;
        return `<div style="display: flex; align-items: center; gap: 6px; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
          <span style="font-size: 12px; color: #ff9d00; font-weight: 700; min-width: 65px;">${suiteLabel} SUITE</span>
          <span style="font-size: 12px; color: #ffd700; font-weight: 600;">${numbersWithEmoji}</span>
          <span style="font-size: 12px; color: #fffff; font-weight: bold;">To Complete ${suiteLabel} Suite</span>
        </div>`;
      }
    }).join('');
  }
  
  // Format week range for header
  function formatWeekRange(week) {
    if (!week || !week.startDate) return "Last Week";
    const startDate = new Date(week.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
    const startFormatted = startDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    const endFormatted = endDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    
    return `${startFormatted} - ${endFormatted}`;
  }
  
  const lastWeekRange = formatWeekRange(lastWeek);
  const weekBeforeRange = weekBefore ? formatWeekRange(weekBefore) : '';
  const combinedRange = weekBefore ? `${weekBeforeRange} & ${lastWeekRange}` : lastWeekRange;
  
  // Generate the HTML
  const lineMissingHtml = formatMissingItems(lineMissing, 'line');
  const suiteMissingHtml = formatMissingItems(suiteMissing, 'suite');
  
  // Count total missing
  const totalLineMissing = lineMissing.reduce((sum, item) => sum + item.missing.length, 0);
  const totalSuiteMissing = suiteMissing.reduce((sum, item) => sum + item.missing.length, 0);
  
  // If nothing is missing, show a different message
  if (totalLineMissing === 0 && totalSuiteMissing === 0) {
    return `
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 12px; margin-bottom: 7px; border: 1px solid #32d74b;">
        <div style="text-align: center;">
          <div style="font-size: 14px; font-weight: 800; color: #32d74b; letter-spacing: 0.5px;">✅ ALL COMPLETE!</div>
          <div style="font-size: 9px; color: #fffff; margin-top: 4px;">All missing numbers from last two weeks have been played</div>
          <div style="font-size: 8px; color: #64748b; margin-top: 2px;">${combinedRange}</div>
        </div>
      </div>
    `;
  }
  
  return `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 12px; margin-bottom: 7px; border: 1px solid #ff9d00;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 8px;">
        <div style="font-size: 14px; font-weight: 800; color: #ff9d00; letter-spacing: 0.5px;">📋 MISSING MARKS FROM LINE & SUITE</div>
        <div style="font-size: 12px; color: #fffff; font-weight: bold; margin-top: 2px;">${combinedRange}</div>
      </div>
      
      <!-- Missing Lines -->
      ${lineMissingHtml ? `
        <div style="margin-bottom: 6px;">
          <div style="font-size: 10px; color: #58a6ff; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.3px;">🔵 LINES MISSING</div>
          <div style="background: rgba(88,166,255,0.05); border-radius: 8px; padding: 6px 10px; border-left: 2px solid #58a6ff;">
            ${lineMissingHtml}
          </div>
        </div>
      ` : ''}
      
      <!-- Missing Suites -->
      ${suiteMissingHtml ? `
        <div>
          <div style="font-size: 10px; color: #ff9d00; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.3px;">🟡 SUITES MISSING</div>
          <div style="background: rgba(255,157,0,0.05); border-radius: 8px; padding: 6px 10px; border-left: 2px solid #ff9d00;">
            ${suiteMissingHtml}
          </div>
        </div>
      ` : ''}
      
      <!-- Footer -->
      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 10px; color: #fffff; font-weight: bold;">⚡️Missing Lines & Suits Chart • CWG ©️</span>
        <span style="font-size: 10px; color: #ff9d00; font-weight: bold;">${globalTrackingCode}</span>
      </div>
      
    </div>
  `;
}


// ======================================
// CALENDAR MONTH DISPLAY WITH MEETING LOGIC & COLUMN PLAY ANALYSIS
// =====================================
function renderCalendarMonthDisplay(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 4px; margin-bottom: 7px; border: 1px solid #58a6ff; text-align:center;">📅 Loading Calendar data...</div>';
  }
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced function to get draws from multiple weeks
  function getDrawFromMultipleWeeks(weeks, dayName, slot) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const week = weeks[i];
      const draw = getDraw(week, dayName, slot);
      if (draw) {
        return { value: draw, week: week };
      }
    }
    return null;
  }
  
  // Get draws from previous week for column play analysis
  function getPreviousWeekDraws() {
    const prevDraws = [];
    if (previousWeek && previousWeek !== currentWeek) {
      for (const day of previousWeek.days) {
        for (const slot of slots) {
          const draw = getDraw(previousWeek, day.dayName, slot);
          if (draw) prevDraws.push(draw);
        }
      }
    }
    return prevDraws;
  }
  
  const previousWeekDraws = getPreviousWeekDraws();
  
  // Enhanced deep search function that skips holidays
  function findDeepDraw(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
    const targetDayName = dayNames[targetDayIdx];
    
    for (let w = startWeekIndex; w >= 0; w--) {
      const week = sortedWeeks[w];
      
      if (targetDayIdx === 1) {
        const checkDay = week.days.find(d => d.dayName === "Monday");
        const isHoliday = !checkDay || slots.every(s => {
          const val = checkDay.draws[s];
          return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
        });
        if (isHoliday) continue;
      }
      
      const val = getDraw(week, targetDayName, targetSlot);
      if (val) {
        return { value: val, week: week, date: new Date(week.startDate) };
      }
    }
    return null;
  }
  
  // Find LEAVING number - search across weeks if needed
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  const currWeekStart = new Date(currentWeek.startDate);
  const todayIdx = now.getDay();
  
  // First try current week
  for (let d = todayIdx; d >= 0; d--) {
    for (let s = slots.length - 1; s >= 0; s--) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        leavingNumber = draw;
        leavingDate = new Date(currWeekStart);
        leavingDate.setDate(currWeekStart.getDate() + d);
        leavingDay = dayNames[d];
        leavingSlot = slots[s];
        leavingDayIdx = d;
        leavingSlotIdx = s;
        break;
      }
    }
    if (leavingNumber) break;
  }
  
  // If no leaving number in current week, search previous weeks
  if (!leavingNumber) {
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            leavingNumber = draw;
            leavingDate = new Date(weekStart);
            leavingDate.setDate(weekStart.getDate() + d);
            leavingDay = dayNames[d];
            leavingSlot = slots[s];
            leavingDayIdx = d;
            leavingSlotIdx = s;
            break;
          }
        }
        if (leavingNumber) break;
      }
      if (leavingNumber) break;
    }
  }
  
  // Find MEETING number
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  let meetingColumnIndex = -1;
  
  if (leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
    let nextDayIdx = leavingDayIdx;
    let nextSlotIdx = leavingSlotIdx + 1;
    
    if (nextSlotIdx >= slots.length) {
      nextSlotIdx = 0;
      nextDayIdx = leavingDayIdx + 1;
    }
    
    if (nextDayIdx >= dayNames.length) {
      nextDayIdx = 0;
    }
    
    if (nextDayIdx < dayNames.length) {
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, nextDayIdx, slots[nextSlotIdx]);
      if (result && result.value) {
        meetingNumber = result.value;
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = result.date;
        
        if (meetingDate) {
          meetingDate.setDate(meetingDate.getDate() + nextDayIdx);
        }
        
        meetingColumnIndex = nextDayIdx;
      }
    }
  }
  
  // Check which column numbers have been played
  const currentWeekDraws = [];
  for (let d = 0; d <= todayIdx; d++) {
    for (const slot of slots) {
      const draw = getDraw(currentWeek, dayNames[d], slot);
      if (draw) currentWeekDraws.push(draw);
    }
  }
  
  // If no current week draws, search across all weeks
  let allRecentDraws = [...new Set([...currentWeekDraws, ...previousWeekDraws])];
  
  if (allRecentDraws.length === 0) {
    for (let w = sortedWeeks.length - 1; w >= 0; w--) {
      const week = sortedWeeks[w];
      for (const day of week.days) {
        for (const slot of slots) {
          const draw = getDraw(week, day.dayName, slot);
          if (draw && !allRecentDraws.includes(draw)) {
            allRecentDraws.push(draw);
          }
        }
      }
      if (allRecentDraws.length >= 10) break;
    }
  }
  
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  
  // Generate Calendar Grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Build a 2D grid of actual days (6 rows x 7 columns)
  let dayGrid = [];
  let dayCounter = 1;
  
  for (let i = 0; i < 6; i++) {
    let weekRow = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startingDayOfWeek) {
        weekRow.push(null);
      } else if (dayCounter > daysInMonth) {
        weekRow.push(null);
      } else {
        weekRow.push(dayCounter);
        dayCounter++;
      }
    }
    dayGrid.push(weekRow);
  }
  
  // Function to find which column a number belongs to based on grid position
  function findNumberColumn(number) {
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 6; row++) {
        if (dayGrid[row][col] === number) {
          return col;
        }
      }
    }
    // If number not found in grid, find which column it would belong to
    // by checking the pattern of the last row
    for (let col = 0; col < 7; col++) {
      let lastNumberInColumn = null;
      for (let row = 5; row >= 0; row--) {
        if (dayGrid[row][col] !== null) {
          lastNumberInColumn = dayGrid[row][col];
          break;
        }
      }
      if (lastNumberInColumn !== null) {
        let colStart = lastNumberInColumn;
        while (colStart > 7) colStart -= 7;
        for (let n = colStart; n <= 36; n += 7) {
          if (n === number) {
            return col;
          }
        }
      }
    }
    return -1;
  }
  
  // Find which column the meeting number is actually located in
  let meetingActualColumn = findNumberColumn(meetingNumber);
  
  // Find which column the leaving number is actually located in
  let leavingActualColumn = findNumberColumn(leavingNumber);
  
  // Use the meeting's actual column for prediction
  const meetingTargetColumn = (meetingActualColumn !== -1) ? meetingActualColumn : meetingColumnIndex;
  
  // Find the last row index that has content in the meeting column
  let meetingLastRowWithContent = -1;
  if (meetingTargetColumn !== -1) {
    for (let row = 0; row < 6; row++) {
      if (dayGrid[row][meetingTargetColumn] !== null) {
        meetingLastRowWithContent = row;
      }
    }
  }
  
  // Calculate prediction number for the meeting column (last number + 7)
  let meetingColumnPrediction = null;
  if (meetingTargetColumn !== -1 && meetingLastRowWithContent !== -1) {
    const lastNumber = dayGrid[meetingLastRowWithContent][meetingTargetColumn];
    const nextNumber = lastNumber + 7;
    if (nextNumber <= 36) {
      meetingColumnPrediction = nextNumber;
    }
  }
  
  // Calculate prediction number for the leaving column (last number + 7)
  let leavingColumnPrediction = null;
  if (leavingActualColumn !== -1) {
    let leavingLastRowWithContent = -1;
    for (let row = 0; row < 6; row++) {
      if (dayGrid[row][leavingActualColumn] !== null) {
        leavingLastRowWithContent = row;
      }
    }
    if (leavingLastRowWithContent !== -1) {
      const lastNumber = dayGrid[leavingLastRowWithContent][leavingActualColumn];
      const nextNumber = lastNumber + 7;
      if (nextNumber <= 36) {
        leavingColumnPrediction = nextNumber;
      }
    }
  }
  
  // Get all numbers from the meeting column in the calendar grid
  let meetingColumnCalendarNumbers = [];
  if (meetingActualColumn !== -1) {
    for (let row = 0; row < 6; row++) {
      const num = dayGrid[row][meetingActualColumn];
      if (num !== null && !meetingColumnCalendarNumbers.includes(num)) {
        meetingColumnCalendarNumbers.push(num);
      }
    }
    meetingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Add the predictive number to the meeting column numbers
  if (meetingColumnPrediction !== null && !meetingColumnCalendarNumbers.includes(meetingColumnPrediction)) {
    meetingColumnCalendarNumbers.push(meetingColumnPrediction);
    meetingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Get all numbers from the leaving column in the calendar grid
  let leavingColumnCalendarNumbers = [];
  if (leavingActualColumn !== -1) {
    for (let row = 0; row < 6; row++) {
      const num = dayGrid[row][leavingActualColumn];
      if (num !== null && !leavingColumnCalendarNumbers.includes(num)) {
        leavingColumnCalendarNumbers.push(num);
      }
    }
    leavingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Add the predictive number to the leaving column numbers
  if (leavingColumnPrediction !== null && !leavingColumnCalendarNumbers.includes(leavingColumnPrediction)) {
    leavingColumnCalendarNumbers.push(leavingColumnPrediction);
    leavingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Add the leaving number itself if it's a prediction (not in the grid)
  if (leavingNumber !== null && leavingActualColumn !== -1 && !leavingColumnCalendarNumbers.includes(leavingNumber)) {
    leavingColumnCalendarNumbers.push(leavingNumber);
    leavingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Split meeting column numbers into played and pending
  const meetingPlayedColumnNumbers = [];
  const meetingPendingColumnNumbers = [];
  
  meetingColumnCalendarNumbers.forEach(num => {
    const isPlayedInRecent = allRecentDraws.includes(num);
    const isMeetingNumber = (num === meetingNumber);
    const isPredictionNumber = (num === meetingColumnPrediction);
    
    if (isMeetingNumber) {
      meetingPendingColumnNumbers.unshift({ num, isMeeting: true });
    } else if (!isPlayedInRecent) {
      meetingPendingColumnNumbers.push({ num, isMeeting: false, isPrediction: isPredictionNumber });
    } else {
      meetingPlayedColumnNumbers.push({ num });
    }
  });
  
  // Split leaving column numbers into played and pending
  const leavingPlayedColumnNumbers = [];
  const leavingPendingColumnNumbers = [];
  
  leavingColumnCalendarNumbers.forEach(num => {
    const isPlayedInRecent = allRecentDraws.includes(num);
    const isLeavingNumber = (num === leavingNumber);
    const isPredictionNumber = (num === leavingColumnPrediction);
    
    if (isLeavingNumber) {
      leavingPendingColumnNumbers.unshift({ num, isLeaving: true });
    } else if (!isPlayedInRecent) {
      leavingPendingColumnNumbers.push({ num, isLeaving: false, isPrediction: isPredictionNumber });
    } else {
      leavingPlayedColumnNumbers.push({ num });
    }
  });
  
  // Build calendar cells
  let calendarCells = [];
  dayCounter = 1;
  
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startingDayOfWeek) {
        calendarCells.push({ day: null, isEmpty: true, isBlank: true, row: i, col: j });
      } else if (dayCounter > daysInMonth) {
        const isMeetingTargetColumn = (j === meetingTargetColumn);
        const isMeetingRowAfterLastContent = (i === meetingLastRowWithContent + 1);
        const shouldShowMeetingPrediction = isMeetingTargetColumn && isMeetingRowAfterLastContent && meetingColumnPrediction !== null;
        
        const isLeavingTargetColumn = (j === leavingActualColumn);
        const isLeavingRowAfterLastContent = (i === (() => {
          let lastRow = -1;
          for (let row = 0; row < 6; row++) {
            if (dayGrid[row][leavingActualColumn] !== null) {
              lastRow = row;
            }
          }
          return lastRow;
        })() + 1);
        const shouldShowLeavingPrediction = isLeavingTargetColumn && isLeavingRowAfterLastContent && leavingColumnPrediction !== null;
        
        calendarCells.push({ 
          day: null, 
          isEmpty: true, 
          isBlank: true,
          row: i,
          col: j,
          meetingPredictionNumber: shouldShowMeetingPrediction ? meetingColumnPrediction : null,
          leavingPredictionNumber: shouldShowLeavingPrediction ? leavingColumnPrediction : null,
          isMeetingPredictionSpot: shouldShowMeetingPrediction,
          isLeavingPredictionSpot: shouldShowLeavingPrediction
        });
      } else {
        const isToday = (dayCounter === currentDay);
        const isMeetingNumberHere = (dayCounter === meetingNumber);
        const isLeavingNumberHere = (dayCounter === leavingNumber);
        
        calendarCells.push({ 
          day: dayCounter, 
          isEmpty: false, 
          isToday: isToday,
          isMeetingNumber: isMeetingNumberHere,
          isLeavingNumber: isLeavingNumberHere,
          row: i,
          col: j,
          date: new Date(currentYear, currentMonth, dayCounter)
        });
        dayCounter++;
      }
    }
  }
  
  // Generate Pending Items HTML for Meeting
  const meetingPendingItemsHtml = meetingPendingColumnNumbers.map(item => {
    if (item.isMeeting) {
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
          <div style="width: 22px; height: 22px; background: linear-gradient(135deg, #ff9d00, #ff6b00); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(255,157,0,0.5);">
            <span style="font-size: 18px; font-weight: 900; color: #000; line-height: 22px;">${item.num}</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
          <div style="width: 22px; height: 22px; background: #ffd700; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ff9d00;">
            <span style="font-size: 16px; font-weight: 900; color: #000; line-height: 22px;">${item.num}</span>
          </div>
        </div>
      `;
    }
  }).join('');
  
  // Generate Played Items HTML for Meeting
  const meetingPlayedItemsHtml = meetingPlayedColumnNumbers.map(item => `
    <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px; opacity: 0.6;">
      <div style="width: 22px; height: 22px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #ff9d00;">
        <span style="font-size: 16px; font-weight: 900; color: #ffd700; line-height: 22px;">${item.num}</span>
      </div>
    </div>
  `).join('');
  
  // Generate Pending Items HTML for Leaving
  const leavingPendingItemsHtml = leavingPendingColumnNumbers.map(item => {
    if (item.isLeaving) {
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
          <div style="width: 22px; height: 22px; background: linear-gradient(135deg, #58a6ff, #0a4a8a); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(88,166,255,0.5);">
            <span style="font-size: 18px; font-weight: 900; color: #fff; line-height: 22px;">${item.num}</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
          <div style="width: 22px; height: 22px; background: #ffd700; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #58a6ff;">
            <span style="font-size: 16px; font-weight: 900; color: #000; line-height: 22px;">${item.num}</span>
          </div>
        </div>
      `;
    }
  }).join('');
  
  // Generate Played Items HTML for Leaving
  const leavingPlayedItemsHtml = leavingPlayedColumnNumbers.map(item => `
    <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px; opacity: 0.6;">
      <div style="width: 22px; height: 22px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #58a6ff;">
        <span style="font-size: 16px; font-weight: 900; color: #58a6ff; line-height: 22px;">${item.num}</span>
      </div>
    </div>
  `).join('');
  
  // Build the side-by-side sections
  const sideBySideSections = `
    <div style="display: flex; gap: 12px; margin-top: 4px;">
      <!-- LEAVING SECTION (LEFT) -->
      <div style="flex: 1; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 10px; border: 1px solid #58a6ff;">
        <div style="font-size: 13px; font-weight: 800; color: #58a6ff; text-align: center; margin-bottom: 10px;">
          🔵 LEAVING PLAY • ${leavingDay || ''} ${leavingSlot || ''}
        </div>
        
        ${leavingPendingItemsHtml ? `
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 10px;">
            ${leavingPendingItemsHtml}
          </div>
        ` : ''}
        
        ${leavingPlayedItemsHtml ? `
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
            ${leavingPlayedItemsHtml}
          </div>
          <div style="text-align: center; font-size: 9px; color: #58a6ff; margin-top: 3px; opacity: 0.8;">↻ PULL BACKS</div>
        ` : ''}
      </div>
      
      <!-- VERTICAL SEPARATOR -->
      <div style="width: 1px; background: linear-gradient(180deg, transparent, #58a6ff, #ff9d00, transparent); margin: 5px 0;"></div>
      
      <!-- MEETING SECTION (RIGHT) -->
      <div style="flex: 1; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 10px; border: 1px solid #ff9d00;">
        <div style="font-size: 13px; font-weight: 800; color: #ff9d00; text-align: center; margin-bottom: 10px;">
          🟡 MEETING PLAY • ${meetingDay || ''} ${meetingSlot || ''}
        </div>
        
        ${meetingPendingItemsHtml ? `
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 10px;">
            ${meetingPendingItemsHtml}
          </div>
        ` : ''}
        
        ${meetingPlayedItemsHtml ? `
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
            ${meetingPlayedItemsHtml}
          </div>
          <div style="text-align: center; font-size: 9px; color: #ff9d00; margin-top: 3px; opacity: 0.8;">↻ PULL BACKS</div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Build the complete HTML
  return `
    <div class="calendar-month-container" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 8px; margin-bottom: 7px; border: 1px solid #58a6ff;">
      
      <div style="font-size: 16px; font-weight: 800; color: #ff9d00; text-align: center; margin-bottom: 8px;">Calender Daily Chart Play<br>
        📅 ${currentDay} ${monthNames[currentMonth]} ${currentYear} 📅</div>
      
      <!-- Calendar Grid -->
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 5px;">
        ${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => `
          <div style="text-align: center; font-size: 10px; font-weight: bold; color: #58a6ff; padding: 2px;">${day}</div>
        `).join('')}
        
        ${calendarCells.map(cell => {
          if (cell.isEmpty && cell.isBlank) {
            if (cell.meetingPredictionNumber && cell.isMeetingPredictionSpot) {
              return `
                <div style="aspect-ratio: 1; background: rgba(255,157,0,0.15); border-radius: 4px; border: 1px dashed #ff9d00; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <span style="font-size: 16px; font-weight: 900; color: #ffd700;">${cell.meetingPredictionNumber}</span>
                  <span style="font-size: 8px; color: #ff9d00;">+7</span>
                </div>
              `;
            }
            if (cell.leavingPredictionNumber && cell.isLeavingPredictionSpot) {
              return `
                <div style="aspect-ratio: 1; background: rgba(88,166,255,0.15); border-radius: 4px; border: 1px dashed #58a6ff; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <span style="font-size: 16px; font-weight: 900; color: #58a6ff;">${cell.leavingPredictionNumber}</span>
                  <span style="font-size: 8px; color: #58a6ff;">+7</span>
                </div>
              `;
            }
            return `<div style="aspect-ratio: 1; background: rgba(255,255,255,0.03); border-radius: 4px;"></div>`;
          }
          
          if (cell.isEmpty) {
            return `<div style="aspect-ratio: 1; background: rgba(255,255,255,0.03); border-radius: 4px;"></div>`;
          }
          
          const isToday = cell.isToday;
          const isMeetingHighlight = cell.isMeetingNumber;
          const isLeavingHighlight = cell.isLeavingNumber;
          
          let cellStyle = '';
          let textStyle = '';
          
          if (isMeetingHighlight) {
            cellStyle = 'background: linear-gradient(135deg, rgba(255,157,0,0.4), rgba(255,107,0,0.4)); border: 2px solid #ff9d00; box-shadow: 0 0 8px rgba(255,157,0,0.5);';
            textStyle = 'color: #ff9d00; font-weight: 900;';
          } else if (isLeavingHighlight) {
            cellStyle = 'background: linear-gradient(135deg, rgba(88,166,255,0.4), rgba(0,100,200,0.4)); border: 2px solid #58a6ff; box-shadow: 0 0 8px rgba(88,166,255,0.5);';
            textStyle = 'color: #58a6ff; font-weight: 900;';
          } else if (isToday) {
            cellStyle = 'background: rgba(255,157,0,0.2); border: 1px solid #ff9d00;';
            textStyle = 'color: #ff9d00; font-weight: 900;';
          } else {
            cellStyle = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);';
            textStyle = 'color: #fff; font-weight: 600;';
          }
          
          return `
            <div style="aspect-ratio: 1; ${cellStyle} border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 14px; ${textStyle}">${cell.day}</span>
            </div>
          `;
        }).join('')}
      </div>
      
  <!-- LEAVING and MEETING Containers -->
      <div style="display: flex; gap: 12px; margin-bottom: 7px;">
        <div style="flex: 1; background: rgba(88,166,255,0.12); border-radius: 14px; padding: 10px; text-align: center; border-left: 4px solid #58a6ff;">
          <div style="font-size: 11px; color: #58a6ff; font-weight: bold;">LEAVING</div>
          <div style="font-size: 28px; font-weight: 900; color: #58a6ff;">${leavingNumber || '—'} ${leavingNumber ? spiritEmoji[leavingNumber] || '' : ''}</div>
          <div style="font-size: 9px; color: #94a3b8;">${leavingDay || ''} ${leavingSlot || ''}</div>
          <div style="font-size: 9px; color: #94a3b8;">${leavingDate ? leavingDate.toLocaleDateString() : ''}</div>
        </div>
        <div style="flex: 1; background: rgba(255,157,0,0.12); border-radius: 14px; padding: 5px; text-align: center; border-left: 4px solid #ff9d00;">
          <div style="font-size: 11px; color: #ff9d00; font-weight: bold;">MEETING</div>
          <div style="font-size: 28px; font-weight: 900; color: #ff9d00;">${meetingNumber || '—'} ${meetingNumber ? spiritEmoji[meetingNumber] || '' : ''}</div>
          <div style="font-size: 9px; color: #94a3b8;">${meetingDay || ''} ${meetingSlot || ''}</div>
          <div style="font-size: 9px; color: #94a3b8;">${meetingDate ? meetingDate.toLocaleDateString() : 'Next Draw'}</div>
        </div>
      </div>
      
      ${sideBySideSections}
      
      <!-- Footer -->
      <div style="margin-top: 4px; padding: 4px 8px; background: rgba(255,255,255,0.01); border-radius: 8px; border-top: 1px solid rgba(255,255,255,0.03);">
        <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 7px; color: #b9bcbd;">
    <span>CWG ©️ Calendar Chart Play</span>
          <span style="color: #ff9d00; font-weight: bold; font-size: 7px;">${globalTrackingCode}</span>
          <span style="color: #666; font-size: 7px;">Last: ${globalLastDraw}</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

//////////PlayWhe 1/6 Analysis///////////
// =====================================
// 1/16 CHART 
// =====================================
// Enhanced deep search function that skips holidays and searches across weeks
function findDeepDrawInWeeks(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
  const targetDayName = dayNames[targetDayIdx];
  
  for (let w = startWeekIndex; w >= 0; w--) {
    const week = sortedWeeks[w];
    
    // Special handling for Monday holidays
    if (targetDayIdx === 1) {
      const checkDay = week.days.find(d => d.dayName === "Monday");
      const isHoliday = !checkDay || slots.every(s => {
        const val = checkDay.draws[s];
        return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
      });
      if (isHoliday) continue;
    }
    
    const val = getDraw(week, targetDayName, targetSlot);
    if (val) {
      return { value: val, week: week, date: new Date(week.startDate) };
    }
  }
  return null;
}

// ====================================
// One Sixteen Analysis Chart Display
// ====================================
function renderOneSixteenAnalysis(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading 1/16 Chart data...</div>';
  }
  
  // =====================================
  // THE 1/16 CHART 36 ROWS × 3 MOD × 2 NUM
  // CORRECT MAPPING FORMAT: { m1: [f1,f2], m2: [f3,f4], m3: [f5,f6] }
  // =====================================
  const CHART_1_16 = {
    1: { m1: [16,29], m2: [18,31], m3: [34,11] },
    2: { m1: [17,30], m2: [19,32], m3: [35,12] },
    3: { m1: [18,31], m2: [20,33], m3: [36,13] },
    4: { m1: [19,32], m2: [21,34], m3: [1,14] },
    5: { m1: [20,33], m2: [22,35], m3: [2,15] },
    6: { m1: [21,34], m2: [23,36], m3: [3,16] },
    7: { m1: [22,35], m2: [24,1], m3: [4,17] },
    8: { m1: [23,36], m2: [25,2], m3: [5,18] },
    9: { m1: [24,1], m2: [26,3], m3: [6,19] },
    10: { m1: [25,2], m2: [27,4], m3: [7,20] },
    11: { m1: [26,3], m2: [28,5], m3: [8,21] },
    12: { m1: [27,4], m2: [29,6], m3: [9,22] },
    13: { m1: [28,5], m2: [30,7], m3: [10,23] },
    14: { m1: [29,6], m2: [31,8], m3: [11,24] },
    15: { m1: [30,7], m2: [32,9], m3: [12,25] },
    16: { m1: [31,8], m2: [33,10], m3: [13,26] },
    17: { m1: [32,9], m2: [4,32], m3: [5,18] },
    18: { m1: [33,10], m2: [5,33], m3: [6,19] },
    19: { m1: [34,11], m2: [6,34], m3: [7,20] },
    20: { m1: [35,12], m2: [20,5], m3: [10,18] },
    21: { m1: [36,13], m2: [22,1], m3: [23,2] },
    22: { m1: [1,14], m2: [23,2], m3: [24,3] },
    23: { m1: [2,15], m2: [24,3], m3: [25,4] },
    24: { m1: [3,16], m2: [25,4], m3: [26,5] },
    25: { m1: [4,17], m2: [26,5], m3: [27,6] },
    26: { m1: [5,18], m2: [27,6], m3: [28,7] },
    27: { m1: [6,19], m2: [28,7], m3: [29,8] },
    28: { m1: [7,20], m2: [29,8], m3: [30,9] },
    29: { m1: [8,21], m2: [30,9], m3: [31,10] },
    30: { m1: [9,22], m2: [31,10], m3: [32,11] },
    31: { m1: [10,23], m2: [32,11], m3: [33,12] },
    32: { m1: [11,24], m2: [33,12], m3: [34,13] },
    33: { m1: [12,25], m2: [27,6], m3: [10,18] },
    34: { m1: [13,26], m2: [35,14], m3: [36,15] },
    35: { m1: [14,27], m2: [36,15], m3: [1,16] },
    36: { m1: [15,28], m2: [1,16], m3: [2,17] }
  };
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  const todayName = dayNames[todayIdx];
  
  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🗡️", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🩸",
    9: "🐮", 10: "👦🏽", 11: "👮🏽‍♂️", 12: "🤴🏽", 13: "👧🏽", 14: "💰", 15: "🪙", 16: "💃🏽",
    17: "🪽", 18: "💊", 19: "🐎", 20: "🐶", 21: "👄", 22: "🥷🏾", 23: "🏡", 24: "🫅🏽",
    25: "👨🏾‍🦳", 26: "🪽", 27: "🐍", 28: "🩸", 29: "🍻", 30: "💰", 31: "👵🏾", 32: "🦐",
    33: "🪦", 34: "👨🏾‍🦯", 35: "💰", 36: "🫏"
  };
  
  // Spirit Names mapping
  const spiritNames = {
    1: "Cutlass", 2: "Nurses", 3: "Hearse", 4: "Coffin", 5: "Priest",
    6: "Belly", 7: "Hog", 8: "Blood", 9: "Cattle", 10: "Boy Child",
    11: "Policeman", 12: "King", 13: "Girl Child", 14: "Gold", 15: "Silver",
    16: "Jamette", 17: "Feathers", 18: "Medicine", 19: "Horse", 20: "Dog",
    21: "Mouth", 22: "Thief", 23: "House", 24: "Queen", 25: "Priest",
    26: "Feathers", 27: "Snake", 28: "Blood", 29: "Drunkard", 30: "Gold",
    31: "Nurse", 32: "Dirtiness", 33: "Grave", 34: "Blind Man", 35: "Gold", 36: "Jackass"
  };
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced function to search for draws across multiple weeks
  function getDrawFromMultipleWeeks(weeks, dayName, slot) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const week = weeks[i];
      const draw = getDraw(week, dayName, slot);
      if (draw) {
        return { value: draw, week: week };
      }
    }
    return null;
  }
  
  // ====================================
  // Get Yesterday's Draws & What It Was Under
  // ====================================
  const yesterdayIdx = (todayIdx - 1 + 7) % 7;
  const yesterdayName = dayNames[yesterdayIdx];
  
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const formattedDate = yesterdayDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Get yesterday's draws from current week
  let yesterdayDrawsCurrentWeek = [];
  for (const slot of slots) {
    const draw = getDraw(currentWeek, yesterdayName, slot);
    if (draw) yesterdayDrawsCurrentWeek.push(draw);
  }
  
  // If no draws yesterday in current week, get from previous week
  let yesterdayDraws = yesterdayDrawsCurrentWeek.length > 0 ? yesterdayDrawsCurrentWeek : [];
  if (yesterdayDraws.length === 0) {
    for (const slot of slots) {
      const draw = getDraw(previousWeek, yesterdayName, slot);
      if (draw) yesterdayDraws.push(draw);
    }
  }
  
  // If still no draws, search all weeks
  if (yesterdayDraws.length === 0) {
    for (const slot of slots) {
      const result = getDrawFromMultipleWeeks(sortedWeeks, yesterdayName, slot);
      if (result && result.value) {
        yesterdayDraws.push(result.value);
      }
    }
  }
  
  // ====================================
  // Get TODAY'S "Under" Draws (from previous week)
  // ====================================
  let todayUnderDraws = [];
  for (const slot of slots) {
    const draw = getDraw(previousWeek, todayName, slot);
    if (draw) todayUnderDraws.push(draw);
  }
  
  // If no draws from previous week, search all weeks
  if (todayUnderDraws.length === 0) {
    for (const slot of slots) {
      const result = getDrawFromMultipleWeeks(sortedWeeks, todayName, slot);
      if (result && result.value) {
        todayUnderDraws.push(result.value);
      }
    }
  }
  
  // ====================================
  // GET CURRENT WEEK DRAWS (for filtering)
  // ====================================
  function getCurrentWeekDraws() {
    const draws = [];
    if (!currentWeek) return draws;
    const now = new Date();
    const todayIdx = now.getDay();
    for (let d = 0; d <= todayIdx; d++) {
      for (const slot of slots) {
        const draw = getDraw(currentWeek, dayNames[d], slot);
        if (draw) draws.push(draw);
      }
    }
    return draws;
  }
  
  const currentWeekDraws = getCurrentWeekDraws();
  
  // ====================================
  // INTELLIGENT SCORING SYSTEM
  // ====================================
  
  // Build complete draw timeline for hit counting
  const allDraws = [];
  for (const week of sortedWeeks.slice(-8)) {
    for (const day of week.days) {
      for (const slot of slots) {
        const draw = getDraw(week, day.dayName, slot);
        if (draw) allDraws.push(draw);
      }
    }
  }
  
  const recentDraws = allDraws.slice(-28);
  const hitCounts = {};
  for (let i = 1; i <= 36; i++) {
    hitCounts[i] = recentDraws.filter(n => n === i).length;
  }
  
  // Mirror map for bonus scoring
  const mirrorMap = {};
  for (let i = 1; i <= 18; i++) {
    mirrorMap[i] = 37 - i;
    mirrorMap[37 - i] = i;
  }
  
  // Calculate a confidence score for each number based on:
  // 1. How well it matches the "Under" pattern
  // 2. Historical frequency (hits)
  // 3. Whether it's part of the 1/16 family of yesterday's draws
  // 4. Whether it's in today's "Under" list
  function calculateConfidenceScore(num, yesterdayDraws, todayUnderDraws) {
    let score = 0;
    
    // 1. Check if the number is in the 1/16 family of yesterday's draws
    for (const draw of yesterdayDraws) {
      if (CHART_1_16[draw]) {
        const allFamily = [...CHART_1_16[draw].m1, ...CHART_1_16[draw].m2, ...CHART_1_16[draw].m3];
        if (allFamily.includes(num)) {
          score += 30;
          break;
        }
      }
    }
    
    // 2. Check if the number is in today's "Under" list
    if (todayUnderDraws.includes(num)) {
      score += 25;
    }
    
    // 3. Historical frequency (0-20 points)
    const hits = hitCounts[num] || 0;
    score += Math.min(hits * 4, 20);
    
    // 4. Check if number appears in multiple modules of the 1/16 chart
    let moduleCount = 0;
    for (const draw of yesterdayDraws) {
      if (CHART_1_16[draw]) {
        if (CHART_1_16[draw].m1.includes(num)) moduleCount++;
        if (CHART_1_16[draw].m2.includes(num)) moduleCount++;
        if (CHART_1_16[draw].m3.includes(num)) moduleCount++;
      }
    }
    score += Math.min(moduleCount * 5, 15);
    
    // 5. Bonus: Check if number is a mirror of yesterday's draws
    for (const draw of yesterdayDraws) {
      if (mirrorMap[draw] === num) {
        score += 10;
        break;
      }
    }
    
    return Math.min(score, 100);
  }
  
  // Calculate scores for all numbers
  const scores = {};
  for (let i = 1; i <= 36; i++) {
    scores[i] = calculateConfidenceScore(i, yesterdayDraws, todayUnderDraws);
  }
  
  // ====================================
  // BUILD CATEGORIES WITH SCORES AND FILTERING
  // ====================================
  
  // Helper to get numbers with their scores
  function getNumbersWithScores(filterFn, sortFn, limit) {
    return Object.entries(scores)
      .filter(([num, score]) => filterFn(parseInt(num), score))
      .sort((a, b) => sortFn(a, b))
      .slice(0, limit || 999)
      .map(entry => ({ num: parseInt(entry[0]), score: entry[1] }));
  }
  
  // Chef's Shortlist - score >= 70, not played this week
  const chefShortlist = getNumbersWithScores(
    (num, score) => score >= 70 && !currentWeekDraws.includes(num),
    (a, b) => b[1] - a[1],
    8
  );
  
  // Good Support - score 50-69, not played this week
  const goodSupport = getNumbersWithScores(
    (num, score) => score >= 50 && score < 70 && !currentWeekDraws.includes(num),
    (a, b) => b[1] - a[1],
    10
  );
  
  // Secondary Watch - score 30-49, not played this week
  const secondaryWatch = getNumbersWithScores(
    (num, score) => score >= 30 && score < 50 && !currentWeekDraws.includes(num),
    (a, b) => b[1] - a[1],
    8
  );
  
  // Keep On Radar - includes played numbers (potential Pull Back) AND low score numbers
  // Get played numbers not in other categories
  const playedNumbers = currentWeekDraws
    .filter(num => 
      !chefShortlist.some(c => c.num === num) && 
      !goodSupport.some(c => c.num === num) && 
      !secondaryWatch.some(c => c.num === num)
    )
    .map(num => ({ num: num, score: scores[num] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  // Get low score numbers (score < 30) not played
  const lowScoreNumbers = getNumbersWithScores(
    (num, score) => score < 30 && !currentWeekDraws.includes(num),
    (a, b) => b[1] - a[1],
    5
  );
  
  // Combine and deduplicate
  const keepOnRadarSet = new Map();
  [...playedNumbers, ...lowScoreNumbers].forEach(item => {
    if (!keepOnRadarSet.has(item.num)) {
      keepOnRadarSet.set(item.num, item);
    }
  });
  const finalKeepOnRadar = Array.from(keepOnRadarSet.values()).slice(0, 10);
  
  // ====================================
  // BUILD MASTER WATCH LIST (EXCLUDING PLAYED NUMBERS)
  // ====================================
  const uniqueWatchSet = new Set();
  yesterdayDraws.forEach(num => {
    if (CHART_1_16[num]) {
      CHART_1_16[num].m1.forEach(n => uniqueWatchSet.add(n));
      CHART_1_16[num].m2.forEach(n => uniqueWatchSet.add(n));
      CHART_1_16[num].m3.forEach(n => uniqueWatchSet.add(n));
    }
  });
  
  // Filter out played numbers from Master Watch List
  const watchlist = Array.from(uniqueWatchSet)
    .filter(num => !currentWeekDraws.includes(num))
    .sort((a, b) => a - b);
  
  // ====================================
  // BUILD THE DISPLAY
  // ====================================
  
  const getStarIndicators = (num) => {
    const hits = hitCounts[num] || 0;
    if (hits >= 3) return '<span style="color:#32d74b; font-size:8px; margin-left:2px;">★★★</span>';
    if (hits === 2) return '<span style="color:#ff9d00; font-size:8px; margin-left:2px;">★★</span>';
    if (hits === 1) return '<span style="color:#ffd700; font-size:8px; margin-left:2px;">★</span>';
    return '';
  };
  
  // Yesterday draws header
  const drawNumbersRow = yesterdayDraws.map((num, idx) => `
    <div style="display: flex; flex-direction: column; align-items: center; margin: 0 6px;">
      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #ff9d00, #ff6b00); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; color: #000; box-shadow: 0 0 12px rgba(255,157,0,0.25);">
        ${num}
      </div>
      <span style="font-size: 7px; color: #555; margin-top: 1px;">#${idx + 1}</span>
    </div>
  `).join('');
  
  // Today's Under Draws header
  const todayUnderRow = todayUnderDraws.map((num) => `
    <div style="display: flex; flex-direction: column; align-items: center; margin: 0 4px;">
      <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #58a6ff, #1a4a8a); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; color: #fff; box-shadow: 0 0 8px rgba(88,166,255,0.3);">
        ${num}
      </div>
    </div>
  `).join('');
  
  // Render rows for each drawn number
  const tableRows = yesterdayDraws.map((drawnNum) => {
    const data = CHART_1_16[drawnNum];
    if (!data) return '';
    
    const formatModule = (arr, moduleIndex) => {
      return `
        <div style="font-size: 13px; font-weight: 800; color: #ffd700;">${arr[0]}-${arr[1]}</div>
        <div style="font-size: 9px; color: #666; margin-top:-2px;">(${arr[0]} • ${arr[1]})</div>
      `;
    };
    
    const uniqueFamily = [...new Set([...data.m1, ...data.m2, ...data.m3])].sort((a, b) => a - b);
    const familyHtml = uniqueFamily.map(num => {
      const hits = hitCounts[num] || 0;
      const isSelected = hits >= 1;
      const isPlayed = currentWeekDraws.includes(num);
      return `
        <span style="display: inline-block; width: 23px; height: 23px; line-height: 23px; text-align: center; background: ${isSelected ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.02)'}; border-radius: 50%; font-size: 11px; font-weight: 700; color: ${isSelected ? '#ffd700' : '#444'}; margin: 1px; ${isPlayed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">
          ${num}
        </span>
      `;
    }).join('');
    
    return `
      <div style="display: grid; grid-template-columns: 45px 1fr 1fr 1fr 1.2fr; gap: 4px; padding: 6px 4px; background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 4px; align-items: center; border-left: 3px solid #58a6ff;">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #ff9d00, #ff6b00); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #000;">
            ${drawnNum}
          </div>
          <span style="font-size: 7px; color: #666; margin-top: 1px;">Drawn</span>
        </div>
        <div style="text-align: center;">${formatModule(data.m1, 1)}</div>
        <div style="text-align: center;">${formatModule(data.m2, 2)}</div>
        <div style="text-align: center;">${formatModule(data.m3, 3)}</div>
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 1px;">${familyHtml}</div>
      </div>
    `;
  }).join('');
  
  // ====================================
  // RENDER HELPER FUNCTIONS
  // ====================================
  
  function renderBubbles(numbers, activeColor, strokeColor, showScore = true, isKeepOnRadar = false) {
    if (!numbers || numbers.length === 0) return null;
    
    return numbers.map(item => {
      const num = item.num;
      const score = item.score || 0;
      const stars = getStarIndicators(num);
      const isPlayed = currentWeekDraws.includes(num);
      const spirit = spiritNames[num] || '';
      
      // For Keep On Radar, show confidence even if played
      const showConfidence = isKeepOnRadar || (!isPlayed && showScore);
      
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; background: ${isPlayed ? 'rgba(100,100,100,0.15)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isPlayed ? 'rgba(100,100,100,0.2)' : strokeColor}; padding: 2px 6px; border-radius: 12px; margin: 2px 1px; opacity: ${isPlayed ? 0.6 : 1};">
          <div style="display: flex; align-items: center; gap: 2px;">
            <span style="font-size: 14px; font-weight: 800; color: ${isPlayed ? '#888' : activeColor}; ${isPlayed ? 'text-decoration: line-through;' : ''}">${num}</span>
            ${isPlayed ? '<span style="font-size: 8px; color: #666;">✓</span>' : ''}
          </div>
          ${showConfidence ? `<span style="font-size: 7px; color: ${isPlayed ? '#666' : activeColor};">${score}%</span>` : ''}
          <span style="font-size: 6px; color: ${isPlayed ? '#666' : '#94a3b8'};">${spirit.substring(0, 8)}</span>
          ${stars}
        </div>
      `;
    }).join('');
  }
  
  // Render Master Watch List items (without played numbers, showing score below)
  function renderMasterWatchItems() {
    return watchlist.map(num => {
      const score = scores[num] || 0;
      const isPlayed = currentWeekDraws.includes(num);
      // Should never be played due to filter, but just in case
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.15); border-radius: 8px; padding: 2px 6px; min-width: 30px;">
          <span style="font-size: 13px; font-weight: 700; color: #ffd700;">${num}</span>
          <span style="font-size: 7px; color: #ff9d00;">${score}%</span>
        </div>
      `;
    }).join('');
  }
  
  // ====================================
  // Generate Categories HTML
  // ====================================
  
  const chefHtml = renderBubbles(chefShortlist, '#ef4444', 'rgba(239, 68, 68, 0.25)');
  const goodHtml = renderBubbles(goodSupport, '#f97316', 'rgba(249, 115, 22, 0.25)');
  const secondaryHtml = renderBubbles(secondaryWatch, '#94a3b8', 'rgba(148, 163, 184, 0.15)');
  const radarHtml = renderBubbles(finalKeepOnRadar, '#475569', 'rgba(71, 85, 105, 0.1)', true, true);
  
  // ====================================
  // Return the HTML
  // =====================================
  return `
    <div style="background: linear-gradient(135deg, #090d16, #111827); border-radius: 16px; padding: 12px; margin-bottom: 7px; border: 1px solid #1e293b; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 3px;">
        <div style="font-size: 15px; font-weight: 900; color: #ff9d00; letter-spacing: 0.6px;">PLAY WHE - 1/16 ANALYSIS</div>
        <div style="font-size: 10px; color: #94a3b8; font-weight: 700; margin-top: 1px; letter-spacing: 0.5px;">★ COMPLETE FAMILY ANALYSIS ★</div>
        <div style="font-size: 9px; color: #64748b; font-weight: 600; margin-top: 2px;">BASED ON DRAWS FROM: ${formattedDate.toUpperCase()}</div>
      </div>
      
      <!-- Yesterday Draws -->
      <div style="display: flex; justify-content: center; align-items: center; gap: 4px; padding: 6px; background: rgba(255,255,255,0.02); border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255,157,0,0.08);">
        <span style="font-size: 9px; color: #888; font-weight: 700;">YESTERDAY DRAWS:</span>
        ${drawNumbersRow}
        <span style="font-size: 8px; color: #666; margin-left: 4px;">(${yesterdayDraws.length} draws)</span>
      </div>
      
      <!-- Today's Under -->
      <div style="display: flex; justify-content: center; align-items: center; gap: 4px; padding: 4px; background: rgba(88,166,255,0.08); border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(88,166,255,0.15);">
        <span style="font-size: 9px; color: #58a6ff; font-weight: 700;">📅 UNDER TODAY (${todayName}):</span>
        ${todayUnderRow}
        <span style="font-size: 8px; color: #666; margin-left: 4px;">(4 draws)</span>
      </div>
      
      <!-- Table Headers -->
      <div style="display: grid; grid-template-columns: 45px 1fr 1fr 1fr 1.2fr; gap: 4px; padding: 4px; font-size: 8px; color: #64748b; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 3px; text-align: center;">
        <div>DRAWN</div>
        <div>MODULE 1</div>
        <div>MODULE 2</div>
        <div>MODULE 3</div>
        <div>COMPLETE FAMILY</div>
      </div>
      
      <!-- Analysis Rows -->
      <div>${tableRows || '<div style="text-align:center; padding:20px; color:#666;">No draws available for analysis</div>'}</div>
      
      <!-- Master Watch List (Only unplayed numbers) -->
      <div style="background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 10px; border: 1px solid rgba(255,157,0,0.15); margin-top: 3px;">
        <div style="font-size: 10px; font-weight: 800; color: #ff9d00; text-align: center; margin-bottom: 3px; letter-spacing: 0.3px;">★ MASTER WATCH LIST (UNPLAYED NUMBERS) ★</div>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 3px;">
          ${watchlist.length > 0 ? renderMasterWatchItems() : '<span style="color: #64748b; font-size: 10px;">No unplayed numbers in watch list</span>'}
        </div>
      </div>
      
      <!-- Repeat Strength -->
      <div style="margin-top: 3px; padding: 8px; background: rgba(255,255,255,0.01); border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
        <div style="font-size: 10px; font-weight: 800; color: #ff9d00; text-align: center; margin-bottom: 8px;">★ REPEAT STRENGTH ★</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-bottom: 6px;">
          <!-- Chef's Shortlist -->
          ${chefHtml ? `
          <div style="background: rgba(239, 68, 68, 0.03); border-radius: 10px; padding: 6px; border: 1px solid rgba(239, 68, 68, 0.15);">
            <div style="font-size: 9px; font-weight: 800; color: #ef4444; text-align: center;">👨‍🍳 CHEF'S SHORTLIST</div>
            <div style="font-size: 7px; color: #ef4444; text-align: center; margin-bottom: 4px; font-weight:700;">🔥 TOP PRIORITY POTENTIAL</div>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2px;">
              ${chefHtml}
            </div>
          </div>
          ` : ''}
          
          <!-- Good Support -->
          ${goodHtml ? `
          <div style="background: rgba(249, 115, 22, 0.03); border-radius: 10px; padding: 6px; border: 1px solid rgba(249, 115, 22, 0.15);">
            <div style="font-size: 9px; font-weight: 800; color: #f97316; text-align: center;">🔧 GOOD SUPPORT</div>
            <div style="font-size: 7px; color: #f97316; text-align: center; margin-bottom: 4px; font-weight:700;">👍 STABLE SUPPORT NUMBERS</div>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2px;">
              ${goodHtml}
            </div>
          </div>
          ` : ''}
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px;">
          <!-- Secondary Watch -->
          ${secondaryHtml ? `
          <div style="background: rgba(148, 163, 184, 0.02); border-radius: 10px; padding: 6px; border: 1px solid rgba(148, 163, 184, 0.1);">
            <div style="font-size: 9px; font-weight: 800; color: #94a3b8; text-align: center;">🔍 SECONDARY WATCH</div>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2px; margin-top: 2px;">
              ${secondaryHtml}
            </div>
          </div>
          ` : ''}
          
          <!-- Keep On Radar -->
          ${radarHtml ? `
          <div style="background: rgba(71, 85, 105, 0.01); border-radius: 10px; padding: 6px; border: 1px solid rgba(71, 85, 105, 0.08);">
            <div style="font-size: 9px; font-weight: 800; color: #475569; text-align: center;">📡 KEEP ON RADAR</div>
            <div style="font-size: 6px; color: #475569; text-align: center; margin-bottom: 2px;">Includes played numbers (potential Pull Back) with %</div>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2px; margin-top: 2px;">
              ${radarHtml}
            </div>
          </div>
          ` : ''}
        </div>
        
        <!-- Show "All categories empty" message if nothing is displayed -->
        ${!chefHtml && !goodHtml && !secondaryHtml && !radarHtml ? `
          <div style="text-align: center; color: #64748b; font-size: 10px; padding: 10px;">
            No repeat strength categories available at this time
          </div>
        ` : ''}
      </div>
      
      <!-- How to Use -->
      <div style="margin-top: 3px; padding: 8px; background: rgba(255,157,0,0.03); border-radius: 10px; border: 1px dashed rgba(255,157,0,0.15);">
        <div style="font-size: 7px; color: #94a3b8; text-align: center; line-height: 1.4;">
          💡 <b style="color: #ff9d00;">HOW TO USE:</b> Each drawn number appears 3 times on the 1/16 Chart. 
          Every number has <b style="color: #ffd700;">6 related numbers</b> (2 in each block). 
          Numbers with <b style="color: #ffd700;">%</b> show confidence score based on:
          <br>• 1/16 family of yesterday's draws (30 pts)
          <br>• Today's "Under" numbers (25 pts) 
          <br>• Historical frequency (20 pts)
          <br>• Multiple module appearances (15 pts)
          <br>• Mirror relationships (10 pts)
          <br><span style="color: #64748b; font-size: 6px;">Strikethrough = already played this week • ✓ = played but may Pull Back</span>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="margin-top: 2px; padding: 4px 8px; background: rgba(255,255,255,0.01); border-radius: 8px; border-top: 1px solid rgba(255,255,255,0.03);">
        <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 7px; color: #b9bcbd;">
          <span>CWG ©️ 1/16 Chart Analysis</span>
          <span style="color: #ff9d00; font-weight: bold; font-size: 7px;">${globalTrackingCode}</span>
          <span style="color: #666; font-size: 7px;">Last: ${globalLastDraw}</span>
        </div>
      </div>
    </div>
  `;
}

// ======================================
// CAROUSEL DISPLAY CHART 
// ======================================
// =========================================
// CAROUSEL RENDER FUNCTIONS FOR EACH GAME
// =========================================

function renderCarouselWithCurrentPW(weeks, containerId) {
  if (!weeks || weeks.length === 0) return "";
  
  const previousWeeks = weeks.slice(0, -1);
  const currentWeek = weeks[weeks.length - 1];
  
  // --- End Date 
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const currentStartDate = formatDate(currentWeek.startDate);
const currentEndDate = currentWeek.endDate ? formatDate(currentWeek.endDate) : (() => {
  const sDate = new Date(currentWeek.startDate);
  const eDate = new Date(sDate);
  eDate.setDate(sDate.getDate() + 6);
  return formatDate(eDate);
})();
// ---------------------------------------
  
  // Build previous weeks carousel slides
const prevSlidesHtml = previousWeeks.reverse().map((wk, idx) => {
  const weekNum = previousWeeks.length - idx;
  
  const startLbl = formatDate(wk.startDate);
  const endLbl = wk.endDate ? formatDate(wk.endDate) : (() => {
    const sDate = new Date(wk.startDate);
    const eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + 6);
    return formatDate(eDate);
  })();

  // FIXED: Use "P2WHE" for Play Whe (no highlighting needed)
let tableHtml = buildTable([wk], "P2WHE", currentWeek);

  tableHtml = tableHtml.replace(/<div class="table-header"><span>(CURRENT|PREVIOUS) WEEK<\/span><\/div>/, 
    `<div class="table-header"><span>⌛ WEEK ${weekNum}</span><span>${startLbl} - ${endLbl}</span></div>`);
    
  return `<div class="carousel-slide">${tableHtml}</div>`;
}).join('');

  
  // Build current week (fixed at bottom) with date range
  let currentTableHtml = buildTable([currentWeek], "P2WHE");
  currentTableHtml = currentTableHtml.replace(/<div class="table-header"><span>CURRENT WEEK<\/span><\/div>/, 
    `<div class="table-header current-header"><span>⚜️ CURRENT WEEK</span><span>${currentStartDate} - ${currentEndDate}</span><span>LIVE RESULTS</span></div>`);
  
  currentTableHtml = `<div class="current-section"><div class="current-label">⚜️ CURRENT WEEK ⚜️</div>${currentTableHtml}</div>`;
  
  const carouselHtml = previousWeeks.length > 0 ? `
  <div class="carousel-container" id="${containerId}-carousel" style="margin-bottom: 8px; padding: 4px 0;">
    <div class="carousel-track" id="${containerId}-track" style="gap: 12px;">
      ${prevSlidesHtml}
    </div>
    <div class="carousel-indicators" id="${containerId}-dots" style="margin-top: 8px;"></div>
  </div>
  <div style="text-align:center; padding:3px 3px; opacity:0.15; font-weight:900; letter-spacing:3px; pointer-events:none; user-select:none;"><p style="margin:0; font-size:9px;">CODEWITHGLASGOW 🌐 bit.ly/CWGCharts</p></div>
  <script>initPrevCarousel('${containerId}', ${previousWeeks.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous weeks available</div>';
  
  return carouselHtml + currentTableHtml;
}

// ======================================
// REPLACEMENT BLOCK: MATCH HIGHLIGHTING BASED ON CURRENT WEEK SWIPE 
// =======================================

function renderCarouselWithCurrentP2(weeks, containerId) {
  if (!weeks || weeks.length === 0) return "";
  
  const previousWeeks = weeks.slice(0, -1);
  const currentWeek = weeks[weeks.length - 1];
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const currentStartDate = formatDate(currentWeek.startDate);
  const currentEndDate = currentWeek.endDate ? formatDate(currentWeek.endDate) : (() => {
    const sDate = new Date(currentWeek.startDate);
    const eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + 6);
    return formatDate(eDate);
  })();

  // 1. Build strict color mapping for matches explicitly inside Current Week
  let currentWeekKeys = {};
  let colorMap = {};
  let colorIndex = 0;
  
  currentWeek.days.forEach(day => {
    ["MOR", "MID", "NON", "EVE"].forEach(slot => {
      let key = getSortKey(day.draws[slot]);
      if (key) currentWeekKeys[key] = true;
    });
  });

  // Also check previous weeks to look for hits matching the active current week keys
  weeks.forEach(wk => {
    wk.days.forEach(day => {
      ["MOR", "MID", "NON", "EVE"].forEach(slot => {
        let key = getSortKey(day.draws[slot]);
        if (key && currentWeekKeys[key] && !colorMap[key]) {
          colorMap[key] = getMatchColor(colorIndex);
          colorIndex++;
        }
      });
    });
  });
  
  // 2. Build previous week carousel slides with matching attributes
  const prevSlidesHtml = previousWeeks.reverse().map((wk, idx) => {
    const weekNum = previousWeeks.length - idx;
    const startLbl = formatDate(wk.startDate);
    const endLbl = wk.endDate ? formatDate(wk.endDate) : (() => {
      const sDate = new Date(wk.startDate);
      const eDate = new Date(sDate);
      eDate.setDate(sDate.getDate() + 6);
      return formatDate(eDate);
    })();

let tableHtml = buildTableWithColorMap([wk], "PIKII", colorMap, currentWeek);
    tableHtml = tableHtml.replace(/<div class="table-header"><span>(CURRENT|PREVIOUS) WEEK<\/span><\/div>/, 
      `<div class="table-header"><span>⌛ WEEK ${weekNum}</span><span>${startLbl} - ${endLbl}</span></div>`);
      
    return `<div class="carousel-slide">${tableHtml}</div>`;
  }).join('');
  
  // 3. Build current week fixed layout
  let currentTableHtml = buildTableWithColorMap([currentWeek], "PIKII", colorMap);
  currentTableHtml = currentTableHtml.replace(/<div class="table-header"><span>CURRENT WEEK<\/span><\/div>/, 
    `<div class="table-header current-header"><span>⚜️ CURRENT WEEK</span><span>${currentStartDate} - ${currentEndDate}</span><span>LIVE RESULTS</span></div>`);
  currentTableHtml = `<div class="current-section"><div class="current-label">⚜️ CURRENT WEEK ⚜️</div>${currentTableHtml}</div>`;
  
  const carouselHtml = previousWeeks.length > 0 ? `
  <div class="carousel-container" id="${containerId}-carousel" style="margin-bottom: 8px; padding: 4px 0;">
    <div class="carousel-track" id="${containerId}-track" style="gap: 12px;">
      ${prevSlidesHtml}
    </div>
    <div class="carousel-indicators" id="${containerId}-dots" style="margin-top: 8px;"></div>
  </div>
  <div style="text-align:center; padding:3px 3px; opacity:0.15; font-weight:900; letter-spacing:3px; pointer-events:none; user-select:none;"><p style="margin:0; font-size:9px;">CODEWITHGLASGOW 🌐 bit.ly/CWGCharts</p></div>
  <script>initPrevCarousel('${containerId}', ${previousWeeks.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous weeks available</div>';
  
  return carouselHtml + currentTableHtml;
}

function renderCarouselWithCurrentP4(weeks, containerId) {
  if (!weeks || weeks.length === 0) return "";
  
  const previousWeeks = weeks.slice(0, -1);
  const currentWeek = weeks[weeks.length - 1];
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // 1. Build strict color mapping for matches explicitly inside Current Week (Pick 4)
  let currentWeekKeys = {};
  let colorMap = {};
  let colorIndex = 0;

  currentWeek.days.forEach(day => {
    ["MOR", "MID", "NON", "EVE"].forEach(slot => {
      let key = getSortKey(day.draws[slot], "PIKIV");
      if (key) currentWeekKeys[key] = true;
    });
  });

  weeks.forEach(wk => {
    wk.days.forEach(day => {
      ["MOR", "MID", "NON", "EVE"].forEach(slot => {
        let key = getSortKey(day.draws[slot], "PIKIV");
        if (key && currentWeekKeys[key] && !colorMap[key]) {
          colorMap[key] = getMatchColor(colorIndex);
          colorIndex++;
        }
      });
    });
  });

  // 2. Build slides
  const prevSlidesHtml = previousWeeks.reverse().map((wk, idx) => {
    const weekNum = previousWeeks.length - idx;
    const startLbl = formatDate(wk.startDate);
    const endLbl = wk.endDate ? formatDate(wk.endDate) : (() => {
      const sDate = new Date(wk.startDate);
      const eDate = new Date(sDate);
      eDate.setDate(sDate.getDate() + 6);
      return formatDate(eDate);
    })();

let tableHtml = buildTableWithColorMap([wk], "PIKIV", colorMap, currentWeek);
    tableHtml = tableHtml.replace(/<div class="table-header"><span>(CURRENT|PREVIOUS) WEEK<\/span><\/div>/, 
      `<div class="table-header"><span>⌛ WEEK ${weekNum}</span><span>${startLbl} - ${endLbl}</span></div>`);
      
    return `<div class="carousel-slide">${tableHtml}</div>`;
  }).join('');

  // 3. Build Fixed Bottom Current Week
  const currentStartDate = formatDate(currentWeek.startDate);
  const currentEndDate = currentWeek.endDate ? formatDate(currentWeek.endDate) : (() => {
    const sDate = new Date(currentWeek.startDate);
    const eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + 6);
    return formatDate(eDate);
  })();

  let currentTableHtml = buildTableWithColorMap([currentWeek], "PIKIV", colorMap);
  currentTableHtml = currentTableHtml.replace(/<div class="table-header"><span>CURRENT WEEK<\/span><\/div>/, 
    `<div class="table-header current-header"><span>⚜️ CURRENT WEEK</span><span>${currentStartDate} - ${currentEndDate}</span><span>LIVE RESULTS</span></div>`);
  currentTableHtml = `<div class="current-section"><div class="current-label">⚜️ CURRENT WEEK ⚜️</div>${currentTableHtml}</div>`;
  
  const carouselHtml = previousWeeks.length > 0 ? `
  <div class="carousel-container" id="${containerId}-carousel" style="margin-bottom: 8px; padding: 4px 0;">
    <div class="carousel-track" id="${containerId}-track" style="gap: 12px;">
      ${prevSlidesHtml}
    </div>
    <div class="carousel-indicators" id="${containerId}-dots" style="margin-top: 8px;"></div>
  </div>
  <div style="text-align:center; padding:3px 3px; opacity:0.15; font-weight:900; letter-spacing:3px; pointer-events:none; user-select:none;"><p style="margin:0; font-size:9px;">CODEWITHGLASGOW 🌐 bit.ly/CWGCharts</p></div>
  <script>initPrevCarousel('${containerId}', ${previousWeeks.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous weeks available</div>';
  
  return carouselHtml + currentTableHtml;
}

// =========================================
// ADD THIS NEW FUNCTION - Same as buildTable but with colorMap parameter
// =========================================
function buildTableWithColorMap(weeks, gameType, colorMap, currentWeekDataParam = null) {
  const isPickGame = (gameType === "PIKII" || gameType === "PIKIV");
  
  // Helper function to check if a specific draw time has passed
  function isDrawTimePassed(weekStartDate, dayName, slot) {
    if (!weekStartDate) return false;
    const parts = weekStartDate.split(" ");
    const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
    const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
    const dayIndex = daysOfWeek.indexOf(dayName);
    if (dayIndex === -1) return false;
    const drawDate = new Date(startDate);
    drawDate.setDate(startDate.getDate() + dayIndex);
    const timeOffsets = { "MOR": 9, "MID": 12, "NON": 15, "EVE": 18 };
    drawDate.setHours(timeOffsets[slot] || 12);
    return drawDate < new Date();
  }

  // Helper function to check if a day has any draws
  function hasAnyDraws(day) {
    if (!day || !day.draws) return false;
    return timeOrder.some(slot => {
      const val = day.draws[slot];
      return val && val !== "-" && val !== "PENDING";
    });
  }

// Calculate highlight day based on last completed day (ONLY when EVE is recorded OR holiday)
  let isAfterEvening = false;
  let highlightDayName = todayName;
const currentWeekData = currentWeekDataParam || weeks.find(wk => wk.isCurrentWeek);
  
  if (currentWeekData) {
    let lastCompletedDayIndex = -1;
    for (let i = 0; i < daysOfWeek.length; i++) {
      const dayData = currentWeekData.days.find(d => d.dayName === daysOfWeek[i]);
      if (dayData) {
        // Check if EVE has been recorded (day is fully complete)
        const hasEveDraw = dayData.draws.EVE && dayData.draws.EVE !== "-" && dayData.draws.EVE !== "PENDING";
        
        // Check if it's a holiday (EVE passed with no draws at all)
        const allSlotsEmpty = timeOrder.every(slot => {
          const val = dayData.draws[slot];
          return !val || val === "-" || val === "PENDING";
        });
        const isHoliday = allSlotsEmpty && isDrawTimePassed(currentWeekData.startDate, dayData.dayName, "EVE");
        
        // Only consider day "completed" if EVE was recorded OR it's a holiday
        if (hasEveDraw || isHoliday) {
          lastCompletedDayIndex = i;
          isAfterEvening = true;
        } else if (!hasEveDraw && !isHoliday) {
          // If we find a day that has draws but EVE not yet recorded, stop here
          // This means we haven't completed this day yet
          break;
        }
      }
    }
    
    // Determine highlight day
    if (lastCompletedDayIndex !== -1) {
      if (isAfterEvening) {
        // If we completed a day, highlight the next day
        highlightDayName = daysOfWeek[(lastCompletedDayIndex + 1) % 7];
      } else {
        // Otherwise highlight the current day we're on
        highlightDayName = daysOfWeek[lastCompletedDayIndex];
      }
    }
  }
  
  return weeks.map(wk => {
    // --- Parse Week Range Header ---
    let headerRange = wk.isCurrentWeek ? "CURRENT WEEK" : "PREVIOUS WEEK";
    if (wk.startDate) {
      let start = new Date(wk.startDate);
      if (!isNaN(start.getTime())) {
        let end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
        let opt = { day: 'numeric', month: 'short', year: '2-digit' };
        headerRange += ` (${start.toLocaleDateString('en-GB', opt)} - ${end.toLocaleDateString('en-GB', opt)})`;
      }
    }

    return `
    <div class="table-wrapper">
      <div class="table-header"><span>${headerRange.toUpperCase()} • 🔸 DTD CHART</span></div>
      <table>
        <tr><th>DAY</th><th>MOR</th><th>MID</th><th>NON</th><th>EVE</th></tr>
        ${wk.days.map((d, index) => {
          let isHighlighted = (d.dayName === highlightDayName);
          
          // --- Calculate Day Number ---
          let dayDisplay = d.dayName.slice(0,3).toUpperCase();
          if (wk.startDate) {
            let start = new Date(wk.startDate);
            if (!isNaN(start.getTime())) {
              let currentDayDate = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);
              dayDisplay += ` ${currentDayDate.getDate()}`;
            }
          }
          
          // Check if this entire day has no draws (all slots are "-" or "PENDING")
          const allSlotsEmpty = timeOrder.every(slot => {
            const val = d.draws[slot];
            return !val || val === "-" || val === "PENDING";
          });
          
          // For previous weeks: if all slots empty, show HOLIDAY
          if (!wk.isCurrentWeek && allSlotsEmpty) {
            return `<tr class="${isHighlighted ? 'current-day' : ''}">
              <td class="day-label">${(isHighlighted && isAfterEvening) ? "▶ " : ""}${dayDisplay}</td>
              <td colspan="4" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2);">
                <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
              </td>
            </tr>`;
          }
          
          // For current week: check if the day has no draws AND EVE has passed
          if (wk.isCurrentWeek && allSlotsEmpty) {
            const isEvePassed = isDrawTimePassed(wk.startDate, d.dayName, "EVE");
            if (isEvePassed) {
              return `<tr class="${isHighlighted ? 'current-day' : ''}">
                <td class="day-label">${(isHighlighted && isAfterEvening) ? "▶ " : ""}${dayDisplay}</td>
                <td colspan="4" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2);">
                  <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
                <td>
              </tr>`;
            }
          }

          return `<tr class="${isHighlighted ? 'current-day' : ''}">
            <td class="day-label">${(isHighlighted && isAfterEvening) ? "▶ " : ""}${dayDisplay}</td>
            ${timeOrder.map(s => {
              let val = d.draws[s];
              let key = getSortKey(val);
              let matchColor = isPickGame ? colorMap[key] : null;
              let style = matchColor ? `style="color:${matchColor}; border:1px solid ${matchColor}; background:${matchColor}15; border-radius:4px;"` : "";
              return `<td ${style}>${(val === "-" || val === "PENDING") ? "..." : val}</td>`;
            }).join("")}
          </tr>`;
        }).join("")}
      </table>
    </div>`;
  }).join('<div style="text-align:center; padding:3px 3px; opacity:0.15; font-weight:900; letter-spacing:3px; pointer-events:none; user-select:none;"><p style="margin:0; font-size:9px;">CODEWITHGLASGOW 🌐 bit.ly/CWGCharts</p></div>');
}
