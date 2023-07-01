import type { NextApiRequest, NextApiResponse } from 'next';
import faunaClient, { q, pollsCollectionName, pollsVotesByPollIpIndexName } from '@/faunadbConfig';
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

  if (method !== 'POST') {
    res.status(405).end(`Method ${method} Not Allowed`);
  };

  try {
    // Getting the data from the request
    const { choice_text }: {choice_text: string} = body;

    // Check if the data and ip is valid
    if ( !choice_text ) { res.status(400).json({ "choice_text": "Missing required data" }); return; };
    if ( !userIp ) { res.status(400).json({ "error": "No ip" }); return; };
    
    if (await faunaClient.query(q.Exists(
      q.Match(
        q.Index(pollsVotesByPollIpIndexName),
        id as string,
        userIp as string
      )
    ))) { res.status(400).json({ "error": "Already voted!" }); return; }

    // Getting existing poll choices
    var existingPoll: FaunaPollResponse = await faunaClient.query(
      q.Get(q.Ref(q.Collection(pollsCollectionName), id))
    );
    const pollData = existingPoll.data as Poll;
    const choices = pollData.choices;

    // Get choice from existing poll choices 
    const choice = choices.find((c: any) => c.text === choice_text);
    if (!choice) {  
      res.status(400).json({ choice: 'Invalid name' });
      return;
    }

    // Create new vote
    const vote: Vote = {
      voter_ip: userIp,
      created_at: new Date().toJSON(),
    };

    // DB Update request
    var updatedPoll: FaunaPollResponse = await faunaClient.query(
      q.Update(q.Ref(q.Collection(pollsCollectionName), id), {
        data: {
          choices: choices.map((c: any) => {
            if (c.text === choice_text) {
              return {
                ...c,
                votes: [...c.votes, vote],
              };
            }
            return c;
          })
        },
      })
    );

    const poll = {
      id: updatedPoll.ref.id,
      ...updatedPoll.data,
    };

    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};