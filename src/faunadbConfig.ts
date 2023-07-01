import faunadb from 'faunadb';

const secret = process.env.FAUNADB_SECRET_KEY;
if (!secret) {
  throw new Error("`FAUNADB_SECRET_KEY` must be provided in the `.env` file");
}

export const q = faunadb.query;

export const defaultPageOffset: number = 5;

const faunaClient: faunadb.Client = new faunadb.Client({ 
    secret: secret as string,
});

export default faunaClient;


export const pollsCollectionName: string = 'Polls';
export const pollsVotesByPollIpIndexName: string = 'votes_by_poll_and_ip';


// On first run, make sure that all collections and indexes exists
const dbFactory = async () => {
  await faunaClient.query(
    q.If(
      q.Exists(q.Collection(pollsCollectionName)),
      null,
      q.CreateCollection({ name: pollsCollectionName })
    )
  )
  .then(() => console.log(`Collection - "${pollsCollectionName}" created successfully!`))
  .catch((err) => console.log(`Error while creating collection - "${pollsCollectionName}": ${err}`))

  await faunaClient.query(
    q.If(
      q.Exists(q.Index(pollsVotesByPollIpIndexName)),
      null,
      q.CreateIndex({
        name: pollsVotesByPollIpIndexName,
        source: q.Collection(pollsCollectionName),
        terms: [
          {
            field: ['ref', 'id'],
          },
          {
            field: ['data', 'choices', 'votes', 'voter_ip'],
          },
        ],
      })
    )
  )
  .then(() => console.log(`Index - "${pollsVotesByPollIpIndexName}" created successfully!`))
  .catch((err) => console.log(`Error while creating index - "${pollsVotesByPollIpIndexName}": ${err}`))
};