export interface User {
  readonly id: string
  readonly firstName: string
  readonly lastName: string
  readonly address: string
  readonly phone: string
}

/**
 * The store for this iteration: in memory only. A `Map` keeps insertion order, so the
 * starting users are inserted oldest first and listing them needs no sorting.
 */
const users = new Map<string, User>()

const startingUsers: readonly User[] = [
  {
    id: '5b1f0c2e-8a4d-4f6b-9e3a-1c7d2b8f4a61',
    firstName: 'María',
    lastName: 'Andrade',
    address: 'Av. 9 de Octubre 1204, Guayaquil',
    phone: '+593 99 412 3387',
  },
  {
    id: '9c3e7a15-2d6b-4b8e-a1f4-6e0d3c9b2f78',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    address: 'Calle Larga 7-45, Cuenca',
    phone: '+593 98 765 1120',
  },
  {
    id: 'e2a4d8b6-4c1f-4e9a-b7d3-8f5c1a0e6b93',
    firstName: 'Lucía',
    lastName: 'Villacís',
    address: 'Av. Amazonas N34-120, Quito',
    phone: '+593 96 230 5541',
  },
]

for (const user of startingUsers) {
  users.set(user.id, user)
}

/** The users in the store, oldest first. */
export function listUsers(): User[] {
  return [...users.values()]
}
