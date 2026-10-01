// const canvas = document.getElementById('game'), ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false; const socket = io();
// const $ = id => document.getElementById(id); const els = { score: $('score'), hudName: $('hudName'), bestScore: $('bestScore'), sideName: $('sideName'), avatarSmall: $('avatarSmall'), sideAvatar: $('sideAvatar'), startOverlay: $('startOverlay'), gameOverOverlay: $('gameOverOverlay'), finalScore: $('finalScore'), leaderboardList: $('leaderboardList'), chatMessages: $('chatMessages'), onlineCount: $('onlineCount'), onlineCountModal: $('onlineCountModal'), nameInput: $('nameInput'), avatarInput: $('avatarInput'), profilePreview: $('profilePreview'), pauseBadge: $('pauseBadge'), musicSelect: $('musicSelect') };
// const hitSound = new Audio("/assets/sounds/hit.mp3");
// hitSound.volume = 0.8;

// let profile = JSON.parse(localStorage.getItem('dinoProfile') || 'null') || { name: 'Player', avatar: '', music: 'off' }; let best = Number(localStorage.getItem('dinoBest') || 0); let world = localStorage.getItem('dinoWorld') || 'sunny', speedMode = localStorage.getItem('dinoSpeed') || 'normal'; $('worldSelect').value = world; $('speedSelect').value = speedMode; els.musicSelect.value = profile.music || 'off';
// function avatarHTML(src, cls = '') { return src ? `<img class="${cls}" src="${src}" alt="">` : '🙂' } function saveProfile() { localStorage.setItem('dinoProfile', JSON.stringify(profile)); updateProfileUI(); socket.emit('identify', profile) } function updateProfileUI() { els.hudName.textContent = profile.name; els.sideName.textContent = profile.name; els.bestScore.textContent = best.toLocaleString(); els.avatarSmall.innerHTML = avatarHTML(profile.avatar); els.sideAvatar.innerHTML = avatarHTML(profile.avatar); els.profilePreview.innerHTML = avatarHTML(profile.avatar) } updateProfileUI(); socket.emit('identify', profile);
// let running = false, paused = false, last = 0, score = 0, speed = 360, spawnTimer = 0, lastHundred = 0, groundOffset = 0, obstacles = [], musicAudio = null, audioCtx = null;
// const player = { x: 145, y: 330, w: 52, h: 62, vy: 0, crouch: false, grounded: true, runPhase: 0 };
// const speedModes = { chill: .78, normal: 1, turbo: 1.25 };
// function resetGame() { running = true; paused = false; last = performance.now(); score = 0; lastHundred = 0; speed = 360 * speedModes[speedMode]; spawnTimer = .7; groundOffset = 0; obstacles = []; player.y = 330; player.vy = 0; player.crouch = false; player.grounded = true; els.startOverlay.classList.add('hidden'); els.gameOverOverlay.classList.add('hidden'); els.pauseBadge.classList.add('hidden'); startMusic(); requestAnimationFrame(loop) }
// function jump() { if (!running || paused) return; if (player.grounded) { player.vy = -760; player.grounded = false; playTone(500, .07, 'square') } } function setCrouch(v) { if (!running || paused) return; player.crouch = v }
// window.addEventListener('keydown', e => { if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault(); if (e.code === 'Space' || e.code === 'ArrowUp') jump(); if (e.code === 'ArrowDown') setCrouch(true); if (e.code === 'Escape' && running) { paused = !paused; els.pauseBadge.classList.toggle('hidden', !paused) } }); window.addEventListener('keyup', e => { if (e.code === 'ArrowDown') setCrouch(false) }); canvas.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') jump() });
// function spawnObstacle() { const r = Math.random(); const flying = r < .18 && score > 350; const top = r > .82 && score > 700; const count = 1 + Math.floor(Math.random() * 3); for (let i = 0; i < count; i++) { obstacles.push({ x: canvas.width + 30 + i * 62, y: flying ? 245 : 342, w: flying ? 74 : 52, h: flying ? 42 : 72, type: flying ? 'beam' : 'cylinder', top }) } }
// function hitTest(a, b) { const ax = a.x + 9, ay = a.y + 6, aw = a.w - 18, ah = a.h - 10; return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y }
// function gameOver() 
// { running = false; stopMusic(); best = Math.max(best, Math.floor(score)); localStorage.setItem('dinoBest', String(best)); updateProfileUI(); els.finalScore.textContent = `Score: ${Math.floor(score).toLocaleString()}`; els.gameOverOverlay.classList.remove('hidden'); socket.emit('submitScore', { ...profile, score: Math.floor(score) }); playTone(120, .22, 'sawtooth') }
// function playTone(freq, dur, type = 'square') { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(.055, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + dur); o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + dur) } catch { } }
// function milestone() { playTone(740, .06); setTimeout(() => playTone(980, .08), 55) }
// function startMusic() { stopMusic(); if (!profile.music || profile.music === 'off') return; const files = { arcade: '/assets/music/arcade.mp3', chill: '/assets/music/chill.mp3', night: '/assets/music/night.mp3' }; musicAudio = new Audio(files[profile.music]); musicAudio.loop = true; musicAudio.volume = .22; musicAudio.play().catch(() => { }); } function stopMusic() { if (musicAudio) { musicAudio.pause(); musicAudio.currentTime = 0; musicAudio = null } }
// function update(dt) { score += dt * 10 * speedModes[speedMode]; speed = Math.min(920, 360 * speedModes[speedMode] + score * .12); groundOffset = (groundOffset + speed * dt) % 40; player.runPhase += dt * (8 + speed / 120); player.vy += 1900 * dt; player.y += player.vy * dt; if (player.y >= 330) { player.y = 330; player.vy = 0; player.grounded = true } spawnTimer -= dt; if (spawnTimer <= 0) { spawnObstacle(); spawnTimer = Math.max(.58, 1.45 - score / 16000) + Math.random() * .6 } obstacles.forEach(o => o.x -= speed * dt); obstacles = obstacles.filter(o => o.x > -150); const current = { x: player.x, y: player.crouch ? player.y + 25 : player.y, w: player.w, h: player.crouch ? 40 : player.h }; for (const o of obstacles) if (hitTest(current, o)) return gameOver(); const hundreds = Math.floor(score / 100); if (hundreds > lastHundred) { lastHundred = hundreds; milestone() } }
// function drawPixelRect(x, y, w, h, fill, stroke = '#171717', sw = 4) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.strokeRect(x, y, w, h) }
// function drawBackground() { const palettes = { sunny: ['#bfefff', '#78df91', '#ffd84d'], sunset: ['#ffb18c', '#b87f9c', '#ffcc6a'], night: ['#18264d', '#304b76', '#a7c7ff'], candy: ['#ffd6ef', '#a7e9d5', '#ff8fc7'], forest: ['#bfe7c0', '#5ca66b', '#e8c95c'] }; const p = palettes[world] || palettes.sunny; ctx.fillStyle = p[0]; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = p[2]; ctx.fillRect(760, 45, 70, 70); ctx.fillStyle = 'rgba(255,255,255,.8)'; for (const c of [{ x: 130, y: 70 }, { x: 450, y: 105 }, { x: 650, y: 65 }]) { ctx.fillRect(c.x, c.y, 70, 20); ctx.fillRect(c.x + 20, c.y - 14, 35, 34) } ctx.fillStyle = p[1]; for (let x = -40; x < canvas.width; x += 170) { ctx.fillRect(x, 300, 28, 42); ctx.fillRect(x + 8, 286, 12, 14) } }
// function drawObstacle(o) { if (o.type === 'cylinder') { const img = obstacleImage; if (img.complete && img.naturalWidth) { ctx.drawImage(img, o.x, o.y - 5, o.w, o.h + 5) } else { drawPixelRect(o.x + 8, o.y, 36, o.h, '#ff9c4a'); ctx.fillStyle = '#ffd84d'; ctx.fillRect(o.x, o.y - 5, o.w, 12); ctx.strokeStyle = '#171717'; ctx.lineWidth = 4; ctx.strokeRect(o.x, o.y - 5, o.w, 12); ctx.fillStyle = '#171717'; ctx.fillRect(o.x + 18, o.y + 20, 8, 8) } } else { drawPixelRect(o.x, o.y, o.w, o.h, '#9c86ff'); ctx.fillStyle = '#171717'; ctx.fillRect(o.x + 12, o.y + 12, 10, 10); ctx.fillRect(o.x + 48, o.y + 12, 10, 10) } }
// const obstacleImage = new Image(); obstacleImage.src = '/assets/obstacles/cylinder.png';
// function drawPlayer() { const crouch = player.crouch; const h = crouch ? 40 : 62, y = crouch ? player.y + 22 : player.y; const bob = player.grounded && !crouch ? Math.sin(player.runPhase) * 2 : 0; const px = player.x, py = y + bob; ctx.save(); ctx.translate(px, py); ctx.fillStyle = '#65d7ff'; ctx.strokeStyle = '#171717'; ctx.lineWidth = 4; ctx.beginPath(); ctx.rect(0, 8, 52, h - 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#171717'; ctx.fillRect(34, 22, 7, 7); const leg = Math.sin(player.runPhase) * 7; ctx.fillRect(7, h - 4, 14, 5); ctx.fillRect(34 + (crouch ? 0 : leg), h - 4, 14, 5); if (!crouch) { ctx.fillRect(3, 20, 10, 5); ctx.fillRect(42, 17, 10, 5) } ctx.restore(); if (profile.avatar) { const r = crouch ? 18 : 22; const cx = px + 26, cy = py + (crouch ? 8 : -4); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip(); const im = new Image(); im.src = profile.avatar; ctx.drawImage(im, cx - r, cy - r, r * 2, r * 2); ctx.restore(); ctx.strokeStyle = '#171717'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke() } }
// function draw() { drawBackground(); ctx.fillStyle = world === 'night' ? '#21334e' : '#78df91'; ctx.fillRect(0, 400, canvas.width, 20); ctx.strokeStyle = '#171717'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(canvas.width, 400); ctx.stroke(); ctx.fillStyle = '#171717'; for (let x = -groundOffset; x < canvas.width; x += 40)ctx.fillRect(x, 405, 20, 4); for (const o of obstacles) drawObstacle(o); drawPlayer(); els.score.textContent = String(Math.floor(score)).padStart(5, '0') }
// function loop(now) { if (!running) return; const dt = Math.min(.033, (now - last) / 1000); last = now; if (!paused) update(dt); draw(); requestAnimationFrame(loop) } draw();
// $('startBtn').onclick = resetGame; $('restartBtn').onclick = resetGame;
// const backdrop = $('modalBackdrop'); function openModal(id) { backdrop.classList.remove('hidden'); document.querySelectorAll('.modal').forEach(x => x.classList.add('hidden')); $(id).classList.remove('hidden') } function closeModal() { backdrop.classList.add('hidden') } document.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModal); backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal() }); $('leaderboardBtn').onclick = () => openModal('leaderboardPanel'); $('sideLeaderboardBtn').onclick = () => openModal('leaderboardPanel'); $('chatBtn').onclick = () => openModal('chatPanel'); $('sideChatBtn').onclick = () => openModal('chatPanel'); $('profileBtn').onclick = () => { els.nameInput.value = profile.name; els.musicSelect.value = profile.music || 'off'; openModal('profilePanel') };
// $('worldSelect').onchange = e => { world = e.target.value; localStorage.setItem('dinoWorld', world); draw() }; $('speedSelect').onchange = e => { speedMode = e.target.value; localStorage.setItem('dinoSpeed', speedMode) }; $('themeBtn').onclick = () => { document.body.classList.toggle('dark'); localStorage.setItem('dinoDark', document.body.classList.contains('dark')) }; if (localStorage.getItem('dinoDark') === 'true') document.body.classList.add('dark');
// $('saveProfileBtn').onclick = () => { profile.name = (els.nameInput.value.trim() || 'Player').slice(0, 24); profile.music = els.musicSelect.value; const file = els.avatarInput.files[0]; if (file) { if (file.size > 900000) { alert('Please choose an image under 900 KB.'); return } const reader = new FileReader(); reader.onload = () => { profile.avatar = reader.result; saveProfile(); closeModal() }; reader.readAsDataURL(file) } else { saveProfile(); closeModal() } };
// function renderLeaderboard(list) { const sorted = [...list].sort((a, b) => b.score - a.score); if (!sorted.length) { els.leaderboardList.innerHTML = '<div class="leader-row"><div></div><div><strong>No runs yet.</strong><br><small>Be the first legend.</small></div><div></div></div>'; return } els.leaderboardList.innerHTML = sorted.slice(0, 100).map((p, i) => `<div class="leader-row"><div class="rank">${i + 1}</div><div class="player-cell"><div class="mini-avatar">${avatarHTML(p.avatar)}</div><strong>${escapeHtml(p.name)}</strong></div><div class="leader-score">${Number(p.score).toLocaleString()}</div></div>`).join('') } function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])) } socket.on('leaderboard', renderLeaderboard); socket.on('onlineCount', n => { els.onlineCount.textContent = n; els.onlineCountModal.textContent = n }); socket.on('chat', m => { const row = document.createElement('div'); row.className = 'chat-message'; row.innerHTML = `<div class="player-cell"><div class="mini-avatar">${avatarHTML(m.avatar)}</div><div><b>${escapeHtml(m.name)}</b><span class="chat-time">${new Date(m.time).toLocaleTimeString()}</span></div></div><div>${escapeHtml(m.message)}</div>`; els.chatMessages.appendChild(row); els.chatMessages.scrollTop = els.chatMessages.scrollHeight }); $('chatForm').addEventListener('submit', e => { e.preventDefault(); const input = $('chatInput'), message = input.value.trim(); if (message) socket.emit('chat', { message }); input.value = '' });




