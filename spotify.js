/* ===== ORIGINAL LOGIN MODAL CODE (kept as-is) ===== */
document.getElementById('login').onclick = function () {
    document.getElementById('signupForm').style.display = "block";
}
document.getElementsByClassName('close')[0].onclick = function () {
    document.getElementById('signupForm').style.display = "none";
}
window.onclick = function (event) {
    if (event.target == document.getElementById('signupForm')) {
        document.getElementById('signupForm').style.display = "none";
    }
}
function showAlert() {
    Swal.fire({
        title: 'Login Successful',
        text: 'Welcome back!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

/* ===== NEW: REAL AUDIO PLAYER ===== */

// Demo tracks (royalty-free, safe to use for testing/demo purposes).
// Swap these src values for your own .mp3 files any time — e.g. "assets/songs/1.mp3".
const DEMO_TRACKS = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
];

// One shared <audio> element, created in JS so you don't have to touch the HTML.
const audio = new Audio();
audio.volume = 0.7;

// Build a playlist by reading every ".card" already in your HTML
// (Recently played, Featured charts, Trending now) and pairing each
// one with a demo track in rotation.
const playlist = [];
document.querySelectorAll('.card').forEach((card, i) => {
    const titleEl = card.querySelector('#card-info');
    const img = card.querySelector('img.card-img-top');
    const playLink = card.querySelector('#playbar a');

    if (!titleEl || !playLink) return;

    const track = {
        title: titleEl.textContent.trim(),
        cover: img ? img.src : "",
        src: DEMO_TRACKS[i % DEMO_TRACKS.length],
    };
    playlist.push(track);

    // Stop the old behaviour (opening real Spotify in a new tab)
    // and play locally instead.
    playLink.addEventListener('click', (e) => {
        e.preventDefault();
        playTrackAt(playlist.indexOf(track));
    });
});

let currentIndex = -1;

function playTrackAt(index) {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;
    const track = playlist[currentIndex];

    audio.src = track.src;
    audio.play();

    updateNowPlayingBar(track);
    setPlayIcon(true);
}

function updateNowPlayingBar(track) {
    const npImg = document.querySelector('#music .card1 img');
    const npTitle = document.querySelector('#music #card-info1');
    const npArtist = document.querySelector('#music .card-text1');

    if (npImg) npImg.src = track.cover;
    if (npTitle) npTitle.textContent = track.title;
    if (npArtist) npArtist.textContent = "Now Playing";
}

/* ---- Play / Pause button (3rd icon in the bottom-center control row) ---- */
const controlIcons = document.querySelectorAll('#p2 img');
const playPauseBtn = controlIcons[2]; // player_icon1, player_icon2, [play_musicbar], player_icon4, player_icon5
const prevBtn = controlIcons[1];
const nextBtn = controlIcons[3];

function setPlayIcon(isPlaying) {
    if (!playPauseBtn) return;
    playPauseBtn.style.opacity = isPlaying ? "1" : "0.6";
    playPauseBtn.alt = isPlaying ? "Pause" : "Play";
}

if (playPauseBtn) {
    playPauseBtn.style.cursor = "pointer";
    playPauseBtn.addEventListener('click', () => {
        if (!audio.src) {
            // nothing loaded yet — start the first track
            if (playlist.length) playTrackAt(0);
            return;
        }
        if (audio.paused) {
            audio.play();
            setPlayIcon(true);
        } else {
            audio.pause();
            setPlayIcon(false);
        }
    });
}

if (nextBtn) {
    nextBtn.style.cursor = "pointer";
    nextBtn.addEventListener('click', () => {
        if (!playlist.length) return;
        playTrackAt((currentIndex + 1) % playlist.length);
    });
}

if (prevBtn) {
    prevBtn.style.cursor = "pointer";
    prevBtn.addEventListener('click', () => {
        if (!playlist.length) return;
        playTrackAt((currentIndex - 1 + playlist.length) % playlist.length);
    });
}

/* ---- Progress bar (.p4) synced to real playback ---- */
const progressBar = document.querySelector('.p4');
const ctimeEl = document.querySelector('.ctime');
const etimeEl = document.querySelector('.etime');

function formatTime(seconds) {
    if (!isFinite(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

audio.addEventListener('loadedmetadata', () => {
    if (etimeEl) etimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    if (progressBar && audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
    if (ctimeEl) ctimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('ended', () => {
    if (playlist.length) playTrackAt((currentIndex + 1) % playlist.length);
});

if (progressBar) {
    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
    });
}

/* ---- Volume slider (.p6) ---- */
const volumeBar = document.querySelector('.p6');
if (volumeBar) {
    volumeBar.value = 70;
    volumeBar.addEventListener('input', () => {
        audio.volume = volumeBar.value / 100;
    });
}

/* ---- Real search filter across all song/artist cards ---- */
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        document.querySelectorAll('.card').forEach(card => {
            const title = card.querySelector('#card-info')?.textContent.toLowerCase() || "";
            const subtitle = card.querySelector('.card-text')?.textContent.toLowerCase() || "";
            const matches = title.includes(query) || subtitle.includes(query);
            card.style.display = matches ? "" : "none";
        });
    });
}

/* ---- Existing "browse playlist" shortcut icon ---- */
const gl = document.querySelector('#gl');
if (gl) {
    gl.addEventListener('click', () => {
        searchInput?.focus();
    });
}