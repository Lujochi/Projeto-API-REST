import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ValidationError, AnySchema, ObjectSchema } from "yup";

type TProperty = "body" | "header" | "params" | "query";

type TGetSchema = <T extends object>(
  schema: ObjectSchema<T>
) => ObjectSchema<T>;

type TALLSchemas = Record<TProperty, AnySchema>;

type TGetALLSchemas = (getSchema: TGetSchema) => Partial<TALLSchemas>;

type TValidation = (getALLSchemas: TGetALLSchemas) => RequestHandler;

export const validation: TValidation =
  (getALLSchemas) => async (req, res, next) => {
    const schemas = getALLSchemas((schema) => schema);

    const errorResult: Record<string, Record<string, string>> = {};

    Object.entries(schemas).forEach(([key, schema]) => {
      try {
        schema.validateSync(req[key as TProperty], { abortEarly: false });
      } catch (err) {
        const yupError = err as ValidationError;
        const errors: Record<string, string> = {};

        yupError.inner.forEach((error) => {
          if (!error.path) return;
          errors[error.path] = error.message;
        });

        errorResult[key] = errors;
      }
    });

    if (Object.entries(errorResult).length === 0) {
      return next();
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errorResult });
    }
  };
