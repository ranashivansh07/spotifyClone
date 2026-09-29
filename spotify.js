/* ===== 1. AUTH & MODAL CONTROLS ===== */
const loginIcon = document.getElementById('login-icon');
const signupModal = document.getElementById('signupForm');
const closeBtn = document.querySelector('.close-btn');
const loginForm = document.getElementById('login-form');

if (loginIcon) {
    loginIcon.onclick = () => signupModal.style.display = "flex";
}
if (closeBtn) {
    closeBtn.onclick = () => signupModal.style.display = "none";
}
window.onclick = (event) => {
    if (event.target === signupModal) signupModal.style.display = "none";
};

if (loginForm) {
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        signupModal.style.display = "none";
        Swal.fire({
            title: 'Welcome Back!',
            text: 'Signed in successfully to Spotify Clone.',
            icon: 'success',
            confirmButtonColor: '#1ed760'
        });
    };
}

/* ===== 2. DEEZER API SEARCH INTEGRATION ===== */
let debounceTimer;

async function fetchiTunesSongs(query, autoPlayFirst = false) {
    if (!query.trim()) return;

    // Direct, official iTunes API — no CORS proxy required
    const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=20`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            renderSearchSongs(data.results);

            if (autoPlayFirst) {
                const firstSong = data.results[0];
                playTrack({
                    title: firstSong.trackName,
                    artist: firstSong.artistName,
                    cover: firstSong.artworkUrl100.replace('100x100bb', '300x300bb'),
                    src: firstSong.previewUrl
                });
            }
        }
    } catch (error) {
        console.error('iTunes API error:', error);
    }
}

function renderSearchSongs(songs) {
    const trendingGrid = document.getElementById('trending-grid');
    const trendHeading = document.getElementById('trend');
    
    // Select the Recently Played section container or grid
    const recentlyPlayedGrid = document.getElementById('recently-played-grid');
    const recentlyPlayedSection = recentlyPlayedGrid ? recentlyPlayedGrid.closest('section') : null;

    // Hide Recently Played section when showing search results
    if (recentlyPlayedSection) {
        recentlyPlayedSection.style.display = 'none';
    } else if (recentlyPlayedGrid) {
        recentlyPlayedGrid.style.display = 'none';
    }

    if (!trendingGrid) return;

    if (trendHeading) trendHeading.textContent = "Search Results";

    trendingGrid.innerHTML = ''; // Clear trending grid for search results
    currentPlaylist = []; 

    songs.forEach((song, index) => {
        const coverUrl = song.artworkUrl100 ? song.artworkUrl100.replace('100x100bb', '300x300bb') : '';

        const trackObj = {
            title: song.trackName || "Unknown Track",
            artist: song.artistName || "Unknown Artist",
            cover: coverUrl,
            src: song.previewUrl,
            index: index
        };

        if (trackObj.src) {
            currentPlaylist.push(trackObj);

            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.src = song.previewUrl;

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${coverUrl}" class="card-img-top" alt="${trackObj.title}">
                    <div class="playbar-overlay">
                        <button class="play-btn-overlay"><i class="fa-solid fa-play"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <p class="card-title">${trackObj.title}</p>
                    <p class="card-text">${trackObj.artist}</p>
                </div>
            `;

            card.addEventListener('click', () => {
                currentIndex = currentPlaylist.indexOf(trackObj);
                playTrack(trackObj);
            });

            trendingGrid.appendChild(card);
        }
    });
}

/* ===== 3. SINGER / ARTIST CLICK HANDLER ===== */
function initializeArtistClicks() {
    const artistItems = document.querySelectorAll('.artist-item');
    const searchInput = document.getElementById('search-input');

    artistItems.forEach(item => {
        item.addEventListener('click', () => {
            const artistName = item.dataset.artist || item.querySelector('.artist-name')?.textContent;

            if (artistName) {
                if (searchInput) searchInput.value = artistName;
                fetchiTunesSongs(artistName, true); // Search and play singer top track
            }
        });
    });
}

