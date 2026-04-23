// Meyman Badge System

var BADGE_STORAGE_KEY = "meyman_badges_v1";

var BADGE_DEFINITIONS = [
    {
        id: "verified-host",
        name: "Verified Host",
        icon: "✅",
        description: "Completed the host Code of Conduct.",
        requirement: "Finish host onboarding",
        group: "host",
        unlocked: false
    },
    {
        id: "top-rated",
        name: "Top Rated",
        icon: "⭐",
        description: "Loved by travelers for consistently great experiences.",
        requirement: "Keep a 4.8+ rating",
        group: "host",
        unlocked: true
    },
    {
        id: "fast-responder",
        name: "Fast Responder",
        icon: "⚡",
        description: "Replies quickly when guests need help.",
        requirement: "Reply within 10 minutes",
        group: "host",
        unlocked: true
    },
    {
        id: "popular-experience",
        name: "Popular Experience",
        icon: "🔥",
        description: "Hosts experiences that fill up quickly.",
        requirement: "Get 10 bookings",
        group: "host",
        unlocked: false
    },
    {
        id: "warm-welcome",
        name: "Warm Welcome",
        icon: "🤝",
        description: "Makes guests feel safe, comfortable, and included.",
        requirement: "Earn 5 warm reviews",
        group: "host",
        unlocked: true
    },
    {
        id: "respectful-traveler",
        name: "Respectful Traveler",
        icon: "🌍",
        description: "Completed the cultural guide.",
        requirement: "Finish cultural guide",
        group: "tourist",
        unlocked: false
    },
    {
        id: "food-explorer",
        name: "Food Explorer",
        icon: "🍽️",
        description: "Tries local meals with curiosity and gratitude.",
        requirement: "Book 2 food experiences",
        group: "tourist",
        unlocked: true
    },
    {
        id: "adventurer",
        name: "Adventurer",
        icon: "🏔️",
        description: "Explores nature and outdoor traditions.",
        requirement: "Join an outdoor experience",
        group: "tourist",
        unlocked: false
    },
    {
        id: "friendly-guest",
        name: "Friendly Guest",
        icon: "😊",
        description: "Leaves kind reviews and clear messages.",
        requirement: "Leave 3 reviews",
        group: "tourist",
        unlocked: true
    },
    {
        id: "supporter",
        name: "Supporter",
        icon: "❤️",
        description: "Supports local hosts and community experiences.",
        requirement: "Book 5 local experiences",
        group: "tourist",
        unlocked: false
    },
    {
        id: "nomad-spirit",
        name: "Nomad Spirit",
        icon: "🐎",
        description: "Carries the open-road energy of Kyrgyz hospitality.",
        requirement: "Visit 3 regions",
        group: "culture",
        unlocked: true
    },
    {
        id: "tea-lover",
        name: "Tea Lover",
        icon: "☕",
        description: "Never rushes a shared cup of tea.",
        requirement: "Attend 2 tea experiences",
        group: "culture",
        unlocked: false
    },
    {
        id: "manti-master",
        name: "Manti Master",
        icon: "🥟",
        description: "Learns the art of Kyrgyz comfort food.",
        requirement: "Join a cooking class",
        group: "culture",
        unlocked: false
    },
    {
        id: "toy-guest",
        name: "Toy Guest",
        icon: "🎉",
        description: "Celebrates respectfully at local gatherings.",
        requirement: "Attend a community event",
        group: "culture",
        unlocked: false
    },
    {
        id: "road-tripper",
        name: "Road Tripper",
        icon: "🚗",
        description: "Explores beyond the city with trusted locals.",
        requirement: "Book a transport experience",
        group: "culture",
        unlocked: true
    }
];

function cloneBadge(badge) {
    return JSON.parse(JSON.stringify(badge));
}

function getDefaultBadges() {
    var badges = [];
    for (var i = 0; i < BADGE_DEFINITIONS.length; i++) {
        badges.push(cloneBadge(BADGE_DEFINITIONS[i]));
    }
    return badges;
}

