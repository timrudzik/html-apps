const categories = {
  food: {
    label: "Essen",
    image: "assets/food.svg",
    words: {
      normal: ["Pizza", "Sushi", "Burger", "Taco", "Pasta", "Curry"],
      hard: [["Pizza", "Flammkuchen"], ["Sushi", "Maki"], ["Burger", "Sandwich"]],
    },
  },
  travel: {
    label: "Reisen",
    image: "assets/travel.svg",
    words: {
      normal: ["Flughafen", "Strand", "Hotel", "Wüste", "Backpacking", "Kreuzfahrt"],
      hard: [["Flughafen", "Bahnhof"], ["Strand", "Küste"], ["Hotel", "Hostel"]],
    },
  },
  work: {
    label: "Arbeit",
    image: "assets/work.svg",
    words: {
      normal: ["Meeting", "Pitch", "Deadline", "Freelancer", "Start-up", "Workshop"],
      hard: [["Meeting", "Stand-up"], ["Pitch", "Präsentation"], ["Workshop", "Seminar"]],
    },
  },
};

const state = {
  category: "food",
  deck: [],
  revealedPlayers: new Set(),
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
};

function init() {
  hydrateFromStorage();
  renderCategories();
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

function generateRound() {
  const playerCount = Number(els.playerCount.value);
  const imposterCount = Number(els.imposterCount.value);
  if (playerCount < 3 || playerCount > 20) {
    return showValidation("Spieleranzahl muss zwischen 3 und 20 sein.");
  }
  if (imposterCount < 1 || imposterCount >= playerCount) {
    return showValidation("Imposter müssen >=1 und kleiner als Spieleranzahl sein.");
  }

  const difficulty = els.difficulty.value;
  const category = categories[state.category];
  const words = category.words[difficulty];

  let civilianWord;
  let imposterWord = "???";
  if (difficulty === "hard") {
    const pair = words[Math.floor(Math.random() * words.length)];
    civilianWord = pair[0];
    imposterWord = pair[1];
  } else {
    civilianWord = words[Math.floor(Math.random() * words.length)];
  }

  state.deck = Array.from({ length: playerCount }, (_, i) => ({
    index: i + 1,
    role: i < imposterCount ? "Imposter" : "Crew",
    word: i < imposterCount ? imposterWord : civilianWord,
  }));

  shuffle(state.deck);
  state.revealedPlayers.clear();
  showValidation(`Runde bereit: ${playerCount} Spieler · ${imposterCount} Imposter.`);
  persist();
}

function shuffleDeckOnly() {
  if (!state.deck.length) {
    return showValidation("Bitte zuerst eine Runde generieren.");
  }
  shuffle(state.deck);
  state.revealedPlayers.clear();
  showValidation("Rollen neu gemischt.");
  persist();
}

function revealCurrentPlayerRole() {
  const name = els.playerName.value.trim() || `Spieler ${state.revealedPlayers.size + 1}`;
  if (!state.deck.length) {
    return showValidation("Bitte zuerst Runde generieren.");
  }

  const card = state.deck[state.revealedPlayers.size];
  if (!card) {
    return showValidation("Alle Rollen wurden bereits angezeigt.");
  }

  state.revealedPlayers.add(name);
  els.roleResult.classList.remove("hidden");
  els.roleLabel.textContent = `${name}: ${card.role}`;
  els.roleWord.textContent = `Dein Begriff: ${card.word}`;
  els.roleImage.src = categories[state.category].image;
  els.roleImage.alt = `Bildkategorie ${categories[state.category].label}`;
  els.hint.textContent = card.role === "Imposter"
    ? "Tipp: Stelle kluge Fragen, ohne den Begriff zu kennen."
    : "Tipp: Gib subtile Hinweise ohne den Begriff zu verraten.";

  els.playerName.value = "";
  persist();
}

function showValidation(msg) {
  els.validationMessage.style.color = msg.includes("bereit") || msg.includes("gemischt") ? "#78f3d2" : "#ff6a8c";
  els.validationMessage.textContent = msg;
}

function startTimer() {
  if (state.timerId) return;
  state.timerId = setInterval(() => {
    if (state.remainingSeconds <= 0) {
      pauseTimer();
      showValidation("Zeit abgelaufen! Diskussion beenden und voten.");
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
  const mins = Math.max(1, Math.min(30, Number(els.roundMinutes.value) || 6));
  state.remainingSeconds = mins * 60;
  updateCountdown();
  persist();
}

function updateCountdown() {
  const mins = String(Math.floor(state.remainingSeconds / 60)).padStart(2, "0");
  const secs = String(state.remainingSeconds % 60).padStart(2, "0");
  els.countdown.textContent = `${mins}:${secs}`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function resetAll() {
  pauseTimer();
  localStorage.removeItem("imposterRoyaleState");
  location.reload();
}

function persist() {
  const serializable = {
    category: state.category,
    deck: state.deck,
    revealedCount: state.revealedPlayers.size,
    remainingSeconds: state.remainingSeconds,
    settings: {
      playerCount: els.playerCount.value,
      imposterCount: els.imposterCount.value,
      roundMinutes: els.roundMinutes.value,
      difficulty: els.difficulty.value,
    },
  };
  localStorage.setItem("imposterRoyaleState", JSON.stringify(serializable));
}

function hydrateFromStorage() {
  const raw = localStorage.getItem("imposterRoyaleState");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.category = parsed.category || state.category;
    state.deck = parsed.deck || [];
    state.remainingSeconds = parsed.remainingSeconds || state.remainingSeconds;
    els.playerCount.value = parsed.settings?.playerCount || els.playerCount.value;
    els.imposterCount.value = parsed.settings?.imposterCount || els.imposterCount.value;
    els.roundMinutes.value = parsed.settings?.roundMinutes || els.roundMinutes.value;
    els.difficulty.value = parsed.settings?.difficulty || els.difficulty.value;
  } catch {
    localStorage.removeItem("imposterRoyaleState");
  }
}

init();
