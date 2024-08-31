import { Request, Response } from "express";
import * as yup from "yup";

import { validation } from "../../shared/middleware";

interface ICidades {
  nome: string;
  estado: string;
}

interface IFilter {
  filter?: string;
}

export const createValidation = validation((getSchema) => ({
  body: getSchema<ICidades>(
    yup.object().shape({
      nome: yup.string().required().min(3),
      estado: yup.string().required().min(3),
    })
  ),
  query: getSchema<IFilter>(
    yup.object().shape({
      filter: yup.string().required().min(3),
    })
  ),
}));

export const create = async (req: Request<{}, {}, ICidades>, res: Response) => {
  console.log(req.body);

  return res.send("Create");
};
