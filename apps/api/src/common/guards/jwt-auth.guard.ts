import { Injectable, type ExecutionContext, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger("JwtAuthGuard");

  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // DEV_AUTH_BYPASS logic
    if (
      process.env['NODE_ENV'] === "development" &&
      process.env['DEV_AUTH_BYPASS'] === "true" &&
      process.env['DEV_TEST_USER_ID']
    ) {
      const request = context.switchToHttp().getRequest();
      request.user = { id: process.env['DEV_TEST_USER_ID'], role: "user" }; // Mock user
      this.logger.warn(
        `WARNING: Development authentication bypass is ENABLED. Mocking user ${process.env['DEV_TEST_USER_ID']}. Never enable this in production.`
      );
      return true;
    }

    return super.canActivate(context);
  }
}
