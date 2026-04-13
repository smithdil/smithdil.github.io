var SCORES_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
var STANDINGS_URL = "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings";
var TEAMS_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";

function loadScores() {
    var container = document.getElementById("scores-container");
 
    
    fetch(SCORES_URL)
        .then(function (response) {
            return response.json(); 
        })
        .then(function (data) {
            var games = data.events; 
            container.innerHTML = "";
 
           
            if (!games || games.length === 0) {
                container.innerHTML = '<p class="no-games-msg">No games scheduled for today. Check back tomorrow!</p>';
                return;
            }
 
            
            for (var i = 0; i < games.length; i++) {
                var game = games[i];
                var competition = game.competitions[0];
 
                // Get team info (away = index 1, home = index 0 in ESPN data)
                var homeTeam = competition.competitors[0];
                var awayTeam = competition.competitors[1];
 
                // Get the game status
                var statusText = competition.status.type.shortDetail;
                var isLive = competition.status.type.state === "in";
 
                // Build the HTML for this score card
                var cardHTML = "";
                cardHTML += '<div class="score-card">';
                cardHTML += '  <div class="teams">';
 
                // Away team
                cardHTML += '    <div class="team">';
                cardHTML += '      <img src="' + awayTeam.team.logo + '" alt="' + awayTeam.team.displayName + ' logo">';
                cardHTML += '      <span class="team-name">' + awayTeam.team.abbreviation + '</span>';
                cardHTML += '    </div>';
 
                // VS or @
                cardHTML += '    <span class="vs">@</span>';
 
                // Home team
                cardHTML += '    <div class="team">';
                cardHTML += '      <img src="' + homeTeam.team.logo + '" alt="' + homeTeam.team.displayName + ' logo">';
                cardHTML += '      <span class="team-name">' + homeTeam.team.abbreviation + '</span>';
                cardHTML += '    </div>';
 
                cardHTML += '  </div>'; // end .teams
 
                // Score
                cardHTML += '  <div class="score">' + awayTeam.score + " - " + homeTeam.score + '</div>';
 
                // Status (add "live" class if game is in progress)
                if (isLive) {
                    cardHTML += '  <div class="status live">' + statusText + '</div>';
                } else {
                    cardHTML += '  <div class="status">' + statusText + '</div>';
                }
 
                cardHTML += '</div>'; // end .score-card
 
                // Add the card to the container
                container.innerHTML += cardHTML;
            }
        })
        .catch(function (error) {
            // If something goes wrong, show an error message
            console.log("Error loading scores:", error);
            container.innerHTML = '<p class="loading-msg">Unable to load scores. Please try again later.</p>';
        });
}
 
 
// ============================================
// 2. FETCH AND DISPLAY STANDINGS (TOP 5)
// ============================================
function loadStandings() {
    var eastBody = document.getElementById("east-standings");
    var westBody = document.getElementById("west-standings");
 
    fetch(STANDINGS_URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // ESPN returns standings grouped by conference
            var conferences = data.children;
 
            // Loop through each conference
            for (var c = 0; c < conferences.length; c++) {
                var conference = conferences[c];
                var confName = conference.name; // "Eastern Conference" or "Western Conference"
                var teams = conference.standings.entries;
 
                // Sort teams by wins (descending)
                teams.sort(function (a, b) {
                    var winsA = 0;
                    var winsB = 0;
 
                    // Find the "wins" stat in each team's stats array
                    for (var s = 0; s < a.stats.length; s++) {
                        if (a.stats[s].name === "wins") {
                            winsA = a.stats[s].value;
                        }
                    }
                    for (var s = 0; s < b.stats.length; s++) {
                        if (b.stats[s].name === "wins") {
                            winsB = b.stats[s].value;
                        }
                    }
 
                    return winsB - winsA; // Sort highest wins first
                });
 
                // Build table rows for the top 5 teams
                var rowsHTML = "";
                var limit = 5;
                if (teams.length < 5) {
                    limit = teams.length;
                }
 
                for (var i = 0; i < limit; i++) {
                    var team = teams[i];
                    var teamName = team.team.displayName;
                    var wins = 0;
                    var losses = 0;
 
                    // Find wins and losses in the stats array
                    for (var s = 0; s < team.stats.length; s++) {
                        if (team.stats[s].name === "wins") {
                            wins = team.stats[s].value;
                        }
                        if (team.stats[s].name === "losses") {
                            losses = team.stats[s].value;
                        }
                    }
 
                    rowsHTML += "<tr>";
                    rowsHTML += "<td>" + (i + 1) + "</td>";
                    rowsHTML += "<td>" + teamName + "</td>";
                    rowsHTML += "<td>" + wins + "</td>";
                    rowsHTML += "<td>" + losses + "</td>";
                    rowsHTML += "</tr>";
                }
 
                // Put the rows in the correct table
                if (confName === "Eastern Conference") {
                    eastBody.innerHTML = rowsHTML;
                } else {
                    westBody.innerHTML = rowsHTML;
                }
            }
        })
        .catch(function (error) {
            console.log("Error loading standings:", error);
            eastBody.innerHTML = '<tr><td colspan="4">Unable to load standings.</td></tr>';
            westBody.innerHTML = '<tr><td colspan="4">Unable to load standings.</td></tr>';
        });
}
 
 
// ============================================
// 3. POPULATE TEAM DROPDOWN IN THE FORM
// ============================================
function loadTeams() {
    var dropdown = document.getElementById("fav-team");
 
    fetch(TEAMS_URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var teams = data.sports[0].leagues[0].teams;
 
            // Sort teams alphabetically by display name
            teams.sort(function (a, b) {
                if (a.team.displayName < b.team.displayName) return -1;
                if (a.team.displayName > b.team.displayName) return 1;
                return 0;
            });
 
            // Create an <option> for each team
            for (var i = 0; i < teams.length; i++) {
                var option = document.createElement("option");
                option.value = teams[i].team.displayName;
                option.textContent = teams[i].team.displayName;
                dropdown.appendChild(option);
            }
        })
        .catch(function (error) {
            console.log("Error loading teams:", error);
        });
}
 
 
// ============================================
// 4. FORM PROCESSING
// ============================================
function setupForm() {
    var form = document.getElementById("signup-form");
    var messageDiv = document.getElementById("form-message");
 
    // Only set up the form if it exists on this page
    if (!form) return;
 
    form.addEventListener("submit", function (event) {
        // Prevent the form from reloading the page
        event.preventDefault();
 
        // Get form values
        var name = document.getElementById("user-name").value.trim();
        var email = document.getElementById("user-email").value.trim();
        var team = document.getElementById("fav-team").value;
 
        // Simple validation
        if (name === "" || email === "") {
            messageDiv.textContent = "Please fill in your name and email.";
            messageDiv.className = "form-message error";
            return;
        }
 
        var msg = "Thanks, " + name + "! You're signed up.";
        if (team !== "") {
            msg += " We'll send you " + team + " highlights!";
        }
        messageDiv.textContent = msg;
        messageDiv.className = "form-message success";
 
        form.reset();
    });
}
 
 
function setupHamburger() {
    var hamburger = document.getElementById("hamburger");
    var navMenu = document.getElementById("nav-menu");
 
    if (!hamburger) return;
 
    hamburger.addEventListener("click", function () {
        if (navMenu.classList.contains("open")) {
            navMenu.classList.remove("open");
        } else {
            navMenu.classList.add("open");
        }
    });
}
 
 

window.addEventListener("DOMContentLoaded", function () {
    loadScores();      
    loadStandings();   
    loadTeams();       
    setupForm();       
    setupHamburger();
});