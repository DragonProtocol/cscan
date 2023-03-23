import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaModel, MetaModelMainnet } from '../entities/model/model.entity';
import { MetaModelMainnetRepository, MetaModelRepository } from '../entities/model/model.repository';
import { In, Repository } from 'typeorm';
import { Network } from 'src/entities/stream/stream.entity';

@Injectable()
export default class ModelService {
  private readonly logger = new Logger(ModelService.name);

  constructor(
    @InjectRepository(MetaModel, 'testnet')
    private readonly metaModelRepository: MetaModelRepository,

    @InjectRepository(MetaModelMainnet, 'mainnet')
    private readonly metaModelMainnetRepository: MetaModelMainnetRepository,
  ) { }

  getMetaModelRepository(network: Network) {
    return (network == Network.MAINNET) ? this.metaModelMainnetRepository: this.metaModelRepository;
  }

  async findModelsByIds(streamIds: string[], network: Network = Network.TESTNET): Promise<MetaModel[]|MetaModelMainnet[]> {
    return this.getMetaModelRepository(network).find({
      where: { stream_id: In(streamIds) },
    });
  }

  async findAllModelIds(network: Network): Promise<string[]> {
    const result = await this.getMetaModelRepository(network)
      .createQueryBuilder()
      .select(['stream_id'])
      .getRawMany();
    return result.map((r) => r['stream_id']);
  }

  async findModels(
    pageSize: number,
    pageNumber: number,
    name?: string,
    did?: string,
    description?: string,
    startTimeMs?: number,
    network?: Network,
  ): Promise<MetaModel[]|MetaModelMainnet[]> {
    let whereSql = '';
    if (name?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += `LOWER(stream_content->>'name') LIKE :nameValue`;
    }
    if (did?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += `controller_did=:did`;
    }
    if (description?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += `LOWER(stream_content->>'description') LIKE :descriptionValue`;
    }

    if (startTimeMs > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'created_at > :startTime';
    }

    return await this.getMetaModelRepository(network)
      .createQueryBuilder()
      .where(whereSql, {
        nameValue: '%' + name?.toLowerCase() + '%',
        descriptionValue: '%' + description?.toLowerCase() + '%',
        startTime: new Date(Number(startTimeMs)),
        did: did,
      })
      .limit(pageSize)
      .offset(pageSize * (pageNumber - 1))
      .orderBy('created_at', 'DESC')
      .getMany();
  }
}
