// Seller App Logic (ICF Compliant)

function initSellerApp() {
    refreshDashboard();
}

function getSellerOfferImage(offer) {
    if (offer.image) return offer.image;
    if (typeof getCategoryCoverImage === "function") return getCategoryCoverImage(offer.category);
    return "https://source.unsplash.com/800x600/?kyrgyzstan,travel";
}

function getProviderDashboardState() {
    var state = loadState();
    var offers = (state.offers || []).slice();
    var bookings = state.bookings || [];
    var reviews = state.reviews || [];
    var completedBookings = bookings.length;
    var totalEarned = 0;
    var pendingPayments = 0;
    var weeklyBuckets = [2200, 3400, 1800, 4200, 2900, 5100, 3900];
    var serviceSummaries = [];
    var flags = [];
    var reviewMap = {};
    var reviewTotal = 0;

    for (var r = 0; r < reviews.length; r++) {
        reviewTotal += reviews[r].rating;
        if (!reviewMap[reviews[r].offerId]) reviewMap[reviews[r].offerId] = [];
        reviewMap[reviews[r].offerId].push(reviews[r]);
    }

    for (var i = 0; i < offers.length; i++) {
        var offer = offers[i];
        var offerBookings = 0;
        for (var b = 0; b < bookings.length; b++) {
            if (bookings[b].offerId === offer.id) offerBookings++;
        }

        var offerEarned = offer.price * offerBookings;
        totalEarned += offerEarned;

        if (offer.isLive || offerBookings === 0) {
            pendingPayments += Math.round(offer.price * 0.12);
        }

        var offerReviews = reviewMap[offer.id] || [];
        var offerRating = offer.rating || 0;
        if (offerReviews.length) {
            var offerReviewTotal = 0;
            for (var orx = 0; orx < offerReviews.length; orx++) offerReviewTotal += offerReviews[orx].rating;
            offerRating = offerReviewTotal / offerReviews.length;
        }

        var needsFix = offerRating < 4.0 || !offer.image || offerBookings === 0;
        serviceSummaries.push({
            id: offer.id,
            title: offer.title,
            image: getSellerOfferImage(offer),
            price: offer.price,
            rating: offerRating.toFixed(1),
            status: needsFix ? "Needs Fix" : "Active",
            bookings: offerBookings
        });

        if (offerRating < 4.0) {
            flags.push({
                serviceId: offer.id,
                message: offer.title + " has a low rating (" + offerRating.toFixed(1) + "⭐)",
                action: "Fix Now"
            });
        }
        if (!offer.image) {
            flags.push({
                serviceId: offer.id,
                message: "Add photos to " + offer.title + " to increase bookings",
                action: "Fix Now"
            });
        }
        if (offerBookings === 0) {
            flags.push({
                serviceId: offer.id,
                message: offer.title + " has no bookings yet - refresh pricing or photos",
                action: "Fix Now"
            });
        }
    }

    if (flags.length === 0 && offers.length) {
        flags.push({
            serviceId: "",
            message: "Everything looks good ✅",
            action: ""
        });
    }

    var avgRating = reviews.length ? (reviewTotal / reviews.length) : 4.7;
    var profileSuggestions = [];
    if (offers.length < 4) profileSuggestions.push("Add more services");
    if (flags.length > 0 && flags[0].action) profileSuggestions.push("Resolve service issues");
    profileSuggestions.push("Add more photos");
    profileSuggestions.push("Update availability");

    return {
        providerName: "Aizada | Nomad Host",
        joinedLabel: "Joined April 2026",
        trustBadge: "Trusted Local ⭐",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
        totalEarned: totalEarned || 24500,
        avgRating: avgRating.toFixed(1),
        guestsServed: completedBookings || 128,
        completionRate: completedBookings ? 96 : 96,
        pendingPayments: pendingPayments || 3600,
        platformFeePercent: 12,
        weeklyEarnings: weeklyBuckets,
        services: serviceSummaries.slice(0, 6),
        reviews: reviews.slice().sort(function(a, b) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }).slice(0, 3),
        flags: flags.slice(0, 3),
        profileStrength: 70,
        profileSuggestions: profileSuggestions.slice(0, 3)
    };
}

