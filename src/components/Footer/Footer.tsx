import { Footer, Group, Text, Divider, Grid  } from '@mantine/core';
import { IconCircle } from '@tabler/icons';

export const CustomFooter = () => {
  return (
    <Footer height={60} p="md" mt="xl" withBorder={false}>
          <Divider 
            my="xl" 
            label={
              <IconCircle color="gray" stroke={1} size={28}/>
            }
            labelPosition="center" 
          />
        <Grid justify="center">
          <Grid.Col span="auto"></Grid.Col>
          <Grid.Col span={6}>
            <Text fz="md" c="dimmed" fw={200} ta="center">
            © 2023 - Survey App
          </Text>
          </Grid.Col>
          <Grid.Col span="auto" mt="xl" pt="md">
            <Group position="right">
              <Text variant="gradient" ta="right" fz="xs" c="dimmed" fw={100} component='a' href="https://github.com/Re-Gelu">
                made by Re:Gelu 
              </Text>
              <div className="waves-container">
                  {Array.from({length: 10}, (_, i) => i + 1).map((i) => 
                      <div key={i} className="wave" style={{"--i": i} as any}></div>
                  )}
              </div>
            </Group>
          </Grid.Col>
      </Grid>
    </Footer>
  )
};