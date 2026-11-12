// Reusable technical code snippets across languages
export const CODE_SNIPPET_PYTHON = `import asyncio
import json
import websockets

async def dispatch_cdp_action(ws_endpoint: str, x: int, y: int):
    # Minimalist JSON-RPC 2.0 payload over raw WebSocket
    async with websockets.connect(ws_endpoint, max_size=1024*1024) as ws:
        msg = {
            "id": 1,
            "method": "Input.dispatchMouseEvent",
            "params": {"type": "mousePressed", "x": x, "y": y, "button": "left", "clickCount": 1}
        }
        await ws.send(json.dumps(msg))
        return await ws.recv()`

export const CODE_SNIPPET_C = `// ESP32-S3 Edge Vector Extraction Pipeline
tflite::MicroInterpreter interpreter(model, resolver, tensor_arena, kArenaSize);
TfLiteStatus status = interpreter.AllocateTensors();

// Direct frame grab from OV2640 sensor into input tensor buffer
camera_fb_t *fb = esp_camera_fb_get();
memcpy(interpreter.input(0)->data.uint8, fb->buf, fb->len);
interpreter.Invoke();

// Extract 512-dim normalized embedding (zero raw images transmitted)
float* embedding = interpreter.output(0)->data.f;`

export const CODE_SNIPPET_YAML = `services:
  api:
    image: nhatprx/core-service:latest
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    user: "10001:10001"
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=64m`

export const CODE_SNIPPET_REDIS = `// XFetch: Probabilistic early cache recomputation algorithm
public String getWithProbabilisticRefresh(String key, long ttlSeconds, double beta) {
    CacheEntry entry = redisTemplate.opsForValue().get(key);
    if (entry == null) return refreshAndCache(key, ttlSeconds);

    // Compute early expiration threshold: -beta * delta * ln(random)
    double delta = entry.getComputeDurationMs();
    double expiryThreshold = -beta * delta * Math.log(ThreadLocalRandom.current().nextDouble());

    if (System.currentTimeMillis() - entry.getCreatedAt() + expiryThreshold >= ttlSeconds * 1000) {
        asyncExecutor.submit(() -> refreshAndCache(key, ttlSeconds));
    }
    return entry.getValue();
}`

export const CODE_SNIPPET_POSTGRES = `-- Safe, zero-downtime column addition with default in PostgreSQL
BEGIN;
  -- Set low lock timeout to avoid queueing blockers behind heavy read queries
  SET LOCAL lock_timeout = '2s';

  -- Add column without rewrite (instant in PG 11+)
  ALTER TABLE order_events ADD COLUMN idempotency_key VARCHAR(64);
COMMIT;

-- Create index concurrently without locking table against writes
CREATE INDEX CONCURRENTLY idx_order_events_idempotency 
ON order_events (idempotency_key) 
WHERE idempotency_key IS NOT NULL;`

export const CODE_SNIPPET_IOT = `// Event-driven reactive telemetry worker with backpressure
@Bean
public Consumer<Flux<SensorHeartbeat>> processTelemetry() {
    return flux -> flux
        .onBackpressureBuffer(10_000, BufferOverflowStrategy.DROP_OLDEST)
        .parallel(4)
        .runOn(Schedulers.boundedElastic())
        .filter(SensorHeartbeat::isValid)
        .flatMap(telemetryService::persistMetrics)
        .sequential()
        .doOnError(err -> log.error("Ingestion buffer error: {}", err.getMessage()))
        .subscribe();
}`

