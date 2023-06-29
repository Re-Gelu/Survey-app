import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export const CustomAlert = ({children}: React.PropsWithChildren) => {
    return (
        <Alert icon={<IconAlertCircle size="2rem" />} title="Oh no... Cringe!" color="red" variant="outline">
            {children}
        </Alert>
    )
}