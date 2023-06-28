import { HeaderSimple } from '@/components/Header/Header';
import { PollsTable } from '@/components/PollsTable/PollsTable';
import { CustomAlert } from '@/components/Alert/Alert';
import { useState } from 'react';
import {
  Center,
  Skeleton,
  Loader,
  Text,
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
      <Center mx="auto">
          {
            (!error) ?
              (isLoading) ? 
                <Loader size="xl" variant="dots"/>
              :
                <PollsTable data={data.data}></PollsTable>
            : 
              <CustomAlert>
                Error while loading the data!
              </CustomAlert>
          }
        </Center>
    </Container>
  );
};