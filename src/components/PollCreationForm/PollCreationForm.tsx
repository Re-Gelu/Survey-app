import { Text, Button, Group, Box, ActionIcon, TextInput, Switch } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, hasLength } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconCheck, IconExclamationMark, IconSkull } from '@tabler/icons';
import { mutate } from 'swr';
import axios from 'axios';

export const PollCreationForm = () => {
  const form = useForm({
    initialValues: {
      question: '',
      choices: [{ text: '', votes: []}],
      is_multiple_answer_options: false,
      expires_at: null,
    },
    validate: {
      question: hasLength({min: 1, max: 100}),
      choices: {
        text: hasLength({min: 1, max: 100}),
      }
    },
  });

  const handleChoiceAdding = () => {
    // Check if length of choices array is >= 1 and < 10
    if (form.values.choices.length >= 1 && form.values.choices.length < 10) {
      form.insertListItem('choices', { text: '', votes: [] })
    } else {
      notifications.show({ 
        message: 'Amount of choices must be from 1 to 10!', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };
  };

   const handleChoiceRemoving = (index: number) => {
    // Check if length of choices array is > 1 and <= 10
    if (form.values.choices.length > 1 && form.values.choices.length <= 10) {
      form.removeListItem('choices', index);
    } else {
      notifications.show({ 
        message: 'Amount of choices must be from 1 to 10!', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };
  };

  const handleError = (errors: typeof form.errors) => {
    if (errors.question) {
      notifications.show({ 
        message: 'Poll question must be from 1 to 100 letters long', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };

    if (Object.keys(errors).some((key) =>
      key.startsWith('choices.') && key.endsWith('.text') && errors[key]
    )) {
      notifications.show({ 
        message: 'Poll choices must be from 1 to 100 letters long', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };
  };

  const handleSubmit = async (values: typeof form.values, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios.post(`/api/polls`, values)
    .then(() => {
      notifications.show({ 
        message: 'Poll successfully created', 
        color: 'green',
        icon: <IconCheck />
      });
      // Refresh SWR data to show actual user polls in DashboardPollsTable
      mutate(`/api/polls?offset=0&page_size=100`);
    })
    .catch((error) => {
      notifications.show({ 
        message: error.response.data.error, 
        color: 'red',
        icon: <IconSkull />
      });
    });
  };

  const fields = form.values.choices.map((item, index) => (
    <Group key={index} mb="xs">
      <TextInput
        placeholder="Your poll choice"
        withAsterisk
        sx={{ flex: 1 }}
        {...form.getInputProps(`choices.${index}.text`)}
      />
      <ActionIcon color="red" onClick={() => handleChoiceRemoving(index)}>
        <IconTrash size="1rem" />
      </ActionIcon>
    </Group>
  ));

  return (
    <Box maw={500} mx="auto" component="form" onSubmit={form.onSubmit(handleSubmit, handleError)}>
      <TextInput
        placeholder="Who is me?"
        label="Your question"
        withAsterisk
        mb="xl"
        {...form.getInputProps(`question`)}
      />
      {fields.length > 0 ? (
        <Text weight={500} size="sm" sx={{ flex: 1 }}>
          Choices
        </Text>
      ) : (
        <Text color="dimmed" align="center" my="xl">
          No one here...  :(
        </Text>
      )}

      {fields}

      <Group position="center" mt="md">
        <Button
          variant="outline"
          onClick={() => handleChoiceAdding()}
        >
          Add poll choice
        </Button>
      </Group>

      <Group my="md" spacing="xl">
        <DateTimePicker
          clearable
          minDate={new Date()}
          dropdownType="modal"
          label="Poll expiration datetime"
          placeholder="Leave empty so that the survey is endless"
          {...form.getInputProps(`expires_at`)}
        />
        <Switch
          label="Is poll with multiple answers option?"
          {...form.getInputProps(`is_multiple_answer_options`)}
        />
      </Group>

      <Group position="center" mt="md">
        <Button type="submit" variant="outline" radius="xl">Confrim</Button>
      </Group>
    </Box>
  );
};