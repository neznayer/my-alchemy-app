# CI/CD in GH actions:

- in order to let the alchemy provision its own scoped API tokens for preview depployment, we need to grant it these rights. For that we would need a brand new used, not just my account, that has rights to write(create) tokens

create "admin" user with
`alchemy profile create admin`
`alchemy profile edit --profile admin --add Cloudflare`

This will be a root user profile, with ability to add tokens, so treat it like one. DON'T use it for everyday tasks like `alchemy dev`, only for
the github stack.

set Global token, set the scopes ,
