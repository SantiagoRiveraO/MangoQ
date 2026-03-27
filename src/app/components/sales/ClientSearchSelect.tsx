import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Client } from '../../types';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '../ui/utils';

interface ClientSearchSelectProps {
  clients: Client[];
  value: string;
  onChange: (clientId: string) => void;
}

export function ClientSearchSelect({ clients, value, onChange }: ClientSearchSelectProps) {
  const [open, setOpen] = useState(false);

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [clients]
  );

  const selectedClientName = value === 'none'
    ? 'Sin cliente'
    : clients.find((client) => client.id === value)?.name || 'Seleccionar cliente';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{selectedClientName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar cliente por nombre, correo o telefono..." />
          <CommandList>
            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="sin cliente general none"
                onSelect={() => {
                  onChange('none');
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === 'none' ? 'opacity-100' : 'opacity-0'
                  )}
                />
                Sin cliente
              </CommandItem>
              {sortedClients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`${client.name} ${client.email} ${client.phone}`}
                  onSelect={() => {
                    onChange(client.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === client.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{client.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{client.email}</span>
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
