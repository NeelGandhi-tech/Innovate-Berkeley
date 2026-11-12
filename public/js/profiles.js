// Speaker cards: click (or Enter/Space) flips the photo to show the bio, click again flips back.
document.querySelectorAll('.person__card').forEach(card => {
    const label = card.getAttribute('aria-label');
    const bio = card.querySelector('.person__bio');
    const live = card.parentElement.querySelector('.person__bio-sr');
    card.addEventListener('click', () => {
        const flipped = card.getAttribute('aria-pressed') !== 'true';
        card.setAttribute('aria-pressed', String(flipped));
        card.setAttribute('aria-label', flipped ? label.replace(/Show bio$/, 'Hide bio') : label);
        if (live) live.textContent = flipped ? bio.textContent : '';
    });
});
