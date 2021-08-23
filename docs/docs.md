# Exemplo

## METHOD _path_

Description.

_needs authentication_

### Body

```json
{
  "hello": "world"
}
```

### Query Params

|  Name   |  Type  | Required |  Description   |
| :-----: | :----: | :------: | :------------: |
| Example | string |  false   | Just a example |

### Route Params

|   Name   |  Description   |
| :------: | :------------: |
| :example | Just a example |

### Response

```json
{
  "hello": "world"
}
```

# Rotas

## GET _/_

Retorna dados sobre a aplicação.

### Response

```json
{
  "environment": "test" | "development" | "production"
}
```

## GET _/admin/users_

Retorna lista de usuários admin.

_Precisa de autenticação_

### Query Params

|  Name  |  Type  | Required |     Description     |
| :----: | :----: | :------: | :-----------------: |
|  page  | number |  false   |   Página de busca   |
| search | string |  false   | Parâmetros de busca |

### Response

```json
{
  "page": "number",
  "total_pages": "number",
  "total_users": "number",
  "limit": "number",
  "users": {
    "id": "uuid",
    "nickname": "string",
    "display_name": "string",
    "permission": "string",
    "created_at": "string",
    "updated_at": "string",
    "deleted_at": "string"
  }[]
}
```
