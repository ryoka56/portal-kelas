"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "./ui";

type Props = Omit<ComponentProps<typeof Button>, "type"> & {
  message: string;
  children: ReactNode;
};

export function ConfirmSubmit({ message, children, ...props }: Props) {
  return (
    <Button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
