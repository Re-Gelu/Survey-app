import { PollsTable } from '@/components/PollsTable/PollsTable';
import { CustomAlert } from '@/components/Alert/Alert';
import { SurveyStepper } from '@/components/SurveyStepper/SurveyStepper';
import { Grid, Text, Center, Loader, Space, Title, Paper, Container, Blockquote } from '@mantine/core';
import type { InferGetServerSidePropsType, GetServerSideProps, NextApiRequest } from 'next';
import useSWR, { SWRConfig } from 'swr';
import fetcher from '@/swr';
import { useRouter } from 'next/router';

const IndexPage = () => {
  const { data, error, isLoading } = useSWR<{data: Poll[]}, Error>('/api/polls?offset=0&page_size=1000', fetcher);
  
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

  // Get the nextRequestMeta to be able to hook SWR from any server
  const nextRequestMeta = Object.getOwnPropertySymbols(context.req).find((s) => {
    return String(s) === "Symbol(NextRequestMeta)";
  });

  if (nextRequestMeta) {
    const nextRequestMetaData = (context.req as unknown as { [key: symbol]: any })[nextRequestMeta];

    try {
      // Getting prerendered data
      const data = await fetcher(`${nextRequestMetaData._protocol}://${context.req.headers.host}/api/polls?offset=0&page_size=1000`);

      return {
        props: {
          fallback: {
            '/api/polls?offset=0&page_size=1000': data
          }
        }
      };
    } catch (err) {
      console.warn(err);
      return {
        props: {
          fallback: {
            '/api/polls?offset=0&page_size=1000': null
          }
        }
      };
    }
  };

  return {
    props: {
      fallback: {
        '/api/polls?offset=0&page_size=1000': null
      }
    }
  };
};

export default function SWRPrerenderedPage({ fallback }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SWRConfig value={{ fallback }}>
      <IndexPage />
    </SWRConfig>
  );
};