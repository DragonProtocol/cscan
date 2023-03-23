import { ApiProperty } from '@nestjs/swagger';
import { Network } from 'src/entities/stream/stream.entity';

export class CreateModelDto {
  @ApiProperty()
  graphql: string;
  @ApiProperty()
  network?: Network;
}
