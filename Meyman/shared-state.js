// Meyman Shared State and Architecture (ICF Compliant)

var STORAGE_KEY = "meyman_data_v2";

function getInitialState() {
    var now = new Date().toISOString();
    return {
        offers: [
            {
                id: "offer_demo_1",
                title: "Cook Plov Dinner 🍽️",
                price: 1500,
                spots: 5,
                category: "Food",
                hostName: "Aigul",
                hostImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
                rating: 4.9,
                distance: "200m away",
                badges: ["verified-host", "top-rated", "warm-welcome"],
                tags: ["🍽️ Loves cooking", "☕ Tea & stories"],
                isLive: true,
                startTime: "Available now",
                location: { x: 30, y: 40 },
                createdAt: now,
                urgency: "Cooking now"
            },
            {
                id: "offer_demo_2",
                title: "Ala Archa Hike 🏔️",
                price: 2500,
                spots: 8,
                category: "Events",
                hostName: "Beksultan",
                hostImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
                rating: 4.8,
                distance: "1.2km away",
                badges: ["fast-responder", "popular-experience"],
                tags: ["🏔️ Mountain guide", "🚗 Scenic stops"],
                isLive: true,
                startTime: "Leaving now",
                location: { x: 70, y: 80 },
                createdAt: now,
                urgency: "Leaving in 30 min"
            },
            {
                id: "offer_demo_3",
                title: "Felt Making Workshop 🧶",
                price: 1200,
                spots: 4,
                category: "Events",
                hostName: "Nazira",
                hostImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
                rating: 4.9,
                distance: "450m away",
                badges: ["verified-host", "warm-welcome"],
                tags: ["🧶 Handmade crafts", "📖 Family traditions"],
                isLive: false,
                startTime: "Starting in 10 min",
                location: { x: 50, y: 50 },
                createdAt: now,
                urgency: "Starting in 10 min"
            },
            {
                id: "offer_demo_4",
                title: "Bishkek City Walk 🚶",
                price: 800,
                spots: 10,
                category: "Events",
                hostName: "Timur",
                hostImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
                rating: 4.7,
                distance: "600m away",
                badges: ["fast-responder", "top-rated"],
                tags: ["🚶 Hidden streets", "📸 Photo spots"],
                isLive: false,
                startTime: "Starting in 25 min",
                location: { x: 20, y: 30 },
                createdAt: now,
                urgency: "Gathering soon"
            },
            {
                id: "offer_demo_5",
                title: "Osh Bazaar Run 🛒",
                price: 900,
                spots: 6,
                category: "Services",
                hostName: "Bakyt",
                hostImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
                rating: 4.8,
                distance: "350m away",
                badges: ["fast-responder", "top-rated"],
                tags: ["🛒 Knows vendors", "🍞 Fresh bread"],
                isLive: true,
                startTime: "Going now",
                location: { x: 62, y: 34 },
                createdAt: now,
                urgency: "Going now"
            },
            {
                id: "offer_demo_6",
                title: "Shower Access 🚿",
                price: 200,
                spots: 4,
                category: "Essentials",
                hostName: "Gulzat",
                hostImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
                rating: 4.8,
                distance: "180m away",
                badges: ["verified-host", "fast-responder"],
                tags: ["🎒 Backpacker friendly", "⏱️ Quick stop"],
                isLive: true,
                startTime: "Available now",
                location: { x: 42, y: 62 },
                createdAt: now,
                urgency: "Available now"
            },
            {
                id: "offer_demo_7",
                title: "Laundry, Water & Charging 🧺",
                price: 300,
                spots: 6,
                category: "Essentials",
                hostName: "Mairam",
                hostImage: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=160&q=80",
                rating: 4.7,
                distance: "500m away",
                badges: ["fast-responder", "warm-welcome"],
                tags: ["🚰 Water refill", "🔌 Phone charging"],
                isLive: false,
                startTime: "Starting in 15 min",
                location: { x: 75, y: 48 },
                createdAt: now,
                urgency: "Starting in 15 min"
            }
        ],
        bookings: [
            { bookingId: "booking_demo_1", offerId: "offer_demo_1", timestamp: new Date(Date.now() - 86400000).toISOString() },
            { bookingId: "booking_demo_2", offerId: "offer_demo_1", timestamp: new Date(Date.now() - 40000000).toISOString() },
            { bookingId: "booking_demo_3", offerId: "offer_demo_2", timestamp: new Date(Date.now() - 20000000).toISOString() }
        ],
        requests: [],
        reviews: [
            { id: "rev_demo_1", offerId: "offer_demo_1", rating: 5, comment: "Amazing plov! Aigul is a wonderful host.", customerName: "Guest_2041", timestamp: new Date(Date.now() - 86400000).toISOString() },
            { id: "rev_demo_2", offerId: "offer_demo_1", rating: 5, comment: "Loved learning the history while cooking.", customerName: "Guest_5512", timestamp: new Date(Date.now() - 40000000).toISOString() },
            { id: "rev_demo_3", offerId: "offer_demo_2", rating: 4, comment: "Beautiful mountains, but bring warm clothes!", customerName: "Guest_9912", timestamp: new Date(Date.now() - 20000000).toISOString() }
        ]
    };
}

