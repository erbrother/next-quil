'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v)
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Uplod PDF</Button>
      </DialogTrigger>

      <DialogContent>
        ex123123
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
