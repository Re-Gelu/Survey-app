import type { NextApiRequest, NextApiResponse } from 'next';
import faunaClient, { fql } from '@/faunadbConfig';
import { getCookie } from 'cookies-next';
import requestIp from 'request-ip';
import { QueryValue } from 'fauna';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const reqIp = requestIp.getClientIp(req);
  const userIp = reqIp ? reqIp : getCookie('user-ip', { req, res });

  const {
    body,
    method,
    query: { id },
  } = req;

  if (method !== 'POST') {
    res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    // Getting the data from the request
    const { choices }: { choices: string[] } = body;

    // Check if the data and ip is valid
    if (!choices || !Array.isArray(choices)) {
      res
        .status(400)
        .json({ error: "Invalid data format, 'choices' should be an array of strings" });
      return;
    }
    if (!userIp) {
      res.status(400).json({ error: 'No ip' });
      return;
    }

    // Check if any choice is missing or invalid
    var existingPoll = await faunaClient.query(fql`Polls.byId(${id as string})`);
    const pollData = existingPoll.data as Poll;
    const existingChoices = pollData.choices;

    if (!choices.every((choice) => existingChoices.some((c: Choice) => c.text === choice))) {
      res.status(400).json({ error: 'Invalid choices' });
      return;
    }

    // Check time
    if (pollData.expires_at && new Date(pollData.expires_at).getTime() <= new Date().getTime()) {
      res.status(400).json({ error: 'Attempt to vote after the end of the survey' });
      return;
    }

    // Check if user already voted
    if (
      (
        await faunaClient.query(
          fql`Polls.byId(${
            id as string
          })?.choices.any(choice => choice.votes.any(vote => vote.voter_ip == ${userIp}))`
        )
      ).data
    ) {
      res.status(400).json({ error: 'Already voted!' });
      return;
    }

    // Create new vote
    const vote: Vote = {
      voter_ip: userIp,
      created_at: new Date().toJSON(),
    };

    const dbQueryData = {
      choices: existingChoices.map((c: Choice) => {
        if (choices.includes(c.text)) {
          return {
            ...c,
            votes: [...c.votes, vote],
          };
        }
        return c;
      }),
    };

    // DB Update request
    const updatedPoll = await faunaClient.query(
      fql`Polls.byId(${id as string})!.update(${dbQueryData as QueryValue})`
    );

    res.status(200).json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
