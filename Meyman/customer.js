// Customer App Logic (ICF Compliant)

function initCustomerApp() {
    renderMapAndFeed();
    setupCategoryTabs();
}

function renderMapAndFeed() {
    var currentState = loadState();
    var mapLayer = document.getElementById("interactive-map");
    var feedContainer = document.getElementById("happening-feed");

    mapLayer.innerHTML = "";
    feedContainer.innerHTML = "";

    if (currentState.offers.length === 0) {
        feedContainer.innerHTML = '<div style="background:white; padding:1rem; border-radius:var(--radius-md); text-align:center; flex:1;">No experiences happening right now.</div>';
        return;
    }

    for (var i = 0; i < currentState.offers.length; i++) {
        var offer = currentState.offers[i];

        // Ensure spot count takes bookings into consideration for the customer view.
        var bookedCount = 0;
        for (var j = 0; j < currentState.bookings.length; j++) {
            if (currentState.bookings[j].offerId === offer.id) bookedCount++;
        }
        var availableSpots = offer.spots - bookedCount;

        // Create Map Pin
        var pin = document.createElement("div");
        pin.className = "map-pin";
        // Convert pseudo-lat/lng offsets into literal percentages for CSS
        pin.style.left = offer.location.x + "%";
        pin.style.top = offer.location.y + "%";
        
        // Pass index to avoid closure loop issues without arrow funcs
        pin.setAttribute("data-index", i.toString());
        pin.onclick = function() {
            var index = Number(this.getAttribute("data-index"));
            openOfferModal(index);
        };
        mapLayer.appendChild(pin);

        // Create Horizontal Feed Card
        var card = document.createElement("div");
        card.className = "offer-card";
        
        // Use realistic image placeholders based on category
        var imgUrl = "data:image/svg+xml;utf8,<svg viewBox='0 0 100 100' fill='%23f1f5f9' xmlns='http://www.w3.org/2000/svg'><rect width='100' height='100'/></svg>";
        if (offer.category === "Food") imgUrl = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80";
        if (offer.category === "Stay") imgUrl = "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=400&q=80";

        var spotsNotice = availableSpots > 0 ? availableSpots + " spots left" : "Fully Booked";
        var buttonDisabled = availableSpots <= 0 ? "disabled" : "";

        card.innerHTML = 
            '<div class="offer-card-img" style="background-image: url(\'' + imgUrl + '\');">' +
                '<div class="live-badge">LIVE</div>' +
            '</div>' +
            '<div class="offer-card-body">' +
                '<div class="offer-meta">📍 200m away • ⭐ 4.9 (32)</div>' +
                '<div class="offer-title">' + offer.title + '</div>' +
                '<div class="offer-host">' +
                    '<div class="host-avatar">🧑</div>' + offer.hostName +
                '</div>' +
                '<div class="offer-price-row">' +
                    '<div class="offer-price">' + offer.price + ' <span>KGS / person</span></div>' +
                    '<div class="spots-badge">' + spotsNotice + '</div>' +
                '</div>' +
                '<button class="btn btn-primary" ' + buttonDisabled + ' onclick="bookOffer(\'' + offer.id + '\')">Book Now</button>' +
            '</div>';
            
        feedContainer.appendChild(card);
    }
}

function openOfferModal(index) {
    var currentState = loadState();
    var offer = currentState.offers[index];
    if (!offer) return;

    var bookedCount = 0;
    for (var j = 0; j < currentState.bookings.length; j++) {
        if (currentState.bookings[j].offerId === offer.id) bookedCount++;
    }
    var availableSpots = offer.spots - bookedCount;

    var sheet = document.getElementById("booking-sheet");
    sheet.innerHTML = 
        '<div class="sheet-handle"></div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<div class="offer-host"><div class="host-avatar">🧑</div> <span style="font-weight:700; color:var(--text-primary); margin-left:8px;">' + offer.hostName + '</span></div>' +
            '<button class="btn-icon" style="box-shadow:none; border:none; width:36px; height:36px; background:var(--border-color); color:var(--text-primary);" onclick="closeOfferModal()">✕</button>' +
        '</div>' +
        '<div class="offer-meta" style="margin-top:0.5rem;">' + offer.category + ' • 📍 ~200m away</div>' +
        '<h2 style="margin-top:0.5rem; font-size: 1.5rem; color:var(--text-primary);">' + offer.title + '</h2>' +
        '<div style="background:var(--bg-main); padding:1.25rem; border-radius:var(--radius-md); margin-top:1rem; border:1px solid var(--border-color);">' +
            '<div style="font-size:1.75rem; font-weight:800; color:var(--primary);">' + offer.price + ' <span style="font-size:1rem; font-weight:600; color:var(--text-secondary);">KGS / person</span></div>' +
            '<div style="color:var(--text-primary); font-weight:600; margin-top:6px; display:flex; align-items:center; gap:6px;">' + 
                (availableSpots > 0 ? "<span style='color:#34c759;'>●</span> Available NOW (" + availableSpots + " left)" : "<span style='color:var(--primary);'>●</span> Fully Booked") + 
            '</div>' +
        '</div>' +
        '<div style="display:flex; gap:1rem; margin-top:1.5rem;">' +
            '<button class="btn btn-outline" style="flex:1;">Chat</button>' +
            '<button class="btn btn-primary" style="flex:2;" ' + (availableSpots <= 0 ? "disabled" : "") + ' onclick="bookOffer(\'' + offer.id + '\')">Book Now</button>' +
        '</div>';

    document.getElementById("booking-modal").classList.remove("hidden");
}

function closeOfferModal() {
    document.getElementById("booking-modal").classList.add("hidden");
}

