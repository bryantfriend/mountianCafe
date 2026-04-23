// Meyman Interactive Onboarding

var HOST_CONDUCT_STEPS = [
    {
        scenario: "A tourist arrives 20 minutes late. What do you do?",
        answers: [
            { text: "Welcome them calmly and adjust the plan.", correct: true, explanation: "Great hosts protect safety and comfort first. Clear, kind communication builds trust." },
            { text: "Cancel immediately without checking in.", correct: false, explanation: "Guests may be navigating a new city. Start with a calm check-in." },
            { text: "Charge extra before saying hello.", correct: false, explanation: "Money surprises create stress. Explain policies clearly and respectfully." }
        ]
    },
    {
        scenario: "A guest seems unsure about a food ingredient.",
        answers: [
            { text: "Explain ingredients and offer an alternative.", correct: true, explanation: "This shows care for allergies, beliefs, and comfort." },
            { text: "Tell them everyone eats it here.", correct: false, explanation: "Cultural pride works best when guests still have choice." },
            { text: "Ignore it and keep serving.", correct: false, explanation: "Safety and consent matter in every experience." }
        ]
    },
    {
        scenario: "A tourist asks to take photos inside your home.",
        answers: [
            { text: "Set clear boundaries and suggest photo-friendly spots.", correct: true, explanation: "A trusted host protects privacy while still being welcoming." },
            { text: "Allow everything even if family objects.", correct: false, explanation: "Hospitality should include respect for everyone in the home." },
            { text: "Take their phone away.", correct: false, explanation: "Boundaries should be calm, clear, and respectful." }
        ]
    },
    {
        scenario: "A guest leaves a critical review.",
        answers: [
            { text: "Reply politely and improve what you can.", correct: true, explanation: "Public professionalism is one of the strongest trust signals." },
            { text: "Message them angrily.", correct: false, explanation: "Respectful conflict handling keeps the community safe." },
            { text: "Demand they delete it.", correct: false, explanation: "Feedback should be handled transparently and calmly." }
        ]
    }
];

var CULTURAL_GUIDE_SLIDES = [
    {
        title: "Greeting Etiquette",
        text: "Say Salam, smile, and greet elders first.",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80"
    },
    {
        title: "Food Culture",
        text: "Taste what you can. Compliment the table.",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80"
    },
    {
        title: "Home Etiquette",
        text: "Remove shoes when asked. Ask before photos.",
        image: "https://images.unsplash.com/photo-1569530593440-e48dc137f7d0?auto=format&fit=crop&w=900&q=80"
    }
];

var activeConductStep = 0;
var activeCultureSlide = 0;
var conductAnswered = false;

function openHostConduct() {
    activeConductStep = 0;
    conductAnswered = false;
    createOnboardingShell("host-conduct-overlay");
    renderHostConductStep();
}

function renderHostConductStep() {
    var overlay = document.getElementById("host-conduct-overlay");
    if (!overlay) return;

    if (activeConductStep >= HOST_CONDUCT_STEPS.length) {
        overlay.innerHTML =
            '<div class="onboarding-panel completion-panel">' +
                '<button class="onboarding-close" onclick="closeOnboarding(\'host-conduct-overlay\')">✕</button>' +
                '<div class="completion-icon">✅</div>' +
                '<h1>You are now a Verified Host</h1>' +
                '<p>Your profile now shows guests that you understand safety, respect, and Kyrgyz hospitality.</p>' +
                '<button class="btn btn-primary" onclick="finishHostConduct()">Show My Badge</button>' +
            '</div>';
        return;
    }

    var step = HOST_CONDUCT_STEPS[activeConductStep];
    var progress = Math.round((activeConductStep / HOST_CONDUCT_STEPS.length) * 100);
    var answerHtml = "";

    for (var i = 0; i < step.answers.length; i++) {
        answerHtml += '<button class="onboarding-answer" onclick="selectConductAnswer(' + i + ')">' + step.answers[i].text + '</button>';
    }

    overlay.innerHTML =
        '<div class="onboarding-panel">' +
            '<button class="onboarding-close" onclick="closeOnboarding(\'host-conduct-overlay\')">✕</button>' +
            '<div class="onboarding-progress"><span style="width:' + progress + '%"></span></div>' +
            '<div class="onboarding-kicker">Host Code of Conduct</div>' +
            '<h1>' + step.scenario + '</h1>' +
            '<div class="onboarding-answers">' + answerHtml + '</div>' +
            '<div class="onboarding-feedback" id="conduct-feedback"></div>' +
        '</div>';
}

