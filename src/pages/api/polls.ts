// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import faunaClient, { fql, defaultPageSize, pollsCollectionName } from '@/faunadbConfig';
import { getCookie } from 'cookies-next';
import requestIp from 'request-ip';
import { QueryValue } from 'fauna';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const reqIp = requestIp.getClientIp(req);
  const userIp = reqIp ? reqIp : getCookie('user-ip', { req, res });

  const {
    body,
    method,
    query: { after, page_size },
  } = req;

  switch (method) {
    case 'GET':
      // Getting proper page size and after
      const requestPageSize: number = page_size ? parseInt(page_size as string) : defaultPageSize;
      const requestAfter: string = after ? (after as string) : '';

      // DB Get request
      var dbQueryResponsee = await faunaClient.query(
        fql`Polls.all().reverse().paginate(${requestAfter ? requestAfter : requestPageSize})`
      );

      res.status(200).json(dbQueryResponsee);
      break;

    case 'POST':
      // Getting the data from the request
      const { question, choices, is_multiple_answer_options, expires_at }: Partial<Poll> = body;

      // Check if the data is valid
      if (!question || !choices) {
        res.status(400).json({ error: 'Missing required data' });
        break;
      }
      if (!(question.length >= 1 && question.length <= 200)) {
        res.status(400).json({ error: 'Question length must be 1 <= N <= 200' });
        break;
      }
      if (!(choices.length >= 1 && choices.length <= 10)) {
        res.status(400).json({ error: 'Choices length must be 1 < N <= 10' });
        break;
      }
      // Check if the choices are not equal
      if (
        choices.some((choice, index) =>
          choices
            .slice(index + 1)
            .some(
              (otherChoice) =>
                choice.text.trim().toLowerCase() === otherChoice.text.trim().toLowerCase()
            )
        )
      ) {
        res.status(400).json({ error: 'Two or more equal choices' });
        break;
      }
      if (!choices.every((choice) => choice.text.length >= 1 && choice.text.length <= 100)) {
        res.status(400).json({ error: 'Choice text length must be 1 =< N <= 100' });
        break;
      }
      const is_multiple_answer_options_final: boolean =
        typeof is_multiple_answer_options === 'undefined' ? false : is_multiple_answer_options;

      const dbQueryData: Poll = {
        question: question,
        choices: choices,
        is_multiple_answer_options: is_multiple_answer_options_final,
        creator_ip: userIp,
        expires_at: expires_at ? expires_at : undefined,
        created_at: new Date().toJSON(),
      };

      // DB Create request
      var dbQueryResponse = await faunaClient.query(
        fql`Polls.create(${dbQueryData as QueryValue})`
      );

      res.status(200).json(dbQueryResponse);
      break;

    default:
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
