import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const credential = new DefaultAzureCredential();
const endpoint = process.env.OPENAI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || ""; // e.g. https://<resource>.openai.azure.com
const deployment = process.env.OPENAI_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || "";
const apiVersion = process.env.OPENAI_API_VERSION || process.env.AZURE_OPENAI_API_VERSION || "2023-05-15";

async function getApiKeyFromKeyVault(vaultName: string, secretName: string) {
  const url = `https://${vaultName}.vault.azure.net`;
  const client = new SecretClient(url, credential);
  const secret = await client.getSecret(secretName);
  return secret.value;
}

export async function analyzeRiskWithOpenAI(flattenedFields: string) {
  if (!endpoint || !deployment) throw new Error("OPENAI_ENDPOINT or OPENAI_DEPLOYMENT not configured");

  // Build a clear prompt that asks the model to output JSON
  const prompt = `You are a compliance assistant. Given the following extracted document fields as JSON or key/value pairs, classify the KYC risk as LOW, MEDIUM, or HIGH and provide a confidence score (0.0-1.0) and a human-readable reasoning. Output ONLY a JSON object with keys: riskLevel, confidenceScore, reasoning, modelVersion.\n\nFields:\n${flattenedFields}\n\nRespond with JSON only.`;

  // Determine auth: prefer API key in env (for local dev), otherwise try Key Vault, otherwise AAD token
  let headers: any = { "Content-Type": "application/json" };
  if (process.env.OPENAI_API_KEY) {
    headers["api-key"] = process.env.OPENAI_API_KEY;
  } else if (process.env.OPENAI_KEY_VAULT && process.env.OPENAI_KEY_SECRET) {
    const key = await getApiKeyFromKeyVault(process.env.OPENAI_KEY_VAULT, process.env.OPENAI_KEY_SECRET);
    headers["api-key"] = key as string;
  } else {
    // Use AAD token
    const scope = "https://cognitiveservices.azure.com/.default";
    const token = await credential.getToken(scope);
    if (!token) throw new Error("Failed to acquire AAD token for OpenAI");
    headers["Authorization"] = `Bearer ${token.token}`;
  }

  const url = `${endpoint}/openai/deployments/${deployment}/completions?api-version=${apiVersion}`;

  const body = {
    prompt,
    max_tokens: 512,
    temperature: 0,
    n: 1
  };

  const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI call failed: ${resp.status} ${text}`);
  }

  const json: any = await resp.json();
  // Expect response.choices[0].text to contain the JSON
  const text = json.choices?.[0]?.text || json.choices?.[0]?.message?.content || JSON.stringify(json);

  try {
    const parsed = JSON.parse(text.trim());
    return parsed;
  } catch (e) {
    // If parsing fails, return fallback
    return {
      riskLevel: "MEDIUM",
      confidenceScore: 0.5,
      reasoning: `Failed to parse model output. Raw response: ${text}`,
      modelVersion: deployment || "unknown"
    };
  }
}
