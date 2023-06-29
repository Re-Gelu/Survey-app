import { PollsTable } from '@/components/PollsTable/PollsTable';
import { CustomAlert } from '@/components/Alert/Alert';
import { PollingStepper } from '@/components/PollingStepper/PollingStepper';
import { useState } from 'react';
import { Grid, Text, Center, Loader, Space, Title, Paper, Container, Blockquote, AspectRatio } from '@mantine/core';
import useSWR from 'swr';
import fetcher from '@/swr';

const IndexPage = () => {
  const [opened, setOpened] = useState(false);
  const { data, error, isLoading } = useSWR('/api/polls?offset=0&page_size=100', fetcher);
  
  return (
    <>
      <Grid my="xl">
        <Grid.Col xs={12} sm={6}>
          <Center mx="auto">
            <Container px={0}>
              <Paper shadow="sm" radius="md" p="md" withBorder>
                <Text fz="xl" fw={300}>
                  <Blockquote cite="– Re: Gelu" p={0}>
                    Welcome to our voting app! 
                    We have developed this application using advanced technology to provide you with 
                    a convenient and secure way to conduct voting.
                  </Blockquote>
                </Text>
              </Paper>
            </Container>
          </Center>
        </Grid.Col>
          <Grid.Col xs={12} sm={6} >
            <Center mx="auto">
              <Container>
                <Title order={2}>First time there?</Title>
                <Space h="xl" />
                <PollingStepper></PollingStepper>
              </Container>
            </Center>
          </Grid.Col>
        </Grid>

        {
          (!error) ?
            (isLoading) ? 
              <Center mx="xl" my="xl" px="xl" py="xl">
                <Loader size="xl" variant="dots"/>
              </Center>
            :
              <PollsTable data={data.data}></PollsTable>
          : 
            <Container size="sm" my="xl" px="xl" py="xl">
              <CustomAlert>
                Error while loading the data!
              </CustomAlert>
            </Container>
        }
    </>
  );
};

export default IndexPage;