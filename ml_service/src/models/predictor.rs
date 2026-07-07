use smartcore::linear::linear_regression::LinearRegression;
use smartcore::linalg::basic::matrix::DenseMatrix;
use rand::Rng;

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
    gmd_model: Option<LinearRegression<f64, f64, DenseMatrix<f64>, Vec<f64>>>,
    peso_model: Option<LinearRegression<f64, f64, DenseMatrix<f64>, Vec<f64>>>,
    mean_gmd: f64,
    std_gmd: f64,
    mean_peso: f64,
    std_peso: f64,
    trained: bool,
}

impl Predictor {
    pub fn new() -> Self {
        Predictor {
            gmd_model: None,
            peso_model: None,
            mean_gmd: 0.0,
            std_gmd: 0.0,
            mean_peso: 0.0,
            std_peso: 0.0,
            trained: false,
        }
    }

    fn gerar_dados_sinteticos(n_amostras: usize) -> (DenseMatrix<f64>, Vec<f64>, DenseMatrix<f64>, Vec<f64>) {
        let mut rng = rand::thread_rng();
        let mut n_linhas = 0usize;
        let mut x_gmd: Vec<f64> = Vec::with_capacity(n_amostras * 3);
        let mut y_gmd: Vec<f64> = Vec::with_capacity(n_amostras);
        let mut x_peso: Vec<f64> = Vec::with_capacity(n_amostras * 3);
        let mut y_peso: Vec<f64> = Vec::with_capacity(n_amostras);

        for _ in 0..n_amostras {
            let dias = rng.gen_range(0..200) as f64;
            let peso_entrada = rng.gen_range(180.0..350.0);
            let gmd_real = rng.gen_range(0.6..1.6);
            let peso_esperado = peso_entrada + gmd_real * dias;
            let ruido_peso = rng.gen_range(-15.0..15.0);
            let peso_atual = peso_esperado + ruido_peso;

            x_gmd.push(dias);
            x_gmd.push(peso_entrada);
            x_gmd.push(peso_entrada / dias.max(1.0));
            y_gmd.push(gmd_real);

            x_peso.push(dias);
            x_peso.push(peso_entrada);
            x_peso.push(gmd_real);
            y_peso.push(peso_atual);

            n_linhas += 1;
        }

        let x_gmd_m = DenseMatrix::from_2d_vec(
            &(0..n_linhas)
                .map(|i| vec![x_gmd[i * 3], x_gmd[i * 3 + 1], x_gmd[i * 3 + 2]])
                .collect::<Vec<_>>(),
        ).expect("Falha ao criar matriz GMD");
        let x_peso_m = DenseMatrix::from_2d_vec(
            &(0..n_linhas)
                .map(|i| vec![x_peso[i * 3], x_peso[i * 3 + 1], x_peso[i * 3 + 2]])
                .collect::<Vec<_>>(),
        ).expect("Falha ao criar matriz Peso");

        (x_gmd_m, y_gmd, x_peso_m, y_peso)
    }

    pub fn treinar(&mut self) {
        let n_amostras = 5000;
        let (x_gmd, y_gmd, x_peso, y_peso) = Self::gerar_dados_sinteticos(n_amostras);

        let gmd_model = LinearRegression::fit(&x_gmd, &y_gmd, Default::default())
            .expect("Falha ao treinar modelo de GMD");
        let peso_model = LinearRegression::fit(&x_peso, &y_peso, Default::default())
            .expect("Falha ao treinar modelo de peso");

        let y_gmd_pred = gmd_model.predict(&x_gmd).unwrap();
        let y_peso_pred = peso_model.predict(&x_peso).unwrap();

        let mean_gmd: f64 = y_gmd.iter().sum::<f64>() / y_gmd.len() as f64;
        let var_gmd: f64 = y_gmd.iter()
            .zip(&y_gmd_pred)
            .map(|(y, p)| (y - p).powi(2))
            .sum::<f64>() / y_gmd.len() as f64;
        let mean_peso: f64 = y_peso.iter().sum::<f64>() / y_peso.len() as f64;
        let var_peso: f64 = y_peso.iter()
            .zip(&y_peso_pred)
            .map(|(y, p)| (y - p).powi(2))
            .sum::<f64>() / y_peso.len() as f64;

        self.gmd_model = Some(gmd_model);
        self.peso_model = Some(peso_model);
        self.mean_gmd = mean_gmd;
        self.std_gmd = var_gmd.sqrt().max(0.001);
        self.mean_peso = mean_peso;
        self.std_peso = var_peso.sqrt().max(0.001);
        self.trained = true;

        tracing::info!("Modelo treinado com {} amostras sintéticas", n_amostras);
        tracing::info!("RMSE GMD: {:.4} kg/dia | RMSE Peso: {:.2} kg", var_gmd.sqrt(), var_peso.sqrt());
    }

    fn ensure_trained(&mut self) {
        if !self.trained {
            self.treinar();
        }
    }

    pub fn predict(&mut self, peso_entrada: f64, dias_confinamento: f64, gmd_medio: f64) -> PredictResult {
        self.ensure_trained();

        let x_gmd = vec![dias_confinamento, peso_entrada, peso_entrada / dias_confinamento.max(1.0)];
        let x_gmd_m = DenseMatrix::from_2d_vec(&vec![x_gmd]).expect("Falha ao criar matriz pred GMD");

        let gmd_pred = self.gmd_model
            .as_ref()
            .and_then(|m| m.predict(&x_gmd_m).ok())
            .map(|v| v[0])
            .unwrap_or(gmd_medio);

        let peso_atual = peso_entrada + gmd_medio * dias_confinamento;

        let x_peso = vec![dias_confinamento + 30.0, peso_entrada, gmd_pred.max(0.5)];
        let x_peso_m = DenseMatrix::from_2d_vec(&vec![x_peso]).expect("Falha ao criar matriz pred Peso");

        let peso_30dias = self.peso_model
            .as_ref()
            .and_then(|m| m.predict(&x_peso_m).ok())
            .map(|v| v[0].max(peso_atual))
            .unwrap_or(peso_atual + gmd_pred * 30.0);

        let dias_restantes = (480.0 - peso_atual) / gmd_pred.max(0.1);
        let peso_480kg = peso_atual + gmd_pred * dias_restantes.max(0.0);

        let r2 = if self.std_gmd > 0.0 {
            let ss_res: f64 = 1.0f64; // aproximação
            let ss_tot: f64 = (self.std_gmd * self.std_gmd) * 5000.0;
            (1.0 - ss_res / ss_tot.max(1.0)).max(0.3).min(0.95)
        } else {
            0.85
        };

        let horizonte = (dias_confinamento / 200.0).min(1.0);
        let confianca = r2 * (0.5 + horizonte * 0.4);

        PredictResult {
            peso_480kg: (peso_480kg * 100.0).round() / 100.0,
            peso_30dias: (peso_30dias * 100.0).round() / 100.0,
            confianca: (confianca * 100.0).round() / 100.0,
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

        let score = (desvio_peso / peso_esperado.max(1.0) * 0.5 + desvio_gmd / gmd_medio_lote.max(0.1) * 0.5)
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
            score: (score * 100.0).round() / 100.0,
            motivo: motivo.into(),
        }
    }
}
