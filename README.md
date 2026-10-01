# Dino World — updated

## Run
1. `npm install express socket.io`
2. `node server.js`
3. Open `http://localhost:3000`

## Custom cylinder PNG
Put your own obstacle image at:
`public/assets/obstacles/cylinder.png`

Recommended source size: **52 × 77 px** (transparent PNG). The game scales it to the obstacle size automatically.

## Music
Put your own royalty-free/local tracks here:
- `public/assets/music/arcade.mp3`
- `public/assets/music/chill.mp3`
- `public/assets/music/night.mp3`

The profile music selector will use the matching file. Browser autoplay rules mean music normally starts after the player presses START RUN.

## Added
- Profile avatar shown in profile, header, side card, leaderboard, chat and on the runner's head.
- Animated running legs and intentionally goofy crouch pose.
- Single/double/triple cylinder groups plus occasional flying obstacles.
- Custom cylinder PNG support.
- Empty real-time leaderboard instead of demo entries.
- 100-point sound milestone.
- Responsive mobile layout and touch jump.
- Dark-mode toggle.
- Five background worlds.
- Chill/normal/turbo speed modes.
- Per-profile music selection.
