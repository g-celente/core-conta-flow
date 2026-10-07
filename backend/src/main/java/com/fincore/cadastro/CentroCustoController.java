package com.fincore.cadastro;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/centros-custo")
@CrossOrigin(originPatterns = "http://localhost:*")
public class CentroCustoController extends CrudController<CentroCusto> {
    public CentroCustoController(CentroCustoRepository repositorio) {
        super(repositorio);
    }
}
