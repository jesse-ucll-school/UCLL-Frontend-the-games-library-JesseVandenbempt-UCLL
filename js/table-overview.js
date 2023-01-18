const { max, min, floor, random } = Math;
const main = document.querySelector("main");

const POLL_INTERVAL = 1000;
const TABLE_ID = "my-games-table";
const HEADER = ["Name", "Type", "Rating", ""];

/**
 * @type {HTMLInputElement}
 */
const nameInputRef = createRef();

/**
 * @type {HTMLInputElement}
 */
const ratingInputRef = createRef();

/**
 * Keep track of state
 */
let query       = null;
let rating      = null;
let favourite   = null;


/**
 * @typedef {Object} Game
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number} rating
 * @property {boolean} isFavourite 
 * 
 * @type {Game[]}
 */
let games = [];


/**
 * A generic filter that allways returns true
 * 
 * @returns {boolean}
 */
const allFilter = () => true;


/**
 * Clamps a number between a specific range [n, m]
 * 
 * @param {number} n 
 * @param {number} m 
 * @param {number} v 
 * 
 * @returns {number}
 */
const clamp = (n, m, v) => {
    return min(max(n, v), m);
};


/**
 * Rounds a float to a specific decimal point
 * 
 * @param {number} n 
 * @param {number} d 
 * 
 * @returns {number}
 */
const floatRound = (n, d=2) => {
    return parseFloat(n.toFixed(d));
};


/**
 * Decorate, clamp and round a rating value
 * 
 * @param {number} n 
 * 
 * @returns {}
 */
const ratingToString = (n) => {
    return `⭐${floatRound(clamp(0, 10, n))}`;
};


/**
 * Converts a boolean value to a human-readable string
 * 
 * @param {boolean} b 
 * 
 * @returns {string}
 */
const booleanToText = (b) => {
    return b ? "🟩" : "🟥";
};


/**
 * Converts a game object into a human-readable string
 * 
 * @param {Game} game 
 * 
 * @returns {string}
 */
const toString = (game) => {
    return `Name: ${game.name} - Type: ${game.type} - Rating: ${ratingToString(game.rating)} - Favourite: ${booleanToText(isFavourite(game))}`;
};


/**
 * Returns a random number in a specific range [n, m]
 * 
 * @param {number} n 
 * @param {number} m 
 * 
 * @returns {number}
 */
const randomRange = (n, m) => {
    return n + random() * (m-n);
};


/**
 * Creates a random color
 * 
 * @returns {string}
 */
const createColor = () => {
    return `hsl(${floor(randomRange(0, 360))}, 100%, 50%)`;
};


/**
 * Returns true if the game is tagged as favourite
 * 
 * @param {Game} game 
 * 
 * @returns {boolean}
 */
const isFavourite = (game) => {
    return game.isFavourite;
};


/**
 * Gets a game given a uuid
 * 
 * @param {string} uuid 
 * 
 * @returns {Game?}
 */
const getGame = (uuid) => {
    for (const game of games) {
        if (game.id == uuid) {
            return game;
        }
    }
};


/**
 * Do a request to the backend
 * 
 * @typedef {"POST"|"GET"} RequestMethod
 * 
 * @param {string} url 
 * @param {RequestMethod} method 
 * @param {string} status 
 */
const request = async (url, method, status) => {
    await fetch(getURL(url), { method });
    await fetchAndRenderGames();

    if (status) {
        resetStatus();
        addStatus(status());
    }
};


/**
 * Toggles favourite property on game object 
 * 
 * @param {Game} game 
 */
const toggleFavourite = async (game) => {
    await request(
        `/games/${game.id}/favourite`,
        "POST", 
        () => `The game with name ${game.name} is now ${!isFavourite(getGame(game.id)) ? "not" : ""} my favourite.`
    );
};


/**
 * Delete game from games
 * 
 * @param {game} game 
 */
const deleteGame = async (game) => {
    await request(
        `/games/${game.id}`,
        "DELETE",
        () => `The game with name ${game.name} is now deleted.`
    );
};


/**
 * Creates a table with a given header and bodyId
 * 
 * @returns {HTMLTableElement}
 */
const createGamesTable = () => {
    return createElement("table", {
        id: TABLE_ID,
        children: [
            createElement("caption"),
            createElement("thead", {
                children: [
                    createElement("tr", {
                        children: HEADER
                                    .map(value => createElement("th", { text: value }))
                    })
                ]
            }),
            createElement("tbody")
        ],
        parent: main
    });
};


/**
 * Renders the given games array in my-games-table
 * 
 * @param {Game[]} games
 */
