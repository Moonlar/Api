import * as yup from 'yup';

export const CreateAdminUserSchema = yup.object().shape({
  nickname: yup
    .string()
    .required()
    .min(4)
    .max(20)
    .matches(/^[A-Za-z0-9_]+$/),
  permission: yup.string().oneOf(['admin', 'manager']),
  email: yup.string().required().email(),
});

export const UpdateAdminUserSchema = yup.object().shape({
  nickname: yup
    .string()
    .min(4)
    .max(20)
    .matches(/^[A-Za-z0-9_]+$/),
  email: yup.string().email(),
  permission: yup.string().oneOf(['admin', 'manager']),
});

export const AdminUserLogInSchema = yup.object().shape({
  email: yup.string().required().email(),
  password: yup.string().required().min(6).max(20),
});

export const CreateServerSchema = yup.object().shape({
  identifier: yup.string().trim().lowercase().required().min(4).max(30),
  name: yup.string().trim().required().min(4).max(30),
  description: yup.string().trim().required().min(4).max(150),
});

export const UpdateServerSchema = yup.object().shape({
  name: yup.string().trim().min(4).max(30),
  description: yup.string().trim().min(4).max(150),
});

export const CreateProductSchema = yup.object().shape({
  name: yup.string().trim().required().min(4).max(30),
  description: yup.string().trim().required().min(4).max(150),
  image_url: yup.string().trim().url(),
  server_id: yup.string().trim().required(),
  price: yup.number().required().min(1),
  benefits: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().trim().required().min(4).max(30),
        description: yup.string().trim().required().min(4).max(60),
      })
    )
    .required(),
  commands: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().trim().required().min(4).max(30),
        command: yup.string().trim().required().min(4).max(60),
      })
    )
    .required(),
});

export const UpdateProductSchema = yup.object().shape({
  name: yup.string().trim().min(4).max(30),
  description: yup.string().trim().min(4).max(150),
  image_url: yup.string().trim().url(),
  server_id: yup.string().trim(),
  price: yup.number().min(1),
});