const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

const socket = io();

const fullscreenBtn = document.getElementById('fullscreenBtn');
const gameCard = document.querySelector('.game-card');

const $ = id => document.getElementById(id);

const els = {
    score: $('score'),
    hudName: $('hudName'),
    bestScore: $('bestScore'),
    sideName: $('sideName'),
    avatarSmall: $('avatarSmall'),
    sideAvatar: $('sideAvatar'),
    startOverlay: $('startOverlay'),
    gameOverOverlay: $('gameOverOverlay'),
    finalScore: $('finalScore'),
    leaderboardList: $('leaderboardList'),
    chatMessages: $('chatMessages'),
    onlineCount: $('onlineCount'),
    onlineCountModal: $('onlineCountModal'),
    nameInput: $('nameInput'),
    avatarInput: $('avatarInput'),
    profilePreview: $('profilePreview'),
    pauseBadge: $('pauseBadge'),
    musicSelect: $('musicSelect')
};


// ============================================================
// CUSTOM HIT SOUND
// Put your own file here:
// public/assets/sounds/hit.mp3
// ============================================================

const hitSound = new Audio('/assets/sounds/hit.mp3');
hitSound.volume = 0.8;


// ============================================================
// PROFILE
// ============================================================

let profile;

try {
    profile = JSON.parse(localStorage.getItem('dinoProfile') || 'null');
} catch {
    profile = null;
}

