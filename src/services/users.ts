/**
 * The user resource: an in-memory store and all the logic around it. Nothing here knows
 * about Fastify or HTTP; a route maps the results below to status codes.
 *
 * The store is a module-level `Map<string, User>`, so it lives only for the process and a
 * restart loses it. Iteration order of a `Map` is insertion order, which is what makes
 * `listUsers()` return users oldest first without an explicit sort.
 */

export interface User {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface UserInput {
  readonly name: string
  readonly email: string
}

export interface UserPatch {
  readonly name?: string
  readonly email?: string
}

export type CreateUserResult =
  | { readonly ok: true; readonly user: User }
  | { readonly ok: false; readonly error: 'email-taken' }

export type UpdateUserResult =
  | { readonly ok: true; readonly user: User }
  | { readonly ok: false; readonly error: 'not-found' | 'email-taken' }

export type DeleteUserResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: 'not-found' }

const store = new Map<string, User>()

function findByEmail(email: string, excludeId?: string): User | undefined {
  for (const user of store.values()) {
    if (user.email === email && user.id !== excludeId) return user
  }
  return undefined
}

export function createUser(input: UserInput): CreateUserResult {
  if (findByEmail(input.email) !== undefined) {
    return { ok: false, error: 'email-taken' }
  }

  const now = new Date().toISOString()
  const user: User = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    createdAt: now,
    updatedAt: now,
  }

  store.set(user.id, user)
  return { ok: true, user }
}

export function listUsers(): User[] {
  return Array.from(store.values())
}

export function findUser(id: string): User | undefined {
  return store.get(id)
}

export function updateUser(id: string, patch: UserPatch): UpdateUserResult {
  const existing = store.get(id)
  if (existing === undefined) {
    return { ok: false, error: 'not-found' }
  }

  if (patch.email !== undefined && findByEmail(patch.email, id) !== undefined) {
    return { ok: false, error: 'email-taken' }
  }

  const updated: User = {
    ...existing,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.email !== undefined ? { email: patch.email } : {}),
    updatedAt: new Date().toISOString(),
  }

  store.set(id, updated)
  return { ok: true, user: updated }
}

export function deleteUser(id: string): DeleteUserResult {
  if (!store.delete(id)) {
    return { ok: false, error: 'not-found' }
  }
  return { ok: true }
}

/** Test-only: clears the store so tests do not depend on each other's order. */
export function resetUsers(): void {
  store.clear()
}
