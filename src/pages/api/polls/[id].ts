import type { NextApiRequest, NextApiResponse } from 'next';
import faunaClient, { q, pollsCollectionName } from '@/faunadbConfig';
import { getCookie } from 'cookies-next';
import requestIp from 'request-ip';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const reqIp = requestIp.getClientIp(req);
  const userIp = reqIp ? reqIp : getCookie("user-ip", { req, res });

  const {
    body,
    method,
    query: { id }
  } = req;

  switch(method) {
    case 'GET':
      try {
        // DB Get request
        var dbQueryResponse: FaunaPollResponse = await faunaClient.query(
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

    case 'PUT':
      try {
        // Getting the data from the request
        const {question, choices, is_multiple_answer_options}: Partial<Poll> = body;

        // Check if the data is valid
        if (!question && !choices) { 
          res.status(400).json({ "message": "Missing required data" }); 
          break;
        }
        if (question && !(question.length >= 1 && question.length <= 200)) {
          res.status(400).json({ "question": "Question length must be 1 <= N <= 200" }); 
          break;
        }
        if (choices && !(choices.length >= 1 && choices.length <= 10)) {
          res.status(400).json({ "choices": "Choices length must be 1 < N <= 10" }); 
          break;
        }
        const is_multiple_answer_options_final: boolean = (typeof(is_multiple_answer_options) === "undefined") ? false : is_multiple_answer_options;
        
        // Getting existing poll
        var existingPoll: FaunaPollResponse = await faunaClient.query(
          q.Get(q.Ref(q.Collection(pollsCollectionName), id))
        );

        // DB Update request
        var dbQueryResponse: FaunaPollResponse = await faunaClient.query(
          q.Update(q.Ref(q.Collection(pollsCollectionName), id), {
            data: {
              question,
              choices,
              is_multiple_answer_options: is_multiple_answer_options_final,
              ...existingPoll.data,
            },
          })
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

    case 'DELETE':
      try {
        // Check if creator ip is valid
        if (!userIp) {
          res.status(400).json({ "error": "No ip" });
          return;
        }
        var existingPoll: FaunaPollResponse = await faunaClient.query(
          q.Get(q.Ref(q.Collection(pollsCollectionName), id))
        );
        const pollData = existingPoll.data as Poll;
        
        if (pollData.creator_ip && pollData.creator_ip !== userIp) {
          res.status(400).json({ "error": "You cannot delete it" });
          return;
        };

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
        .then(() => {
          res.status(200).json({ message: 'The survey has been deleted successfully' });
          return;
        })
        .catch((err) => console.log(err))
      } catch (err) {
        // Not found response
        res.status(404).json({ error: 'Something went wrong...' });
        return;
      };
      
      break;

    default:
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  };
};