function selectConductAnswer(answerIndex) {
    if (conductAnswered) return;

    var step = HOST_CONDUCT_STEPS[activeConductStep];
    var selected = step.answers[answerIndex];
    var feedback = document.getElementById("conduct-feedback");
    var answerButtons = document.querySelectorAll(".onboarding-answer");

    conductAnswered = true;
    for (var i = 0; i < answerButtons.length; i++) {
        answerButtons[i].disabled = true;
        if (i === answerIndex) answerButtons[i].classList.add(selected.correct ? "correct" : "incorrect");
    }

    feedback.className = "onboarding-feedback visible " + (selected.correct ? "correct" : "incorrect");
    feedback.innerHTML =
        '<strong>' + (selected.correct ? "✅ Correct" : "❌ Try this instead") + '</strong>' +
        '<p>' + selected.explanation + '</p>' +
        '<button class="btn btn-primary" onclick="nextConductStep()">Continue</button>';
}

function nextConductStep() {
    activeConductStep += 1;
    conductAnswered = false;
    renderHostConductStep();
}

function finishHostConduct() {
    closeOnboarding("host-conduct-overlay");
    unlockBadge("verified-host");
}

function openCulturalGuide() {
    activeCultureSlide = 0;
    createOnboardingShell("cultural-guide-overlay");
    renderCulturalGuideSlide();
}

function renderCulturalGuideSlide() {
    var overlay = document.getElementById("cultural-guide-overlay");
    if (!overlay) return;

    if (activeCultureSlide >= CULTURAL_GUIDE_SLIDES.length) {
        overlay.innerHTML =
            '<div class="culture-slide culture-complete">' +
                '<button class="onboarding-close light" onclick="closeOnboarding(\'cultural-guide-overlay\')">✕</button>' +
                '<div class="completion-icon">🌍</div>' +
                '<h1>You are now a Respectful Traveler</h1>' +
                '<p>Your profile now shows hosts that you travel with care.</p>' +
                '<button class="btn btn-primary" onclick="finishCulturalGuide()">Show My Badge</button>' +
            '</div>';
        return;
    }

    var slide = CULTURAL_GUIDE_SLIDES[activeCultureSlide];
    var progress = Math.round((activeCultureSlide / CULTURAL_GUIDE_SLIDES.length) * 100);
    overlay.innerHTML =
        '<button class="onboarding-close light" onclick="closeOnboarding(\'cultural-guide-overlay\')">✕</button>' +
        '<div class="culture-slide" style="background-image:url(\'' + slide.image + '\')" onclick="nextCulturalSlide()">' +
            '<div class="culture-overlay">' +
                '<div class="onboarding-progress light"><span style="width:' + progress + '%"></span></div>' +
                '<div class="onboarding-kicker">Cultural Guide</div>' +
                '<h1>' + slide.title + '</h1>' +
                '<p>' + slide.text + '</p>' +
                '<div class="tap-next">Tap anywhere to continue</div>' +
            '</div>' +
        '</div>';
}

function nextCulturalSlide() {
    activeCultureSlide += 1;
    renderCulturalGuideSlide();
}

function finishCulturalGuide() {
    closeOnboarding("cultural-guide-overlay");
    unlockBadge("respectful-traveler");
}

function createOnboardingShell(id) {
    var existing = document.getElementById(id);
    if (existing) existing.remove();

    var overlay = document.createElement("div");
    overlay.id = id;
    overlay.className = "onboarding-overlay";
    document.querySelector(".container").appendChild(overlay);

    setTimeout(function() {
        overlay.classList.add("visible");
    }, 20);
}

function closeOnboarding(id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;

    overlay.classList.remove("visible");
    setTimeout(function() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 220);
}
