# Exemplo

## METHOD _path_

Description.

_needs authentication_

> Body

```ts
type RequestBody = {
  key: string;
};
```

> Query Params

|  Name   |  Type  | Required |  Description   |
| :-----: | :----: | :------: | :------------: |
| Example | string |  false   | Just a example |

> Route Params

|   Name   |  Description   |
| :------: | :------------: |
| :example | Just a example |

> Response

```ts
type RequestBody = {
  key: string;
};
```

# Rotas

## GET _/_

Retorna dados sobre a aplicação

> Response

```ts
type ResponseBody = {
  environment: 'test' | 'development' | 'production';
};
```

## GET _/admin/users_

Retorna lista de usuários admin

_Precisa de autenticação (Manager)_

> Query Params

|  Name  |  Type  | Required |     Description     |
| :----: | :----: | :------: | :-----------------: |
|  page  | number |  false   |   Página de busca   |
| search | string |  false   | Parâmetros de busca |

> Response

```ts
type ResponseBody = {
  key: string;
  page: number;
  total_pages: number;
  total_users: number;
  limit: number;
  users: {
    id: string; // uuid
    nickname: string;
    display_name: string;
    permission: 'admin' | 'manager';
    created_at: string;
    updated_at: string;
    deleted_at: null;
  }[];
};
```

## GET _/admin/user_

Retorna dados do usuário admin conectado

_Precisa de autenticação_

> Response

```ts
type ResponseBody = {
  id: string; // uuid
  nickname: string;
  display_name: string;
  permission: 'admin' | 'manager';
  created_at: string;
  updated_at: string;
  deleted_at: null;
};
```

## GET _/admin/user/:identifier_

Retorna dados de um usuário admin pelo nickname

_Precisa de autenticação (Manager)_

> Route Params

|    Name     |     Description     |
| :---------: | :-----------------: |
| :identifier | Nickname do usuário |

> Response

```ts
type ResponseBody = {
  id: string; // uuid
  nickname: string;
  display_name: string;
  permission: 'admin' | 'manager';
  created_at: string;
  updated_at: string;
  deleted_at: null;
};
```

## POST _/admin/user/_

Cria um novo usuário admin

_Precisa de autenticação (Manager)_

> Body

```ts
type RequestBody = {
  nickname: string;
  email: string;
};
```

> Response

```ts
type ResponseBody = {
  message: 'User created successfully';
};
```

## PATCH _/admin/user_

Atualizar dados de um usuário admin conectado

_Precisa de autenticação (Admin | Manager)_

> Body

```ts
type RequestBody = {
  nickname: string;
  email: string;
  permission: 'admin' | 'manager';
};
```

> Response

```ts
type ResponseBody = {
  message: 'User update successfully';
};
```

## PATCH _/admin/user/:identifier_

Atualizar dados de um usuário admin pelo nickname

_Precisa de autenticação (Manager)_

> Route Params

|    Name     |     Description     |
| :---------: | :-----------------: |
| :identifier | Nickname do usuário |

> Body

```ts
type RequestBody = {
  nickname: string;
  email: string;
  permission: 'admin' | 'manager';
};
```

> Response

```ts
type ResponseBody = {
  message: 'User update successfully';
};
```

## DELETE _/admin/user_

Deletar usuário admin conectado

_Precisa de autenticação (Admin | Manager)_

> Response

```ts
type ResponseBody = {
  message: 'Account successfully deleted';
};
```

## DELETE _/admin/user/:identifier_

Deletar um usuário admin pelo nickname

_Precisa de autenticação (Manager)_

> Route Params

|    Name     |     Description     |
| :---------: | :-----------------: |
| :identifier | Nickname do usuário |

> Response

```ts
type ResponseBody = {
  message: 'Account successfully deleted';
};
```

## GET _/servers_

Buscar servidores de relacionado

_Pode não estar autenticado_

> Query Params

|  Name  |  Type  | Required |     Description     |
| :----: | :----: | :------: | :-----------------: |
|  page  | number |  false   |   Página de busca   |
| search | string |  false   | Parâmetros de busca |

> Response

