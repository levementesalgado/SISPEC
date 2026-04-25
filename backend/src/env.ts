export const env = {
  PORT: parseInt(Deno.env.get("PORT") || "3000"),
  HOST: Deno.env.get("HOST") || "0.0.0.0",
  
  // GMD (Ganho Médio Diário) meta em kg/dia
  GMD_META: parseFloat(Deno.env.get("GMD_META") || "1.0"),
  
  // Peso de abate em kg
  PESO_ABATE: parseFloat(Deno.env.get("PESO_ABATE") || "480"),
  
  // ICA (Índice de Conversão Alimentar) ideal
  ICA_IDEAL: parseFloat(Deno.env.get("ICA_IDEAL") || "6.0"),
};