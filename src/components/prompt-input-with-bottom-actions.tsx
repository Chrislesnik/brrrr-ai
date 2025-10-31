"use client";

import React from "react";
import {Button, Tooltip, ScrollShadow} from "@heroui/react";
import {Icon} from "@iconify/react";
import {cn} from "@heroui/react";

import PromptInput from "./prompt-input";

export default function Component() {
  const actions = [
    {label: "Draft an email", icon: "gravity-ui:mail"},
    {label: "Create an image", icon: "gravity-ui:image"},
    {label: "Brainstorm", icon: "gravity-ui:bulb"},
    {label: "Make a plan", icon: "gravity-ui:checklist"},
    {label: "Code", icon: "gravity-ui:code"},
    {label: "Help me write", icon: "gravity-ui:pen"},
    {label: "Get advice", icon: "gravity-ui:question-circle"},
  ];

  const [prompt, setPrompt] = React.useState<string>("");

  return (
    <div className="flex w-full flex-col gap-4">
      <ScrollShadow hideScrollBar className="flex flex-nowrap gap-2" orientation="horizontal">
        <div className="flex gap-2">
          {actions.map(({label, icon}, index) => (
            <Button
              key={index}
              size="sm"
              radius="full"
              className="bg-transparent text-default-700 border-small border-default-200 data-[hover=true]:bg-default-100"
              startContent={<Icon className="text-default-500" icon={icon} width={16} />}
              variant="bordered"
            >
              {label}
            </Button>
          ))}
        </div>
      </ScrollShadow>
      <form className="rounded-medium bg-default-100 hover:bg-default-200/70 flex w-full flex-col items-start transition-colors">
        <PromptInput
          classNames={{
            inputWrapper: "bg-transparent! shadow-none",
            innerWrapper: "relative",
            input: "pt-1 pl-2 pb-6 pr-10! text-medium",
          }}
          endContent={
            <div className="flex items-end gap-2">
              <Tooltip showArrow content="Send message">
                <Button
                  isIconOnly
                  color={!prompt ? "default" : "primary"}
                  isDisabled={!prompt}
                  radius="lg"
                  size="sm"
                  variant="solid"
                >
                  <Icon
                    className={cn(
                      "[&>path]:stroke-[2px]",
                      !prompt ? "text-default-600" : "text-primary-foreground",
                    )}
                    icon="solar:arrow-up-linear"
                    width={20}
                  />
                </Button>
              </Tooltip>
            </div>
          }
          minRows={3}
          maxRows={8}
          radius="lg"
          value={prompt}
          variant="flat"
          onValueChange={setPrompt}
        />
        <div className="flex w-full items-center justify-between gap-2 overflow-auto px-4 pb-4">
          <div className="flex w-full gap-1 md:gap-3">
            <Button
              size="sm"
              startContent={
                <Icon className="text-default-500" icon="solar:paperclip-linear" width={18} />
              }
              variant="flat"
            >
              Attach
            </Button>
            <Button
              size="sm"
              startContent={
                <Icon className="text-default-500" icon="solar:soundwave-linear" width={18} />
              }
              variant="flat"
            >
              Voice Commands
            </Button>
            <Button
              size="sm"
              startContent={
                <Icon className="text-default-500" icon="solar:notes-linear" width={18} />
              }
              variant="flat"
            >
              Templates
            </Button>
          </div>
          <p className="text-tiny text-default-400 py-1">{prompt.length}/2000</p>
        </div>
      </form>
    </div>
  );
}
