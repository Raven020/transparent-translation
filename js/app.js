// Skip words - dimmed and not clickable
const SKIP_WORDS = new Set([
  "the", "a", "an", "and", "of", "to", "in", "for", "is", "that",
  "his", "was", "with", "not", "but", "by", "he", "him", "it", "all",
  "this", "which", "were", "are", "be", "been", "have", "had", "has",
  "her", "she", "they", "them", "their", "we", "us", "our", "you",
  "your", "who", "whom", "from", "or", "as", "at", "on", "no", "do",
  "did", "if", "so", "up", "my", "me", "i"
]);

const versesEl = document.getElementById("verses");
const overlay = document.getElementById("overlay");
const popout = document.getElementById("popout");
const popoutClose = document.getElementById("popout-close");
const bookSelect = document.getElementById("book-select");
const chapterSelect = document.getElementById("chapter-select");
const verseFrom = document.getElementById("verse-from");
const verseTo = document.getElementById("verse-to");
const heading = document.getElementById("chapter-heading");

function populateChapters(book) {
  chapterSelect.innerHTML = "";
  const chapters = Object.keys(VERSES[book]).map(Number).sort((a, b) => a - b);
  for (const ch of chapters) {
    const opt = document.createElement("option");
    opt.value = ch;
    opt.textContent = ch;
    chapterSelect.appendChild(opt);
  }
}

function isSkipWord(text, number) {
  if (!text) return true;
  if (!number || number === "") return true;
  if (SKIP_WORDS.has(text.toLowerCase())) return true;
  return false;
}

function renderVerses(book, chapter, fromVerse, toVerse) {
  versesEl.innerHTML = "";

  const chapterData = VERSES[book] && VERSES[book][chapter];
  if (!chapterData) return;

  const verseNums = Object.keys(chapterData).map(Number).sort((a, b) => a - b);
  const maxVerse = verseNums[verseNums.length - 1];

  const start = fromVerse || verseNums[0];
  const end = toVerse ? Math.min(toVerse, maxVerse) : maxVerse;

  // Update heading
  if (start === verseNums[0] && end === maxVerse) {
    heading.textContent = book + " " + chapter;
  } else if (start === end) {
    heading.textContent = book + " " + chapter + ":" + start;
  } else {
    heading.textContent = book + " " + chapter + ":" + start + "-" + end;
  }

  for (const num of verseNums) {
    if (num < start || num > end) continue;

    const words = chapterData[num];
    const verseDiv = document.createElement("div");
    verseDiv.className = "verse";

    const verseNum = document.createElement("sup");
    verseNum.className = "verse-num";
    verseNum.textContent = num;
    verseDiv.appendChild(verseNum);

    for (const w of words) {
      if (!w.t) continue;

      const span = document.createElement("span");
      span.textContent = w.t;

      if (isSkipWord(w.t, w.n)) {
        span.className = "word-skip";
      } else {
        span.className = "word";
        span.dataset.strongs = w.n;
        span.dataset.greek = w.g || "";
        span.dataset.english = w.t;
      }

      verseDiv.appendChild(span);
      verseDiv.appendChild(document.createTextNode(" "));
    }

    versesEl.appendChild(verseDiv);
  }
}

function showPopout(english, strongs, greek) {
  const entry = LEXICON[strongs];

  document.getElementById("popout-english").textContent = english;

  const greekEl = document.getElementById("popout-greek");
  greekEl.innerHTML = "";
  if (greek) {
    const greekSpan = document.createElement("span");
    greekSpan.className = "greek-word";
    greekSpan.textContent = greek;
    greekEl.appendChild(greekSpan);
  }
  if (entry && entry.word) {
    if (greek) greekEl.appendChild(document.createTextNode(" — "));
    greekEl.appendChild(document.createTextNode(entry.word));
  }

  document.getElementById("popout-strongs").textContent = strongs.toUpperCase();

  const defEl = document.getElementById("popout-def");
  if (entry) {
    defEl.textContent = entry.long || entry.def || "No definition available.";
  } else {
    defEl.textContent = "Definition not found.";
  }

  overlay.classList.remove("hidden");
  popout.classList.remove("hidden");
}

function hidePopout() {
  overlay.classList.add("hidden");
  popout.classList.add("hidden");
}

function applySelection() {
  const book = bookSelect.value;
  const chapter = parseInt(chapterSelect.value);
  const from = verseFrom.value ? parseInt(verseFrom.value) : null;
  const to = verseTo.value ? parseInt(verseTo.value) : null;
  renderVerses(book, chapter, from, to);
}

// Click handler for clickable words
versesEl.addEventListener("click", function (e) {
  const target = e.target;
  if (target.classList.contains("word") && target.dataset.strongs) {
    showPopout(target.dataset.english, target.dataset.strongs, target.dataset.greek);
  }
});

// Close popout
overlay.addEventListener("click", hidePopout);
popoutClose.addEventListener("click", hidePopout);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") hidePopout();
});

// When book changes, repopulate chapters, clear verse inputs, and render
bookSelect.addEventListener("change", function () {
  populateChapters(bookSelect.value);
  verseFrom.value = "";
  verseTo.value = "";
  applySelection();
});

// When chapter changes, clear verse inputs and render
chapterSelect.addEventListener("change", function () {
  verseFrom.value = "";
  verseTo.value = "";
  applySelection();
});

// When verse inputs change, render
verseFrom.addEventListener("input", applySelection);
verseTo.addEventListener("input", applySelection);

// Initialize and render default
populateChapters("Matthew");
renderVerses("Matthew", 1, null, null);
