import { EntityRepository, Repository } from 'typeorm';
import { MetaModel, MetaModelMainnet } from './model.entity';

@EntityRepository(MetaModel)
export class MetaModelRepository extends Repository<MetaModel> {}

@EntityRepository(MetaModelMainnet)
export class MetaModelMainnetRepository extends Repository<MetaModelMainnet> {}
