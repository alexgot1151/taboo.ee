# Inventory API (Docker network)

Use the Nginx host name `inv_app` from within the same Docker network (ports are not exposed publicly). Base URL: `http://inv_app/api`.

## Public
- `GET /public/shishas` → `{ shishas: [{ name, packSize, gramsPerServe, gramsRemaining }] }`

## Auth
- Send header `X-Password: <your_password>`.
- `POST /login` `{ password }`
- `GET /state` → `{ alcohols, shishas, misc }`

## Alcohol
- `POST /alcohols/consume` `{ name, amount? }`
- `POST /alcohols` `{ name, quantity? }`
- `POST /alcohols/add-bottle` `{ name, bottleSize? }`
- `POST /alcohols/refill` `{ name }`
- `DELETE /alcohols/{name}`

## Shisha
- `POST /shishas` `{ name, packSize, gramsPerServe, currentGrams? }`
- `POST /shishas/serve` `{ name }`
- `POST /shishas/restock` `{ name }`
- `DELETE /shishas/{name}`

## Misc
- `POST /misc` `{ name, quantity? }`
- `POST /misc/adjust` `{ name, delta }`
- `DELETE /misc/{name}`

## Examples
- Public list: `curl http://inv_app/api/public/shishas`
- Authorized: `curl -H "X-Password: PASSWORD_HERE" http://inv_app/api/state`