```ts
type ResponseBody = {
  page: number;
  total_pages: number;
  total_servers: number;
  limit: number;
  servers: {
    id: string;
    identifier: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    deleted_at: null | string; // Retorna string se tiver permissão Admin ou Manager
  }[];
};
```

## GET _/server/:id_

Buscar servidor de relacionado pelo seu id

_Pode não estar autenticado_

> Route Params

| Name |            Description             |
| :--: | :--------------------------------: |
| :id  | ID do servidor que deseja retornar |

> Response

```ts
type ResponseBody = {
  id: string;
  identifier: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string; // Retorna string se tiver permissão Admin ou Manager
};
```

## POST _/server_

Cria um novo servidor de relacionamento

_Precisa de autenticação (Manager)_

> Body

```ts
type RequestBody = {
  name: string;
  description: string;
};
```

> Response

```ts
type ResponseBody = {
  message: 'Successfully created';
};
```

## PATCH _/server/:id_

Atualiza dados de um servidor de relacionamento

_Precisa de autenticação (Manager)_

> Route Params

| Name |             Description             |
| :--: | :---------------------------------: |
| :id  | ID do servidor que deseja atualizar |

> Body

```ts
type RequestBody = {
  name?: string;
  description?: string;
};
```

> Response

```ts
type ResponseBody = {
  message: 'Successfully updated';
};
```

## DELETE _/server/:id_

Remove dados de um servidor de relacionamento

_Precisa de autenticação (Manager)_

> Route Params

| Name |            Description            |
| :--: | :-------------------------------: |
| :id  | ID do servidor que deseja remover |

> Response

```ts
type ResponseBody = {
  message: 'Successfully deleted';
};
```

## GET _/admin/auth_

Retorna dados da sessão conectada

_Precisa estar conectado_

> Response

```ts
type ResponseBody = {
  nickname: string;
  permission: 'user' | 'admin' | 'manager';
};
```

## POST _/admin/auth_

Iniciar uma sessão

_Precisa estar desconectado_

> Body

```ts
type RequestBody = {
  email: string;
  password: string;
};
```

> Response

```ts
type ResponseBody = {
  message: 'Successfully login';
};
```

## DELETE _/admin/auth_

Encerrar uma sessão

_Precisa estar conectado_

> Response

```ts
type ResponseBody = {
  message: 'Successfully logout';
};
```

## GET _/products_

Buscar produtos da loja

_Pode não estar autenticado_

> Query Params

|  Name  |  Type  | Required |     Description     |
| :----: | :----: | :------: | :-----------------: |
|  page  | number |  false   |   Página de busca   |
| search | string |  false   | Parâmetros de busca |

> Response

```ts
type ResponseBody = {
  page: number;
  total_pages: number;
  total_products: number;
  limit: number;
  products: {
    id: string;
    name: string;
    description: string;
    image_url: string | null;
    price: number;
    active: boolean | undefined; // Retorna undefined caso nível de permissão seja inferior a Admin
    server: {
      id: string;
      name: string;
      description: string;
    };
    created_at: string;
    updated_at: string;
    deleted_at: null;
  }[];
};
```

## GET _/product/:id_

Buscar produto da loja pelo id

_Pode não estar autenticado_

> Route Params

| Name |  Description  |
| :--: | :-----------: |
| :id  | ID do produto |

> Response

```ts
type ResponseBody = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price: number;
  active: boolean | undefined; // Retorna undefined caso nível de permissão seja inferior a Admin
  server: {
    id: string;
    name: string;
    description: string;
  };
  benefits: {
    id: string;
    name: string;
    description: string;
  }[];
  /* Retorna undefined se o nível de permissão for inferior a Admin */
  commands:
    | undefined
    | {
        id: string;
        name: string;
        command: string;
      }[];
  created_at: string;
  updated_at: string;
  deleted_at: null;
};
```

## POST _/product_

Criar um produto

_Precisa estar autenticado (Manager)_

> Body

```ts
type RequestBody = {
  name: string;
  description: string;
  image_url: string | undefined;
  price: number;
  server_id: string;
  benefits: {
    name: string;
    description: string;
  }[];
  commands: {
    name: string;
    command: string;
  }[];
};
```

> Response

```ts
type ResponseBody = {
  message: 'Successfully created';
};
```