function renderMiniBarChart(values) {
    var max = 1;
    for (var i = 0; i < values.length; i++) {
        if (values[i] > max) max = values[i];
    }

    var html = '<div class="mini-chart">';
    for (var j = 0; j < values.length; j++) {
        var height = Math.max(18, Math.round((values[j] / max) * 72));
        html += '<div class="mini-bar-wrap"><div class="mini-bar" style="height:' + height + 'px;"></div></div>';
    }
    html += '</div>';
    return html;
}

function renderProviderServices(services) {
    var html = '<div class="provider-services-row">';
    for (var i = 0; i < services.length; i++) {
        var service = services[i];
        var statusClass = service.status === "Active" ? "is-active" : "is-warning";
        html += '' +
            '<article class="provider-service-card">' +
                '<div class="provider-service-thumb" style="background-image:url(\'' + service.image + '\');"></div>' +
                '<div class="provider-service-body">' +
                    '<div class="provider-service-title">' + service.title + '</div>' +
                    '<div class="provider-service-meta">' + service.price + ' KGS • ⭐ ' + service.rating + '</div>' +
                    '<div class="provider-service-status ' + statusClass + '">' + service.status + '</div>' +
                    '<div class="provider-service-actions">' +
                        '<button class="btn btn-outline provider-inline-btn" onclick="openProviderServiceManager(\'' + service.id + '\', \'edit\')">Edit</button>' +
                        '<button class="btn btn-primary provider-inline-btn" onclick="openProviderServiceManager(\'' + service.id + '\', \'view\')">View</button>' +
                    '</div>' +
                '</div>' +
            '</article>';
    }
    html += '</div>';
    return html;
}

function renderProviderReviews(reviews, state) {
    if (!reviews.length) {
        return '<div class="provider-empty-note">No guest feedback yet.</div>';
    }

    var html = '<div class="provider-review-list">';
    for (var i = 0; i < reviews.length; i++) {
        var review = reviews[i];
        var offer = findOfferById(state.offers || [], review.offerId);
        html += '' +
            '<article class="provider-review-card">' +
                '<div class="provider-review-top">' +
                    '<div>' +
                        '<div class="provider-review-name">' + review.customerName + '</div>' +
                        '<div class="provider-review-service">' + (offer ? offer.title : "Guest review") + '</div>' +
                    '</div>' +
                    '<div class="provider-review-rating">⭐ ' + review.rating + '</div>' +
                '</div>' +
                '<p class="provider-review-comment">' + review.comment + '</p>' +
                '<button class="btn btn-outline provider-inline-btn" onclick="replyToReview(\'' + review.id + '\')">Reply</button>' +
            '</article>';
    }
    html += '</div>';
    return html;
}

function renderFlags(flags) {
    if (!flags.length) {
        return '<div class="provider-empty-note success-note">Everything looks good ✅</div>';
    }

    var html = '<div class="provider-flag-list">';
    for (var i = 0; i < flags.length; i++) {
        var flag = flags[i];
        if (!flag.action) {
            html += '<div class="provider-empty-note success-note">' + flag.message + '</div>';
            continue;
        }
        html += '' +
            '<div class="provider-flag-item">' +
                '<div class="provider-flag-copy">' + flag.message + '</div>' +
                '<button class="btn btn-primary provider-inline-btn" onclick="openProviderServiceManager(\'' + flag.serviceId + '\', \'edit\')">' + flag.action + '</button>' +
            '</div>';
    }
    html += '</div>';
    return html;
}

