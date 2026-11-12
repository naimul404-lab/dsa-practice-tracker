const TOPICS = ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Backtracking', 'Heap / Priority Queue', 'Greedy', 'Intervals', 'Math & Geometry', 'Bit Manipulation'];
const STORAGE_KEY = 'dsa-practice-tracker-v1';
const form = document.getElementById('practiceForm');
const topicSelect = document.getElementById('topic');
const topicFilter = document.getElementById('topicFilter');
const formMessage = document.getElementById('formMessage');
let problems = loadProblems();

function loadProblems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.topic === 'string' && typeof item.date === 'string');
  } catch {
    return [];
  }
}

function saveProblems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
    return true;
  } catch {
    showMessage('Could not save your data. Check browser storage settings.', true);
    return false;
  }
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value, options = { month: 'short', day: 'numeric' }) {
  const date = parseLocalDate(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, options);
}

function initFormOptions() {
  TOPICS.forEach((topic) => {
    const option = document.createElement('option');
    option.value = topic;
    option.textContent = topic;
    topicSelect.append(option);
  });
  TOPICS.forEach((topic) => {
    const option = document.createElement('option');
    option.value = topic;
    option.textContent = topic;
    topicFilter.append(option);
  });
  document.getElementById('practiceDate').value = dateKey(new Date());
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle('error', isError);
  if (message) window.setTimeout(() => { formMessage.textContent = ''; formMessage.classList.remove('error'); }, 3500);
}

function getStreak() {
  const days = new Set(problems.map((problem) => problem.date));
  let cursor = new Date();
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderStats() {
  const today = new Date();
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
  const weekStartKey = dateKey(weekStart);
  const weekly = problems.filter((problem) => problem.date >= weekStartKey && problem.date <= dateKey(today)).length;
  const minutes = problems.reduce((sum, problem) => sum + (Number(problem.minutes) || 0), 0);
  const streak = getStreak();

  document.getElementById('totalSolved').textContent = problems.length;
  document.getElementById('weeklySolved').textContent = weekly;
  document.getElementById('streakCount').textContent = streak;
  document.getElementById('totalMinutes').textContent = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : minutes;
  document.getElementById('streakLabel').textContent = streak ? `${streak}-day practice streak` : 'Start a practice streak';
}

function renderTopicProgress() {
  const container = document.getElementById('topicProgress');
  container.replaceChildren();
  const counts = new Map(TOPICS.map((topic) => [topic, 0]));
  problems.forEach((problem) => counts.set(problem.topic, (counts.get(problem.topic) || 0) + 1));
  const max = Math.max(1, ...counts.values());
  const sortedTopics = [...TOPICS].sort((a, b) => counts.get(b) - counts.get(a) || TOPICS.indexOf(a) - TOPICS.indexOf(b));

  sortedTopics.slice(0, 7).forEach((topic) => {
    const row = document.createElement('div');
    row.className = 'topic-row';
    const name = document.createElement('span');
    name.className = 'topic-name';
    name.textContent = topic;
    const track = document.createElement('div');
    track.className = 'progress-track';
    track.setAttribute('aria-label', `${topic}: ${counts.get(topic)} problems`);
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.width = `${(counts.get(topic) / max) * 100}%`;
    track.append(fill);
    const count = document.createElement('span');
    count.className = 'topic-count';
    count.textContent = counts.get(topic);
    row.append(name, track, count);
    container.append(row);
  });
}

function renderWeeklyChart() {
  const chart = document.getElementById('weeklyChart');
  chart.replaceChildren();
  const today = new Date();
  const entries = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    const key = dateKey(date);
    entries.push({ key, label: date.toLocaleDateString(undefined, { weekday: 'short' }), count: problems.filter((problem) => problem.date === key).length, today: offset === 0 });
  }
  const peak = Math.max(1, ...entries.map((entry) => entry.count));
  entries.forEach((entry) => {
    const day = document.createElement('div');
    day.className = 'chart-day';
    const value = document.createElement('span');
    value.className = 'chart-value';
    value.textContent = entry.count;
    const column = document.createElement('div');
    column.className = 'chart-column';
    const bar = document.createElement('div');
    bar.className = `chart-bar${entry.today ? ' today' : ''}`;
    bar.style.height = `${entry.count ? Math.max(8, (entry.count / peak) * 100) : 0}%`;
    column.append(bar);
    const label = document.createElement('span');
    label.className = 'chart-label';
    label.textContent = entry.label;
    day.append(value, column, label);
    chart.append(day);
  });
}

function safeProblemUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function renderProblems() {
  const tbody = document.getElementById('problemRows');
  const emptyState = document.getElementById('emptyState');
  tbody.replaceChildren();
  const selectedTopic = topicFilter.value;
  const filtered = problems.filter((problem) => selectedTopic === 'all' || problem.topic === selectedTopic)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));

  emptyState.hidden = filtered.length > 0;
  if (!filtered.length && problems.length && selectedTopic !== 'all') {
    emptyState.querySelector('strong').textContent = 'No problems for this topic yet';
    emptyState.querySelector('p').textContent = 'Choose another topic or log a practice problem.';
  } else {
    emptyState.querySelector('strong').textContent = 'Your practice log starts here';
    emptyState.querySelector('p').textContent = 'Add your first solved problem to see your progress.';
  }

  filtered.slice(0, 30).forEach((problem) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.className = 'problem-title';
    const link = safeProblemUrl(problem.url);
    if (link) {
      const anchor = document.createElement('a');
      anchor.href = link;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = problem.name;
      nameCell.append(anchor);
    } else {
      nameCell.textContent = problem.name;
    }
    const topicCell = document.createElement('td');
    const topicPill = document.createElement('span');
    topicPill.className = 'topic-pill';
    topicPill.textContent = problem.topic;
    topicCell.append(topicPill);
    const difficultyCell = document.createElement('td');
    const difficulty = document.createElement('span');
    const level = ['easy', 'medium', 'hard'].includes(String(problem.difficulty).toLowerCase()) ? String(problem.difficulty).toLowerCase() : 'medium';
    difficulty.className = `difficulty ${level}`;
    difficulty.textContent = level[0].toUpperCase() + level.slice(1);
    difficultyCell.append(difficulty);
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(problem.date);
    const timeCell = document.createElement('td');
    timeCell.className = 'time-column';
    timeCell.textContent = Number(problem.minutes) ? `${Number(problem.minutes)} min` : '—';
    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', `Delete ${problem.name}`);
    deleteButton.addEventListener('click', () => deleteProblem(problem.id));
    actionCell.append(deleteButton);
    row.append(nameCell, topicCell, difficultyCell, dateCell, timeCell, actionCell);
    tbody.append(row);
  });
}

function render() {
  renderStats();
  renderTopicProgress();
  renderWeeklyChart();
  renderProblems();
}

function deleteProblem(id) {
  const previous = problems;
  problems = problems.filter((problem) => problem.id !== id);
  if (saveProblems()) render();
  else problems = previous;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const formData = new FormData(form);
  const name = String(formData.get('problemName') || '').trim();
  if (!name) {
    showMessage('Please enter a problem name.', true);
    return;
  }
  const problem = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    topic: String(formData.get('topic')),
    difficulty: String(formData.get('difficulty')),
    date: String(formData.get('practiceDate')),
    minutes: Math.max(0, Number(formData.get('duration')) || 0),
    url: String(formData.get('problemLink') || '').trim(),
    createdAt: new Date().toISOString()
  };
  problems.push(problem);
  if (!saveProblems()) {
    problems.pop();
    return;
  }
  const keepDate = document.getElementById('practiceDate').value;
  form.reset();
  document.getElementById('practiceDate').value = keepDate;
  document.getElementById('difficulty').value = 'Medium';
  showMessage('Practice session added. Nice work!');
  render();
});

topicFilter.addEventListener('change', renderProblems);
initFormOptions();
render();
