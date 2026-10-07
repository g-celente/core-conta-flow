package com.fincore.planodecontas;

import com.fincore.dominio.ContaPlano;
import java.util.List;

/** Factory Method — Product: enquadramento que define as contas de tributos do regime. */
public interface EnquadramentoTributario {
    String regime();

    /** Contas de tributos que o regime acrescenta ao plano de contas base. */
    List<ContaPlano> contasTributarias();

    /** Resumo da forma de apuração, exibido no onboarding. */
    String descricaoApuracao();
}
