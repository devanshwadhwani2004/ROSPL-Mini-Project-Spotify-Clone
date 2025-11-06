/// app.js - player, auth, playlists, liked songs using localStorage

const songs = [
  {id:1, title:"Peaceful Melody", artist:"Demo Artist", src:"songs/song1.wav"},
  {id:2, title:"Rap Beat", artist:"Demo Artist", src:"songs/song2.wav"},
  {id:3, title:"Calm Piano", artist:"Demo Artist", src:"songs/song3.wav"},
  {id:4, title:"Deep Focus", artist:"Demo Artist", src:"songs/song4.wav"},
  {id:5, title:"Instrumental", artist:"Demo Artist", src:"songs/song5.wav"},
  {id:6, title:"Focus Flow", artist:"Demo Artist", src:"songs/song6.wav"},
  {id:7, title:"Beats to Think", artist:"Demo Artist", src:"songs/song7.wav"},
  {id:8, title:"Reading Adventure", artist:"Demo Artist", src:"songs/song8.wav"},
  {id:9, title:"Sound of India", artist:"Demo Artist", src:"songs/song9.wav"},
  {id:10, title:"Uplift", artist:"Demo Artist", src:"songs/song10.wav"}
];

const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seek = document.getElementById('seek');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerCover = document.getElementById('player-cover');
const likeBtn = document.getElementById('likeBtn');
const addPlaylistBtn = document.getElementById('addPlaylistBtn');
const playlistsContainer = document.getElementById('playlists');
const libraryContainer = document.getElementById('library'); // optional div for viewing playlist

let currentIndex = 0;
let isPlaying = false;
let liked = JSON.parse(localStorage.getItem('liked_songs')||'[]');
let myPlaylist = JSON.parse(localStorage.getItem('my_playlist')||'[]');

