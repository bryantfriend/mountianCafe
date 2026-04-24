// Meyman Shared State and Architecture (ICF Compliant)

var STORAGE_KEY = "meyman_data_v4";

function getInitialState() {
    var now = new Date().toISOString();
    return {
        offers: [
            {
                id: "offer_demo_1",
                title: "Boorsok Making & Tasting 🍞",
                price: 950,
                spots: 5,
                category: "Eat Like a Local 🍽️",
                hostName: "Aisuluu",
                hostImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=160&q=80",
                rating: 4.9,
                priceLabel: "950 KGS / person",
                distance: "220m away",
                image: "https://source.unsplash.com/1200x900/?flatbread,tea,table",
                badges: ["verified-host", "top-rated", "warm-welcome"],
                tags: ["🍯 Fresh boorsok", "☕ Tea & stories"],
                isLive: true,
                startTime: "Available now",
                location: { x: 30, y: 40 },
                createdAt: now,
                urgency: "Frying fresh now"
            },
            {
                id: "offer_demo_2",
                title: "Beshbarmak & Meat Cooking 🔥",
                price: 1400,
                spots: 4,
                category: "Eat Like a Local 🍽️",
                hostName: "Nurgul",
                hostImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&q=80",
                rating: 4.8,
                distance: "480m away",
                image: "https://source.unsplash.com/1200x900/?meat,cooking,kitchen",
                badges: ["verified-host", "popular-experience"],
                tags: ["🥩 Family-style meal", "🔥 Traditional cooking"],
                isLive: false,
                startTime: "Starting in 20 min",
                location: { x: 58, y: 44 },
                createdAt: now,
                urgency: "Dinner prep starts soon"
            },
            {
                id: "offer_demo_3",
                title: "Milking a Cow & Donkey Ride 🐄🐴",
                price: 1300,
                spots: 3,
                category: "Nomad Life 🏔️",
                hostName: "Ulan",
                hostImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
                rating: 4.8,
                distance: "1.1km away",
                image: "https://source.unsplash.com/1200x900/?rural,farm,horse",
                badges: ["fast-responder", "warm-welcome"],
                tags: ["🥛 Farm morning", "🏇 Nomad village"],
                isLive: true,
                startTime: "Leaving now",
                location: { x: 70, y: 78 },
                createdAt: now,
                urgency: "Leaving now"
            },
            {
                id: "offer_demo_4",
                title: "Felt & Embroidery Workshop 🧵🪡",
                price: 1100,
                spots: 6,
                category: "Culture & Craft 🎨",
                hostName: "Cholpon",
                hostImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
                rating: 4.9,
                distance: "390m away",
                image: "https://source.unsplash.com/1200x900/?felt,embroidery,craft",
                badges: ["verified-host", "warm-welcome"],
                tags: ["🧶 Shyrdak basics", "🪡 Hand stitching"],
                isLive: false,
                startTime: "Starting in 15 min",
                location: { x: 50, y: 52 },
                createdAt: now,
                urgency: "Workshop starts soon"
            },
            {
                id: "offer_demo_5",
                title: "Shower Access 🚿",
                price: 200,
                spots: 4,
                category: "Essentials 🧼",
                hostName: "Gulzat",
                hostImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
                rating: 4.8,
                distance: "180m away",
                image: "https://source.unsplash.com/1200x900/?bathroom,shower,clean",
                badges: ["verified-host", "fast-responder"],
                tags: ["🎒 Backpacker friendly", "🧼 Clean towels"],
                isLive: true,
                startTime: "Available now",
                location: { x: 42, y: 62 },
                createdAt: now,
                urgency: "Available now"
            },
            {
                id: "offer_demo_6",
                title: "Laundry Service 🧺",
                price: 300,
                spots: 5,
                category: "Essentials 🧼",
                hostName: "Mairam",
                hostImage: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=160&q=80",
                rating: 4.7,
                distance: "520m away",
                image: "https://source.unsplash.com/1200x900/?laundry,washing-machine,clothes",
                badges: ["fast-responder", "warm-welcome"],
                tags: ["🧺 Wash & dry", "⏱️ Same-day pickup"],
                isLive: false,
                startTime: "Ready in 30 min",
                location: { x: 76, y: 48 },
                createdAt: now,
                urgency: "Quick turnaround today"
            }
        ],
        bookings: [],
        requests: [],
        reviews: [
            { id: "rev_demo_1", offerId: "offer_demo_1", rating: 5, comment: "Warm tea, fresh boorsok, and a very welcoming host.", customerName: "Guest_2041", timestamp: new Date(Date.now() - 86400000).toISOString() },
            { id: "rev_demo_2", offerId: "offer_demo_4", rating: 5, comment: "Beautiful explanation of felt patterns and family traditions.", customerName: "Guest_5512", timestamp: new Date(Date.now() - 40000000).toISOString() },
            { id: "rev_demo_3", offerId: "offer_demo_3", rating: 4, comment: "Super memorable and felt very local, not touristy.", customerName: "Guest_9912", timestamp: new Date(Date.now() - 20000000).toISOString() }
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
        } else {
            existingDemo.spots = demos[d].spots;
            existingDemo.price = demos[d].price;
            existingDemo.title = demos[d].title;
            existingDemo.category = demos[d].category;
            existingDemo.image = demos[d].image;
            existingDemo.hostName = demos[d].hostName;
            existingDemo.hostImage = demos[d].hostImage;
            existingDemo.rating = demos[d].rating;
            existingDemo.distance = demos[d].distance;
            existingDemo.badges = demos[d].badges;
            existingDemo.tags = demos[d].tags;
            existingDemo.isLive = demos[d].isLive;
            existingDemo.startTime = demos[d].startTime;
            existingDemo.location = demos[d].location;
            existingDemo.urgency = demos[d].urgency;
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

function getCategoryCoverImage(category) {
    if (category === "Eat Like a Local 🍽️") return "https://source.unsplash.com/1200x900/?kyrgyz,food";
    if (category === "Nomad Life 🏔️") return "https://source.unsplash.com/1200x900/?horse,rural,mountains";
    if (category === "Culture & Craft 🎨") return "https://source.unsplash.com/1200x900/?felt,craft,textile";
    if (category === "Essentials 🧼") return "https://source.unsplash.com/1200x900/?laundry,bathroom,clean";
    return "https://source.unsplash.com/1200x900/?kyrgyzstan,travel";
}

function enrichOfferForDemo(offer, index) {
    var hostDefaults = getHostDefaults(offer.hostName, index);

    if (!offer.hostName) offer.hostName = hostDefaults.hostName;
    if (!offer.hostImage) offer.hostImage = hostDefaults.hostImage;
    if (!offer.rating) offer.rating = hostDefaults.rating;
    if (!offer.distance) offer.distance = hostDefaults.distance;
    if (!offer.badges || !offer.badges.length) offer.badges = hostDefaults.badges;
    if (!offer.tags || !offer.tags.length) offer.tags = hostDefaults.tags;
    if (!offer.image) offer.image = getCategoryCoverImage(offer.category);
    if (offer.isLive === undefined) offer.isLive = hostDefaults.isLive;
    if (!offer.startTime) offer.startTime = offer.isLive ? "Available now" : (offer.urgency || "Starting soon");

    return offer;
}

function getHostDefaults(hostName, index) {
    var defaults = {
        Aisuluu: {
            hostName: "Aisuluu",
            hostImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=160&q=80",
            rating: 4.9,
            distance: "220m away",
            badges: ["verified-host", "top-rated", "warm-welcome"],
            tags: ["🍞 Boorsok host", "☕ Tea & stories"],
            isLive: true
        },
        Nurgul: {
            hostName: "Nurgul",
            hostImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&q=80",
            rating: 4.8,
            distance: "480m away",
            badges: ["verified-host", "popular-experience"],
            tags: ["🥩 Family recipes", "🔥 Slow cooking"],
            isLive: false
        },
        Ulan: {
            hostName: "Ulan",
            hostImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
            rating: 4.8,
            distance: "1.1km away",
            badges: ["fast-responder", "warm-welcome"],
            tags: ["🐄 Farm morning", "🏔️ Nomad stories"],
            isLive: true
        },
        Cholpon: {
            hostName: "Cholpon",
            hostImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
            rating: 4.9,
            distance: "390m away",
            badges: ["verified-host", "warm-welcome"],
            tags: ["🧵 Felt craft", "🪡 Embroidery"],
            isLive: false
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
            distance: "520m away",
            badges: ["fast-responder", "warm-welcome"],
            tags: ["🧺 Wash & dry", "⏱️ Same-day pickup"],
            isLive: false
        }
    };

    if (defaults[hostName]) return defaults[hostName];

    return {
        hostName: hostName || "Aisuluu",
        hostImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=160&q=80",
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
        context.hostName = "Aisuluu";
        context.hostImage = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=160&q=80";
        context.rating = 4.9;
        context.distance = "220m away";
        context.badges = ["verified-host", "top-rated", "warm-welcome"];
        context.tags = ["🤝 Local host", "☕ Warm welcome"];
        context.isLive = true;
        context.startTime = "Available now";
        context.image = getCategoryCoverImage(context.category);
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
            image: context.image,
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
        
        var bookingCount = 0;
        for (var k = 0; k < newState.bookings.length; k++) {
            if (newState.bookings[k].offerId === context.offerId) bookingCount++;
        }

        if (targetOffer && bookingCount < targetOffer.spots) {
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
