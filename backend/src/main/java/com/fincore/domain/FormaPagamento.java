package com.fincore.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Forma de pagamento oferecida na baixa (PIX, TED, boleto...). */
@Entity
public class FormaPagamento {
    @Id
    private String id;
    private String nome;
    private boolean ativa;

    /** Exigido pelo JPA. */
    protected FormaPagamento() {
    }

    public String getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public boolean isAtiva() {
        return ativa;
    }
}