profile = profile || {
    name: 'Player',
    avatar: '',
    music: 'off'
};

let best = Number(localStorage.getItem('dinoBest') || 0);

let world = localStorage.getItem('dinoWorld') || 'sunny';
let speedMode = localStorage.getItem('dinoSpeed') || 'normal';


// ============================================================
// KEYBOARD STATE
// ============================================================

const keys = {
    down: false
};


// ============================================================
// PLAYER AVATAR IMAGE
// We cache the image instead of creating a new Image every frame.
// ============================================================

let playerAvatarImage = null;

function loadPlayerAvatar() {
    playerAvatarImage = null;

    if (!profile.avatar) return;

    const img = new Image();

    img.onload = () => {
        playerAvatarImage = img;
    };

    img.src = profile.avatar;
}

loadPlayerAvatar();


// ============================================================
// SELECT SETTINGS
// ============================================================

const worldSelect = $('worldSelect');
const speedSelect = $('speedSelect');

if (worldSelect) {
    worldSelect.value = world;
}

if (speedSelect) {
    speedSelect.value = speedMode;
}

if (els.musicSelect) {
    els.musicSelect.value = profile.music || 'off';
}


// ============================================================
// FULLSCREEN
// ============================================================

fullscreenBtn?.addEventListener('click', async () => {
    try {
        if (!document.fullscreenElement) {
            await gameCard.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (err) {
        console.warn('Fullscreen unavailable:', err);
    }
});

document.addEventListener('fullscreenchange', () => {
    if (!fullscreenBtn) return;

    fullscreenBtn.textContent = '⛶';

    fullscreenBtn.title = document.fullscreenElement
        ? 'Exit fullscreen'
        : 'Fullscreen';
});


// ============================================================
// AVATAR HTML
// ============================================================

function avatarHTML(src, cls = '') {
    if (!src) {
        return '🙂';
    }

    return `<img class="${cls}" src="${escapeHtml(src)}" alt="">`;
}


// ============================================================
// PROFILE
// ============================================================

function saveProfile() {
    localStorage.setItem('dinoProfile', JSON.stringify(profile));

    loadPlayerAvatar();

    updateProfileUI();

    socket.emit('identify', profile);
}

function updateProfileUI() {
    if (els.hudName) {
        els.hudName.textContent = profile.name;
    }

    if (els.sideName) {
        els.sideName.textContent = profile.name;
    }

    if (els.bestScore) {
        els.bestScore.textContent = best.toLocaleString();
    }

    if (els.avatarSmall) {
        els.avatarSmall.innerHTML = avatarHTML(profile.avatar);
    }

    if (els.sideAvatar) {
        els.sideAvatar.innerHTML = avatarHTML(profile.avatar);
    }

    if (els.profilePreview) {
        els.profilePreview.innerHTML = avatarHTML(profile.avatar);
    }
}

updateProfileUI();

socket.emit('identify', profile);


// ============================================================
// GAME VARIABLES
// ============================================================

let running = false;
let paused = false;

let last = 0;
let score = 0;

let speed = 360;
let spawnTimer = 0;

let lastHundred = 0;

let groundOffset = 0;

let obstacles = [];

let musicAudio = null;

let audioCtx = null;


// ============================================================
// PLAYER
// ============================================================

const player = {
    x: 145,
    y: 330,

    w: 52,
    h: 62,

    vy: 0,

    grounded: true,

    crouching: false,

    runPhase: 0
};


// ============================================================
// SPEED MODES
// ============================================================

const speedModes = {
    chill: 0.78,
    normal: 1,
    turbo: 1.25
};


// ============================================================
// RESET GAME
// ============================================================

function resetGame() {
    running = true;
    paused = false;

    last = performance.now();

    score = 0;
    lastHundred = 0;

    speed = 360 * (speedModes[speedMode] || 1);

    spawnTimer = 0.7;

    groundOffset = 0;

    obstacles = [];

    player.y = 330;
    player.vy = 0;
    player.grounded = true;
    player.crouching = false;
    player.runPhase = 0;

    keys.down = false;

    if (els.startOverlay) {
        els.startOverlay.classList.add('hidden');
    }

    if (els.gameOverOverlay) {
        els.gameOverOverlay.classList.add('hidden');
    }

    if (els.pauseBadge) {
        els.pauseBadge.classList.add('hidden');
    }

    startMusic();

    requestAnimationFrame(loop);
}


// ============================================================
// JUMP
// ============================================================

function jump() {
    if (!running || paused) return;

    if (player.grounded && !player.crouching) {
        player.vy = -760;

        player.grounded = false;

        playTone(500, 0.07, 'square');
    }
}


// ============================================================
// CROUCH
// ============================================================

function setCrouch(value) {
    if (!running || paused) return;

    if (value && player.grounded) {
        player.crouching = true;
    } else if (!value) {
        player.crouching = false;
    }
}


// ============================================================
// KEYBOARD CONTROLS
// ============================================================

window.addEventListener('keydown', e => {

    if (
        e.code === 'Space' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown'
    ) {
        e.preventDefault();
    }

    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
    }

    if (e.code === 'ArrowDown') {
        keys.down = true;
        setCrouch(true);
    }

    if (e.code === 'Escape' && running) {
        paused = !paused;

        if (els.pauseBadge) {
            els.pauseBadge.classList.toggle('hidden', !paused);
        }
    }
});


window.addEventListener('keyup', e => {

    if (e.code === 'ArrowDown') {
        keys.down = false;
        setCrouch(false);
    }
});


// ============================================================
// MOBILE / TOUCH JUMP
// ============================================================

canvas.addEventListener('pointerdown', e => {

    if (e.pointerType !== 'mouse') {
        jump();
    }
});


// ============================================================
// OBSTACLES
// ============================================================

function spawnObstacle() {

    const r = Math.random();

    const flying =
        r < 0.18 &&
        score > 350;

    const top =
        r > 0.82 &&
        score > 700;

    const count =
        1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {

        let y;
        let w;
        let h;
        let type;

        if (flying) {

            y = 245;
            w = 74;
            h = 42;
            type = 'beam';

        } else if (top) {

            // Overhead cylinder.
            // This is designed so crouching can avoid it.

            y = 270;
            w = 52;
            h = 65;
            type = 'cylinder';

        } else {

            y = 342;
            w = 52;
            h = 72;
            type = 'cylinder';
        }

        obstacles.push({
            x: canvas.width + 30 + i * 62,
            y,
            w,
            h,
            type,
            top
        });
    }
}


// ============================================================
// COLLISION
// ============================================================

function hitTest(a, b) {

    const ax = a.x + 9;
    const ay = a.y + 6;

    const aw = a.w - 18;
    const ah = a.h - 10;

    return (
        ax < b.x + b.w &&
        ax + aw > b.x &&
        ay < b.y + b.h &&
        ay + ah > b.y
    );
}


// ============================================================
// GAME OVER
// ============================================================

function gameOver() {

    if (!running) return;

    running = false;

    keys.down = false;

    player.crouching = false;

    stopMusic();

    best = Math.max(
        best,
        Math.floor(score)
    );

    localStorage.setItem(
        'dinoBest',
        String(best)
    );

    updateProfileUI();

    if (els.finalScore) {
        els.finalScore.textContent =
            `Score: ${Math.floor(score).toLocaleString()}`;
    }

    if (els.gameOverOverlay) {
        els.gameOverOverlay.classList.remove('hidden');
    }

    socket.emit('submitScore', {
        ...profile,
        score: Math.floor(score)
    });


    // ========================================================
    // YOUR CUSTOM COLLISION SOUND
    // ========================================================

    try {
        hitSound.currentTime = 0;
        hitSound.play().catch(() => { });
    } catch { }


    // Backup short impact tone
    playTone(120, 0.16, 'sawtooth');
}


// ============================================================
// SIMPLE SOUND
// ============================================================

function playTone(
    freq,
    dur,
    type = 'square'
) {

    try {

        audioCtx =
            audioCtx ||
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        const o =
            audioCtx.createOscillator();

        const g =
            audioCtx.createGain();

        o.type = type;

        o.frequency.value = freq;

        g.gain.setValueAtTime(
            0.055,
            audioCtx.currentTime
        );

        g.gain.exponentialRampToValueAtTime(
            0.001,
            audioCtx.currentTime + dur
        );

        o.connect(g);

        g.connect(
            audioCtx.destination
        );

        o.start();

        o.stop(
            audioCtx.currentTime + dur
        );

    } catch { }
}


// ============================================================
// 100 POINT SOUND
// ============================================================

function milestone() {

    playTone(740, 0.06);

    setTimeout(() => {
        playTone(980, 0.08);
    }, 55);
}


// ============================================================
// MUSIC
// ============================================================

function startMusic() {

    stopMusic();

    if (
        !profile.music ||
        profile.music === 'off'
    ) {
        return;
    }

    const files = {

        arcade:
            '/assets/music/arcade.mp3',

        chill:
            '/assets/music/chill.mp3',

        night:
            '/assets/music/night.mp3'
    };

    const file = files[profile.music];

    if (!file) return;

    musicAudio = new Audio(file);

    musicAudio.loop = true;

    musicAudio.volume = 0.22;

    musicAudio.play().catch(() => { });
}


function stopMusic() {

    if (musicAudio) {

        musicAudio.pause();

        musicAudio.currentTime = 0;

        musicAudio = null;
    }
}


// ============================================================
// GAME UPDATE
// ============================================================

function update(dt) {

    const multiplier =
        speedModes[speedMode] || 1;


    // Score
    score +=
        dt * 10 * multiplier;


    // Speed
    speed =
        Math.min(
            920,
            360 * multiplier +
            score * 0.12
        );


    // Ground movement
    groundOffset =
        (
            groundOffset +
            speed * dt
        ) % 40;


    // Running animation
    if (player.grounded) {

        player.runPhase +=
            dt * (
                8 +
                speed / 120
            );
    }


    // Gravity
    player.vy +=
        1900 * dt;


    player.y +=
        player.vy * dt;


    // Ground
    if (player.y >= 330) {

        player.y = 330;

        player.vy = 0;

        player.grounded = true;

    } else {

        player.grounded = false;

        player.crouching = false;
    }


    // Crouch
    if (
        keys.down &&
        player.grounded
    ) {

        player.crouching = true;

    } else if (!keys.down) {

        player.crouching = false;
    }


    // Spawn
    spawnTimer -= dt;

    if (spawnTimer <= 0) {

        spawnObstacle();

        spawnTimer =
            Math.max(
                0.58,
                1.45 - score / 16000
            ) +
            Math.random() * 0.6;
    }


    // Move obstacles
    obstacles.forEach(o => {

        o.x -=
            speed * dt;
    });


    // Remove old obstacles
    obstacles =
        obstacles.filter(
            o => o.x > -150
        );


    // Player collision box
    let current;

    if (player.crouching) {

        // Short collision box while sitting
        current = {

            x: player.x + 7,

            y: player.y + 27,

            w: player.w - 14,

            h: 35
        };

    } else {

        current = {

            x: player.x + 9,

            y: player.y + 6,

            w: player.w - 18,

            h: player.h - 10
        };
    }


    // Collision
    for (const o of obstacles) {

        // Crouching avoids overhead obstacles
        if (
            player.crouching &&
            o.top
        ) {
            continue;
        }

        if (
            hitTest(current, o)
        ) {

            gameOver();

            return;
        }
    }


    // 100 point milestone
    const hundreds =
        Math.floor(score / 100);

    if (
        hundreds >
        lastHundred
    ) {

        lastHundred =
            hundreds;

        milestone();
    }
}


// ============================================================
// PIXEL RECTANGLE
// ============================================================

function drawPixelRect(
    x,
    y,
    w,
    h,
    fill,
    stroke = '#171717',
    sw = 4
) {

    ctx.fillStyle = fill;

    ctx.fillRect(
        x,
        y,
        w,
        h
    );

    ctx.strokeStyle = stroke;

    ctx.lineWidth = sw;

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );
}


