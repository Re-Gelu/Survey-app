import { Table, Group, Text, ScrollArea, Badge, ActionIcon, Grid,ColSpan  } from '@mantine/core';
import { IconArrowBadgeRight } from '@tabler/icons-react';
import Link from 'next/link';
import useStyles from './PollsTable.styles';

export const PollsTable = ({ data }: { data: Poll[] }) => {
  const { classes, cx } = useStyles();
  
  const rows = data && data.map((item) => (
    <tr key={item.id && item.id}>
        <td>
          <Link href={`/${item.id}`}>
            <Group>
              <ActionIcon variant="transparent" className={classes.adapt}><IconArrowBadgeRight size={28} /></ActionIcon>
              <Text fz="xl" fw={400} variant="gradient" className={classes.adaptFont}>
                {item.question && item.question}
              </Text>
            </Group>
          </Link>
        </td>
        <td>{item.created_at && new Date(item.created_at).toLocaleDateString()}</td>
        <td>
          {Math.random() > 0.5 ? (
            <Badge fullWidth>Active</Badge>
          ) : (
            <Badge color="gray" fullWidth>Finished</Badge>
          )}
        </td>
    </tr>
  ));

  return (
    <ScrollArea h={600} type="always" offsetScrollbars> 
      <Table miw={200} verticalSpacing="sm" highlightOnHover>
        <thead>
          <tr>
            <th>Question</th>
            <th>Published</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}