// Seleciona todas as tags ou elementos necessários
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
    allLiTags = ulTag.querySelectorAll("li");

// Carrega música aleatória na atualização da página
const today = new Date().getDay();
let musicIndex = today;

window.addEventListener("load", () => {
    loadMusic(musicIndex); // Chama a função loadMusic() quando a janela é carregada
    playingNow();
    mainAudio.loop = true; // Define o looping como padrão
    repeatButton.innerText = "repeat_one"; // Define o texto inicial do botão como "repeat_one"
    repeatButton.classList.add("material-icons"); // Adiciona a classe do ícone
    repeatButton.setAttribute("title", "Song Looped"); // Define o título inicial
});

// Função que realiza o carregamento da Música
function loadMusic(indexNumb) {
    musicName.innerText = allMusic[indexNumb].name;
    musicArtist.innerText = allMusic[indexNumb].artist;
    mainAudio.src = allMusic[indexNumb].src;

    fetch('https://shouldideploy.today/api?tz=America/Sao_Paulo')
        .then(response => response.json())
        .then(data => {
            const shouldDeploy = data.shouldideploy ? 'YES' : 'NO';
            const message = data.message;
            const messageElement = document.getElementById('message');
            messageElement.innerHTML = `SHOULD I DEPLOY TODAY? <b>${shouldDeploy}</b><br>"${message}"`;

            // Change background color based on shouldideploy value
            if (data.shouldideploy) {
                document.querySelector('.img-area').style.backgroundColor = '#4CAF50'; // Green for YES
            } else {
                document.querySelector('.img-area').style.backgroundColor = '#F44336'; // Red for NO
            }
        });
}


// Função Play
function playMusic() {
    wrapper.classList.add("paused");
    playPauseButton.innerHTML = "<i class='bx bx-pause'></i>";
    mainAudio.play();
}

// Função Pause
function pauseMusic() {
    wrapper.classList.remove("paused");
    playPauseButton.innerHTML = "<i class='bx bx-play'></i>";
    mainAudio.pause();
}

// Função Next (Próximo)
function nextMusic() {
    // Incrementa +1 no index da música
    musicIndex++;
    // Se musicIndex for maior do que o comprimento do total de músicas, então a musicIndex voltará para a primeira música
    musicIndex > allMusic.length ? musicIndex = 1 : musicIndex = musicIndex;
    loadMusic(musicIndex);
    playMusic();
    playingNow();
}

// Arrow Function (Funções de seta que permitem escrever uma sintaxe de função mais curta)
// Botão Play
playPauseButton.addEventListener("click", () => {
    const isMusicPause = wrapper.classList.contains("paused");

    // Se isMusicPaused for verdadeiro, chamar função pauseMusic(), senão chamar função playMusic()
    isMusicPause ? pauseMusic() : playMusic();
    playingNow();
});

// Atualiza a barra de progresso conforme a música rola
mainAudio.addEventListener("timeupdate", (e) => {
    const currentTime = e.target.currentTime; // Obtendo a hora exata da música
    const duration = e.target.duration; // Obtendo a duração total da música

    let progressWidth = (currentTime / duration) * 100;
    progressBar.style.width = `${progressWidth}%`;

    let musicCurrentTime = wrapper.querySelector(".current"),
        musicDuration = wrapper.querySelector(".duration");

    mainAudio.addEventListener("loadeddata", () => {
        // Atualiza a duração total da música
        let audioDuration = mainAudio.duration;
        let totalMinutes = Math.floor(audioDuration / 60); // Convertendo para Minutos
        let totalSeconds = Math.floor(audioDuration % 60); // Convertendo para Segundos
        if (totalSeconds < 10) { // adiciona 0 se os segundos forem menor que 10
            totalSeconds = `0${totalSeconds}`;
        }

        // Exibição dos minutos e segundos totais da música
        musicDuration.innerText = `${totalMinutes}:${totalSeconds}`;
    });

    // Atualiza a reprodução da música com a hora atual
    let currentMinutes = Math.floor(currentTime / 60); // Convertendo para Minutos
    let currentSeconds = Math.floor(currentTime % 60); // Convertendo para Segundos
    if (currentSeconds < 10) { // adiciona 0 se os segundos forem menor que 10
        currentSeconds = `0${currentSeconds}`;
    }

    // Exibição dos minutos e segundos atuais da música
    musicCurrentTime.innerText = `${currentMinutes}:${currentSeconds}`;
});

// Atualiza a reprodução da música com a hora atual de acordo com a largura da barrinha de progresso
progressArea.addEventListener("click", (e) => {
    let progressWidthval = progressArea.clientWidth; // Obtém a largura da barrinha de progresso
    let clickedOffSetX = e.offsetX; // Valor de deslocamento
    let songDuration = mainAudio.duration; // Duração total da música

    mainAudio.currentTime = (clickedOffSetX / progressWidthval) * songDuration;
    playMusic();
});

