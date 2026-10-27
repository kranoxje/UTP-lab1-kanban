const COLUMNS = [
  { id: "Backlog", title: "Backlog", wip: null },
  { id: "Ready", title: "Ready", wip: null },
  { id: "In Progress", title: "Во тек", wip: 2 },
  { id: "Blocked", title: "Блокирано", wip: 1 },
  { id: "Done", title: "Завршено", wip: null }
];

const FALLBACK = [
  { title: "Споредба на три Kanban алатки", body: "Trello, GitHub Projects и KanbanFlow — карактеристики, јавен линк, WIP.", column: "Done", tags: ["лаб-1"] },
  { title: "Аудиториска вежба 2: преглед на алатки", body: "Белешки од аудиториските вежби за хостирање на табла.", column: "Done", tags: ["аудиториски"] },
  { title: "Лабораториска вежба 1 — елаборат", body: "Одговори 1–9, слики, јавен линк. WIP ставка.", column: "In Progress", tags: ["лаб-1", "елаборат"] },
  { title: "Поставување на јавната табла", body: "Колони, WIP=2, Power-Up/интеграција, картички за предметот.", column: "In Progress", tags: ["лаб-1"] },
  { title: "Читање: процеси на техничка поддршка", body: "Тикети, приоритети, SLA и ескалација од предавања.", column: "Ready", tags: ["предавања"] },
  { title: "Прашања за консултации", body: "Список прашања пред следна аудиториска.", column: "Ready", tags: ["консултации"] },
  { title: "Подготовка за лабораториска вежба 2", body: "Ќе се дополни кога ќе се објави текстот.", column: "Backlog", tags: ["лаб-2"] },
  { title: "Повторување на материјал од предавања 1–2", body: "Кратки белешки и картички за секоја тема.", column: "Backlog", tags: ["предавања"] }
];

function columnOf(issue) {
  const labels = (issue.labels || []).map((l) => (l.name || l).toLowerCase());
  for (const col of COLUMNS) {
    if (labels.includes(col.id.toLowerCase()) || labels.includes(col.title.toLowerCase())) return col.id;
  }
  if (issue.state === "closed") return "Done";
  return "Backlog";
}

function cardHtml(card) {
  const tags = (card.tags || []).map((t) => `<span class="tag">${t}</span>`).join("");
  return `<article class="card"><h3>${card.title}</h3><p>${card.body || ""}</p><div class="tags">${tags}</div></article>`;
}

function render(cards) {
  const board = document.getElementById("board");
  board.innerHTML = COLUMNS.map((col) => {
    const items = cards.filter((c) => c.column === col.id);
    const over = col.wip && items.length > col.wip ? " over" : "";
    const limit = col.wip ? `<span class="limit">WIP ${items.length}/${col.wip}</span>` : `<span>${items.length}</span>`;
    return `<section class="col${over}"><h2>${col.title} ${limit}</h2>${items.map(cardHtml).join("")}</section>`;
  }).join("");
}

async function load() {
  try {
    const res = await fetch("https://api.github.com/repos/kranoxje/UTP-lab1-kanban/issues?state=all&per_page=50");
    if (!res.ok) throw new Error("api");
    const issues = await res.json();
    if (!Array.isArray(issues) || issues.length === 0) throw new Error("empty");
    render(issues.filter((i) => !i.pull_request).map((i) => ({
      title: i.title,
      body: (i.body || "").slice(0, 180),
      column: columnOf(i),
      tags: (i.labels || []).map((l) => l.name)
    })));
  } catch {
    render(FALLBACK);
  }
}

load();
