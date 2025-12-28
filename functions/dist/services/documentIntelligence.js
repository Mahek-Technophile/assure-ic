"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeDocumentFromUrl = analyzeDocumentFromUrl;
const identity_1 = require("@azure/identity");
const credential = new identity_1.DefaultAzureCredential();
const endpoint = process.env.DOCUMENT_INTELLIGENCE_ENDPOINT || ""; // e.g. https://<resource>.cognitiveservices.azure.com
const processorId = process.env.DOCUMENT_INTELLIGENCE_PROCESSOR_ID || ""; // model/processor id
const apiVersion = process.env.DI_API_VERSION || "2024-09-30-preview";
if (!endpoint) {
    // runtime will throw if missing
}
async function analyzeDocumentFromUrl(documentUrl) {
    if (!endpoint || !processorId)
        throw new Error("Document Intelligence configuration missing");
    // Acquire AAD token for cognitive services
    const scope = "https://cognitiveservices.azure.com/.default";
    const token = await credential.getToken(scope);
    if (!token)
        throw new Error("Failed to acquire AAD token for Document Intelligence");
    const url = `${endpoint}/formrecognizer/documentModels/${processorId}:analyze?api-version=${apiVersion}`;
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: documentUrl })
    });
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Document Intelligence analyze failed: ${resp.status} ${text}`);
    }
    // Operation is async — get operation-location header
    const operationLocation = resp.headers.get("operation-location") || resp.headers.get("Operation-Location");
    if (!operationLocation) {
        // Some API versions return the result directly
        const json = await resp.json();
        return json;
    }
    // Poll until complete
    const poll = async () => {
        for (let i = 0; i < 30; i++) {
            const statusResp = await fetch(operationLocation, { headers: { Authorization: `Bearer ${token.token}` } });
            if (!statusResp.ok)
                throw new Error(`Status check failed: ${statusResp.status}`);
            const json = await statusResp.json();
            const status = json.status || json.analyzeResult?.status || json.analysisResult?.status;
            if (status === "succeeded" || status === "succeededWithDocumentErrors")
                return json;
            if (status === "failed")
                throw new Error("Document Intelligence analysis failed");
            await new Promise((r) => setTimeout(r, 1000));
        }
        throw new Error("Document Intelligence analysis timed out");
    };
    return poll();
}
