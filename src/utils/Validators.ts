import * as yup from 'yup';

export const CreateAdminUserSchema = yup.object().shape({
  nickname: yup.string().required().min(4).max(20),
  permission: yup.string().oneOf(['admin', 'manager']),
  email: yup.string().required().email(),
});

export const UpdateAdminUserSchema = yup.object().shape({
  nickname: yup.string().min(4).max(20),
  email: yup.string().email(),
  permission: yup.string().oneOf(['admin', 'manager']),
});

export const AdminUserLogInSchema = yup.object().shape({
  email: yup.string().required().email(),
  password: yup.string().required().min(6).max(20),
});