/* Single Initialization Block at bottom of spotify.js */
document.addEventListener('DOMContentLoaded', () => {
    initializeStaticCards();
    initializeArtistClicks();

    const searchInput = document.getElementById('search-input');
    let debounceTimer;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (query === '') {
                location.reload(); 
                return;
            }

            debounceTimer = setTimeout(() => {
                fetchiTunesSongs(query, false);
            }, 400);
        });
    }
});

/* ===== 4. AUDIO PLAYER CONTROLLER ENGINE ===== */
const audio = new Audio();
let isPlaying = false;
let currentPlaylist = [];
let currentIndex = -1;

// Player UI Elements
const masterPlayBtn = document.getElementById('master-play');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const nowPlayingImg = document.getElementById('now-playing-img');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingArtist = document.getElementById('now-playing-artist');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Initialize Local Static Track Cards
function initializeStaticCards() {
    const staticCards = document.querySelectorAll('.card');
    currentPlaylist = [];

    staticCards.forEach((card, index) => {
        const title = card.querySelector('.card-title')?.textContent || "Unknown";
        const artist = card.querySelector('.card-text')?.textContent || "Artist";
        const cover = card.querySelector('.card-img-top')?.src || "";
        const src = card.dataset.src;

        const trackObj = { title, artist, cover, src, index };
        currentPlaylist.push(trackObj);

        card.addEventListener('click', () => {
            currentIndex = index;
            playTrack(trackObj);
        });
    });
}

function playTrack(track) {
    if (!track || !track.src) return;

    audio.src = track.src;
    audio.play().catch(err => console.log("Playback error or user interaction needed:", err));
    isPlaying = true;

    // Update Bottom Player UI
    if (nowPlayingImg) nowPlayingImg.src = track.cover;
    if (nowPlayingTitle) nowPlayingTitle.textContent = track.title;
    if (nowPlayingArtist) nowPlayingArtist.textContent = track.artist;
    
    updatePlayIcon(true);
}

function togglePlay() {
    if (!audio.src) {
        if (currentPlaylist.length > 0) playTrack(currentPlaylist[0]);
        return;
    }

    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        updatePlayIcon(false);
    } else {
        audio.play();
        isPlaying = true;
        updatePlayIcon(true);
    }
}

function updatePlayIcon(playing) {
    if (masterPlayBtn) {
        masterPlayBtn.innerHTML = playing ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/* Event Listeners for Player Controls */
if (masterPlayBtn) masterPlayBtn.addEventListener('click', togglePlay);

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        if (progressBar) progressBar.value = progress;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
    }
});

audio.addEventListener('ended', () => {
    if (currentPlaylist.length > 0) {
        currentIndex = (currentIndex + 1) % currentPlaylist.length;
        playTrack(currentPlaylist[currentIndex]);
    }
});

if (progressBar) {
    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
    });
}

if (volumeBar) {
    audio.volume = volumeBar.value / 100;
    volumeBar.addEventListener('input', () => {
        audio.volume = volumeBar.value / 100;
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (currentPlaylist.length === 0) return;
        currentIndex = (currentIndex + 1) % currentPlaylist.length;
        playTrack(currentPlaylist[currentIndex]);
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentPlaylist.length === 0) return;
        currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        playTrack(currentPlaylist[currentIndex]);
    });
}

/* ===== 5. CLEAN SINGLE INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', () => {
    initializeStaticCards();
    initializeArtistClicks();

    const searchInput = document.getElementById('search-input');
    const trendHeading = document.getElementById('trend');
    const recentlyPlayedGrid = document.getElementById('recently-played-grid');
    const recentlyPlayedSection = recentlyPlayedGrid ? recentlyPlayedGrid.closest('section') : null;
    
    let debounceTimer;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (query === '') {
                // Restore Recently Played section when search is cleared
                if (recentlyPlayedSection) {
                    recentlyPlayedSection.style.display = 'block';
                } else if (recentlyPlayedGrid) {
                    recentlyPlayedGrid.style.display = 'grid';
                }

                if (trendHeading) trendHeading.textContent = "Trending now for you";
                
                location.reload(); 
                return;
            }

            debounceTimer = setTimeout(() => {
                fetchiTunesSongs(query, false);
            }, 400);
        });
    }
});