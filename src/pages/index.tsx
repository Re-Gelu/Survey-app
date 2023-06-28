import { HeaderSimple } from '@/components/Header/Header';
import { PollsTable } from '@/components/PollsTable/PollsTable';
import { useState } from 'react';
import {
  Center,
  Skeleton,
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
              <Skeleton visible={isLoading}>
                {(data && !isLoading) && <PollsTable data={data.data}></PollsTable>}
              </Skeleton>
            : 
              <div>Ошибка загрузки данных</div>
          }
        </Center>
    </Container>
  );
}
