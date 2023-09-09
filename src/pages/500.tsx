import { Center, Stack, Title, Paper, Container } from '@mantine/core';

const Custom500 = () => {
  return (
    <Container my="xl" py="xl">
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Center my="xl" py="xl">
          <Stack align="center">
            <Title order={2} fw={200}>
              A server error has occurred...
            </Title>
            <Title order={2} fw={200}>
              Try to come back later :3
            </Title>
          </Stack>
        </Center>
      </Paper>
    </Container>
  );
};

export default Custom500;