function loadState() {
    var rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
        try {
            return normalizeLoadedState(JSON.parse(rawData));
        } catch (e) {
            console.error("Failed to parse storage, returning initial state", e);
        }
    }
    return normalizeLoadedState(getInitialState());
}

function saveState(newState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}

// Ensure initial state exists
if (!localStorage.getItem(STORAGE_KEY)) {
    saveState(getInitialState());
}

function normalizeLoadedState(state) {
    if (!state) state = getInitialState();
    if (!state.offers) state.offers = [];
    if (!state.bookings) state.bookings = [];
    if (!state.requests) state.requests = [];
    if (!state.reviews) state.reviews = [];

    var demos = getInitialState().offers;
    for (var d = 0; d < demos.length; d++) {
        var existingDemo = findOfferById(state.offers, demos[d].id);
        if (!existingDemo) {
            state.offers.push(demos[d]);
        }
    }

    for (var i = 0; i < state.offers.length; i++) {
        state.offers[i] = enrichOfferForDemo(state.offers[i], i);
    }

    return state;
}

function findOfferById(offers, offerId) {
    for (var i = 0; i < offers.length; i++) {
        if (offers[i].id === offerId) return offers[i];
    }
    return null;
}

function enrichOfferForDemo(offer, index) {
    var hostDefaults = getHostDefaults(offer.hostName, index);

    if (!offer.hostName) offer.hostName = hostDefaults.hostName;
    if (!offer.hostImage) offer.hostImage = hostDefaults.hostImage;
    if (!offer.rating) offer.rating = hostDefaults.rating;
    if (!offer.distance) offer.distance = hostDefaults.distance;
    if (!offer.badges || !offer.badges.length) offer.badges = hostDefaults.badges;
    if (!offer.tags || !offer.tags.length) offer.tags = hostDefaults.tags;
    if (offer.isLive === undefined) offer.isLive = hostDefaults.isLive;
    if (!offer.startTime) offer.startTime = offer.isLive ? "Available now" : (offer.urgency || "Starting soon");

    return offer;
}

