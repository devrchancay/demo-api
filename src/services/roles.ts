import { Readonly } from 'typescript';

export interface Role {
  name: string;
  description: string;
}

const CATALOGUE: Readonly<Role[]> = [
  { name: 'admin', description: 'full access to the service' },
  { name: 'user', description: 'ordinary access' },
];

export function listRoles(): Readonly<Role[]> {
  return CATALOGUE;
}

export function findRole(name: string): Role | undefined {
  return CATALOGUE.find(role => role.name === name);
}