// ============================================================
// BACKGROUND
// ============================================================

function drawBackground() {

    const palettes = {

        sunny: [
            '#bfefff',
            '#78df91',
            '#ffd84d'
        ],

        sunset: [
            '#ffb18c',
            '#b87f9c',
            '#ffcc6a'
        ],

        night: [
            '#18264d',
            '#304b76',
            '#a7c7ff'
        ],

        candy: [
            '#ffd6ef',
            '#a7e9d5',
            '#ff8fc7'
        ],

        forest: [
            '#bfe7c0',
            '#5ca66b',
            '#e8c95c'
        ]
    };

    const p =
        palettes[world] ||
        palettes.sunny;


    // Sky
    ctx.fillStyle = p[0];

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Sun / moon
    ctx.fillStyle = p[2];

    ctx.fillRect(
        760,
        45,
        70,
        70
    );


    // Clouds
    ctx.fillStyle =
        'rgba(255,255,255,.8)';

    const clouds = [
        { x: 130, y: 70 },
        { x: 450, y: 105 },
        { x: 650, y: 65 }
    ];

    for (const c of clouds) {

        ctx.fillRect(
            c.x,
            c.y,
            70,
            20
        );

        ctx.fillRect(
            c.x + 20,
            c.y - 14,
            35,
            34
        );
    }


    // Background trees
    ctx.fillStyle = p[1];

    for (
        let x = -40;
        x < canvas.width;
        x += 170
    ) {

        ctx.fillRect(
            x,
            300,
            28,
            42
        );

        ctx.fillRect(
            x + 8,
            286,
            12,
            14
        );
    }
}


