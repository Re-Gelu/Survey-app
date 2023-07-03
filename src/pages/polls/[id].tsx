import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Grid, Text, Center, Loader, Space, Title, Container, Radio, Button, 
  Group, Box, Progress, Transition, CopyButton, ActionIcon, Tooltip, Checkbox } from '@mantine/core';
import { CustomAlert } from '@/components/Alert/Alert';
import { useForm, isNotEmpty, TransformedValues } from '@mantine/form';
import { useCounter } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconShare, IconCheck, IconExclamationMark, IconSkull } from '@tabler/icons';
import { getCookie } from 'cookies-next';
import requestIp from 'request-ip';
import useSWR, { mutate, unstable_serialize, SWRConfig } from 'swr';
import fetcher from '@/swr';
import axios from 'axios';

const PollPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<Poll, Error>(`/api/polls/${router.query.id}`, fetcher);
  const [ votesAmount, votesAmountHandlers ] = useCounter(0, {min: 0, max: 10000});
  const [ isAlreadyVoted, setIsAlreadyVoted ] = useState<boolean>(false);
  const [ isPollExpired, setIsPollExpired ] = useState<boolean>(false);
  const [ votedOption, setVoteOption ] = useState<string []>([]);
  const [ isAnimate, setIsAnimate ] = useState<boolean>(false);
  const form = useForm({
    initialValues: {
      choices: votedOption as string | string[],
    },

    transformValues: (values) => ({
      choices: (Array.isArray(values.choices)) ? [...values.choices]: [values.choices],
    }),

    validate: {
      choices: isNotEmpty(),
    },
  });

  const handleError = (errors: typeof form.errors) => {
    if (isPollExpired || isAlreadyVoted) {
      notifications.show({ 
        message: isPollExpired ? 'Time to vote has passed...' : isAlreadyVoted && 'You already voted!', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };
    if (errors.choices && !isPollExpired) {
      notifications.show({ 
        message: 'Please enter the answer', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };
  };

  const handleSubmit = async (values: TransformedValues<typeof form>, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // If already voted or poll expired to prevent unnecessary requests to backend
    if (isPollExpired || isAlreadyVoted) {
      notifications.show({ 
        message: isPollExpired ? 'Time to vote has passed...' : isAlreadyVoted && 'You already voted!', 
        color: 'red',
        icon: <IconExclamationMark />
      });
      return;
    };

    axios.post(`/api/polls/${router.query.id}/vote`, values)
    .then(() => {
      // Update votes amount and is already voted value
      votesAmountHandlers.increment();
      setIsAlreadyVoted(true);

      // Refresh SWR data to show actual votes
      mutate(`/api/polls/${router.query.id}`);

      notifications.show({ 
        message: 'Successfully voted', 
        color: 'green',
        icon: <IconCheck />
      });

      // Animate votes progressbars
      if (isAlreadyVoted) {
        setTimeout(() => {
          setIsAnimate(true);
        }, 1000);
      };
    })
    .catch((error) => {
      notifications.show({ 
        message: error.response.data.error, 
        color: 'red',
        icon: <IconSkull />
      });
    });
  };

  // Getting all main states
  // Getting amount of votes, picked vote option, is already voted value and is poll expired
  useEffect(() => {
    if (!error && !isLoading && typeof data === 'object' && data !== null) {
      votesAmountHandlers.set(data.choices.reduce((sum: number, choice: Choice) => sum + choice.votes.length, 0));      
      setIsAlreadyVoted(data.choices.some((choice: Choice) => choice.votes.some((vote: Vote) => vote.voter_ip === props.ip)));
      if (data.expires_at && (new Date(data.expires_at).getTime() <= new Date().getTime())) {
        setIsPollExpired(true);
      };
    };
  }, [data, error, isLoading]);

  // Setting vote options if already voted or vote expired
  useEffect(() => {
    if (!error && !isLoading && typeof data === 'object' && data !== null) {
      const votedChoice: string[] = data.choices.filter((choice: Choice) =>
        choice.votes.some((vote: Vote) => vote.voter_ip === props.ip)
      )
      .map((choice: Choice) => choice.text);
      if (isAlreadyVoted || (isPollExpired && votedChoice)) {
        setVoteOption(votedChoice);
      };
    };
  }, [data, error, isLoading, isAlreadyVoted, isPollExpired]);

  // Show votes results and progressbars if all ok
  useEffect(() => {
    if (isAlreadyVoted || isPollExpired) {
      setIsAnimate(true);
    };
  }, [isAlreadyVoted, isPollExpired]);

  // If voted - set value to form
  useEffect(() => {
    form.setFieldValue(
      'choices', (votedOption.length == 1) ? votedOption[0] : votedOption
    );
  }, [votedOption]);

  // Create buttons to vote
  const voting_options = ((data || !error && !isLoading && data) ? 
      (data.is_multiple_answer_options) ?
        /* If multiple answer options */
        <Checkbox.Group
          defaultValue={votedOption}
          {...form.getInputProps('choices')}
        >
            {data.choices && data.choices.map((item: Choice) => (
              <Checkbox
                key={item.text} 
                label={item.text} 
                value={item.text} 
                size="md" 
                mt="lg" 
              >
              </Checkbox>
            ))}
        </Checkbox.Group>
      : 
        /* If not multiple answer options */
        <Radio.Group 
          name="choices"
          {...form.getInputProps('choices')}
        >
            {data.choices && data.choices.map((item: Choice) => (
              <Radio
                key={item.text} 
                label={item.text} 
                value={item.text} 
                size="md" 
                mt="lg" 
              >
              </Radio>
            ))}
        </Radio.Group>
    :
      <></>
  );
  
  // Create buttons and progress bars to show results
  const voting_results = ((data || !error && !isLoading && data) ? 
      (isAlreadyVoted || isPollExpired) ?
        (data.is_multiple_answer_options) ?
          // If already voted or poll expired
          // If multiple answer options
          data.choices.map((item: Choice) => (
            <Group key={item.text} grow mt="lg">
              <Checkbox
                label={item.text}
                value={item.text}
                size="md"
                disabled={!(votedOption.includes(item.text))}
                checked={votedOption.includes(item.text)}
              >
              </Checkbox>
              <Transition mounted={isAnimate} keepMounted transition="fade" duration={500}>
                {(styles) => <Progress style={styles} label={`${item.votes.length}`} size="xl" value={(item.votes.length / votesAmount) * 100} />}
              </Transition>
            </Group>
          ))
        : 
          // If not already voted or poll expired
          // If not multiple answer options
            data.choices.map((item: Choice) => (
              <Group key={item.text} grow mt="lg">
                <Radio 
                  label={item.text} 
                  value={item.text} 
                  size="md"
                  disabled={!(item.text === votedOption[0])}
                  checked={item.text === votedOption[0]}
                >
                </Radio>
                <Transition mounted={isAnimate} keepMounted transition="fade" duration={500}>
                  {(styles) => <Progress style={styles} label={`${item.votes.length}`} size="xl" value={(item.votes.length / votesAmount) * 100} />}
                </Transition>
              </Group>
            ))
      : 
        // If not already voted or poll expired
        <></>
    :
      <></>
  )

  return (
    <>
      {
        (data) ?
          <>
            <Head>
              <title>{`Survey App - ${data.question}`}</title>
            </Head>
            <Grid my="xl" justify="space-between">
              <Grid.Col sm={6} xs={12}>
                <Title order={2} fw={400}>
                  Current poll theme: 
                  <Text inherit fw={200} variant="gradient" component="span" mx="sm">{data.question && data.question}</Text>
                </Title>
              </Grid.Col>
              <Grid.Col span="content">
                <Group spacing="xs">
                  <Text fs="italic" fz="lg" c="dimmed">
                    {data.created_at && new Date(data.created_at).toLocaleDateString("ru-RU")}
                    {data.expires_at &&  
                      <Text component='span' pl={6} fs="italic" fz="lg" c="dimmed">
                        - {`
                          ${new Date(data.expires_at).toLocaleDateString("ru-RU")}
                          ${new Date(data.expires_at).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}
                        `}
                      </Text>
                    }
                  </Text>
                  <CopyButton value={(typeof(window) !== 'undefined') ? window.location.href : ''}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} position="bottom-end">
                        <ActionIcon color={copied ? 'teal' : undefined} onClick={copy} >
                          {copied ? <IconCheck /> : <IconShare stroke={1} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
                {isPollExpired && <Text fs="italic" fz="xl" c="dimmed" variant="gradient">Poll expired</Text>} 
              </Grid.Col>
            </Grid>
            <Box component="form" onSubmit={form.onSubmit(handleSubmit, handleError)}>
              <Title order={3} fw={400}>Voting options:</Title>
              <Grid>
                <Grid.Col sm={8} xs={12}>
                  {
                    (data) ?
                      voting_options
                    : 
                      (isAlreadyVoted || isPollExpired) ? 
                        voting_results 
                      : 
                        voting_options
                  }
                </Grid.Col>
              </Grid>
              <Space h="xl"/>
              <Group>
                <Button type="submit" variant="outline" radius="xl">Confrim</Button>
                <Text c="dimmed">
                  {votesAmount} votes
                </Text>
              </Group>
            </Box>
          </>
        :
          (!error) ?
            (isLoading) &&
              <Center mx="xl" my="xl" px="xl" py="xl">
                  <Loader size="xl" variant="dots"/>
              </Center>
        : 
          <Container size="sm" my="xl" px="xl" py="xl">
            <CustomAlert>
                Such a survey no longer exists
            </CustomAlert>
          </Container>
      }
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageDataWithIp> = async (context) => {
  // Getting IP
  const reqIp = requestIp.getClientIp(context.req);
  const userIp = reqIp ? reqIp : getCookie("user-ip", { req: context.req, res: context.res });

  // Get the nextRequestMeta to can SWR from any server
  const nextRequestMeta = Object.getOwnPropertySymbols(context.req).find((s) => {
    return String(s) === "Symbol(NextRequestMeta)";
  });

  if (nextRequestMeta) {
    const nextRequestMetaData = (context.req as unknown as { [key: symbol]: any })[nextRequestMeta];

    try {
      // Getting prerendered data
      const data = await fetcher(`${nextRequestMetaData._protocol}://${context.req.headers.host}/api/polls/${context.query.id}`);

      return {
        props: {
          ip: userIp,
          fallback: {
            [unstable_serialize(`/api/polls/${context.query.id}`)]: data
          }
        }
      };
    } catch (err) {
      console.warn(err);
      return {
        props: {
          ip: userIp,
          fallback: {
            [unstable_serialize(`/api/polls/${context.query.id}`)]: null  
          }
        }
      };
    }
  };
  
  return {
    props: {
      ip: userIp,
      fallback: {
        [unstable_serialize(`/api/polls/${context.query.id}`)]: null  
      }
    }
  };
  
};

export default function SWRPrerenderedPage({ ip, fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SWRConfig value={{ fallback }}>
      <PollPage ip={ip}/>
    </SWRConfig>
  );
};;