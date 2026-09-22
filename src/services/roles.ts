import { z } from 'zod';

export interface Role {
  name: string;
  description: string;
}

const CATALOGUE: readonly Role[] = [
  { name: 'admin', description: 'full access to the service' },
  { name: 'user', description: 'ordinary access' },
] as const;

export function listRoles(): readonly Role[] {
  return CATALOGUE;
}

export function findRole(name: string): Role | undefined {
  return CATALOGUE.find(role => role.name === name);
}