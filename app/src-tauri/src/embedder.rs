#[cfg(not(any(target_os = "ios", target_os = "android")))]
use fastembed::{EmbeddingModel, InitOptions, TextEmbedding};

#[cfg(not(any(target_os = "ios", target_os = "android")))]
pub struct EmbedderState(pub TextEmbedding);

#[cfg(not(any(target_os = "ios", target_os = "android")))]
impl EmbedderState {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let model = TextEmbedding::try_new(
            InitOptions::new(EmbeddingModel::AllMiniLML6V2).with_show_download_progress(true),
        )?;
        Ok(Self(model))
    }

    pub fn embed(&self, text: &str) -> Result<Vec<f32>, Box<dyn std::error::Error>> {
        let embeddings = self.0.embed(vec![text.to_string()], None)?;
        Ok(embeddings.into_iter().next().unwrap_or_default())
    }

    #[allow(dead_code)]
    pub fn embed_batch(
        &self,
        texts: Vec<String>,
    ) -> Result<Vec<Vec<f32>>, Box<dyn std::error::Error>> {
        let embeddings = self.0.embed(texts, None)?;
        Ok(embeddings)
    }
}

#[cfg(any(target_os = "ios", target_os = "android"))]
pub struct EmbedderState;

#[cfg(any(target_os = "ios", target_os = "android"))]
impl EmbedderState {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self)
    }
}
