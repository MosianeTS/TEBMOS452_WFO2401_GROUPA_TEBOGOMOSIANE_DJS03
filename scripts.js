import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;

/**
 * Creates a preview button element for a book.
 * @param {Object} book - The book object containing id, image, title, and author.
 * @param {string} book.id - The unique identifier of the book.
 * @param {string} book.image - The URL of the book's cover image.
 * @param {string} book.title - The title of the book.
 * @param {string} book.author - The author of the book.
 * @returns {HTMLButtonElement} - The created preview button element.
 */

function createPreviewButton({ author, id, image, title }) {
    const element = document.createElement('button');
    element.classList = 'preview';
    element.setAttribute('data-preview', id);

    element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return element;
}

/**
 * Appends a subset of books to a document fragment.
 * @param {Object[]} books - Array of book objects.
 * @param {DocumentFragment} fragment - The document fragment to which books will be appended.
 * @param {number} [start=0] - The start index of books to append.
 * @param {number} [end=BOOKS_PER_PAGE] - The end index of books to append.
 * @returns {void}
 */

function appendBooksToFragment(books, fragment, start = 0, end = BOOKS_PER_PAGE) {
    for (const book of books.slice(start, end)) {
        const element = createPreviewButton(book);
        fragment.appendChild(element);
    }
}


/**
 * Updates the book list with the current matches.
 * @returns {void}
 */
function updateBookList() {
    const fragment = document.createDocumentFragment();
    appendBooksToFragment(matches, fragment);
    document.querySelector('[data-list-items]').appendChild(fragment);
}

/**
 * Creates a document fragment containing dropdown options.
 * @param {Object} data - The data object containing key-value pairs.
 * @param {string} firstOptionText - The text for the first default option.
 * @returns {DocumentFragment} - The created document fragment.
 */

function createDropdownOptions(data, firstOptionText) {
    const fragment = document.createDocumentFragment();
    const firstOption = document.createElement('option');
    firstOption.value = 'any';
    firstOption.innerText = firstOptionText;
    fragment.appendChild(firstOption);

    for (const [id, name] of Object.entries(data)) {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    }
    return fragment;
}


/**
 * Initializes dropdown menus for genres and authors.
 * @returns {void}
 */
function initializeDropdowns() {
    document.querySelector('[data-search-genres]').appendChild(createDropdownOptions(genres, 'All Genres'));
    document.querySelector('[data-search-authors]').appendChild(createDropdownOptions(authors, 'All Authors'));
}

/**
 * Sets the theme based on user's preference or system settings.
 * @returns {void}
 */

function setTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.querySelector('[data-settings-theme]').value = 'night';
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.querySelector('[data-settings-theme]').value = 'day';
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}


/**
 * Updates the "Show More" button text and state based on remaining books.
 * @returns {void}
 */
function updateShowMoreButton() {
    const remaining = matches.length - (page * BOOKS_PER_PAGE);
    document.querySelector('[data-list-button]').innerText = `Show more (${remaining})`;
    document.querySelector('[data-list-button]').disabled = remaining <= 0;
}

/**
 * Closes an overlay element.
 * @param {string} selector - The CSS selector for the overlay element.
 * @returns {void}
 */
function closeOverlay(selector) {
    document.querySelector(selector).open = false;
}

/**
 * Opens an overlay element and optionally focuses on a specified element within it.
 * @param {string} selector - The CSS selector for the overlay element.
 * @param {string} [focusSelector=null] - The CSS selector for the element to focus on.
 * @returns {void}
 */

function openOverlay(selector, focusSelector = null) {
    document.querySelector(selector).open = true;
    if (focusSelector) {
        document.querySelector(focusSelector).focus();
    }
}


function handleSettingsFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }

    closeOverlay('[data-settings-overlay]');
}

/**
 * Handles the submission of the search form, filters the books based on user input, and updates the book list.
 * @param {Event} event - The form submission event.
 * @returns {void}
 */
function handleSearchFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    matches = books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;

        return genreMatch && titleMatch && authorMatch;
    });

    page = 1;
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', matches.length < 1);
    document.querySelector('[data-list-items]').innerHTML = '';
    updateBookList();
    updateShowMoreButton();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeOverlay('[data-search-overlay]');
}


/**
 * Handles the click event for the "Show More" button, appends more books to the list, and updates the button state.
 * @returns {void}
 */
function handleShowMoreButtonClick() {
    const fragment = document.createDocumentFragment();
    appendBooksToFragment(matches, fragment, page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);
    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
    updateShowMoreButton();
}

/**
 * Handles the click event on preview elements.
 * Updates the preview section with details of the selected book.
 * @param {Event} event - The click event.
 * @returns {void}
 */
function handlePreviewClick(event) {
    const pathArray = Array.from(event.path || event.composedPath());
    const previewElement = pathArray.find(node => node?.dataset?.preview);

    if (previewElement) {
        const book = books.find(book => book.id === previewElement.dataset.preview);
        if (book) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = book.image;
            document.querySelector('[data-list-image]').src = book.image;
            document.querySelector('[data-list-title]').innerText = book.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = book.description;
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const startingFragment = document.createDocumentFragment();
    appendBooksToFragment(matches, startingFragment);
    document.querySelector('[data-list-items]').appendChild(startingFragment);

    initializeDropdowns();
    setTheme();
    updateShowMoreButton();

    document.querySelector('[data-search-cancel]').addEventListener('click', () => closeOverlay('[data-search-overlay]'));
    document.querySelector('[data-settings-cancel]').addEventListener('click', () => closeOverlay('[data-settings-overlay]'));
    document.querySelector('[data-header-search]').addEventListener('click', () => openOverlay('[data-search-overlay]', '[data-search-title]'));
    document.querySelector('[data-header-settings]').addEventListener('click', () => openOverlay('[data-settings-overlay]'));
    document.querySelector('[data-list-close]').addEventListener('click', () => closeOverlay('[data-list-active]'));

    document.querySelector('[data-settings-form]').addEventListener('submit', handleSettingsFormSubmit);
    document.querySelector('[data-search-form]').addEventListener('submit', handleSearchFormSubmit);
    document.querySelector('[data-list-button]').addEventListener('click', handleShowMoreButtonClick);
    document.querySelector('[data-list-items]').addEventListener('click', handlePreviewClick);
});

