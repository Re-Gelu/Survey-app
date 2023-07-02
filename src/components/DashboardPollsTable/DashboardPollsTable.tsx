import { Grid, Text, Center, Loader, Space, Title, Container, Table, Button, ScrollArea,
  Group, Box, Progress, Transition, Modal, ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowBadgeRight, IconTrash, IconShare, IconCheck, IconExclamationMark, IconSkull } from '@tabler/icons-react';
import { CustomAlert } from '@/components/Alert/Alert';
import Link from 'next/link';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import fetcher from '@/swr';
import axios from 'axios';
import useStyles from './DashboardPollsTable.styles';

export const DashboardPollsTable = (props: PageDataWithIp) => {
  const { classes, cx } = useStyles();
  const { data, error, isLoading  } = useSWR(`/api/polls?offset=0&page_size=100`, fetcher);
  const [transitionOpened, setTransitionOpened] = useState<boolean>(false);
  const filteredPolls: Poll[] = ((!error && !isLoading && data) ? 
      data.data.filter((poll: Poll )=> poll.creator_ip === props.ip) 
    : 
      null
  );

  const handleDeletion = async (id: string | undefined) => {
    console.log(id);
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
    .catch((error) => {
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
            <Group position='apart'>
              <Link href={`/polls/${item.id}`}>
                <Group>
                  <ActionIcon variant="transparent" className={classes.adapt}><IconArrowBadgeRight size={24} /></ActionIcon>
                  <Text fz="xl" fw={400} variant="gradient" className={classes.adaptFont}>
                    {item.question && item.question}
                  </Text>
                </Group>
              </Link>
              <Group position="right">
                <ActionIcon color="red" onClick={() => setTransitionOpened(true)}>
                  <IconTrash size="1rem"/>
                </ActionIcon>
              </Group>
            </Group>

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
        <ScrollArea mih={80} mah={600} type="always" offsetScrollbars> 
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