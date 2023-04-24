import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Network, Status, Stream } from '../entities/stream/stream.entity';
import { StreamRepository } from '../entities/stream/stream.repository';
import { StatsDto } from './dtos/common.dto';

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
      .limit(100000)
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

  async getStats(
    network: Network,
  ): Promise<StatsDto> {
    const dto = new StatsDto();
    let streams = await this.streamRepository
      .createQueryBuilder('streams')
      .select(['streams.id','streams.network', 'streams.created_at'])
      .limit(20000)
      .orderBy('id', 'DESC')
      .getMany();

    streams = streams.filter(e => e.getNetwork == network);

    const now = Math.floor((new Date()).getTime()/100);
    const t1 = Math.floor(streams[0].getCreatedAt.getTime() / 1000);
    const t2 = Math.floor(streams[streams.length-1].getCreatedAt.getTime() / 1000);

    const weeks = [0,0,0,0,0,0,0];
    for(let i=0; i<streams.length; ++i) {
      const t = Math.floor(streams[i].getCreatedAt.getTime() / 1000);
      if(t > now) { continue; }
      console.log('aaa ----------------', (now-t)/(24*3600));
      const idx = weeks.length - 1 - Math.floor((now - t) / (24*3600));
      if(idx < 0) { break; }
      weeks[idx] += 1;
      console.log("---------", idx, weeks[idx]);
    }

    dto.totalStreams = streams[0].getId;
    dto.streamsPerSecond = Math.floor((t1 - t2) / streams.length);
    dto.streamsLastWeek = weeks;

    return dto;
  }
}
