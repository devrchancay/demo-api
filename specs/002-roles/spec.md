---
id: '002'
project: roles
---

# List roles

A client needs to read the roles the service knows, so it can show them when assigning a
role to a user in a later iteration. A role is an `id`, a `name` and a `description`. The
service starts with two roles already loaded, `admin` and `user`, and keeps them in memory:
they last as long as the process, and a restart brings back the same two.

The `id` is a UUID. The two starting ids are fixed values written in the code, not
generated at startup, so a client can rely on them across restarts.

## Out of scope

- Creating, changing or removing a role. No `POST`, `PATCH`, `PUT` or `DELETE`.
- Reading a single role by id or by name.
- Assigning a role to a user, or listing the users of a role.
- Persisting roles anywhere but in memory.
- Pagination, filtering and sorting of the list.

## Acceptance criteria

- `GET /roles` answers 200 with the two starting roles.
- Every role in the answer carries an `id` that is a UUID and a non-empty `name` and `description`.
- The two ids in the answer are all different.
- The names in the answer are exactly `admin` and `user`, in that order.
- `GET /roles` answers exactly the same body on two calls in a row.
