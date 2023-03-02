import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import ModelService from './model.service';
import { BasicMessageDto } from '../common/dto';
import StreamService from 'src/stream/stream.service';
import { Network } from 'src/entities/stream/stream.entity';

@ApiTags('/models')
@Controller('/models')
export class ModelController {
  private readonly logger = new Logger(ModelController.name);
  constructor(
    private readonly modelService: ModelService,
    private readonly streamService: StreamService,
  ) { }

  @Get('/')
  @ApiQuery({
    name: 'name',
    required: false,
  })
  @ApiQuery({
    name: 'description',
    required: false,
  })
  @ApiQuery({
    name: 'startTimeMs',
    required: false,
  })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
  })
  @ApiOkResponse({ type: BasicMessageDto })
  async getStreams(
    @Query('name') name?: string,
    @Query('description') description?: string,
    @Query('startTimeMs') startTimeMs: number = 0,
    @Query('pageSize') pageSize?: number,
    @Query('pageNumber') pageNumber?: number,
  ): Promise<BasicMessageDto> {
    if (!pageSize || pageSize == 0) pageSize = 50;
    if (!pageNumber || pageNumber == 0) pageNumber = 1;

    const metaModels = await this.modelService.findModels(
      pageSize,
      pageNumber,
      name,
      description,
      startTimeMs,
    );
    if (metaModels?.length == 0) return new BasicMessageDto('ok', 0, []);

    const models = metaModels.map((m) => m.getStreamId);
    const useCountMap = await this.streamService.findModelUseCount(
      Network.TESTNET,
      models,
    );

    return new BasicMessageDto(
      'ok',
      0,
      metaModels.map((m) => ({
        ...m,
        useCount: useCountMap?.get(m.getStreamId) ?? 0,
      })),
    );
  }
}
