import { useOutletContext } from 'react-router';
import { Clients } from '../components/Clients';
import { Client } from '../types';

interface OutletContext {
  clients: Client[];
  setClients: (clients: Client[]) => void;
}

export function ClientsPage() {
  const { clients, setClients } = useOutletContext<OutletContext>();
  
  return <Clients clients={clients} onUpdateClients={setClients} />;
}
