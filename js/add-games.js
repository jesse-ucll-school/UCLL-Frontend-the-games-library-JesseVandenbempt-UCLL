const floatCheckRegEx = /^\d+(\.\d+)?/;

const statusDiv = document.getElementById("status");


/**
 * Converts a game object to a human readable string
 * 
 * @param {string} game 
 * 
 * @returns {string}
 */
const toString = (game) => {
    return `Game(name="${game.name}", type="${game.type}", rating=${game.rating || 0}, favourite=false)`;
};


/**
 * Adds a status message
 * 
 * @param {string} html 
 * @param {string} className 
 */
const addStatusWithClass = (html, className) => {
    const p = document.createElement("p");
    p.className = className;
    p.innerHTML = html
    statusDiv.appendChild(p);
};


/**
 * Adds a Ok feedback status message
 * 
 * @param {string} message 
 */
const addStatusOk = (message) => {
    clearStatus();
    addStatusWithClass(message, "ok");
};


/**
 * Adds a Error feedback status message
 * 
 * @param {string} message 
 */
const addStatusError = (message) => {
    
    clearStatus();
    addStatusWithClass(message, "error");
};


/**
 * Sends a request to the back-end to add a game
 * 
 * @param {Game} game 
 */
const addGame = async (game) => {

    const res = await fetch(getURL("/games"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(game)
    });

    if (res.status >= 400) {
        const { message } = await res.json();
        addStatusError(message);
    } else {
        addStatusOk(`Added ${toString(game)}`);
    }
};


const nameIsUnique = async ({ gameName }) => {
    const res = await fetch(getURL(`/games/name/${gameName}`));
    const data = await res.json();
    return !data;
};


/**
 * Validate form
 * 
 * @param {From} fromData
 * 
 * @returns {boolean}
 */
const isFromDataValid = async (form) => {

    const formData = new FormData(form);

    const emptyFields =[...formData.entries()]
        .filter(([_, value]) => value == "")
        .map(([key]) => key);

    if (emptyFields.length > 0) {

        let message = "No empty values allowed for ";

        // Add first
        message += emptyFields[0];

        // Add middle
        emptyFields.slice(1, -1)
            .forEach(key => message += `, ${key}`);

        // Add last
        if (emptyFields.length > 1) {
            message += " and ";
            message += emptyFields[emptyFields.length - 1];
        }

        addStatusError(message);
        return false;
    }

    if (!await nameIsUnique({ gameName: formData.get("name") })) {
        addStatusError("Game name must be unique");
        return false;
    }

    const rating = formData.get("rating")
    if (rating < 0 || rating > 10) {
        addStatusError("Rating must be between 0 and 10");
        return false;
    }

    return true;
};


document.getElementById("add-game-form")
    .addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);

        if (!await isFromDataValid(e.target)) {
            return;
        }
        
        const game = {};
        
        for (const [k, v] of formData.entries()) {
            if (floatCheckRegEx.test(v)) {
                game[k] = parseFloat(v);
            } else {
                game[k] = v;
            }
        }
        
        addGame(game);
    });