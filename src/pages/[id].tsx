import { useRouter } from 'next/router';
import { Grid, Text, Center, Loader, Space, Title, Container, Radio, Button, Group, Box } from '@mantine/core';
import { CustomAlert } from '@/components/Alert/Alert';
import { useForm, isNotEmpty } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '@/swr';
import axios from 'axios';

const PollPage = () => {
  const router = useRouter();
  const { data, error, isLoading } = useSWR(`/api/polls/${router.query.id}`, fetcher);
  const [ votesAmount, setVotesAmount ] = useState<number>(0);

  useEffect(() => {
    if (!error && !isLoading && data) {
      setVotesAmount(data.choices.reduce((sum: number, choice: Choice) => sum + choice.votes.length, 0));
    };
  }, [data, error, isLoading]);
    
  const form = useForm({
    initialValues: {
      choice: '',
    },

    validate: {
      choice: isNotEmpty(),
    },
  });

  const handleError = (errors: typeof form.errors) => {
    if (errors.choice) {
      notifications.show({ message: 'Please enter the answer', color: 'red' });
    };
  };

  const handleSubmit = async (values: typeof form.values, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios.post(`/api/polls/${router.query.id}/vote`, {choice_text: values.choice})
    .then(() => {
      setVotesAmount((prev) => prev + 1);
      notifications.show({ message: 'Successfully voted', color: 'green' });
    })
    .catch((error) => {
      notifications.show({ message: error.response.data.error, color: 'red' });
    })
  };
  
  const rows = ((!error && !isLoading && data) ? (data.is_multiple_answer_options) ?
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
              <Grid my="xl" align="center" justify="space-between">
                <Grid.Col sm={9} xs={12}>
                  <Title order={2} fw={400}>
                    Current poll theme: 
                    <Text inherit fw={200} variant="gradient" component="span" mx="sm">{data.question && data.question}</Text>
                  </Title>
                </Grid.Col>
                <Grid.Col span="content">
                  <Text fs="italic" fz="lg" c="dimmed">
                    {data.created_at && new Date(data.created_at).toLocaleDateString()}
                  </Text>
                </Grid.Col>
              </Grid>
              <Box component="form" onSubmit={form.onSubmit(handleSubmit, handleError)}>
                <Title order={3} fw={400}>Voting options:</Title>
                {rows}
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

export default PollPage;