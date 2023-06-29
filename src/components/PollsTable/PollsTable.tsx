import { Table, Group, Text, ScrollArea, Badge } from '@mantine/core';

export const PollsTable = ({ data }: { data: Poll[] }) => {
  const rows = data && data.map((item) => (
    <tr key={item.id && item.id}>
      <td>
        <Group spacing="sm">
          <div>
            <Text fz="xl" fw={400} variant="gradient"component="a" href={`/${item.id}`}>
              {item.question && item.question}
            </Text>
          </div>
        </Group>
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
      <Table miw={200} verticalSpacing="sm">
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