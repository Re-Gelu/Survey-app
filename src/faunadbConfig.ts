import { Client, fql } from 'fauna';

const secret = process.env.FAUNADB_SECRET_KEY;

if (!secret) {
  throw new Error('`FAUNADB_SECRET_KEY` must be provided in the `.env` file');
}

export const defaultPageSize: number = 5;

const faunaClient = new Client({
  secret: secret as string,
});

export default faunaClient;
export { fql } from 'fauna';

export const pollsCollectionName: string = 'Polls';
export const pollsVotesByPollIpIndexName: string = 'votes_by_poll_and_ip';

// On run, make sure that all collections and indexes exists
export const dbFactory = async () => {
  await faunaClient
    .query(
      fql`if (!Collection.byName(${pollsCollectionName}).exists()) {
      Collection.create({ name: ${pollsCollectionName} })
    }`
    )
    .then(() => console.info(`Collection - "${pollsCollectionName}" created successfully!`))
    .catch((err) =>
      console.warn(`Error while creating collection - "${pollsCollectionName}": ${err}`)
    );

  await faunaClient
    .query(
      fql`if (Collection.byName(${pollsCollectionName}).exists() && ${pollsCollectionName}.definition.indexes?.${pollsVotesByPollIpIndexName}) {
      ${pollsCollectionName}.definition.update({
        indexes: {
          ${pollsVotesByPollIpIndexName}: {
            "terms": [{"field":"ref.id"},{"field":"data.choices.votes.voter_ip"}],
          }
        }
      })
    }`
    )
    .then(() => console.info(`Index - "${pollsVotesByPollIpIndexName}" created successfully!`))
    .catch((err) =>
      console.warn(`Error while creating index - "${pollsVotesByPollIpIndexName}": ${err}`)
    );
};
