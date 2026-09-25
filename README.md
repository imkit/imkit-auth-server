# IMKit Auth Service Architecture

## Type A
![Architecture 1](Auth%202.1.png)

## Type B
![Architecture 2](Auth%202.2.png)

## Running this service

```bash
docker run -e JWT_SECRET=<random secret, 32+ bytes> -p 3110:3110 ghcr.io/imkit/imkit-auth-server:master
```

- `JWT_SECRET` is required; the service exits at startup without it. Use a long random value and keep it in a secret store.
- `POST /sign` issues an HS256 token for any posted claims (adds a one-year `exp`). **Anyone who can reach `/sign` can mint a token for any user, so never expose this service outside a private network.**
- `POST /verify` accepts only HS256 tokens signed with `JWT_SECRET` and returns their claims, or 401.
- Tokens and claims are never logged; the request log records method, path, status and timing only.
- Tokens are compatible with the 1.x release (Node 8, jsonwebtoken 8): a token issued by either version verifies in the other when both use the same `JWT_SECRET`.

## Development

```bash
npm ci
npm test
```

## The IMKit Auth Compatible API MUST satisfy the API signature:
### Verify
Method: POST
Request Format: JSON
```javascript
{"token": "Client Access Token"}
```
Response: User data in JSON
```javascript
{"id": "user-id", "nickname": "Nickname", "avatarUrl", "Avatar URL"}
```

### Example
```
## Verify
curl -X "POST" "https://auth.fangho.com/verify" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNzcyIsIm5pY2tuYW1lIjoiTm9sYSIsImF2YXRhclVybCI6Imh0dHBzOi8vZ2xvYmFsYXNzZXRzLnN0YXJidWNrcy5jb20vYXNzZXRzL2MxZjRjZDAyZGUyNDQ4M2ViODZjNjk2NDAxYWQ0MjEzLmpwZyIsImV4cCI6MTU1NDM5MDg4NywiaWF0IjoxNTU0MzA0NDg3fQ.cnhdb0s37SZ5jS3jdL1DB78xdoZBQhfV_V1hpGUJbjs"
}'
```

```javascript
{
  "id": "sss", //Required
  "nickname": "Nola",  //Optional, the nickname of the client will be overwritten
  "avatarUrl": "https://globalassets.starbucks.com/assets/c1f4cd02de24483eb86c696401ad4213.jpg"//Optional, the avatarUrl of the client will be overwritten
}

```
