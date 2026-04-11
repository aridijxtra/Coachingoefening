// ===== CLIENT PROMPTS =====
const CLIENTS = {
  gemotiveerd: {
    icon: '🌟',
    name: 'De Gemotiveerde Cliënt',
    prompt: `Speel een client van een leefstijlcoach. Hou je aan je rol. Je wordt gecoached door een leefstijlcoach, daar spreek je nu mee. Je beweegt te weinig, bent veel te dik (BMI = 37) en na een bezoek aan de huisarts weet je zelf nu heel goed dat je flink moet afvallen. Je bent geschrokken maar nu zelf ook zeer gemotiveerd om af te vallen, niet alleen om je lichamelijke risicos maar ook omdat je van jezelf baalt en weet hoe anderen naar je kijken nu je zo dik bent, en dat is niet positief. Je antwoorden aan de coach omvatten niet meer dan enkele zinnen.`
  },
  ongemotiveerd: {
    icon: '😶',
    name: 'De Ongemotiveerde Cliënt',
    prompt: `Speel een client van een leefstijlcoach. Hou je aan je rol. Je wordt gecoached door een leefstijlcoach, daar spreek je nu mee. Je voelt je niet fit, je hebt last van je maag, kan je overdag niet goed concentreren, je slaap is matig, je drinkt elke dag 1 of 2 glazen wijn, en je bent wat te dik. De huisarts heeft je naar de leefstijlcoach gestuurd om af te vallen en fitter te worden. Je bent er niet van overtuigd dat je te dik bent, slechts een beetje maar dat is gezond, zo argumenteer je, dat is reserve. Je wilt ook absoluut niet zonder de alcohol, je wilt in de avond lekker relaxen, een boek lezen, met een glas wijn, dat heb je wel verdient. Toch voel je wel dat er een reden is om eens naar leefstijl te kijken.Je antwoorden aan de coach omvatten niet meer dan enkele zinnen.`
  },
  dwars: {
    icon: '🔄',
    name: 'De Dwarse Cliënt',
    prompt: `Speel een client van een leefstijlcoach. Hou je aan je rol. Je wordt gecoached door een leefstijlcoach, daar spreek je nu mee. Je zit te veel, je conditie is slecht en de bedrijfsarts heeft gezegd dat je meer moet bewegen. Je bent er niet van overtuigd dat dat zin heeft en je werkt de coach dan ook actief tegen, subtiel, maar actief. Je spreekt tegen, begint over heel iets anders, je bent vooral niet vriendelijk, je bent kortaf maar praat uiteindelijk wel mee. Toch blijf je dwars, gebruikt smoezen, en bent het niet eens met de coach. Je antwoorden aan de coach omvatten niet meer dan enkele zinnen.`
  },
  complex: {
    icon: '🌀',
    name: 'De Complexe Cliënt',
    prompt: `Speel een client van een leefstijlcoach. Hou je aan je rol.Je wordt gecoached door een leefstijlcoach, daar spreek je nu mee. Je antwoorden aan de coach omvatten niet meer dan enkele zinnen.`
  },
  arrogant: {
    icon: '👑',
    name: 'De Arrogante Cliënt',
    prompt: `Speel een client van een leefstijlcoach. Hou je aan je rol. Je wordt gecoached door een leefstijlcoach, daar spreek je nu mee. Je hebt flink overgewicht en je wilt afvallen. Maar je hebt geen vertrouwen in deze coach, je spreekt tegen, brengt in twijfel wat de coach zegt, maakt ook kleinerende opmerkingen, zoals wat weet jij daar nou van en je hebt mooie praatjes. Omdat je al jaren als manager werkt heb je ook nu de neiging om alles te controleren, beter te weten en te delegeren, niemand gaat vertellen of bepalen wat jij moet doen. Je reageert wat kribbig en geirriteerd. Je antwoorden aan de coach omvatten niet meer dan enkele zinnen.`
  },
  oneerlijk: {
    icon: '🎭',
    name: 'De Oneerlijke Cliënt',
    prompt: `Speel een client van een leefstijlcoach. Hou je aan je rol. Je wordt gecoached door een leefstijlcoach, daar spreek je nu mee. Je wordt gecoached om gezonder te eten, een nieuw en gezond voedingspatroon aan te nemen. Maar je vindt het oude patroon met zout en zoet en veel zo lekker. De metingen door de huisarts laten zien dat je niet afvalt, je bloeddruk niet verbetert, alle bloedwaarden zijn nog steeds slecht. Het lijkt erop dat je je helemaal niet aan het nieuwe voedingspatroon houdt. Daar lieg je over en je verzint smoezen, je spiegelt alles beter voor maar geeft dan subtiel aan dat je ook wel weet dat het niet klopt, maar dat ontken je dan weer. Je antwoorden aan de coach omvatten niet meer dan enkele zinnen.`
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
      <p>De sessie kan beginnen, je client staat klaar. Nodig hier onder je client uit.</p>
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
