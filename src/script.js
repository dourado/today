document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const messageElement = document.getElementById('message');
    const container = document.getElementById('container');

    const audioFiles = {
        0: 'audio/sunday.mp3',
        1: 'audio/monday.mp3',
        2: 'audio/tuesday.mp3',
        3: 'audio/wednesday.mp3',
        4: 'audio/thursday.mp3',
        5: 'audio/friday.mp3',
        6: 'audio/saturday.mp3'
    };

    const today = new Date().getDay();
    const audioSrc = audioFiles[today];

    if (audioSrc) {
        audioPlayer.src = audioSrc;
        audioPlayer.load();
        audioPlayer.play().catch(error => {
            console.error('Autoplay error:', error);
        });
    } else {
        audioPlayer.innerHTML = "Nenhum áudio disponível para hoje.";
    }

    // Fetch the message from the API
    fetch('https://shouldideploy.today/api?tz=America/Sao_Paulo')
        .then(response => response.json())
        .then(data => {
            const shouldDeploy = data.shouldideploy ? 'YES' : 'NO';
            const message = data.message;
            messageElement.innerHTML = `SHOULD I DEPLOY TODAY? <b>${shouldDeploy}</b><br>"${message}"`;

            // Change background color based on shouldideploy value
            if (data.shouldideploy) {
                document.body.classList.add('background-yes');
                container.classList.add('container-yes');
            } else {
                document.body.classList.add('background-no');
                container.classList.add('container-no');
            }
        })
        .catch(error => {
            messageElement.textContent = "Não foi possível carregar a mensagem.";
            console.error('Error fetching the API:', error);
        });

    document.addEventListener('click', function() {
        audioPlayer.muted = false;
        audioPlayer.play().catch(error => {
            console.error('Play button error:', error);
        });
    });
});