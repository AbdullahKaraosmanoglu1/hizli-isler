import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

function getHeaderKey(req: any): string | undefined {
  return req.headers['x-api-key'] || req.headers['X-Api-Key'] || req.headers['x-api-Key'];
}

@Injectable()
export class AnyKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = getHeaderKey(req);
    const op = process.env.OPERATOR_API_KEY;
    const rep = process.env.REPORT_API_KEY;
    if (key && (key === op || key === rep)) return true;
    throw new UnauthorizedException('Invalid or missing X-Api-Key');
  }
}

@Injectable()
export class ReportKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = getHeaderKey(req);
    const rep = process.env.REPORT_API_KEY;
    if (key && key === rep) return true;
    throw new UnauthorizedException('Report key required');
  }
}
