import type { NextApiRequest, NextApiResponse } from 'next';
import faunaClient, { q, pollsCollectionName } from '@/faunadbConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const {
    body,
    method,
    query: { id }
  } = req;

  switch(method) {
    case 'GET':
      try {
        // DB Get request
        var dbQueryResponse: FaunaResponse = await faunaClient.query(
          q.Get(q.Ref(q.Collection(pollsCollectionName), id))
        );

        const poll = {
        id: dbQueryResponse.ref.id,
        ...dbQueryResponse.data,
      };
        res.status(200).json(poll);
      } catch {
        // Not found response
        res.status(404).json({ error: 'Poll not found!' });
      };
      break;

    case 'POST':
      break;

    case 'PUT':
      break;

    case 'DELETE':
      // The following query looks a bit complicated, but it:
      // - avoids trying to delete a Polls document unless it exists
      // This step prevents problems if another instance of the Polls app (or
      // the Fauna Dashboard) has already deleted the Todo document.
      await faunaClient.query(
        q.Let(
          {
            PollsRef: q.Ref(q.Collection(pollsCollectionName), id),
            PollsExists: q.Exists(q.Var(`${pollsCollectionName}Ref`)),
          },
          q.If(
            q.Var(`${pollsCollectionName}Exists`),
            q.Delete(q.Ref(q.Collection(pollsCollectionName), id)),
            null
          )
        )
      )
      .catch((err) => console.log(err))
      res.status(200).json({ message: 'Опрос успешно удален' });
      break;

    default:
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  };
};