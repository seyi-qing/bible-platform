# AI Bible Study Architecture

The model is never the Bible database. Scripture is retrieved from licensed/public-domain sources and supplied as context.

Pipeline: `request -> auth -> mode policy -> Scripture retrieval -> context -> model -> JSON parse -> citation validation -> persistence -> response`.

The server rejects model citations that do not exist in the retrieved context. The assistant must not claim divine revelation, invent Scripture, or present disputed theological interpretation as universally settled.

Supported modes: EXPLAIN, STUDY, COMPARE, CONTEXT, QUESTION, PRAYER, APPLICATION, CROSS_REFERENCES.

The model provider is isolated behind `AiModelProvider`; the current adapter targets the OpenAI Responses API.

Production follow-ups: queueing, prompt versioning, cost accounting, rate limits, abuse controls, model fallback, retention/deletion controls, evaluation suite, streaming, and stronger sensitive-data controls.
