import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Grid, Text, Center, Loader, Space, Title, Container, Radio, Button, 
  Group, Box, Progress, Transition, CopyButton, ActionIcon } from '@mantine/core';
import { CustomAlert } from '@/components/Alert/Alert';
import { useForm, isNotEmpty } from '@mantine/form';
import { useCounter } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconShare, IconCheck, IconExclamationMark, IconSkull, } from '@tabler/icons';
import { getCookie } from 'cookies-next';
import requestIp from 'request-ip';
import useSWR from 'swr';
import fetcher from '@/swr';
import axios from 'axios';

const PollPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { data, error, isLoading } = useSWR(`/api/polls/${router.query.id}`, fetcher);
  const [ votesAmount, votesAmountHandlers ] = useCounter(0, {min: 0, max: 10000});
  const [ isAlreadyVoted, setIsAlreadyVoted ] = useState<boolean>(false)
  const [ votedOption, setVoteOption ] = useState<string>("");
  const [ isAnimate, setIsAnimate ] = useState<boolean>(false);

  // Getting amount of votes, picked vote option and is already voted value
  useEffect(() => {
    if (!error && !isLoading && data) {
      votesAmountHandlers.set(data.choices.reduce((sum: number, choice: Choice) => sum + choice.votes.length, 0));      
      setIsAlreadyVoted(data.choices.some((choice: Choice) => choice.votes.some((vote: Vote) => vote.voter_ip === props.ip)));
      const votedChoice: Choice = data.choices.find((choice: Choice) => choice.votes.find((vote: Vote) => vote.voter_ip === props.ip));
      if (isAlreadyVoted && votedChoice) {
        setVoteOption(votedChoice.text);
      }
    };
  }, [data, error, isLoading]);

  // Animate votes progressbars
  useEffect(() => {
    if (isAlreadyVoted) {
      setIsAnimate(true);
    };
  }, [isAlreadyVoted]);

  // If voted - set value
  useEffect(() => {
    form.setFieldValue(
      'choice', votedOption
    );
  }, [votedOption]);
  
  
  const form = useForm({
    initialValues: {
      choice: votedOption,
    },

    validate: {
      choice: isNotEmpty(),
    },
  });

  const handleError = (errors: typeof form.errors) => {
    if (errors.choice) {
      notifications.show({ 
        message: 'Please enter the answer', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };
  };

  const handleSubmit = async (values: typeof form.values, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios.post(`/api/polls/${router.query.id}/vote`, {choice_text: values.choice})
    .then(() => {
      // Update votes amount and is already voted value
      votesAmountHandlers.increment();
      setIsAlreadyVoted(true);

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
        (data.choices.map((item: Choice) => (
          <Radio.Group name="pollChoices">
            {item.text}
          </Radio.Group>
        )))
      : 
        <Radio.Group 
          name="choice"
          {...form.getInputProps('choice')}
        >
            {data.choices.map((item: Choice) => (
              <Radio
                key={item.text} 
                label={item.text} 
                value={item.text} 
                size="md" 
                mt="lg" 
                checked
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
          <></>
        :
          <Radio.Group 
            name="choice"
            {...form.getInputProps('choice')}
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
                <Grid.Col sm={9} xs={12}>
                  <Title order={2} fw={400}>
                    Current poll theme: 
                    <Text inherit fw={200} variant="gradient" component="span" mx="sm">{data.question && data.question}</Text>
                  </Title>
                </Grid.Col>
                <Grid.Col span="content">
                  <Group>
                    <Text fs="italic" fz="lg" c="dimmed">
                      {data.created_at && new Date(data.created_at).toLocaleDateString()}
                    </Text>
                    <CopyButton value={window.location.href}>
                      {({ copied, copy }) => (
                        <ActionIcon color={copied ? 'teal' : undefined} onClick={copy} >
                          {copied ? <IconCheck /> : <IconShare stroke={1} />}
                        </ActionIcon>
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