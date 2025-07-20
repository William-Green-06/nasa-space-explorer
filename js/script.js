const space_facts = [
    "Space is completely silent because there is no atmosphere to carry sound waves.",
    "Venus is actually hotter than Mercury, even though Mercury is closer to the Sun, due to Venus's thick, heat-trapping atmosphere.",
    "A single day on Venus is longer than its entire year because it rotates so slowly on its axis.",
    "Neutron stars are so dense that a single sugar-cube-sized amount of their material would weigh about a billion tons on Earth.",
    "There is a planet called 55 Cancri e that may be made largely of diamond because of its carbon-rich composition.",
    "The Sun makes up 99.86 percent of the total mass in our solar system, with most of the rest belonging to Jupiter.",
    "Space technically begins just 100 kilometers, or about 62 miles, above Earth at a point known as the Kármán line.",
    "There are more stars in the observable universe than there are grains of sand on all the beaches on Earth.",
    "Black holes can slowly lose mass and eventually disappear through a process known as Hawking radiation.",
    "Saturn is so light for its size that it would actually float in water, assuming you had a body of water large enough."
]

// Getter for NASA APOD
function getAPOD(startDate, endDate) {
  const api_key = "aCzELLweMaRIOH9tq3ZgRUw1DWOmrSFFDn8qEmlt";
  const url = `https://api.nasa.gov/planetary/apod?start_date=${startDate}&end_date=${endDate}&thumbs=true&api_key=${api_key}`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Request for APOD failed: ' + response.statusText);
      }
      return response.json();
    });
}

const subBtn = document.getElementById('submitBtn');

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const factBox = document.createElement('div'); // Create a box for the fact
factBox.id = 'space-fact';
factBox.style.margin = '20px 0';
factBox.style.fontStyle = 'italic';
factBox.style.textAlign = 'center';

// Insert the fact box above the gallery (only once)
const container = document.querySelector('.container');
container.insertBefore(factBox, document.getElementById('gallery'));

// Event listener for the submit button
subBtn.addEventListener('click', () => {
  // Pick a random fact
  const randomFact = space_facts[Math.floor(Math.random() * space_facts.length)];
  factBox.textContent = `Space Fact: ${randomFact}`;

  const startDate = startInput.value;
  const endDate = endInput.value;
  const gallery = document.getElementById('gallery');

  // Show loading message
  gallery.innerHTML = `
    <div class="loading-message" id="loadingMessage">
      <div class="loading-icon">🌑</div>
      <div class="loading-text">Loading space images...</div>
    </div>
  `;

  // Record the time when loading starts
  const loadingStart = Date.now();

  getAPOD(startDate, endDate)
    .then(data => {
      // Calculate how long loading has been shown
      const elapsed = Date.now() - loadingStart;
      const minTime = 2000; // 2 seconds

      // Function to show images after minimum time
      const showImages = () => {
        const images = Array.isArray(data) ? data : [data];
        window.lastGalleryItems = images;

        gallery.innerHTML = ""; // Clear loading message

        images.forEach(item => {
          const card = document.createElement('div');
          card.className = 'gallery-item';

          const infoRow = document.createElement('div');
          infoRow.className = 'info-row';

          const title = document.createElement('span');
          title.className = 'image-title';
          title.textContent = item.title;

          const date = document.createElement('span');
          date.className = 'image-date';
          date.textContent = item.date;

          infoRow.appendChild(title);
          infoRow.appendChild(date);

          let mediaHtml = "";
          if (item.media_type === "image") {
            mediaHtml = `<img src="${item.url}" alt="${item.title}" />`;
          } else if (item.media_type === "video") {
            const thumb = item.thumbnail_url || "https://placehold.co/500x200";
            mediaHtml = `<img src="${thumb}" alt="Video thumbnail for ${item.title}" />`;
          }

          card.innerHTML = mediaHtml;
          card.appendChild(infoRow);

          gallery.appendChild(card);
        });

        if (gallery.children.length === 0) {
          gallery.innerHTML = `
            <div class="placeholder">
              <div class="placeholder-icon">🔭</div>
              <p>No images found for this date range.</p>
            </div>
          `;
        }
      };

      // If less than 2 seconds, wait the remaining time
      if (elapsed < minTime) {
        setTimeout(showImages, minTime - elapsed);
      } else {
        showImages();
      }
    })
    .catch(error => {
      gallery.innerHTML = ""; // Hide loading message on error
      console.error('Error fetching APOD data:', error);
      alert('Failed to fetch images. Please try again later.');
    });
});

// Function to open the modal with image/video details
function openModal(item) {
  // Get modal elements
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMedia = document.getElementById('modal-media');
  const modalDesc = document.getElementById('modal-desc');
  const modalDate = document.getElementById('modal-date');

  // Set title
  modalTitle.textContent = item.title;

  // Set media (image or video)
  if (item.media_type === "image") {
    modalMedia.innerHTML = `<img src="${item.hdurl || item.url}" alt="${item.title}" />`;
  } else if (item.media_type === "video") {
    // Try to embed YouTube or Vimeo, else show thumbnail
    let embedHtml = "";
    if (item.url.includes("youtube.com") || item.url.includes("youtu.be")) {
      // YouTube embed
      const videoId = item.url.split("v=")[1] || item.url.split("/").pop();
      embedHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else if (item.url.includes("vimeo.com")) {
      // Vimeo embed
      const videoId = item.url.split("/").pop();
      embedHtml = `<iframe src="https://player.vimeo.com/video/${videoId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
    } else {
      // Fallback: show thumbnail
      const thumb = item.thumbnail_url || "https://placehold.co/500x200";
      embedHtml = `<img src="${thumb}" alt="Video thumbnail for ${item.title}" />`;
    }
    modalMedia.innerHTML = embedHtml;
  }

  // Set description
  modalDesc.textContent = item.explanation || "";

  // Set date
  modalDate.textContent = item.date;

  // Show modal
  modal.style.display = "flex";
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = "none";
}

// Add click listeners to gallery items
document.getElementById('gallery').addEventListener('click', function(e) {
  // Find the gallery-item that was clicked
  let card = e.target;
  while (card && !card.classList.contains('gallery-item')) {
    card = card.parentElement;
  }
  if (!card) return;

  // Find the index of the clicked card
  const cards = Array.from(document.querySelectorAll('.gallery-item'));
  const index = cards.indexOf(card);

  // Get the last loaded images from the previous fetch
  // We'll store them in a global variable for simplicity
  if (window.lastGalleryItems && window.lastGalleryItems[index]) {
    openModal(window.lastGalleryItems[index]);
  }
});

// Store the last loaded items for modal use
// Update your fetch code to save images:
getAPOD(startDate, endDate)
  .then(data => {
    const images = Array.isArray(data) ? data : [data];
    window.lastGalleryItems = images; // <-- Add this line

    // ...rest of your code...
  });

// Close modal when clicking the close button or outside modal-content
document.getElementById('modal-close').onclick = closeModal;
document.getElementById('modal').onclick = function(e) {
  if (e.target === this) closeModal();
};