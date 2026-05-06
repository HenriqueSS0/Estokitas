import { z } from 'zod';

// Auth validation schemas
export const emailSchema = z.string()
  .trim()
  .email({ message: "Email inválido" })
  .max(255, { message: "Email muito longo" });

export const passwordSchema = z.string()
  .min(6, { message: "Senha deve ter no mínimo 6 caracteres" })
  .max(128, { message: "Senha muito longa" });

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Product validation schemas
export const productNameSchema = z.string()
  .trim()
  .min(1, { message: "Nome não pode estar vazio" })
  .max(255, { message: "Nome muito longo" });

export const productPriceSchema = z.number()
  .positive({ message: "Preço deve ser positivo" })
  .max(999999.99, { message: "Preço muito alto" });

export const productStockSchema = z.number()
  .int({ message: "Estoque deve ser um número inteiro" })
  .nonnegative({ message: "Estoque não pode ser negativo" })
  .max(999999, { message: "Estoque muito alto" });

export const productSchema = z.object({
  nome: productNameSchema,
  preco: productPriceSchema,
  estoque: productStockSchema,
  estoque_minimo: productStockSchema.optional(),
  categoria: z.string().trim().max(100).optional(),
  imagem_url: z.string().url().optional().or(z.literal("")),
});

// Validation helper
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Validação falhou" };
  }
};
