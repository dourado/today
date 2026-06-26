// Select all the required tags / elements
const wrapper = document.querySelector(".wrapper"),
    musicName = wrapper.querySelector(".song-details .name"),
    musicArtist = wrapper.querySelector(".song-details .artist"),
    mainAudio = wrapper.querySelector("#main-audio"),
    playPauseButton = wrapper.querySelector(".play-pause"),
    progressArea = wrapper.querySelector(".progress-area"),
    progressBar = wrapper.querySelector(".progress-bar"),
    currentTimeEl = wrapper.querySelector(".current"),
    musicList = wrapper.querySelector(".music-list"),
    showMoreButton = wrapper.querySelector("#more-music"),
    hideMusicButton = musicList.querySelector("#close"),
    ulTag = wrapper.querySelector("ul"),
    dropdownToggle = document.querySelector("#dropdown-toggle"),
    dropdownContent = document.querySelector(".dropdown-content");

// Show / hide the dropdown content
dropdownToggle.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the icon click from closing the dropdown
    const isOpen = dropdownContent.classList.toggle("show-dropdown");
    dropdownToggle.setAttribute("aria-expanded", isOpen);
});

// Close the dropdown when clicking outside of it
document.addEventListener("click", (event) => {
    if (!dropdownToggle.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdownContent.classList.remove("show-dropdown");
        dropdownToggle.setAttribute("aria-expanded", "false");
    }
});

// Pick the day's song on page load
const today = new Date().getDay();
const musicIndex = today;

window.addEventListener("load", () => {
    loadMusic(musicIndex); // Call loadMusic() when the window loads
    fetchDeployStatus();   // Fetch the day's deploy status (once)
    setLoopState(false); // No loop is the default
});

// Loads the current song
function loadMusic(indexNumb) {
    musicName.innerText = allMusic[indexNumb].name;
    musicArtist.innerText = allMusic[indexNumb].artist;
    mainAudio.src = allMusic[indexNumb].src;
}

// Build the deploy message with a fixed structure and the dynamic text via
// textContent, avoiding HTML injection if the API returns markup (XSS).
function renderDeployMessage(el, answer, quote) {
    el.replaceChildren();
    el.append("SHOULD I DEPLOY TODAY? ");
    const strong = document.createElement("b");
    strong.textContent = answer;
    el.append(strong, document.createElement("br"), `"${quote}"`);
}

// Fetch the day's deploy status and update the message + UI colors
function fetchDeployStatus() {
    const messageElement = document.getElementById('message');

    fetch('https://shouldideploy.today/api?tz=America/Sao_Paulo')
        .then(response => response.json())
        .then(data => {
            const shouldDeploy = data.shouldideploy ? 'YES' : 'NO';
            const message = data.message;
            renderDeployMessage(messageElement, shouldDeploy, message);

            // Change background color based on shouldideploy value
            if (data.shouldideploy) {
                document.querySelector('.img-area').style.backgroundColor = '#50fa7b'; // Dracula green (YES)
                document.querySelector('.text-area').style.color = '#282a36'; // Dracula bg — dark text on green
                document.querySelector('body').style.backgroundColor = '#50fa7b';
            } else {
                document.querySelector('.img-area').style.backgroundColor = '#ff5555'; // Dracula red (NO)
                document.querySelector('.text-area').style.color = '#f8f8f2'; // light text on red
                document.querySelector('body').style.backgroundColor = '#ff5555';
            }
        })
        .catch(() => {
            // Network failure / API down: show a visible, neutral fallback (the
            // message would otherwise be white text on no background)
            renderDeployMessage(messageElement, '?', "Couldn't check right now.");
            document.querySelector('.img-area').style.backgroundColor = '#6272a4'; // Dracula comment (neutral)
            document.querySelector('.text-area').style.color = '#f8f8f2';
            document.querySelector('body').style.backgroundColor = '#6272a4';
        });
}

