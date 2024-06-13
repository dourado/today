document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const messageElement = document.getElementById('message');
    const container = document.getElementById('container');
    const daySelector = document.getElementById('daySelector');

    const audioFiles = {
        0: 'audio/sunday.mp3',
        1: 'audio/monday.mp3',
        2: 'audio/tuesday.mp3',
        3: 'audio/wednesday.mp3',
        4: 'audio/thursday.mp3',
        5: 'audio/friday.mp3',
        6: 'audio/saturday.mp3'
    };

    function updateContent(day) {
        const audioSrc = audioFiles[day];
        
        if (audioSrc) {
            audioPlayer.src = audioSrc;
            audioPlayer.load();
            audioPlayer.play().catch(error => {
                console.error('Autoplay error:', error);
            });
        } else {
            audioPlayer.innerHTML = "Nenhum áudio disponível para hoje.";
        }

        fetch('https://shouldideploy.today/api?tz=Brazil/DeNoronha')
            .then(response => response.json())
            .then(data => {
                const shouldDeploy = data.shouldideploy ? 'yes' : 'no';
                const message = data.message;
                messageElement.innerHTML = `shouldideploytoday? <b>${shouldDeploy}</b>,<br>"${message}"`;

                // Change background color based on shouldideploy value
                if (data.shouldideploy) {
                    document.body.classList.add('background-yes');
                    document.body.classList.remove('background-no');
                    container.classList.add('container-yes');
                    container.classList.remove('container-no');
                } else {
                    document.body.classList.add('background-no');
                    document.body.classList.remove('background-yes');
                    container.classList.add('container-no');
                    container.classList.remove('container-yes');
                }
            })
            .catch(error => {
                messageElement.textContent = "Não foi possível carregar a mensagem.";
                console.error('Error fetching the API:', error);
            });
    }

    daySelector.addEventListener('change', function() {
        updateContent(daySelector.value);
    });

    // Initialize with the current day
    const today = new Date().getDay();
    daySelector.value = today;
    updateContent(today);

    document.addEventListener('click', function() {
        audioPlayer.muted = false;
        audioPlayer.play().catch(error => {
            console.error('Play button error:', error);
        });
    });
});
