import { createStyles } from '@mantine/core';

export default createStyles((theme) => ({
    adapt: {
        [theme.fn.smallerThan('xs')]: {
            display: 'none',
        },
    },
}));