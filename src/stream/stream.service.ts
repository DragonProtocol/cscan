import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Network, Status, Stream } from '../entities/stream/stream.entity';
import { StreamRepository } from '../entities/stream/stream.repository';

@Injectable()
export default class StreamService {
  private readonly logger = new Logger(StreamService.name);

  constructor(
    @InjectRepository(Stream, 'testnet')
    private readonly streamRepository: StreamRepository,
  ) {}

  async findByStreamId(network: Network, streamId: string): Promise<Stream> {
    return await this.streamRepository.findOne({
      where: { network: network, stream_id: streamId },
    });
  }

  async findStreams(
    network: Network,
    familyOrApps: string[],
    did: string,
    pageSize: number,
    pageNumber: number,
    types: string[],
  ): Promise<Stream[]> {
    let whereSql = 'network=:network';
    if (familyOrApps && familyOrApps.length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'family IN (:...familyOrApps) OR domain IN (:...familyOrApps)';
    }
    if (did?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'did=:did';
    }
    if (types && types.length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'type In (:...types)';
    }

    return await this.streamRepository
      .createQueryBuilder()
      .where(whereSql, {
        network: network,
        familyOrApps: familyOrApps,
        did: did,
        types: types,
      })
      .limit(pageSize)
      .offset(pageSize * (pageNumber - 1))
      .orderBy('created_at', 'DESC')
      .getMany();
  }

  async getRelationStreamIds(
    ceramic: any,
    modelStreamId: string,
  ): Promise<string[]> {
    if (!ceramic || modelStreamId?.length == 0) return [];

    const stream = await ceramic.loadStream(modelStreamId);
    const relationModelStreamIds = Object.values(
      stream?.content?.relations,
    ).map((o: any) => o.model);
    return relationModelStreamIds;
  }

  async findModelUseCount(
    network: Network,
    models: string[],
  ): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();

    const useCountResult = await this.streamRepository
      .createQueryBuilder('streams')
      .select(['streams.model, count(streams.stream_id) as count'])
      .where('network=:network', {
        network: network,
      })
      .andWhere('streams.model IN (:...models)', { models: models })
      .groupBy('streams.model')
      .getRawMany();

    useCountResult?.forEach((r) => {
      useCountMap.set(r['model'], Number(r['count']));
    });
    return useCountMap;
  }

  async findModelUseCountOrderByUseCount(
    network: Network,
    models: string[],
    pageSize?: number,
    pageNumber?: number,
  ): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();

    const useCountResult = await this.streamRepository
      .createQueryBuilder('streams')
      .select(['streams.model, count(streams.stream_id) as count'])
      .where('network=:network', {
        network: network,
      })
      .andWhere('model IN (:...models)', {
        models: models,
      })
      .groupBy('streams.model')
      .limit(pageSize)
      .offset(pageSize * (pageNumber - 1))
      .orderBy('count', 'DESC')
      .getRawMany();

    useCountResult?.forEach((r) => {
      useCountMap.set(r['model'], Number(r['count']));
    });
    return useCountMap;
  }

  async findAllModelUseCount(
    network: Network,
    models: string[],
  ): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();

    const useCountResult = await this.streamRepository
      .createQueryBuilder('streams')
      .select(['streams.model, count(streams.stream_id) as count'])
      .where('network=:network', {
        network: network,
      })
      .andWhere('model IN (:...models)', {
        models: models,
      })
      .groupBy('streams.model')
      .getRawMany();

    useCountResult?.forEach((r) => {
      useCountMap.set(r['model'], Number(r['count']));
    });
    return useCountMap;
  }

  async getTopics(
    network: Network,
  ): Promise<any> {
    const sortmap = (map) => {
      const arr = Array.from(map);
      arr.sort((a, b) => b[1] - a[1]);
      return arr;
    };
    const sortmapex = (map) => { 
      return sortmap(map).map(e => ( { name: e[0], num: e[1] } ) )
    };

    const streams = await this.streamRepository
      .createQueryBuilder('streams')
      .select(['streams.id', 'streams.family', 'streams.domain', 'streams.network'])
      .limit(20000)
      .orderBy('id', 'DESC')
      .getMany();

    const familyMap = new Map<string, number>();      
    const domainMap = new Map<string, number>();     

    streams.forEach(e => {
      if(e.getNetwork != network) {
        return;
      }

      let key, map;

      key = e.getFamily;
      map = familyMap;
      if(key) { map.set(key, (map.get(key)??0)+1); }

      key = e.getDomain;
      map = domainMap;
      if(key) { map.set(key, (map.get(key)??0)+1); }
    })
    
    return {
      familys: sortmapex(familyMap),
      domains: sortmapex(domainMap),
    };
  }
}
