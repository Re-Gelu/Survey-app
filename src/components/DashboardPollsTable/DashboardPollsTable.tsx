import { Grid, Text, Center, Loader, Space, Title, Container, Table, Button, ScrollArea,
  Group, Box, Progress, Transition, CopyButton, ActionIcon, Tooltip } from '@mantine/core';
import { IconArrowBadgeRight, IconTrash } from '@tabler/icons-react';
import { CustomAlert } from '@/components/Alert/Alert';
import Link from 'next/link';
import useSWR from 'swr';
import fetcher from '@/swr';
import useStyles from './DashboardPollsTable.styles';

export const DashboardPollsTable = (props: PageDataWithIp) => {
  const { classes, cx } = useStyles();
  const { data, error, isLoading  } = useSWR(`/api/polls?offset=0&page_size=100`, fetcher);
  const filteredPolls: Poll[] = ((!error && !isLoading && data) ? 
      data.data.filter((poll: Poll )=> poll.creator_ip === props.ip) 
    : 
      undefined
  );

  const handleDeletion = async (id: string | undefined) => {
    console.log(id);
  };

  const user_polls = ((filteredPolls) ? 
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
                <ActionIcon color="red" onClick={() => handleDeletion(item.id)}>
                  <IconTrash size="1rem"/>
                </ActionIcon>
              </Group>
            </Group>
          </td>
        </tr>
      ))
    :
      <tr>
        <td>
          <Text fz="xl" fw={400} variant="gradient">
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
        <ScrollArea mih={200} mah={600} type="always" offsetScrollbars> 
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