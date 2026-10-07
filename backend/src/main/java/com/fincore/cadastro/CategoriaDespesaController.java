package com.fincore.cadastro;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categorias-despesa")
@CrossOrigin(originPatterns = "http://localhost:*")
public class CategoriaDespesaController extends CrudController<CategoriaDespesa> {
    public CategoriaDespesaController(CategoriaDespesaRepository repositorio) {
        super(repositorio);
    }
}
