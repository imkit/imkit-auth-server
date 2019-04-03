# IMKit Auth Service Architecture

![Architecture](Auth2.1.png)

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
  "id": "sss",
  "nickname": "Nola",
  "avatarUrl": "https://globalassets.starbucks.com/assets/c1f4cd02de24483eb86c696401ad4213.jpg"
}

```
