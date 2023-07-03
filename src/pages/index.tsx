import { PollsTable } from '@/components/PollsTable/PollsTable';
import { CustomAlert } from '@/components/Alert/Alert';
import { SurveyStepper } from '@/components/SurveyStepper/SurveyStepper';
import { Grid, Text, Center, Loader, Space, Title, Paper, Container, Blockquote } from '@mantine/core';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import useSWR, { SWRConfig } from 'swr';
import fetcher from '@/swr';

const IndexPage = () => {
  const { data, error, isLoading } = useSWR<{data: Poll[]}, Error>('/api/polls?offset=0&page_size=100', fetcher);
  
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
                <SurveyStepper></SurveyStepper>
              </Container>
            </Center>
          </Grid.Col>
        </Grid>

        { 
          (data) ? 
            <PollsTable data={data.data}></PollsTable>
          :
            (!error) ?
              (isLoading) &&
                <Center mx="xl" my="xl" px="xl" py="xl">
                  <Loader size="xl" variant="dots"/>
                </Center>
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

export const getServerSideProps: GetServerSideProps<Pick<PageDataWithIp, 'fallback'>> = async (context) => {
  try {
    // Getting prerendered data
    const data = await fetcher('/api/polls?offset=0&page_size=100');

    return {
      props: {
        fallback: {
          '/api/polls?offset=0&page_size=100': data
        }
      }
    };
  } catch {
    return {
      props: {}
    };
  }
};

export default function SWRPrerenderedPage({ fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SWRConfig value={{ fallback }}>
      <IndexPage />
    </SWRConfig>
  );
};