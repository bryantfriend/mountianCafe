// Meyman Shared State and Architecture (ICF Compliant)

var STORAGE_KEY = "meyman_data_v2";

function getInitialState() {
    var now = new Date().toISOString();
    return {
        offers: [
            {
                id: "offer_demo_1",
                title: "Traditional Plov Masterclass",
                price: 1500,
                spots: 5,
                category: "Food",
                hostName: "Aigul",
                location: { x: 30, y: 40 },
                createdAt: now,
                urgency: "Cooking now"
            },
            {
                id: "offer_demo_2",
                title: "Ala Archa National Park Hike",
                price: 2500,
                spots: 8,
                category: "Events",
                hostName: "Beksultan",
                location: { x: 70, y: 80 },
                createdAt: now,
                urgency: "Leaving in 30 min"
            },
            {
                id: "offer_demo_3",
                title: "Felt Making Cultural Workshop",
                price: 1200,
                spots: 4,
                category: "Events",
                hostName: "Nazira",
                location: { x: 50, y: 50 },
                createdAt: now,
                urgency: "Starting in 10 min"
            },
            {
                id: "offer_demo_4",
                title: "Bishkek City Walk",
                price: 800,
                spots: 10,
                category: "Events",
                hostName: "Timur",
                location: { x: 20, y: 30 },
                createdAt: now,
                urgency: "Gathering soon"
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
            return JSON.parse(rawData);
        } catch (e) {
            console.error("Failed to parse storage, returning initial state", e);
        }
    }
    return getInitialState();
}

function saveState(newState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}

// Ensure initial state exists
if (!localStorage.getItem(STORAGE_KEY)) {
    saveState(getInitialState());
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
