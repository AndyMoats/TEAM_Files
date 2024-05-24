//google login process variables
let signInButton, logoutButton, commentInput, saveCommentButton;
let userName = "";


// Variables to manage button positions and sizes dynamically -- adapted from AJ's original buttons
let buttonX1, buttonX2, buttonX3, buttonY, buttonW, buttonH;

// Variables for dynamic layout in the favorite teams display -- adapted from Andy's original buttons
let favButtonStartY = 175;  // Initial vertical position of the first favorite button
let favButtonSpacing = 40;  // Vertical spacing between buttons
let favButtonHeight = 30;  // Height of each button
let favButtonWidth;  // Will be set based on window width


//Andy's code
let teams = ["Badminton","Baseball","Basketball","Cross Country","Field Hockey", "Lacrosse", "Soccer","Softball","Swimming", "Tennis", "Track and Field","Volleyball", "Water Polo"];
let favorites = new Array(teams.length).fill(false);

//Charlotte's code
let eventData;
let games;

//new thing to help manage screens or app states
let displayState = 'welcome';  // Possible states: 'welcome', 'gameSchedule', 'popularGames', 'favoriteTeams'



function preload() {
    eventData = loadJSON('athletics.json', function () {
        console.log('Data loaded successfully:', eventData);
    }, function (error) {
        console.error('Failed to load data:', error);
    });
}


function setup() {

    //____________layout elements section ______________________
    createCanvas(windowWidth, windowHeight);

    // Initialize the "Sign in with Google" button
    signInButton = createButton('Sign In with Google');
    signInButton.position(20, 20);
    signInButton.mousePressed(signInWithGoogle);

    // Initialize the logout button but hide it initially
    logoutButton = createButton('Logout');
    logoutButton.position(windowWidth - 120, 20); // Upper right corner
    logoutButton.mousePressed(signOut);
    logoutButton.hide();


    // Adjust UI elements if the window is resized
    updateButtonLayout();  // Call this function to initialize button positions and sizes
    windowResized();

//_______________end layout elements section_________

//______________begin data scrape by charlotte_________________
    games = eventData.games;

    // Ensure eventData is loaded and has the 'games' array
    if (eventData && eventData.games) {
        eventData.games.forEach(game => {
            const summary = game.SUMMARY;
            const dstart = game.DTSTART;
            const location = game.LOCATION;
        });
    }

 //____________________end data scrape by Charlotte_____________________________
 
 //__________________begin google login section by Zainab & Ms. Brooks_________________

   // Authentication state observer
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            signInButton.hide();
            logoutButton.show();
            userName = user.displayName || "User";
            fetchFavoriteTeams();  // Fetch the favorite teams right after login
        } else {
            signInButton.show();
            logoutButton.hide();
            userName = "";
        }
    });
//_______________end google login section_______________________________

}

function draw() {
    background(220);

    // Show welcome message near logout button if user is signed in
    if (userName) {
        displayHeader();
        
        fill(0);
        textSize(16); // Smaller text size
        textAlign(RIGHT, TOP);
        text(`Welcome ${userName}`, windowWidth - 130, 15);

       
        // Check the display state and update the canvas accordingly
        switch (displayState) {
            case 'gameSchedule':
                displayUpcomingGames();  // Assumes this function displays the games
                break;
            case 'popularGames':
                // Future functionality to display popular games
                break;
            case 'favoriteTeams':
                displayFavoriteTeams(); // This now handles displaying favorite teams 
                break;               
            default:
                displayWelcomeMessage();
                break;
        }
    }
}

function displayHeader() {
    // Display buttons on the header
    drawButton('Game Schedule', buttonX1, buttonY+20);
    drawButton('Popular Games', buttonX2, buttonY+20);
    drawButton('Favorite Teams', buttonX3, buttonY+20);

    // Modern settings button with three lines (hamburger menu icon)
    drawSettingsButton(width - 40, 15);  // Draw the settings icon at the top right
}

function displayWelcomeMessage() {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Welcome to the Sports App!", width / 2, height / 2);
}

//andy

function displayFavoriteTeams() {
    textAlign(CENTER, CENTER);
    textSize(20);
    for (let i = 0; i < teams.length; i++) {
        let yPosition = favButtonStartY + i * favButtonSpacing;

        // Display favorite button
        fill(200);
        rect(10, yPosition - 15, favButtonWidth, favButtonHeight);

        // Display team name and favorite status
        fill(0);
        text(teams[i], width / 2, yPosition);

        fill(favorites[i] ? 255 : 0, 0, 0);
        text(favorites[i] ? "★" : "☆", 20, yPosition);
    }
}

