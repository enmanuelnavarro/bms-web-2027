// Estado que devuelven las acciones del panel a sus formularios.
//
// Vive aquí y no en los ficheros de acciones porque un módulo "use server"
// solo puede exportar funciones asíncronas: una constante como `VACIO` rompe
// la build con "A 'use server' file can only export async functions".

export type Estado = {
  error: string | null;
  ok: string | null;
};

export const VACIO: Estado = { error: null, ok: null };
