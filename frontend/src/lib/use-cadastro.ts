import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/lib/api";

/** Lista vazia estável, usada enquanto os dados carregam. */
const VAZIO: never[] = [];

/**
 * CRUD genérico do frontend: lista o recurso pela API e grava criando, editando ou excluindo.
 * Depois de cada gravação a lista é recarregada do banco.
 */
export function useCadastro<T extends { id: string }>(recurso: string) {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: [recurso], queryFn: () => api.listar<T>(recurso) });

  /** Devolve se a gravação deu certo; em caso de erro, avisa o usuário. */
  const gravar = async (acao: () => Promise<unknown>) => {
    let ok = true;
    try {
      await acao();
    } catch (erro) {
      toast.error((erro as Error).message);
      ok = false;
    }
    await queryClient.invalidateQueries({ queryKey: [recurso] });
    return ok;
  };

  return {
    registros: (data ?? VAZIO) as T[],
    /** Versão mais recente do registro (lida do cache, que é recarregado após cada gravação). */
    buscar: (id: string) => queryClient.getQueryData<T[]>([recurso])?.find((r) => r.id === id),
    criar: (registro: T) => gravar(() => api.criar(recurso, registro)),
    editar: (registro: T) => gravar(() => api.editar(recurso, registro)),
    excluir: (id: string) => gravar(() => api.excluir(recurso, id)),
  };
}
