import { useState, useRef, Dispatch, SetStateAction } from 'react';
import { NumberInput, Group, ActionIcon, NumberInputHandlers } from '@mantine/core';

interface CountControlType {
  value: number | undefined;
  setValue: Dispatch<SetStateAction<number | undefined>>;
  min?: number;
  max?: number;
}

export default function CountControl({ setValue, value, max, min }: CountControlType) {
  const handlers = useRef<NumberInputHandlers>();

  return (
    <Group spacing={5}>
      <ActionIcon size={42} variant="default" onClick={() => handlers.current?.decrement()}>
        –
      </ActionIcon>

      <NumberInput
        className="flex-1"
        hideControls
        value={value}
        onChange={val => setValue(val)}
        handlersRef={handlers}
        max={max}
        min={min}
        step={1}
        styles={{ input: { textAlign: 'center' } }}
      />

      <ActionIcon size={42} variant="default" onClick={() => handlers.current?.increment()}>
        +
      </ActionIcon>
    </Group>
  );
}
