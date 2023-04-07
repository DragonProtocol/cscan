import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaModel, MetaModelMainnet } from '../entities/model/model.entity';
import { MetaModelMainnetRepository, MetaModelRepository } from '../entities/model/model.repository';
import { In, Repository } from 'typeorm';
import { Network } from 'src/entities/stream/stream.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { S3_MAINNET_MODELS_USE_COUNT_ZSET, S3_TESTNET_MODELS_USE_COUNT_ZSET } from 'src/common/constants';

@Injectable()
export default class ModelService {
  private readonly logger = new Logger(ModelService.name);

  constructor(
    @InjectRepository(MetaModel, 'testnet')
    private readonly metaModelRepository: MetaModelRepository,

    @InjectRepository(MetaModelMainnet, 'mainnet')
    private readonly metaModelMainnetRepository: MetaModelMainnetRepository,

    @InjectRedis() private readonly redis: Redis,
  ) { }

  getMetaModelRepository(network: Network) {
    return (network == Network.MAINNET) ? this.metaModelMainnetRepository : this.metaModelRepository;
  }

  async findModelsByIds(streamIds: string[], network: Network = Network.TESTNET): Promise<MetaModel[] | MetaModelMainnet[]> {
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
  ): Promise<MetaModel[] | MetaModelMainnet[]> {
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

  async getModelsByDecsPagination(network: Network, pageSize: number,
    pageNumber: number): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();
    const key = network == Network.MAINNET ? S3_MAINNET_MODELS_USE_COUNT_ZSET : S3_TESTNET_MODELS_USE_COUNT_ZSET;
    const memebers = await this.redis.zrange(key, -(pageSize*pageNumber+1), -((pageNumber-1)*pageSize+1),'WITHSCORES');
    for (let index = 0; index < memebers.length; index++) {
        if (index%2 == 0){
          useCountMap.set(memebers[index], +memebers[index+1]);
        }      
    }
    return useCountMap;
  }

  async updateModelUseCount(network: Network, useCountMap: Map<string, number>) {
    const key = network == Network.MAINNET ? S3_MAINNET_MODELS_USE_COUNT_ZSET : S3_TESTNET_MODELS_USE_COUNT_ZSET;
    const members: (string | Buffer | number)[] = [];
    Array.from(useCountMap).forEach(([modelId, useCount]) => {
      members.push(useCount);
      members.push(modelId);
    })
    await this.redis.zadd(key, ...members);
  }
}
