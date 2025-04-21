document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = new Audio();
    let currentPlaylist = null;
    let currentTrackIndex = 0;
    let isPlaying = false;

    // DOM Elements
    const playlistsContainer = document.getElementById('playlistsContainer');
    const addPlaylistBtn = document.getElementById('addPlaylistBtn');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const trackTitle = document.querySelector('.track-title');
    const trackArtist = document.querySelector('.track-artist');
    const albumArt = document.getElementById('albumArt');
    const playlistElements = document.querySelectorAll('.playlist');

    // Audio state
    let currentTrack = null;

    // Initialize playlists from localStorage or use default data
    const playlists = JSON.parse(localStorage.getItem('playlists')) || [
        {
            id: 1,
            name: 'Focus Music',
            description: 'Calming tracks to help you concentrate',
            tracks: [
                { title: 'Peaceful Piano', artist: 'Study Music', url: 'https://example.com/track1.mp3' },
                { title: 'Ambient Study', artist: 'Focus Beats', url: 'https://example.com/track2.mp3' }
            ]
        },
        {
            id: 2,
            name: 'Study Beats',
            description: 'Upbeat music to keep you motivated',
            tracks: [
                { title: 'Productive Vibes', artist: 'Study Mix', url: 'https://example.com/track3.mp3' },
                { title: 'Concentration Flow', artist: 'Focus Tracks', url: 'https://example.com/track4.mp3' }
            ]
        }
    ];

    // Initialize audio player
    audioPlayer.volume = volumeSlider.value / 100;

    // Event Listeners
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    volumeSlider.addEventListener('input', updateVolume);
    progressBar.addEventListener('click', seek);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateTotalTime);
    audioPlayer.addEventListener('ended', playNext);
    addPlaylistBtn.addEventListener('click', createNewPlaylist);

    // Playlist click handlers
    playlistElements.forEach(playlist => {
        playlist.addEventListener('click', (e) => {
            if (e.target.classList.contains('play-track')) {
                const track = e.target.closest('li');
                playTrack(track);
            }
        });
    });

    // Initialize playlists
    renderPlaylists();

    // Functions
    function togglePlay() {
        if (!currentTrack) return;
        
        if (isPlaying) {
            audioPlayer.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audioPlayer.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    }

    function playTrack(track) {
        const src = track.dataset.src;
        const title = track.dataset.title;
        const artist = track.dataset.artist;
        const type = track.dataset.type;

        console.log('Playing track:', { src, title, artist, type }); // Debug log

        // Update track info display
        trackTitle.textContent = title;
        trackArtist.textContent = artist;

        if (type === 'youtube' || type === 'spotify' || type === 'spotify-playlist') {
            // Create or update iframe for embedded content
            let playerContainer = document.getElementById('embedded-player');
            if (!playerContainer) {
                playerContainer = document.createElement('div');
                playerContainer.id = 'embedded-player';
                playerContainer.style.width = '100%';
                playerContainer.style.height = type === 'spotify-playlist' ? '380px' : '150px';
                playerContainer.style.marginBottom = '20px';
                document.querySelector('.music-player').insertBefore(
                    playerContainer,
                    document.querySelector('.player-controls')
                );
            }

            // Create iframe for embedded content
            const iframe = document.createElement('iframe');
            iframe.src = src + (type === 'youtube' ? '?autoplay=1' : '');
            iframe.width = '100%';
            iframe.height = type === 'spotify-playlist' ? '380' : '150';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            // Clear previous content and add new iframe
            playerContainer.innerHTML = '';
            playerContainer.appendChild(iframe);

            // Hide audio player controls for embedded content
            document.querySelector('.player-controls').style.display = 'none';
            document.querySelector('.progress-container').style.display = 'none';
            document.querySelector('.volume-control').style.display = 'none';
        } else {
            // Show audio player controls for direct audio files
            document.querySelector('.player-controls').style.display = 'flex';
            document.querySelector('.progress-container').style.display = 'block';
            document.querySelector('.volume-control').style.display = 'flex';

            // Remove embedded player if it exists
            const playerContainer = document.getElementById('embedded-player');
            if (playerContainer) {
                playerContainer.remove();
            }

            // Play audio file
            audioPlayer.src = src;
            audioPlayer.load(); // Ensure the audio is loaded
            const playPromise = audioPlayer.play();
            
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    isPlaying = true;
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    alert('Error playing audio. Please check the URL and try again.');
                });
            }
        }

        // Update current playlist and track index
        currentPlaylist = track.closest('.playlist');
        currentTrackIndex = Array.from(currentPlaylist.querySelectorAll('.tracks li')).indexOf(track);
    }

    function playPrevious() {
        if (!currentPlaylist) return;
        
        const playlist = playlists[currentPlaylist.querySelector('h3').textContent];
        currentTrackIndex = (currentTrackIndex - 1 + playlist.tracks.length) % playlist.tracks.length;
        playTrack(currentPlaylist.querySelectorAll('.tracks li')[currentTrackIndex]);
    }

    function playNext() {
        if (!currentPlaylist) return;
        
        const playlist = playlists[currentPlaylist.querySelector('h3').textContent];
        currentTrackIndex = (currentTrackIndex + 1) % playlist.tracks.length;
        playTrack(currentPlaylist.querySelectorAll('.tracks li')[currentTrackIndex]);
    }

    function updateVolume() {
        audioPlayer.volume = volumeSlider.value / 100;
    }

    function updateProgress() {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${progress}%`;
        
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    }

    function updateTotalTime() {
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function createNewPlaylist() {
        const name = prompt('Enter playlist name:');
        if (!name) return;

        const description = prompt('Enter playlist description:');
        if (!description) return;

        const newPlaylist = {
            id: Date.now(),
            name,
            description,
            tracks: []
        };

        playlists.push(newPlaylist);
        savePlaylists();
        renderPlaylists();
    }

    function renderPlaylists() {
        playlistsContainer.innerHTML = '';
        playlists.forEach(playlist => {
            const playlistElement = createPlaylistElement(playlist);
            playlistsContainer.appendChild(playlistElement);
        });
    }

    function createPlaylistElement(playlist) {
        const div = document.createElement('div');
        div.className = 'playlist';
        div.innerHTML = `
            <div class="playlist-header">
                <h3>${playlist.name}</h3>
                <button class="delete-playlist" title="Delete Playlist">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p>${playlist.description}</p>
            <ul class="tracks">
                ${playlist.tracks.map((track, index) => `
                    <li class="track" 
                        data-src="${track.url}"
                        data-title="${track.title}"
                        data-artist="${track.artist}"
                        data-type="${track.type || 'audio'}"
                        data-index="${index}">
                        <div class="track-details">
                            <span class="track-title">${track.title}</span>
                            <span class="track-artist">${track.artist}</span>
                            <span class="track-type">${track.type === 'youtube' ? '🎥' : track.type === 'spotify' ? '🎵' : '🎧'}</span>
                        </div>
                        <button class="play-track">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="delete-track">
                            <i class="fas fa-trash"></i>
                        </button>
                    </li>
                `).join('')}
            </ul>
            <div class="playlist-actions">
                <button class="add-track">
                    <i class="fas fa-plus"></i> Add Track
                </button>
                <button class="add-spotify-playlist">
                    <i class="fab fa-spotify"></i> Add Spotify Playlist
                </button>
            </div>
        `;

        // Add event listeners for the tracks
        const tracks = div.querySelectorAll('.track');
        tracks.forEach(track => {
            const playButton = track.querySelector('.play-track');
            const deleteButton = track.querySelector('.delete-track');
            
            playButton.addEventListener('click', () => playTrack(track));
            deleteButton.addEventListener('click', () => {
                const index = track.dataset.index;
                deleteTrack(playlist.id, parseInt(index));
            });
        });

        // Add event listener for adding tracks
        const addTrackButton = div.querySelector('.add-track');
        addTrackButton.addEventListener('click', () => addTrack(playlist.id));

        // Add event listener for adding Spotify playlist
        const addSpotifyPlaylistButton = div.querySelector('.add-spotify-playlist');
        addSpotifyPlaylistButton.addEventListener('click', () => addSpotifyPlaylist(playlist.id));

        // Add event listener for deleting playlist
        const deletePlaylistButton = div.querySelector('.delete-playlist');
        deletePlaylistButton.addEventListener('click', () => deletePlaylist(playlist.id));

        return div;
    }

    function addTrack(playlistId) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const title = prompt('Enter track title:');
        if (!title) return;

        const artist = prompt('Enter artist name:');
        if (!artist) return;

        const url = prompt('Enter music URL (YouTube, Spotify, or direct MP3 link):');
        if (!url) return;

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            alert('Please enter a valid URL');
            return;
        }

        let trackType = 'audio';
        let trackUrl = url;

        // Check if it's a YouTube URL
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = extractYouTubeId(url);
            if (!videoId) {
                alert('Invalid YouTube URL');
                return;
            }
            trackType = 'youtube';
            trackUrl = `https://www.youtube.com/embed/${videoId}`;
        } 
        // Check if it's a Spotify URL
        else if (url.includes('spotify.com')) {
            trackType = 'spotify';
            trackUrl = url.replace('spotify.com', 'spotify.com/embed');
        }

        playlist.tracks.push({ 
            title, 
            artist, 
            url: trackUrl, 
            type: trackType 
        });

        savePlaylists();
        renderPlaylists();
    }

    function extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function deleteTrack(playlistId, trackIndex) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        if (confirm('Are you sure you want to delete this track?')) {
            playlist.tracks.splice(trackIndex, 1);
            savePlaylists();
            renderPlaylists();
        }
    }

    function deletePlaylist(playlistId) {
        if (confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
            const index = playlists.findIndex(p => p.id === playlistId);
            if (index !== -1) {
                playlists.splice(index, 1);
                savePlaylists();
                renderPlaylists();
            }
        }
    }

    function addSpotifyPlaylist(playlistId) {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const url = prompt('Enter Spotify playlist URL:');
        if (!url) return;

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            alert('Please enter a valid URL');
            return;
        }

        // Check if it's a Spotify playlist URL
        if (!url.includes('spotify.com/playlist')) {
            alert('Please enter a valid Spotify playlist URL');
            return;
        }

        // Convert to embed URL
        const embedUrl = url.replace('spotify.com/playlist', 'spotify.com/embed/playlist');
        
        // Add as a single track that will show the entire playlist
        playlist.tracks.push({
            title: 'Spotify Playlist',
            artist: 'Spotify',
            url: embedUrl,
            type: 'spotify-playlist'
        });

        savePlaylists();
        renderPlaylists();
    }

    function savePlaylists() {
        localStorage.setItem('playlists', JSON.stringify(playlists));
    }

    function seek(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = pos * audioPlayer.duration;
    }

    // Initialize volume
    updateVolume();

    // Initialize player state
    updatePlayerState();
}); 