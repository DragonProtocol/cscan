import {
  Controller,
  Get,
  Logger,
  Param,
  NotFoundException,
  Redirect,
  Headers,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('/')
@Controller('/')
export class BaseController {
  private readonly logger = new Logger(BaseController.name);

  @Get('/')
  async get(): Promise<string> {
    return 'hello';
  }
}
