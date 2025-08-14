# voxel

Realtime chat • P2P video calls • Collaborative whiteboard.
Stack: **Node.js**, **Next.js**, **Socket.IO**, **WebRTC**.

<p align="center">
  <a href="#"><img alt="build" src="https://img.shields.io/badge/build-passing-brightgreen"></a>
  <a href="#"><img alt="license" src="https://img.shields.io/badge/license-MIT-informational"></a>
  <a href="#"><img alt="prs" src="https://img.shields.io/badge/PRs-welcome-blueviolet"></a>
</p>

**Demo:** [https://voxel-web.vercel.app/](https://voxel-web.vercel.app/) ([voxel-web.vercel.app][2])

---

## Features

* **Chat:** rooms/DMs, presence, typing, read receipts (event-driven via Socket.IO).
* **Video/Audio:** WebRTC P2P, mute/cam toggle, screen share, network reconnection.
* **Whiteboard:** infinite canvas, pen/shapes/eraser, color/width, undo/redo, PNG export.
* **Low latency:** DataChannel for board ops when P2P is up; Socket.IO fallback.
* **NAT traversal:** STUN default; TURN fallback ready.
* **Auth-ready:** JWT/session middleware slot.
* **Ops safety:** rate limiting, CORS, env-driven config.

---

## Repo layout

```
voxel/
├─ backend/                 # Node.js signaling + REST (Socket.IO)
├─ frontend/
│  └─ voxel-web/           # Next.js app (client UI)
├─ package.json            # root scripts
└─ …                       # .gitignore, workspace, etc.
```

> Source: repo index shows `backend/` and `frontend/voxel-web/`. ([GitHub][1])

---

## Architecture

```mermaid
flowchart LR
  A[Client (Next.js)] -- Socket.IO --> S[(Signaling: Node.js)]
  B[Client (Next.js)] -- Socket.IO --> S
  A <-. WebRTC: media+DataChannel .-> B
  S --- STUN/TURN[(STUN/TURN)]
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
  A<->>B: media + board ops (RTC DataChannel)
```

---

## Quick start (local)

**Prereqs:** Node 18+, npm. (Root has `package-lock.json` → npm default.) ([GitHub][1])

1. Clone & install

```bash
git clone https://github.com/suryansh-mishra/voxel
cd voxel
npm install
```

2. Env

Create `.env` files (examples below). Names may differ—adjust to your code.

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

3. Run dev (two terminals)

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

## Scripts (suggested)

In **root** `package.json` (adapt if you already have them):

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

> If using plain JS, drop `typecheck`. If using pnpm/turbo, swap accordingly.

---

## Event contract (Socket.IO)

Namespace pattern: `/rtc/:roomId`

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

* Local-first; drawing actions → **ops** (`addPath`, `erase`, `transform`, `style`).
* Causality: room + user clocks; resolve with LWW for style, tombstones for deletes.
* Transport: prefer RTC DataChannel; fallback to Socket.IO when P2P not ready.

---

## Deployment

* **Frontend:** Vercel works (demo hosted there). Set `NEXT_PUBLIC_*` env. ([voxel-web.vercel.app][2])
* **Backend:** any Node host. Expose `PORT`, enable CORS to your web origin.
* **TURN (prod):** run coturn; set TURN envs above.
* **Scale:** Socket.IO Redis adapter for horizontal scale; separate web and signaling.

---

## Security notes

* Scope room tokens by `roomId` + TTL.
* Strict CORS. Rate-limit connects/joins/messages.
* Media stays P2P; server only signals (TURN may relay).
* Add profanity/abuse filters on chat events.

---

## Contributing

Issues/PRs welcome. Keep diffs small, add tests for event handlers, and document new events.

---

## License

MIT

---
