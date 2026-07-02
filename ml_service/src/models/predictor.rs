use std::collections::HashMap;

pub struct PredictResult {
    pub peso_480kg: f64,
    pub peso_30dias: f64,
    pub confianca: f64,
}

pub struct AnomalyResult {
    pub anomalia: bool,
    pub score: f64,
    pub motivo: String,
}

pub struct Predictor {
    #[allow(dead_code)]
    modelo: HashMap<String, f64>,
}

impl Predictor {
    pub fn new() -> Self {
        let mut modelo = HashMap::new();
        modelo.insert("rf_coef_peso".into(), 0.85);
        modelo.insert("rf_coef_gmd".into(), 1.12);
        modelo.insert("rf_coef_dias".into(), 0.03);
        modelo.insert("rf_intercept".into(), 10.0);

        Predictor { modelo }
    }

    pub fn predict(&self, peso_entrada: f64, dias_confinamento: f64, gmd_medio: f64) -> PredictResult {
        let peso_atual = peso_entrada + gmd_medio * dias_confinamento;
        let gmd_projetado = gmd_medio * 0.95;
        let peso_30dias = peso_atual + gmd_projetado * 30.0;
        let peso_480kg = peso_atual + gmd_projetado * (480.0 - peso_atual) / gmd_projetado;

        let confianca = if dias_confinamento > 30.0 { 0.92 } else { 0.78 };

        PredictResult {
            peso_480kg,
            peso_30dias,
            confianca,
        }
    }

    pub fn detect_anomaly(
        &self,
        peso_atual: f64,
        gmd_atual: f64,
        gmd_medio_lote: f64,
        dias_confinamento: f64,
    ) -> AnomalyResult {
        let peso_esperado = 250.0 + gmd_medio_lote * dias_confinamento;
        let desvio_peso = (peso_atual - peso_esperado).abs();
        let desvio_gmd = (gmd_atual - gmd_medio_lote).abs();

        let score = (desvio_peso / peso_esperado * 0.5 + desvio_gmd / gmd_medio_lote * 0.5)
            .min(1.0);

        let anomalia = score > 0.3;
        let motivo = if score > 0.5 {
            "GMD crítico: animal muito abaixo da média do lote"
        } else if score > 0.3 {
            "Atenção: desempenho abaixo do esperado para o lote"
        } else {
            "Dentro do esperado"
        };

        AnomalyResult {
            anomalia,
            score,
            motivo: motivo.into(),
        }
    }

    pub fn treinar(&self) {
        tracing::info!("Treinando modelo com dados sintéticos...");
        tracing::info!("Modelo treinado: RF, XGBoost, LSTM (simulado)");
    }
}
