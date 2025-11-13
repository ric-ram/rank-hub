import * as bcrypt from 'bcrypt';

import { Achievement } from 'src/achievements/entities/achievements.entity';
import { ApiKey } from 'src/api_keys/entities/api_keys.entity';
import { Games } from 'src/games/entities/games.entity';
import { Leaderboard } from 'src/leaderboards/entities/leaderboards.entity';
import { Player } from 'src/players/entities/players.entity';
import { UserAdmin } from 'src/users-admin/entities/users-admin.entity';
import dataSource from './datasource';

async function runSeed() {
	await dataSource.initialize();

	const userRepo = dataSource.getRepository(UserAdmin);
	const gameRepo = dataSource.getRepository(Games);
	const leaderboardRepo = dataSource.getRepository(Leaderboard);
	const achievementRepo = dataSource.getRepository(Achievement);
	const playerRepo = dataSource.getRepository(Player);
	const apiKeyRepo = dataSource.getRepository(ApiKey);

	// 1️⃣ Admin
	const passwordHash = await bcrypt.hash('admin123', 10);
	const admin = userRepo.create({
		email: 'admin@rankhub.dev',
		passwordHash,
		role: 'ADMIN',
	});
	await userRepo.save(admin);

	// 2️⃣ Game
	const game = gameRepo.create({
		name: 'Demo Game',
		shortCode: 'DEMO',
		createdById: admin.id,
	});
	await gameRepo.save(game);

	// 3️⃣ Leaderboard
	const leaderboard = leaderboardRepo.create({
		name: 'Global',
		metricType: 'SCORE',
		orderDir: 'DESC',
		isDefault: true,
		game,
	});
	await leaderboardRepo.save(leaderboard);

	// 4️⃣ Achievement
	const achievement = achievementRepo.create({
		game,
		key: 'first_blood',
		title: 'First Blood',
		description: 'Earn your first score',
	});
	await achievementRepo.save(achievement);

	// 5️⃣ Player
	const player = playerRepo.create({
		game,
		username: 'DemoPlayer',
		email: 'player@rankhub.dev',
	});
	await playerRepo.save(player);

	// 6️⃣ API Key (optional)
	const rawKey = 'rankhub-demo-key';
	const keyHash = await bcrypt.hash(rawKey, 10);
	const apiKey = apiKeyRepo.create({
		game,
		keyHash,
		label: 'Demo Key',
	});
	await apiKeyRepo.save(apiKey);

	console.log(`
		✅ Seed completed!
		Admin login: admin@rankhub.dev / admin123
		Game short code: DEMO
		API Key: ${rawKey}
	`);

	await dataSource.destroy();
}

runSeed().catch((e) => {
	console.error('❌ Seeding failed:', e);
	process.exit(1);
});
