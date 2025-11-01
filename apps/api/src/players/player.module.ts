import { Module } from '@nestjs/common';
import { Player } from './entities/player.entity';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Player])],
	controllers: [PlayerController],
	providers: [PlayerService],
})
export class PlayerModule {}
