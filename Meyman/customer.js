// Customer App Logic (ICF Compliant)

function initCustomerApp() {
    window.currentCategoryFilter = "All";
    window.currentNeedFilter = "";
    window.selectedMapOfferId = "";
    window.selectedPaymentMethod = "mbank";
    window.pendingPaymentOfferId = "";
    window.applyAppTranslations = function() {
        applyCustomerTranslations();
        renderMapAndFeed();
        renderExploreFeed();
    };
    initializeLanguageSystem();
    applyCustomerTranslations();
    renderMapAndFeed();
    setupCategoryTabs();
    setupBottomSheetDrag();
    switchTab("explore");
}

function getNeedLabel(need) {
    if (need === "Food") return t("hungry");
    if (need === "Nomad") return t("nomad_life");
    if (need === "Culture") return t("craft");
    if (need === "Shower") return t("shower");
    if (need === "Laundry") return t("laundry");
    return need;
}

function applyCustomerTranslations() {
    var guide = document.getElementById("guide-chip");
    if (guide) guide.textContent = t("cultural_guide");

    var hostLink = document.getElementById("host-mode-link");
    if (hostLink) hostLink.textContent = t("host_mode");

    var mapBtn = document.getElementById("btn-tab-map");
    var exploreBtn = document.getElementById("btn-tab-explore");
    if (mapBtn) mapBtn.textContent = t("map");
    if (exploreBtn) exploreBtn.textContent = t("explore");

    var searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.placeholder = t("search_placeholder");

    var catPills = document.getElementsByClassName("cat-pill");
    for (var i = 0; i < catPills.length; i++) {
        catPills[i].textContent = getCategoryLabel(catPills[i].getAttribute("data-category"));
    }

    var ids = {
        "app-motto": "motto",
        "happening-title": "nearby_on_map",
        "discover-title": "discover",
        "request-modal-title": "request_experience",
        "request-modal-desc": "request_desc",
        "request-category-label": "category",
        "request-description-label": "request_what",
        "request-submit-btn": "submit_request",
        "review-modal-title": "leave_review",
        "review-modal-desc": "review_desc",
        "review-rating-label": "rating_label",
        "review-comment-label": "your_comment",
        "review-submit-btn": "submit_review",
        "nav-map-label": "map",
        "nav-new-label": "new",
        "nav-bookings-label": "bookings",
        "nav-inbox-label": "inbox",
        "nav-profile-label": "profile"
    };

    for (var id in ids) {
        if (Object.prototype.hasOwnProperty.call(ids, id)) {
            var element = document.getElementById(id);
            if (element) element.textContent = t(ids[id]);
        }
    }

    var requestDescription = document.getElementById("request-description");
    if (requestDescription) requestDescription.placeholder = t("request_placeholder");

    var reviewComment = document.getElementById("review-comment");
    if (reviewComment) reviewComment.placeholder = t("review_placeholder");

    var requestCategory = document.getElementById("request-category");
    if (requestCategory) {
        for (var r = 0; r < requestCategory.options.length; r++) {
            requestCategory.options[r].text = getCategoryLabel(requestCategory.options[r].value);
        }
    }
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
    if (offer.image) return offer.image;

    var size = width || 500;
    if (offer.category === "Eat Like a Local 🍽️") return "https://source.unsplash.com/" + size + "x" + size + "/?kyrgyz,food";
    if (offer.category === "Nomad Life 🏔️") return "https://source.unsplash.com/" + size + "x" + size + "/?horse,rural,mountains";
    if (offer.category === "Culture & Craft 🎨") return "https://source.unsplash.com/" + size + "x" + size + "/?felt,craft,textile";
    if (offer.category === "Essentials 🧼") return "https://source.unsplash.com/" + size + "x" + size + "/?laundry,bathroom,clean";
    return "https://source.unsplash.com/" + size + "x" + size + "/?kyrgyzstan,travel";
}

function getOfferBackground(offer, width) {
    return "linear-gradient(135deg, rgba(211,47,47,0.18), rgba(255,152,0,0.16)), url('" + getOfferImage(offer, width) + "')";
}

function getAvailabilityText(offer) {
    if (offer.isLive) return t("available_now");
    return offer.startTime || offer.urgency || t("starting_soon");
}

function getVisibleSortedOffers(state) {
    var sortedOffers = getSortedOffers((state && state.offers) || []);
    var visible = [];
    for (var i = 0; i < sortedOffers.length; i++) {
        if (offerVisibleForFilters(sortedOffers[i])) visible.push(sortedOffers[i]);
    }
    return visible;
}

