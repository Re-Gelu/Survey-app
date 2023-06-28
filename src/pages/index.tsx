import { HeaderSimple } from '@/components/Header/Header';
import { PollsTable } from '@/components/PollsTable/PollsTable';
import { CustomAlert } from '@/components/Alert/Alert';
import { PollingStepper } from '@/components/PollingStepper/PollingStepper';
import { useState } from 'react';
import {
  Grid,
  Center,
  Loader,
  Space,
  Title,
  Container,
} from '@mantine/core';
import useSWR from 'swr';
import fetcher from '@/swr';

export default function HomePage() {
  const [opened, setOpened] = useState(false);
  const { data, error, isLoading } = useSWR('/api/polls?offset=5', fetcher);
  
  return (
    <Container className="box">
      <HeaderSimple links={[
        {
          "link": "/dashboard",
          "label": "Your Polls"
        }
      ]} />
      <Container>
        <Grid my="xl">
          <Grid.Col span={6} >TEST</Grid.Col>
            <Grid.Col span={6} >
              <Title order={2}>First time there?</Title>
              <Space h="xl" />
              <PollingStepper></PollingStepper>
            </Grid.Col>
          </Grid>
          {
            (!error) ?
              (isLoading) ? 
                <Center mx="xl" my="xl">
                  <Loader size="xl" variant="dots"/>
                </Center>
              :
                <PollsTable data={data.data}></PollsTable>
            : 
              <Container size="sm" my="xl">
                <CustomAlert>
                  Error while loading the data!
                </CustomAlert>
              </Container>
          }
        </Container>
    </Container>
  );
};