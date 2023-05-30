import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export default class DappService {
  private readonly logger = new Logger(DappService.name);

  constructor(

  ) { }

}
