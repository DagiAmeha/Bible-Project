"use client";
import { signOut } from 'next-auth/react';
import { Button } from './Button';

export function Logout() {

  return (

    <div className="flex items-center gap-2">
      <Button
        variant="default"
        onClick={() => signOut()}
      >
        Logout
      </Button>
    </div>
  );
}


