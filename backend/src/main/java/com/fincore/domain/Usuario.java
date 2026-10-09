package com.fincore.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Usuário do sistema: responsável por centros de custo e titular de alçadas. */
@Entity
public class Usuario {
    @Id
    private String id;
    private String nome;
    private String email;
    private String perfil;
    private boolean ativo;

    /** Exigido pelo JPA. */
    protected Usuario() {
    }

    public String getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getPerfil() {
        return perfil;
    }

    public boolean isAtivo() {
        return ativo;
    }
}
