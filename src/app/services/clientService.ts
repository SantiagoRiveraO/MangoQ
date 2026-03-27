import { supabase } from '../../lib/supabase';
import { Client } from '../types';

interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

const toClient = (row: ClientRow): Client => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  createdAt: row.created_at,
});

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data ?? []).map(toClient);
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    })
    .select()
    .single();

  if (error) throw error;
  return toClient(data);
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.email !== undefined && { email: updates.email }),
      ...(updates.phone !== undefined && { phone: updates.phone }),
      ...(updates.address !== undefined && { address: updates.address }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toClient(data);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
