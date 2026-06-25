# Today
## Overview

**Today** is a simple web application that displays a daily message and plays a corresponding audio file. This project aims to provide users with a positive and motivational daily experience.

## How to Run

Visit the live site at [Golden Today](https://golden-today.vercel.app/)

## Features

- "Should I deploy today?" status message, fetched live from the [shouldideploy.today](https://shouldideploy.today) API
- A different audio track for each day of the week, played automatically
- Loop toggle for the daily song
- Dark mode — automatic (device preference) with a manual toggle
- Keyboard-accessible, screen-reader-friendly controls
- Responsive design for mobile and tablet

## Project Structure

```plaintext
today/
├── .github/
│   └── dependabot.yml
├── src/
│   ├── audio/              # one track per weekday (sunday.mp3 … saturday.mp3)
│   ├── img/
│   │   └── coffee.png
│   ├── js/
│   │   ├── music-list.js   # daily audio file paths
│   │   ├── script.js       # player, dark mode, accessibility
│   │   └── site.webmanifest
│   ├── index.html
│   └── styles.css
├── README.md
└── SECURITY.md
```

- `src/`: Contains the source files for the project.
  - `audio/`: Contains the audio files.
  - `js/script.js`: The JavaScript file that handles the functionality of the web app, including the dark mode toggle.
  - `js/music-list.js`: The JavaScript file that contains the daily audio file paths.
  - `index.html`: The main HTML file.
  - `styles.css`: The CSS file that styles the web app and defines the dark mode styles.

<br>

-----  
<br>
<small style="font-size: 12px;">References:</small><br>
<small style="font-size: 12px;">The design of this project was enhanced from the projects:</small><br>
<small style="font-size: 12px;">&bull;</small> <a target="_blank" href="https://github.com/baires/shouldideploy" style="font-size: 12px;">Should I Deploy?</a><br>
<small style="font-size: 12px;">&bull;</small> <a target="_blank" href="https://github.com/PedroCantanhede/music-player" style="font-size: 12px;">Music Player</a>
