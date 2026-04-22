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

    document.getElementById("active-offers-count").innerText = activeOffers;
    document.getElementById("total-bookings-count").innerText = totalBookings;

    // Render Offers List
    var listContainer = document.getElementById("host-offers-list");
    listContainer.innerHTML = "";

    if (activeOffers === 0) {
        listContainer.innerHTML = '<div class="empty-state">You have no active offers.<br><br>Click the Create button to get started!</div>';
        return;
    }

    for (var i = 0; i < currentState.offers.length; i++) {
        var offer = currentState.offers[i];
        
        var el = document.createElement("div");
        el.className = "list-item";
        
        // Count bookings for this offer
        var bookingsCount = 0;
        for (var j = 0; j < currentState.bookings.length; j++) {
            if (currentState.bookings[j].offerId === offer.id) bookingsCount++;
        }

        var htmlString = '<div style="display:flex; flex-direction:column; gap:6px;">' + 
            '<div style="font-weight:700;">' + offer.title + '</div>' +
            '<div class="text-muted">' + offer.price + ' KGS • ' + offer.spots + ' spots left</div>' +
        '</div>' +
        '<div style="text-align:right;">' +
            '<div class="spots-badge" style="display:inline-block; margin-bottom:4px; background:var(--bg-main); border:1px solid var(--border-darker);">' + bookingsCount + ' Booked</div>' +
            '<div class="text-small" style="color:var(--primary); font-weight:600;">LIVE</div>' +
        '</div>';
        
        el.innerHTML = htmlString;
        listContainer.appendChild(el);
    }

    // Render Customer Requests
    var requestsContainer = document.getElementById("customer-requests-list");
    requestsContainer.innerHTML = "";
    
    var pendingRequests = [];
    if (currentState.requests) {
        for (var k = 0; k < currentState.requests.length; k++) {
            if (currentState.requests[k].status === "pending") {
                pendingRequests.push(currentState.requests[k]);
            }
        }
    }

    if (pendingRequests.length === 0) {
        requestsContainer.innerHTML = '<div class="empty-state">No pending customer requests right now.</div>';
    } else {
        for (var r = 0; r < pendingRequests.length; r++) {
            var req = pendingRequests[r];
            var reqEl = document.createElement("div");
            reqEl.className = "list-item";
            
            var reqHtml = '<div style="display:flex; flex-direction:column; gap:6px;">' + 
                '<div style="font-weight:700; color:var(--text-primary);">' + req.customerName + ' is looking for:</div>' +
                '<div style="font-size:0.9rem; color:var(--text-secondary);">"' + req.description + '"</div>' +
                '<div><span class="cat-pill" style="display:inline-block; padding:4px 8px; font-size:0.75rem; margin-top:4px;">' + req.category + '</span></div>' +
            '</div>' +
            '<div style="display:flex; align-items:center;">' +
                '<button class="btn btn-primary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="fulfillRequest(\'' + req.id + '\')">Fulfill</button>' +
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
