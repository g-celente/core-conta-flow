package com.fincore.cadastro;

import com.fincore.dominio.ContaPlano;
import com.fincore.dominio.ContaPlanoRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contas-plano")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ContaPlanoController extends CrudController<ContaPlano> {
    public ContaPlanoController(ContaPlanoRepository repositorio) {
        super(repositorio);
    }
}
