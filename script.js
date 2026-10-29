/* Cactus Wren Dental — concept site interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const TZ = "America/Phoenix"; // Arizona doesn't observe DST

  /* ---------- Phoenix time helpers ---------- */
  const phxParts = (d = new Date()) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false
    }).formatToParts(d).map(x => [x.type, x.value]));
    const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    return { dow, y: +p.year, m: +p.month, d: +p.day, mins: (+p.hour % 24) * 60 + +p.minute };
  };
  // [open, close] in minutes after midnight, by day of week (0 = Sunday)
  const HOURS = { 0: null, 1: [420, 1020], 2: [420, 1020], 3: [420, 1020], 4: [420, 1020], 5: [420, 840], 6: [480, 720] };
  const SLOTS = {
    1: ["7:00", "8:00", "9:30", "10:30", "11:30", "1:00", "2:00", "3:00", "4:00"],
    5: ["7:00", "8:00", "9:00", "10:30", "11:30", "12:30"],
    6: ["8:00", "9:00", "10:00", "11:00"]
  };
  [2, 3, 4].forEach(d => SLOTS[d] = SLOTS[1]);
  const toMins = t => { let [h, m] = t.split(":").map(Number); if (h < 7) h += 12; return h * 60 + m; };
  const label = t => { const h = +t.split(":")[0]; return `${t} ${h >= 7 && h <= 11 ? "AM" : "PM"}`; };
  const fmt = m => { const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, "0"); return `${((h + 11) % 12) + 1}:${mm} ${h < 12 ? "AM" : "PM"}`; };

  const now = phxParts();

  /* ---------- Open / closed status ---------- */
  (() => {
    const h = HOURS[now.dow], dot = $("#openDot"), txt = $("#openText");
    if (h && now.mins >= h[0] && now.mins < h[1]) {
      dot.classList.add("is-open"); txt.textContent = `Open now · until ${fmt(h[1])}`;
    } else {
      let d = now.dow, i = 0;
      if (h && now.mins < h[0]) { txt.textContent = `Closed · opens today at ${fmt(h[0])}`; }
      else {
        do { d = (d + 1) % 7; i++; } while (!HOURS[d]);
        const name = i === 1 ? "tomorrow" : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d];
        txt.textContent = `Closed · opens ${name} at ${fmt(HOURS[d][0])}`;
      }
    }
    const row = $(`#hoursBody tr[data-d="${now.dow}"]`); if (row) row.classList.add("today");
  })();

  /* ---------- Mobile menu ---------- */
  const tog = $(".nav__toggle"), menu = $("#mobileMenu");
  tog.addEventListener("click", () => {
    const open = tog.getAttribute("aria-expanded") === "true";
    tog.setAttribute("aria-expanded", String(!open)); menu.hidden = open;
  });
  $$("a", menu).forEach(a => a.addEventListener("click", () => { tog.setAttribute("aria-expanded", "false"); menu.hidden = true; }));

  /* ---------- Available days (next 10 open days) ---------- */
  const DOWS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // pseudo-random but stable "already booked" slots per date
  const taken = (key, t) => { let h = 0; for (const c of key + t) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 3 === 0; };
  const days = [];
  for (let i = 0; days.length < 10 && i < 20; i++) {
    const dt = new Date(Date.UTC(now.y, now.m - 1, now.d + i));
    const dow = dt.getUTCDay();
    if (!HOURS[dow]) continue;
    const key = dt.toISOString().slice(0, 10);
    const slots = SLOTS[dow].map(t => ({
      t, off: taken(key, t) || (i === 0 && toMins(t) <= now.mins + 60)
    }));
    if (slots.every(s => s.off)) continue;
    days.push({ key, dow, date: dt.getUTCDate(), mon: MONTHS[dt.getUTCMonth()], rel: i === 0 ? "Today" : i === 1 ? "Tomorrow" : null, slots });
  }

  // Hero "next available" card
  const first = days[0];
  $("#nextDay").textContent = first.rel || `${DOWS[first.dow]}, ${first.mon} ${first.date}`;
  $("#heroSlots").innerHTML = first.slots.filter(s => !s.off).slice(0, 3)
    .map(s => `<a href="#book" data-day="${first.key}" data-time="${s.t}">${label(s.t)}</a>`).join("");
  $$("#heroSlots a").forEach(a => a.addEventListener("click", () => preselect(a.dataset.day, a.dataset.time)));

  /* ---------- Insurance checker ---------- */
  const insSel = $("#insSelect"), insOut = $("#insResult");
  const insMsg = {
    in: n => ["ok", "✓", `Great news, we're in-network with ${n}.`, "Cleanings and exams are usually covered at 100%. We'll check your exact benefits before your visit."],
    out: n => ["mid", "~", `We're out-of-network with ${n}, but you can still come here.`, "Most patients still get a big part of the cost covered. We file the claim for you and tell you your share up front."],
    hmo: () => ["info", "i", "We don't accept HMO / DHMO plans.", `Our <a href="#plan">Wren Smile Plan</a> is often cheaper than an HMO, with no network rules.`],
    none: () => ["info", "♥", "No insurance? You're covered here too.", `New patients pay just $99 for an exam, X-rays and cleaning, or join the <a href="#plan">Wren Smile Plan</a> from $29/month.`],
    other: () => ["mid", "?", "Not sure? We'll check for you.", `Bring your card to your visit, or call <a href="tel:+16025550163">(602) 555-0163</a> and we'll look up your benefits in two minutes.`]
  };
  insSel.addEventListener("change", () => {
    const v = insSel.value; if (!v) { insOut.innerHTML = ""; return; }
    const [cls, icon, title, body] = insMsg[v](insSel.options[insSel.selectedIndex].text);
    insOut.innerHTML = `<div class="ins__msg ins__msg--${cls}"><i>${icon}</i><div><b>${title}</b><p>${body}</p></div></div>`;
  });

  /* ---------- Membership toggle ---------- */
  const PLANS = {
    adult: { m: 29, y: "or $299 paid yearly (save $49)", perk: "15% off fillings, crowns and implants", save: "$420" },
    kid: { m: 19, y: "or $199 paid yearly (save $29)", perk: "Fluoride & sealants included", save: "$310" }
  };
  $$(".plan__toggle button").forEach(b => b.addEventListener("click", () => {
    $$(".plan__toggle button").forEach(x => x.classList.toggle("is-on", x === b));
    const p = PLANS[b.dataset.plan];
    $("#planPrice").textContent = p.m; $("#planYear").textContent = p.y; $("#planPerk").textContent = p.perk; $("#planSave").textContent = p.save;
  }));

  /* ---------- Booking wizard ---------- */
  const form = $("#bookForm"), steps = $$(".step", form);
  const prev = $("#prev"), next = $("#next"), submit = $("#submit");
  const daysEl = $("#days"), timesEl = $("#times");
  let step = 1, pick = { day: null, time: null };

  daysEl.innerHTML = days.map(d =>
    `<button type="button" class="day" role="radio" aria-checked="false" data-key="${d.key}"><small>${d.rel === "Today" ? "Today" : DOWS[d.dow]}</small><b>${d.date}</b><span>${d.mon}</span></button>`).join("");

  function renderTimes() {
    const d = days.find(x => x.key === pick.day);
    timesEl.innerHTML = d ? d.slots.map(s =>
      `<button type="button" class="time${pick.time === s.t ? " is-on" : ""}" role="radio" aria-checked="${pick.time === s.t}" data-t="${s.t}" ${s.off ? "disabled aria-label='" + label(s.t) + " (booked)'" : ""}>${label(s.t)}</button>`).join("") : "";
    $$(".time", timesEl).forEach(b => b.addEventListener("click", () => { pick.time = b.dataset.t; renderTimes(); err(3, false); }));
  }
  function selectDay(key) {
    pick.day = key;
    const d = days.find(x => x.key === key);
    if (!d || !d.slots.some(s => s.t === pick.time && !s.off)) pick.time = null;
    $$(".day", daysEl).forEach(b => { const on = b.dataset.key === key; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", on); });
    renderTimes();
  }
  $$(".day", daysEl).forEach(b => b.addEventListener("click", () => selectDay(b.dataset.key)));
  selectDay(days[0].key);

  function preselect(day, time) { selectDay(day); pick.time = time; renderTimes(); }

  const err = (n, on) => $(`[data-err="${n}"]`, form).classList.toggle("on", on);
  const val = n => (form.elements[n]?.value || "").trim();
  const radio = n => form.querySelector(`input[name="${n}"]:checked`)?.value;

  const checks = {
    1: () => !!radio("reason"),
    2: () => !!radio("patient"),
    3: () => !!(pick.day && pick.time),
    4: () => {
      const bad = {
        name: val("name").length < 2,
        phone: val("phone").replace(/\D/g, "").length < 10,
        email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val("email"))
      };
      Object.entries(bad).forEach(([k, b]) => form.elements[k].classList.toggle("bad", b));
      return !Object.values(bad).some(Boolean);
    }
  };

  const whenText = () => {
    const d = days.find(x => x.key === pick.day);
    const dayTxt = d.rel ? `${d.rel}, ${d.mon} ${d.date}` : `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.dow]}, ${d.mon} ${d.date}`;
    return `${dayTxt} at ${label(pick.time)}`;
  };

  function go(n) {
    step = n;
    steps.forEach(s => s.classList.toggle("is-on", +s.dataset.step === n));
    $("#wizCount").textContent = `Step ${n} of 4`;
    $("#wizBar").style.width = `${n * 25}%`;
    prev.hidden = n === 1; next.hidden = n === 4; submit.hidden = n !== 4;
    if (n === 4) {
      $("#recap").innerHTML = `<b>${radio("reason")}</b> · ${radio("patient")}<br>${whenText()}<br>Insurance: ${val("insurance")}`;
    }
  }

  next.addEventListener("click", () => { const ok = checks[step](); err(step, !ok); if (ok) go(step + 1); });
  prev.addEventListener("click", () => go(step - 1));
  $$('input[name="reason"], input[name="patient"]', form).forEach(r => r.addEventListener("change", () => {
    err(step, false);
    if (r.name === "reason") setTimeout(() => step === 1 && go(2), 200);
  }));
  form.addEventListener("input", e => e.target.classList.remove("bad"));
  form.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName === "INPUT" && step < 4) { e.preventDefault(); next.click(); } });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const ok = checks[4](); err(4, !ok); if (!ok) return;
    const firstName = val("name").split(" ")[0];
    $("#doneText").innerHTML = `Thanks, ${firstName.replace(/[<>&]/g, "")}! We'll see you <b>${whenText()}</b>. A confirmation text is on its way to ${val("phone").replace(/[<>&]/g, "")}.`;
    steps.forEach(s => s.classList.remove("is-on"));
    form.classList.add("is-done"); $("#done").hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $("#again").addEventListener("click", () => {
    form.reset(); form.classList.remove("is-done"); $("#done").hidden = true;
    selectDay(days[0].key); go(1);
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  $$(".svc, .rev, .head, .ins__box, .plan__card, .wiz, .member, .hours, .feat").forEach(el => { el.classList.add("reveal"); io.observe(el); });
})();
