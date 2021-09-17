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
  email: yup.string().required().trim().lowercase().email(),
  password: yup.string().required().trim().min(6).max(20),
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
      }),
    )
    .required(),
  commands: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().trim().required().min(4).max(30),
        command: yup.string().trim().required().min(4).max(60),
      }),
    )
    .required(),
});

export const UpdateProductSchema = yup.object().shape({
  name: yup.string().trim().min(4).max(30),
  description: yup.string().trim().min(4).max(150),
  image_url: yup.string().trim().url(),
  server_id: yup.string().trim(),
  price: yup.number().min(1),
  active: yup.boolean(),
});

export const CreateProductBenefitSchema = yup.object().shape({
  name: yup.string().trim().required().min(4).max(30),
  description: yup.string().trim().required().min(4).max(60),
});

export const UpdateProductBenefitSchema = yup.object().shape({
  name: yup.string().trim().min(4).max(30),
  description: yup.string().trim().min(4).max(60),
});

export const CreateProductCommandSchema = yup.object().shape({
  name: yup.string().trim().required().min(4).max(30),
  command: yup.string().trim().required().min(4).max(60),
});

export const UpdateProductCommandSchema = yup.object().shape({
  name: yup.string().trim().min(4).max(30),
  command: yup.string().trim().min(4).max(60),
});

export const CreateCouponSchema = yup.object().shape({
  code: yup.string().trim().lowercase().min(4).max(8).required(),
  name: yup.string().trim().min(4).max(30).required(),
  description: yup.string().trim().min(4).max(150).required(),
  discount: yup.number().min(0).max(1).required(),
  starts_at: yup.date().min(new Date()).required(),
  ends_at: yup.date().min(new Date()).required(),
});

export const UpdateCouponSchema = yup.object().shape({
  code: yup.string().trim().lowercase().min(4).max(8),
  name: yup.string().trim().min(4).max(30),
  description: yup.string().trim().min(4).max(150),
  discount: yup.number().min(0).max(1),
  starts_at: yup.date().min(new Date()),
  ends_at: yup.date().min(new Date()),
});
