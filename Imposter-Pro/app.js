const categories = {
  neon: {
    label: "Neon City",
    image: "assets/neon-city.svg",
    words: {
      normal: ["Skyline", "U-Bahn", "Arcade", "Rooftop", "Nachtmarkt", "Hologramm"],
      hard: [["Skyline", "City"], ["Arcade", "Gaming-Lounge"], ["Nachtmarkt", "Food-Court"]],
    },
  },
  jungle: {
    label: "Jungle Ritual",
    image: "assets/jungle-temple.svg",
    words: {
      normal: ["Tempel", "Wasserfall", "Liane", "Nebel", "Ritual", "Kompass"],
      hard: [["Tempel", "Ruine"], ["Wasserfall", "Fluss"], ["Nebel", "Wolke"]],
    },
  },
  cosmos: {
    label: "Cosmic Drift",
    image: "assets/cosmic-station.svg",
    words: {
      normal: ["Raumstation", "Warp", "Helm", "Sternennebel", "Luftschleuse", "Meteor"],
      hard: [["Warp", "Hyperdrive"], ["Meteor", "Asteroid"], ["Luftschleuse", "Dock"]],
    },
  },
};

const state = {
  category: "neon",
  deck: [],
  revealedCount: 0,
  timerId: null,
  remainingSeconds: 360,
};

const els = {
  playerCount: document.querySelector("#playerCount"),
  imposterCount: document.querySelector("#imposterCount"),
  roundMinutes: document.querySelector("#roundMinutes"),
  difficulty: document.querySelector("#difficulty"),
  categoryContainer: document.querySelector("#categoryContainer"),
  validationMessage: document.querySelector("#validationMessage"),
  generateGame: document.querySelector("#generateGame"),
  shuffleRoles: document.querySelector("#shuffleRoles"),
  playerName: document.querySelector("#playerName"),
  revealRole: document.querySelector("#revealRole"),
  roleResult: document.querySelector("#roleResult"),
  roleLabel: document.querySelector("#roleLabel"),
  roleImage: document.querySelector("#roleImage"),
  roleWord: document.querySelector("#roleWord"),
  hint: document.querySelector("#hint"),
  countdown: document.querySelector("#countdown"),
  startTimer: document.querySelector("#startTimer"),
  pauseTimer: document.querySelector("#pauseTimer"),
  resetTimer: document.querySelector("#resetTimer"),
  resetAll: document.querySelector("#resetAll"),
  heroGallery: document.querySelector("#heroGallery"),
};

function init() {
  hydrateFromStorage();
  renderCategories();
  renderGallery();
  bindEvents();
  syncTimerFromInput();
  updateCountdown();
}

function bindEvents() {
  els.generateGame.addEventListener("click", generateRound);
  els.shuffleRoles.addEventListener("click", shuffleDeckOnly);
  els.revealRole.addEventListener("click", revealCurrentPlayerRole);
  els.startTimer.addEventListener("click", startTimer);
  els.pauseTimer.addEventListener("click", pauseTimer);
  els.resetTimer.addEventListener("click", syncTimerFromInput);
  els.roundMinutes.addEventListener("change", syncTimerFromInput);
  els.resetAll.addEventListener("click", resetAll);
}

function renderCategories() {
  els.categoryContainer.innerHTML = "";
  Object.entries(categories).forEach(([key, config]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `chip ${key === state.category ? "active" : ""}`;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(key === state.category));
    btn.textContent = config.label;
    btn.addEventListener("click", () => {
      state.category = key;
      renderCategories();
      persist();
    });
    els.categoryContainer.appendChild(btn);
  });
}

function renderGallery() {
  els.heroGallery.innerHTML = "";
  Object.values(categories).forEach((category) => {
    const article = document.createElement("article");
    article.className = "gallery-card";

    const img = document.createElement("img");
    img.src = category.image;
    img.alt = `${category.label} Artwork`;
    img.loading = "lazy";

    const label = document.createElement("span");
    label.textContent = category.label;

    article.append(img, label);
    els.heroGallery.appendChild(article);
  });
}