function saveFavoriteTeams() {
    // Ensure username is not empty and is a valid Firebase key
    if (!userName || userName.includes('.') || userName.includes('#') || userName.includes('$') || userName.includes('[') || userName.includes(']')) {
        console.error("Invalid username for Firebase key");
        return;
    }

    const favoriteTeamsData = {};
    teams.forEach((team, index) => {
        favoriteTeamsData[team] = favorites[index];  // Store boolean of favorite status
    });

    // Save the favorite teams to Firebase using username
    firebase.database().ref('favoriteTeams/' + userName).set(favoriteTeamsData)
        .then(() => {
            console.log("Favorite teams saved successfully under username.");
        }).catch((error) => {
            console.error("Error saving favorite teams with username:", error.message);
        });
}

function fetchFavoriteTeams() {
    if (!userName) {
        console.error("Username not set. Cannot fetch favorite teams.");
        return;
    }

    const userFavoritesRef = firebase.database().ref('favoriteTeams/' + userName);
    userFavoritesRef.once('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            teams.forEach((team, index) => {
                if (data.hasOwnProperty(team)) {
                    favorites[index] = data[team];
                } else {
                    favorites[index] = false; // Default to false if not specified
                }
            });
        }
        console.log("Favorite teams loaded:", favorites);
    }).catch((error) => {
        console.error("Error fetching favorite teams:", error.message);
    });
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


//AJ Code

function drawButton(label, x, y) {
    fill(255, 235, 59); // Yellow background for buttons
    rect(x - buttonW / 2, buttonY, buttonW, buttonH, 5); // Centered button with dynamic width
    fill(0); // Black text for contrast
    textSize(16);
    textAlign(CENTER, CENTER);
    text(label, x, y);
}

function updateButtonLayout() {
    buttonW = windowWidth / 4;
    buttonH = 40;
    buttonX1 = windowWidth / 6;
    buttonX2 = windowWidth / 2;
    buttonX3 = 5 * windowWidth / 6;
    buttonY = 75;

    favButtonWidth = windowWidth - 20;  // Set favorite buttons' width based on window width
}




function drawSettingsButton(x, y) {
    const barHeight = 3;
    const barSpacing = 5;
    fill(0); // Black color for the icon
    for (let i = 0; i < 3; i++) {
        rect(x, y + i * barSpacing, 20, barHeight);
    }
}
//Charlotte
function displayUpcomingGames() {
    textAlign(LEFT, TOP);
    fill(0);
    textSize(20);
    text('Upcoming Games:', 10, 170);

    textSize(14);
    let yPos = 200;
    if (eventData && eventData.games) {
        eventData.games.slice(0, 5).forEach(game => {
            let summary = game.team + ' vs ' + game.opponent;  // Adjust according to your JSON structure
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
}


function mousePressed() {
    console.log("Mouse X: " + mouseX + ", Mouse Y: " + mouseY);

    // Check for navigation button presses
    if (mouseY >= buttonY && mouseY <= buttonY + buttonH) {
        if (mouseX > buttonX1 - buttonW / 2 && mouseX < buttonX1 + buttonW / 2) {
            displayState = 'gameSchedule';
        } else if (mouseX > buttonX2 - buttonW / 2 && mouseX < buttonX2 + buttonW / 2) {
            displayState = 'popularGames';
        } else if (mouseX > buttonX3 - buttonW / 2 && mouseX < buttonX3 + buttonW / 2) {
            displayState = 'favoriteTeams';
        }
    } else if (displayState === 'favoriteTeams') {
        for (let i = 0; i < teams.length; i++) {
            let favbuttonX = 10;  // X position of the star
            let favbuttonY = favButtonStartY + i * favButtonSpacing - 15;  // Y position of the star
            let buttonHeight = 30;  // Height of the clickable area for the star

            // Check if click is within the star's area
            if (mouseX >= favbuttonX && mouseX <= favbuttonX + favButtonWidth && mouseY >= favbuttonY && mouseY <= favbuttonY + buttonHeight) {
                favorites[i] = !favorites[i];  // Toggle favorite status
               // saveFavoriteTeams();  // Call the function to save updated favorites to Firebase
                console.log("Toggled favorite for " + teams[i] + ": " + favorites[i]);
                break;  // Exit the loop once the click is handled
            }
        }
    }
}