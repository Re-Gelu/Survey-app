import { Title, Text, Header, Container, Group, ActionIcon } from '@mantine/core';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import useStyles from './Header.styles';

export const CustomHeader = () => {
  const { classes, cx } = useStyles();

  return (
    <Header height={70} mb="md">
      <Container className={classes.header}>
        <Link href="/">
          <Title className={classes.title}>
            Survey  
            <Text inherit variant="gradient" component="span" mx="sm">
              App
            </Text>
          </Title>
        </Link>
        <Group spacing={5}>
          <Link href="/dashboard">
            <ActionIcon
              size="lg"
              variant="outline"
              title="Your polls"
            >
              <IconUser size={18} />
            </ActionIcon>
          </Link>
          <ColorSchemeToggle></ColorSchemeToggle>
        </Group>
      </Container>
    </Header>
  );
}