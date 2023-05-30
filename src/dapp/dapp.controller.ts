import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BasicMessageDto } from '../common/dto';
import DappService from './dapp.service';

@ApiTags('/dapps')
@Controller('/dapps')
export class DappController {
  private readonly logger = new Logger(DappController.name);
  constructor(
    private readonly dappService: DappService,
  ) {
  }
}
