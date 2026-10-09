package com.fincore.pattern.planodecontas;

import com.fincore.domain.ContaPlano;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Factory Method — Creator: monta o plano de contas juntando as contas base às contas de
 * tributos do regime. O enquadramento é criado pelo método fábrica `criarEnquadramento()`.
 */
public abstract class MontadorPlanoDeContas {
    private final EnquadramentoTributario enquadramento;

    protected MontadorPlanoDeContas() {
        this.enquadramento = criarEnquadramento();
    }

    /** Factory Method: a subclasse decide qual enquadramento tributário criar. */
    protected abstract EnquadramentoTributario criarEnquadramento();

    public EnquadramentoTributario getEnquadramento() {
        return enquadramento;
    }

    /** Plano completo, em ordem de código (árvore da tela /plano-de-contas). */
    public List<ContaPlano> montar(List<ContaPlano> base) {
        List<ContaPlano> plano = new ArrayList<>(base);
        plano.addAll(enquadramento.contasTributarias());
        plano.sort(Comparator.comparing(ContaPlano::getCodigo));
        return plano;
    }
}