// ============================================================
// OBSTACLE IMAGE
// ============================================================

const obstacleImage = new Image();

obstacleImage.src =
    '/assets/obstacles/cylinder.png';


// ============================================================
// DRAW OBSTACLE
// ============================================================

function drawObstacle(o) {

    if (o.type === 'cylinder') {

        if (
            obstacleImage.complete &&
            obstacleImage.naturalWidth
        ) {

            ctx.drawImage(
                obstacleImage,
                o.x,
                o.y - 5,
                o.w,
                o.h + 5
            );

        } else {

            drawPixelRect(
                o.x + 8,
                o.y,
                36,
                o.h,
                '#ff9c4a'
            );

            ctx.fillStyle =
                '#ffd84d';

            ctx.fillRect(
                o.x,
                o.y - 5,
                o.w,
                12
            );

            ctx.strokeStyle =
                '#171717';

            ctx.lineWidth = 4;

            ctx.strokeRect(
                o.x,
                o.y - 5,
                o.w,
                12
            );

            ctx.fillStyle =
                '#171717';

            ctx.fillRect(
                o.x + 18,
                o.y + 20,
                8,
                8
            );
        }

    } else {

        drawPixelRect(
            o.x,
            o.y,
            o.w,
            o.h,
            '#9c86ff'
        );

        ctx.fillStyle =
            '#171717';

        ctx.fillRect(
            o.x + 12,
            o.y + 12,
            10,
            10
        );

        ctx.fillRect(
            o.x + 48,
            o.y + 12,
            10,
            10
        );
    }
}


