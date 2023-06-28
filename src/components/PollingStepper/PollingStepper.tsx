import { useState } from 'react';
import { Stepper } from '@mantine/core';
import { IconBrandAmongUs } from '@tabler/icons-react';

export const PollingStepper = () => {
  const [active, setActive] = useState(1);
  
  return (
    <Stepper active={active} onStepClick={setActive} orientation="vertical">
      <Stepper.Step icon={<IconBrandAmongUs size={12} />} label="Step 1" description="First step" />
      <Stepper.Step icon={<IconBrandAmongUs size={12} />} label="Step 2" description="Second step" />
      <Stepper.Step icon={<IconBrandAmongUs size={12} />} label="Step 3" description="Third step" />
    </Stepper>
  );
}