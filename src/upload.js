document.forms['player-form'].onsubmit = (e) => {
    e.preventDefault();
    const name = document.forms['player-form'].elements['string'].value;
    const debut = document.forms['player-form'].elements['date'].value;
    const elo = document.forms['player-form'].elements['elo'].value;

    let player = {
        full_name: name,
        debut: debut,
        peak_elo: elo
    }

    postPlayer(player);
}

document.forms['match-form'].onsubmit = (e) => {
    e.preventDefault();
    const wName = document.forms['match-form'].elements['string'].value;
    const lName = document.forms['match-form'].elements['string1'].value;
    const date = document.forms['match-form'].elements['date'].value;
    const drew = document.forms['match-form'].elements['drew'].value === 'yes' ? true : false;

    let match = {
        winner: wName,
        loser: lName,
        began_on: date,
        drew: drew
    }

    postMatch(match)
}

function postPlayer(player) {
    console.log(window.location.origin + "/player")
    fetch(window.location.origin + "/player", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(player)
    }).then(response => response.json()).then(result => console.log(result))
}

function postMatch(match) {
    console.log(window.location.origin + "/match")
    console.log(match)
    fetch(window.location.origin + "/match", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(match)
    }).then(response => response.json()).then(result => console.log(result))
}