use axum::{
    extract::State,
    http::StatusCode,
    Json, Router,
    routing::{get, post},
};
use serde::{Deserialize, Serialize};


use crate::AppState;

#[derive(Serialize)]
pub struct HealthResponse {
    status: String,
    version: String,
}

#[derive(Deserialize)]
pub struct PredictRequest {
    animal_id: String,
    peso_entrada: f64,
    dias_confinamento: f64,
    gmd_medio: f64,
}

#[derive(Serialize)]
pub struct PredictResponse {
    animal_id: String,
    peso_projetado: f64,
    dias_para_abate: i64,
    confianca: f64,
}

#[derive(Deserialize)]
pub struct AnomalyRequest {
    peso_atual: f64,
    gmd_atual: f64,
    gmd_medio_lote: f64,
    dias_confinamento: f64,
}

#[derive(Serialize)]
pub struct AnomalyResponse {
    anomalia: bool,
    score: f64,
    motivo: String,
}

#[derive(Serialize)]
pub struct TreinarResponse {
    status: String,
    mensagem: String,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".into(),
        version: env!("CARGO_PKG_VERSION").into(),
    })
}

async fn predict(
    State(state): State<AppState>,
    Json(req): Json<PredictRequest>,
) -> Result<Json<PredictResponse>, StatusCode> {
    let mut predictor = state.predictor.lock().await;
    let result = predictor.predict(
        req.peso_entrada,
        req.dias_confinamento,
        req.gmd_medio,
    );

    let peso_projetado = (result.peso_480kg + result.peso_30dias) / 2.0;
    let dias_para_abate = ((480.0 - req.peso_entrada) / req.gmd_medio.max(0.1)) as i64;
    let confianca = result.confianca;

    Ok(Json(PredictResponse {
        animal_id: req.animal_id,
        peso_projetado: (peso_projetado * 100.0).round() / 100.0,
        dias_para_abate: dias_para_abate.max(0),
        confianca: (confianca * 100.0).round() / 100.0,
    }))
}

async fn anomalias(
    State(state): State<AppState>,
    Json(req): Json<AnomalyRequest>,
) -> Json<AnomalyResponse> {
    let predictor = state.predictor.lock().await;
    let result = predictor.detect_anomaly(
        req.peso_atual,
        req.gmd_atual,
        req.gmd_medio_lote,
        req.dias_confinamento,
    );

    Json(AnomalyResponse {
        anomalia: result.anomalia,
        score: (result.score * 100.0).round() / 100.0,
        motivo: result.motivo,
    })
}

async fn treinar(State(state): State<AppState>) -> Json<TreinarResponse> {
    let mut predictor = state.predictor.lock().await;
    predictor.treinar();
    Json(TreinarResponse {
        status: "ok".into(),
        mensagem: "Modelo treinado com dados sintéticos via smartcore".into(),
    })
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/health", get(health))
        .route("/predicao", post(predict))
        .route("/anomalias", post(anomalias))
        .route("/treinar", post(treinar))
}
