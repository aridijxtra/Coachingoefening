# 🎓 Coaching Oefentool

Interactieve website om coachingsvaardigheden te oefenen met 6 gesimuleerde cliënten, aangedreven door OpenAI GPT-3.5 Turbo.

---

## 🚀 Deployment (GitHub + Netlify)

### Stap 1 – GitHub
1. Maak een nieuw repository aan op [github.com](https://github.com)
2. Upload alle bestanden uit deze map naar het repository
3. Zorg dat `netlify/functions/chat.js` en `netlify.toml` erin staan

### Stap 2 – Netlify
1. Ga naar [netlify.com](https://netlify.com) en log in
2. Klik **"Add new site" → "Import an existing project"**
3. Koppel je GitHub account en selecteer het repository
4. Netlify detecteert `netlify.toml` automatisch — klik **Deploy**

### Stap 3 – API Key instellen
1. Ga in Netlify naar **Site settings → Environment variables**
2. Voeg toe:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** jouw OpenAI API key (begint met `sk-...`)
3. Klik **Save** en deploy opnieuw (Deploys → Trigger deploy)

---

## 📁 Bestandsstructuur

```
coaching-site/
├── index.html                  # Hoofdpagina
├── style.css                   # Stijlen
├── app.js                      # Frontend logica
├── logo.png                    # Jouw logo (hier plaatsen)
├── netlify.toml                # Netlify configuratie
├── package.json
├── .gitignore
└── netlify/
    └── functions/
        └── chat.js             # Serverless API proxy (veilig)
```

---

## 🔒 Beveiliging

De OpenAI API key staat **nooit** in de frontend code. Alle API-aanroepen gaan via de Netlify serverless function (`netlify/functions/chat.js`), die de key ophaalt uit de omgevingsvariabelen.

---

## 🖼️ Logo vervangen

Zet jouw logobestand in de hoofdmap en hernoem het naar `logo.png`.  
Of pas in `index.html` de `src` van de `<img class="logo">` tag aan.

---

## 💬 De 6 cliënten

| Cliënt | Gedrag |
|--------|--------|
| 🌟 De Gemotiveerde | Enthousiast, vol plannen, praat snel |
| 😶 De Ongemotiveerde | Passief, korte antwoorden, betwijfelt het nut |
| 🔄 De Dwarse | Verzet zich, werkt alles tegen |
| 🌀 De Complexe | Tegenstrijdig, meerdere lagen, moeilijk te doorgronden |
| 👑 De Arrogante | Minacht de coach, weet het beter |
| 🎭 De Oneerlijke | Verbergt de waarheid, omzeilt vragen |

---

## 📊 Feedback

Na het gesprek geeft de tool feedback op:
- **Vragen stellen** – hoe vaak en hoe goed stelt de coach vragen
- **Aansluiting bij de cliënt** – hoe goed sluit de coach aan
