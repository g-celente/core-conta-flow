package com.fincore.cadastro;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Conta bancária usada como conta de saída na baixa de pagamento. */
@Entity
public class ContaBancaria {
    @Id
    private String id;
    private String banco;
    private String agencia;
    private String conta;
    private String descricao;
    private boolean ativa;

    /** Exigido pelo JPA. */
    protected ContaBancaria() {
    }

    public String getId() {
        return id;
    }

    public String getBanco() {
        return banco;
    }

    public String getAgencia() {
        return agencia;
    }

    public String getConta() {
        return conta;
    }

    public String getDescricao() {
        return descricao;
    }

    public boolean isAtiva() {
        return ativa;
    }
}
