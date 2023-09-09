import { ActionIcon, CopyButton, Tooltip } from '@mantine/core';
import { IconCheck, IconShare } from '@tabler/icons';

export const CustomCopyButton = ({ value }: { value: string }) => {
  return (
    <CopyButton value={value}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? 'Copied' : 'Copy'} position="bottom-end">
          <ActionIcon color={copied ? 'teal' : undefined}>
            {copied ? <IconCheck /> : <IconShare stroke={1} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
};
