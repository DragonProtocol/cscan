import { parseToModelGraphqls } from "./parser";

describe('parse schema to graphql', () => {
  it('Parse the graph', () => {
    const modelGraphqls = parseToModelGraphqls(`
      type Thread @loadModel(id: "kjzl6hvfrbw6cafpnfd031iecghmu2bfuhmm38jzf2pywnr3fsp8sh8ow93oihs") {
        id: ID!
      }
      enum VoteType {
        UP_VOTE
        DOWN_VOTE
      }
      type Vote @createModel(accountRelation: LIST, description: "Vote on a thread") {
        creator: DID! @documentAccount
        version: CommitID! @documentVersion
        threadID: StreamID! @documentReference(model: "Thread")
        thread: Thread @relationDocument(property: "threadID")
        date: DateTime
        type: VoteType!
      }
      type Score @createModel(accountRelation: LIST, description: "Score on a thread") {
        creator: DID! @documentAccount
        version: CommitID! @documentVersion
        threadID: StreamID! @documentReference(model: "Thread")
        thread: Thread @relationDocument(property: "threadID")
        text: String! @string(maxLength: 2000)
        value: Int!
        date: DateTime
      }
      `);
      console.log(modelGraphqls);
  });
  
});
