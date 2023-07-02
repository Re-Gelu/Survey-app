import { useState } from 'react';
import { Stepper } from '@mantine/core';
import { IconBrandAmongUs } from '@tabler/icons-react';

export const SurveyStepper = () => {
  const [active, setActive] = useState(1);
  
  return (
    <Stepper active={active} onStepClick={setActive} orientation="vertical">
      <Stepper.Step icon={<IconBrandAmongUs size={12} />} label="Step 1" description="Vote in the survey" />
      <Stepper.Step icon={<IconBrandAmongUs size={12} />} label="Step 2" description="View the voting results" />
      <Stepper.Step icon={<IconBrandAmongUs size={12} />} label="Step 3" description="Create your own survey" />
    </Stepper>
  );
}