package com.fincore.service;

import com.fincore.domain.ContaPlano;
import com.fincore.pattern.planodecontas.EnquadramentoTributario;
import com.fincore.pattern.planodecontas.MontadorPlanoDeContas;
import com.fincore.pattern.planodecontas.MontadorPlanoLucroPresumido;
import com.fincore.pattern.planodecontas.MontadorPlanoLucroReal;
import com.fincore.pattern.planodecontas.MontadorPlanoSimplesNacional;
import com.fincore.repository.ContaPlanoRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** Factory Method — cliente: escolhe o montador (criador concreto) pelo regime do tenant. */
@Service
public class PlanoDeContasService {
    private final ContaPlanoRepository contas;

    public PlanoDeContasService(ContaPlanoRepository contas) {
        this.contas = contas;
    }

    public EnquadramentoTributario enquadramento(String regime) {
        return montadorDo(regime).getEnquadramento();
    }

    /** Contas base do banco somadas às contas de tributos do regime. */
    public List<ContaPlano> plano(String regime) {
        return montadorDo(regime).montar(contas.findAll());
    }

    private MontadorPlanoDeContas montadorDo(String regime) {
        return switch (regime) {
            case "Simples Nacional" -> new MontadorPlanoSimplesNacional();
            case "Lucro Presumido" -> new MontadorPlanoLucroPresumido();
            case "Lucro Real" -> new MontadorPlanoLucroReal();
            default -> throw new IllegalArgumentException("Regime desconhecido: " + regime);
        };
    }
}
