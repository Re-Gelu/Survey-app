// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import faunaClient, { q, defaultPageOffset, pollsCollectionName } from '@/faunadbConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const {
    body,
    method,
    query: { offset, page_size }
  } = req;

  switch(method) {
    case 'GET':

      // Getting proper page size and offset
      const requestPageSize: number = page_size ? parseInt(page_size as string) : defaultPageOffset
      const requestOffset: number = offset ? parseInt(offset as string) : 0

      // DB Get request
      var dbQueryResponse: FaunaQueryResponse = await faunaClient.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection('Polls'))),
          q.Lambda('ref', q.Get(q.Var('ref')))
        )
      );
      
      // Mapping DB response to add id
      const polls: Partial<Poll>[] = dbQueryResponse.data.map((poll: FaunaResponse) => ({
        id: poll.ref.id,
        ...poll.data,
      }));
      
      // Response with pagination slice
      res.status(200).json({
        offset: requestOffset,
        page_size: requestPageSize,
        data: polls.slice(requestOffset, requestOffset + requestPageSize)
      });
      break;

    case 'POST':

      // Getting the data from the request
      const {question, choices, is_multiple_answer_options}: Partial<Poll> = body;

      // Check if the data is valid
      if (!question || !choices) { 
        res.status(400).json({ "message": "Missing required data" }); 
        break;
      }
      if (!(question.length >= 1 && question.length <= 250)) {
        res.status(400).json({ "question": "Question length must be 1 <= N <= 250" }); 
        break;
      }
      if (!(choices.length > 1 && choices.length <= 10)) {
        res.status(400).json({ "choices": "Choices length must be 1 < N <= 10" }); 
        break;
      }
      const is_multiple_answer_options_final: boolean = (typeof(is_multiple_answer_options) === "undefined") ? false : is_multiple_answer_options;

      // DB Create request
      var dbQueryResponse: FaunaQueryResponse = await faunaClient.query(
        q.Create(q.Collection(pollsCollectionName), {
          data: {
            question,
            choices,
            is_multiple_answer_options_final,
            created_at: new Date().toJSON()
          },
        })
      );


      res.status(200).json({ data: dbQueryResponse.data });
      break;

    default:
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  };
}