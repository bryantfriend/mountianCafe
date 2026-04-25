// Meiman Profile Badge Display

function renderBadgeGrid(options) {
    var opts = options || {};
    var group = opts.group || "all";
    var badges = loadBadges();
    var html = '<section class="profile-badges-section"><h3>🏅 Your Badges</h3><div class="profile-badge-grid">';

    for (var i = 0; i < badges.length; i++) {
        var badge = badges[i];
        if (group !== "all" && badge.group !== group && badge.group !== "culture") continue;

        var stateClass = badge.unlocked ? "badge-unlocked" : "badge-locked";
        var stateText = badge.unlocked ? badge.description : "🔒 " + badge.requirement;

        html +=
            '<article class="badge ' + stateClass + '">' +
                '<div class="badge-icon">' + badge.icon + '</div>' +
                '<div class="badge-name">' + badge.name + '</div>' +
                '<p>' + stateText + '</p>' +
            '</article>';
    }

    html += '</div></section>';
    return html;
}

function refreshProfileBadges() {
    var containers = document.querySelectorAll("[data-profile-badges]");
    for (var i = 0; i < containers.length; i++) {
        var group = containers[i].getAttribute("data-profile-badges") || "all";
        containers[i].innerHTML = renderBadgeGrid({ group: group });
    }
}
