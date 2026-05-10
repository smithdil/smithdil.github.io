// NBA Stats Hub
var SCORES_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
var STANDINGS_URL = "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings";
var TEAMS_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams";
var LEADERS_URL = "https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/leaders";

// Scores - home page
function loadScores() {
    var container = document.getElementById("scores-container");
    if (!container) return;
    fetch(SCORES_URL)
        .then(function (response) { return response.json(); })
        .then(function (data) {
            var games = data.events;
            container.innerHTML = "";
            if (!games || games.length === 0) {
                container.innerHTML = '<p class="no-games-msg">No games scheduled for today. Check back tomorrow!</p>';
                return;
            }
            for (var i = 0; i < games.length; i++) {
                var competition = games[i].competitions[0];
                var homeTeam = competition.competitors[0];
                var awayTeam = competition.competitors[1];
                var statusText = competition.status.type.shortDetail;
                var isLive = competition.status.type.state === "in";
                var cardHTML = '<div class="score-card">';
                cardHTML += '<div class="teams">';
                cardHTML += '<div class="team">';
                cardHTML += '<img src="' + awayTeam.team.logo + '" alt="' + awayTeam.team.displayName + ' logo">';
                cardHTML += '<span class="team-name">' + awayTeam.team.abbreviation + '</span>';
                cardHTML += '</div>';
                cardHTML += '<span class="vs">@</span>';
                cardHTML += '<div class="team">';
                cardHTML += '<img src="' + homeTeam.team.logo + '" alt="' + homeTeam.team.displayName + ' logo">';
                cardHTML += '<span class="team-name">' + homeTeam.team.abbreviation + '</span>';
                cardHTML += '</div>';
                cardHTML += '</div>';
                cardHTML += '<div class="score">' + awayTeam.score + " - " + homeTeam.score + '</div>';
                if (isLive) {
                    cardHTML += '<div class="status live">' + statusText + '</div>';
                } else {
                    cardHTML += '<div class="status">' + statusText + '</div>';
                }
                cardHTML += '</div>';
                container.innerHTML += cardHTML;
            }
        })
        .catch(function (error) {
            console.log("Error loading scores:", error);
            container.innerHTML = '<p class="loading-msg">Unable to load scores.</p>';
        });
}

