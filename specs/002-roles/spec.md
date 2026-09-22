---
id: '002'
project: roles
---

# Roles catalogue

The service needs to say which roles exist. There are two, `admin` and `user`, and they are
fixed in the code: nobody creates, renames or removes a role through the API. A client — a
form that has to fill a dropdown, or another service that wants to check a name it was
given — reads the catalogue and gets the same answer every time.

Read only, and read only on purpose. Only `GET` is exposed; the catalogue is part of the
build, not data the service keeps. There is no store, no state and nothing to reset between
requests.

A role is a name and a short description of what it is for. It is not attached to a user
and it grants nothing: this feature is the list of names, and using one to decide what
somebody may do is a later spec.

## Out of scope

- Creating, changing or removing a role. No `POST`, `PATCH`, `PUT` or `DELETE`.
- Giving a role to a user, or reading which role a user has.
- Deciding what a role lets somebody do.
- Persisting the catalogue anywhere.

## Acceptance criteria

- `GET /roles` answers 200 with the two roles of the catalogue, `admin` first and `user` second.
- Every role in the answer carries a non-empty `name` and a non-empty `description`.
- `GET /roles` answers exactly the same body on two calls in a row, because nothing can change it.
- `GET /roles/admin` answers 200 with the `admin` role alone.
- `GET /roles/nope` answers 404 for a name that is not in the catalogue.
