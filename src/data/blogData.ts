export interface BlogPost {
  slug: string
  title: string
  date: string
  readTime: string
  summary: string
  tags: string[]
  content: {
    lead: string
    sections: {
      heading: string
      body: string[]
      code?: {
        language: string
        snippet: string
      }
    }[]
  }
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'cdp-vs-playwright-automation',
    title: 'Reverse-Engineering MMORPG Automation: Why CDP Beat Playwright by 10,000%',
    date: 'APR 2026',
    readTime: '6 MIN READ',
    summary:
      'How dissecting headless browser internals and swapping heavy WebDriver abstraction for lightweight raw Chrome DevTools Protocol sockets reduced per-instance memory from ~100MB to ~1KB, enabling 100+ concurrent worker instances on commodity hardware.',
    tags: ['Python', 'CDP', 'Reverse Engineering', 'Optimization'],
    content: {
      lead: 'In early 2026, while building an enterprise-grade automation framework for MMORPG workloads (LordNine Bot), standard browser automation tools like Selenium and Playwright hit a hard memory wall. Here is how going down to raw Chrome DevTools Protocol (CDP) websockets changed everything.',
      sections: [
        {
          heading: '1. The Problem: The 100MB Per-Instance Overhead',
          body: [
            'Each Playwright or Puppeteer browser context spins up node bindings, IPC message queues, and Chromium sandboxes that easily consume 80MB-120MB per worker thread. On a typical 16GB RAM desktop, running 40+ concurrent emulator bridges caused severe thrashing, OOM crashes, and uncontrollable CPU spikes.',
            'Furthermore, standard automation frameworks leave recognizable automation signatures (navigator.webdriver, permission flags, and detectable CDP execution stacks) that triggered aggressive anti-cheat detections.',
          ],
        },
        {
          heading: '2. The Solution: Raw CDP WebSockets & Zero-Allocation Scheduling',
          body: [
            'Instead of orchestrating full browsers through high-level wrappers, we reverse-engineered the target client runtime and connected directly via raw asynchronous WebSocket connections to the underlying Chrome DevTools Protocol debugging port.',
            'By constructing JSON-RPC commands by hand and handling only the necessary protocol domains (Runtime.evaluate, Input.dispatchMouseEvent, Page.captureScreenshot), the client footprint plummeted from ~100MB down to ~1KB per active session.',
          ],
          code: {
            language: 'python',
            snippet: `import asyncio
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
        return await ws.recv()`,
          },
        },
        {
          heading: '3. Adaptive AIMD Scheduling and Queue Coalescing',
          body: [
            'Even with lean network sockets, sending 60 frames per second of screenshots overwhelmed memory buses. We implemented an Additive Increase / Multiplicative Decrease (AIMD) feedback loop:',
            'When no state transitions are detected in game memory, the capture interval expands dynamically from 150ms up to 800ms. As soon as action flags trigger, the interval ramps down within one tick. Combined with GUI event coalescing in CustomTkinter, this achieved a ~90% decrease in background CPU consumption.',
          ],
        },
        {
          heading: '4. Results and Production Impact',
          body: [
            'The optimized framework powered 34 production releases (v1.0 to v3.24) over 2 months. Over 100 concurrent accounts could run uninterrupted on a single mid-tier quad-core CPU, with an automated SHA256-verified self-updater and HWID-bound licensing system.',
          ],
        },
      ],
    },
  },
  {
    slug: 'edge-cloud-biometric-esp32',
    title: 'Designing an Edge-Cloud Biometric System with ESP32-S3 and TensorFlow',
    date: 'AUG 2025',
    readTime: '5 MIN READ',
    summary:
      'Architectural trade-offs of running on-device facial recognition on microcontrollers versus offloading to cloud workers: latency, privacy constraints, and resilient offline queueing with PostgreSQL synchronization.',
    tags: ['IoT', 'ESP32-S3', 'TensorFlow', 'PostgreSQL'],
    content: {
      lead: 'University attendance systems often suffer from bottleneck queues, poor network connectivity, and privacy concerns when raw biometric images are streamed to the cloud. With Attenda, we designed an edge-first biometric architecture using ESP32-S3 microcontrollers.',
      sections: [
        {
          heading: '1. Why Edge Computing for Biometrics?',
          body: [
            'Streaming raw camera video feeds from 30+ lecture halls to a central server consumes massive local bandwidth and poses significant security vulnerabilities. If network infrastructure blips, the entire university attendance gate grinds to a halt.',
            'By performing on-device feature extraction directly on the ESP32-S3 chip, we only emit 512-dimensional vector embeddings, completely discarding raw image frames at the sensor edge.',
          ],
        },
        {
          heading: '2. Optimizing Inference on Constrained Silicon',
          body: [
            'The ESP32-S3 features dual Xtensa LX7 cores with vector instructions (PIE). Using TensorFlow Lite for Microcontrollers (TFLM) with 8-bit integer quantization (INT8), we compressed our facial embedding model to under 1.8MB, easily fitting into the chip internal flash and PSRAM.',
            'Embedding inference time stabilized at 1.2s - 1.4s per student, achieving 95%+ top-1 accuracy in diverse classroom lighting environments.',
          ],
          code: {
            language: 'c',
            snippet: `// ESP32-S3 Edge Vector Extraction Pipeline
tflite::MicroInterpreter interpreter(model, resolver, tensor_arena, kArenaSize);
TfLiteStatus status = interpreter.AllocateTensors();

// Direct frame grab from OV2640 sensor into input tensor buffer
camera_fb_t *fb = esp_camera_fb_get();
memcpy(interpreter.input(0)->data.uint8, fb->buf, fb->len);
interpreter.Invoke();

// Extract 512-dim normalized embedding (zero raw images transmitted)
float* embedding = interpreter.output(0)->data.f;`,
          },
        },
        {
          heading: '3. Resilient Offline Queueing & PostgreSQL Sync',
          body: [
            'When campus Wi-Fi drops, the ESP32-S3 writes attendance logs to an onboard SPI flash ring buffer. When network restores, it batches records to our Python/Gunicorn/PostgreSQL backend with idempotency keys, guaranteeing zero duplicate entries and zero attendance loss.',
          ],
        },
      ],
    },
  },
  {
    slug: 'aws-microservice-docker-isolation',
    title: 'Lessons from AWS Multi-Tenant Microservice Deployments and Docker Isolation',
    date: 'JAN 2026',
    readTime: '7 MIN READ',
    summary:
      'Key findings on VPC peering, container hardening, and egress optimization during cloud infrastructure design for production workloads.',
    tags: ['AWS', 'Docker', 'DevOps', 'Architecture'],
    content: {
      lead: 'Operating multi-tenant microservices in production requires strict boundaries between isolation, network latency, and operational simplicity. Here are practical engineering lessons from real-world AWS infrastructure design.',
      sections: [
        {
          heading: '1. Defense in Depth: Beyond Default Docker Defaults',
          body: [
            'Default container configurations grant far more capabilities than microservices require. In production, we enforce read-only root filesystems, drop all Linux capabilities (cap-drop: ALL) except NET_BIND_SERVICE, and assign dedicated unprivileged UID/GIDs.',
            'Isolating compute nodes within private VPC subnets with strictly routed NAT Gateways prevents direct Internet exposure while keeping telemetry outbound.',
          ],
          code: {
            language: 'yaml',
            snippet: `services:
  api:
    image: nhatprx/core-service:latest
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    user: "10001:10001"
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=64m`,
          },
        },
        {
          heading: '2. Egress Costs and VPC Endpoints',
          body: [
            'One of the fastest ways to inflate cloud bills is routing S3 and DynamoDB traffic through NAT Gateways. By implementing AWS Gateway VPC Endpoints, traffic between ECS containers and S3 remains entirely on the AWS private backbone, reducing latency by 40% and eliminating per-GB NAT processing fees.',
          ],
        },
        {
          heading: '3. Health Checks and Graceful Draining',
          body: [
            'Rolling deployments without calibrated SIGTERM handling cause dropped socket connections. Configuring Spring Boot and Node.js services with a 15-second graceful shutdown timeout and ALB connection draining allows in-flight requests to complete cleanly before the task is decommissioned.',
          ],
        },
      ],
    },
  },
]
