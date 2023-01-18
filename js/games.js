const { max, min, pow } = Math;

const games = [
    { name: "Hitman 3", type: "Stealth, Sandbox", rating: 10.0, favourite: true },
    { name: "Dying Light 2", type: "Survival, Parkour", rating: 8.0, favourite: true },
    { name: "Ghost Recon: Wildlands", type: "FPS, Shooter, Stealth", rating: 9.0, favourite: false },
    { name: "Ark: Survival Evolved", type: "Survival, Adventure", rating: 8.5, favourite: false },
    { name: "Destiny 2", type: "FPS, Shooter, RPG", rating: 9.5, favourite: true },
    { name: "Phasmaphobia", type: "Horror", rating: 9, favourite: false },
    { name: "Escape Simulator", type: "Puzzle, Simulation, Casual", rating: 9.5, favourite: true },
];

const friendGames = [
    { name: "Scum", type: "Survival, FPS", rating: 5, favourite: false },
    { name: "Watchdogs: Legion", type: "Shooter, Stealth, Adventure", rating: 7, favourite: false  },
];

const allGames = [...games, ...friendGames];

const avg = (...n) => {
    return n.reduce((a, n, i) => { return (a*i+n)/(i+1) });
};

const clamp = (n, m, v) => {
    return min(max(n, v), m);
};

const floatRound = (n, d=2) => {
    return parseFloat(n.toFixed(d));
};

const rating = (n) => {
    return `${floatRound(clamp(0, 10, n))}⭐`;
};

const addHeaderStatus = (status, h=4) => {
    (document.getElementById("status").innerHTML =
        document.getElementById("status").innerHTML + `<h${h}>` + status + `</h${h}>`);
};

const booleanToText = (b) => {
    return b ? "🟩" : "🟥";
};

const toString = (game) => {
    return `Name: ${game.name} - Type: ${game.type} - Rating: ${rating(game.rating)} - Favourite: ${booleanToText(game.favourite)}`;
};

const getAverageRating = () => {
    return avg(...games.map(game => game.rating));
};

const getHighestRating = () => {
    return games.reduce((p, c) => c.rating > p.rating ? c : p);
};

const isFavourite = (game) => {
    return game.favourite;
};

const printAllGames = (games) => {
    games.map(toString).forEach(addStatus);
};

const printFavouriteGames = () => {
    addHeaderStatus("These are all the favourite games in the libary");
    games
        .filter(isFavourite)
        .forEach(game => addStatus(game.name));
};

const printStatistics = () => {
    addHeaderStatus("Some statistics ...");
    addStatus(`Average rating: ${rating(getAverageRating())}`);

    const highestRatedGame = getHighestRating();
    addStatus(`${highestRatedGame.name} is the game with the highest rating: ${rating(highestRatedGame.rating)}`);
};

const printFirstTwoGames = () => {
    addHeaderStatus("My first 2 games are:");
    const [first, second] = games;
    for (game of [first, second]) {
        addStatus(game.name);
    }
};

const filterAndPrintGames = (games, filter=()=>true) => {
    printAllGames(games.filter(filter));
};

addHeaderStatus("My own games:");
printAllGames(games);

printFavouriteGames();
printStatistics();
printFirstTwoGames();

addHeaderStatus("My best friend's games:");
printAllGames(friendGames);

addHeaderStatus("All the games in our libary:");
printAllGames(allGames);

addHeaderStatus(`These are all games with rating above ${rating(9)}:`);
filterAndPrintGames(allGames, game => game.rating > 9);

addHeaderStatus("These are all stealth games:");
filterAndPrintGames(allGames, game => game.type.toLowerCase().includes("stealth"));