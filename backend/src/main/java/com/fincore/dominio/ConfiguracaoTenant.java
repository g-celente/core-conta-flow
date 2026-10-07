package com.fincore.dominio;

import java.util.List;

/** Features contratadas pelo tenant, enviadas pelo frontend em cada requisição. */
public class ConfiguracaoTenant {
    private final List<String> features;

    public ConfiguracaoTenant(List<String> features) {
        this.features = features;
    }

    public List<String> getFeatures() {
        return features;
    }

    public boolean possui(String feature) {
        return features.contains(feature);
    }
}