function renderProviderDashboardModal() {
    var dashboard = getProviderDashboardState();
    var state = loadState();
    var sheet = document.getElementById("dummy-feature-sheet");

    var htmlContent = '<div class="sheet-handle"></div>';
    htmlContent += '<div class="provider-dashboard">';
    htmlContent += '<div class="provider-header-card">';
    htmlContent += '<img class="provider-avatar" src="' + dashboard.avatar + '" alt="' + dashboard.providerName + '">';
    htmlContent += '<div class="provider-header-copy">';
    htmlContent += '<div class="provider-name">' + dashboard.providerName + '</div>';
    htmlContent += '<div class="provider-subtext">' + dashboard.joinedLabel + '</div>';
    htmlContent += '<div class="provider-trust-badge">' + dashboard.trustBadge + '</div>';
    htmlContent += '</div>';
    htmlContent += '<button class="btn btn-outline provider-public-btn" onclick="openProviderServiceManager(\'\', \'public\')">View Public Profile</button>';
    htmlContent += '</div>';

    htmlContent += '<div class="provider-stats-grid">';
    htmlContent += '<div class="provider-stat-card"><div class="provider-stat-label">💰 Total Earned</div><div class="provider-stat-value">' + dashboard.totalEarned.toLocaleString() + ' KGS</div></div>';
    htmlContent += '<div class="provider-stat-card"><div class="provider-stat-label">⭐ Rating</div><div class="provider-stat-value">' + dashboard.avgRating + '</div></div>';
    htmlContent += '<div class="provider-stat-card"><div class="provider-stat-label">🧑‍🤝‍🧑 Guests Served</div><div class="provider-stat-value">' + dashboard.guestsServed + '</div></div>';
    htmlContent += '<div class="provider-stat-card"><div class="provider-stat-label">✅ Completion Rate</div><div class="provider-stat-value">' + dashboard.completionRate + '%</div></div>';
    htmlContent += '</div>';

    htmlContent += '<div class="provider-section-header"><h3>Your Services</h3><button class="provider-link-btn" onclick="openCreateModal(); closeDummyFeature();">+ Add Service</button></div>';
    htmlContent += renderProviderServices(dashboard.services);

    htmlContent += '<div class="provider-panel">';
    htmlContent += '<div class="provider-section-header compact"><h3>Earnings</h3></div>';
    htmlContent += '<div class="provider-earnings-grid">';
    htmlContent += '<div><div class="provider-meta-label">Total Earned</div><div class="provider-money">' + dashboard.totalEarned.toLocaleString() + ' KGS</div></div>';
    htmlContent += '<div><div class="provider-meta-label">Pending Payments</div><div class="provider-money muted">' + dashboard.pendingPayments.toLocaleString() + ' KGS</div></div>';
    htmlContent += '<div><div class="provider-meta-label">Platform Fee</div><div class="provider-money muted">' + dashboard.platformFeePercent + '% due</div></div>';
    htmlContent += '</div>';
    htmlContent += renderMiniBarChart(dashboard.weeklyEarnings);
    htmlContent += '</div>';

    htmlContent += '<div class="provider-panel">';
    htmlContent += '<div class="provider-section-header compact"><h3>Guest Feedback</h3></div>';
    htmlContent += '<div class="provider-rating-hero">' + dashboard.avgRating + '<span>/5</span></div>';
    htmlContent += renderProviderReviews(dashboard.reviews, state);
    htmlContent += '</div>';

    htmlContent += '<div class="provider-panel">';
    htmlContent += '<div class="provider-section-header compact"><h3>Needs Attention ⚠️</h3></div>';
    htmlContent += renderFlags(dashboard.flags);
    htmlContent += '</div>';

    htmlContent += '<div class="provider-panel">';
    htmlContent += '<div class="provider-section-header compact"><h3>Profile Strength</h3><button class="btn btn-outline provider-inline-btn" onclick="openBadgesModal()">🏅 View Badges</button></div>';
    htmlContent += '<div class="profile-strength-row"><div class="profile-strength-bar"><span style="width:' + dashboard.profileStrength + '%;"></span></div><div class="profile-strength-value">' + dashboard.profileStrength + '%</div></div>';
    htmlContent += '<div class="profile-strength-list">';
    for (var p = 0; p < dashboard.profileSuggestions.length; p++) {
        htmlContent += '<div class="profile-strength-item">' + dashboard.profileSuggestions[p] + '</div>';
    }
    htmlContent += '</div></div>';

    htmlContent += '<div class="provider-panel provider-settings-panel">';
    htmlContent += '<button class="provider-settings-btn" onclick="openDummyFeature(\'Payments\')">Payment Methods <span>→</span></button>';
    htmlContent += '<button class="provider-settings-btn" onclick="openDummyFeature(\'Language\')">Language (EN) <span>→</span></button>';
    htmlContent += '<button class="provider-settings-btn is-danger" onclick="closeDummyFeature()">Log Out <span>→</span></button>';
    htmlContent += '</div>';

    htmlContent += '</div>';

    sheet.innerHTML = htmlContent;
    document.getElementById("dummy-feature-modal").classList.remove("hidden");
}

