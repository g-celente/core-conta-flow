package com.fincore.planodecontas;

import com.fincore.dominio.ContaPlano;
import com.fincore.dominio.ContaPlanoRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Factory Method — cliente: escolhe o montador (criador concreto) pelo regime do tenant. */
@RestController
@RequestMapping("/api/plano-de-contas")
@CrossOrigin(originPatterns = "http://localhost:*")
public class PlanoDeContasController {
    private final ContaPlanoRepository contas;

    public PlanoDeContasController(ContaPlanoRepository contas) {
        this.contas = contas;
    }

    public record Plano(String regime, String descricaoApuracao, List<ContaPlano> contas,
            List<String> codigosDoRegime) {}

    @GetMapping
    public Plano plano(@RequestParam String regime) {
        MontadorPlanoDeContas montador = montadorDo(regime);
        EnquadramentoTributario enquadramento = montador.getEnquadramento();
        return new Plano(enquadramento.regime(), enquadramento.descricaoApuracao(),
                montador.montar(contas.findAll()),
                enquadramento.contasTributarias().stream().map(ContaPlano::getCodigo).toList());
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
