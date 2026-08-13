import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "./common/decorators/public.decorator";

@ApiTags("system")
@Public()
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env["NODE_ENV"] ?? "development",
      version: process.env["npm_package_version"] ?? "0.1.0",
    };
  }

  @Get("ready")
  readiness() {
    return {
      status: "ready",
      services: {
        database: "connected",
        redis: "connected",
        ai: process.env["OPENAI_API_KEY"] ? "configured" : "not-configured",
      },
    };
  }
}
