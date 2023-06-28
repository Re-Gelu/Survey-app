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
export const pollsPaginationIndexName: string = 'polls_pagination';


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
      q.Exists(q.Index(pollsPaginationIndexName)),
      null,
      q.CreateIndex({
        name: pollsPaginationIndexName,
        source: q.Collection(pollsCollectionName),
        values: [{ field: ['ref'] }],
      })
    )
  )
  .then(() => console.log(`Pagination index - "${pollsPaginationIndexName}" created successfully!`))
  .catch((err) => console.log(`Error while creating pagination index - "${pollsPaginationIndexName}": ${err}`))
};