function renderCards(){
  playlistsContainer.innerHTML = '';
  songs.forEach(s => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="images/cover.svg" alt="">
      <h4>${s.title}</h4>
      <p>${s.artist}</p>
      <div class="card-controls">
        <button data-action="play" data-id="${s.id}">Play</button>
        <button data-action="like" data-id="${s.id}">${liked.includes(s.id)?'♥':'♡'}</button>
        <button data-action="add" data-id="${s.id}">${myPlaylist.includes(s.id)?'✓ Added':'＋ Playlist'}</button>
      </div>
    `;
    playlistsContainer.appendChild(div);
  });
}

playlistsContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  const action = btn.getAttribute('data-action');
  const id = parseInt(btn.getAttribute('data-id'));
  const idx = songs.findIndex(x=>x.id===id);
  if(action==='play'){
    playIndex(idx);
  } else if(action==='like'){
    toggleLike(id, btn);
  } else if(action==='add'){
    toggleAddToPlaylist(id, btn);
  }
});

function playIndex(idx){
  if(idx<0 || idx>=songs.length) return;
  currentIndex = idx;
  const s = songs[idx];
  audio.src = s.src;
  audio.play();
  isPlaying = true;
  playBtn.textContent = 'Pause';
  updatePlayerUI();
}

function updatePlayerUI(){
  const s = songs[currentIndex];
  playerTitle.textContent = s.title;
  playerArtist.textContent = s.artist;
  playerCover.src = 'images/cover.svg';
  likeBtn.textContent = liked.includes(s.id)?'♥':'♡';
  addPlaylistBtn.textContent = myPlaylist.includes(s.id)?'✓ Added':'＋ Playlist';
}

playBtn.addEventListener('click', ()=>{
  if(!audio.src){
    playIndex(0);
    return;
  }
  if(audio.paused){
    audio.play();
    isPlaying = true;
    playBtn.textContent = 'Pause';
  } else {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = 'Play';
  }
});

prevBtn.addEventListener('click', ()=>{
  currentIndex = (currentIndex-1+songs.length)%songs.length;
  playIndex(currentIndex);
});

nextBtn.addEventListener('click', ()=>{
  currentIndex = (currentIndex+1)%songs.length;
  playIndex(currentIndex);
});

audio.addEventListener('timeupdate', ()=>{
  if(audio.duration){
    const percent = (audio.currentTime / audio.duration) * 100;
    seek.value = percent;
    curTime.textContent = formatTime(audio.currentTime);
    durTime.textContent = formatTime(audio.duration);
  }
});

seek.addEventListener('input', ()=>{
  if(audio.duration){
    const time = (seek.value/100) * audio.duration;
    audio.currentTime = time;
  }
});

audio.addEventListener('ended', ()=>{
  nextBtn.click();
});

function formatTime(t){
  if(!t || isNaN(t)) return '0:00';
  const m = Math.floor(t/60);
  const s = Math.floor(t%60).toString().padStart(2,'0');
  return m+':'+s;
}

function toggleLike(id, btn){
  if(liked.includes(id)){
    liked = liked.filter(x=>x!==id);
    btn.textContent = '♡';
  } else {
    liked.push(id);
    btn.textContent = '♥';
  }
  localStorage.setItem('liked_songs', JSON.stringify(liked));
  updatePlayerLikeButton();
}

function toggleAddToPlaylist(id, btn){
  if(myPlaylist.includes(id)){
    myPlaylist = myPlaylist.filter(x=>x!==id);
    btn.textContent = '＋ Playlist';
  } else {
    myPlaylist.push(id);
    btn.textContent = '✓ Added';
  }
  localStorage.setItem('my_playlist', JSON.stringify(myPlaylist));
  updatePlayerPlaylistButton();
  renderLibrary(); // refresh list view if open
}

function updatePlayerLikeButton(){
  const s = songs[currentIndex];
  likeBtn.textContent = liked.includes(s.id)?'♥':'♡';
}

function updatePlayerPlaylistButton(){
  const s = songs[currentIndex];
  addPlaylistBtn.textContent = myPlaylist.includes(s.id)?'✓ Added':'＋ Playlist';
}

// Bottom Player Like/Playlist Buttons
likeBtn.addEventListener('click', ()=>{
  const s = songs[currentIndex];
  if(!s) return;
  toggleLike(s.id);
});

addPlaylistBtn.addEventListener('click', ()=>{
  const s = songs[currentIndex];
  if(!s) return;
  toggleAddToPlaylist(s.id);
});

// AUTH
const userGreeting = document.getElementById('userGreeting');
const logoutBtn = document.getElementById('logoutBtn');
function refreshAuthUI(){
  const user = localStorage.getItem('demo_user');
  if(user){
    userGreeting.textContent = user;
    logoutBtn.style.display = 'inline-block';
    document.getElementById('nav-login').textContent = 'Account';
  } else {
    userGreeting.textContent = '';
    logoutBtn.style.display = 'none';
    document.getElementById('nav-login').textContent = 'Login';
  }
}
logoutBtn.addEventListener('click', ()=>{
  localStorage.removeItem('demo_user');
  refreshAuthUI();
});

// --- 🎵 Playlist / Library Section ---
function renderLibrary(){
  if(!libraryContainer) return; // if not on page, skip
  libraryContainer.innerHTML = '<h3>Your Playlist</h3>';
  if(myPlaylist.length === 0){
    libraryContainer.innerHTML += '<p>No songs added yet.</p>';
    return;
  }
  myPlaylist.forEach(id=>{
    const s = songs.find(x=>x.id===id);
    if(s){
      const item = document.createElement('div');
      item.className = 'lib-item';
      item.innerHTML = `
        <span>${s.title} - ${s.artist}</span>
        <button data-id="${s.id}" class="lib-play">▶</button>
        <button data-id="${s.id}" class="lib-remove">🗑</button>
      `;
      libraryContainer.appendChild(item);
    }
  });
}

// Library click handling
if(libraryContainer){
  libraryContainer.addEventListener('click', e=>{
    const play = e.target.closest('.lib-play');
    const rem = e.target.closest('.lib-remove');
    if(play){
      const id = parseInt(play.getAttribute('data-id'));
      const idx = songs.findIndex(x=>x.id===id);
      playIndex(idx);
    } else if(rem){
      const id = parseInt(rem.getAttribute('data-id'));
      myPlaylist = myPlaylist.filter(x=>x!==id);
      localStorage.setItem('my_playlist', JSON.stringify(myPlaylist));
      renderLibrary();
    }
  });
}

// Init
renderCards();
renderLibrary();
refreshAuthUI();
