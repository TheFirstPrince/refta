const STORAGE_KEY = "refta_tender_slots_v2";

const form = document.getElementById("request-form");
const slotTemplate = document.getElementById("slot-template");
const scheduleList = document.getElementById("schedule-list");
const emptyState = document.getElementById("empty-state");
const clearAllButton = document.getElementById("clear-all");
const exportCsvButton = document.getElementById("export-csv");
const filterDateInput = document.getElementById("filter-date");
const preview = document.getElementById("slot-preview");
const formMessage = document.getElementById("form-message");

const statTotal = document.getElementById("stat-total");
const statToday = document.getElementById("stat-today");
const statMinutes = document.getElementById("stat-minutes");

const defaultDate = new Date().toISOString().slice(0, 10);
document.getElementById("date").value = defaultDate;
document.getElementById("time-start").value = "10:00";
updatePreview();

let schedule = loadSchedule();
sortSchedule();
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  setFormMessage("");

  const entry = buildEntry();
  if (!entry) {
    setFormMessage("Заполните обязательные поля корректно.", "error");
    return;
  }

  const conflict = schedule.find(
    (item) =>
      item.date === entry.date &&
      isOverlapping(item.timeStart, item.duration, entry.timeStart, entry.duration)
  );

  if (conflict) {
    setFormMessage(
      `Конфликт: ${conflict.company} (${conflict.requestId}), ${conflict.timeStart}–${endTime(conflict.timeStart, conflict.duration)}.`,
      "error"
    );
    return;
  }

  schedule.push(entry);
  sortSchedule();
  saveSchedule();
  render();

  form.reset();
  document.getElementById("date").value = entry.date;
  document.getElementById("time-start").value = entry.timeStart;
  document.getElementById("duration").value = String(entry.duration);
  updatePreview();

  setFormMessage("Слот успешно добавлен.", "success");
});

clearAllButton.addEventListener("click", () => {
  if (!schedule.length) return;

  const isConfirmed = confirm("Удалить все слоты из расписания?");
  if (!isConfirmed) return;

  schedule = [];
  saveSchedule();
  render();
});

exportCsvButton.addEventListener("click", () => {
  if (!schedule.length) {
    setFormMessage("Нет данных для экспорта.", "error");
    return;
  }

  const headers = ["date", "start", "end", "duration", "company", "request_id", "contact", "comment"];
  const lines = schedule.map((slot) =>
    [
      slot.date,
      slot.timeStart,
      endTime(slot.timeStart, slot.duration),
      slot.duration,
      slot.company,
      slot.requestId,
      slot.contact,
      slot.comment ?? "",
    ]
      .map((item) => `"${String(item).replaceAll('"', '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `tender-slots-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
});

for (const id of ["date", "time-start", "duration"]) {
  document.getElementById(id).addEventListener("input", updatePreview);
}

filterDateInput.addEventListener("input", render);

function buildEntry() {
  const company = value("company");
  const requestId = value("request-id");
  const contact = value("contact");
  const date = value("date");
  const timeStart = value("time-start");
  const duration = Number(value("duration"));
  const comment = value("comment");

  if (!company || !requestId || !contact || !date || !timeStart || Number.isNaN(duration)) {
    return null;
  }

  if (duration < 5 || duration % 5 !== 0) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    company,
    requestId,
    contact,
    date,
    timeStart,
    duration,
    comment,
  };
}

function removeEntry(id) {
  schedule = schedule.filter((item) => item.id !== id);
  saveSchedule();
  render();
}

function render() {
  scheduleList.innerHTML = "";

  const filterDate = filterDateInput.value;
  const visible = filterDate ? schedule.filter((slot) => slot.date === filterDate) : schedule;

  emptyState.style.display = visible.length ? "none" : "block";

  for (const slot of visible) {
    const node = slotTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".slot-title").textContent = `${slot.company} · ${slot.requestId}`;
    node.querySelector(".slot-subtitle").textContent = `${slot.contact}${slot.comment ? ` · ${slot.comment}` : ""}`;
    node.querySelector(".badge.time").textContent = `${slot.timeStart}–${endTime(slot.timeStart, slot.duration)} (${slot.duration} мин)`;
    node.querySelector(".badge.date").textContent = formatDate(slot.date);
    node.querySelector(".remove").addEventListener("click", () => removeEntry(slot.id));

    scheduleList.appendChild(node);
  }

  renderStats();
}

function renderStats() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const total = schedule.length;
  const todayCount = schedule.filter((item) => item.date === todayIso).length;
  const minutes = schedule.reduce((sum, item) => sum + item.duration, 0);

  statTotal.textContent = String(total);
  statToday.textContent = String(todayCount);
  statMinutes.textContent = `${minutes} мин`;
}

function updatePreview() {
  const date = value("date");
  const start = value("time-start");
  const duration = Number(value("duration"));

  if (!date || !start || Number.isNaN(duration)) {
    preview.textContent = "";
    return;
  }

  preview.textContent = `Слот: ${formatDate(date)}, ${start}–${endTime(start, duration)}`;
}

function value(id) {
  return document.getElementById(id).value.trim();
}

function loadSchedule() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSchedule() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

function sortSchedule() {
  schedule.sort((a, b) => `${a.date}T${a.timeStart}`.localeCompare(`${b.date}T${b.timeStart}`));
}

function isOverlapping(startA, durationA, startB, durationB) {
  const a1 = toMinutes(startA);
  const a2 = a1 + durationA;
  const b1 = toMinutes(startB);
  const b2 = b1 + durationB;
  return Math.max(a1, b1) < Math.min(a2, b2);
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function endTime(start, duration) {
  const total = toMinutes(start) + duration;
  const hours = Math.floor((total / 60) % 24)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function setFormMessage(message, tone = "") {
  formMessage.textContent = message;
  formMessage.className = "form-message";
  if (tone) formMessage.classList.add(tone);
}
