// Seller App Logic (ICF Compliant)

function initSellerApp() {
    refreshDashboard();
}

// Ensure no arrow functions as per ICF Rules
function refreshDashboard() {
    var currentState = loadState();
    
    // Calculate Metrics
    var activeOffers = currentState.offers.length;
    var totalBookings = currentState.bookings.length;

    // Calculate Review Stats
    var totalReviews = 0;
    var sumRatings = 0;
    if (currentState.reviews && currentState.reviews.length > 0) {
        totalReviews = currentState.reviews.length;
        for (var idx = 0; idx < totalReviews; idx++) {
            sumRatings += currentState.reviews[idx].rating;
        }
    }
    var avgRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : "0.0";

    document.getElementById("stat-active-offers").innerText = activeOffers;
    document.getElementById("stat-total-bookings").innerText = totalBookings;
    document.getElementById("stat-avg-rating").innerText = avgRating;
    document.getElementById("stat-review-count").innerText = "(" + totalReviews + ")";

    // Render Offers List
    var listContainer = document.getElementById("host-offers-list");
    listContainer.innerHTML = "";

    if (activeOffers === 0) {
        listContainer.innerHTML = '<div class="empty-state">You have no active offers.<br><br>Click the Create button to get started!</div>';
    } else {
        for (var i = 0; i < currentState.offers.length; i++) {
            var offer = currentState.offers[i];
            
            var el = document.createElement("div");
            el.className = "offer-card";
            
            // Count bookings for this offer
            var bookingsCount = 0;
            for (var j = 0; j < currentState.bookings.length; j++) {
                if (currentState.bookings[j].offerId === offer.id) bookingsCount++;
            }

            var htmlString = 
                '<div class="offer-card-img" style="background-image:url(\'https://images.unsplash.com/photo-1541843666579-166fb9c072eb?auto=format&fit=crop&w=400&q=80\');">' +
                    '<div class="live-badge">LIVE</div>' +
                '</div>' +
                '<div class="offer-card-body">' +
                    '<div class="offer-title">' + offer.title + '</div>' +
                    '<div class="offer-price-row">' +
                        '<div class="offer-price">' + offer.price + ' <span>KGS / person</span></div>' +
                    '</div>' +
                    '<div class="offer-meta" style="display:flex; justify-content:space-between; margin-top:8px;">' +
                        '<div style="display:flex; align-items:center; gap:4px;">📅 Upcoming</div>' +
                        '<div style="display:flex; align-items:center; gap:4px;">👥 ' + bookingsCount + '/' + offer.spots + ' booked</div>' +
                    '</div>' +
                '</div>';
            
            el.innerHTML = htmlString;
            listContainer.appendChild(el);
        }
    }

    // Render Customer Requests
    var requestsContainer = document.getElementById("customer-requests-list");
    requestsContainer.innerHTML = "";
    
    var requests = currentState.requests || [];

    if (requests.length === 0) {
        requestsContainer.innerHTML = '<div class="empty-state">No customer requests right now.</div>';
    } else {
        // Reverse iterate to show newest first
        for (var r = requests.length - 1; r >= 0; r--) {
            var req = requests[r];
            var reqEl = document.createElement("div");
            reqEl.className = "request-item";
            
            var isPending = req.status === "pending";
            var statusHtml = isPending ? '<div class="status-pill pending">Pending</div>' : '<div class="status-pill confirmed">Confirmed</div>';
            var actionHtml = isPending ? '<button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.8rem; border-color:var(--secondary); color:var(--secondary);" onclick="fulfillRequest(\'' + req.id + '\')">Accept</button>' : '<div class="req-chevron">></div>';
            
            var reqHtml = 
                '<div class="req-avatar" style="background-image:url(\'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80\');"></div>' +
                '<div class="req-info">' +
                    '<div class="req-name">' + req.customerName + ' <span style="font-size:0.8rem;">🌍</span></div>' +
                    '<div class="req-desc">"' + req.description + '"</div>' +
                    '<div class="req-meta">Requested on ' + new Date(req.timestamp).toLocaleDateString() + '</div>' +
                '</div>' +
                '<div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">' +
                    statusHtml +
                    actionHtml +
                '</div>';
            
            reqEl.innerHTML = reqHtml;
            requestsContainer.appendChild(reqEl);
        }
    }
}

// Modal Handlers
function openCreateModal() {
    // Reset Form Fields
    document.getElementById("offer-title").value = "";
    document.getElementById("offer-price").value = "";
    document.getElementById("offer-spots").value = "";
    document.getElementById("offer-category").value = "Food";

    document.getElementById("create-modal").classList.remove("hidden");
}

function closeCreateModal() {
    document.getElementById("create-modal").classList.add("hidden");
}

function submitNewOffer() {
    var titleInput = document.getElementById("offer-title").value;
    var priceInput = document.getElementById("offer-price").value;
    var spotsInput = document.getElementById("offer-spots").value;
    var categoryInput = document.getElementById("offer-category").value;

    if (!titleInput || !priceInput || !spotsInput) {
        alert("Please fill in all details.");
        return;
    }

    // Utilize strictly the 7-stage engine from shared-state.js
    var payload = {
        title: titleInput,
        price: priceInput,
        spots: spotsInput,
        category: categoryInput
    };

    var result = executeAction("CREATE_OFFER", payload);

    if (result.success) {
        closeCreateModal();
        refreshDashboard();
        alert("Offer published successfully!");
    } else {
        alert("Failed to publish offer: " + result.error);
    }
}

function fulfillRequest(requestId) {
    var result = executeAction("FULFILL_REQUEST", { requestId: requestId });
    if (result.success) {
        refreshDashboard();
        alert("You have offered to fulfill this request! The customer will be notified.");
    } else {
        alert("Failed to fulfill request: " + result.error);
    }
}

// Boot application
window.onload = initSellerApp;
