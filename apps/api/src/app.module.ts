import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { CalendarModule } from "./modules/calendar/calendar.module";
import { NotesModule } from "./modules/notes/notes.module";
import { GoalsModule } from "./modules/goals/goals.module";
import { HabitsModule } from "./modules/habits/habits.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { HealthModule } from "./modules/health/health.module";
import { AiModule } from "./modules/ai/ai.module";
import { HealthController } from "./health.controller";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env", "../../.env.local", "../../.env"],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>("MONGODB_URI");
        if (!uri) {
          throw new Error("MONGODB_URI environment variable is missing!");
        }
        return {
          uri,
          dbName: configService.get<string>("MONGODB_DB_NAME", "lifeos"),
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      { name: "default", ttl: 60_000, limit: 100 },
      { name: "auth", ttl: 60_000, limit: 10 },
      { name: "ai", ttl: 60_000, limit: 20 },
    ]),
    AuthModule,
    UsersModule,
    TasksModule,
    CalendarModule,
    NotesModule,
    GoalsModule,
    HabitsModule,
    FinanceModule,
    HealthModule,
    AiModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
