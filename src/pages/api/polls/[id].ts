import type { NextApiRequest, NextApiResponse } from 'next';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import faunaClient, { q, defaultPageOffset, pollsCollectionName } from '@/faunadbConfig';

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
        var dbQueryResponse: any = await faunaClient.query(
          q.Get(q.Ref(q.Collection(pollsCollectionName), id))
        );

        const poll: Poll = dbQueryResponse.data;
        res.status(200).json(poll);
      } catch {
        // Not found response
        res.status(404).json({ error: 'Not found!' });
      };
      break;

    case 'POST':
      break;

    case 'PUT':
      break;

    case 'DELETE':
      // The following query looks a bit complicated, but it:
      // - avoids trying to delete a Todo document unless it exists
      // This step prevents problems if another instance of the todo app (or
      // the Fauna Dashboard) has already deleted the Todo document.
      await faunaClient.query(
        q.Let(
          {
            todoRef: q.Ref(q.Collection('Todos'), id),
            todoExists: q.Exists(q.Var('todoRef')),
          },
          q.If(
            q.Var('todoExists'),
            q.Delete(q.Ref(q.Collection('Todos'), id)),
            null
          )
        )
      )
      .catch((err) => console.log(err))
      break;

    default:
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  };
};