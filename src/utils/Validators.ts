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

export const CreateProductSchema = yup.object().shape({
  title: yup.string().required().min(4).max(30),
  description: yup.string().required().min(4).max(150),
  image_url: yup.string().url(),
  server: yup.string().required(),
  price: yup.number().required().min(1),
  benefits: yup
    .array()
    .of(
      yup.object().shape({
        title: yup.string().required().min(4).max(30),
        description: yup.string().required().min(4).max(60),
      })
    )
    .required(),
  commands: yup
    .array()
    .of(
      yup.object().shape({
        title: yup.string().required().min(4).max(30),
        description: yup.string().required().min(4).max(60),
        command: yup.string().required().min(4).max(60),
      })
    )
    .required(),
});