function renderHostBadgesModal() {
    var badgesSheet = document.getElementById("badges-sheet");
    badgesSheet.innerHTML =
        '<div class="sheet-handle"></div>' +
        '<div class="provider-section-header compact">' +
            '<h3>Your Badges</h3>' +
            '<button class="btn-icon provider-badge-close" onclick="closeBadgesModal()">✕</button>' +
        '</div>' +
        '<div class="provider-badges-wrap">' + renderBadgeGrid({ group: "host" }) + '</div>';
}

function openBadgesModal() {
    renderHostBadgesModal();
    document.getElementById("badges-modal").classList.remove("hidden");
}

function closeBadgesModal() {
    document.getElementById("badges-modal").classList.add("hidden");
}

function openProviderServiceManager(serviceId, mode) {
    var state = loadState();
    var offer = serviceId ? findOfferById(state.offers || [], serviceId) : null;

    if (mode === "public") {
        alert("Public provider profile preview opened for demo.");
        return;
    }

    if (!offer) {
        if (mode === "edit") {
            closeDummyFeature();
            openCreateModal();
        }
        return;
    }

    var sheet = document.getElementById("dummy-feature-sheet");
    sheet.innerHTML =
        '<div class="sheet-handle"></div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<h2 style="font-size:1.5rem; color:var(--text-primary);">' + (mode === "edit" ? "Edit Service" : "Service Details") + '</h2>' +
            '<button class="btn-icon" style="box-shadow:none; border:none; width:36px; height:36px; background:var(--border-color); color:var(--text-primary);" onclick="closeDummyFeature()">✕</button>' +
        '</div>' +
        '<div class="provider-service-detail">' +
            '<div class="provider-service-thumb large" style="background-image:url(\'' + getSellerOfferImage(offer) + '\');"></div>' +
            '<div class="provider-service-title">' + offer.title + '</div>' +
            '<div class="provider-service-meta">' + offer.price + ' KGS • ⭐ ' + offer.rating + '</div>' +
            '<div class="tag-row">' + (offer.tags ? '<span class="tag">' + offer.tags.join('</span><span class="tag">') + '</span>' : '') + '</div>' +
            '<button class="btn btn-primary" style="margin-top:1rem;" onclick="alert(\'Quick edit tools coming next.\')">' + (mode === "edit" ? "Fix This Service" : "Edit Service") + '</button>' +
        '</div>';
}

function replyToReview(reviewId) {
    alert("Reply composer opened for review " + reviewId + ".");
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
                '<div class="offer-card-img" style="background-image:url(\'' + getSellerOfferImage(offer) + '\');">' +
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
    document.getElementById("offer-category").value = "Eat Like a Local 🍽️";

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
        renderProviderDashboardModal();
        return;
    } else if (featureName === 'Payments') {
        htmlContent += '<div class="provider-empty-note">Linked payouts: MBANK, Visa / MasterCard, and cash terminals.</div>';
    } else if (featureName === 'Language') {
        htmlContent += '<div class="provider-empty-note">Language preferences will live here. English is active for the demo.</div>';
    }

    sheet.innerHTML = htmlContent;
    modal.classList.remove("hidden");
}

function closeDummyFeature() {
    document.getElementById("dummy-feature-modal").classList.add("hidden");
}

// Boot application
window.onload = initSellerApp;
