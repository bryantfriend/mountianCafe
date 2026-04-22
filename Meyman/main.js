let mode = "tourist";

const touristBtn = document.getElementById("touristBtn");
const hostBtn = document.getElementById("hostBtn");

const touristView = document.getElementById("touristView");
const hostView = document.getElementById("hostView");

touristBtn.onclick = () => switchMode("tourist");
hostBtn.onclick = () => switchMode("host");

function switchMode(newMode) {
    mode = newMode;

    touristBtn.classList.remove("active");
    hostBtn.classList.remove("active");

    touristView.classList.remove("active");
    hostView.classList.remove("active");

    if (mode === "tourist") {
        touristBtn.classList.add("active");
        touristView.classList.add("active");
    } else {
        hostBtn.classList.add("active");
        hostView.classList.add("active");
    }

    render();
}

/* DATA */
const offers = [
    { title: "Boorsoks 🍞", price: 200, category: "Food", x: 100, y: 150 },
    { title: "Bazaar Tour 🛒", price: 300, category: "Event", x: 200, y: 80 }
];

/* ELEMENTS */
const feedList = document.getElementById("feed-list");
const mapArea = document.getElementById("map-area");
const details = document.getElementById("offer-details");
const hostOffers = document.getElementById("host-offers");

/* RENDER */
function render() {

    // TOURIST VIEW
    feedList.innerHTML = "";
    mapArea.innerHTML = "";

    offers.forEach((offer, index) => {

        // FEED
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `${offer.title} - ${offer.price} KGS`;
        card.onclick = () => showDetails(index);
        feedList.appendChild(card);

        // MAP PIN
        const pin = document.createElement("div");
        pin.className = "pin";
        pin.style.left = offer.x + "px";
        pin.style.top = offer.y + "px";
        pin.onclick = () => showDetails(index);
        mapArea.appendChild(pin);
    });

    // HOST VIEW
    hostOffers.innerHTML = "";

    offers.forEach((offer) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <strong>${offer.title}</strong><br>
            ${offer.price} KGS
        `;
        hostOffers.appendChild(card);
    });
}

/* DETAILS */
function showDetails(index) {
    const offer = offers[index];
    details.classList.remove("hidden");

    details.innerHTML = `
        <h3>${offer.title}</h3>
        <p>${offer.price} KGS</p>
        <button onclick="book()">Book Now</button>
    `;
}

function book() {
    alert("Booked! 🎉");
}

/* MODAL */
const modal = document.getElementById("modal");
const createBtn = document.getElementById("create-btn");

createBtn.onclick = () => modal.classList.remove("hidden");

function closeModal() {
    modal.classList.add("hidden");
}

/* ADD OFFER */
function addOffer() {
    const title = document.getElementById("title").value;
    const price = document.getElementById("price").value;
    const category = document.getElementById("category").value;

    offers.push({
        title,
        price,
        category,
        x: Math.random() * 300,
        y: Math.random() * 200
    });

    closeModal();
    render();
}

/* INIT */
render();