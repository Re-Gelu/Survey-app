import { Badge, Table, Group, Text, ScrollArea } from '@mantine/core';

export const PollsTable = ({ data }: { data: Poll[] }) => {
  const rows = data && data.map((item) => (
    <tr key={item.question}>
      <td>
        <Group spacing="sm">
          <div>
            <Text fz="sm" fw={500}>
              {item.question}
            </Text>
            <Text fz="xs" c="dimmed">
              Active
            </Text>
          </div>
        </Group>
      </td>

      <td>
        {/* <Select data={rolesData} defaultValue={item.role} variant="unstyled" /> */}
      </td>
      <td>{item.created_at && new Date(item.created_at).toLocaleDateString()}</td>
      <td>
        {Math.random() > 0.5 ? (
          <Badge fullWidth>Active</Badge>
        ) : (
          <Badge color="gray" fullWidth>
            Disabled
          </Badge>
        )}
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th>Question</th>
            <th>Popular answer</th>
            <th>Published</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}