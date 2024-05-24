// Google login process variables
let signInButton, logoutButton;
let userName = "";

// Variables to manage button positions and sizes dynamically
let buttonX1, buttonX2, buttonX3, buttonY, buttonW, buttonH;

// Variables for dynamic layout in the favorite teams display
let favButtonStartY = 175;
let favButtonSpacing = 40;
let favButtonHeight = 30;
let favButtonWidth;

// Andy's code
let teams = ["Basketball", "Lacrosse", "Soccer", "Tennis", "Track"];
let favorites = new Array(teams.length).fill(false);

// Charlotte's code
let eventData;
let games;

// New thing to help manage screens or app states
let displayState = 'welcome';

function preload() {
    eventData = loadJSON('athletics.json', 
        // Success callback
        function() {
            console.log('Data loaded successfully:', eventData);
        }, 
        // Error callback
        function(error) {
            console.error('Failed to load data:', error);
        }
    );
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    signInButton = createButton('Sign In with Google');
    signInButton.position(20, 20);
    signInButton.mousePressed(signInWithGoogle);

    logoutButton = createButton('Logout');
    logoutButton.position(windowWidth - 120, 20);
    logoutButton.mousePressed(signOut);
    logoutButton.hide();

    updateButtonLayout();
    windowResized();

    // Load user's favorite teams after authentication
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            signInButton.hide();
            logoutButton.show();
            userName = user.displayName || "User";
            fetchFavoriteTeams();
        } else {
            signInButton.show();
            logoutButton.hide();
            userName = "";
        }
    });
}

function draw() {
    background(220);

    if (userName) {
        displayHeader();
        fill(0);
        textSize(16);
        textAlign(RIGHT, TOP);
        text(`Welcome ${userName}`, windowWidth - 130, 15);

        switch (displayState) {
            case 'gameSchedule':
                displayUpcomingGames();
                break;
            case 'favoriteTeams':
                displayFavoriteTeams();
                break;
            default:
                displayWelcomeMessage();
                break;
        }
    }
}

function displayHeader() {
    drawButton('Game Schedule', buttonX1, buttonY);
    drawButton('Favorite Teams', buttonX3, buttonY);
    drawSettingsButton(windowWidth - 40, 15);
}

function displayWelcomeMessage() {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Welcome to the Sports App!", width / 2, height / 2);
}

function displayFavoriteTeams() {
    textAlign(CENTER, CENTER);
    textSize(20);
    for (let i = 0; i < teams.length; i++) {
        let yPosition = favButtonStartY + i * favButtonSpacing;
        fill(200);
        rect(10, yPosition - 15, favButtonWidth, favButtonHeight);
        fill(0);
        text(teams[i], width / 2, yPosition);
        fill(favorites[i] ? 255 : 0, 0, 0);
        text(favorites[i] ? "★" : "☆", 20, yPosition);
    }
}

function signInWithGoogle() {
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch((error) => {
        console.error("Error during sign-in:", error.message);
    });
}

function signOut() {
    firebase.auth().signOut().catch((error) => {
        console.error("Sign out error:", error.message);
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    logoutButton.position(windowWidth - 120, 20);
    updateButtonLayout();
}

function drawButton(label, x, y) {
    fill(255, 235, 59);
    rect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 5);
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(label, x, y);
}

function updateButtonLayout() {
    buttonW = windowWidth / 4;
    buttonH = 40;
    buttonX1 = windowWidth / 6;
    buttonX3 = 5 * windowWidth / 6;
    buttonY = 75;
    favButtonWidth = windowWidth - 20;
}

function drawSettingsButton(x, y) {
    const barHeight = 3;
    const barSpacing = 5;
    fill(0);
    for (let i = 0; i < 3; i++) {
        rect(x, y + i * barSpacing, 20, barHeight);
    }
}

function displayUpcomingGames() {
    textAlign(LEFT, TOP);
    fill(0);
    textSize(20);
    text('Upcoming Games:', 10, 170);
    textSize(14);
    let yPos = 200;
    if (eventData && eventData.games) {
        eventData.games.slice(0, 5).forEach(game => {
            let summary = game.team + ' vs ' + game.opponent;
            let dstart = formatDate(game.date);
            let location = game.location;
            text(`${summary} on ${dstart} at ${location}`, 10, yPos);
            yPos += 20;
        });
    } else {
        text("Loading data...", 10, yPos);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return "Unknown Date";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
}

function mousePressed() {
    if (mouseY >= buttonY && mouseY <= buttonY + buttonH) {
        if (mouseX > buttonX1 - buttonW / 2 && mouseX < buttonX1 + buttonW / 2) {
            displayState = 'gameSchedule';
        } else if (mouseX > buttonX3 - buttonW / 2 && mouseX < buttonX3 + buttonW / 2) {
            displayState = 'favoriteTeams';
        }
    } else if (displayState === 'favoriteTeams') {
        for (let i = 0; i < teams.length; i++) {
            let favbuttonX = 10;
            let favbuttonY = favButtonStartY + i * favButtonSpacing - 15;
            let buttonHeight = 30;
            if (mouseX >= favbuttonX && mouseX <= favbuttonX + favButtonWidth && mouseY >= favbuttonY && mouseY <= favbuttonY + buttonHeight) {
                favorites[i] = !favorites[i];
                console.log("Toggled favorite for " + teams[i] + ": " + favorites[i]);
                break;
            }
        }
    }
}
