document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const messageElement = document.getElementById('message');

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
    } else {
        audioPlayer.innerHTML = "Nenhum áudio disponível para hoje.";
    }

    // Fetch the message from the API
    fetch('https://shouldideploy.today/api?tz=Brazil/DeNoronha')
        .then(response => response.json())
        .then(data => {
            const shouldDeploy = data.shouldideploy ? 'YES' : 'NO';
            const message = data.message;
            messageElement.innerHTML = `SHOULD I DEPLOY TODAY? <b>${shouldDeploy}</b><br>"${message}"`;
        })
        .catch(error => {
            messageElement.textContent = "Não foi possível carregar a mensagem.";
            console.error('Error fetching the API:', error);
        });
});
