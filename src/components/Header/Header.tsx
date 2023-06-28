import { useState } from 'react';
import { Title, Text, Header, Container, Group, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import useStyles from './Header.styles';

interface HeaderSimpleProps {
  links: { link: string; label: string }[];
}

export const HeaderSimple = ({ links }: HeaderSimpleProps) => {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);
  const { classes, cx } = useStyles();

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={cx(classes.link, { [classes.linkActive]: active === link.link })}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <Header height={60} mb="md">
      <Container className={classes.header}>
        <Title className={classes.title}>
          Survey  
          <Text inherit variant="gradient" component="span" mx="sm">
             App
          </Text>
        </Title>
        <Group spacing={5} className={classes.links}>
          {items}
          <ColorSchemeToggle></ColorSchemeToggle>
        </Group>

        <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />
      </Container>
    </Header>
  );
}