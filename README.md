# voxel

Realtime chat • P2P video calls • collaborative whiteboard.
Stack: **Node.js**, **Next.js**, **Socket.IO**, **WebRTC**.

<p align="center">
  <a href="#"><img alt="build" src="https://img.shields.io/badge/build-passing-brightgreen"></a>
  <a href="#"><img alt="license" src="https://img.shields.io/badge/license-MIT-informational"></a>
  <a href="#"><img alt="prs" src="https://img.shields.io/badge/PRs-welcome-blueviolet"></a>
</p>

---

## Features

* **Chat:** rooms/DMs, presence, typing, read receipts.
* **Video/Audio:** WebRTC P2P, mute/cam toggle, screen share, reconnect.
* **Whiteboard:** infinite canvas, pen/shapes/eraser, color/width, undo/redo, PNG export.
* **Low latency:** RTC DataChannel for board ops; Socket.IO fallback.
* **NAT traversal:** STUN default; TURN-ready.
* **Auth-ready:** JWT/session pluggable.
* **Ops safety:** rate limiting, strict CORS, env-driven config.

---

## Repo layout

```
voxel/
├─ backend/                 # Node.js signaling + REST (Socket.IO)
├─ frontend/
│  └─ voxel-web/           # Next.js app (client UI)
├─ package.json            # root scripts
└─ ...
```

---

## Architecture

```mermaid
flowchart LR
  A[Client (Next.js)] -- Socket.IO --> S[(Signaling: Node.js)]
  B[Client (Next.js)] -- Socket.IO --> S
  A <--> B
  S --- STUN_TURN[(STUN/TURN)]
```

**Call setup (sequence)**

```mermaid
sequenceDiagram
  participant A as Client A
  participant S as Socket.IO Server
  participant B as Client B

  A->>S: join(room)
  B->>S: join(room)
  A->>S: webrtc:offer(sdp)
  S-->>B: offer
  B->>S: webrtc:answer(sdp)
  S-->>A: answer
  A->>S: ice-candidate
  B->>S: ice-candidate
  S-->>A: candidate
  S-->>B: candidate
  A<-->B: media + board ops (RTC DataChannel)
```

---

## Quick start (local)

**Prereqs:** Node 18+, npm.

1. **Clone & install**

```bash
git clone https://github.com/suryansh-mishra/voxel
cd voxel
npm install
```

2. **Env**

Create `.env` files (adjust names to your code if they differ).

**`backend/.env`**

```bash
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=change_me

# STUN/TURN
STUN_URL=stun:stun.l.google.com:19302
TURN_URL=
TURN_USERNAME=
TURN_CREDENTIAL=
```

**`frontend/voxel-web/.env.local`**

```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_STUN=stun:stun.l.google.com:19302
NEXT_PUBLIC_TURN_URL=
NEXT_PUBLIC_TURN_USERNAME=
NEXT_PUBLIC_TURN_CREDENTIAL=
```

3. **Run dev (two terminals)**

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend/voxel-web
npm run dev
```

* Web: [http://localhost:3000](http://localhost:3000)
* API/Socket: [http://localhost:4000](http://localhost:4000)

---

## Scripts (root suggestions)

```json
{
  "scripts": {
    "dev": "npm -w backend run dev & npm -w frontend/voxel-web run dev",
    "build": "npm -w backend run build && npm -w frontend/voxel-web run build",
    "start": "npm -w backend start & npm -w frontend/voxel-web start",
    "lint": "eslint .",
    "typecheck": "tsc -b --pretty"
  }
}
```

*If using plain JS, remove `typecheck`. If using pnpm/turbo, adjust accordingly.*

---

## Socket.IO events (contract)

Namespace: `/rtc/:roomId`

* `user:join` → `{ userId, name }`
* `user:leave` → `{ userId }`
* `chat:message` ⇄ `{ id, userId, text, ts }`
* `presence:typing` → `{ userId, isTyping }`
* `webrtc:offer` → `{ from, to?, sdp }`
* `webrtc:answer` → `{ from, to?, sdp }`
* `webrtc:ice-candidate` → `{ from, to?, candidate }`
* `board:ops` ⇄ `{ seq, ops[] }`
* `error` → `{ code, message }`

---

## Whiteboard sync model (overview)

* Local-first; draw actions → **ops**: `addPath`, `erase`, `transform`, `style`.
* Causality via `(roomClock, userClock)`; resolve with LWW for style, tombstones for deletes.
* Transport: prefer **RTC DataChannel**, fallback to Socket.IO until P2P is ready.

---

## Deployment

* **Frontend:** Vercel-compatible. Set `NEXT_PUBLIC_*`.
* **Backend:** any Node host. Expose `PORT`; allow CORS to your web origin.
* **TURN (prod):** run coturn; set `TURN_*` envs.
* **Scale:** Socket.IO Redis adapter; separate web vs signaling services.

---

## Security notes

* Scope room tokens by `roomId` + TTL.
* Strict CORS; rate-limit connects/joins/messages.
* Media stays P2P; server only signals (TURN may relay).
* Optional profanity/abuse filters on chat events.

---

## Contributing

PRs welcome. Keep diffs small, add tests for event handlers, document new events.

---

## License

MIT.