// Play
function playMusic() {
    wrapper.classList.add("paused");
    playPauseButton.innerHTML = "<i class='material-symbols-rounded'>pause_circle</i>";
    playPauseButton.setAttribute("aria-pressed", "true");
    // play() may not return a promise on very old browsers — guard before .catch
    const playback = mainAudio.play();
    if (playback) {
        playback.catch((err) => {
            if (err.name === "AbortError") return; // benign: play cut off by a quick pause
            console.warn("Playback failed:", err);
            pauseMusic(); // roll back the UI — nothing is actually playing
        });
    }
}

// Pause
function pauseMusic() {
    wrapper.classList.remove("paused");
    playPauseButton.innerHTML = "<i class='material-symbols-rounded'>play_circle</i>";
    playPauseButton.setAttribute("aria-pressed", "false");
    mainAudio.pause();
}

// Since it's one song per day, next/prev don't change track:
// they just restart the day's song from the beginning.
function replayCurrentMusic() {
    // Only seek once metadata has loaded; otherwise it can throw InvalidStateError.
    if (mainAudio.readyState > 0) {
        mainAudio.currentTime = 0;
    }
    playMusic();
}

// Next / Previous buttons — restart the day's song
const prevButton = wrapper.querySelector("#prev"),
    nextButton = wrapper.querySelector("#next");

prevButton.addEventListener("click", replayCurrentMusic);
nextButton.addEventListener("click", replayCurrentMusic);

// Play / Pause button
playPauseButton.addEventListener("click", () => {
    // The "paused" class is present while the song is playing (added in
    // playMusic, removed in pauseMusic), so it reflects the playing state.
    const isPlaying = wrapper.classList.contains("paused");

    // If it's playing, pause it; otherwise play.
    isPlaying ? pauseMusic() : playMusic();
});

// Update the progress bar as the song plays
mainAudio.addEventListener("timeupdate", (e) => {
    const currentTime = e.target.currentTime; // Current playback time
    const duration = e.target.duration; // Total song duration

    // Only update the bar when duration is known; avoids width: NaN%.
    if (isFinite(duration) && duration > 0) {
        let progressWidth = (currentTime / duration) * 100;
        progressBar.style.width = `${progressWidth}%`;
    }

    // Update the current playback time
    let currentMinutes = Math.floor(currentTime / 60); // Convert to minutes
    let currentSeconds = Math.floor(currentTime % 60); // Convert to seconds
    if (currentSeconds < 10) { // add a leading 0 if seconds < 10
        currentSeconds = `0${currentSeconds}`;
    }

    // Show the current minutes and seconds
    currentTimeEl.innerText = `${currentMinutes}:${currentSeconds}`;
});

// Update the total duration once the song data loads (registered ONCE)
mainAudio.addEventListener("loadeddata", () => {
    let musicDuration = wrapper.querySelector(".duration");
    let audioDuration = mainAudio.duration;
    let totalMinutes = Math.floor(audioDuration / 60); // Convert to minutes
    let totalSeconds = Math.floor(audioDuration % 60); // Convert to seconds
    if (totalSeconds < 10) { // add a leading 0 if seconds < 10
        totalSeconds = `0${totalSeconds}`;
    }

    // Show the total minutes and seconds
    musicDuration.innerText = `${totalMinutes}:${totalSeconds}`;
});

// When the track ends (only fires with looping off), reset to the start and show
// the play button — otherwise the UI stays stuck in the "playing" state.
mainAudio.addEventListener("ended", () => {
    if (mainAudio.readyState > 0) mainAudio.currentTime = 0;
    pauseMusic();
});

// Seek the song based on where the progress bar was clicked
progressArea.addEventListener("click", (e) => {
    // Use the click position relative to the bar so clicking the filled portion
    // (a child element) still seeks correctly — e.offsetX would be child-relative.
    const rect = progressArea.getBoundingClientRect();
    const clickedOffsetX = e.clientX - rect.left;
    const songDuration = mainAudio.duration;

    // Only seek when duration and width are usable; avoids a NaN/Infinity currentTime.
    if (isFinite(songDuration) && songDuration > 0 && rect.width > 0) {
        mainAudio.currentTime = (clickedOffsetX / rect.width) * songDuration;
    }
    playMusic();
});

