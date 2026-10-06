// Declaraciones mínimas para que el editor/typecheck entienda el código Deno
// de las Edge Functions. En producción el runtime real lo provee Supabase.

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

declare module 'jsr:*';
