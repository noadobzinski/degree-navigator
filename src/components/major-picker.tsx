import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MAJORS } from "@/data/majors";

type MajorPickerProps = {
  value: string;
  onChange: (majorId: string) => void;
  onDegreeDefault?: (degree: "BA" | "BS") => void;
};

export function MajorPicker({ value, onChange, onDegreeDefault }: MajorPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = MAJORS.find((m) => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="truncate">
              <span className="text-muted-foreground">{selected.roadmapCode}</span>
              {" · "}
              {selected.name}
            </span>
          ) : (
            "Choose a major"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search majors…" />
          <CommandList>
            <CommandEmpty>No major found.</CommandEmpty>
            <CommandGroup>
              {MAJORS.map((m) => (
                <CommandItem
                  key={m.id}
                  value={`${m.roadmapCode} ${m.name} ${m.department}`}
                  onSelect={() => {
                    onChange(m.id);
                    onDegreeDefault?.(m.defaultDegree);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === m.id ? "opacity-100" : "opacity-0")} />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{m.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {m.roadmapCode} · {m.department} · {m.degrees.join("/")}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
