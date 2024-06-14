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
    repeatButton = wrapper.querySelector("#repeat-plist")
    
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

// Função para determinar a próxima música com base no dia da semana
function getNextMusicIndex() {
    const nextIndex = (musicIndex + 1) % 7; // Calcula o próximo dia da semana
    return nextIndex;
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
    musicIndex >= allMusic.length ? musicIndex = 0 : musicIndex = musicIndex;
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
repeatButton.addEventListener("click", () => {
    let getText = repeatButton.innerText; // Obtém innerText do ícone

    switch (getText) {
        case "repeat": // Caso o ícone seja repeat, mudar para repeat_one
            repeatButton.innerText = "repeat_one";
            repeatButton.setAttribute("title", "Song Looped");
            mainAudio.loop = true; // Define loop como true
            break;
        case "repeat_one": // Caso o ícone seja repeat_one, mudar para shuffle
            repeatButton.innerText = "shuffle";
            repeatButton.setAttribute("title", "Playback Shuffle");
            mainAudio.loop = false; // Define loop como false
            break;
        case "shuffle": // Caso o ícone seja shuffle, mudar para repeat
            repeatButton.innerText = "repeat";
            repeatButton.setAttribute("title", "Playlist Loop");
            mainAudio.loop = false; // Define loop como false
            break;
    }
});

// Repetindo a música
mainAudio.addEventListener("ended", () => {
    // Não faz nada quando a música acaba, já que o loop está definido
});

// Função Exibir e Fechar Playlist
showMoreButton.addEventListener("click", () => {
    highlightNextMusic(); // Destaque a próxima música
    musicList.classList.toggle("show");
});

hideMusicButton.addEventListener("click", () => {
    showMoreButton.click();
});

// Função para destacar a próxima música na lista
function highlightNextMusic() {
    musicIndex++;
    const nextMusicIndex = musicIndex >= allMusic.length ? 0 : musicIndex;
    const allLiTags = ulTag.querySelectorAll("li");
    allLiTags.forEach(li => li.classList.remove("highlight-next"));
    const nextLi = ulTag.querySelector(`li[data-li-index="${nextMusicIndex}"]`);
    if (nextLi) {
        nextLi.classList.add("highlight-next");
    }
}

const ulTag = wrapper.querySelector("ul");

// Cria <li> de acordo com o comprimento do array (Exibindo a Lista de Música)
for (let i = 0; i < allMusic.length; i++) {
    // Passando o nome da música e artista do array para a li
    let liTag = `<li li-index="${i + 1}">
                    <div class="row">
                        <span>${allMusic[i].name}</span>
                        <p>${allMusic[i].artist}</p>
                    </div>
                    <audio class="${allMusic[i].src}" src="music/${allMusic[i].src}.mp3"></audio>
                    <span id="${allMusic[i].src}" class="audio-duration">3:40</span>
                </li>`;
    ulTag.insertAdjacentHTML("beforeend", liTag);

    let liAudioDuration = ulTag.querySelector(`#${allMusic[i].src}`);
    let liAudioTag = ulTag.querySelector(`.${allMusic[i].src}`);

    liAudioTag.addEventListener("loadeddata", () => {
        let audioDuration = liAudioTag.duration;
        let totalMinutes = Math.floor(audioDuration / 60);
        let totalSeconds = Math.floor(audioDuration % 60);
        if (totalSeconds < 10) { // adiciona 0 se os segundos forem menor que 10
            totalSeconds = `0${totalSeconds}`;
        }

        liAudioDuration.innerText = `${totalMinutes}:${totalSeconds}`;
        // Adiciona o atributo t-duration
        liAudioDuration.setAttribute("t-duration", `${totalMinutes}:${totalSeconds}`);
    });
}

// Trocando música específica 
const allLiTags = ulTag.querySelectorAll("li");
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
        if (allLiTags[j].getAttribute("li-index") == musicIndex) {
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

// CSS Adicional para destacar a próxima música
const style = document.createElement('style');
style.innerHTML = `
    .highlight-next {
        background-color: #ff74a4;
        color: white;
    }
`;
document.head.appendChild(style);