function getHostDefaults(hostName, index) {
    var defaults = {
        Aigul: {
            hostName: "Aigul",
            hostImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
            rating: 4.9,
            distance: "200m away",
            badges: ["verified-host", "top-rated", "warm-welcome"],
            tags: ["🍽️ Loves cooking", "☕ Tea & stories"],
            isLive: true
        },
        Beksultan: {
            hostName: "Beksultan",
            hostImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
            rating: 4.8,
            distance: "1.2km away",
            badges: ["fast-responder", "popular-experience"],
            tags: ["🏔️ Mountain guide", "🚗 Scenic stops"],
            isLive: true
        },
        Nazira: {
            hostName: "Nazira",
            hostImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
            rating: 4.9,
            distance: "450m away",
            badges: ["verified-host", "warm-welcome"],
            tags: ["🧶 Handmade crafts", "📖 Family traditions"],
            isLive: false
        },
        Timur: {
            hostName: "Timur",
            hostImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
            rating: 4.7,
            distance: "600m away",
            badges: ["fast-responder", "top-rated"],
            tags: ["🚶 Hidden streets", "📸 Photo spots"],
            isLive: false
        },
        Bakyt: {
            hostName: "Bakyt",
            hostImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
            rating: 4.8,
            distance: "350m away",
            badges: ["fast-responder", "top-rated"],
            tags: ["🛒 Knows vendors", "🍞 Fresh bread"],
            isLive: true
        },
        Gulzat: {
            hostName: "Gulzat",
            hostImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
            rating: 4.8,
            distance: "180m away",
            badges: ["verified-host", "fast-responder"],
            tags: ["🎒 Backpacker friendly", "⏱️ Quick stop"],
            isLive: true
        },
        Mairam: {
            hostName: "Mairam",
            hostImage: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=160&q=80",
            rating: 4.7,
            distance: "500m away",
            badges: ["fast-responder", "warm-welcome"],
            tags: ["🚰 Water refill", "🔌 Phone charging"],
            isLive: false
        }
    };

    if (defaults[hostName]) return defaults[hostName];

    return {
        hostName: hostName || "Aigul",
        hostImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
        rating: 4.8,
        distance: (250 + (index * 80)) + "m away",
        badges: ["verified-host", "top-rated"],
        tags: ["🤝 Warm welcome", "☕ Local stories"],
        isLive: index % 3 === 0
    };
}

// 7-Stage Pipeline Implementation Engine
function executeAction(actionType, payload) {
    var currentState = loadState();
    var context = {};
    var processedState = null;
    var result = null;

    try {
        // 1. Validate
        if (!validateAction(actionType, payload)) {
            throw new Error("Validation failed for action: " + actionType);
        }

        // 2. Normalize
        var normalizedPayload = normalizeAction(actionType, payload);

        // 3. Add Context
        context = addContext(actionType, normalizedPayload);

        // 4. Authorize
        if (!authorizeAction(actionType, context)) {
            throw new Error("Authorization failed for action: " + actionType);
        }

        // 5. Process (Must return NEW state)
        processedState = processAction(actionType, currentState, context);

        // Save immediately post-process
        saveState(processedState);

        // 6. Finalize
        result = finalizeAction(actionType, processedState, context);

        // 7. Emit Result
        emitResult(actionType, true, result);
        return result;

    } catch (error) {
        emitResult(actionType, false, error.message);
        return { success: false, error: error.message };
    }
}

// --- Pipeline Stages Specifics ---

function validateAction(actionType, payload) {
    if (actionType === "CREATE_OFFER") {
        return payload && payload.title && payload.price && payload.category;
    }
    if (actionType === "BOOK_OFFER") {
        return payload && payload.offerId !== undefined;
    }
    if (actionType === "CREATE_REQUEST") {
        return payload && payload.description && payload.category;
    }
    if (actionType === "FULFILL_REQUEST") {
        return payload && payload.requestId !== undefined;
    }
    if (actionType === "CREATE_REVIEW") {
        return payload && payload.offerId && payload.rating && payload.comment;
    }
    return false;
}

function normalizeAction(actionType, payload) {
    var normalized = Object.assign({}, payload);
    if (actionType === "CREATE_OFFER") {
        normalized.title = String(payload.title).trim();
        normalized.price = Number(payload.price) || 0;
        normalized.spots = Number(payload.spots) || 1;
        normalized.category = String(payload.category).trim();
    }
    if (actionType === "CREATE_REQUEST") {
        normalized.description = String(payload.description).trim();
        normalized.category = String(payload.category).trim();
    }
    if (actionType === "CREATE_REVIEW") {
        normalized.rating = Math.min(Math.max(Number(payload.rating) || 5, 1), 5);
        normalized.comment = String(payload.comment).trim();
    }
    return normalized;
}

