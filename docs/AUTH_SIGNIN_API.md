# POST /auth/signin

Realiza o sign in de um usuário com email e senha.

## Request

**URL:** `/auth/signin`

**Method:** `POST`

**Content-Type:** `application/json`

### Body

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Parameters

- `email` (string, required): E-mail do usuário
- `password` (string, required): Senha do usuário

## Response

### Success (200 OK)

```json
{
  "message": "Sign in successful",
  "user": {
    "id": "abc123",
    "email": "test@example.com",
    "name": "Test User",
    "createdAt": "2025-12-10T20:19:27.864Z"
  },
  "token": "eyJ1c2VySWQiOiJhYmMxMjMiLCJpYXQiOjE3MzMzNzM1NjcsImV4cCI6MTczMzQ1OTk2N30="
}
```

### Error - User not found (401 Unauthorized)

```json
{
  "error": "User not found"
}
```

### Error - Invalid password (401 Unauthorized)

```json
{
  "error": "Invalid password"
}
```

### Error - Missing fields (400 Bad Request)

```json
{
  "error": "Missing required fields: email, password"
}
```

## Example Usage

### cURL

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);
```

## Notes

- O token retornado é um JWT em formato Base64 com validade de 24 horas
- Credenciais de teste: `email: test@example.com`, `password: password123`
- O token pode ser utilizado para autenticar requisições subsequentes no header `Authorization`