function renderTags(tags) {
    var safeTags = tags || [];
    var html = "";
    for (var i = 0; i < safeTags.length && i < 2; i++) {
        html += '<span class="tag">' + safeTags[i] + '</span>';
    }
    return html;
}

function getBookingCountForOffer(state, offerId) {
    var bookings = state.bookings || [];
    var bookedCount = 0;
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].offerId === offerId) bookedCount++;
    }
    return bookedCount;
}

function getAvailableSpots(state, offer) {
    return offer.spots - getBookingCountForOffer(state, offer.id);
}

function renderExperienceCard(offer, options) {
    var opts = options || {};
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
            (opts.hideButton ? '' : '<button class="btn btn-primary" onclick="event.stopPropagation(); openPaymentModal(\'' + offer.id + '\')">' + t("book_now") + '</button>') +
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

    if (need === "Food") return offer.category === "Eat Like a Local 🍽️" || haystack.indexOf("food") !== -1 || haystack.indexOf("cook") !== -1 || haystack.indexOf("boorsok") !== -1 || haystack.indexOf("beshbarmak") !== -1;
    if (need === "Nomad") return offer.category === "Nomad Life 🏔️" || haystack.indexOf("nomad") !== -1 || haystack.indexOf("cow") !== -1 || haystack.indexOf("donkey") !== -1;
    if (need === "Culture") return offer.category === "Culture & Craft 🎨" || haystack.indexOf("felt") !== -1 || haystack.indexOf("embroidery") !== -1 || haystack.indexOf("craft") !== -1;
    if (need === "Shower") return offer.category === "Essentials 🧼" && haystack.indexOf("shower") !== -1;
    if (need === "Laundry") return offer.category === "Essentials 🧼" && haystack.indexOf("laundry") !== -1;
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
        return t("booked_today", { time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    }
    return t("booked_on", { date: date.toLocaleDateString([], { month: "short", day: "numeric" }) });
}

function renderBookingCard(booking, offer) {
    var liveHtml = offer.isLive ? '<span class="status-pill live-status">' + t("live") + '</span>' : '<span class="status-pill confirmed">' + t("confirmed") + '</span>';
    var firstTag = offer.tags && offer.tags.length ? '<span class="tag">' + offer.tags[0] + '</span>' : "";
    var startText = offer.isLive ? t("available_now") : (offer.startTime || t("starting_soon"));
    var paymentLabel = booking.paymentMethod ? '<div class="payment-mini">' + t("paid_with", { method: booking.paymentMethod }) + '</div>' : "";

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
                    paymentLabel +
                    '<div class="tag-row">' + firstTag + '</div>' +
                '</div>' +
                '<div class="booking-action-group">' +
                    '<button class="btn btn-outline booking-review-btn" onclick="openReviewModal(\'' + offer.id + '\')">' + t("review") + '</button>' +
                    '<button class="btn btn-outline booking-cancel-btn" onclick="cancelBooking(\'' + booking.bookingId + '\')">' + t("cancel_booking") + '</button>' +
                '</div>' +
            '</div>' +
        '</article>';
}

function renderExploreFeed() {
    var currentState = loadState();
    var sortedOffers = getSortedOffers(currentState.offers);

    // Render Vertical Feed
    var feedContainer = document.getElementById("explore-vertical-feed");
    if(!feedContainer) return;
    feedContainer.innerHTML = "";
    
    for (var i = 0; i < sortedOffers.length; i++) {
        var offer = sortedOffers[i];
        if (!offerVisibleForFilters(offer)) continue;

        var card = document.createElement("div");
        card.className = "explore-card" + (offer.isLive ? " live-card" : "");

        var verticalTrustPills = renderBadgePills(offer.badges || getHostTrustBadges(offer.hostName));
        var liveHtml = offer.isLive ? '<div class="live-badge">LIVE NOW</div>' : "";
        card.innerHTML = 
            '<div class="explore-card-media" style="background-image: ' + getOfferBackground(offer, 600) + ';">' +
                liveHtml +
                '<button class="card-favorite-btn" aria-hidden="true">♡</button>' +
            '</div>' +
            '<div class="explore-card-body-clean">' +
                '<div class="explore-card-topline">' +
                    '<div class="explore-card-title">' + offer.title + '</div>' +
                    '<div class="explore-card-price-inline">' + offer.price + ' KGS</div>' +
                '</div>' +
                '<div class="explore-card-submeta">' +
                    '<span>⏱️ ' + (offer.isLive ? getAvailabilityText(offer) : (offer.startTime || t("starting_soon"))) + '</span>' +
                    '<span>📍 ' + offer.distance + '</span>' +
                '</div>' +
                '<div class="host-row">' +
                    '<img class="host-avatar" src="' + offer.hostImage + '" alt="' + offer.hostName + '">' +
                    '<div class="host-copy">' +
                        '<div class="host-name">' + offer.hostName + '</div>' +
                        '<div class="host-meta">⭐ ' + offer.rating + ' • ' + getAvailabilityText(offer) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="badge-pill-row">' + verticalTrustPills + '</div>' +
                '<div class="tag-row">' + renderTags(offer.tags) + '</div>' +
                '<div class="explore-card-footer-clean">' +
                    '<div class="explore-card-rating">⭐ ' + offer.rating + '</div>' +
                    '<button class="btn btn-primary explore-inline-book" onclick="event.stopPropagation(); openPaymentModal(\''+offer.id+'\')">' + t("book_now") + '</button>' +
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
    if (!mapLayer || !feedContainer) return;

    mapLayer.innerHTML = "";
    feedContainer.innerHTML = "";

    var visibleOffers = getVisibleSortedOffers(currentState);
    if (visibleOffers.length === 0) {
        feedContainer.innerHTML = '<div class="map-empty-state">' + t("no_experiences_now") + '</div>';
        return;
    }

    var userDot = document.createElement("div");
    userDot.className = "user-location-dot";
    userDot.style.left = "50%";
    userDot.style.top = "58%";
    mapLayer.appendChild(userDot);

    var selectedOfferId = window.selectedMapOfferId;
    var hasSelected = false;

    for (var i = 0; i < visibleOffers.length; i++) {
        if (visibleOffers[i].id === selectedOfferId) {
            hasSelected = true;
            break;
        }
    }

    if (!hasSelected) {
        selectedOfferId = visibleOffers[0].id;
        window.selectedMapOfferId = selectedOfferId;
    }

    for (var j = 0; j < visibleOffers.length; j++) {
        var offer = visibleOffers[j];
        var pin = document.createElement("button");
        pin.type = "button";
        pin.className = "map-pin" + (offer.id === selectedOfferId ? " active" : "");
        pin.style.left = offer.location.x + "%";
        pin.style.top = offer.location.y + "%";
        pin.setAttribute("data-offer-id", offer.id);
        pin.onclick = function() {
            selectMapOffer(this.getAttribute("data-offer-id"));
        };
        mapLayer.appendChild(pin);
    }

    renderMapSelectedOffer(feedContainer, currentState, findOfferInState(currentState, selectedOfferId));
}

function renderMapSelectedOffer(feedContainer, currentState, offer) {
    if (!offer) {
        feedContainer.innerHTML = '<div class="map-empty-state">' + t("tap_pin_hint") + '</div>';
        return;
    }

    var availableSpots = getAvailableSpots(currentState, offer);
    var spotsNotice = availableSpots > 0 ? t("spots_left", { count: availableSpots }) : t("fully_booked");
    var buttonDisabled = availableSpots <= 0 ? "disabled" : "";
    var bookButton = '<button class="btn btn-primary" onclick="event.stopPropagation(); openPaymentModal(\'' + offer.id + '\')">' + t("book_now") + '</button>';

    var card = document.createElement("div");
    card.className = "offer-card map-focus-card" + (offer.isLive ? " live-card" : "");
    card.innerHTML = renderExperienceCard(offer, { imageWidth: 500 }).replace(
        bookButton,
        '<div class="spots-badge">' + spotsNotice + '</div><button class="btn btn-primary" ' + buttonDisabled + ' onclick="event.stopPropagation(); openPaymentModal(\'' + offer.id + '\')">' + t("book_now") + '</button>'
    );
    card.onclick = function() {
        openOfferModalById(offer.id);
    };

    feedContainer.appendChild(card);
}

function selectMapOffer(offerId) {
    window.selectedMapOfferId = offerId;
    renderMapAndFeed();
}

function openOfferModal(index) {
    var currentState = loadState();
    var offer = currentState.offers[index];
    if (!offer) return;

    var availableSpots = getAvailableSpots(currentState, offer);

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
                (availableSpots > 0 ? "<span style='color:#34c759;'>●</span> " + t("available_now") + " (" + t("spots_left", { count: availableSpots }) + ")" : "<span style='color:var(--primary);'>●</span> " + t("fully_booked")) + 
            '</div>' +
        '</div>' +
        '<div style="display:flex; gap:1rem; margin-top:1.5rem;">' +
            '<button class="btn btn-primary" ' + (availableSpots <= 0 ? "disabled" : "") + ' onclick="openPaymentModal(\'' + offer.id + '\')">' + t("book_now") + '</button>' +
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

var PAYMENT_METHODS = [
    { id: "mbank", name: "MBANK", logo: "M", accent: "#f6c443", detail: "Fast local bank transfer" },
    { id: "visa", name: "Visa / MasterCard", logo: "V", accent: "#2563eb", detail: "International cards accepted" },
    { id: "o", name: "Moi O!", logo: "O!", accent: "#ff2d95", detail: "Mobile wallet" },
    { id: "megapay", name: "MegaPay", logo: "M", accent: "#34c759", detail: "QR or app payment" },
    { id: "optima", name: "Optima 24", logo: "O", accent: "#ef4444", detail: "Local banking app" },
    { id: "bakai", name: "BakAi", logo: "B", accent: "#1d4ed8", detail: "Bank wallet" },
    { id: "terminal", name: "Terminals", logo: "24", accent: "#f59e0b", detail: "Pay24, Quickpay, Onoi" }
];

function getPaymentMethodById(methodId) {
    for (var i = 0; i < PAYMENT_METHODS.length; i++) {
        if (PAYMENT_METHODS[i].id === methodId) return PAYMENT_METHODS[i];
    }
    return PAYMENT_METHODS[0];
}

function renderPaymentOptions(selectedMethodId) {
    var html = "";
    for (var i = 0; i < PAYMENT_METHODS.length; i++) {
        var method = PAYMENT_METHODS[i];
        var isSelected = method.id === selectedMethodId;
        html += '' +
            '<button class="payment-option' + (isSelected ? ' active' : '') + '" onclick="selectPaymentMethod(\'' + method.id + '\')">' +
                '<span class="payment-radio">' + (isSelected ? '<span class="payment-radio-dot"></span>' : '') + '</span>' +
                '<span class="payment-brand-mark" style="background:' + method.accent + ';">' + method.logo + '</span>' +
                '<span class="payment-copy">' +
                    '<span class="payment-name">' + method.name + '</span>' +
                    '<span class="payment-detail">' + method.detail + '</span>' +
                '</span>' +
            '</button>';
    }
    return html;
}

function openPaymentModal(offerId) {
    var state = loadState();
    var offer = findOfferInState(state, offerId);
    if (!offer) return;

    window.pendingPaymentOfferId = offerId;
    if (!window.selectedPaymentMethod) window.selectedPaymentMethod = "mbank";

    var sheet = document.getElementById("payment-sheet");
    sheet.innerHTML =
        '<div class="sheet-handle"></div>' +
        '<div class="payment-sheet-header">' +
            '<div>' +
                '<div class="payment-eyebrow">Payment methods</div>' +
                '<h2 class="payment-title">Choose how to pay</h2>' +
            '</div>' +
            '<button class="btn-icon payment-close" onclick="closePaymentModal()">✕</button>' +
        '</div>' +
        '<div class="payment-summary-card">' +
            '<div class="payment-summary-top">' +
                '<div class="payment-summary-offer">' + offer.title + '</div>' +
                '<div class="payment-summary-host">with ' + offer.hostName + '</div>' +
            '</div>' +
            '<div class="payment-total-label">Total</div>' +
            '<div class="payment-total">' + offer.price + ' <span>KGS</span></div>' +
        '</div>' +
        '<div class="payment-options-list">' + renderPaymentOptions(window.selectedPaymentMethod) + '</div>' +
        '<button class="btn btn-primary payment-submit" onclick="confirmPayment()">Pay Now</button>' +
        '<p class="payment-terms">By tapping Pay Now, you confirm this demo booking and payment method.</p>';

    document.getElementById("payment-modal").classList.remove("hidden");
}

function selectPaymentMethod(methodId) {
    window.selectedPaymentMethod = methodId;
    if (!window.pendingPaymentOfferId) return;
    openPaymentModal(window.pendingPaymentOfferId);
}

function closePaymentModal() {
    document.getElementById("payment-modal").classList.add("hidden");
}

function confirmPayment() {
    if (!window.pendingPaymentOfferId) return;
    var method = getPaymentMethodById(window.selectedPaymentMethod);
    bookOffer(window.pendingPaymentOfferId, method.name);
}

function bookOffer(offerId, paymentMethodName) {
    // Utilize exactly the ICF 7-stage engine from shared-state.js
    var payload = {
        offerId: offerId,
        paymentMethod: paymentMethodName || getPaymentMethodById(window.selectedPaymentMethod).name
    };

    var result = executeAction("BOOK_OFFER", payload);

    if (result.success) {
        closePaymentModal();
        closeOfferModal();
        var bookedOffer = findOfferInState(loadState(), offerId);
        
        // Show success animation overlay
        var overlay = document.getElementById("success-overlay");
        var content = document.getElementById("success-content");
        content.innerHTML = renderBookingSuccess(bookedOffer, payload.paymentMethod);
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

function cancelBooking(bookingId) {
    var result = executeAction("CANCEL_BOOKING", { bookingId: bookingId });
    if (result.success) {
        renderMapAndFeed();
        renderExploreFeed();
        openDummyFeature("Bookings");
        alert(t("booking_cancelled"));
    } else {
        alert(t("cancel_failed", { error: result.error }));
    }
}

function renderBookingSuccess(offer, paymentMethodName) {
    var title = offer ? offer.title : "your experience";
    var host = offer ? offer.hostName : "your host";
    var eta = offer && offer.distance && offer.distance.indexOf("km") !== -1 ? "12 min" : "5 min";
    var paymentLine = paymentMethodName ? '<div class="payment-confirmed-line">Paid with ' + paymentMethodName + '</div>' : "";

    return '' +
        '<div class="success-check">✓</div>' +
        '<h2 style="color:var(--text-primary); font-size:1.8rem; margin-bottom:8px;">Booked Successfully</h2>' +
        '<p style="color:var(--text-secondary); font-size:1rem;">' + title + ' is in your Bookings tab.</p>' +
        paymentLine +
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
            
            window.currentCategoryFilter = this.getAttribute("data-category") || "All";
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
        if (pills[i].getAttribute("data-category") === "All") pills[i].classList.add("active");
    }
    window.currentCategoryFilter = "All";
}

// Request Modal Handlers
function openRequestModal() {
    document.getElementById("request-description").value = "";
    document.getElementById("request-category").value = "Eat Like a Local 🍽️";
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
            htmlContent += '<div style="display:flex; gap:12px; align-items:center;"><div style="width:48px; height:48px; border-radius:50%; background:#e0e0e0; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">🧑</div><div style="flex:1;"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">Meiman Support</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">Welcome to Meiman! Explore our local experiences.</div></div></div>';
        }
        
        htmlContent += '</div>';
    } else if (featureName === 'Profile') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem;">';
        htmlContent += '<div style="width:80px; height:80px; border-radius:50%; background:#e0e0e0; display:flex; align-items:center; justify-content:center; font-size:2.5rem;">😎</div>';
        htmlContent += '<div style="font-weight:700; font-size:1.2rem; color:var(--text-primary);">' + t("traveler_profile_name") + '</div>';
        htmlContent += '<div style="font-size:0.9rem; color:var(--text-secondary);">' + t("joined_april_2026") + '</div>';
        htmlContent += '</div>';
        htmlContent += '<div data-profile-badges="tourist">' + renderBadgeGrid({ group: "tourist" }) + '</div>';
        htmlContent += '<div style="margin-top:2rem; display:flex; flex-direction:column; gap:0.5rem;">';
        htmlContent += '<button class="btn btn-outline" style="width:100%; text-align:left; padding:1rem; border-color:transparent; background:var(--bg-main); color:var(--text-primary);">' + t("payment_methods_arrow") + ' <span style="float:right;">&rarr;</span></button>';
        htmlContent += '<button class="btn btn-outline" style="width:100%; text-align:left; padding:1rem; border-color:transparent; background:var(--bg-main); color:var(--text-primary);" onclick="openLanguageSelector(false)">' + t("language_setting", { code: getLanguageShortCode() }) + ' <span style="float:right;">&rarr;</span></button>';
        htmlContent += '<button class="btn btn-outline" style="width:100%; text-align:left; padding:1rem; border-color:transparent; background:var(--bg-main); color:var(--primary);">' + t("log_out") + ' <span style="float:right;">&rarr;</span></button>';
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
