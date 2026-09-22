---
id: 'NNN'
project: <kebab-case-slug>
---

# <What the feature is, in one line>

<Two or three sentences of context: who asks for this, what they get, and what problem
it solves. Write about behaviour, never about implementation.>

## Out of scope

- <What this spec explicitly does not cover, so the agent does not invent it.>

## Acceptance criteria

<One bullet per criterion. Each one has to be checkable by a test: a request, a
response and a status code. These bullets become `acceptance` in spec.yaml and the
test node writes a test for every one of them.>

- `POST /<resource>` answers 201 with the created resource and its id.
- A request with no `<field>` answers 400.
