import { Module } from '@nestjs/common';
import { Player } from './entities/players.entity';
import { PlayerController } from './players.controller';
import { PlayerService } from './players.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Player])],
	controllers: [PlayerController],
	providers: [PlayerService],
})
export class PlayerModule {}
