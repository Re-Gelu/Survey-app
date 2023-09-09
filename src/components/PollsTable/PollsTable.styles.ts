import { createStyles } from '@mantine/core';

export default createStyles((theme) => ({
  adapt: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },

  adaptFont: {
    [theme.fn.smallerThan('xs')]: {
      fontSize: 18,
    },
  },
}));