// Loop toggle: two states — looping the day's song or not (no_loop is the
// default). The single `repeat` glyph is colored when active and greyed when
// off (driven by aria-pressed in CSS).
const repeatButton = wrapper.querySelector("#repeat-plist");

function setLoopState(loopOn) {
    mainAudio.loop = loopOn;
    repeatButton.setAttribute("aria-pressed", loopOn);
    repeatButton.setAttribute("title", loopOn ? "Song Looped" : "No Loop");
}

repeatButton.addEventListener("click", () => {
    setLoopState(!mainAudio.loop);
});

// Show / hide the playlist
showMoreButton.addEventListener("click", () => {
    const isOpen = musicList.classList.toggle("show");
    showMoreButton.setAttribute("aria-expanded", isOpen);
});

hideMusicButton.addEventListener("click", () => {
    showMoreButton.click();
});

// Build the <li> for the playlist (tomorrow's song preview)
let nextMusicTomorrow;
if (today == 6) {
    nextMusicTomorrow = 0;
} else {
    nextMusicTomorrow = today + 1;
}
// Pass the song name and artist from the array into the li
let liTag = `<li data-src="${allMusic[nextMusicTomorrow].src}">
                <div class="row">
                    <span>${allMusic[nextMusicTomorrow].name}'s Song</span>
                    <p>${allMusic[nextMusicTomorrow].artist}</p>
                </div>
                <audio src="${allMusic[nextMusicTomorrow].src}"></audio>
                <span class="audio-duration">--:--</span>
            </li>`;
ulTag.insertAdjacentHTML("beforeend", liTag);

let liAudioTag = ulTag.querySelector(`li[data-src="${allMusic[nextMusicTomorrow].src}"] audio`);
let liAudioDuration = ulTag.querySelector(`li[data-src="${allMusic[nextMusicTomorrow].src}"] .audio-duration`);

liAudioTag.addEventListener("loadeddata", () => {
    let audioDuration = liAudioTag.duration;
    let totalMinutes = Math.floor(audioDuration / 60);
    let totalSeconds = Math.floor(audioDuration % 60);
    if (totalSeconds < 10) { // add a leading 0 if seconds < 10
        totalSeconds = `0${totalSeconds}`;
    }
    liAudioDuration.innerText = `${totalMinutes}:${totalSeconds}`;
});

// The list item previews tomorrow's song, but — since it's one song per
// day — activating it just restarts the day's song, like the next/prev buttons.
const tomorrowLi = ulTag.querySelector("li");
tomorrowLi.setAttribute("role", "button");
tomorrowLi.setAttribute("tabindex", "0");
tomorrowLi.setAttribute("aria-label", `${allMusic[nextMusicTomorrow].name}'s Song — play today's song`);
tomorrowLi.addEventListener("click", replayCurrentMusic);

// Dark Mode
const darkMode = document.querySelector('.dark-mode'),
    body = document.querySelector('.page');

// Keep the toggle's aria-pressed in sync with the theme state (a11y)
function syncDarkModePressed() {
    darkMode.setAttribute('aria-pressed', body.classList.contains('is-dark'));
}

darkMode.addEventListener('click', () => {
    body.classList.toggle('is-dark');
    syncDarkModePressed();
});

// Cache the prefers-color-scheme query (may be absent in older browsers)
const darkModeQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

// Apply the 'is-dark' class if the preference is for dark mode
if (darkModeQuery && darkModeQuery.matches) {
    body.classList.add('is-dark');
}
syncDarkModePressed(); // Initial state

// Listen for changes in the color preference
if (darkModeQuery) {
    darkModeQuery.addEventListener('change', e => {
        if (e.matches) {
            body.classList.add('is-dark');
        } else {
            body.classList.remove('is-dark');
        }
        syncDarkModePressed();
    });
}

// Accessibility: activate any role="button" element with Enter/Space,
// including dynamically inserted ones (event delegation on document).
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.repeat) return; // ignore auto-repeat while a key is held
    if (!(e.target instanceof Element)) return; // target may be a non-Element EventTarget
    const target = e.target.closest('[role="button"]');
    if (!target) return;
    e.preventDefault();
    target.click();
});
