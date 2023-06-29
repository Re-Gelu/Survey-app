import { useRouter } from 'next/router';
import { Grid, Text, Center, Loader, Space, Title, Container, Radio, Button } from '@mantine/core';
import { CustomAlert } from '@/components/Alert/Alert';
import { useForm, isNotEmpty } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import useSWR from 'swr';
import fetcher from '@/swr';

const PollPage = () => {
  const router = useRouter();
  const { data, error, isLoading } = useSWR(`/api/polls/${router.query.id}`, fetcher);
  
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

  const handleSubmit = (values: typeof form.values) => {
    console.log(values);
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
              <form onSubmit={form.onSubmit(handleSubmit, handleError)}>
                <Title order={3} fw={400}>Voting options:</Title>
                {rows}
                <Space h="xl"/>
                <Button type="submit">Confrim</Button>
              </form>
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