---
id: '001'
project: users
---

# List users

A client needs to read the users the service knows. A user is an `id`, a `firstName`, a
`lastName`, an `address` and a `phone`. The service starts with three users already loaded
and keeps them in memory: they last as long as the process, and a restart brings back the
same three.

The `id` is a UUID. The three starting ids are fixed values written in the code, not
generated at startup, so a client can rely on them across restarts.

## Out of scope

- Creating, changing or removing a user. No `POST`, `PATCH`, `PUT` or `DELETE`.
- Reading a single user by id.
- Persisting users anywhere but in memory.
- Pagination, filtering and sorting of the list.

## Acceptance criteria

- `GET /users` answers 200 with the three starting users.
- Every user in the answer carries an `id` that is a UUID and a non-empty `firstName`, `lastName`, `address` and `phone`.
- The three ids in the answer are all different.
- The answer lists the starting users in the order the plan gives them.
- `GET /users` answers exactly the same body on two calls in a row.