// Top 5 standings - home page
function loadStandings() {
    var eastBody = document.getElementById("east-standings");
    var westBody = document.getElementById("west-standings");
    if (!eastBody || !westBody) return;
    fetch(STANDINGS_URL)
        .then(function (response) { return response.json(); })
        .then(function (data) {
            var conferences = data.children;
            for (var c = 0; c < conferences.length; c++) {
                var teams = conferences[c].standings.entries;
                var rowsHTML = "";
                var limit = 5;
                if (teams.length < 5) limit = teams.length;
                for (var i = 0; i < limit; i++) {
                    var team = teams[i];
                    var wins = 0;
                    var losses = 0;
                    for (var s = 0; s < team.stats.length; s++) {
                        if (team.stats[s].name === "wins") wins = team.stats[s].value;
                        if (team.stats[s].name === "losses") losses = team.stats[s].value;
                    }
                    rowsHTML += "<tr>";
                    rowsHTML += "<td>" + (i + 1) + "</td>";
                    rowsHTML += "<td>" + team.team.displayName + "</td>";
                    rowsHTML += "<td>" + wins + "</td>";
                    rowsHTML += "<td>" + losses + "</td>";
                    rowsHTML += "</tr>";
                }
                if (conferences[c].name === "Eastern Conference") {
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

// Full standings - standings page
function loadFullStandings() {
    var eastBody = document.getElementById("full-east-standings");
    var westBody = document.getElementById("full-west-standings");
    if (!eastBody || !westBody) return;
    fetch(STANDINGS_URL)
        .then(function (response) { return response.json(); })
        .then(function (data) {
            var conferences = data.children;
            for (var c = 0; c < conferences.length; c++) {
                var teams = conferences[c].standings.entries;
                var rowsHTML = "";
                for (var i = 0; i < teams.length; i++) {
                    var team = teams[i];
                    var wins = "-", losses = "-", winPct = "-", home = "-", away = "-", lastTen = "-", streak = "-";
                    for (var s = 0; s < team.stats.length; s++) {
                        var stat = team.stats[s];
                        if (stat.name === "wins") wins = stat.value;
                        if (stat.name === "losses") losses = stat.value;
                        if (stat.name === "winPercent") winPct = stat.displayValue;
                        if (stat.name === "home") home = stat.displayValue;
                        if (stat.name === "road") away = stat.displayValue;
                        if (stat.name === "lastTenGames") lastTen = stat.displayValue;
                        if (stat.name === "streak") streak = stat.displayValue;
                    }
                    rowsHTML += "<tr>";
                    rowsHTML += "<td>" + (i + 1) + "</td>";
                    rowsHTML += "<td>" + team.team.displayName + "</td>";
                    rowsHTML += "<td>" + wins + "</td>";
                    rowsHTML += "<td>" + losses + "</td>";
                    rowsHTML += "<td>" + winPct + "</td>";
                    rowsHTML += "<td>" + home + "</td>";
                    rowsHTML += "<td>" + away + "</td>";
                    rowsHTML += "<td>" + lastTen + "</td>";
                    rowsHTML += "<td>" + streak + "</td>";
                    rowsHTML += "</tr>";
                }
                if (conferences[c].name === "Eastern Conference") {
                    eastBody.innerHTML = rowsHTML;
                } else {
                    westBody.innerHTML = rowsHTML;
                }
            }
        })
        .catch(function (error) {
            console.log("Error loading full standings:", error);
            eastBody.innerHTML = '<tr><td colspan="9">Unable to load standings.</td></tr>';
            westBody.innerHTML = '<tr><td colspan="9">Unable to load standings.</td></tr>';
        });
}

// League leaders - player page
function loadLeagueLeaders() {
    var ptsBody = document.getElementById("leaders-pts");
    var rebBody = document.getElementById("leaders-reb");
    var astBody = document.getElementById("leaders-ast");
    if (!ptsBody || !rebBody || !astBody) return;
    fetch(LEADERS_URL)
        .then(function (response) { return response.json(); })
        .then(function (data) {
            var categories = data.leaders;
            for (var c = 0; c < categories.length; c++) {
                var cat = categories[c];
                var targetBody = null;
                if (cat.name === "avgPoints") targetBody = ptsBody;
                if (cat.name === "avgRebounds") targetBody = rebBody;
                if (cat.name === "avgAssists") targetBody = astBody;
                if (targetBody === null) continue;
                var rows = "";
                var limit = 5;
                if (cat.leaders.length < 5) limit = cat.leaders.length;
                for (var i = 0; i < limit; i++) {
                    var leader = cat.leaders[i];
                    var teamAbbr = "-";
                    if (leader.team) teamAbbr = leader.team.abbreviation;
                    rows += "<tr>";
                    rows += "<td>" + (i + 1) + "</td>";
                    rows += "<td>" + leader.athlete.displayName + "</td>";
                    rows += "<td>" + teamAbbr + "</td>";
                    rows += "<td>" + leader.displayValue + "</td>";
                    rows += "</tr>";
                }
                targetBody.innerHTML = rows;
            }
        })
        .catch(function (error) {
            console.log("Error loading leaders:", error);
        });
}

// Fill team dropdowns
function loadTeams() {
    var favDropdown = document.getElementById("fav-team");
    var teamADropdown = document.getElementById("team-a");
    var teamBDropdown = document.getElementById("team-b");
    if (!favDropdown && !teamADropdown && !teamBDropdown) return;
    fetch(TEAMS_URL)
        .then(function (response) { return response.json(); })
        .then(function (data) {
            var teams = data.sports[0].leagues[0].teams;
            teams.sort(function (a, b) {
                if (a.team.displayName < b.team.displayName) return -1;
                if (a.team.displayName > b.team.displayName) return 1;
                return 0;
            });
            for (var i = 0; i < teams.length; i++) {
                var name = teams[i].team.displayName;
                var id = teams[i].team.id;
                if (favDropdown) {
                    var opt1 = document.createElement("option");
                    opt1.value = name;
                    opt1.textContent = name;
                    favDropdown.appendChild(opt1);
                }
                if (teamADropdown) {
                    var opt2 = document.createElement("option");
                    opt2.value = id;
                    opt2.textContent = name;
                    teamADropdown.appendChild(opt2);
                }
                if (teamBDropdown) {
                    var opt3 = document.createElement("option");
                    opt3.value = id;
                    opt3.textContent = name;
                    teamBDropdown.appendChild(opt3);
                }
            }
        })
        .catch(function (error) {
            console.log("Error loading teams:", error);
        });
}

// Compare teams
function setupTeamCompare() {
    var btn = document.getElementById("compare-teams-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
        var teamAId = document.getElementById("team-a").value;
        var teamBId = document.getElementById("team-b").value;
        var resultsDiv = document.getElementById("team-compare-results");
        var body = document.getElementById("team-compare-body");
        if (teamAId === "" || teamBId === "") {
            resultsDiv.style.display = "block";
            body.innerHTML = '<tr><td colspan="3">Please pick two teams first.</td></tr>';
            return;
        }
        if (teamAId === teamBId) {
            resultsDiv.style.display = "block";
            body.innerHTML = '<tr><td colspan="3">Please pick two different teams.</td></tr>';
            return;
        }
        resultsDiv.style.display = "block";
        body.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
        fetch(STANDINGS_URL)
            .then(function (response) { return response.json(); })
            .then(function (data) {
                var teamA = null;
                var teamB = null;
                for (var c = 0; c < data.children.length; c++) {
                    var entries = data.children[c].standings.entries;
                    for (var e = 0; e < entries.length; e++) {
                        if (entries[e].team.id === teamAId) teamA = entries[e];
                        if (entries[e].team.id === teamBId) teamB = entries[e];
                    }
                }
                document.getElementById("team-a-name").textContent = teamA.team.displayName;
                document.getElementById("team-b-name").textContent = teamB.team.displayName;
                var stats = [
                    { label: "Wins", name: "wins" },
                    { label: "Losses", name: "losses" },
                    { label: "Win %", name: "winPercent" },
                    { label: "Home Record", name: "home" },
                    { label: "Away Record", name: "road" },
                    { label: "Last 10", name: "lastTenGames" },
                    { label: "Streak", name: "streak" }
                ];
                var rows = "";
                for (var i = 0; i < stats.length; i++) {
                    var aDisplay = "-";
                    var bDisplay = "-";
                    for (var s = 0; s < teamA.stats.length; s++) {
                        if (teamA.stats[s].name === stats[i].name) aDisplay = teamA.stats[s].displayValue;
                    }
                    for (var s = 0; s < teamB.stats.length; s++) {
                        if (teamB.stats[s].name === stats[i].name) bDisplay = teamB.stats[s].displayValue;
                    }
                    rows += "<tr>";
                    rows += "<td>" + stats[i].label + "</td>";
                    rows += "<td>" + aDisplay + "</td>";
                    rows += "<td>" + bDisplay + "</td>";
                    rows += "</tr>";
                }
                body.innerHTML = rows;
            })
            .catch(function (error) {
                console.log("Error comparing teams:", error);
                body.innerHTML = '<tr><td colspan="3">Unable to load team data.</td></tr>';
            });
    });
}

// Compare page mode toggle
function setupCompareMode() {
    var teamsBtn = document.getElementById("mode-teams");
    var playersBtn = document.getElementById("mode-players");
    if (!teamsBtn || !playersBtn) return;
    var teamSection = document.getElementById("team-compare-section");
    var playerSection = document.getElementById("player-compare-section");
    teamsBtn.addEventListener("click", function () {
        teamSection.style.display = "";
        playerSection.style.display = "none";
    });
    playersBtn.addEventListener("click", function () {
        teamSection.style.display = "none";
        playerSection.style.display = "";
    });
}

// Compare players - uses league leaders data
function setupPlayerCompare() {
    var btn = document.getElementById("compare-players-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
        var nameA = document.getElementById("player-a").value.trim().toLowerCase();
        var nameB = document.getElementById("player-b").value.trim().toLowerCase();
        var resultsDiv = document.getElementById("player-compare-results");
        var body = document.getElementById("player-compare-body");
        if (nameA === "" || nameB === "") {
            resultsDiv.style.display = "block";
            body.innerHTML = '<tr><td colspan="3">Please enter both player names.</td></tr>';
            return;
        }
        resultsDiv.style.display = "block";
        body.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
        fetch(LEADERS_URL)
            .then(function (response) { return response.json(); })
            .then(function (data) {
                var playerA = { name: "", pts: "-", reb: "-", ast: "-", stl: "-", blk: "-" };
                var playerB = { name: "", pts: "-", reb: "-", ast: "-", stl: "-", blk: "-" };
                var categories = data.leaders;
                for (var c = 0; c < categories.length; c++) {
                    var cat = categories[c];
                    var key = "";
                    if (cat.name === "avgPoints") key = "pts";
                    if (cat.name === "avgRebounds") key = "reb";
                    if (cat.name === "avgAssists") key = "ast";
                    if (cat.name === "avgSteals") key = "stl";
                    if (cat.name === "avgBlocks") key = "blk";
                    if (key === "") continue;
                    for (var i = 0; i < cat.leaders.length; i++) {
                        var leader = cat.leaders[i];
                        var playerName = leader.athlete.displayName.toLowerCase();
                        if (playerName.indexOf(nameA) !== -1) {
                            playerA.name = leader.athlete.displayName;
                            playerA[key] = leader.displayValue;
                        }
                        if (playerName.indexOf(nameB) !== -1) {
                            playerB.name = leader.athlete.displayName;
                            playerB[key] = leader.displayValue;
                        }
                    }
                }
                if (playerA.name === "") {
                    body.innerHTML = '<tr><td colspan="3">Could not find "' + nameA + '" in league leaders. Try a top-50 player.</td></tr>';
                    return;
                }
                if (playerB.name === "") {
                    body.innerHTML = '<tr><td colspan="3">Could not find "' + nameB + '" in league leaders. Try a top-50 player.</td></tr>';
                    return;
                }
                document.getElementById("player-a-name").textContent = playerA.name;
                document.getElementById("player-b-name").textContent = playerB.name;
                var labels = [
                    { label: "Points / Game", key: "pts" },
                    { label: "Rebounds / Game", key: "reb" },
                    { label: "Assists / Game", key: "ast" },
                    { label: "Steals / Game", key: "stl" },
                    { label: "Blocks / Game", key: "blk" }
                ];
                var rows = "";
                for (var i = 0; i < labels.length; i++) {
                    rows += "<tr>";
                    rows += "<td>" + labels[i].label + "</td>";
                    rows += "<td>" + playerA[labels[i].key] + "</td>";
                    rows += "<td>" + playerB[labels[i].key] + "</td>";
                    rows += "</tr>";
                }
                body.innerHTML = rows;
            })
            .catch(function (error) {
                console.log("Error comparing players:", error);
                body.innerHTML = '<tr><td colspan="3">Unable to load player data.</td></tr>';
            });
    });
}

// Signup form - home page
function setupSignupForm() {
    var form = document.getElementById("signup-form");
    if (!form) return;
    var messageDiv = document.getElementById("form-message");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var name = document.getElementById("user-name").value.trim();
        var email = document.getElementById("user-email").value.trim();
        var team = document.getElementById("fav-team").value;
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

// Contact form
function setupContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var messageDiv = document.getElementById("contact-form-message");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var name = document.getElementById("contact-name").value.trim();
        var email = document.getElementById("contact-email").value.trim();
        var message = document.getElementById("contact-message").value.trim();
        if (name === "" || email === "" || message === "") {
            messageDiv.textContent = "Please fill in your name, email, and message.";
            messageDiv.className = "form-message error";
            return;
        }
        messageDiv.textContent = "Thanks, " + name + "! We got your message and will reply to " + email + " soon.";
        messageDiv.className = "form-message success";
        form.reset();
    });
}

// Hamburger menu
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

// Run on page load
window.addEventListener("DOMContentLoaded", function () {
    loadScores();
    loadStandings();
    loadFullStandings();
    loadLeagueLeaders();
    loadTeams();
    setupTeamCompare();
    setupPlayerCompare();
    setupCompareMode();
    setupSignupForm();
    setupContactForm();
    setupHamburger();
});