// ============================================================
// DRAW PLAYER AVATAR
// ============================================================

function drawPlayerAvatar(
    x,
    y,
    size
) {

    ctx.save();


    // Circle
    ctx.beginPath();

    ctx.arc(
        x,
        y,
        size / 2,
        0,
        Math.PI * 2
    );

    ctx.clip();


    if (
        playerAvatarImage &&
        playerAvatarImage.complete
    ) {

        ctx.drawImage(
            playerAvatarImage,
            x - size / 2,
            y - size / 2,
            size,
            size
        );

    } else {

        // Default head
        ctx.fillStyle =
            '#f5cfa0';

        ctx.fillRect(
            x - size / 2,
            y - size / 2,
            size,
            size
        );


        // Hair
        ctx.fillStyle =
            '#171717';

        ctx.fillRect(
            x - size / 2,
            y - size / 2,
            size,
            8
        );


        // Eyes
        ctx.fillStyle =
            '#111827';

        ctx.fillRect(
            x - 10,
            y - 5,
            5,
            7
        );

        ctx.fillRect(
            x + 5,
            y - 5,
            5,
            7
        );
    }


    ctx.restore();


    // Pixel outline
    ctx.strokeStyle =
        '#171717';

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        size / 2,
        0,
        Math.PI * 2
    );

    ctx.stroke();
}


// ============================================================
// DRAW PLAYER
// ============================================================

