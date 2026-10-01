/* =====================================================
   HOSTEL DATA
   To add a hostel: copy one object, paste it at the end
   (before the closing ]), change the values, add a comma.
   Put 3-5 images in the images/ folder and list them below.
   roomType must be: "Single", "2-in-1", "3-in-1", "4-in-1" or "5-in-1"
   price = per year in GH₵, distance = km from campus
   ===================================================== */
const hostels = [
  { id: 1, name: "Golden View Hostel", location: "Koforidua, near KTU", price: 3500, distance: 1.2, roomType: "2-in-1",
    description: "Comfortable student hostel located close to campus with easy access to transportation and shops.",
    facilities: ["Water", "Electricity", "Wi-Fi", "Kitchen", "Washroom", "Parking"],
    images: ["A1.jpeg", "A2.jpeg", "A3.jpeg", "A4.jpeg", "A5.jpeg"] },
  { id: 2, name: "Blue Haven Lodge", location: "Effiduase, Koforidua", price: 2800, distance: 0.6, roomType: "4-in-1",
    description: "Affordable shared rooms a short walk from the lecture halls, with a quiet reading area.",
    facilities: ["Water", "Electricity", "Wi-Fi", "Washroom"],
    images: ["A6.jpeg", "A7.jpeg", "A8.jpeg", "A9.jpeg"] },
  { id: 3, name: "Scholars' Court", location: "Adweso, Koforidua", price: 5200, distance: 2.4, roomType: "Single",
    description: "Private single rooms with a study desk, ideal for students who want peace and quiet.",
    facilities: ["Water", "Electricity", "Wi-Fi", "Kitchen", "Washroom", "Security", "Parking"],
    images: ["B1.jpeg", "B2.jpeg", "B3.jpeg", "B4.jpeg"] },
  { id: 4, name: "Unity Hostel", location: "Zongo, Koforidua", price: 2200, distance: 3.1, roomType: "5-in-1",
    description: "Budget-friendly hostel with a friendly community atmosphere and regular transport to campus.",
    facilities: ["Water", "Electricity", "Washroom"],
    images: ["A1.jpeg", "A2.jpeg", "A3.jpeg"] },
  { id: 5, name: "Royal Palms Hostel", location: "Koforidua, near KTU", price: 4300, distance: 0.8, roomType: "3-in-1",
    description: "Modern rooms, tiled floors and a spacious compound, just minutes from the main gate.",
    facilities: ["Water", "Electricity", "Wi-Fi", "Kitchen", "Washroom", "Security"],
    images: ["A4.jpeg", "A5.jpeg", "A6.jpeg", "A7.jpeg", "A8.jpeg"] },
  { id: 6, name: "Campus Edge Residence", location: "Old Estate, Koforidua", price: 3900, distance: 0.3, roomType: "2-in-1",
    description: "The closest hostel to campus. Wake up ten minutes before class and still make it.",
    facilities: ["Water", "Electricity", "Wi-Fi", "Washroom", "Security"],
    images: ["A9.jpeg", "B1.jpeg", "B2.jpeg"] }
];

/* ---------- Settings ---------- */
const WHATSAPP_NUMBER = "233595943783";

/* ---------- Page elements ---------- */
const $ = (id) => document.getElementById(id);
const grid = $("hostelGrid"), countEl = $("resultCount");
const searchInput = $("searchInput"), roomFilter = $("roomFilter"), priceFilter = $("priceFilter");
const distanceFilter = $("distanceFilter"), sortSelect = $("sortSelect");
const modal = $("modal"), modalContent = $("modalContent");
const lightbox = $("lightbox"), lbImg = $("lbImg");

let currentHostel = null;   // hostel open in the modal
let currentIndex = 0;       // image shown in the gallery / lightbox

/* ---------- Helpers ---------- */
const money = (n) => "GH₵" + n.toLocaleString("en-US");

