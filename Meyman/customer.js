// Customer App Logic (ICF Compliant)

function initCustomerApp() {
    renderMapAndFeed();
    setupCategoryTabs();
    setupBottomSheetDrag();
}

function switchTab(tabId) {
    var tabs = ["map", "explore"];
    for (var i = 0; i < tabs.length; i++) {
        var btn = document.getElementById("btn-tab-" + tabs[i]);
        var view = document.getElementById("view-" + tabs[i]);
        if (btn) btn.classList.remove("active");
        if (view) {
            view.classList.add("hidden");
            view.classList.remove("active");
        }
    }
    
    var activeBtn = document.getElementById("btn-tab-" + tabId);
    var activeView = document.getElementById("view-" + tabId);
    if (activeBtn) activeBtn.classList.add("active");
    if (activeView) {
        activeView.classList.remove("hidden");
        activeView.classList.add("active");
    }

    if (tabId === "explore") {
        renderExploreFeed();
    }
}

function renderExploreFeed() {
    var currentState = loadState();
    
    // Render Categories
    var cats = ["food", "outdoors"];
    var catsFilter = ["Food", "Events"]; 
    for (var c=0; c<cats.length; c++) {
        var container = document.getElementById("explore-cat-" + cats[c]);
        if (!container) continue;
        container.innerHTML = "";
        for (var i=0; i<currentState.offers.length; i++) {
            var offer = currentState.offers[i];
            if (offer.category === catsFilter[c] || (c===1 && offer.category==="Transport")) {
                var card = document.createElement("div");
                card.className = "offer-card";
                card.style.minWidth = "220px";
                card.style.width = "220px";
                var imgUrl = offer.category === "Food" ? "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80" : "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=400&q=80";
                card.innerHTML = '<div class="offer-card-img" style="background-image:url(\''+imgUrl+'\'); height:120px;"></div><div class="offer-card-body" style="padding:0.8rem;"><div class="offer-title" style="font-size:1rem;">'+offer.title+'</div><div class="offer-price-row" style="margin-top:0.2rem;"><div class="offer-price" style="font-size:1rem;">'+offer.price+' KGS</div></div></div>';
                card.onclick = (function(idx) { return function() { openOfferModal(idx); }; })(i);
                container.appendChild(card);
            }
        }
    }

    // Render Vertical Feed
    var feedContainer = document.getElementById("explore-vertical-feed");
    if(!feedContainer) return;
    feedContainer.innerHTML = "";
    
    var filter = window.currentCategoryFilter || "All";
    
    for (var i = 0; i < currentState.offers.length; i++) {
        var offer = currentState.offers[i];
        if (filter !== "All" && offer.category !== filter) continue;

        var card = document.createElement("div");
        card.className = "explore-card";
        var imgUrl = offer.category === "Food" ? "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80" : "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=600&q=80";
        
        var bookedCount = 0;
        for (var j = 0; j < currentState.bookings.length; j++) {
            if (currentState.bookings[j].offerId === offer.id) bookedCount++;
        }
        var availableSpots = offer.spots - bookedCount;
        var spotsNotice = availableSpots > 0 ? availableSpots + " spots left" : "Fully Booked";

        card.innerHTML = 
            '<div class="explore-card-img" style="background-image: url(\'' + imgUrl + '\');"></div>' +
            '<div class="explore-card-overlay">' +
                '<div class="explore-card-meta">📍 200m away • ⭐ 4.9 • 2 hours</div>' +
                '<div class="explore-card-title">' + offer.title + '</div>' +
                '<div class="explore-card-footer">' +
                    '<div class="explore-card-price">' + offer.price + ' <span>KGS</span></div>' +
                    '<button class="btn btn-primary" style="width:auto; padding:0.6rem 1.2rem; margin:0; border-radius:12px; box-shadow:0 4px 12px rgba(211,47,47,0.4);" onclick="event.stopPropagation(); bookOffer(\''+offer.id+'\')">Book Now</button>' +
                '</div>' +
            '</div>';
        
        card.onclick = (function(idx) { return function() { openOfferModal(idx); }; })(i);
        feedContainer.appendChild(card);
    }
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

    var filter = window.currentCategoryFilter || "All";

    for (var i = 0; i < currentState.offers.length; i++) {
        var offer = currentState.offers[i];
        if (filter !== "All" && offer.category !== filter) continue;

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
        var urgencyTag = offer.urgency || "LIVE";

        card.innerHTML = 
            '<div class="offer-card-img" style="background-image: url(\'' + imgUrl + '\');">' +
                '<div class="live-badge">' + urgencyTag + '</div>' +
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

    var imgUrl = offer.category === "Food" ? "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80" : "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=400&q=80";

    var sheet = document.getElementById("booking-sheet");
    sheet.innerHTML = 
        '<div class="sheet-handle" id="booking-sheet-handle"></div>' +
        '<div style="width:100%; height:180px; border-radius:var(--radius-md); background:url(\''+imgUrl+'\') center/cover; margin-bottom:1rem;"></div>' +
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
    
    // Set default half-visible state
    sheet.style.transform = 'translateY(30%)';
    setTimeout(function() {
        sheet.style.transform = 'translateY(30%)';
    }, 10);
}

var currentY = 0;
function setupBottomSheetDrag() {
    var sheet = document.getElementById("booking-sheet");
    var startY = 0;
    var currentTransform = 0;

    sheet.addEventListener("touchstart", function(e) {
        startY = e.touches[0].clientY;
        var style = window.getComputedStyle(sheet);
        var matrix = new WebKitCSSMatrix(style.transform);
        currentTransform = matrix.m42;
        sheet.classList.add("dragging");
    });

    sheet.addEventListener("touchmove", function(e) {
        var deltaY = e.touches[0].clientY - startY;
        var newY = currentTransform + deltaY;
        if (newY < 0) newY = 0; // Don't drag past fully open
        sheet.style.transform = 'translateY(' + newY + 'px)';
        currentY = newY;
    });

    sheet.addEventListener("touchend", function(e) {
        sheet.classList.remove("dragging");
        // Snap logic
        var threshold = window.innerHeight * 0.2;
        if (currentY > threshold * 2) {
            closeOfferModal();
        } else if (currentY > threshold) {
            sheet.style.transform = 'translateY(30%)'; // Snap half
        } else {
            sheet.style.transform = 'translateY(0%)'; // Snap full
        }
    });
}

function closeOfferModal() {
    var sheet = document.getElementById("booking-sheet");
    sheet.style.transform = 'translateY(100%)';
    setTimeout(function() {
        document.getElementById("booking-modal").classList.add("hidden");
    }, 300); // match transition duration
}

function bookOffer(offerId) {
    // Utilize exactly the ICF 7-stage engine from shared-state.js
    var payload = {
        offerId: offerId
    };

    var result = executeAction("BOOK_OFFER", payload);

    if (result.success) {
        closeOfferModal();
        
        // Show success animation overlay
        var overlay = document.getElementById("success-overlay");
        var content = document.getElementById("success-content");
        overlay.classList.remove("hidden");
        
        setTimeout(function() {
            content.style.opacity = "1";
            content.style.transform = "scale(1)";
        }, 10);
        
        setTimeout(function() {
            content.style.opacity = "0";
            content.style.transform = "scale(0.8)";
            setTimeout(function() {
                overlay.classList.add("hidden");
                renderMapAndFeed(); 
                if(!document.getElementById("view-explore").classList.contains("hidden")) {
                    renderExploreFeed();
                }
            }, 400);
        }, 2000);
        
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
            
            window.currentCategoryFilter = this.innerText.trim();
            renderMapAndFeed();
            if(!document.getElementById("view-explore").classList.contains("hidden")) {
                renderExploreFeed();
            }
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

// Review Modal Handlers
function openReviewModal(offerId) {
    document.getElementById("review-offer-id").value = offerId;
    document.getElementById("review-rating").value = "5";
    document.getElementById("review-comment").value = "";
    
    // Close the dummy sheet if it's open
    closeDummyFeature();
    document.getElementById("review-modal").classList.remove("hidden");
}

function closeReviewModal() {
    document.getElementById("review-modal").classList.add("hidden");
}

function submitReview() {
    var offerId = document.getElementById("review-offer-id").value;
    var rating = document.getElementById("review-rating").value;
    var comment = document.getElementById("review-comment").value;
    
    if (!comment) {
        alert("Please write a short comment for your review!");
        return;
    }
    
    var payload = {
        offerId: offerId,
        rating: rating,
        comment: comment
    };
    
    var result = executeAction("CREATE_REVIEW", payload);
    
    if (result.success) {
        closeReviewModal();
        alert("Thank you! Your review has been published.");
    } else {
        alert("Failed to submit review: " + result.error);
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
        var currentState = loadState();
        var myBookings = currentState.bookings; // Real state bookings
        
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">';
        
        for (var b = 0; b < myBookings.length; b++) {
            var booking = myBookings[b];
            var offerDetail = null;
            for (var o = 0; o < currentState.offers.length; o++) {
                if (currentState.offers[o].id === booking.offerId) {
                    offerDetail = currentState.offers[o];
                    break;
                }
            }
            if (offerDetail) {
                htmlContent += '<div style="background:var(--bg-main); padding:1rem; border-radius:12px; border:1px solid var(--border-color);">';
                htmlContent += '<div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">' + offerDetail.title + '</div>';
                htmlContent += '<div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Booked on ' + new Date(booking.timestamp).toLocaleDateString() + '</div>';
                htmlContent += '<div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">';
                htmlContent += '<span style="background:#e8f5e9; color:#2e7d32; padding:4px 8px; border-radius:8px; font-size:0.75rem; font-weight:600;">Confirmed</span>';
                htmlContent += '<button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="openReviewModal(\'' + offerDetail.id + '\')">Leave Review</button>';
                htmlContent += '</div></div>';
            }
        }
        
        // Static dummy past booking
        htmlContent += '<div style="background:var(--bg-main); padding:1rem; border-radius:12px; border:1px solid var(--border-color);"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">Hiking in Ala Archa</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Past Experience</div><div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;"><span style="background:#e0e0e0; color:var(--text-secondary); padding:4px 8px; border-radius:8px; font-size:0.75rem; font-weight:600;">Completed</span><button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="openReviewModal(\'dummy_offer_1\')">Leave Review</button></div></div>';
        
        htmlContent += '</div>';
    } else if (featureName === 'Inbox') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">';
        
        var currentState = loadState();
        var myBookings = currentState.bookings; // Real state bookings
        
        if (myBookings.length > 0) {
            for (var b = 0; b < myBookings.length; b++) {
                var booking = myBookings[b];
                var offerDetail = null;
                for (var o = 0; o < currentState.offers.length; o++) {
                    if (currentState.offers[o].id === booking.offerId) {
                        offerDetail = currentState.offers[o];
                        break;
                    }
                }
                if (offerDetail) {
                    htmlContent += '<div style="display:flex; gap:12px; align-items:center;"><div style="width:48px; height:48px; border-radius:50%; background:#e0e0e0; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">🧑</div><div style="flex:1;"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">' + offerDetail.hostName + '</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">Thanks for booking ' + offerDetail.title + '! See you soon.</div></div><div style="width:10px; height:10px; background:var(--primary); border-radius:50%;"></div></div>';
                }
            }
        } else {
            htmlContent += '<div style="display:flex; gap:12px; align-items:center;"><div style="width:48px; height:48px; border-radius:50%; background:#e0e0e0; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">🧑</div><div style="flex:1;"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">Meyman Support</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">Welcome to Meyman! Explore our local experiences.</div></div></div>';
        }
        
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