function drawPlayer() {

    const p = player;

    const crouching =
        p.crouching;

    const running =
        !crouching &&
        runningGame();

    const swing =
        running
            ? Math.sin(p.runPhase)
            : 0;

    const bob =
        running
            ? Math.abs(
                Math.sin(
                    p.runPhase * 2
                )
            ) * 2
            : 0;


    const baseX =
        p.x;

    const baseY =
        p.y + bob;


    ctx.save();


    // ========================================================
    // CROUCH / SITTING
    // ========================================================

    if (crouching) {

        const sitY =
            p.y + 20;


        // Tail
        ctx.fillStyle =
            '#1d4ed8';

        ctx.fillRect(
            baseX + 1,
            sitY + 21,
            14,
            9
        );

        ctx.fillRect(
            baseX - 4,
            sitY + 25,
            10,
            7
        );


        // Body
        ctx.fillStyle =
            '#2563eb';

        ctx.fillRect(
            baseX + 10,
            sitY + 12,
            34,
            27
        );


        // Belly
        ctx.fillStyle =
            '#60a5fa';

        ctx.fillRect(
            baseX + 18,
            sitY + 18,
            20,
            16
        );


        // Head / profile
        drawPlayerAvatar(
            baseX + 27,
            sitY + 2,
            38
        );


        // Left arm
        ctx.fillStyle =
            '#2563eb';

        ctx.fillRect(
            baseX + 7,
            sitY + 27,
            8,
            16
        );

        ctx.fillRect(
            baseX + 5,
            sitY + 40,
            10,
            5
        );


        // Right arm
        ctx.fillRect(
            baseX + 39,
            sitY + 27,
            8,
            14
        );

        ctx.fillRect(
            baseX + 38,
            sitY + 39,
            10,
            5
        );


        // Left thigh
        ctx.fillStyle =
            '#1e40af';

        ctx.fillRect(
            baseX + 12,
            sitY + 36,
            18,
            9
        );

        ctx.fillRect(
            baseX + 6,
            sitY + 43,
            25,
            8
        );


        // Right thigh
        ctx.fillRect(
            baseX + 27,
            sitY + 36,
            18,
            9
        );

        ctx.fillRect(
            baseX + 36,
            sitY + 43,
            25,
            8
        );


        // Feet
        ctx.fillStyle =
            '#172554';

        ctx.fillRect(
            baseX + 2,
            sitY + 49,
            25,
            7
        );

        ctx.fillRect(
            baseX + 42,
            sitY + 49,
            25,
            7
        );


        // Toes
        ctx.fillStyle =
            '#0f172a';

        ctx.fillRect(
            baseX + 1,
            sitY + 54,
            8,
            4
        );

        ctx.fillRect(
            baseX + 13,
            sitY + 54,
            8,
            4
        );

        ctx.fillRect(
            baseX + 43,
            sitY + 54,
            8,
            4
        );

        ctx.fillRect(
            baseX + 55,
            sitY + 54,
            8,
            4
        );


        // Funny sweat drop
        ctx.fillStyle =
            '#38bdf8';

        ctx.fillRect(
            baseX + 53,
            sitY - 2,
            4,
            7
        );


        // Funny motion lines
        ctx.fillStyle =
            '#94a3b8';

        ctx.fillRect(
            baseX - 12,
            sitY + 43,
            8,
            2
        );

        ctx.fillRect(
            baseX - 17,
            sitY + 49,
            11,
            2
        );


        ctx.restore();

        return;
    }


    // ========================================================
    // NORMAL RUNNING CHARACTER
    // ========================================================

    const bodyX =
        baseX + 12;

    const bodyY =
        baseY + 17;


    // Tail
    ctx.fillStyle =
        '#1d4ed8';

    ctx.fillRect(
        baseX + 3,
        bodyY + 15,
        12,
        9
    );

    ctx.fillRect(
        baseX - 3,
        bodyY + 19,
        10,
        7
    );


    // Body
    ctx.fillStyle =
        '#2563eb';

    ctx.fillRect(
        bodyX,
        bodyY,
        31,
        34
    );


    // Belly
    ctx.fillStyle =
        '#60a5fa';

    ctx.fillRect(
        bodyX + 7,
        bodyY + 7,
        17,
        21
    );


    // Head / profile picture
    drawPlayerAvatar(
        baseX + 28,
        bodyY - 4,
        40
    );


    // ========================================================
    // RUNNING ARMS
    // ========================================================

    const armSwing =
        swing * 9;


    // Back arm
    ctx.save();

    ctx.translate(
        bodyX + 5,
        bodyY + 10
    );

    ctx.rotate(
        -0.35 +
        armSwing * 0.035
    );

    ctx.fillStyle =
        '#2563eb';

    ctx.fillRect(
        -4,
        0,
        8,
        22
    );

    ctx.fillRect(
        -7,
        18,
        11,
        7
    );

    ctx.restore();


    // Front arm
    ctx.save();

    ctx.translate(
        bodyX + 27,
        bodyY + 10
    );

    ctx.rotate(
        0.35 -
        armSwing * 0.035
    );

    ctx.fillStyle =
        '#2563eb';

    ctx.fillRect(
        -4,
        0,
        8,
        22
    );

    ctx.fillRect(
        -4,
        18,
        11,
        7
    );

    ctx.restore();


    // Hands
    ctx.fillStyle =
        '#93c5fd';

    ctx.fillRect(
        bodyX - 4,
        bodyY + 29 +
        armSwing * 0.25,
        8,
        7
    );

    ctx.fillRect(
        bodyX + 28,
        bodyY + 29 -
        armSwing * 0.25,
        8,
        7
    );


    // ========================================================
    // RUNNING LEGS
    // ========================================================

    const legSwing =
        swing * 14;


    // Back leg
    ctx.save();

    ctx.translate(
        bodyX + 9,
        bodyY + 31
    );

    ctx.rotate(
        legSwing * 0.035
    );

    ctx.fillStyle =
        '#1e40af';

    ctx.fillRect(
        -4,
        0,
        9,
        23
    );

    // Back foot
    ctx.fillStyle =
        '#172554';

    ctx.fillRect(
        -10,
        19,
        19,
        7
    );

    ctx.restore();


    // Front leg
    ctx.save();

    ctx.translate(
        bodyX + 25,
        bodyY + 31
    );

    ctx.rotate(
        -legSwing * 0.035
    );

    ctx.fillStyle =
        '#1e40af';

    ctx.fillRect(
        -4,
        0,
        9,
        23
    );

    // Front foot
    ctx.fillStyle =
        '#172554';

    ctx.fillRect(
        -2,
        19,
        20,
        7
    );

    ctx.restore();


    // Running speed lines
    if (
        running &&
        Math.abs(swing) > 0.7
    ) {

        ctx.fillStyle =
            '#94a3b8';

        ctx.fillRect(
            baseX - 13,
            baseY + 44,
            8,
            2
        );

        ctx.fillRect(
            baseX - 20,
            baseY + 50,
            11,
            2
        );
    }


    ctx.restore();
}


// ============================================================
// CHECK WHETHER GAME IS CURRENTLY RUNNING
// ============================================================

function runningGame() {
    return (
        running &&
        !paused
    );
}


// ============================================================
// DRAW
// ============================================================

function draw() {

    drawBackground();


    // Ground
    ctx.fillStyle =
        world === 'night'
            ? '#21334e'
            : '#78df91';

    ctx.fillRect(
        0,
        400,
        canvas.width,
        20
    );


    // Ground border
    ctx.strokeStyle =
        '#171717';

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(
        0,
        400
    );

    ctx.lineTo(
        canvas.width,
        400
    );

    ctx.stroke();


    // Ground pattern
    ctx.fillStyle =
        '#171717';

    for (
        let x = -groundOffset;
        x < canvas.width;
        x += 40
    ) {

        ctx.fillRect(
            x,
            405,
            20,
            4
        );
    }


    // Obstacles
    for (const o of obstacles) {
        drawObstacle(o);
    }


    // Player
    drawPlayer();


    // Score
    if (els.score) {

        els.score.textContent =
            String(
                Math.floor(score)
            ).padStart(
                5,
                '0'
            );
    }
}


// ============================================================
// MAIN GAME LOOP
// ============================================================

function loop(now) {

    if (!running) return;


    const dt =
        Math.min(
            0.033,
            (now - last) / 1000
        );


    last = now;


    if (!paused) {
        update(dt);
    }


    draw();


    requestAnimationFrame(loop);
}


// Initial draw
draw();


// ============================================================
// START / RESTART BUTTONS
// ============================================================

if ($('startBtn')) {
    $('startBtn').onclick =
        resetGame;
}

if ($('restartBtn')) {
    $('restartBtn').onclick =
        resetGame;
}


// ============================================================
// MODALS
// ============================================================

const backdrop =
    $('modalBackdrop');


function openModal(id) {

    if (!backdrop) return;

    backdrop.classList.remove(
        'hidden'
    );

    document
        .querySelectorAll('.modal')
        .forEach(x =>
            x.classList.add('hidden')
        );

    const modal = $(id);

    if (modal) {
        modal.classList.remove(
            'hidden'
        );
    }
}


