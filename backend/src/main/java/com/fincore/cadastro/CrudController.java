package com.fincore.cadastro;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

/**
 * CRUD genérico reaproveitado pelos 10 cadastros: listar, criar, editar e excluir pelo
 * repositório JPA. Cada cadastro só declara a rota e o repositório.
 */
public abstract class CrudController<T> {
    private final JpaRepository<T, String> repositorio;

    protected CrudController(JpaRepository<T, String> repositorio) {
        this.repositorio = repositorio;
    }

    @GetMapping
    public List<T> listar() {
        return repositorio.findAll();
    }

    @PostMapping
    public T criar(@RequestBody T registro) {
        return repositorio.save(registro);
    }

    /** O id da URL é o mesmo do corpo; o registro é gravado por inteiro. */
    @PutMapping("/{id}")
    public T editar(@PathVariable String id, @RequestBody T registro) {
        return repositorio.save(registro);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable String id) {
        repositorio.deleteById(id);
    }
}
