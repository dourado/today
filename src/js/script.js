// Select all the required tags / elements
const wrapper = document.querySelector(".wrapper"),
    musicImage = wrapper.querySelector(".img-area img"),
    musicName = wrapper.querySelector(".song-details .name"),
    musicArtist = wrapper.querySelector(".song-details .artist"),
    mainAudio = wrapper.querySelector("#main-audio"),
    playPauseButton = wrapper.querySelector(".play-pause"),
    progressArea = wrapper.querySelector(".progress-area"),
    progressBar = wrapper.querySelector(".progress-bar"),
    musicList = wrapper.querySelector(".music-list"),
    showMoreButton = wrapper.querySelector("#more-music"),
    hideMusicButton = musicList.querySelector("#close"),
    ulTag = wrapper.querySelector("ul"),
    dropdownToggle = document.querySelector("#dropdown-toggle"),
    dropdownContent = document.querySelector(".dropdown-content");

// Show / hide the dropdown content
dropdownToggle.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the icon click from closing the dropdown
    dropdownContent.classList.toggle("show-dropdown");
});

// Close the dropdown when clicking outside of it
document.addEventListener("click", (event) => {
    if (!dropdownToggle.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdownContent.classList.remove("show-dropdown");
    }
});

// Pick the day's song on page load
const today = new Date().getDay();
let musicIndex = today;

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
                document.querySelector('.img-area').style.backgroundColor = '#50fa7b'; // Green for YES
                document.querySelector('.text-area').style.color = '#515c6f'; // Green for YES
                document.querySelector('body').style.backgroundColor = '#50fa7b'; // Green for YES
            } else {
                document.querySelector('.img-area').style.backgroundColor = '#ff5555'; // Red for NO
                document.querySelector('body').style.backgroundColor = '#ff5555'; // Red for NO
            }
        })
        .catch(() => {
            // Network failure / API down: don't leave the UI empty
            renderDeployMessage(messageElement, '?', "Couldn't check right now.");
        });
}

// Play
function playMusic() {
    wrapper.classList.add("paused");
    playPauseButton.innerHTML = "<i class='bx bx-pause'></i>";
    mainAudio.play();
}

// Pause
function pauseMusic() {
    wrapper.classList.remove("paused");
    playPauseButton.innerHTML = "<i class='bx bx-play'></i>";
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

    let musicCurrentTime = wrapper.querySelector(".current");

    // Update the current playback time
    let currentMinutes = Math.floor(currentTime / 60); // Convert to minutes
    let currentSeconds = Math.floor(currentTime % 60); // Convert to seconds
    if (currentSeconds < 10) { // add a leading 0 if seconds < 10
        currentSeconds = `0${currentSeconds}`;
    }

    // Show the current minutes and seconds
    musicCurrentTime.innerText = `${currentMinutes}:${currentSeconds}`;
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

// Seek the song based on where the progress bar was clicked
progressArea.addEventListener("click", (e) => {
    let progressWidthval = progressArea.clientWidth; // Progress bar width
    let clickedOffSetX = e.offsetX; // Click offset
    let songDuration = mainAudio.duration; // Total song duration

    // Only seek when duration and width are usable; avoids a NaN/Infinity currentTime.
    if (isFinite(songDuration) && songDuration > 0 && progressWidthval > 0) {
        mainAudio.currentTime = (clickedOffSetX / progressWidthval) * songDuration;
    }
    playMusic();
});

// Loop toggle: two states only — repeat_one (loop the day's song) and
// no_loop (the default). Reflects state on the icon, title and aria-pressed.
const repeatButton = wrapper.querySelector("#repeat-plist");

function setLoopState(loopOn) {
    mainAudio.loop = loopOn;
    repeatButton.innerText = "repeat_one";
    repeatButton.classList.toggle("inactive", !loopOn); // dim when no loop
    repeatButton.setAttribute("aria-pressed", loopOn);
    repeatButton.setAttribute("title", loopOn ? "Song Looped" : "No Loop");
}

repeatButton.addEventListener("click", () => {
    setLoopState(!mainAudio.loop);
});

// Show / hide the playlist
showMoreButton.addEventListener("click", () => {
    musicList.classList.toggle("show");
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
let liTag = `<li data-src="${allMusic[nextMusicTomorrow].src}" li-index="${nextMusicTomorrow}">
                <div class="row">
                    <span>${allMusic[nextMusicTomorrow].name}</span>
                    <p>${allMusic[nextMusicTomorrow].artist}</p>
                </div>
                <audio class="${allMusic[nextMusicTomorrow].src}" src="${allMusic[nextMusicTomorrow].src}"></audio>
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
    liAudioDuration.setAttribute("t-duration", `${totalMinutes}:${totalSeconds}`);
});

// The list item previews tomorrow's song, but — since it's one song per
// day — activating it just restarts the day's song, like the next/prev buttons.
const tomorrowLi = ulTag.querySelector("li");
tomorrowLi.setAttribute("role", "button");
tomorrowLi.setAttribute("tabindex", "0");
tomorrowLi.setAttribute("aria-label", "Play today's song");
tomorrowLi.addEventListener("click", replayCurrentMusic);

// Dark Mode
const darkMode = document.querySelector('.dark-mode'),
    body = document.querySelector('.page');

// Keep the toggle's aria-pressed in sync with the theme state (a11y)
function syncDarkModePressed() {
    darkMode.setAttribute('aria-pressed', body.classList.contains('is-dark'));
}

darkMode.onclick = () => {
    body.classList.toggle('is-dark');
    syncDarkModePressed();
}

// Check the user's color preference
const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply the 'is-dark' class if the preference is for dark mode
if (userPrefersDark) {
    body.classList.add('is-dark');
}
syncDarkModePressed(); // Initial state

// Listen for changes in the color preference (guard matchMedia for older browsers)
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
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
    const target = e.target.closest('[role="button"]');
    if (!target) return;
    e.preventDefault();
    target.click();
});