function generateRound() {
  const playerCount = Number(els.playerCount.value);
  const imposterCount = Number(els.imposterCount.value);
  if (playerCount < 3 || playerCount > 20) {
    return showStatus("Spieleranzahl muss zwischen 3 und 20 sein.", "error");
  }
  if (imposterCount < 1 || imposterCount >= playerCount) {
    return showStatus("Imposter müssen >=1 und kleiner als Spieleranzahl sein.", "error");
  }

  const words = categories[state.category].words[els.difficulty.value];
  let crewWord;
  let imposterWord = "???";

  if (els.difficulty.value === "hard") {
    const pair = words[Math.floor(Math.random() * words.length)];
    crewWord = pair[0];
    imposterWord = pair[1];
  } else {
    crewWord = words[Math.floor(Math.random() * words.length)];
  }

  state.deck = Array.from({ length: playerCount }, (_, idx) => ({
    id: idx + 1,
    role: idx < imposterCount ? "Imposter" : "Crew",
    word: idx < imposterCount ? imposterWord : crewWord,
  }));

  shuffle(state.deck);
  state.revealedCount = 0;
  els.roleResult.classList.add("hidden");
  showStatus(`Runde bereit: ${playerCount} Spieler · ${imposterCount} Imposter.`, "success");
  persist();
}

function shuffleDeckOnly() {
  if (!state.deck.length) {
    return showStatus("Bitte zuerst eine Runde generieren.", "error");
  }
  shuffle(state.deck);
  state.revealedCount = 0;
  els.roleResult.classList.add("hidden");
  showStatus("Rollen neu gemischt.", "success");
  persist();
}

function revealCurrentPlayerRole() {
  if (!state.deck.length) {
    return showStatus("Bitte zuerst Runde generieren.", "error");
  }

  const card = state.deck[state.revealedCount];
  if (!card) {
    return showStatus("Alle Rollen wurden angezeigt.", "error");
  }

  const name = els.playerName.value.trim() || `Spieler ${state.revealedCount + 1}`;
  state.revealedCount += 1;

  els.roleResult.classList.remove("hidden");
  els.roleLabel.textContent = `${name}: ${card.role}`;
  els.roleWord.textContent = `Dein Begriff: ${card.word}`;
  els.roleImage.src = categories[state.category].image;
  els.roleImage.alt = `${categories[state.category].label} Art`;
  els.hint.textContent = card.role === "Imposter"
    ? "Hinweis: Stelle präzise Rückfragen, ohne den Begriff direkt zu nennen."
    : "Hinweis: Gib taktische Hinweise, aber verrate den Begriff nicht direkt.";

  els.playerName.value = "";
  showStatus(`${state.revealedCount}/${state.deck.length} Rollen angezeigt.`, "success");
  persist();
}

function showStatus(message, type) {
  els.validationMessage.style.color = type === "success" ? "#79f2e8" : "#ff6d9f";
  els.validationMessage.textContent = message;
}

function startTimer() {
  if (state.timerId) return;
  state.timerId = setInterval(() => {
    if (state.remainingSeconds <= 0) {
      pauseTimer();
      showStatus("Zeit abgelaufen. Jetzt abstimmen.", "error");
      return;
    }

    state.remainingSeconds -= 1;
    updateCountdown();
    persist();
  }, 1000);
}

function pauseTimer() {
  clearInterval(state.timerId);
  state.timerId = null;
}

function syncTimerFromInput() {
  pauseTimer();
  const minutes = Math.max(1, Math.min(30, Number(els.roundMinutes.value) || 6));
  state.remainingSeconds = minutes * 60;
  updateCountdown();
  persist();
}

function updateCountdown() {
  const min = String(Math.floor(state.remainingSeconds / 60)).padStart(2, "0");
  const sec = String(state.remainingSeconds % 60).padStart(2, "0");
  els.countdown.textContent = `${min}:${sec}`;
}

function resetAll() {
  pauseTimer();
  localStorage.removeItem("imposterRoyaleV2");
  location.reload();
}

function persist() {
  const snapshot = {
    category: state.category,
    deck: state.deck,
    revealedCount: state.revealedCount,
    remainingSeconds: state.remainingSeconds,
    settings: {
      playerCount: els.playerCount.value,
      imposterCount: els.imposterCount.value,
      roundMinutes: els.roundMinutes.value,
      difficulty: els.difficulty.value,
    },
  };

  localStorage.setItem("imposterRoyaleV2", JSON.stringify(snapshot));
}

function hydrateFromStorage() {
  const raw = localStorage.getItem("imposterRoyaleV2");
  if (!raw) return;

  try {
    const snapshot = JSON.parse(raw);
    state.category = snapshot.category || state.category;
    state.deck = snapshot.deck || [];
    state.revealedCount = snapshot.revealedCount || 0;
    state.remainingSeconds = snapshot.remainingSeconds || state.remainingSeconds;

    els.playerCount.value = snapshot.settings?.playerCount || els.playerCount.value;
    els.imposterCount.value = snapshot.settings?.imposterCount || els.imposterCount.value;
    els.roundMinutes.value = snapshot.settings?.roundMinutes || els.roundMinutes.value;
    els.difficulty.value = snapshot.settings?.difficulty || els.difficulty.value;
  } catch {
    localStorage.removeItem("imposterRoyaleV2");
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

init();
