import { Table, Text, ScrollArea, Badge, ActionIcon, Grid, Title } from '@mantine/core';
import { IconArrowBadgeRight } from '@tabler/icons-react';
import Link from 'next/link';
import useStyles from './PollsTable.styles';

export const PollsTable = ({ data }: { data: Poll[] }) => {
  const { classes, cx } = useStyles();
  
  const rows = ((data && data.length >= 1) ? data.map((item) => (
      <tr key={item.id && item.id}>
        <td>
          <Link href={`/polls/${item.id}`}>
            <Grid align="center" justify="space-between">
              <Grid.Col span="content" p={0}>
                <ActionIcon variant="transparent" className={classes.adapt}><IconArrowBadgeRight size={28} /></ActionIcon>
              </Grid.Col>
              <Grid.Col span="auto">
                <Text fz="xl" fw={400} variant="gradient" className={classes.adaptFont}>
                  {item.question && item.question}
                </Text>
              </Grid.Col>
            </Grid>
          </Link>
        </td>
        <td>{item.created_at && new Date(item.created_at).toLocaleDateString("ru-RU", {timeZone: "Europe/Moscow"})}</td>
        <td>
          {item.expires_at ? (new Date(item.expires_at).getTime() >= new Date().getTime()) ? 
                <Badge fullWidth>Active</Badge>
              : 
                <Badge color="gray" fullWidth>Finished</Badge>
            : 
              <Badge fullWidth>Active</Badge>
          }
        </td>
      </tr>
    ))
  :
    <></>
  );

  return (
    <>
      {(data && data.length >= 1) ?
        <ScrollArea mih={200} h={600} type="always" offsetScrollbars> 
          <Table miw={200} verticalSpacing="sm" highlightOnHover>
            <thead>
              <tr>
                <th><Text>Question</Text></th>
                <th><Text align="center">Published</Text></th>
                <th><Text align="center">Status</Text></th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </ScrollArea>
      :
        <Title order={2} fw={300} variant="gradient" align="center" my="xl" py="xl">
          No polls for now :(
        </Title>
      }
    </>
  );
}