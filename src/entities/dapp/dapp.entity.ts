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

export class SocialLink {
  platform: string;
  url: string;
}

@Entity({ name: 'dapps' })
export class Dapp extends BaseEntity {
  @PrimaryGeneratedColumn()
  private id: number;

  @Column({ nullable: true })
  private name: string;

  @Column({ nullable: true })
  private description: string;

  @Column({ nullable: true })
  private icon: string;

  @Column({ nullable: true })
  private url: string;

  @Index()
  @Column({ nullable: true })
  private created_by_did: string;

  @Column({
    type: 'jsonb',
    array: true,
    default: [],
  })
  private social_link: SocialLink[];

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  private tags: string[];

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  private models: string[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  private created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  private last_modified_at: Date;

  get getId(): number {
    return this.id;
  }
  set setId(id: number) {
    this.id = id;
  }

  get getName(): string {
    return this.name;
  }
  set setName(name: string) {
    this.name = name;
  }

  get getDescription(): string {
    return this.description;
  }
  set setDescription(description: string) {
    this.description = description;
  }

  get getIcon(): string {
    return this.icon;
  }
  set setIcon(icon: string) {
    this.icon = icon;
  }

  get getUrl(): string {
    return this.url;
  }

  set setUrl(url: string) {
    this.url = url;
  }

  get getCreatedByDid(): string {
    return this.created_by_did;
  }
  set setCreatedByDid(createdByDid: string) {
    this.created_by_did = createdByDid;
  }

  get getSocialLink(): SocialLink[] {
    return this.social_link;
  }
  set setSocialLink(socialLink: SocialLink[]) {
    this.social_link = socialLink;
  }

  get getTags(): string[] {
    return this.tags;
  }
  set setTags(tags: string[]) {
    this.tags = tags;
  }

  get getModels(): string[] {
    return this.models;
  }
  set setModels(models: string[]) {
    this.models = models;
  }

  get getCreatedAt(): Date {
    return this.created_at;
  }
  set setCreatedAt(createdAt: Date) {
    this.created_at = createdAt;
  }

  get getLastModifiedAt(): Date {
    return this.last_modified_at;
  }
  set setLastModifiedAt(LastModifiedAt: Date) {
    this.last_modified_at = LastModifiedAt;
  }
}