const renderGames = (games) => {

    clearGameTable();

    document.getElementById(TABLE_ID)
            .querySelector("caption").innerText = stateToString();

    games = games
        .filter(game => rating === null || game.rating > rating)
        .filter(game => favourite === null || isFavourite(game));

    if (games.length === 0) {
        hideTable({ tableId: TABLE_ID });
        resetStatus();
        addStatus("No games in library");
    } else {
        showTable({ tableId: TABLE_ID });
    }

    document.getElementById(TABLE_ID)
        .querySelector("tbody")
        .append(...games
            .map(game => {
                return createElement("tr", {
                    events: {
                        onclick() {
                            resetStatus();
                            addStatus(toString(game));
                        },
                        ondblclick() {
                            toggleFavourite(game);
                        },
                        onmouseenter(tr) {
                            tr.classList.add("hover");
                        },
                        onmouseleave(tr) {
                            tr.classList.remove("hover");
                        }
                    },
                    children: [
                        ...getGameValues(game)
                            .map(value => createElement("td", { text: value })),
                        createElement("td", {
                            children: [
                                createElement("button", {
                                    text: "✖",
                                    events: {
                                        onclick(_, e) {
                                            e.stopPropagation();
                                            deleteGame(game);
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                })
            })
        );
};




/**
 * Clears the game table
 */
const clearGameTable = () => {
    document.getElementById(TABLE_ID)
        .querySelector("tbody").innerHTML = "";
};


/**
 * Hides a table
 */
const hideTable = ({ tableId }) => {
    document.getElementById(tableId)
        .classList.add("hidden");
}


/**
 * Hides a table
 */
const showTable = ({ tableId }) => {
    document.getElementById(tableId)
        .classList.remove("hidden");
}


/**
 * Extract values from game object
 * 
 * @param {Game} game 
 * 
 * @returns {string[3]}
 */
const getGameValues = (game) => [game.name, game.type, ratingToString(game.rating)];


/**
 * Fetch games from back-end
 * 
 * @param {string} query 
 */
const fetchGames = async (query="") => {
    const res = await fetch(getURL("/games", query));
    if (res.ok) {
        const data = await res.json();
        games = data;
    } else {
        console.error(res.statusText);
    }
};


/**
 * Fetch and render games
 * 
 * @param {FetchAndRenderGamesOptions?} param0 
 */
const fetchAndRenderGames = async () => {
    await fetchGames(query);
    renderGames(games);
};


/**
 * Resets the current state
 * 
 * @typedef {Object} State
 * @property {GamesFilterFunction?} filter
 * @property {string?} query
 * @property {string?} caption
 * 
 * @param {State} state
 */
const updateState = (state) => {
    query       = typeof state.query === "undefined" ? query : state.query;
    rating      = typeof state.rating === "undefined" ? rating : state.rating;
    favourite   = typeof state.favourite === "undefined" ? favourite : state.favourite;
};


/**
 * Clears the current state
 */
const clearState = () => {
    query = null;
    rating = null;
    favourite = null;

    nameInputRef.value = "";
    ratingInputRef.value = 0;
}


/**
 * Convert current state to string
 */
const stateToString = () => {
    const state = [
        query ? `with the name containing "${query}"` : null,
        rating !== null ? `with a rating avove ${rating}` : null,
        favourite ? `that are favourite` : null
    ]
    .filter(value => !!value);

    let s = "";

    if (state.length > 0) {

        s = "games ";

        s += state[0]

        state.slice(1, -1).forEach(value => s += ` , ${value}`);

        if (state.length > 1) s += ` and ${state[state.length - 1]}`;

        s += ".";
    }

    return s;
}


// Block: Create filter buttons
{
    createElement(wrapperElement, {
        properties: {
            direction: "row"
        },
        children: [
            createElement("button", {
                text: "Show my favourite games",
                events: {
                    onclick() {
                        updateState({ favourite: true });
                        fetchAndRenderGames();
                    }
                }
            }),
            createElement("button", {
                text: "Show all games",
                events: {
                    onclick() { 
                        clearState();
                        fetchAndRenderGames();
                    }
                }
            })
        ],
        parent: main
    })
}


/**
 * Block: Create rating input filter
 */
{
    createElement(wrapperElement, {
        properties: {
            direction: "row"
        },
        children: [
            createElement("label", {
                text: "Show games with a rating higher than:"
            }),
            createElement("input", {
                properties: {
                    type: "number",
                    value: 0,
                    step: 0.5,
                    min: 0,
                    max: 10
                },
                events: {
                    onchange(ratingInput) {
                        rating = ratingInput.value == 0 ? null : ratingInput.value;
                        updateState({ rating });
                        fetchAndRenderGames();
                    }
                },
                [REF]: ratingInputRef
            })
        ],
        parent: main
    });
}


/**
 * Block: Create name input filter
 */
{
    createElement(wrapperElement, {
        properties: {
            direction: "column"
        },
        children: [
            createElement(wrapperElement, {
                properties: {
                    direction: "row"
                },
                children: [
                    createElement("label", {
                        text: "fetch games from backend with name containing:"
                    }),
                    createElement("input", {
                        properties: {
                            type: "text",
                            value: ""
                        },
                        [REF]: nameInputRef
                    })
                ]
            }),
            createElement(wrapperElement, {
                properties: {
                    direction: "row"
                },
                children: [
                    createElement("button", {
                        text: "Fetch",
                        events: {
                            onclick() {
                                updateState({ query: nameInputRef.value });
                                fetchAndRenderGames();
                            }
                        }
                    }),
                    createElement("button", {
                        text: "Reset",
                        events: {
                            onclick() {
                                nameInputRef.value = "";
                                updateState({ query: null });
                                fetchAndRenderGames();
                            }
                        }
                    })
                ]
            })
        ],
        parent: main
    });
}


/**
 * Block: Create and render table
 */
{
    createGamesTable();
    fetchAndRenderGames();

    createElement("div", {
        id: "status",
        parent: main
    });

    resetStatus();

    const myGamesHeader = document.querySelector("main > h2");
    myGamesHeader.addEventListener("click", () => {
        myGamesHeader.setAttribute("style", `background-color: ${createColor()}`);
    });
}


setInterval(fetchAndRenderGames, POLL_INTERVAL);