// Botão de Repetir e Aleatório
const repeatButton = wrapper.querySelector("#repeat-plist");
repeatButton.addEventListener("click", () => {
    let getText = repeatButton.innerText; // Obtém innerText do ícone

    switch (getText) {
        case "repeat": // Caso o ícone seja repeat, mudar para repeat_one
            repeatButton.innerText = "repeat_one";
            repeatButton.setAttribute("title", "Song Looped");
            break;
        case "repeat_one": // Caso o ícone seja reppeat_one, mudar para shuffle
            repeatButton.innerText = "shuffle";
            repeatButton.setAttribute("title", "Playback Shuffle");
            break;
        case "shuffle": // Caso o ícone seja shuffle, mudar para repeat
            repeatButton.innerText = "repeat";
            repeatButton.setAttribute("title", "Playlist Loop");
            break;
    }
});

// Repetindo a música
mainAudio.addEventListener("ended", () => {
    let getText = repeatButton.innerText; // Obtém innerText do ícone

    switch (getText) {
        case "repeat": // Caso este ícone seja repeat, a função nextMusic é chamada para que a próxima música toque
            break;
        case "repeat_one": // Caso este ícone seja repeat_one, então a hora atual da música que está tocando muda para 0, retornando ao ínicio
            mainAudio.currentTime = 0;
            loadMusic(musicIndex);
            playMusic();
            playingNow();
            break;
        case "shuffle": // Caso o ícone seja shuffle, mudar para repeat
            mainAudio.currentTime = 0;
            loadMusic(musicIndex);
            playMusic();
            break;
    }
});

// Função Exibir e Fechar Playlist
showMoreButton.addEventListener("click", () => {
    musicList.classList.toggle("show");
});

hideMusicButton.addEventListener("click", () => {
    showMoreButton.click();
});

// Cria <li> de acordo com o comprimento do array (Exibindo a Lista de Música)
if (today == 6) {
    nextMusicTomorrow = 0;
} else {
    nextMusicTomorrow = today + 1;
}
// Passando o nome da música e artista do array para a li
let liTag = `<li data-src="${allMusic[nextMusicTomorrow].src}" li-index="${nextMusicTomorrow}">
                <div class="row">
                    <span>${allMusic[nextMusicTomorrow].name}</span>
                    <p>${allMusic[nextMusicTomorrow].artist}</p>
                </div>
                <audio class="${allMusic[nextMusicTomorrow].src}" src="${allMusic[nextMusicTomorrow].src}"></audio>
                <span class="audio-duration">1:37</span>
            </li>`;
ulTag.insertAdjacentHTML("beforeend", liTag);

let liAudioTag = ulTag.querySelector(`li[data-src="${allMusic[nextMusicTomorrow].src}"] audio`);
let liAudioDuration = ulTag.querySelector(`li[data-src="${allMusic[nextMusicTomorrow].src}"] .audio-duration`);

liAudioTag.addEventListener("loadeddata", () => {
    let audioDuration = liAudioTag.duration;
    let totalMinutes = Math.floor(audioDuration / 60);
    let totalSeconds = Math.floor(audioDuration % 60);
    if (totalSeconds < 10) { // adiciona 0 se os segundos forem menor que 10
        totalSeconds = `0${totalSeconds}`;
    }
    liAudioDuration.innerText = `${totalMinutes}:${totalSeconds}`;
    liAudioDuration.setAttribute("t-duration", `${totalMinutes}:${totalSeconds}`);
});

// Trocando música específica 
function playingNow() {
    for (let j = 0; j < allLiTags.length; j++) {
        let audioTag = allLiTags[j].querySelector(".audio-duration");
        // Remove a class de playing de todas as outras
        if (allLiTags[j].classList.contains("playing")) {
            allLiTags[j].classList.remove("playing");
            // Pega valor de duração de áudio e passar para .audio-duration innertext
            let adDuration = audioTag.getAttribute("t-duration");
            audioTag.innerText = adDuration; // Passa o valor t-duration para a duração do áudio innerText
        }

        // Se houver uma tag li cujo índice li é igual a musicIndex, então estilizá-la com a classe playing
        if (allLiTags[j].getAttribute("li-index") == musicIndex + 1) {
            allLiTags[j].classList.add("playing");
            audioTag.innerText = "Today";
        }

        // Adiciona o atributo "onclick" em todas as li tags
        allLiTags[j].setAttribute("onclick", "clicked(this)");
    }
}

// Tocando música na tag li
function clicked(element) {
    // Índice li de determinada tag li clicada
    let getLiIndex = element.getAttribute("li-index");
    musicIndex = getLiIndex - 1; // Passando esse índice li para musicIndex
    loadMusic(musicIndex);
    playMusic();
    playingNow();
}

// Dark Mode
const darkMode = document.querySelector('.dark-mode'),
    body = document.querySelector('.page');

darkMode.onclick = () => {
    body.classList.toggle('is-dark');
}