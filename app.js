// ===== CLIENT PROMPTS =====
const CLIENTS = {
  gemotiveerd: {
    icon: '🌟',
    name: 'De Gemotiveerde Cliënt',
    prompt: `Je bent een enthousiaste, energieke coachingscliënt die boordevol plannen zit, snel vooruit wil, soms te snel denkt en de coach nauwelijks de kans geeft om te reageren.`
  },
  ongemotiveerd: {
    icon: '😶',
    name: 'De Ongemotiveerde Cliënt',
    prompt: `Je bent een coachingscliënt die passief en afwachtend reageert, weinig energie toont, het nut van coaching betwijfelt en korte, vlakke antwoorden geeft.`
  },
  dwars: {
    icon: '🔄',
    name: 'De Dwarse Cliënt',
    prompt: `Je bent een coachingscliënt die zich consequent verzet tegen voorstellen, alles tegenwerkt, maar ergens diep van binnen wél open staat voor verandering.`
  },
  complex: {
    icon: '🌀',
    name: 'De Complexe Cliënt',
    prompt: `Je bent een coachingscliënt met een ingewikkeld verhaal vol tegenstrijdige gevoelens, verschuivende doelen en veel onderliggende thema's die moeilijk te doorgronden zijn.`
  },
  arrogant: {
    icon: '👑',
    name: 'De Arrogante Cliënt',
    prompt: `Je bent een coachingscliënt die denkt het altijd beter te weten dan de coach, adviezen minacht, maar wel subtiel laat zien dat je toch iets zoekt.`
  },
  oneerlijk: {
    icon: '🎭',
    name: 'De Oneerlijke Cliënt',
    prompt: `Je bent een coachingscliënt die de waarheid verbergt, vragen omzeilt, sociaal wenselijke antwoorden geeft en pas bij heel gerichte doorvragen een tipje van de sluier oplicht.`
  }
};

// ===== STATE =====
let currentClient = null;
let chatHistory = [];  // { role: 'user'|'assistant', content: string }[]
let coachInputs = []; // only coach messages for feedback context

// ===== CLIENT SELECTION =====
function selectClient(el) {
  const clientKey = el.dataset.client;
  currentClient = CLIENTS[clientKey];

  // Update UI
  document.getElementById('active-icon').textContent = currentClient.icon;
  document.getElementById('active-name').textContent = currentClient.name;

  document.getElementById('client-section').classList.add('hidden');
  document.getElementById('chat-section').classList.remove('hidden');

  // Reset state
  chatHistory = [];
  coachInputs = [];
  document.getElementById('chat-history').innerHTML = `
    <div class="welcome-msg">
      <p>De sessie begint. Stuur je eerste coachingsbericht.</p>
    </div>`;
  closeFeedback();
}

function resetSession() {
  currentClient = null;
  chatHistory = [];
  coachInputs = [];
  document.getElementById('chat-section').classList.add('hidden');
  document.getElementById('client-section').classList.remove('hidden');
  closeFeedback();
}

// ===== CHAT =====
function handleKey(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text || !currentClient) return;

  input.value = '';
  appendMessage('coach', text);
  coachInputs.push(text);
  chatHistory.push({ role: 'user', content: text });

  // Show typing indicator
  const typingEl = showTyping();

  try {
    const reply = await callChatAPI(currentClient.prompt, chatHistory);
    removeTyping(typingEl);
    appendMessage('client', reply);
    chatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    removeTyping(typingEl);
    appendMessage('client', `⚠️ Er ging iets mis: ${err.message}`);
  }
}

function appendMessage(role, text) {
  const history = document.getElementById('chat-history');

  // Remove welcome message if present
  const welcome = history.querySelector('.welcome-msg');
  if (welcome) welcome.remove();

  const div = document.createElement('div');
  div.className = `msg ${role === 'coach' ? 'coach' : 'client'}`;
  div.innerHTML = `
    <span class="msg-label">${role === 'coach' ? 'Jij (coach)' : currentClient.name}</span>
    <div class="msg-bubble">${escapeHtml(text)}</div>
  `;
  history.appendChild(div);
  history.scrollTop = history.scrollHeight;
}

function showTyping() {
  const history = document.getElementById('chat-history');
  const div = document.createElement('div');
  div.className = 'msg client';
  div.innerHTML = `
    <span class="msg-label">${currentClient ? currentClient.name : 'Cliënt'}</span>
    <div class="typing-bubble"><span></span><span></span><span></span></div>
  `;
  history.appendChild(div);
  history.scrollTop = history.scrollHeight;
  return div;
}

function removeTyping(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

// ===== API CALL - CHAT =====
async function callChatAPI(systemPrompt, messages) {
  const res = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.reply;
}

// ===== FEEDBACK =====
async function requestFeedback() {
  if (coachInputs.length < 2) {
    alert('Voer eerst een gesprek van minimaal 2 berichten voordat je feedback vraagt.');
    return;
  }

  const panel = document.getElementById('feedback-panel');
  const content = document.getElementById('feedback-content');
  const layout = document.querySelector('.chat-layout');

  panel.classList.remove('hidden');
  layout.classList.add('with-feedback');

  content.innerHTML = `
    <div class="feedback-loading">
      <div class="spinner"></div>
      <p>Jouw gesprek wordt geanalyseerd…</p>
    </div>`;

  // Build transcript for feedback prompt
  const transcript = chatHistory.map((m, i) => {
    const label = m.role === 'user' ? 'Coach' : 'Cliënt';
    return `${label}: ${m.content}`;
  }).join('\n\n');

  const feedbackPrompt = `Je bent een expert in coachingsvaardigheden. Analyseer het volgende coachingsgesprek en geef gestructureerde feedback op twee aspecten:

1. **Vragen stellen**: Hoe vaak stelt de coach een vraag? Zijn de vragen open of gesloten? Zijn ze verkennend of sturend?
2. **Aansluiting bij de cliënt**: Hoe goed sluit de coach aan bij wat de cliënt zegt en voelt? Wordt er actief geluisterd en aangesloten?

Wees specifiek en verwijs naar concrete momenten uit het gesprek. Sluit af met 1-2 concrete verbeterpunten.

Gesprek:
${transcript}`;

  try {
    const feedback = await callChatAPI(
      'Je bent een coach-supervisor die gesprekken evalueert op coachingsvaardigheden.',
      [{ role: 'user', content: feedbackPrompt }]
    );
    content.innerHTML = formatFeedback(feedback);
  } catch (err) {
    content.innerHTML = `<p style="color:red">⚠️ Kon geen feedback ophalen: ${err.message}</p>`;
  }
}

function formatFeedback(text) {
  // Convert markdown-like **bold** and newlines to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^#{1,3} (.+)$/gm, '<h4>$1</h4>')
    .split('\n\n')
    .map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '')
    .join('');
}

function closeFeedback() {
  const panel = document.getElementById('feedback-panel');
  const layout = document.querySelector('.chat-layout');
  panel.classList.add('hidden');
  if (layout) layout.classList.remove('with-feedback');
}

// ===== UTILS =====
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}
