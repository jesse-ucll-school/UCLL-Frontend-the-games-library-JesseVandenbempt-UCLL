const BACKEND_PROTOCOL = "http";
const BACKEND_HOSTNAME = "localhost";
const BACKEND_PORT = 3000;


/**
 * Returns the url to the back-end
 * 
 * @param {string} path 
 * @param {string} query 
 * @returns 
 */
const getURL = (path, query="") => {

    let url = `${BACKEND_PROTOCOL}://${BACKEND_HOSTNAME}`;

    if (BACKEND_PORT) {
        url += `:${BACKEND_PORT}`;
    } 

    url += path;

    if (query) {
        url += `?query=${query}`;
    }

    return url;
};