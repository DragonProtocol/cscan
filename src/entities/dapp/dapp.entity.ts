import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum Network {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}

@Entity({ name: 'dapps' })
export class Dapp extends BaseEntity {
  @PrimaryGeneratedColumn()
  private id: number;

  get getId(): number {
    return this.id;
  }
  set setId(id: number) {
    this.id = id;
  }
}
