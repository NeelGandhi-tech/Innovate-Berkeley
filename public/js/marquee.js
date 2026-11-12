// Keeps every .marquee row at a constant speed (px/s from data-speed) whatever its length.
// Shared by the home page logo rows and the gallery photo rows.
// Keep each row at a constant speed (px/s from data-speed) whatever its length:
// one loop travels half the track plus half a gap, so duration = distance / speed.
(function () {
    var rows = document.querySelectorAll('.marquee[data-speed]');
    function setDurations() {
        rows.forEach(function (row) {
            var track = row.querySelector('.marquee__track');
            var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            var distance = track.getBoundingClientRect().width / 2 + gap / 2; // box width, not overflow
            row.style.setProperty('--duration', (distance / Number(row.dataset.speed)).toFixed(2) + 's');
        });
    }
    setDurations();
    window.addEventListener('load', setDurations);
    window.addEventListener('resize', setDurations);
    if (document.fonts) document.fonts.ready.then(setDurations);
})();
