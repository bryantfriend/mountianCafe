// Seller App Logic (ICF Compliant)

function initSellerApp() {
    refreshDashboard();
}

// Ensure no arrow functions as per ICF Rules
function refreshDashboard() {
    var currentState = loadState();
    var sortedOffers = currentState.offers.slice();
    sortedOffers.sort(function(a, b) {
        if (!!a.isLive === !!b.isLive) return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        return a.isLive ? -1 : 1;
    });
    
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
        for (var i = 0; i < sortedOffers.length; i++) {
            var offer = sortedOffers[i];
            
            var el = document.createElement("div");
            el.className = "offer-card" + (offer.isLive ? " live-card" : "");
            
            // Count bookings for this offer
            var bookingsCount = 0;
            for (var j = 0; j < currentState.bookings.length; j++) {
                if (currentState.bookings[j].offerId === offer.id) bookingsCount++;
            }

            var trustPills = renderBadgePills(offer.badges || getHostTrustBadges(offer.hostName));
            var liveHtml = offer.isLive ? '<div class="live-badge">LIVE NOW</div>' : "";
            var availabilityText = offer.isLive ? "Available now" : (offer.startTime || offer.urgency || "Starting soon");
            var htmlString = 
                '<div class="offer-card-img" style="background-image:url(\'https://images.unsplash.com/photo-1541843666579-166fb9c072eb?auto=format&fit=crop&w=400&q=80\');">' +
                    liveHtml +
                '</div>' +
                '<div class="offer-card-body">' +
                    '<div class="offer-title">' + offer.title + '</div>' +
                    '<div class="availability-line ' + (offer.isLive ? "is-live" : "") + '">' + availabilityText + '</div>' +
                    '<div class="host-row">' +
                        '<img class="host-avatar" src="' + offer.hostImage + '" alt="' + offer.hostName + '">' +
                        '<div class="host-copy">' +
                            '<div class="host-name">' + offer.hostName + '</div>' +
                            '<div class="host-meta">⭐ ' + offer.rating + ' • ' + offer.distance + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="badge-pill-row">' + trustPills + '</div>' +
                    '<div class="tag-row"><span class="tag">' + (offer.tags && offer.tags[0] ? offer.tags[0] : "🤝 Warm welcome") + '</span><span class="tag">' + (offer.tags && offer.tags[1] ? offer.tags[1] : "☕ Local stories") + '</span></div>' +
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

// Dummy Feature Handlers for Host App Hackathon MVP
function openDummyFeature(featureName) {
    var modal = document.getElementById("dummy-feature-modal");
    var sheet = document.getElementById("dummy-feature-sheet");
    
    // Update active state in bottom nav if applicable
    var navItems = document.querySelectorAll(".nav-item");
    for(var i=0; i<navItems.length; i++) {
        navItems[i].classList.remove("active");
        var icon = navItems[i].querySelector(".nav-icon");
        var text = navItems[i].querySelector("span:not(.nav-icon)");
        if(icon) icon.style.color = "var(--text-tertiary)";
        if(text) text.style.color = "var(--text-tertiary)";
        
        if (featureName !== 'Menu' && featureName !== 'Notifications' && featureName !== 'Calendar' && featureName !== 'Earnings') {
            if (navItems[i].innerText.indexOf(featureName === 'Messages' ? 'Inbox' : featureName) !== -1) {
                navItems[i].classList.add("active");
                if(icon) icon.style.color = "var(--primary)";
                if(text) text.style.color = "var(--primary)";
            }
        }
    }

    var htmlContent = '<div class="sheet-handle"></div>';
    htmlContent += '<div style="display:flex; justify-content:space-between; align-items:center;">';
    htmlContent += '<h2 style="font-size:1.5rem; color:var(--text-primary);">' + featureName + '</h2>';
    htmlContent += '<button class="btn-icon" style="box-shadow:none; border:none; width:36px; height:36px; background:var(--border-color); color:var(--text-primary);" onclick="closeDummyFeature()">✕</button>';
    htmlContent += '</div>';
    
    if (featureName === 'Menu') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">';
        htmlContent += '<button class="btn btn-outline" style="justify-content:flex-start; font-weight:600; font-size:1.1rem; border:none; padding:1rem;">Host Settings</button>';
        htmlContent += '<button class="btn btn-outline" style="justify-content:flex-start; font-weight:600; font-size:1.1rem; border:none; padding:1rem;">Manage Payments</button>';
        htmlContent += '<button class="btn btn-outline" style="justify-content:flex-start; font-weight:600; font-size:1.1rem; border:none; padding:1rem;">Help & Support</button>';
        htmlContent += '<a href="index.html" class="btn btn-outline" style="justify-content:flex-start; font-weight:600; font-size:1.1rem; border:none; padding:1rem; color:var(--primary); text-decoration:none;">Switch to Tourist Mode</a>';
        htmlContent += '</div>';
    } else if (featureName === 'Notifications') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">';
        htmlContent += '<div style="background:var(--bg-main); padding:1rem; border-radius:12px; border:1px solid var(--border-color);"><div style="font-weight:700; color:var(--text-primary);">New Request Received</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Guest_5412 is looking for a food experience.</div><div style="font-size:0.75rem; color:var(--primary); margin-top:8px;">2 mins ago</div></div>';
        htmlContent += '<div style="background:var(--bg-main); padding:1rem; border-radius:12px; border:1px solid var(--border-color);"><div style="font-weight:700; color:var(--text-primary);">Earnings Transferred</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">4,500 KGS has been sent to your linked card.</div><div style="font-size:0.75rem; color:var(--text-tertiary); margin-top:8px;">Yesterday</div></div>';
        htmlContent += '</div>';
    } else if (featureName === 'Calendar' || featureName === 'Bookings') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">';
        htmlContent += '<div style="background:var(--bg-main); padding:1rem; border-radius:12px; border:1px solid var(--border-color);"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">Home Cooked Dinner</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Tomorrow, 19:00 • 2 guests</div><div style="margin-top:8px;"><span style="background:#e8f5e9; color:#2e7d32; padding:4px 8px; border-radius:8px; font-size:0.75rem; font-weight:600;">Confirmed</span></div></div>';
        htmlContent += '<div style="background:var(--bg-main); padding:1rem; border-radius:12px; border:1px solid var(--border-color);"><div style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">Bishkek City Walk</div><div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Saturday, 10:00 • 4 guests</div><div style="margin-top:8px;"><span style="background:#fff3e0; color:#ef6c00; padding:4px 8px; border-radius:8px; font-size:0.75rem; font-weight:600;">Awaiting Payment</span></div></div>';
        htmlContent += '</div>';
    } else if (featureName === 'Earnings') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">';
        htmlContent += '<div style="text-align:center; margin-bottom:1rem;"><div style="font-size:2.5rem; font-weight:800; color:var(--text-primary);">18,450 <span style="font-size:1.2rem; color:var(--text-secondary);">KGS</span></div><div style="font-size:0.9rem; color:#4caf50; font-weight:600;">↑ 2,300 this week</div></div>';
        htmlContent += '<button class="btn btn-primary">Withdraw Funds</button>';
        htmlContent += '<h3 style="font-size:1.1rem; margin-top:1rem;">Recent Transactions</h3>';
        htmlContent += '<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;"><div><div style="font-weight:600;">Payout to Card</div><div style="font-size:0.8rem; color:var(--text-secondary);">Aug 14</div></div><div style="font-weight:700; color:var(--text-primary);">-4,500 KGS</div></div>';
        htmlContent += '<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;"><div><div style="font-weight:600;">Booking (Dinner)</div><div style="font-size:0.8rem; color:var(--text-secondary);">Aug 12</div></div><div style="font-weight:700; color:#4caf50;">+2,400 KGS</div></div>';
        htmlContent += '</div>';
    } else if (featureName === 'Messages') {
        htmlContent += '<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">';
        htmlContent += '<div style="display:flex; align-items:center; gap:12px; padding-bottom:1rem; border-bottom:1px solid var(--border-color);"><div style="width:48px; height:48px; border-radius:50%; background:#e0f7fa; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">👨</div><div style="flex:1;"><div style="display:flex; justify-content:space-between;"><span style="font-weight:700;">John D.</span><span style="font-size:0.75rem; color:var(--text-secondary);">10:42 AM</span></div><div style="font-size:0.9rem; color:var(--text-secondary); margin-top:2px;">Looking forward to the dinner!</div></div></div>';
        htmlContent += '<div style="display:flex; align-items:center; gap:12px; padding-bottom:1rem; border-bottom:1px solid var(--border-color);"><div style="width:48px; height:48px; border-radius:50%; background:#fce4ec; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">👩</div><div style="flex:1;"><div style="display:flex; justify-content:space-between;"><span style="font-weight:700;">Sarah M.</span><span style="font-size:0.75rem; color:var(--text-secondary);">Yesterday</span></div><div style="font-size:0.9rem; color:var(--text-primary); font-weight:600; margin-top:2px;">Is the meeting point still at...</div></div><div style="width:10px; height:10px; border-radius:50%; background:var(--primary);"></div></div>';
        htmlContent += '</div>';
    } else if (featureName === 'Profile') {
        htmlContent += '<div style="margin-top:1.5rem; text-align:center; display:flex; flex-direction:column; align-items:center;">';
        htmlContent += '<div style="width:80px; height:80px; border-radius:50%; background:url(\'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200\') center/cover; margin-bottom:1rem;"></div>';
        htmlContent += '<h3 style="font-size:1.3rem;">Aigul</h3>';
        htmlContent += '<p style="color:var(--text-secondary); font-size:0.9rem; margin-top:4px;">Superhost in Bishkek</p>';
        htmlContent += '<button class="btn btn-primary" style="margin-top:1rem;" onclick="openHostConduct()">Start Verification</button>';
        htmlContent += '<button class="btn btn-outline" style="margin-top:1.5rem;">Edit Profile</button>';
        htmlContent += '</div>';
        htmlContent += '<div data-profile-badges="host">' + renderBadgeGrid({ group: "host" }) + '</div>';
    }

    sheet.innerHTML = htmlContent;
    modal.classList.remove("hidden");
}

function closeDummyFeature() {
    document.getElementById("dummy-feature-modal").classList.add("hidden");
}

// Boot application
window.onload = initSellerApp;
