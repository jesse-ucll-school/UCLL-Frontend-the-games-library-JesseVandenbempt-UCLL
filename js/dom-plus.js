/**
 * DomPlus function definitions
 * Roact style like element creation
 * 
 * author: [MrFusiion] aka Jesse Vandenbempt
 */


const REF = Symbol("ref");


/**
 * Applies events dictonary to a element
 * 
 * @typedef {(element: HTMLElement, e: Event) => void} EventHandler
 * @typedef {Record<string, EventHandler>} EventsRecord 
 * 
 * @param {EventsRecord} events
 * @param {HTMLElement} element
 */
const applyEvents = (events, element) => {
    Object.entries(events)
        .forEach(([eventName, handler]) => {
            element.addEventListener(
                eventName
                    .toLowerCase()
                    .replace(/^on/, ""),
                (e) => handler(element, e) // event handler proxy to pass element reference to handler
            );
        });
}


/**
 * Create HTMLElement
 * 
 * @typedef {Record<string, any>} ElementProperties
 * 
 * @typedef {(prop: ElementProperties) => HTMLElement} CreateElementCallback
 * 
 * @typedef {Object} CreateElementOptions
 * @property {string[]?} classList
 * @property {EventsRecord?} events
 * @property {HTMLElement?} parent
 * @property {ElementCreationOptions?} options
 * @property {string?} text
 * @property {string?} html
 * @property {ElementProperties} properties
 * @property {HTMLElement[]?} children
 * 
 * @param {string|} type
 * @param {CreateElementOptions?} param0
 * 
 * @returns {HTMLElement}
 */
const createElement = (type, {
    classList=[],
    events,
    parent,
    options,
    id,
    text,
    html,
    properties={},
    children,
    [REF]: ref
} = {}) => {
    const element = typeof type === "string"
        ? document.createElement(type, options)
        : type(properties);

    applyEvents(events || [], element);

    classList.forEach(value => element.classList.add(value));

    if (parent) parent.appendChild(element);

    if (id) element.id = id;

    if (text) element.innerText = text;
    if (html) element.innerHTML = html;

    for (const [propName, propValue] of Object.entries(properties)) {
        element[propName] = propValue;
    }

    if (children) element.append(...children);

    if (ref) ref[REF] = element;

    return element;
};


/**
 * Create a element ref
 */
const createRef = () => {
    let ref = null;

    const checkRef = () => {
        if (!ref) throw new Error("Ref was never asigned!");
    }

    return new Proxy({}, {

        set(_, p, newValue, ) {
            if (p === REF) {
                ref = newValue;
            } else {
                checkRef();
                ref[p] = newValue;
            }
        },

        get(_, p) {
            checkRef();
            return ref[p];
        },

        deleteProperty(_, p) {
            checkRef();
            delete ref[p];
        }

    });
};


/**
 * Creates a wrapper container for elements
 * 
 * @typedef {"row"|"column"} WrapperDirection
 * 
 * @typedef {Object} WrapperProps
 * @property {WrapperDirection?} direction
 * 
 * @param {WrapperProps} props
 * 
 * @returns {HTMLDivElement}
 */
const wrapperElement = (props) => {
    return createElement("div", {
        classList: ["wrapper", props["direction"] || "column"]
    });
};


/**
 * Clears status and ads status header
 */
const resetStatus = () => {
    clearStatus();
    addStatusHeader("Status");
};


/**
 * Adds status text as a header 3 tag
 * 
 * @param {string} status 
 */
const addStatusHeader = (status) => {
    const h3 = document.createElement("h3");
    h3.innerText = status;
    document.getElementById("status").appendChild(h3);
};