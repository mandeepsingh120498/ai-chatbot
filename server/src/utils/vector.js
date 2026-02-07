const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const termFrequency = (tokens) => {
  const freq = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  const total = tokens.length || 1;
  for (const [token, count] of freq.entries()) {
    freq.set(token, count / total);
  }

  return freq;
};

const inverseDocumentFrequency = (documents) => {
  const docCount = documents.length || 1;
  const appearance = new Map();

  for (const doc of documents) {
    const seen = new Set(tokenize(doc.content));
    for (const token of seen) {
      appearance.set(token, (appearance.get(token) || 0) + 1);
    }
  }

  const idf = new Map();
  for (const [token, count] of appearance.entries()) {
    idf.set(token, Math.log((docCount + 1) / (count + 1)) + 1);
  }

  return idf;
};

const toVector = (tokens, idf) => {
  const tf = termFrequency(tokens);
  const vector = new Map();

  for (const [token, tfWeight] of tf.entries()) {
    vector.set(token, tfWeight * (idf.get(token) || 0));
  }

  return vector;
};

const cosineSimilarity = (a, b) => {
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;

  for (const [, val] of a.entries()) {
    aNorm += val * val;
  }

  for (const [key, val] of b.entries()) {
    bNorm += val * val;
    dot += val * (a.get(key) || 0);
  }

  if (!aNorm || !bNorm) return 0;
  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
};

export const buildTenantIndex = (documents) => {
  const idf = inverseDocumentFrequency(documents);

  return {
    idf,
    vectors: documents.map((doc) => ({
      ...doc,
      tokens: tokenize(doc.content),
      vector: toVector(tokenize(doc.content), idf)
    }))
  };
};

export const searchIndex = (index, query, topK = 3) => {
  const queryVector = toVector(tokenize(query), index.idf);

  return index.vectors
    .map((doc) => ({
      ...doc,
      score: cosineSimilarity(queryVector, doc.vector)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((doc) => doc.score > 0);
};
