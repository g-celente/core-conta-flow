package com.fincore.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Categoria de despesa usada no lançamento de títulos a pagar. */
@Entity
public class CategoriaDespesa {
    @Id
    private String id;
    private String nome;
    private boolean ativa;

    /** Exigido pelo JPA. */
    protected CategoriaDespesa() {
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