function bookOffer(offerId) {
    // Utilize exactly the ICF 7-stage engine from shared-state.js
    var payload = {
        offerId: offerId
    };

    var result = executeAction("BOOK_OFFER", payload);

    if (result.success) {
        alert("Booking successful! Your host is notified.");
        closeOfferModal();
        renderMapAndFeed(); // Re-render to update spotted values
    } else {
        alert("Booking failed: " + result.error);
    }
}

function setupCategoryTabs() {
    var pills = document.getElementsByClassName("cat-pill");
    for (var i = 0; i < pills.length; i++) {
        pills[i].onclick = function() {
            for (var j = 0; j < pills.length; j++) pills[j].classList.remove("active");
            this.classList.add("active");
        };
    }
}

// Request Modal Handlers
function openRequestModal() {
    document.getElementById("request-description").value = "";
    document.getElementById("request-category").value = "Food";
    document.getElementById("request-modal").classList.remove("hidden");
}

function closeRequestModal() {
    document.getElementById("request-modal").classList.add("hidden");
}

function submitRequest() {
    var desc = document.getElementById("request-description").value;
    var cat = document.getElementById("request-category").value;
    
    if (!desc) {
        alert("Please describe what you are looking for!");
        return;
    }
    
    var payload = {
        description: desc,
        category: cat
    };
    
    var result = executeAction("CREATE_REQUEST", payload);
    
    if (result.success) {
        closeRequestModal();
        alert("Your request has been sent to locals nearby!");
    } else {
        alert("Failed to send request: " + result.error);
    }
}

// Dummy Feature Handlers for Hackathon MVP
function openDummyFeature(featureName) {
    var sheet = document.getElementById("dummy-feature-sheet");
    var htmlContent = '<div class="sheet-handle"></div>';
    htmlContent += '<div style="display:flex; justify-content:space-between; align-items:center;">';
    htmlContent += '<h2 style="font-size:1.5rem; color:var(--text-primary);">' + featureName + '</h2>';
    htmlContent += '<button class="btn-icon" style="box-shadow:none; border:none; width:36px; height:36px; background:var(--border-color); color:var(--text-primary);" onclick="closeDummyFeature()">✕</button>';
    htmlContent += '</div>';
    
    if (featureName === 'Bookings') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">';
        htmlContent += '<div style="background:var(--bg-main); padding:1rem; border-radius:12px; border:1px solid var(--border-color);"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">Hiking in Ala Archa</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Tomorrow, 10:00 AM • 2 spots</div><div style="margin-top:8px;"><span style="background:#e8f5e9; color:#2e7d32; padding:4px 8px; border-radius:8px; font-size:0.75rem; font-weight:600;">Confirmed</span></div></div>';
        htmlContent += '<div style="background:var(--bg-main); padding:1rem; border-radius:12px; border:1px solid var(--border-color);"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">Osh Bazaar Food Tour</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Next Saturday, 12:00 PM • 1 spot</div><div style="margin-top:8px;"><span style="background:#fff3e0; color:#ef6c00; padding:4px 8px; border-radius:8px; font-size:0.75rem; font-weight:600;">Pending Host</span></div></div>';
        htmlContent += '</div>';
    } else if (featureName === 'Inbox') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">';
        htmlContent += '<div style="display:flex; gap:12px; align-items:center;"><div style="width:48px; height:48px; border-radius:50%; background:#e0e0e0; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">🧑</div><div style="flex:1;"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">Aigul</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">Looking forward to our trip tomorrow!</div></div><div style="width:10px; height:10px; background:var(--primary); border-radius:50%;"></div></div>';
        htmlContent += '<div style="display:flex; gap:12px; align-items:center;"><div style="width:48px; height:48px; border-radius:50%; background:#e0e0e0; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">👩</div><div style="flex:1;"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">Beksultan</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">Thanks for booking. Do you need...</div></div></div>';
        htmlContent += '</div>';
    } else if (featureName === 'Profile') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem;">';
        htmlContent += '<div style="width:80px; height:80px; border-radius:50%; background:#e0e0e0; display:flex; align-items:center; justify-content:center; font-size:2.5rem;">😎</div>';
        htmlContent += '<div style="font-weight:700; font-size:1.2rem; color:var(--text-primary);">Hackathon Guest</div>';
        htmlContent += '<div style="font-size:0.9rem; color:var(--text-secondary);">Joined April 2026</div>';
        htmlContent += '</div>';
        htmlContent += '<div style="margin-top:2rem; display:flex; flex-direction:column; gap:0.5rem;">';
        htmlContent += '<button class="btn btn-outline" style="width:100%; text-align:left; padding:1rem; border-color:transparent; background:var(--bg-main); color:var(--text-primary);">Payment Methods <span style="float:right;">&rarr;</span></button>';
        htmlContent += '<button class="btn btn-outline" style="width:100%; text-align:left; padding:1rem; border-color:transparent; background:var(--bg-main); color:var(--text-primary);">Language (EN) <span style="float:right;">&rarr;</span></button>';
        htmlContent += '<button class="btn btn-outline" style="width:100%; text-align:left; padding:1rem; border-color:transparent; background:var(--bg-main); color:var(--primary);">Log Out <span style="float:right;">&rarr;</span></button>';
        htmlContent += '</div>';
    }

    sheet.innerHTML = htmlContent;
    document.getElementById("dummy-feature-modal").classList.remove("hidden");
}

function closeDummyFeature() {
    document.getElementById("dummy-feature-modal").classList.add("hidden");
}

// Boot application
window.onload = function() {
    initCustomerApp();
    
    // Initialize 2GIS Map Background
    if (typeof DG !== 'undefined') {
        DG.then(function() {
            DG.map('map-bg-layer', {
                center: [42.8746, 74.5698], // Bishkek center
                zoom: 13,
                zoomControl: false,
                fullscreenControl: false
            });
        });
    }
};
