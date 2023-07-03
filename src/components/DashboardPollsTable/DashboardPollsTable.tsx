import { Text, Center, Loader, Title, Container, 
  Table, Button, ScrollArea, Modal, ActionIcon, Grid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowBadgeRight, IconTrash, IconCheck, IconSkull } from '@tabler/icons-react';
import { CustomAlert } from '@/components/Alert/Alert';
import Link from 'next/link';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import fetcher from '@/swr';
import axios from 'axios';
import useStyles from './DashboardPollsTable.styles';

export const DashboardPollsTable = (props: PageDataWithIp) => {
  const { classes, cx } = useStyles();
  const { data, error, isLoading  } = useSWR<{data: Poll[]}, Error>(`/api/polls?offset=0&page_size=100`, fetcher);
  const [transitionOpened, setTransitionOpened] = useState<boolean>(false);
  
  const filteredPolls: Poll[] | null = ((!error && !isLoading && data) ? 
      data.data.filter((poll: Poll )=> poll.creator_ip === props.ip) 
    : 
      null
  );

  const handleDeletion = async (id: string | undefined) => {
    if (!id) { return };
    axios.delete(`/api/polls/${id}`)
    .then(() => {

      // Refresh SWR data to show actual polls
      mutate(`/api/polls?offset=0&page_size=100`);

      notifications.show({ 
        message: 'Successfully deleted!', 
        color: 'green',
        icon: <IconCheck />
      });
    })
    .catch(() => {
      notifications.show({ 
        message: 'Something went wrong... :(', 
        color: 'red',
        icon: <IconSkull />
      });
    });
    setTransitionOpened(false);
  };

  const user_polls = ((filteredPolls && filteredPolls.length >= 1) ? 
      filteredPolls.map((item) => (
        <tr key={item.id && item.id}>
          <td>
            <Grid align="center" justify="space-between">
              <Grid.Col span="auto">
                <Link href={`/polls/${item.id}`}>
                  <Grid align="center" justify="space-between">
                    <Grid.Col span="content" p={0}>
                      <ActionIcon variant="transparent" className={classes.adapt}><IconArrowBadgeRight size={24} /></ActionIcon>
                    </Grid.Col>
                    <Grid.Col span="auto">
                      <Text fz="xl" fw={400} variant="gradient" className={classes.adaptFont} >
                        {item.question && item.question}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Link>
              </Grid.Col>
              <Grid.Col span="content">
                <ActionIcon title={`Delete poll - ${item.question && item.question}`} color="red" onClick={() => setTransitionOpened(true)}>
                  <IconTrash size="1rem"/>
                </ActionIcon>
              </Grid.Col>
            </Grid>

            <Modal
              opened={transitionOpened}
              onClose={() => setTransitionOpened(false)}
              title={<Title order={3}>Are you sure about that?</Title>}
              transitionProps={{ transition: 'rotate-left' }}
            >
              <Button 
                variant="outline" 
                color="red" 
                onClick={() => handleDeletion(item.id)}
              >
                I'm really want to delete this poll
              </Button>
            </Modal>
          </td>
        </tr>
      ))
    :
      <tr>
        <td>
          <Text fz="xl" fw={400} variant="gradient" my="xl" py="xl">
            Nothing here for now :)
          </Text>
        </td>
      </tr>
  );

  return (
    (!error) ?
      (isLoading) ? 
        <Center mx="xl" my="xl" px="xl" py="xl">
            <Loader size="xl" variant="dots"/>
        </Center>
      : 
        <ScrollArea mih={80} h={350} type="always" offsetScrollbars> 
          <Table miw={200} verticalSpacing="sm" highlightOnHover>
            <thead>
            </thead>
            <tbody>{user_polls}</tbody>
          </Table>
        </ScrollArea>      
    : 
      <Container size="sm" my="xl" px="xl" py="xl">
        <CustomAlert>
            Error while loading data
        </CustomAlert>
      </Container>
  )
};