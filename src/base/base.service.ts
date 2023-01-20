import { Injectable, Logger } from '@nestjs/common';
import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { floodsub } from '@libp2p/floodsub';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { bootstrap } from '@libp2p/bootstrap';
import { StreamID } from '@ceramicnetwork/streamid';
import { CID } from 'multiformats/cid';
import { UnreachableCaseError, toCID } from '@ceramicnetwork/common';

@Injectable()
export class BaseService {
  private readonly logger = new Logger(BaseService.name);

  constructor() {
  }
}
export const subCeramic = async () => {
  // Known peers addresses
  const bootstrapMultiaddrs = [
    '/dns4/go-ipfs-ceramic-public-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmWiY3CbNawZjWnHXx3p3DXsg21pZYTj4CRY1iwMkhP8r3',
    '/dns4/go-ipfs-ceramic-public-clay-external.ceramic.network/tcp/4011/ws/p2p/QmSqeKpCYW89XrHHxtEQEWXmznp6o336jzwvdodbrGeLTk',
    '/dns4/go-ipfs-ceramic-private-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmQotCKxiMWt935TyCBFTN23jaivxwrZ3uD58wNxeg5npi',
    '/dns4/go-ipfs-ceramic-private-cas-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmbeBTzSccH8xYottaYeyVX8QsKyox1ExfRx7T1iBqRyCd',
  ];

  const node = await createLibp2p({
    peerDiscovery: [
      bootstrap({
        list: bootstrapMultiaddrs, // provide array of multiaddrs
      }),
    ],
    connectionManager: {
      autoDial: true, // Auto connect to discovered peers (limited by ConnectionManager minConnections)
      // The `tag` property will be searched when creating the instance of your Peer Discovery service.
      // The associated object, will be passed to the service when it is instantiated.
    },
    addresses: {
      listen: ['/ip4/127.0.0.1/tcp/20000/ws'],
    },
    transports: [webSockets()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    pubsub: floodsub(),
  });
  const topic = '/ceramic/testnet-clay';
  node.pubsub.subscribe(topic);
  node.pubsub.addEventListener('message', (evt) => {
    console.log(
      `node received: ${deserialize(evt.detail.data)} on topic ${evt.detail.topic
      }`,
    );
  });
}
/**
 * Ceramic Pub/Sub message type.
 */
export enum MsgType {
  UPDATE,
  QUERY,
  RESPONSE,
  KEEPALIVE,
}

export type UpdateMessage = {
  typ: MsgType.UPDATE;
  stream: StreamID;
  tip: CID;
  model?: StreamID;
};

export type QueryMessage = {
  typ: MsgType.QUERY;
  id: string;
  stream: StreamID;
};

export type ResponseMessage = {
  typ: MsgType.RESPONSE;
  id: string;
  tips: Map<string, CID>;
};

// All nodes will always ignore this message
export type KeepaliveMessage = {
  typ: MsgType.KEEPALIVE;
  ts: number; // current time
  ver: string; // current ceramic version
};

export type PubsubMessage =
  | UpdateMessage
  | QueryMessage
  | ResponseMessage
  | KeepaliveMessage;

export function deserialize(message: any): PubsubMessage {
  const textDecoder = new TextDecoder('utf-8');
  const asString = textDecoder.decode(message.data);
  const parsed = JSON.parse(asString);

  const typ = parsed.typ as MsgType;
  switch (typ) {
    case MsgType.UPDATE: {
      // TODO don't take streamid from 'doc' once we no longer interop with nodes older than v1.0.0
      const stream = StreamID.fromString(parsed.stream || parsed.doc);

      return {
        typ: MsgType.UPDATE,
        stream,
        tip: toCID(parsed.tip),
        ...(parsed.model && { model: StreamID.fromString(parsed.model) }),
      };
    }
    case MsgType.RESPONSE: {
      const tips: Map<string, CID> = new Map();
      Object.entries<string>(parsed.tips).forEach(([key, value]) =>
        tips.set(key, toCID(value)),
      );
      return {
        typ: MsgType.RESPONSE,
        id: parsed.id,
        tips: tips,
      };
    }
    case MsgType.QUERY: {
      // TODO don't take streamid from 'doc' once we no longer interop with nodes older than v1.0.0
      const stream = StreamID.fromString(parsed.stream || parsed.doc);
      return {
        typ: MsgType.QUERY,
        id: parsed.id,
        stream,
      };
    }
    case MsgType.KEEPALIVE: {
      return {
        typ: MsgType.KEEPALIVE,
        ts: parsed.ts,
        ver: parsed.ver,
      };
    }
    default:
      throw new UnreachableCaseError(typ, 'Unknown message type');
  }
}
