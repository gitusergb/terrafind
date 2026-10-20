
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const results = document.getElementById("results-grid");
const resultCount = document.getElementById("result-count");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();

  if (!query) return;

  results.innerHTML = "";
  resultCount.textContent = `Searching for "${query}"...`;

  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=500&format=json&origin=*`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    const images = Object.values(data.query?.pages || {});

    results.innerHTML = "";

    images.forEach((item) => {
      const imageInfo = item.imageinfo?.[0];

      if (!imageInfo) return;

      const card = document.createElement("article");
      card.className = "image-card";

      const link = document.createElement("a");
      link.href = imageInfo.descriptionurl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const image = document.createElement("img");
      image.src = imageInfo.thumburl || imageInfo.url;
      image.alt = item.title.replace(/^File:/, "");
      image.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent = item.title.replace(/^File:/, "");

      link.appendChild(image);
      card.appendChild(link);
      card.appendChild(caption);
      results.appendChild(card);
    });

    resultCount.textContent = images.length
      ? `Showing ${images.length} results for "${query}"`
      : `No images found for "${query}". Try another search.`;
  } catch (error) {
    resultCount.textContent = "Unable to load images. Please try again.";
    console.error(error);
  }
});
