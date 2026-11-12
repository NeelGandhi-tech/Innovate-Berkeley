// Gallery photo strips: an interactive, physics-style carousel.
// - Glides on its own at data-speed px/s (like the home page partner row).
// - Hovering slows it to a stop (and the hovered photo grows, in CSS); leaving eases it back up.
// - Swipes, flicks and drags (trackpad, mouse, touch), Shift+wheel and arrow keys add momentum:
//   the harder the swipe, the faster photos fly past, then it eases back to its normal pace.
// - Photos are rendered twice, so the position wraps by one copy's width and never runs out.
// - prefers-reduced-motion: no auto-glide and no coasting; gestures move it directly.
(function () {
    var EASE = 0.6;          // seconds for speed to settle toward its target (higher = longer coast)
    var MAX_SPEED = 6000;    // px/s cap for very hard flicks
    var WHEEL_GAIN = 12;     // wheel delta (px) -> added speed (px/s)
    var KEY_KICK = 900;      // px/s added per arrow key press
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.marquee--photos').forEach(function (strip) {
        var track = strip.querySelector('.marquee__track');
        var base = (Number(strip.dataset.speed) || 40) * (strip.classList.contains('marquee--reverse') ? -1 : 1);
        var pos = 0, vel = reduceMotion ? 0 : base;
        var hovering = false, focused = false, dragging = false;
        var last = null;

        strip.classList.add('is-interactive');

        // Width of one copy of the photos: the point where the loop repeats
        function period() {
            var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return (track.scrollWidth + gap) / 2;
        }

        function maxScroll() { return strip.scrollWidth - strip.clientWidth; }

        // Keep position within [1, period + 1) so there is always room to move either way
        function wrap() {
            if (reduceMotion) { pos = Math.max(0, Math.min(pos, maxScroll())); return; }
            var p = period();
            while (pos >= p + 1) pos -= p;
            while (pos < 1) pos += p;
        }

        function apply() { wrap(); strip.scrollLeft = pos; }

        // Add momentum. With reduced motion there is no coasting: move by `step` px directly instead.
        function kick(dv, step) {
            if (reduceMotion) { if (step) { pos += step; apply(); } return; }
            vel = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, vel + dv));
        }

        // Target speed: stopped while hovered, focused or held; otherwise the normal glide
        function target() {
            return reduceMotion || hovering || focused || dragging ? 0 : base;
        }

        function frame(now) {
            var dt = last === null ? 0 : Math.min(now - last, 100) / 1000;
            last = now;
            if (!dragging && !document.hidden && dt) {
                vel += (target() - vel) * (1 - Math.exp(-dt / EASE));
                if (Math.abs(vel) < 0.5 && target() === 0) vel = 0;
                pos += vel * dt;
                apply();
            }
            requestAnimationFrame(frame);
        }

        // Hover: glide to a stop; leave: ease back up
        strip.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
        strip.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hovering = false; });
        strip.addEventListener('focusin', function () { focused = true; });
        strip.addEventListener('focusout', function () { focused = false; });

        // Trackpad sideways swipes and Shift+wheel add momentum (vertical wheel still scrolls the page)
        strip.addEventListener('wheel', function (e) {
            var dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
            if (!dx) return;
            e.preventDefault();
            if (e.deltaMode === 1) dx *= 32; // lines -> px
            kick(dx * WHEEL_GAIN, dx);
        }, { passive: false });

        // Arrow keys when the strip has focus
        strip.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); kick(KEY_KICK, 200); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); kick(-KEY_KICK, -200); }
        });

        // Never let the browser start its own image drag or text selection inside the strip
        strip.addEventListener('dragstart', function (e) { e.preventDefault(); });
        strip.addEventListener('selectstart', function (e) { e.preventDefault(); });

        // Drag with mouse or finger; on release the strip keeps the throw's speed and coasts
        var startX = 0, startPos = 0, samples = [], moved = false;
        strip.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (e.pointerType === 'mouse') e.preventDefault(); // no text selection or image drag from this press
            var sel = window.getSelection && window.getSelection();
            if (sel && sel.rangeCount) sel.removeAllRanges();
            dragging = true; moved = false;
            startX = e.clientX; startPos = pos;
            samples = [{ x: e.clientX, t: e.timeStamp }];
            vel = 0;
            strip.setPointerCapture(e.pointerId);
            strip.classList.add('is-dragging');
        });
        strip.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            var dx = e.clientX - startX;
            if (Math.abs(dx) > 3) moved = true;
            pos = startPos - dx;
            apply();
            startPos = pos + dx; // keep the drag anchored across wraps
            samples.push({ x: e.clientX, t: e.timeStamp });
            if (samples.length > 6) samples.shift();
        });
        function release(e) {
            if (!dragging) return;
            dragging = false;
            strip.classList.remove('is-dragging');
            // Throw speed from the last ~100ms of movement
            var recent = samples.filter(function (s) { return e.timeStamp - s.t < 100; });
            if (recent.length > 1) {
                var a = recent[0], b = recent[recent.length - 1];
                var v = -(b.x - a.x) / Math.max((b.t - a.t) / 1000, 0.016);
                kick(v);
            }
        }
        strip.addEventListener('pointerup', release);
        strip.addEventListener('pointercancel', release);
        // A drag should not also count as a click
        strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

        // Reverse strips start one copy in, so they have room to move left straight away
        pos = base < 0 ? period() : 1;
        apply();
        requestAnimationFrame(frame);
    });
})();
