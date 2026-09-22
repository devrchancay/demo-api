---
id: '001'
project: users
---

# Users CRUD

The service needs a way to keep the people who use it: create one, list them, read one,
change one and remove one. This is the first feature of the service, so it also settles the
shape the rest will follow — a service holding the logic, a route validating the input, and
tests driving the app without opening a port.

A user is a name and an email. Nothing else, and no credentials of any kind: this feature is
about the shape of the resource, not about who is allowed to use it.

The store is in memory, on purpose. It lives for as long as the process does, so a restart
loses everything. That is acceptable here because the point is the resource and its
contract; moving it to a table is a later spec, and that is when `pg@8` joins the
components.

## Out of scope

- Persistence across restarts.
- Sign in, sessions, or anything a person could log in with.
- Pagination and filtering of the list.
- Changing an email to one another user already has.

## Acceptance criteria

- `POST /users` answers 201 with the created user, carrying an `id` the caller did not send.
- `POST /users` answers 400 when `name` is missing or `email` is not an email.
- `POST /users` answers 409 when `email` already belongs to another user.
- `GET /users` answers 200 with the list of users, and with an empty list when there are none.
- `GET /users/:id` answers 200 with the user, and 404 when no user has that id.
- `PATCH /users/:id` answers 200 with the updated user, taking `name`, `email` or both, and 404 when no user has that id.
- `DELETE /users/:id` answers 204 with no body, and 404 when no user has that id.
- A user removed with `DELETE` is gone from `GET /users`.
