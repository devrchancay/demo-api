export interface Role {
  readonly id: string
  readonly name: string
  readonly description: string
}

/**
 * The store for this iteration: in memory only. A `Map` keeps insertion order, so the
 * starting roles are inserted in order and listing them needs no sorting.
 */
const roles = new Map<string, Role>()

const startingRoles: readonly Role[] = [
  {
    id: '7d2f4b8a-1c6e-4a3d-9f5b-2e8c0d4a6b17',
    name: 'admin',
    description: 'Administra usuarios, roles y la configuración del sistema',
  },
  {
    id: '3a9c1e5d-6b2f-4d8a-b4e7-9c1f3a7d5e20',
    name: 'user',
    description: 'Usa el sistema con los permisos básicos de un usuario final',
  },
]

for (const role of startingRoles) {
  roles.set(role.id, role)
}

/** The roles in the store, in insertion order. */
export function listRoles(): Role[] {
  return [...roles.values()]
}
