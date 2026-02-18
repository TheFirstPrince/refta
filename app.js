const STORAGE_KEY = "tender_schedule_v1";

const form = document.getElementById("request-form");
const scheduleBody = document.getElementById("schedule-body");
const emptyState = document.getElementById("empty-state");
const clearAllButton = document.getElementById("clear-all");
const rowTemplate = document.getElementById("row-template");

let schedule = loadSchedule();
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const entry = {
    id: crypto.randomUUID(),
    company: value("company"),
    requestId: value("request-id"),
    contact: value("contact"),
    date: value("date"),
    timeStart: value("time-start"),
    duration: Number(value("duration")),
    comment: value("comment"),
  };

  const conflict = schedule.find(
    (item) =>
      item.date === entry.date &&
      isOverlapping(item.timeStart, item.duration, entry.timeStart, entry.duration)
  );

  if (conflict) {
    alert(
      `Конфликт времени: ${conflict.company} (${conflict.requestId}) уже назначен на ${conflict.timeStart}`
    );
    return;
  }

  schedule.push(entry);
  sortSchedule();
  saveSchedule();
  render();
  form.reset();
});

clearAllButton.addEventListener("click", () => {
  if (!schedule.length) return;

  const isConfirmed = confirm("Удалить все временные слоты?");
  if (!isConfirmed) return;

  schedule = [];
  saveSchedule();
  render();
});

function removeEntry(id) {
  schedule = schedule.filter((item) => item.id !== id);
  saveSchedule();
  render();
}

function render() {
  scheduleBody.innerHTML = "";

  if (!schedule.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  for (const item of schedule) {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".date").textContent = formatDate(item.date);
    row.querySelector(
      ".time"
    ).textContent = `${item.timeStart} (${item.duration} мин.)`;
    row.querySelector(".company").textContent = item.company;
    row.querySelector(".request-id").textContent = item.requestId;
    row.querySelector(".contact").textContent = item.contact;
    row.querySelector(".comment").textContent = item.comment || "—";

    row.querySelector(".remove").addEventListener("click", () => {
      removeEntry(item.id);
    });

    scheduleBody.appendChild(row);
  }
}

function value(id) {
  return document.getElementById(id).value.trim();
}

function loadSchedule() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveSchedule() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

function sortSchedule() {
  schedule.sort((a, b) => {
    const left = `${a.date}T${a.timeStart}`;
    const right = `${b.date}T${b.timeStart}`;
    return left.localeCompare(right);
  });
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

function formatDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("ru-RU");
}
