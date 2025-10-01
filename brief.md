# Leaderboard & Achievements Service

## Overview

We want a lightweight web application that allows small indie games to integrate global leaderboards and achievements. The service should be simple enough for hobbyist or indie developers to plug into their games, but also have a web dashboard for non-technical users (like community managers) to review stats.

The project should have both a backend service (API) and a frontend dashboard.

## 🎯 Goals

- Provide an easy way for games to submit player scores and unlock achievements.

- Allow game developers to retrieve and display leaderboards inside their games.

- Give admins/community managers a dashboard to view and manage games, players, leaderboards, and achievements.

## 📦 MVP (Minimum Viable Product)

The MVP should cover the following essentials:

### Backend (API)

- **Authentication:**

	- Admin login to access dashboard.

	- API key per game (so each game can submit scores securely).

- **Games:**

	- Create/manage a game (name, short code, API key).

- **Players:**

	- Register a player (username, email optional).

	- Each player belongs to one game.

- **Leaderboards:**

	- Submit a score for a player.

	- Retrieve the top N scores for a given game.

- **Achievements:**

	- Define achievements per game (title, description, criteria in plain text).

	- Unlock achievements for a player.

	- Retrieve unlocked achievements for a player.

## Frontend (Dashboard)

- **Login screen** (admin access).

- **Game management page:** Create/list games with their API key.

- **Player leaderboard page:** Show top N players for a selected game.

- **Achievements page:** Create/list achievements for a game.

## 🌱 Nice-to-Have Features (Future Iterations)

- **Public leaderboards:** A shareable page (read-only) that can be embedded into a game’s website.

- **Player profiles:** Each player can log in to view their own scores and unlocked achievements.

- **Charts & analytics:**

	- Daily active players.

	- Most common achievements unlocked.

- **Multiple leaderboards per game:** (e.g., “Fastest Time” vs “Highest Score”).

- **Webhook support:** Notify a game when a player unlocks an achievement.

- **Unity SDK wrapper:** A small Unity package to make API integration easy.

## 💡 Technical Guidance (for dev team)

- **Frontend:** React or Next.js (with Tailwind for styling).

- **Backend:** Node.js + Express or NestJS (or Spring Boot, if preferred).

- **Database:** Postgres (storing games, players, scores, achievements).

- **Auth:** JWT for admin login; API key for games.

- **Deployment:** Containerized with Docker, basic CI/CD.

## ✅ Deliverables

- [ ] Functional backend with documented API endpoints (Swagger or Postman collection).

- [ ] Frontend dashboard (admin only for MVP).

- [ ] SQL schema included in repo.

- [ ] Clear README with setup instructions.