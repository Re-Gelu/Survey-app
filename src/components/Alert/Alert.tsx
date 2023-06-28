import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface CustomAlertProps {
  children: React.ReactNode;
}

export const CustomAlert = ({children}: CustomAlertProps) => {
    return (
        <Alert icon={<IconAlertCircle size="2rem" />} title="Oh no... Cringe!" color="red" variant="outline">
            {children}
        </Alert>
    )
}