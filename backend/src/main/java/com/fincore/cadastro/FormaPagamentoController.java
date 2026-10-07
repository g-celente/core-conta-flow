package com.fincore.cadastro;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/formas-pagamento")
@CrossOrigin(originPatterns = "http://localhost:*")
public class FormaPagamentoController extends CrudController<FormaPagamento> {
    public FormaPagamentoController(FormaPagamentoRepository repositorio) {
        super(repositorio);
    }
}
