package com.fincore.controller;

import com.fincore.domain.Usuario;
import com.fincore.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(originPatterns = "http://localhost:*")
public class UsuarioController extends CrudController<Usuario> {
    public UsuarioController(UsuarioRepository repositorio) {
        super(repositorio);
    }
}
