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
  }

  try {
    // Getting the data from the request
    const { choices }: { choices: string[] } = body;

    // Check if the data and ip is valid
    if (!choices || !Array.isArray(choices)) {
      res.status(400).json({ "error": "Invalid data format, 'choices' should be an array of strings" });
      return;
    };
    if (!userIp) {
      res.status(400).json({ "error": "No ip" });
      return;
    };

    // Check if any choice is missing or invalid
    const existingPoll: FaunaPollResponse = await faunaClient.query(
      q.Get(q.Ref(q.Collection(pollsCollectionName), id))
    );
    const pollData = existingPoll.data as Poll;
    const existingChoices = pollData.choices;

    if (!(choices.every(choice =>
      existingChoices.some((c: any) => c.text === choice)
    ))) {
      res.status(400).json({ "error": "Invalid choices" });
      return;
    };

    // Check time
    if (pollData.expires_at && (new Date(pollData.expires_at).getTime() <= new Date().getTime())) {
      res.status(400).json({ "error": "Attempt to vote after the end of the survey" });
      return;
    };

    // Check if user already voted
    if (await faunaClient.query(q.Exists(
      q.Match(
        q.Index(pollsVotesByPollIpIndexName),
        id as string,
        userIp as string
      )
    ))) {
      res.status(400).json({ "error": "Already voted!" });
      return;
    };

    // Create new vote
    const vote: Vote = {
      voter_ip: userIp,
      created_at: new Date().toJSON(),
    };

    // DB Update request
    const updatedPoll: FaunaPollResponse = await faunaClient.query(
      q.Update(q.Ref(q.Collection(pollsCollectionName), id), {
        data: {
          choices: existingChoices.map((c: any) => {
            if (choices.includes(c.text)) {
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
