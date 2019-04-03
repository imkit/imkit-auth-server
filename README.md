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
