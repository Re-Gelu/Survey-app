import { Grid, Text, Center, Loader, Space, Title, Paper, Container } from '@mantine/core';

const Custom404 = () => {
    return (
        <Container my="xl" py="xl">
            <Paper shadow="sm" radius="md" p="xl" withBorder>
            <Center my="xl" py="xl">
                <Title order={2} fw={200}>
                    Uhh... Page not found :(
                </Title>
            </Center>
            </Paper>
        </Container>
    );
};

export default Custom404;