// Shown automatically if an image file is missing, so the site never looks broken
function placeholder(label) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='800' height='600' fill='#e0e7ff'/><text x='400' y='290' font-size='64' text-anchor='middle'>🏠</text><text x='400' y='350' font-size='28' fill='#4338ca' text-anchor='middle' font-family='sans-serif'>${label}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function imgTag(src, hostel, cls = "", extra = "") {
  const fallback = placeholder(hostel.name.replace(/[<>&']/g, ""));
  return `<img src="${src}" alt="${hostel.name}" ${cls ? `class="${cls}"` : ""} ${extra} loading="lazy" onerror="this.onerror=null;this.src='${fallback}'">`;
}

/* ---------- Render cards ---------- */
function renderHostels(list) {
  countEl.textContent = `${list.length} Hostel${list.length === 1 ? "" : "s"} Found`;
  if (!list.length) {
    grid.innerHTML = `<p class="empty">No hostels match your search. Try clearing a filter.</p>`;
    return;
  }
  grid.innerHTML = list.map((h) => `
    <article class="card" data-id="${h.id}">
      ${imgTag(h.images[0], h)}
      <div class="card-body">
        <h3>${h.name}</h3>
        <span>📍 ${h.location}</span>
        <span class="price">💰 ${money(h.price)}/year</span>
        <span>📏 ${h.distance} km from campus</span>
        <span class="badge">🛏️ ${h.roomType}</span>
        <p class="desc">${h.description}</p>
        <button class="btn" data-id="${h.id}">View Details</button>
      </div>
    </article>`).join("");
}

/* ---------- Search + filters + sorting (all work together) ---------- */
function getFilteredHostels() {
  const q = searchInput.value.trim().toLowerCase();
  const room = roomFilter.value;
  const maxPrice = priceFilter.value === "all" ? Infinity : Number(priceFilter.value);
  const maxDist = distanceFilter.value === "all" ? Infinity : Number(distanceFilter.value);

  const list = hostels.filter((h) => {
    // Searchable text: name, location, room, price and distance
    const text = `${h.name} ${h.location} ${h.roomType} ${h.price} ${h.distance} ${h.distance}km`.toLowerCase();
    return (!q || q.split(/\s+/).every((word) => text.includes(word)))
      && (room === "All" || h.roomType === room)
      && h.price <= maxPrice
      && h.distance <= maxDist;
  });

  const sorters = {
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    distAsc: (a, b) => a.distance - b.distance,
    distDesc: (a, b) => b.distance - a.distance,
    nameAsc: (a, b) => a.name.localeCompare(b.name),
    nameDesc: (a, b) => b.name.localeCompare(a.name)
  };
  if (sorters[sortSelect.value]) list.sort(sorters[sortSelect.value]);
  return list;
}
function update() { renderHostels(getFilteredHostels()); }

/* ---------- Details modal ---------- */
function openModal(id) {
  currentHostel = hostels.find((h) => h.id === id);
  if (!currentHostel) return;
  const h = currentHostel;
  currentIndex = 0;
  modalContent.innerHTML = `
    ${imgTag(h.images[0], h, "main-img", 'id="mainImg" title="Click to enlarge"')}
    <div class="thumbs" id="thumbs">
      ${h.images.map((src, i) => imgTag(src, h, i === 0 ? "active" : "", `data-index="${i}"`)).join("")}
    </div>
    <h2>${h.name}</h2>
    <div class="info">
      <div><small>📍 Location</small><strong>${h.location}</strong></div>
      <div><small>💰 Price</small><strong>${money(h.price)} per year</strong></div>
      <div><small>📏 Distance</small><strong>${h.distance} km from campus</strong></div>
      <div><small>🛏️ Room</small><strong>${h.roomType}</strong></div>
    </div>
    <h4>Facilities</h4>
    <ul class="facilities">${h.facilities.map((f) => `<li>${f}</li>`).join("")}</ul>
    <h4>Description</h4>
    <p class="muted">${h.description}</p>
    <button class="btn whatsapp" id="bookBtn">Book on WhatsApp</button>`;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-box").scrollTop = 0;
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ---------- Gallery ---------- */
function showImage(index) {
  const imgs = currentHostel.images;
  currentIndex = (index + imgs.length) % imgs.length;      // wraps around
  const main = $("mainImg");
  if (main) main.src = imgs[currentIndex];
  document.querySelectorAll("#thumbs img").forEach((t, i) => t.classList.toggle("active", i === currentIndex));
  if (lightbox.classList.contains("open")) updateLightbox();
}
const nextImage = () => showImage(currentIndex + 1);
const prevImage = () => showImage(currentIndex - 1);

/* ---------- Lightbox (enlarged image) ---------- */
function updateLightbox() {
  const imgs = currentHostel.images;
  lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = placeholder(currentHostel.name); };
  lbImg.src = imgs[currentIndex];
  $("lbCount").textContent = `${currentIndex + 1} / ${imgs.length}`;
}
function openLightbox() { lightbox.classList.add("open"); updateLightbox(); }
function closeLightbox() { lightbox.classList.remove("open"); }

/* ---------- WhatsApp booking (uses the selected hostel's details) ---------- */
function bookOnWhatsApp(hostel) {
  const message = `Hello, I am interested in booking this hostel.

Hostel: ${hostel.name}
Location: ${hostel.location}
Price: ${money(hostel.price)}/year
Room: ${hostel.roomType}
Distance: ${hostel.distance} km from campus

Please provide more information about availability and booking.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

/* ---------- Mobile menu ---------- */
const nav = $("nav"), menuBtn = $("menuBtn");
function toggleMenu(force) {
  const open = typeof force === "boolean" ? force : !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.textContent = open ? "✕" : "☰";
}

/* ---------- Events ---------- */
[searchInput, roomFilter, priceFilter, distanceFilter, sortSelect].forEach((el) =>
  el.addEventListener(el === searchInput ? "input" : "change", update));

// Hero search: copy the text into the main search and jump to the list
function heroSearch() {
  searchInput.value = $("heroSearch").value;
  update();
  $("hostels").scrollIntoView({ behavior: "smooth" });
}
$("heroBtn").addEventListener("click", heroSearch);
$("heroSearch").addEventListener("keydown", (e) => { if (e.key === "Enter") heroSearch(); });

// One click listener for the whole grid (cards + View Details buttons)
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) openModal(Number(card.dataset.id));
});

// Clicks inside the modal: thumbnails, main image, WhatsApp button
modalContent.addEventListener("click", (e) => {
  if (e.target.matches("#thumbs img")) showImage(Number(e.target.dataset.index));
  else if (e.target.id === "mainImg") openLightbox();
  else if (e.target.id === "bookBtn") bookOnWhatsApp(currentHostel);
});
$("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });   // click outside

$("lbClose").addEventListener("click", closeLightbox);
$("lbNext").addEventListener("click", nextImage);
$("lbPrev").addEventListener("click", prevImage);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { lightbox.classList.contains("open") ? closeLightbox() : closeModal(); }
  if (lightbox.classList.contains("open")) {
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  }
});

menuBtn.addEventListener("click", () => toggleMenu());
nav.addEventListener("click", (e) => { if (e.target.tagName === "A") toggleMenu(false); });

// Swipe left/right in the lightbox on phones
let touchX = 0;
lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) dx < 0 ? nextImage() : prevImage();
});

/* ---------- Start ---------- */
update();