function addContext(actionType, normalizedPayload) {
    var context = Object.assign({}, normalizedPayload);
    context.timestamp = new Date().toISOString();
    
    if (actionType === "CREATE_OFFER") {
        context.offerId = "offer_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        context.hostName = "Aigul"; // Concept Art Host Name
        context.hostImage = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80";
        context.rating = 4.9;
        context.distance = "200m away";
        context.badges = ["verified-host", "top-rated", "warm-welcome"];
        context.tags = ["🍽️ Loves cooking", "☕ Tea & stories"];
        context.isLive = true;
        context.startTime = "Available now";
        context.location = {
            // Random location offset for UI map positioning
            x: Math.floor(Math.random() * 80) + 10,
            y: Math.floor(Math.random() * 80) + 10
        };
    }
    if (actionType === "BOOK_OFFER") {
        context.bookingId = "booking_" + Date.now();
    }
    if (actionType === "CREATE_REQUEST") {
        context.requestId = "req_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        context.customerName = "Guest_" + Math.floor(Math.random() * 9000 + 1000);
    }
    if (actionType === "CREATE_REVIEW") {
        context.reviewId = "rev_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        context.customerName = "Guest_" + Math.floor(Math.random() * 9000 + 1000);
    }
    return context;
}

function authorizeAction(actionType, context) {
    // Basic authorization layer mockup
    return true;
}

function processAction(actionType, currentState, context) {
    // Clone state to prevent direct mutation
    var newState = JSON.parse(JSON.stringify(currentState));

    if (actionType === "CREATE_OFFER") {
        var newOffer = {
            id: context.offerId,
            title: context.title,
            price: context.price,
            spots: context.spots,
            category: context.category,
            hostName: context.hostName,
            hostImage: context.hostImage,
            rating: context.rating,
            distance: context.distance,
            badges: context.badges,
            tags: context.tags,
            isLive: context.isLive,
            startTime: context.startTime,
            location: context.location,
            createdAt: context.timestamp
        };
        newState.offers.push(newOffer);
    } 
    else if (actionType === "BOOK_OFFER") {
        var targetOffer = undefined;
        for (var i = 0; i < newState.offers.length; i++) {
            if (newState.offers[i].id === context.offerId) {
                targetOffer = newState.offers[i];
                break;
            }
        }
        
        if (targetOffer && targetOffer.spots > 0) {
            targetOffer.spots -= 1;
            newState.bookings.push({
                bookingId: context.bookingId,
                offerId: context.offerId,
                timestamp: context.timestamp
            });
        } else {
            throw new Error("Offer not found or no spots available.");
        }
    }
    else if (actionType === "CREATE_REQUEST") {
        // Ensure requests array exists for old state versions
        if (!newState.requests) newState.requests = [];
        
        newState.requests.push({
            id: context.requestId,
            description: context.description,
            category: context.category,
            customerName: context.customerName,
            status: "pending",
            timestamp: context.timestamp
        });
    }
    else if (actionType === "FULFILL_REQUEST") {
        if (!newState.requests) newState.requests = [];
        var found = false;
        for (var j = 0; j < newState.requests.length; j++) {
            if (newState.requests[j].id === context.requestId) {
                newState.requests[j].status = "fulfilled";
                found = true;
                break;
            }
        }
        if (!found) throw new Error("Request not found.");
    }
    else if (actionType === "CREATE_REVIEW") {
        if (!newState.reviews) newState.reviews = [];
        newState.reviews.push({
            id: context.reviewId,
            offerId: context.offerId,
            rating: context.rating,
            comment: context.comment,
            customerName: context.customerName,
            timestamp: context.timestamp
        });
    }

    return newState;
}

function finalizeAction(actionType, processedState, context) {
    if (actionType === "CREATE_OFFER") {
        return { success: true, offerId: context.offerId };
    }
    if (actionType === "BOOK_OFFER") {
        return { success: true, bookingId: context.bookingId };
    }
    if (actionType === "CREATE_REQUEST") {
        return { success: true, requestId: context.requestId };
    }
    if (actionType === "FULFILL_REQUEST") {
        return { success: true };
    }
    if (actionType === "CREATE_REVIEW") {
        return { success: true, reviewId: context.reviewId };
    }
    return { success: true };
}

function emitResult(actionType, isSuccess, details) {
    var status = isSuccess ? "SUCCESS" : "FAILED";
    console.log("[Pipeline Emit] Action: " + actionType + " | Status: " + status, details);
}
