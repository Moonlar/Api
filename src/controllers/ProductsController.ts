import { Controller, ProductData } from '../typings';
import { CreateProductSchema } from '../utils/Validators';

interface CreateProductData {
  name: string;
  description: string;
  image_url: string;
  server: string;
  price: number;
  benefits: {
    name: string;
    description: string;
  }[];
  commands: {
    name: string;
    description: string;
    command: string;
  }[];
}

export const ProductsController = {
  async index(req, res) {
    return res.json(null);
  },

  async create(req, res) {
    if (!req.isAuth) return res.authError();

    if (req.user?.permission !== 'manager')
      return res
        .status(401)
        .json({ error: 'You do not have permission to perform this action' });

    const { name, benefits, commands, description, image_url, price, server } =
      req.body as CreateProductData;

    const bodyData = {
      name,
      benefits,
      commands,
      description,
      image_url,
      price,
      server,
    };

    let data: ProductData | undefined;

    try {
      CreateProductSchema.validateSync(bodyData, { abortEarly: false });

      data = CreateProductSchema.cast(bodyData) as any;
    } catch (err) {
      return res
        .status(400)
        .json({ error: 'Invalid body', errors: err.errors });
    }

    console.log(data);

    return res.json(null);
  },
} as Controller;