function loadBadges() {
    var stored = localStorage.getItem(BADGE_STORAGE_KEY);
    var savedById = {};

    if (stored) {
        try {
            var saved = JSON.parse(stored);
            for (var s = 0; s < saved.length; s++) {
                savedById[saved[s].id] = saved[s];
            }
        } catch (error) {
            console.warn("Failed to parse badge storage", error);
        }
    }

    var merged = [];
    for (var i = 0; i < BADGE_DEFINITIONS.length; i++) {
        var badge = cloneBadge(BADGE_DEFINITIONS[i]);
        if (savedById[badge.id]) {
            badge.unlocked = !!savedById[badge.id].unlocked;
        }
        merged.push(badge);
    }

    return merged;
}

function saveBadges(badges) {
    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(badges));
}

function getBadgeById(badgeId) {
    var badges = loadBadges();
    for (var i = 0; i < badges.length; i++) {
        if (badges[i].id === badgeId) return badges[i];
    }
    return null;
}

function unlockBadge(badgeId) {
    var badges = loadBadges();
    var unlockedBadge = null;

    for (var i = 0; i < badges.length; i++) {
        if (badges[i].id === badgeId) {
            if (badges[i].unlocked) return badges[i];
            badges[i].unlocked = true;
            unlockedBadge = badges[i];
            break;
        }
    }

    if (unlockedBadge) {
        saveBadges(badges);
        showBadgeUnlock(unlockedBadge);
        refreshProfileBadges();
        refreshBadgeSurfaces();
    }

    return unlockedBadge;
}

function refreshBadgeSurfaces() {
    if (typeof renderMapAndFeed === "function") renderMapAndFeed();
    if (typeof renderExploreFeed === "function") {
        var exploreView = document.getElementById("view-explore");
        if (exploreView && !exploreView.classList.contains("hidden")) renderExploreFeed();
    }
    if (typeof refreshDashboard === "function") refreshDashboard();
}

function getHostTrustBadges(hostName) {
    var base = ["verified-host", "top-rated"];
    if (hostName === "Aigul") base = ["verified-host", "top-rated", "warm-welcome"];
    if (hostName === "Beksultan") base = ["fast-responder", "popular-experience"];
    if (hostName === "Nazira") base = ["verified-host", "warm-welcome"];
    if (hostName === "Timur") base = ["fast-responder", "top-rated"];
    if (hostName === "Bakyt") base = ["fast-responder", "top-rated"];
    if (hostName === "Gulzat") base = ["verified-host", "fast-responder"];
    if (hostName === "Mairam") base = ["fast-responder", "warm-welcome"];
    if (hostName === "Azamat") base = ["fast-responder", "top-rated"];
    return base;
}

function renderBadgePills(badgeIds) {
    var html = "";
    for (var i = 0; i < badgeIds.length; i++) {
        var badge = getBadgeById(badgeIds[i]);
        if (!badge || !badge.unlocked) continue;
        html += '<span class="badge-pill">' + badge.icon + ' ' + badge.name + '</span>';
    }
    return html;
}

function showBadgeUnlock(badge) {
    var existing = document.getElementById("badge-unlock-modal");
    if (existing) existing.remove();

    var modal = document.createElement("div");
    modal.id = "badge-unlock-modal";
    modal.className = "badge-unlock-overlay";
    modal.innerHTML =
        '<div class="badge-confetti" aria-hidden="true">' +
            '<span></span><span></span><span></span><span></span><span></span>' +
        '</div>' +
        '<div class="badge-unlock-card">' +
            '<div class="badge-unlock-icon">' + badge.icon + '</div>' +
            '<div class="badge-unlock-kicker">🎉 Badge Unlocked!</div>' +
            '<h2>' + badge.name + '</h2>' +
            '<p>' + badge.description + '</p>' +
        '</div>';

    document.querySelector(".container").appendChild(modal);

    setTimeout(function() {
        modal.classList.add("visible");
    }, 20);

    setTimeout(function() {
        modal.classList.remove("visible");
        setTimeout(function() {
            if (modal.parentNode) modal.parentNode.removeChild(modal);
        }, 280);
    }, 2200);
}

if (!localStorage.getItem(BADGE_STORAGE_KEY)) {
    saveBadges(getDefaultBadges());
}
