export const userSchema = {
  $id: 'userTestSchema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      require: true,
    },
    identifier: {
      type: 'string',
      require: true,
    },
    nickname: {
      type: 'string',
      require: true,
    },
    permission: {
      type: 'string',
      require: true,
    },
    created_at: {
      type: 'string',
      require: true,
    },
    updated_at: {
      type: 'string',
      require: true,
    },
    deleted_at: {
      type: 'null',
      require: true,
    },
  },
  required: [
    'id',
    'identifier',
    'nickname',
    'permission',
    'created_at',
    'updated_at',
  ],
};

export const serverSchema = {
  $id: 'serverTestSchema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      require: true,
    },
    identifier: {
      type: 'string',
      require: true,
    },
    name: {
      type: 'string',
      require: true,
    },
    description: {
      type: 'string',
      require: true,
    },
    created_at: {
      type: 'string',
      require: true,
    },
    updated_at: {
      type: 'string',
      require: true,
    },
  },
  required: [
    'id',
    'identifier',
    'name',
    'description',
    'created_at',
    'updated_at',
  ],
};

export const productSchema = {
  $id: 'productTestSchema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      require: true,
    },
    name: {
      type: 'string',
      require: true,
    },
    description: {
      type: 'string',
      require: true,
    },
    image_url: {
      type: ['string', 'null'],
      require: true,
    },
    price: {
      type: 'number',
      require: true,
    },
    active: {
      type: 'boolean',
      require: true,
    },
    created_at: {
      type: 'string',
      require: true,
    },
    updated_at: {
      type: 'string',
      require: true,
    },
  },
  required: [
    'id',
    'name',
    'description',
    'image_url',
    'price',
    'active',
    'created_at',
    'updated_at',
  ],
};

export const productServerSchema = {
  $id: 'productTestSchema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      require: true,
    },
    name: {
      type: 'string',
      require: true,
    },
    description: {
      type: 'string',
      require: true,
    },
  },
  required: ['id', 'name', 'description'],
};

export const productBenefitSchema = {
  $id: 'productTestSchema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      require: true,
    },
    name: {
      type: 'string',
      require: true,
    },
    description: {
      type: 'string',
      require: true,
    },
  },
  required: ['id', 'name', 'description'],
};

export const productCommandSchema = {
  $id: 'productTestSchema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      require: true,
    },
    name: {
      type: 'string',
      require: true,
    },
    command: {
      type: 'string',
      require: true,
    },
  },
  required: ['id', 'name', 'command'],
};
