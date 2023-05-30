import {
  UnauthorizedException,
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { BasicMessageDto } from 'src/common/dto';
import IUserRequest from '../interfaces/user-request';
import {
  getDidStrFromDidSession,
  verifyDidSession,
} from 'src/utils/user/user-util';

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  private checkSchemaAndReturnToken(header: string): string {
    const splitTemp = header.split(' ');
    if (splitTemp[0] !== 'Bearer') {
      throw new UnauthorizedException(
        new BasicMessageDto('Authorization Header Schema must be Bearer.', 1),
      );
    } else {
      return splitTemp[1];
    }
  }
  async use(req: IUserRequest, res: Response, next: NextFunction) {
    const didSession = req.headers['did-session'];
    if (didSession) {
      if (!(await verifyDidSession(didSession)))
        throw new BadRequestException(
          `Did session verify error. didSession: ${didSession}`,
        );
    }

    req.did = await getDidStrFromDidSession(didSession);
    next();
  }
}
