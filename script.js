
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const results = document.getElementById("results");
const emptyState = document.getElementById("empty-state");
const resultCount = document.getElementById("result-count");
const searchButton = document.getElementById("search-button");

let currentSearch = 0;

function showMessage(message, type = "info") {
  emptyState.textContent = message;
  emptyState.hidden = false;
  emptyState.dataset.state = type;
}

function clearMessage() {
  emptyState.textContent = "";
  emptyState.hidden = true;
  delete emptyState.dataset.state;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();

  if (!query) {
    input.focus();
    return;
  }

  const searchId = ++currentSearch;

  results.replaceChildren();
  resultCount.textContent = "";
  showMessage(`Searching for "${query}"...`, "loading");
  searchButton.disabled = true;
  searchButton.textContent = "Searching…";

  const url =
    "https://commons.wikimedia.org/w/api.php" +
    "?action=query" +
    "&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}` +
    "&gsrnamespace=6" +
    "&gsrlimit=12" +
    "&prop=imageinfo" +
    "&iiprop=url%7Csize" +
    "&iiurlwidth=500" +
    "&format=json" +
    "&origin=*";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (searchId !== currentSearch) return;

    const images = Object.values(data.query?.pages || {}).filter(
      (item) => item.imageinfo?.[0]?.thumburl || item.imageinfo?.[0]?.url
    );

    results.replaceChildren();

    if (images.length === 0) {
      showMessage(
        `No results for "${query}". Try another search.`,
        "empty"
      );
      resultCount.textContent = "0 results";
      return;
    }

    clearMessage();

    images.forEach((item) => {
      const imageInfo = item.imageinfo[0];
      const title = item.title.replace(/^File:/, "");

      const card = document.createElement("article");
      card.className = "image-card";

      const link = document.createElement("a");
      link.href = imageInfo.descriptionurl ||
        imageInfo.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `View ${title} on Wikimedia Commons`);

      const image = document.createElement("img");
      image.src = imageInfo.thumburl || imageInfo.url;
      image.alt = title;
      image.loading = "lazy";

      const caption = document.createElement("p");
      caption.className = "image-card__caption";
      caption.textContent = title;

      link.appendChild(image);
      card.appendChild(link);
      card.appendChild(caption);
      results.appendChild(card);
    });

    resultCount.textContent =
      `Showing ${images.length} results for "${query}"`;
  } catch (error) {
    if (searchId !== currentSearch) return;

    results.replaceChildren();
    resultCount.textContent = "";
    showMessage(
      "Something went wrong. Please check your connection and try again.",
      "error"
    );

    console.error("Image search failed:", error);
  } finally {
    if (searchId === currentSearch) {
      searchButton.disabled = false;
      searchButton.textContent = "Search";
    }
  }
});








// const form = document.getElementById("search-form");
// const input = document.getElementById("search-input");
// const results = document.getElementById("results-grid");
// const resultCount = document.getElementById("result-count");

// form.addEventListener("submit", async (event) => {
//   event.preventDefault();

//   const query = input.value.trim();

//   if (!query) return;

//   results.innerHTML = "";
//   resultCount.textContent = `Searching for "${query}"...`;

//   const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=500&format=json&origin=*`;

//   try {
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error(`Request failed: ${response.status}`);
//     }

//     const data = await response.json();
//     const images = Object.values(data.query?.pages || {});

//     results.innerHTML = "";

//     images.forEach((item) => {
//       const imageInfo = item.imageinfo?.[0];

//       if (!imageInfo) return;

//       const card = document.createElement("article");
//       card.className = "image-card";

//       const link = document.createElement("a");
//       link.href = imageInfo.descriptionurl;
//       link.target = "_blank";
//       link.rel = "noopener noreferrer";

//       const image = document.createElement("img");
//       image.src = imageInfo.thumburl || imageInfo.url;
//       image.alt = item.title.replace(/^File:/, "");
//       image.loading = "lazy";

//       const caption = document.createElement("p");
//       caption.textContent = item.title.replace(/^File:/, "");

//       link.appendChild(image);
//       card.appendChild(link);
//       card.appendChild(caption);
//       results.appendChild(card);
//     });

//     resultCount.textContent = images.length
//       ? `Showing ${images.length} results for "${query}"`
//       : `No images found for "${query}". Try another search.`;
//   } catch (error) {
//     resultCount.textContent = "Unable to load images. Please try again.";
//     console.error(error);
//   }
// });