function closeModal() {

    if (!backdrop) return;

    backdrop.classList.add(
        'hidden'
    );
}


document
    .querySelectorAll('[data-close]')
    .forEach(
        b => b.onclick = closeModal
    );


if (backdrop) {

    backdrop.addEventListener(
        'click',
        e => {

            if (
                e.target === backdrop
            ) {
                closeModal();
            }
        }
    );
}


// ============================================================
// UI BUTTONS
// ============================================================

if ($('leaderboardBtn')) {

    $('leaderboardBtn').onclick =
        () => openModal(
            'leaderboardPanel'
        );
}


if ($('sideLeaderboardBtn')) {

    $('sideLeaderboardBtn').onclick =
        () => openModal(
            'leaderboardPanel'
        );
}


if ($('chatBtn')) {

    $('chatBtn').onclick =
        () => openModal(
            'chatPanel'
        );
}


if ($('sideChatBtn')) {

    $('sideChatBtn').onclick =
        () => openModal(
            'chatPanel'
        );
}


if ($('profileBtn')) {

    $('profileBtn').onclick =
        () => {

            els.nameInput.value =
                profile.name;

            els.musicSelect.value =
                profile.music || 'off';

            openModal(
                'profilePanel'
            );
        };
}


// ============================================================
// WORLD SELECT
// ============================================================

if (worldSelect) {

    worldSelect.onchange =
        e => {

            world =
                e.target.value;

            localStorage.setItem(
                'dinoWorld',
                world
            );

            draw();
        };
}


// ============================================================
// SPEED SELECT
// ============================================================

if (speedSelect) {

    speedSelect.onchange =
        e => {

            speedMode =
                e.target.value;

            localStorage.setItem(
                'dinoSpeed',
                speedMode
            );
        };
}


// ============================================================
// DARK MODE
// ============================================================

if ($('themeBtn')) {

    $('themeBtn').onclick =
        () => {

            document.body.classList.toggle(
                'dark'
            );

            localStorage.setItem(
                'dinoDark',
                document.body.classList.contains(
                    'dark'
                )
            );
        };
}


if (
    localStorage.getItem(
        'dinoDark'
    ) === 'true'
) {

    document.body.classList.add(
        'dark'
    );
}


// ============================================================
// SAVE PROFILE
// ============================================================

if ($('saveProfileBtn')) {

    $('saveProfileBtn').onclick =
        () => {

            profile.name =
                (
                    els.nameInput.value.trim() ||
                    'Player'
                ).slice(
                    0,
                    24
                );


            profile.music =
                els.musicSelect.value;


            const file =
                els.avatarInput.files[0];


            if (file) {

                if (
                    file.size >
                    900000
                ) {

                    alert(
                        'Please choose an image under 900 KB.'
                    );

                    return;
                }


                const reader =
                    new FileReader();


                reader.onload =
                    () => {

                        profile.avatar =
                            reader.result;

                        saveProfile();

                        closeModal();
                    };


                reader.readAsDataURL(
                    file
                );

            } else {

                saveProfile();

                closeModal();
            }
        };
}


// ============================================================
// LEADERBOARD
// ============================================================

function renderLeaderboard(list) {

    const sorted =
        [...list].sort(
            (a, b) =>
                Number(b.score) -
                Number(a.score)
        );


    if (!sorted.length) {

        els.leaderboardList.innerHTML =
            `
            <div class="leader-row">
                <div></div>

                <div>
                    <strong>No runs yet.</strong>
                    <br>
                    <small>Be the first legend.</small>
                </div>

                <div></div>
            </div>
            `;

        return;
    }


    els.leaderboardList.innerHTML =
        sorted
            .slice(0, 100)
            .map(
                (p, i) => `

                <div class="leader-row">

                    <div class="rank">
                        ${i + 1}
                    </div>

                    <div class="player-cell">

                        <div class="mini-avatar">
                            ${avatarHTML(p.avatar)}
                        </div>

                        <strong>
                            ${escapeHtml(p.name)}
                        </strong>

                    </div>

                    <div class="leader-score">
                        ${Number(p.score).toLocaleString()}
                    </div>

                </div>

                `
            )
            .join('');
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(s) {

    return String(s).replace(
        /[&<>"']/g,
        c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[c])
    );
}


// ============================================================
// SOCKET: LEADERBOARD
// ============================================================

socket.on(
    'leaderboard',
    renderLeaderboard
);


// ============================================================
// SOCKET: ONLINE COUNT
// ============================================================

socket.on(
    'onlineCount',
    n => {

        if (els.onlineCount) {
            els.onlineCount.textContent =
                n;
        }

        if (els.onlineCountModal) {
            els.onlineCountModal.textContent =
                n;
        }
    }
);


// ============================================================
// SOCKET: CHAT
// ============================================================

socket.on(
    'chat',
    m => {

        const row =
            document.createElement(
                'div'
            );


        row.className =
            'chat-message';


        row.innerHTML = `

            <div class="player-cell">

                <div class="mini-avatar">
                    ${avatarHTML(m.avatar)}
                </div>

                <div>

                    <b>
                        ${escapeHtml(m.name)}
                    </b>

                    <span class="chat-time">
                        ${new Date(
            m.time
        ).toLocaleTimeString()}
                    </span>

                </div>

            </div>

            <div>
                ${escapeHtml(m.message)}
            </div>

        `;


        els.chatMessages.appendChild(
            row
        );


        els.chatMessages.scrollTop =
            els.chatMessages.scrollHeight;
    }
);


// ============================================================
// CHAT FORM
// ============================================================

if ($('chatForm')) {

    $('chatForm').addEventListener(
        'submit',
        e => {

            e.preventDefault();


            const input =
                $('chatInput');


            const message =
                input.value.trim();


            if (message) {

                socket.emit(
                    'chat',
                    {
                        message
                    }
                );
            }


            input.value = '';
        }
    );
}