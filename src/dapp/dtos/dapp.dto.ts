import { ApiProperty } from '@nestjs/swagger';
import { Network } from 'src/entities/stream/stream.entity';

export class CreateDappDto {
  @ApiProperty()
  graphql: string;
  @ApiProperty()
  network?: Network;
}