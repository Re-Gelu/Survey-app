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
import useSWR, { mutate } from 'swr';
import fetcher from '@/swr';
import axios from 'axios';

const PollPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { data, error, isLoading  } = useSWR(`/api/polls/${router.query.id}`, fetcher);
  const [ votesAmount, votesAmountHandlers ] = useCounter(0, {min: 0, max: 10000});
  const [ isAlreadyVoted, setIsAlreadyVoted ] = useState<boolean>(false)
  const [ votedOption, setVoteOption ] = useState<string []>([]);
  const [ isAnimate, setIsAnimate ] = useState<boolean>(false);

  // Getting amount of votes, picked vote option and is already voted value
  useEffect(() => {
    if (!error && !isLoading && data) {
      votesAmountHandlers.set(data.choices.reduce((sum: number, choice: Choice) => sum + choice.votes.length, 0));      
      setIsAlreadyVoted(data.choices.some((choice: Choice) => choice.votes.some((vote: Vote) => vote.voter_ip === props.ip)));
    };
  }, [data, error, isLoading]);

  // Setting vote options if already voted
  useEffect(() => {
    if (!error && !isLoading && data) {
      //const votedChoice: Choice = data.choices.find((choice: Choice) => choice.votes.find((vote: Vote) => vote.voter_ip === props.ip));
      const votedChoice: string[] = data.choices.filter((choice: Choice) =>
        choice.votes.some((vote: Vote) => vote.voter_ip === props.ip)
      )
      .map((choice: Choice) => choice.text);
      if (isAlreadyVoted && votedChoice) {
        setVoteOption(votedChoice);
      };
    };
  }, [data, error, isLoading, isAlreadyVoted]);

  // Animate votes progressbars
  useEffect(() => {
    if (isAlreadyVoted) {
      setIsAnimate(true);
    };
  }, [isAlreadyVoted]);

  // If voted - set value
  useEffect(() => {
    form.setFieldValue(
      'choices', (votedOption.length == 1) ? votedOption[0] : votedOption
    );
  }, [votedOption]);
  
  
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
    if (errors.choices) {
      notifications.show({ 
        message: 'Please enter the answer', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };
  };

  const handleSubmit = async (values: TransformedValues<typeof form>, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  // Create radio buttons to vote
  const voting_options = ((!error && !isLoading && data) ? 
      (data.is_multiple_answer_options) ?
        /* If multiple answer options */
        <Checkbox.Group
          defaultValue={votedOption}
          {...form.getInputProps('choices')}
        >
            {data.choices.map((item: Choice) => (
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
            {data.choices.map((item: Choice) => (
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
  
  // Create radio buttons and progress bars to show results
  const voting_results = ((!error && !isLoading && data) ? 
      (isAlreadyVoted) ? 
        (data.is_multiple_answer_options) ?
          /* If multiple answer options */
          <Checkbox.Group 
            {...form.getInputProps('choices')}
          >
            {data.choices.map((item: Choice) => (
              <Group key={item.text} grow mt="lg">
                <Checkbox  
                  label={item.text} 
                  value={item.text} 
                  size="md"
                >
                </Checkbox>
                <Transition mounted={isAnimate} keepMounted transition="fade" duration={500}>
                  {(styles) => <Progress style={styles} label={`${item.votes.length}`} size="xl" value={(item.votes.length / votesAmount) * 100} />}
                </Transition>
              </Group>
            ))}
          </Checkbox.Group>
        : 
          /* If not multiple answer options */
          <Radio.Group 
            name="choices"
            {...form.getInputProps('choices')}
          >
            {data.choices.map((item: Choice) => (
              <Group key={item.text} grow mt="lg">
                <Radio 
                  label={item.text} 
                  value={item.text} 
                  size="md"
                >
                </Radio>
                <Transition mounted={isAnimate} keepMounted transition="fade" duration={500}>
                  {(styles) => <Progress style={styles} label={`${item.votes.length}`} size="xl" value={(item.votes.length / votesAmount) * 100} />}
                </Transition>
              </Group>
            ))}
          </Radio.Group>
      : 
        <></>
    :
      <></>
  )

  return (
    <>
      {
        (!error) ?
          (isLoading) ? 
            <Center mx="xl" my="xl" px="xl" py="xl">
                <Loader size="xl" variant="dots"/>
            </Center>
          : 
            <>
              <Head>
                <title>Survey App - {data.question && data.question}</title>
              </Head>

              <Grid my="xl" align="center" justify="space-between">
                <Grid.Col sm={6} xs={12}>
                  <Title order={2} fw={400}>
                    Current poll theme: 
                    <Text inherit fw={200} variant="gradient" component="span" mx="sm">{data.question && data.question}</Text>
                  </Title>
                </Grid.Col>
                <Grid.Col span="content">
                  <Group spacing="xs">
                    <Text fs="italic" fz="lg" c="dimmed">
                      {data.created_at && new Date(data.created_at).toLocaleDateString()}
                      {data.expires_at &&  
                        <Text component='span' pl={6} fs="italic" fz="lg" c="dimmed">
                          - {`
                            ${new Date(data.expires_at).toLocaleDateString()}
                            ${new Date(data.expires_at).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}
                          `}
                        </Text>
                      }
                    </Text>
                    <CopyButton value={window.location.href}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied' : 'Copy'} position="bottom-end">
                          <ActionIcon color={copied ? 'teal' : undefined} onClick={copy} >
                            {copied ? <IconCheck /> : <IconShare stroke={1} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                </Grid.Col>
              </Grid>
              <Box component="form" onSubmit={form.onSubmit(handleSubmit, handleError)}>
                <Title order={3} fw={400}>Voting options:</Title>
                <Grid>
                  <Grid.Col sm={8} xs={12}>
                    {(isAlreadyVoted) ? voting_results : voting_options}
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
          <Container size="sm" my="xl" px="xl" py="xl">
            <CustomAlert>
                Such a survey no longer exists
            </CustomAlert>
          </Container>
      }
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageDataWithIp> = async ({ req, res }) => {
  const reqIp = requestIp.getClientIp(req);
  const userIp = reqIp ? reqIp : getCookie("user-ip", { req, res });

  return {
    props: {
      ip: userIp
    }
  };
};

export default PollPage;