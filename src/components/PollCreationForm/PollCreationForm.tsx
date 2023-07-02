import { Grid, Text, Center, Loader, Space, Title, Container, Radio, Button, 
  Group, Box, Progress, Transition, Code, ActionIcon, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';

export const PollCreationForm = () => {
  const form = useForm({
    initialValues: {
      choices: [{ text: '', votes: [] }],
    },
  });

  const fields = form.values.choices.map((item, index) => (
    <Group key={randomId()} mt="xs">
      <TextInput
        placeholder="Your poll question"
        withAsterisk
        sx={{ flex: 1 }}
        {...form.getInputProps(`choices.${index}.text`)}
      />
      <ActionIcon color="red" onClick={() => form.removeListItem('choices', index)}>
        <IconTrash size="1rem" />
      </ActionIcon>
    </Group>
  ));

  return (
    <Box maw={500} mx="auto">
      {fields.length > 0 ? (
        <Group mb="xs">
          <Text weight={500} size="sm" sx={{ flex: 1 }}>
            Question
          </Text>
        </Group>
      ) : (
        <Text color="dimmed" align="center" my="xl">
          No one here...
        </Text>
      )}

      {fields}

      <Group position="center" mt="md">
        <Button
          onClick={() =>
            form.insertListItem('choices', { text: '', votes: [] })
          }
        >
          Add poll choice
        </Button>
      </Group>

      <Text size="sm" weight={500} mt="md">
        Form values:
      </Text>
      <Code block>{JSON.stringify(form.values, null, 2)}</Code>
    </Box>
  );
};