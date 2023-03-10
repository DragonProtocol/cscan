import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
export enum Network {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}

export enum Status {
  ANCHORED = 'ANCHORED',
  NOT_ANCHORED = 'NOT_ANCHORED',
}

@Entity({
  name: 'kh4q0ozorrgaq2mezktnrmdwleo1d',
})
export class MetaModel extends BaseEntity {
  @PrimaryColumn()
  private stream_id: string;

  @Column({ nullable: false })
  private controller_did: string;

  @Column({ nullable: false })
  private tip: string;

  @Column({ type: 'jsonb', default: {} })
  private stream_content: any;

  @Column({ type: 'timestamptz' })
  private last_anchored_at: Date;

  @Column({ type: 'timestamptz' })
  private first_anchored_at: Date;

  @Column({ type: 'timestamptz' })
  private created_at: Date;

  @Column({ type: 'timestamptz' })
  private updated_at: Date;

  get getStreamId(): string {
    return this.stream_id;
  }
  set setStreamId(streamId: string) {
    this.stream_id = streamId;
  }

  get getcCntrollerDid(): string {
    return this.controller_did;
  }
  set setControllerDid(controllerDid: string) {
    this.controller_did = controllerDid;
  }

  get getTip(): string {
    return this.tip;
  }
  set setTip(tip: string) {
    this.tip = tip;
  }

  get getStreamContent(): any {
    return this.stream_content;
  }
  set setStreamContent(streamContent: string) {
    this.stream_content = streamContent;
  }

  get getLastAnchoredAt(): Date {
    return this.last_anchored_at;
  }
  set setLastAnchoredAt(lastAnchoredAt: Date) {
    this.last_anchored_at = lastAnchoredAt;
  }

  get getFirstAnchoredAt(): Date {
    return this.first_anchored_at;
  }
  set setFirstAnchoredAt(firstAnchoredAt: Date) {
    this.first_anchored_at = firstAnchoredAt;
  }

  get getCreatedAt(): Date {
    return this.created_at;
  }
  set setCreatedAt(createdAt: Date) {
    this.created_at = createdAt;
  }

  get getUpdatedAt(): Date {
    return this.updated_at;
  }
  set setUpdatedAt(updatedAt: Date) {
    this.updated_at = updatedAt;
  }
}
