// Customer App Logic (ICF Compliant)

function initCustomerApp() {
    renderMapAndFeed();
    setupCategoryTabs();
    setupNeedNowTabs();
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

function getSortedOffers(offers) {
    var sorted = offers.slice();
    sorted.sort(function(a, b) {
        if (!!a.isLive === !!b.isLive) {
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        return a.isLive ? -1 : 1;
    });
    return sorted;
}

function getOfferImage(offer, width) {
    var size = width || 500;
    if (offer.category === "Food") return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=" + size + "&q=80";
    if (offer.category === "Stay") return "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=" + size + "&q=80";
    if (offer.category === "Essentials") return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=" + size + "&q=80";
    if (offer.category === "Services") return "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=" + size + "&q=80";
    return "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=" + size + "&q=80";
}

function getOfferBackground(offer, width) {
    return "linear-gradient(135deg, rgba(211,47,47,0.18), rgba(255,152,0,0.16)), url('" + getOfferImage(offer, width) + "')";
}

function getAvailabilityText(offer) {
    if (offer.isLive) return "Available now";
    return offer.startTime || offer.urgency || "Starting soon";
}

function renderTags(tags) {
    var safeTags = tags || [];
    var html = "";
    for (var i = 0; i < safeTags.length && i < 3; i++) {
        html += '<span class="tag">' + safeTags[i] + '</span>';
    }
    return html;
}

function renderExperienceCard(offer, options) {
    var opts = options || {};
    var imgUrl = getOfferImage(offer, opts.imageWidth || 500);
    var trustPills = renderBadgePills(offer.badges || getHostTrustBadges(offer.hostName));
    var liveHtml = offer.isLive ? '<div class="live-badge">LIVE NOW</div>' : "";
    var compactClass = opts.compact ? " compact-card" : "";

    return '' +
        '<div class="offer-card-img" style="background-image: ' + getOfferBackground(offer, opts.imageWidth || 500) + ';">' +
            liveHtml +
        '</div>' +
        '<div class="offer-card-body' + compactClass + '">' +
            '<div class="offer-title">' + offer.title + '</div>' +
            '<div class="availability-line ' + (offer.isLive ? "is-live" : "") + '">' + getAvailabilityText(offer) + '</div>' +
            '<div class="host-row">' +
                '<img class="host-avatar" src="' + offer.hostImage + '" alt="' + offer.hostName + '">' +
                '<div class="host-copy">' +
                    '<div class="host-name">' + offer.hostName + '</div>' +
                    '<div class="host-meta">⭐ ' + offer.rating + ' • ' + offer.distance + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="badge-pill-row">' + trustPills + '</div>' +
            '<div class="tag-row">' + renderTags(offer.tags) + '</div>' +
            '<div class="offer-price-row">' +
                '<div class="offer-price">' + offer.price + ' <span>KGS / person</span></div>' +
            '</div>' +
            (opts.hideButton ? '' : '<button class="btn btn-primary" onclick="event.stopPropagation(); bookOffer(\'' + offer.id + '\')">Book Now</button>') +
        '</div>';
}

function findOfferIndexById(offerId) {
    var currentState = loadState();
    for (var i = 0; i < currentState.offers.length; i++) {
        if (currentState.offers[i].id === offerId) return i;
    }
    return -1;
}

function openOfferModalById(offerId) {
    var index = findOfferIndexById(offerId);
    if (index >= 0) openOfferModal(index);
}

function findOfferInState(state, offerId) {
    for (var i = 0; i < state.offers.length; i++) {
        if (state.offers[i].id === offerId) return state.offers[i];
    }
    return null;
}

function offerMatchesNeed(offer, need) {
    if (!need) return true;
    var haystack = [
        offer.title || "",
        offer.category || "",
        (offer.tags || []).join(" ")
    ].join(" ").toLowerCase();

    if (need === "Food") return offer.category === "Food" || haystack.indexOf("food") !== -1 || haystack.indexOf("cook") !== -1;
    if (need === "Shower") return offer.category === "Essentials" && haystack.indexOf("shower") !== -1;
    if (need === "Laundry") return offer.category === "Essentials" && (haystack.indexOf("laundry") !== -1 || haystack.indexOf("water") !== -1);
    if (need === "Charge") return offer.category === "Essentials" && (haystack.indexOf("charging") !== -1 || haystack.indexOf("charge") !== -1);
    if (need === "Transport") return offer.category === "Transport" || haystack.indexOf("ride") !== -1 || haystack.indexOf("car") !== -1 || haystack.indexOf("transport") !== -1;
    return true;
}

function offerVisibleForFilters(offer) {
    var categoryFilter = window.currentCategoryFilter || "All";
    var needFilter = window.currentNeedFilter || "";

    if (needFilter && !offerMatchesNeed(offer, needFilter)) return false;
    if (!needFilter && categoryFilter !== "All" && offer.category !== categoryFilter) return false;

    return true;
}

function getBookingTimeLabel(booking) {
    var date = new Date(booking.timestamp);
    var today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return "Booked today, " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return "Booked " + date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function renderBookingCard(booking, offer) {
    var liveHtml = offer.isLive ? '<span class="status-pill live-status">LIVE</span>' : '<span class="status-pill confirmed">Confirmed</span>';
    var firstTag = offer.tags && offer.tags.length ? '<span class="tag">' + offer.tags[0] + '</span>' : "";
    var startText = offer.isLive ? "Available now" : (offer.startTime || "Starting soon");

    return '' +
        '<article class="booking-card">' +
            '<div class="booking-card-top">' +
                '<div class="booking-main">' +
                    '<div class="booking-title">' + offer.title + '</div>' +
                    '<div class="booking-time">' + getBookingTimeLabel(booking) + '</div>' +
                '</div>' +
                liveHtml +
            '</div>' +
            '<div class="host-row booking-host">' +
                '<img class="host-avatar" src="' + offer.hostImage + '" alt="' + offer.hostName + '">' +
                '<div class="host-copy">' +
                    '<div class="host-name">' + offer.hostName + '</div>' +
                    '<div class="host-meta">⭐ ' + offer.rating + ' • ' + offer.distance + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="booking-footer">' +
                '<div>' +
                    '<div class="availability-line ' + (offer.isLive ? "is-live" : "") + '">' + startText + '</div>' +
                    '<div class="tag-row">' + firstTag + '</div>' +
                '</div>' +
                '<button class="btn btn-outline booking-review-btn" onclick="openReviewModal(\'' + offer.id + '\')">Review</button>' +
            '</div>' +
        '</article>';
}

function renderExploreFeed() {
    var currentState = loadState();
    var sortedOffers = getSortedOffers(currentState.offers);
    
    // Render Categories
    var cats = ["food", "outdoors"];
    var catsFilter = ["Food", "Events"]; 
    for (var c=0; c<cats.length; c++) {
        var container = document.getElementById("explore-cat-" + cats[c]);
        if (!container) continue;
        container.innerHTML = "";
        for (var i=0; i<sortedOffers.length; i++) {
            var offer = sortedOffers[i];
            if (offer.category === catsFilter[c] || (c===1 && (offer.category==="Transport" || offer.category==="Essentials"))) {
                var card = document.createElement("div");
                card.className = "offer-card" + (offer.isLive ? " live-card" : "");
                card.style.minWidth = "220px";
                card.style.width = "220px";
                card.innerHTML = renderExperienceCard(offer, { compact: true, hideButton: true, imageWidth: 400 });
                card.onclick = (function(id) { return function() { openOfferModalById(id); }; })(offer.id);
                container.appendChild(card);
            }
        }
    }

    // Render Vertical Feed
    var feedContainer = document.getElementById("explore-vertical-feed");
    if(!feedContainer) return;
    feedContainer.innerHTML = "";
    
    var filter = window.currentCategoryFilter || "All";
    
    for (var i = 0; i < sortedOffers.length; i++) {
        var offer = sortedOffers[i];
        if (!offerVisibleForFilters(offer)) continue;

        var card = document.createElement("div");
        card.className = "explore-card" + (offer.isLive ? " live-card" : "");
        var imgUrl = getOfferImage(offer, 600);
        
        var bookedCount = 0;
        for (var j = 0; j < currentState.bookings.length; j++) {
            if (currentState.bookings[j].offerId === offer.id) bookedCount++;
        }
        var availableSpots = offer.spots - bookedCount;
        var spotsNotice = availableSpots > 0 ? availableSpots + " spots left" : "Fully Booked";

        var verticalTrustPills = renderBadgePills(offer.badges || getHostTrustBadges(offer.hostName));
        var liveHtml = offer.isLive ? '<div class="live-badge">LIVE NOW</div>' : "";
        card.innerHTML = 
            '<div class="explore-card-img" style="background-image: ' + getOfferBackground(offer, 600) + ';">' + liveHtml + '</div>' +
            '<div class="explore-card-overlay">' +
                '<div class="explore-card-title">' + offer.title + '</div>' +
                '<div class="availability-line overlay-availability ' + (offer.isLive ? "is-live" : "") + '">' + getAvailabilityText(offer) + '</div>' +
                '<div class="host-row overlay-host">' +
                    '<img class="host-avatar" src="' + offer.hostImage + '" alt="' + offer.hostName + '">' +
                    '<div class="host-copy">' +
                        '<div class="host-name">' + offer.hostName + '</div>' +
                        '<div class="host-meta">⭐ ' + offer.rating + ' • ' + offer.distance + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="badge-pill-row overlay-pills">' + verticalTrustPills + '</div>' +
                '<div class="tag-row overlay-tags">' + renderTags(offer.tags) + '</div>' +
                '<div class="explore-card-footer">' +
                    '<div class="explore-card-price">' + offer.price + ' <span>KGS</span></div>' +
                    '<button class="btn btn-primary" style="width:auto; padding:0.6rem 1.2rem; margin:0; border-radius:12px; box-shadow:0 4px 12px rgba(211,47,47,0.4);" onclick="event.stopPropagation(); bookOffer(\''+offer.id+'\')">Book Now</button>' +
                '</div>' +
            '</div>';
        
        card.onclick = (function(id) { return function() { openOfferModalById(id); }; })(offer.id);
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
    var sortedOffers = getSortedOffers(currentState.offers);

    for (var i = 0; i < sortedOffers.length; i++) {
        var offer = sortedOffers[i];
        if (!offerVisibleForFilters(offer)) continue;

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
        pin.setAttribute("data-offer-id", offer.id);
        pin.onclick = function() {
            openOfferModalById(this.getAttribute("data-offer-id"));
        };
        mapLayer.appendChild(pin);

        // Create Horizontal Feed Card
        var card = document.createElement("div");
        card.className = "offer-card" + (offer.isLive ? " live-card" : "");

        var spotsNotice = availableSpots > 0 ? availableSpots + " spots left" : "Fully Booked";
        var buttonDisabled = availableSpots <= 0 ? "disabled" : "";

        card.innerHTML = renderExperienceCard(offer, { imageWidth: 500 }).replace(
            '<button class="btn btn-primary" onclick="event.stopPropagation(); bookOffer(\'' + offer.id + '\')">Book Now</button>',
            '<div class="spots-badge">' + spotsNotice + '</div><button class="btn btn-primary" ' + buttonDisabled + ' onclick="event.stopPropagation(); bookOffer(\'' + offer.id + '\')">Book Now</button>'
        );
        card.onclick = (function(id) { return function() { openOfferModalById(id); }; })(offer.id);
            
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

    var imgUrl = getOfferImage(offer, 600);

    var sheet = document.getElementById("booking-sheet");
    var trustPills = renderBadgePills(offer.badges || getHostTrustBadges(offer.hostName));
    var liveHtml = offer.isLive ? '<div class="live-badge detail-live">LIVE NOW</div>' : "";
    sheet.innerHTML = 
        '<div class="sheet-handle" id="booking-sheet-handle"></div>' +
        '<div class="detail-image" style="background-image:' + getOfferBackground(offer, 600) + ';">' + liveHtml + '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<div class="host-row"><img class="host-avatar" src="' + offer.hostImage + '" alt="' + offer.hostName + '"><div class="host-copy"><div class="host-name">' + offer.hostName + '</div><div class="host-meta">⭐ ' + offer.rating + ' • ' + offer.distance + '</div></div></div>' +
            '<button class="btn-icon" style="box-shadow:none; border:none; width:36px; height:36px; background:var(--border-color); color:var(--text-primary);" onclick="closeOfferModal()">✕</button>' +
        '</div>' +
        '<div class="badge-pill-row" style="margin-top:0.75rem;">' + trustPills + '</div>' +
        '<div class="tag-row">' + renderTags(offer.tags) + '</div>' +
        '<h2 style="margin-top:0.5rem; font-size: 1.5rem; color:var(--text-primary);">' + offer.title + '</h2>' +
        '<div class="availability-line ' + (offer.isLive ? "is-live" : "") + '">' + getAvailabilityText(offer) + '</div>' +
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
        var bookedOffer = findOfferInState(loadState(), offerId);
        
        // Show success animation overlay
        var overlay = document.getElementById("success-overlay");
        var content = document.getElementById("success-content");
        content.innerHTML = renderBookingSuccess(bookedOffer);
        overlay.classList.remove("hidden");
        
        setTimeout(function() {
            content.style.opacity = "1";
            content.style.transform = "scale(1)";
        }, 10);
        
        setTimeout(function() {
            renderMapAndFeed(); 
            if(!document.getElementById("view-explore").classList.contains("hidden")) {
                renderExploreFeed();
            }
        }, 400);
        
    } else {
        alert("Booking failed: " + result.error);
    }
}

function renderBookingSuccess(offer) {
    var title = offer ? offer.title : "your experience";
    var host = offer ? offer.hostName : "your host";
    var eta = offer && offer.distance && offer.distance.indexOf("km") !== -1 ? "12 min" : "5 min";

    return '' +
        '<div class="success-check">✓</div>' +
        '<h2 style="color:var(--text-primary); font-size:1.8rem; margin-bottom:8px;">Booking Confirmed!</h2>' +
        '<p style="color:var(--text-secondary); font-size:1rem;">' + title + ' is in your Bookings tab.</p>' +
        '<div class="directions-preview">Meet ' + host + ' in about ' + eta + '.</div>' +
        '<div class="success-actions">' +
            '<button class="btn btn-primary" onclick="hideSuccessOverlay(); openDummyFeature(\'Bookings\')">View booking</button>' +
            '<button class="btn btn-outline" onclick="hideSuccessOverlay(); openDirectionsForOffer(\'' + (offer ? offer.id : "") + '\')">Directions</button>' +
        '</div>';
}

function hideSuccessOverlay() {
    var overlay = document.getElementById("success-overlay");
    var content = document.getElementById("success-content");
    content.style.opacity = "0";
    content.style.transform = "scale(0.8)";
    setTimeout(function() {
        overlay.classList.add("hidden");
    }, 300);
}

function openDirectionsForOffer(offerId) {
    var state = loadState();
    var offer = findOfferInState(state, offerId);
    if (!offer) return;

    var sheet = document.getElementById("dummy-feature-sheet");
    var eta = offer.distance && offer.distance.indexOf("km") !== -1 ? "12 min walk" : "5 min walk";
    sheet.innerHTML =
        '<div class="sheet-handle"></div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<h2 style="font-size:1.5rem; color:var(--text-primary);">Directions</h2>' +
            '<button class="btn-icon" style="box-shadow:none; border:none; width:36px; height:36px; background:var(--border-color); color:var(--text-primary);" onclick="closeDummyFeature()">✕</button>' +
        '</div>' +
        '<div class="directions-card">' +
            '<div class="directions-map">' +
                '<div class="route-dot start">You</div>' +
                '<div class="route-line"></div>' +
                '<div class="route-dot end">Host</div>' +
            '</div>' +
            '<div class="booking-title">' + offer.title + '</div>' +
            '<div class="host-row booking-host">' +
                '<img class="host-avatar" src="' + offer.hostImage + '" alt="' + offer.hostName + '">' +
                '<div class="host-copy">' +
                    '<div class="host-name">' + offer.hostName + '</div>' +
                    '<div class="host-meta">⭐ ' + offer.rating + ' • ' + offer.distance + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="directions-step">📍 Meet near central Bishkek landmark</div>' +
            '<div class="directions-step">🚶 ' + eta + ' from your current area</div>' +
            '<div class="directions-step">✅ Show this confirmation when you arrive</div>' +
        '</div>';

    document.getElementById("dummy-feature-modal").classList.remove("hidden");
}

function setupCategoryTabs() {
    var pills = document.getElementsByClassName("cat-pill");
    for (var i = 0; i < pills.length; i++) {
        pills[i].onclick = function() {
            for (var j = 0; j < pills.length; j++) pills[j].classList.remove("active");
            this.classList.add("active");
            
            window.currentCategoryFilter = this.innerText.trim();
            window.currentNeedFilter = "";
            clearNeedNowActive();
            renderMapAndFeed();
            if(!document.getElementById("view-explore").classList.contains("hidden")) {
                renderExploreFeed();
            }
        };
    }
}

function setupNeedNowTabs() {
    var chips = document.getElementsByClassName("need-chip");
    for (var i = 0; i < chips.length; i++) {
        chips[i].onclick = function() {
            var selectedNeed = this.getAttribute("data-need");
            var wasActive = this.classList.contains("active");
            clearNeedNowActive();

            if (wasActive) {
                window.currentNeedFilter = "";
            } else {
                this.classList.add("active");
                window.currentNeedFilter = selectedNeed;
                resetCategoryFilterToAll();
            }

            renderMapAndFeed();
            if(!document.getElementById("view-explore").classList.contains("hidden")) {
                renderExploreFeed();
            }
        };
    }
}

function clearNeedNowActive() {
    var chips = document.getElementsByClassName("need-chip");
    for (var i = 0; i < chips.length; i++) {
        chips[i].classList.remove("active");
    }
}

function resetCategoryFilterToAll() {
    var pills = document.getElementsByClassName("cat-pill");
    for (var i = 0; i < pills.length; i++) {
        pills[i].classList.remove("active");
        if (pills[i].innerText.trim() === "All") pills[i].classList.add("active");
    }
    window.currentCategoryFilter = "All";
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
        var myBookings = (currentState.bookings || []).slice(); // Real state bookings
        myBookings.sort(function(a, b) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        
        htmlContent += '<div class="bookings-list">';
        
        for (var b = 0; b < myBookings.length; b++) {
            var booking = myBookings[b];
            var offerDetail = findOfferInState(currentState, booking.offerId);
            if (offerDetail) {
                htmlContent += renderBookingCard(booking, offerDetail);
            }
        }
        
        if (myBookings.length === 0) {
            htmlContent += '<div class="empty-state">No bookings yet.<br><br>Book something nearby and it will appear here instantly.</div>';
        }

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
        htmlContent += '<button class="btn btn-primary" style="margin-top:1rem;" onclick="openCulturalGuide()">Open Cultural Guide</button>';
        htmlContent += '</div>';
        htmlContent += '<div data-profile-badges="tourist">' + renderBadgeGrid({ group: "tourist" }) + '</div>';
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
    initMapBackground();
};

function initMapBackground() {
    var attempts = 0;

    function tryInitMap() {
        attempts += 1;
        if (typeof DG !== 'undefined') {
            DG.then(function() {
                DG.map('map-bg-layer', {
                    center: [42.8746, 74.5698], // Bishkek center
                    zoom: 13,
                    zoomControl: false,
                    fullscreenControl: false
                });
            });
            return;
        }

        if (attempts < 20) {
            setTimeout(tryInitMap, 250);
        }
    }

    tryInitMap();
}
