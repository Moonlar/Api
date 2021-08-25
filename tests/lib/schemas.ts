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
};
