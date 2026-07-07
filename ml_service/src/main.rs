mod api;
mod models;

use axum::Router;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::CorsLayer;
use tracing_subscriber::EnvFilter;

#[derive(Clone)]
pub struct AppState {
    pub predictor: Arc<Mutex<models::Predictor>>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    let predictor = Arc::new(Mutex::new(models::Predictor::new()));

    let app = Router::new()
        .nest("/ml", api::routes())
        .layer(CorsLayer::permissive())
        .with_state(AppState { predictor });

    let addr = "0.0.0.0:8001";
    tracing::info!("ML Service listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
