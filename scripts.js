import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;

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

function appendBooksToFragment(books, fragment, start = 0, end = BOOKS_PER_PAGE) {
    for (const book of books.slice(start, end)) {
        const element = createPreviewButton(book);
        fragment.appendChild(element);
    }
}

function updateBookList() {
    const fragment = document.createDocumentFragment();
    appendBooksToFragment(matches, fragment);
    document.querySelector('[data-list-items]').appendChild(fragment);
}

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

function initializeDropdowns() {
    document.querySelector('[data-search-genres]').appendChild(createDropdownOptions(genres, 'All Genres'));
    document.querySelector('[data-search-authors]').appendChild(createDropdownOptions(authors, 'All Authors'));
}

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

function updateShowMoreButton() {
    const remaining = matches.length - (page * BOOKS_PER_PAGE);
    document.querySelector('[data-list-button]').innerText = `Show more (${remaining})`;
    document.querySelector('[data-list-button]').disabled = remaining <= 0;
}

function closeOverlay(selector) {
    document.querySelector(selector).open = false;
}

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

function handleShowMoreButtonClick() {
    const fragment = document.createDocumentFragment();
    appendBooksToFragment(matches, fragment, page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);
    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
    updateShowMoreButton();
}

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

