document.forms['query-form'].onsubmit = (e) => {
    e.preventDefault();
    const queryString = document.forms['query-form'].elements['query-string'].value == null ? 
    "null" : document.forms['query-form'].elements['query-string'].value;
    const queryPlayers = document.forms['query-form'].elements['query-players'].checked ? "on" : "off";
    const queryMatches = document.forms['query-form'].elements['query-matches'].checked ? "on" : "off";
    const querySort = document.forms['query-form'].elements['query-sort'].checked ? "on" : "off";

    const cutoff_elo = document.forms['query-form'].elements['cutoff-elo'].value == 0 ?
    200: document.forms['query-form'].elements['cutoff-elo'].value;

    const cutoff_date = document.forms['query-form'].elements['cutoff-date'].value === "" ?
    new Date().toLocaleDateString('en-US') : document.forms['query-form'].elements['cutoff-date'].value

    let query = window.location.origin + "/search?string="+queryString + "&players="+queryPlayers
    + "&matches="+queryMatches + "&cutoffelo="+cutoff_elo + "&cutoffdate="+cutoff_date +
    "&dec="+querySort;

    fetch(query)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            populate_results(data)
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
};

function populate_results(data) {
    let results_container = document.getElementById('results-pane')
    results_container.innerHTML= '';

    for (item in data[0]) {
        results_container.append(makePlayerBadge(data[0][item].full_name, data[0][item].peak_elo, 
            data[0][item].matches
        ))  
    }

    for (item in data[1]) {
        results_container.append(makePlayerBadge(data[1][item].full_name, data[1][item].peak_elo, 
            data[1][item].matches
        )) 
    }

}

function makePlayerBadge(full_name, elo, matches) {
    let badge = document.createElement('div');
    badge.className = 'player-badge';
    badge.innerHTML = `
        <p>Name: ${full_name}</p>
        <p>ELO: ${elo}</p>
        <p>Matches:</p>
        <section>
            ${matches.map(match => `
                <div class="match-icon" id="${match.drew}"> 
                <div class="match-hover-window">
                <p>Winner: ${match.winner}</p>
                <p>Loser: ${match.loser}</p>
                <p>Date: ${new Date(match.began_on).toLocaleDateString('en-US')}</p> 
                </div>
                </div>
            `).join('')}
        </section>`;
    return badge;
}