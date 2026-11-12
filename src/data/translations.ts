export type SupportedLang = 'en' | 'vi' | 'fr' | 'ja'

export interface ExperienceItem {
  role: string
  company: string
  period: string
  summary: string
  bullets: string[]
  tech: string[]
}

export interface ProjectItem {
  title: string
  meta: string
  period: string
  desc: string
  bullets: string[]
  tech: string[]
  repoUrl?: string
}

export interface SkillGroup {
  title: string
  gridClass: string
  skills: string[]
}

export interface LocalizedBlogPost {
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

export interface TranslationDict {
  label: string
  nav: {
    liveLab: string
    about: string
    experience: string
    projects: string
    skills: string
    blog: string
    contact: string
  }
  hero: {
    role: string
    desc: string
    getInTouch: string
    resume: string
    resumeUrl?: string
    resumeFileName?: string
  }
  server: {
    tag: string
    title: string
    titleSub: string
    desc: string
  }
  about: {
    tag: string
    title: string
    titleSub: string
    p1: string
    p2: string
    educationTitle: string
    languagesTitle: string
    edu1School: string
    edu1Degree: string
    edu1Major: string
    edu1Dates: string
    edu1Location: string
    edu2School: string
    edu2Degree: string
    edu2Major: string
    edu2Dates: string
    edu2Location: string
    languages: string[]
  }
  experience: {
    tag: string
    title: string
    titleSub: string
    desc?: string
    items: ExperienceItem[]
  }
  projects: {
    tag: string
    title: string
    titleSub: string
    desc?: string
    items: ProjectItem[]
  }
  skills: {
    tag: string
    title: string
    titleSub: string
    desc?: string
    categories: SkillGroup[]
  }
  blog: {
    tag: string
    title: string
    titleSub: string
    desc?: string
    readNote: string
    backToPortfolio: string
    modalNoteLabel: string
    modalClose: string
    modalOtherNotes: string
    modalReadInModal: string
    posts: LocalizedBlogPost[]
  }
  contact: {
    tag: string
    title: string
    titleSub: string
    desc: string
    emailLabel: string
    msgLabel: string
    sendBtn: string
    sendingBtn: string
    successMsg: string
    errorMsg: string
  }
  footer: {
    rights: string
    edition: string
  }
}

// Reusable technical code snippets across languages
const CODE_SNIPPET_PYTHON = `import asyncio
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

const CODE_SNIPPET_C = `// ESP32-S3 Edge Vector Extraction Pipeline
tflite::MicroInterpreter interpreter(model, resolver, tensor_arena, kArenaSize);
TfLiteStatus status = interpreter.AllocateTensors();

// Direct frame grab from OV2640 sensor into input tensor buffer
camera_fb_t *fb = esp_camera_fb_get();
memcpy(interpreter.input(0)->data.uint8, fb->buf, fb->len);
interpreter.Invoke();

// Extract 512-dim normalized embedding (zero raw images transmitted)
float* embedding = interpreter.output(0)->data.f;`

const CODE_SNIPPET_YAML = `services:
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

const CODE_SNIPPET_REDIS = `// XFetch: Probabilistic early cache recomputation algorithm
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

const CODE_SNIPPET_POSTGRES = `-- Safe, zero-downtime column addition with default in PostgreSQL
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

const CODE_SNIPPET_IOT = `// Event-driven reactive telemetry worker with backpressure
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

export const TRANSLATIONS: Record<SupportedLang, TranslationDict> = {
  // ==========================================
  // ENGLISH
  // ==========================================
  en: {
    label: 'English',
    nav: {
      liveLab: 'LIVE LAB',
      about: 'ABOUT',
      skills: 'TECH STACK',
      experience: 'EXPERIENCE',
      projects: 'PROJECTS',
      blog: 'BLOG',
      contact: 'CONTACT',
    },
    hero: {
      role: 'SOFTWARE ENGINEER',
      desc: 'Building resilient backend systems, reverse-engineering client protocols, and scaling cloud infrastructure across modern distributed environments.',
      getInTouch: 'GET IN TOUCH',
      resume: 'RESUME',
    },
    server: {
      tag: 'LIVE TELEMETRY',
      title: 'This is the real server.',
      titleSub: 'Try it out.',
      desc: "Yes, you are inspecting the actual live Linux machine hosting this portfolio. Feel free to poke around and verify what's running under the hood - don't worry, you can't break it.",
    },
    about: {
      tag: '01 - ABOUT',
      title: 'Building systems',
      titleSub: 'that scale.',
      p1: 'Software Engineer comfortable owning a feature end-to-end - from system design to deployment. Production experience across backend systems, cloud infrastructure, and full-stack delivery. Built and shipped real systems at Grevo Solutions and contributed to AWS infrastructure design during an internship at Amazon.',
      p2: 'Strong understanding of OOP, SOLID principles, and RESTful API design. Hands-on experience with CI/CD pipelines (Jenkins) and containerized deployments (Docker, Google Cloud Run). Familiar with AWS Well-Architected Framework across security, reliability, and performance pillars.',
      educationTitle: 'EDUCATION',
      languagesTitle: 'WORKING LANGUAGES',
      edu1School: 'FPT University',
      edu1Degree: 'BACHELOR OF ENGINEERING',
      edu1Major: 'Computer Science · Sep 2022 - Present',
      edu1Dates: 'Ho Chi Minh City, VN',
      edu1Location: 'Ho Chi Minh City, VN',
      edu2School: 'Multimedia University',
      edu2Degree: 'STUDENT EXCHANGE PROGRAM',
      edu2Major: 'Interpersonal Communication · Jan - Apr 2023',
      edu2Dates: 'Malaysia',
      edu2Location: 'Cyberjaya, Malaysia',
      languages: ['English (Fluent)', 'Vietnamese (Native)', 'Japanese (Basic)', 'French (Familiar)'],
    },
    experience: {
      tag: '03 - EXPERIENCE & PROJECTS',
      title: "Where I've",
      titleSub: 'shipped code.',
      desc: 'Engineering roles across cloud infrastructure, enterprise SaaS, and hardware-edge platforms — focused on backend resilience and distributed scalability.',
      items: [
        {
          role: 'Cloud Infrastructure Intern',
          company: 'AMAZON WEB SERVICES (AWS) · Ho Chi Minh City · On-site',
          period: 'JAN - AUG 2026',
          summary:
            'Contributed to designing and optimizing cloud infrastructure for a subscription-based web application on AWS, from architecture evaluation through hands-on implementation and cost optimization.',
          bullets: [
            'Researched and recommended AWS architecture patterns tailored to workload profiles of thousands to tens of thousands of daily requests',
            'Participated in architectural decisions and hands-on implementation of a subscription-based web application',
            'Implemented monitoring and observability using CloudWatch for faster detection of performance bottlenecks',
            'Optimized EC2 sizing, caching strategy, and storage configuration, contributing to ~17% cloud cost reduction',
          ],
          tech: ['EC2', 'S3', 'CloudFront', 'RDS', 'Lambda', 'API Gateway', 'ElastiCache (Redis)', 'ALB', 'CloudWatch'],
        },
        {
          role: 'Founding Engineer & Project Lead',
          company: 'GREVO SOLUTIONS · Ho Chi Minh City · On-site',
          period: 'MAR 2025 - JAN 2026',
          summary:
            'Led the end-to-end design and delivery of an intelligent waste management platform, serving as lead engineer across system architecture, edge integration, and cross-functional coordination.',
          bullets: [
            'Designed end-to-end architecture connecting edge hardware, cloud backends, and multi-tenant management dashboards',
            'Shipped an end-to-end platform for a multi-tenant client in Malaysia on AWS, integrating IoT edge devices with a Spring Boot and React stack',
            'Built high-performance RESTful APIs with Spring Boot, optimizing database schemas across PostgreSQL and Redis',
            'Owned production deployment pipelines using Docker, Jenkins CI/CD, and Google Cloud Run',
          ],
          tech: ['Spring Boot', 'Java 21', 'ReactJS', 'PostgreSQL', 'Redis', 'Docker', 'Google Cloud Run', 'Jenkins', 'IoT'],
        },
        {
          role: 'Technical Staff · Event Operations',
          company: 'FPT EDUCATION · Ho Chi Minh City · On-site',
          period: 'JAN 2023 - AUG 2024',
          summary:
            'Provided technical and operational support for large-scale university events, workshops, and student programs.',
          bullets: [
            'Managed technical infrastructure (networking, sound, visual systems, livestreaming) for campus-wide events with 1,000+ attendees',
            'Coordinated major events including F-Camp 2023 - recognized as one of the top 20 outstanding contributors in the organization',
          ],
          tech: [],
        },
      ],
    },
    projects: {
      tag: '03 - EXPERIENCE & PROJECTS',
      title: "Selected systems I've",
      titleSub: 'engineered.',
      desc: 'Production systems, reverse-engineered automation frameworks, and scalable cloud backends — built for high concurrency and low latency.',
      items: [
        {
          title: 'LordNine Bot · Automation Framework',
          meta: 'SOLO DEVELOPER · 34 PRODUCTION RELEASES',
          period: 'MAR - APR 2026',
          desc: 'High-performance MMORPG automation framework reverse-engineered and built for extreme concurrency on consumer hardware.',
          bullets: [
            'Replaced Playwright with a custom CDP client, reducing per-instance memory from ~100MB to ~1KB - enabling 100+ concurrency on consumer hardware',
            'Implemented AIMD adaptive screenshot scheduling (150ms-800ms) and GUI queue coalescing, achieving ~90% reduction in UI update overhead',
            'Shipped a complete SaaS pipeline: HWID-bound license system, SHA256-verified auto-update, and Windows installer - iterated to v3.24+ across 34 releases in 2 months',
          ],
          tech: ['Python 3.13', 'OpenCV', 'CDP (DevTools)', 'SQLite', 'CustomTkinter'],
          repoUrl: 'https://github.com/nhatprx',
        },
        {
          title: 'Attenda · Smart Attendance System',
          meta: 'TEAM LEAD · 4 PERSON TEAM',
          period: 'MAR - AUG 2025',
          desc: 'Led a 4-person team to build a cost-optimized smart attendance system for university use, combining ESP32-S3 edge hardware with a cloud-connected web dashboard.',
          bullets: [
            'Engineered edge-based attendance hardware using ESP32-S3 with fingerprint sensor, minimizing cloud overhead through local processing; implemented TensorFlow face recognition achieving ~95% accuracy with <1.5s latency',
            'Built a React + TypeScript dashboard managing 1,000+ student records with real-time monitoring; designed Python/PostgreSQL backend handling 500+ daily attendance events',
          ],
          tech: ['ESP32-S3', 'TensorFlow', 'React', 'TypeScript', 'Python', 'Gunicorn', 'PostgreSQL'],
          repoUrl: 'https://github.com/nhatprx',
        },
        {
          title: 'Grevo WasteNet · Multi-Tenant Platform',
          meta: 'PROJECT LEAD · PRODUCTION CLOUD',
          period: 'MAR 2025 - JAN 2026',
          desc: 'Enterprise multi-tenant IoT platform on AWS integrating edge sensors with Spring Boot microservices and React dashboards.',
          bullets: [
            'Architected end-to-end cloud infrastructure on AWS for enterprise client, connecting 50+ smart bin clusters to centralized Spring Boot microservices',
            'Built high-throughput telemetry ingestion pipeline handling 10,000+ MQTT sensor signals/min with zero packet loss using Redis and PostgreSQL',
            'Deployed containerized microservices via Jenkins CI/CD pipelines to Google Cloud Run and AWS EC2 with automated health checks',
          ],
          tech: ['Spring Boot', 'Java 21', 'React', 'PostgreSQL', 'Redis', 'Docker', 'Jenkins', 'AWS', 'MQTT'],
          repoUrl: 'https://github.com/nhatprx',
        },
      ],
    },
    skills: {
      tag: '02 - TECHNICAL STACK',
      title: 'Technical',
      titleSub: 'stack.',
      desc: 'Curated tools, production languages, cloud backends, and engineering patterns honed across distributed systems.',
      categories: [
        {
          title: 'LANGUAGES',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['JavaScript', 'Java', 'Python'],
        },
        {
          title: 'FRAMEWORKS',
          gridClass: 'grid grid-cols-2 gap-2',
          skills: ['Spring Boot', 'ReactJS', 'NodeJS', 'ThreeJS'],
        },
        {
          title: 'DATABASES',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['PostgreSQL', 'MySQL', 'Redis'],
        },
        {
          title: 'DEVOPS & CLOUD',
          gridClass: 'grid grid-cols-2 gap-2',
          skills: ['AWS (EC2, S3, Lambda)', 'Google Cloud Run', 'Docker', 'Jenkins', 'Vercel', 'Render', 'Railway', 'Git'],
        },
        {
          title: 'ARCHITECTURE',
          gridClass: 'grid grid-cols-1 gap-2',
          skills: [
            'OOP & SOLID Principles',
            'RESTful API Design',
            'CI/CD Pipelines (Jenkins)',
            'Containerized Deployments (Docker, Cloud Run)',
            'AWS Well-Architected Framework',
          ],
        },
      ],
    },
    blog: {
      tag: '04 - BLOG',
      title: 'Engineering',
      titleSub: 'notes.',
      desc: 'Technical deep dives and architectural trade-offs from shipping high-concurrency software and distributed systems.',
      readNote: 'READ NOTE →',
      backToPortfolio: '← BACK TO PORTFOLIO',
      modalNoteLabel: 'ENGINEERING NOTE',
      modalClose: 'CLOSE',
      modalOtherNotes: 'OTHER ENGINEERING NOTES',
      modalReadInModal: 'READ IN MODAL →',
      posts: [
        {
          slug: 'cdp-vs-playwright-automation',
          title: 'Reverse-Engineering MMORPG Automation: Why CDP Beat Playwright by 10,000%',
          date: 'APR 2026',
          readTime: '6 MIN READ',
          summary:
            'How dissecting headless browser internals and swapping heavy WebDriver abstraction for lightweight raw Chrome DevTools Protocol sockets reduced per-instance memory from ~100MB to ~1KB, enabling 100+ concurrent worker instances on commodity hardware.',
          tags: ['Python', 'CDP', 'Reverse Engineering', 'Performance'],
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
                  snippet: CODE_SNIPPET_PYTHON,
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
                  snippet: CODE_SNIPPET_C,
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
                  snippet: CODE_SNIPPET_YAML,
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
        {
          slug: 'redis-cache-stampede-mitigation',
          title: 'Mitigating Cache Stampedes: Probabilistic Early Expiration vs Distributed Locks in Redis',
          date: 'FEB 2026',
          readTime: '5 MIN READ',
          summary:
            'How we solved high-load thundering herd problems in Spring Boot by implementing the XFetch optimal probabilistic early recomputation algorithm, slashing P99 database spikes by 84%.',
          tags: ['Redis', 'Spring Boot', 'Distributed Systems', 'Caching'],
          content: {
            lead: 'When high-traffic cache keys expire, thousands of concurrent requests can simultaneously miss the cache and hammer backend relational databases. Here is how we evaluated distributed locks versus probabilistic early expiration to eliminate cache stampedes.',
            sections: [
              {
                heading: '1. The Thundering Herd Problem',
                body: [
                  'In our multi-tenant SaaS backend, hot cache keys representing tenant catalog data would expire at peak traffic hours. A sudden burst of 5,000 requests per second attempting to recompute the same expensive aggregate query caused database connection pool exhaustion and severe latency spikes.',
                  'Traditional mutual exclusion locks (using Redlock or Redis SETNX) created queuing bottlenecks and introduced complex failure modes when workers crashed mid-computation.',
                ],
              },
              {
                heading: '2. The XFetch Algorithm: Optimal Probabilistic Refresh',
                body: [
                  'Rather than waiting for absolute TTL expiry, we adopted the XFetch algorithm (Vattani et al.). A request performs background cache regeneration before the key actually expires, with probability increasing as time approaches TTL.',
                  'By factoring in the time delta needed to recompute the query, background threads refresh the cache seamlessly while serving hot read traffic from memory with zero lock contention.',
                ],
                code: {
                  language: 'java',
                  snippet: CODE_SNIPPET_REDIS,
                },
              },
              {
                heading: '3. Measurable Production Outcomes',
                body: [
                  'Under sustained synthetic load testing at 8,000 req/s, P99 database response times dropped from 1,420ms down to 220ms (an 84% reduction), and database CPU utilization flattened out to a steady 28%.',
                ],
              },
            ],
          },
        },
        {
          slug: 'zero-downtime-postgres-migrations',
          title: 'Zero-Downtime PostgreSQL Schema Migrations on High-Throughput Tables',
          date: 'NOV 2025',
          readTime: '6 MIN READ',
          summary:
            'A field guide to safe column additions, lock timeouts, concurrent index creation, and avoiding table locks that silently bring down production databases under sustained traffic.',
          tags: ['PostgreSQL', 'Database', 'DevOps', 'Reliability'],
          content: {
            lead: 'Running ALTER TABLE in a staging environment takes milliseconds. In production under sustained traffic, that same statement can acquire an ACCESS EXCLUSIVE lock, queuing all incoming queries behind it and starving connection pools.',
            sections: [
              {
                heading: '1. The Danger of Silent Lock Queues',
                body: [
                  'PostgreSQL processes lock requests FIFO. If an ALTER TABLE statement is blocked waiting for a long-running analytical SELECT query to finish, all subsequent reads and writes on that table line up behind the ALTER request, cascading into an outage within seconds.',
                  'To prevent this catastrophe, we mandate setting a strict lock_timeout (e.g. 2s) on every migration transaction.',
                ],
                code: {
                  language: 'sql',
                  snippet: CODE_SNIPPET_POSTGRES,
                },
              },
              {
                heading: '2. Indexing Millions of Rows with CREATE INDEX CONCURRENTLY',
                body: [
                  'Standard index creation locks the table against writes for the entire duration of the build. CREATE INDEX CONCURRENTLY runs two table scans and builds the index without blocking INSERT, UPDATE, or DELETE operations.',
                  'If a concurrent build fails due to a unique constraint violation, it leaves an INVALID index that must be dropped and retried before re-running the migration pipeline.',
                ],
              },
              {
                heading: '3. Safe Column Additions and Rollback Strategies',
                body: [
                  'In PostgreSQL 11+, adding a column with a constant DEFAULT value is an instantaneous metadata-only operation. We enforce backward-compatible multi-phase schema changes: expand the schema first, deploy the application code, and contract old columns only after full verification.',
                ],
              },
            ],
          },
        },
        {
          slug: 'event-driven-iot-spring-boot',
          title: 'Building Resilient IoT Ingestion Pipelines: From MQTT Brokers to Event-Driven Workers',
          date: 'JUL 2025',
          readTime: '7 MIN READ',
          summary:
            'Architecting a fault-tolerant edge telemetry ingestion gateway handling 10,000+ sensor heartbeats per minute with zero message loss using backpressure and transactional outbox patterns.',
          tags: ['IoT', 'Spring Boot', 'Architecture', 'Kafka'],
          content: {
            lead: 'Edge devices in the field frequently disconnect, reconnect in massive synchronized waves, and emit bursts of telemetry. Here is how we engineered an event-driven ingestion pipeline in Spring Boot that gracefully absorbs volatility.',
            sections: [
              {
                heading: '1. Handling Sensor Connection Stampedes',
                body: [
                  'When regional cellular towers recovered after transient outages, thousands of smart waste sensors simultaneously reconnected and dumped accumulated telemetry. Synchronous REST endpoints were quickly overwhelmed.',
                  'We decoupled sensor intake through an MQTT broker bridge feeding into a reactive Spring Boot message queue, applying backpressure to buffer spikes without dropping packets.',
                ],
                code: {
                  language: 'java',
                  snippet: CODE_SNIPPET_IOT,
                },
              },
              {
                heading: '2. Ensuring Exactly-Once Semantics with Idempotent Ingestion',
                body: [
                  'Because unstable edge connections frequently retry transmissions, network packets often duplicate. We introduced deterministic UUIDv5 message identifiers generated from device ID, timestamp, and metric sequence numbers.',
                  'A Redis Bloom filter paired with PostgreSQL unique constraint indexing ensures duplicates are discarded in under 0.8ms without triggering database deadlocks.',
                ],
              },
              {
                heading: '3. Zero Data Loss via the Transactional Outbox Pattern',
                body: [
                  'To synchronize local edge states with downstream analytical workers, database mutations and event publications are wrapped in atomic transactional outbox tables, guaranteeing eventual consistency across all monitoring dashboards.',
                ],
              },
            ],
          },
        },
      ],
    },
    contact: {
      tag: '05 - CONTACT',
      title: "Let's build",
      titleSub: 'together.',
      desc: 'Available for full-time engineering roles, freelance opportunities, and collaborative projects. Currently based in Ho Chi Minh City, Vietnam.',
      emailLabel: 'YOUR EMAIL',
      msgLabel: 'MESSAGE',
      sendBtn: 'SEND MESSAGE →',
      sendingBtn: 'SENDING...',
      successMsg: '✓ Message sent! Thank you, I will reply to your email soon.',
      errorMsg: 'Network error. Please try emailing me directly at nhatprx@gmail.com.',
    },
    footer: {
      rights: 'All rights reserved.',
      edition: 'Minimal Monochrome Edition',
    },
  },

  // ==========================================
  // VIETNAMESE
  // ==========================================
  vi: {
    label: 'Tiếng Việt',
    nav: {
      liveLab: 'MÁY CHỦ THỰC TẾ',
      about: 'GIỚI THIỆU',
      skills: 'TECH STACK',
      experience: 'KINH NGHIỆM',
      projects: 'DỰ ÁN',
      blog: 'BÀI VIẾT',
      contact: 'LIÊN HỆ',
    },
    hero: {
      role: 'KỸ SƯ PHẦN MỀM',
      desc: 'Xây dựng hệ thống backend chịu tải cao, phân tích và tối ưu hóa giao thức hệ thống, và mở rộng hạ tầng đám mây phân tán hiện đại.',
      getInTouch: 'LIÊN HỆ NGAY',
      resume: 'TẢI RESUME',
    },
    server: {
      tag: 'TRẠNG THÁI TRỰC TIẾP',
      title: 'Đây là máy chủ thật.',
      titleSub: 'Thử nghiệm ngay.',
      desc: 'Bạn đang trực tiếp tương tác với máy chủ Linux thật đang vận hành portfolio này. Thoải mái kiểm tra các tiến trình và tài nguyên bên dưới - đừng lo, bạn không làm hỏng nó được đâu.',
    },
    about: {
      tag: '01 - GIỚI THIỆU',
      title: 'Xây dựng hệ thống',
      titleSub: 'mở rộng & bền bỉ.',
      p1: 'Kỹ sư phần mềm làm chủ toàn bộ vòng đời sản phẩm từ thiết kế kiến trúc đến triển khai production. Kinh nghiệm thực chiến với backend chịu tải cao, hạ tầng cloud, xây dựng sản phẩm tại Grevo Solutions và tham gia thiết kế hạ tầng AWS khi thực tập tại Amazon Web Services.',
      p2: 'Thành thạo nguyên lý OOP, SOLID và thiết kế RESTful API. Kinh nghiệm thực tế triển khai CI/CD pipelines (Jenkins) và đóng gói ứng dụng bằng container (Docker, Google Cloud Run). Nắm vững khung kiến trúc AWS Well-Architected Framework về bảo mật, độ tin cậy và hiệu năng.',
      educationTitle: 'HỌC VẤN',
      languagesTitle: 'NGÔN NGỮ GIAO TIẾP',
      edu1School: 'Đại học FPT',
      edu1Degree: 'KỸ SƯ KHOA HỌC MÁY TÍNH',
      edu1Major: 'Khoa học Máy tính · 09/2022 - Hiện tại',
      edu1Dates: 'TP. Hồ Chí Minh, Việt Nam',
      edu1Location: 'TP. Hồ Chí Minh, Việt Nam',
      edu2School: 'Đại học Multimedia',
      edu2Degree: 'CHƯƠNG TRÌNH TRAO ĐỔI SINH VIÊN',
      edu2Major: 'Giao tiếp liên văn hóa · 01/2023 - 04/2023',
      edu2Dates: 'Cyberjaya, Malaysia',
      edu2Location: 'Cyberjaya, Malaysia',
      languages: ['Tiếng Anh (Thành thạo)', 'Tiếng Việt (Bản ngữ)', 'Tiếng Nhật (Cơ bản)', 'Tiếng Pháp (Giao tiếp cơ bản)'],
    },
    experience: {
      tag: '03 - KINH NGHIỆM & DỰ ÁN',
      title: 'Nơi tôi từng',
      titleSub: 'làm việc & cống hiến.',
      desc: 'Hành trình kỹ thuật thực chiến qua hạ tầng đám mây AWS, nền tảng SaaS và thiết bị IoT biên — tập trung vào độ tin cậy hệ thống và khả năng mở rộng phân tán.',
      items: [
        {
          role: 'Thực tập sinh Hạ tầng Đám mây',
          company: 'AMAZON WEB SERVICES (AWS) · TP. Hồ Chí Minh · Trực tiếp',
          period: '01/2026 - 08/2026',
          summary:
            'Tham gia thiết kế và tối ưu hạ tầng đám mây cho ứng dụng web dạng thuê bao trên AWS, từ đánh giá kiến trúc đến triển khai thực tế và tối ưu chi phí vận hành.',
          bullets: [
            'Nghiên cứu và đề xuất các mẫu kiến trúc AWS tối ưu theo đặc thù lưu lượng từ hàng nghìn đến hàng chục nghìn lượt request mỗi ngày',
            'Tham gia ra quyết định kiến trúc và trực tiếp triển khai hệ thống ứng dụng web dạng thuê bao',
            'Thiết lập hệ thống giám sát và cảnh báo toàn diện với CloudWatch giúp phát hiện sớm các điểm nghẽn hiệu năng',
            'Tối ưu kích thước EC2, chiến lược bộ nhớ đệm (caching) và cấu hình lưu trữ, góp phần cắt giảm ~17% chi phí đám mây',
          ],
          tech: ['EC2', 'S3', 'CloudFront', 'RDS', 'Lambda', 'API Gateway', 'ElastiCache (Redis)', 'ALB', 'CloudWatch'],
        },
        {
          role: 'Kỹ sư Sáng lập & Trưởng nhóm Dự án',
          company: 'GREVO SOLUTIONS · TP. Hồ Chí Minh · Trực tiếp',
          period: '03/2025 - 01/2026',
          summary:
            'Dẫn dắt thiết kế và bàn giao nền tảng quản lý rác thải thông minh, giữ vai trò kỹ sư chủ chốt xuyên suốt kiến trúc hệ thống, tích hợp thiết bị phần cứng và điều phối đội ngũ.',
          bullets: [
            'Thiết kế kiến trúc hệ thống toàn diện kết nối thiết bị phần cứng IoT tại biên, backend trên cloud và dashboard quản lý đa người dùng',
            'Bàn giao nền tảng hoàn chỉnh cho đối tác tại Malaysia trên AWS, tích hợp thiết bị IoT biên với ngăn xếp Spring Boot và React',
            'Xây dựng các RESTful API hiệu năng cao bằng Spring Boot, tối ưu cấu trúc cơ sở dữ liệu trên PostgreSQL và Redis',
            'Làm chủ quy trình triển khai tự động CI/CD với Docker, Jenkins và Google Cloud Run',
          ],
          tech: ['Spring Boot', 'Java 21', 'ReactJS', 'PostgreSQL', 'Redis', 'Docker', 'Google Cloud Run', 'Jenkins', 'IoT'],
        },
        {
          role: 'Nhân viên Kỹ thuật · Vận hành Sự kiện',
          company: 'FPT EDUCATION · TP. Hồ Chí Minh · Trực tiếp',
          period: '01/2023 - 08/2024',
          summary:
            'Hỗ trợ kỹ thuật và vận hành cho các sự kiện quy mô lớn, workshop và chương trình phát triển sinh viên tại trường đại học.',
          bullets: [
            'Quản lý hạ tầng kỹ thuật (mạng, âm thanh, ánh sáng, hệ thống trình chiếu, livestream) cho các sự kiện toàn trường với hơn 1.000 người tham dự',
            'Điều phối các sự kiện trọng điểm như F-Camp 2023 - được vinh danh trong top 20 cá nhân hoạt động xuất sắc nhất tổ chức',
          ],
          tech: [],
        },
      ],
    },
    projects: {
      tag: '03 - KINH NGHIỆM & DỰ ÁN',
      title: 'Những hệ thống',
      titleSub: 'tôi từng kiến tạo.',
      desc: 'Hệ thống phân tán, framework tự động hóa dịch ngược và kiến trúc đám mây — tối ưu cho khả năng xử lý đồng thời cực hạn và độ trễ thấp.',
      items: [
        {
          title: 'LordNine Bot · Automation Framework',
          meta: 'LẬP TRÌNH ĐỘC LẬP · 34 PHIÊN BẢN PRODUCTION',
          period: '03 - 04/2026',
          desc: 'Framework tự động hóa game MMORPG hiệu năng cao, được dịch ngược và tối ưu để đạt khả năng đồng thời cực đại trên phần cứng phổ thông.',
          bullets: [
            'Thay thế Playwright bằng client CDP tùy biến, giảm bộ nhớ tiêu thụ mỗi instance từ ~100MB xuống chỉ còn ~1KB - chạy mượt mà 100+ luồng đồng thời trên máy cá nhân',
            'Áp dụng cơ chế lập lịch chụp màn hình thích ứng AIMD (150ms-800ms) kết hợp gộp hàng đợi GUI, giảm ~90% chi phí xử lý giao diện nền',
            'Xây dựng trọn vẹn quy trình SaaS: hệ thống cấp phép khóa theo HWID, cơ chế tự cập nhật xác thực mã băm SHA256 và bộ cài đặt Windows - phát hành 34 bản cập nhật trong 2 tháng (v1.0 đến v3.24)',
          ],
          tech: ['Python 3.13', 'OpenCV', 'CDP (DevTools)', 'SQLite', 'CustomTkinter'],
          repoUrl: 'https://github.com/nhatprx',
        },
        {
          title: 'Attenda · Smart Attendance System',
          meta: 'TRƯỞNG NHÓM · NHÓM 4 THÀNH VIÊN',
          period: '03 - 08/2025',
          desc: 'Dẫn dắt nhóm 4 người xây dựng hệ thống điểm danh thông minh tối ưu chi phí cho môi trường đại học, kết hợp thiết bị phần cứng nhúng ESP32-S3 với web dashboard đám mây.',
          bullets: [
            'Thiết kế phần cứng điểm danh biên sử dụng chip ESP32-S3 tích hợp cảm biến vân tay, giảm tải cho cloud thông qua xử lý cục bộ; tích hợp mô hình nhận diện khuôn mặt TensorFlow đạt độ chính xác ~95% với độ trễ <1.5s',
            'Xây dựng dashboard giám sát thời gian thực bằng React + TypeScript quản lý hơn 1.000 hồ sơ sinh viên; thiết kế backend Python/PostgreSQL xử lý 500+ lượt điểm danh hàng ngày',
          ],
          tech: ['ESP32-S3', 'TensorFlow', 'React', 'TypeScript', 'Python', 'Gunicorn', 'PostgreSQL'],
          repoUrl: 'https://github.com/nhatprx',
        },
        {
          title: 'Grevo WasteNet · Nền tảng IoT Đám mây',
          meta: 'TRƯỞNG DỰ ÁN · PRODUCTION CLOUD',
          period: '03/2025 - 01/2026',
          desc: 'Nền tảng IoT quản lý rác thải thông minh đa người dùng trên AWS, tích hợp thiết bị phần cứng tại biên với Spring Boot và React.',
          bullets: [
            'Thiết kế kiến trúc đám mây toàn diện trên AWS cho đối tác quốc tế, kết nối 50+ cụm thùng rác thông minh về cụm microservices Spring Boot',
            'Xây dựng pipeline thu thập telemetry biên đạt thông lượng 10.000+ tín hiệu MQTT/phút không thất thoát gói tin với Redis và PostgreSQL',
            'Tự động hóa đóng gói và triển khai container qua Jenkins CI/CD lên Google Cloud Run và AWS EC2 với cơ chế kiểm tra sức khỏe tự động',
          ],
          tech: ['Spring Boot', 'Java 21', 'React', 'PostgreSQL', 'Redis', 'Docker', 'Jenkins', 'AWS', 'MQTT'],
          repoUrl: 'https://github.com/nhatprx',
        },
      ],
    },
    skills: {
      tag: '02 - CÔNG NGHỆ & KỸ NĂNG',
      title: 'Ngăn xếp',
      titleSub: 'công nghệ.',
      desc: 'Bộ công nghệ, ngôn ngữ lập trình, hệ thống đám mây và kiến trúc hướng đối tượng được ứng dụng thực chiến trong môi trường phân tán.',
      categories: [
        {
          title: 'NGÔN NGỮ LẬP TRÌNH',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['JavaScript', 'Java', 'Python'],
        },
        {
          title: 'FRAMEWORKS',
          gridClass: 'grid grid-cols-2 gap-2',
          skills: ['Spring Boot', 'ReactJS', 'NodeJS', 'ThreeJS'],
        },
        {
          title: 'CƠ SỞ DỮ LIỆU',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['PostgreSQL', 'MySQL', 'Redis'],
        },
        {
          title: 'DEVOPS & ĐÁM MÂY',
          gridClass: 'grid grid-cols-2 gap-2',
          skills: ['AWS (EC2, S3, Lambda)', 'Google Cloud Run', 'Docker', 'Jenkins', 'Vercel', 'Render', 'Railway', 'Git'],
        },
        {
          title: 'KIẾN TRÚC HỆ THỐNG',
          gridClass: 'grid grid-cols-1 gap-2',
          skills: [
            'Nguyên lý OOP & SOLID',
            'Thiết kế RESTful API',
            'Pipeline CI/CD (Jenkins)',
            'Triển khai Container (Docker, Cloud Run)',
            'Khung AWS Well-Architected',
          ],
        },
      ],
    },
    blog: {
      tag: '04 - BÀI VIẾT',
      title: 'Ghi chép',
      titleSub: 'kỹ thuật.',
      desc: 'Ghi chép kỹ thuật chuyên sâu và bài học kiến trúc từ quá trình vận hành phần mềm phân tán chịu tải cao.',
      readNote: 'ĐỌC BÀI VIẾT →',
      backToPortfolio: '← QUAY LẠI TRANG CHỦ',
      modalNoteLabel: 'BÀI VIẾT KỸ THUẬT',
      modalClose: 'ĐÓNG',
      modalOtherNotes: 'CÁC BÀI VIẾT KỸ THUẬT KHÁC',
      modalReadInModal: 'ĐỌC BÀI VIẾT →',
      posts: [
        {
          slug: 'cdp-vs-playwright-automation',
          title: 'Dịch ngược tự động hóa game MMORPG: Vì sao CDP đánh bại Playwright gấp 100 lần',
          date: '04/2026',
          readTime: '6 PHÚT ĐỌC',
          summary:
            'Cách phân tích socket nội bộ trình duyệt và thay thế lớp trừu tượng nặng nề của WebDriver bằng kết nối Chrome DevTools Protocol nguyên bản giúp cắt giảm bộ nhớ từ ~100MB xuống ~1KB, mở rộng 100+ luồng tự động hóa đồng thời trên máy tính phổ thông.',
          tags: ['Python', 'CDP', 'Dịch ngược', 'Tối ưu hiệu năng'],
          content: {
            lead: 'Đầu năm 2026, trong quá trình phát triển hệ thống tự động hóa game MMORPG (LordNine Bot), các công cụ tiêu chuẩn như Selenium và Playwright đã vấp phải rào cản cạn kiệt bộ nhớ RAM. Bài viết này giải thích vì sao việc chuyển sang giao thức Chrome DevTools Protocol (CDP) dạng thô qua WebSocket đã giải quyết triệt để bài toán.',
            sections: [
              {
                heading: '1. Bài toán: Gánh nặng ~100MB cho mỗi tiến trình trình duyệt',
                body: [
                  'Mỗi context trình duyệt trên Playwright hoặc Puppeteer đều khởi chạy Node.js bindings, hàng đợi IPC và Chromium sandbox ngốn từ 80MB-120MB mỗi worker thread. Trên máy tính 16GB RAM, khi chạy từ 40 cửa sổ trở lên, hệ thống lập tức bị nghẽn RAM, crash do OOM và CPU chạm ngưỡng 100%.',
                  'Ngoài ra, các thư viện tự động hóa truyền thống luôn để lại các dấu vết đặc trưng (navigator.webdriver, permission flags, cdp stack trace) khiến các hệ thống chống gian lận (anti-cheat) dễ dàng phát hiện và khóa tài khoản.',
                ],
              },
              {
                heading: '2. Giải pháp: Kết nối WebSocket thô & Giao thức CDP tối giản',
                body: [
                  'Thay vì điều khiển trình duyệt qua các thư viện trung gian cồng kềnh, chúng tôi dịch ngược client game và kết nối trực tiếp qua WebSocket bất đồng bộ tới cổng debugging của Chrome DevTools Protocol.',
                  'Bằng cách tự đóng gói các lệnh JSON-RPC 2.0 bằng tay và chỉ xử lý các domain tối cần thiết (Runtime.evaluate, Input.dispatchMouseEvent, Page.captureScreenshot), bộ nhớ RAM cần cho mỗi phiên giảm kỷ lục từ ~100MB xuống chỉ còn vỏn vẹn ~1KB.',
                ],
                code: {
                  language: 'python',
                  snippet: CODE_SNIPPET_PYTHON,
                },
              },
              {
                heading: '3. Cơ chế điều phối AIMD và gộp hàng đợi giao diện',
                body: [
                  'Kể cả khi mạng rất nhẹ, việc gửi 60 khung hình/giây liên tục vẫn làm nghẽn bus bộ nhớ. Chúng tôi đã áp dụng giải thuật AIMD (Additive Increase / Multiplicative Decrease):',
                  'Khi không có chuyển đổi trạng thái nào trong bộ nhớ game, chu kỳ chụp màn hình sẽ tự động giãn từ 150ms lên đến 800ms. Ngay khi có cờ hành động kích hoạt, chu kỳ lập tức thu hẹp trong một tick. Kết hợp với việc gộp hàng đợi sự kiện giao diện trên CustomTkinter, lượng CPU nền tiêu thụ giảm đến ~90%.',
                ],
              },
              {
                heading: '4. Kết quả thực tế trên môi trường Production',
                body: [
                  'Bộ khung tối ưu này đã vận hành ổn định qua 34 phiên bản phát hành thương mại (từ v1.0 đến v3.24) trong 2 tháng. Hơn 100 tài khoản có thể chạy song song liên tục trên một CPU 4 nhân tầm trung, đi kèm hệ thống tự động cập nhật xác thực SHA256 và khóa bản quyền theo phần cứng (HWID).',
                ],
              },
            ],
          },
        },
        {
          slug: 'edge-cloud-biometric-esp32',
          title: 'Thiết kế hệ thống sinh trắc học Edge-Cloud với ESP32-S3 và TensorFlow',
          date: '08/2025',
          readTime: '5 PHÚT ĐỌC',
          summary:
            'Đánh đổi kiến trúc giữa nhận diện khuôn mặt trực tiếp trên vi điều khiển phần cứng biên và chuyển tải lên cloud worker: tối ưu độ trễ, bảo mật dữ liệu riêng tư và cơ chế hàng đợi ngoại tuyến đồng bộ PostgreSQL.',
          tags: ['IoT', 'ESP32-S3', 'TensorFlow', 'PostgreSQL'],
          content: {
            lead: 'Các hệ thống điểm danh tại trường học thường gặp tình trạng tắc nghẽn giờ cao điểm, mạng chập chờn và lo ngại rò rỉ dữ liệu khi hình ảnh khuôn mặt được gửi trực tiếp lên máy chủ đám mây. Với dự án Attenda, chúng tôi xây dựng kiến trúc sinh trắc học ưu tiên biên bằng vi điều khiển ESP32-S3.',
            sections: [
              {
                heading: '1. Vì sao nên xử lý sinh trắc học tại biên (Edge Computing)?',
                body: [
                  'Truyền luồng video thô từ hơn 30 phòng học về máy chủ trung tâm ngốn băng thông nội bộ khổng lồ và tiềm ẩn nguy cơ bảo mật. Khi mạng gặp sự cố, toàn bộ cổng điểm danh của trường sẽ ngưng trệ.',
                  'Bằng cách trích xuất đặc trưng nhận diện ngay trên chip ESP32-S3, thiết bị chỉ truyền chuỗi vector embedding 512 chiều, loại bỏ hoàn toàn hình ảnh gốc ngay tại cảm biến camera.',
                ],
              },
              {
                heading: '2. Tối ưu hóa mô hình AI trên phần cứng giới hạn',
                body: [
                  'Chip ESP32-S3 sở hữu 2 nhân Xtensa LX7 hỗ trợ tập lệnh vector PIE. Bằng thư viện TensorFlow Lite for Microcontrollers (TFLM) và lượng tử hóa số nguyên 8-bit (INT8), mô hình nhận diện khuôn mặt được nén xuống dưới 1.8MB, nằm gọn trong bộ nhớ flash và PSRAM của chip.',
                  'Thời gian suy luận embedding đạt mức ổn định 1.2s - 1.4s mỗi sinh viên với độ chính xác nhận diện trên 95% trong nhiều điều kiện ánh sáng lớp học.',
                ],
                code: {
                  language: 'c',
                  snippet: CODE_SNIPPET_C,
                },
              },
              {
                heading: '3. Hàng đợi ngoại tuyến linh hoạt & Đồng bộ PostgreSQL',
                body: [
                  'Khi mất kết nối Wi-Fi, thiết bị tự động lưu lượt điểm danh vào bộ đệm vòng (ring buffer) trên bộ nhớ flash SPI. Khi mạng có lại, dữ liệu được gửi thành từng lô (batch) tới backend Python/Gunicorn/PostgreSQL với khóa bất biến (idempotency keys), đảm bảo tuyệt đối không trùng lặp và không thất thoát dữ liệu.',
                ],
              },
            ],
          },
        },
        {
          slug: 'aws-microservice-docker-isolation',
          title: 'Bài học triển khai Microservices đa người dùng và cô lập Docker trên AWS',
          date: '01/2026',
          readTime: '7 PHÚT ĐỌC',
          summary:
            'Những đúc kết quan trọng về kết nối VPC Peering, siết chặt bảo mật container và tối ưu chi phí lưu lượng truyền dữ liệu (egress) trong hạ tầng đám mây production.',
          tags: ['AWS', 'Docker', 'DevOps', 'Kiến trúc hệ thống'],
          content: {
            lead: 'Vận hành các dịch vụ microservices phục vụ nhiều khách hàng (multi-tenant) trong môi trường production đòi hỏi ranh giới cách ly nghiêm ngặt, độ trễ mạng thấp và quy trình vận hành đơn giản. Dưới đây là những bài học thực chiến khi thiết kế hạ tầng trên AWS.',
            sections: [
              {
                heading: '1. Phòng thủ chuyên sâu: Vượt lên các thiết lập mặc định của Docker',
                body: [
                  'Thiết lập mặc định của Docker cấp nhiều quyền hạn hơn mức dịch vụ microservice thực sự cần. Trong môi trường production, chúng tôi kích hoạt hệ thống tập tin gốc chỉ đọc (read-only rootfs), loại bỏ toàn bộ Linux capabilities (cap-drop: ALL) ngoại trừ quyền mở cổng mạng, và gán UID/GID riêng biệt không có đặc quyền.',
                  'Cách ly các máy chủ tính toán trong mạng riêng (Private Subnet) và định tuyến chặt chẽ qua NAT Gateway giúp ngăn chặn hoàn toàn việc phơi nhiễm trực tiếp ra Internet mà vẫn duy trì luồng telemetry ra ngoài.',
                ],
                code: {
                  language: 'yaml',
                  snippet: CODE_SNIPPET_YAML,
                },
              },
              {
                heading: '2. Tối ưu chi phí Egress với VPC Endpoints',
                body: [
                  'Một trong những nguyên nhân khiến chi phí cloud tăng vọt là định tuyến lưu lượng giữa máy chủ và dịch vụ S3/DynamoDB qua NAT Gateway. Bằng cách thiết lập AWS Gateway VPC Endpoints, lưu lượng giữa các container ECS và S3 được luân chuyển hoàn toàn trong mạng nội bộ AWS, giảm 40% độ trễ và triệt tiêu phí xử lý dữ liệu NAT theo GB.',
                ],
              },
              {
                heading: '3. Kiểm tra sức khỏe (Health Check) và Draining an toàn',
                body: [
                  'Khi triển khai cập nhật phiên bản mới theo cơ chế rolling deploy, việc thiếu xử lý tín hiệu SIGTERM sẽ làm đứt đột ngột các kết nối đang hoạt động. Cấu hình dịch vụ Spring Boot và Node.js với thời gian chờ kết thúc 15 giây kết hợp cơ chế ALB Connection Draining đảm bảo các request đang xử lý được hoàn tất trọn vẹn trước khi container cũ dừng hẳn.',
                ],
              },
            ],
          },
        },
        {
          slug: 'redis-cache-stampede-mitigation',
          title: 'Xử lý Cache Stampede: Giải thuật hết hạn sớm xác suất (XFetch) và Khóa phân tán trong Redis',
          date: '02/2026',
          readTime: '5 PHÚT ĐỌC',
          summary:
            'Cách chúng tôi giải quyết vấn đề nghẽn đồng loạt (thundering herd) trong Spring Boot bằng giải thuật tính toán lại trước xác suất XFetch, giảm 84% thời gian phản hồi P99 của cơ sở dữ liệu.',
          tags: ['Redis', 'Spring Boot', 'Hệ thống phân tán', 'Caching'],
          content: {
            lead: 'Khi các key cache có lưu lượng truy cập cao bị hết hạn TTL, hàng nghìn request đồng thời sẽ cùng lúc bị cache miss và dồn dập truy vấn trực tiếp vào cơ sở dữ liệu quan hệ phía sau. Dưới đây là cách chúng tôi so sánh giữa khóa phân tán và giải thuật hết hạn sớm theo xác suất để loại bỏ hoàn toàn hiện tượng cache stampede.',
            sections: [
              {
                heading: '1. Vấn đề Thundering Herd trong thực tế',
                body: [
                  'Trong backend SaaS đa người dùng của chúng tôi, các key cache chứa dữ liệu danh mục của khách hàng thường hết hạn đúng vào khung giờ cao điểm. Đợt bùng nổ 5.000 request mỗi giây cùng lúc tính toán lại một câu truy vấn aggregate nặng nề làm cạn kiệt connection pool của database và khiến độ trễ tăng vọt.',
                  'Giải pháp khóa loại trừ truyền thống (sử dụng Redlock hoặc Redis SETNX) tạo ra nút thắt cổ chai xếp hàng và dễ rơi vào trạng thái lỗi phức tạp khi worker bị crash giữa chừng.',
                ],
              },
              {
                heading: '2. Giải thuật XFetch: Tái tạo Cache sớm theo xác suất tối ưu',
                body: [
                  'Thay vì đợi key hết hạn cứng theo TTL, chúng tôi áp dụng giải thuật XFetch (Vattani và cộng sự). Request sẽ kích hoạt tiến trình chạy nền để làm mới cache trước khi key thực sự hết hạn, với xác suất tăng dần khi thời gian trôi dần về mốc TTL.',
                  'Bằng cách tính toán thêm thời gian cần thiết để thực thi câu truy vấn, các worker chạy ngầm cập nhật lại cache một cách mượt mà trong khi luồng đọc chính vẫn nhận dữ liệu tức thì từ bộ nhớ RAM với độ trễ 0ms.',
                ],
                code: {
                  language: 'java',
                  snippet: CODE_SNIPPET_REDIS,
                },
              },
              {
                heading: '3. Hiệu quả đo lường trên môi trường Production',
                body: [
                  'Dưới thử nghiệm tải nhân tạo 8.000 req/s liên tục, thời gian phản hồi P99 của cơ sở dữ liệu giảm ngoạn mục từ 1.420ms xuống chỉ còn 220ms (giảm 84%), và mức tải CPU của cụm database giữ ổn định ở mức 28%.',
                ],
              },
            ],
          },
        },
        {
          slug: 'zero-downtime-postgres-migrations',
          title: 'Chiến lược Migration lược đồ PostgreSQL không gián đoạn dịch vụ (Zero-Downtime) trên bảng dữ liệu lớn',
          date: '11/2025',
          readTime: '6 PHÚT ĐỌC',
          summary:
            'Hướng dẫn thực chiến về thêm cột an toàn, thiết lập lock timeout, đánh chỉ mục song song (CREATE INDEX CONCURRENTLY) và tránh khóa bảng đột ngột làm sập hệ thống trong giờ cao điểm.',
          tags: ['PostgreSQL', 'Cơ sở dữ liệu', 'DevOps', 'Độ tin cậy'],
          content: {
            lead: 'Chạy lệnh ALTER TABLE trên môi trường dev chỉ mất vài mili-giây. Nhưng trên môi trường production với hàng nghìn truy vấn đồng thời, chính câu lệnh đó có thể chiếm quyền khóa độc quyền (ACCESS EXCLUSIVE lock), dồn ứ toàn bộ truy vấn phía sau và làm cạn kiệt connection pool chỉ trong vài giây.',
            sections: [
              {
                heading: '1. Hiểm họa từ hàng đợi khóa ngầm (Lock Queue)',
                body: [
                  'PostgreSQL xử lý hàng đợi yêu cầu lock theo cơ chế FIFO. Nếu câu lệnh ALTER TABLE bị kẹt đợi một câu SELECT phân tích đang chạy dở, toàn bộ các lệnh đọc và ghi phát sinh sau đó trên bảng sẽ phải xếp hàng chờ đợi, gây tê liệt hệ thống gần như ngay lập tức.',
                  'Để ngăn chặn thảm họa này, chúng tôi bắt buộc phải cấu hình biến lock_timeout nghiêm ngặt (ví dụ: 2s) trong mỗi transaction migration.',
                ],
                code: {
                  language: 'sql',
                  snippet: CODE_SNIPPET_POSTGRES,
                },
              },
              {
                heading: '2. Đánh chỉ mục hàng triệu bản ghi với CREATE INDEX CONCURRENTLY',
                body: [
                  'Cách tạo index thông thường sẽ khóa bảng ngăn chặn toàn bộ thao tác ghi cho đến khi index tạo xong. Lệnh CREATE INDEX CONCURRENTLY quét bảng 2 lần và xây dựng index hoàn toàn ngầm mà không hề chặn các thao tác INSERT, UPDATE hay DELETE của người dùng.',
                  'Nếu tiến trình concurrent build bị lỗi do trùng lặp dữ liệu, nó sẽ để lại một index ở trạng thái INVALID cần được drop và xử lý trước khi chạy lại pipeline.',
                ],
              },
              {
                heading: '3. Chiến lược thêm cột an toàn và quy trình thu gọn lược đồ',
                body: [
                  'Từ PostgreSQL 11+, việc thêm một cột mới với giá trị DEFAULT hằng số là một thao tác cập nhật metadata tức thì (instant metadata operation). Chúng tôi tuân thủ quy trình đổi schema nhiều giai đoạn: mở rộng schema trước, deploy mã nguồn tương thích cả hai phiên bản, và chỉ xóa các cột cũ sau khi đã xác thực an toàn tuyệt đối.',
                ],
              },
            ],
          },
        },
        {
          slug: 'event-driven-iot-spring-boot',
          title: 'Xây dựng kiến trúc xử lý luồng dữ liệu IoT hướng sự kiện: Từ Broker MQTT đến Reactive Workers',
          date: '07/2025',
          readTime: '7 PHÚT ĐỌC',
          summary:
            'Thiết kế cổng thu thập telemetry tại biên có khả năng chịu lỗi cao, xử lý hơn 10.000 tín hiệu cảm biến mỗi phút với cơ chế Backpressure và mẫu thiết kế Transactional Outbox.',
          tags: ['IoT', 'Spring Boot', 'Kiến trúc hệ thống', 'Kafka'],
          content: {
            lead: 'Các thiết bị cảm biến ngoài hiện trường thường xuyên mất kết nối, tái kết nối đồng loạt theo từng đợt sóng lớn và gửi dữ liệu dồn ứ bất thường. Dưới đây là cách chúng tôi xây dựng đường ống tiếp nhận dữ liệu hướng sự kiện bằng Spring Boot để hấp thụ biến động lưu lượng một cách bền bỉ.',
            sections: [
              {
                heading: '1. Kiểm soát các đợt sóng tái kết nối đồng loạt',
                body: [
                  'Khi các trạm phát sóng di động 4G tại địa phương phục hồi sau sự cố chập chờn, hàng nghìn cảm biến thùng rác thông minh đồng loạt kết nối lại và đẩy dữ liệu tích lũy. Các endpoint REST đồng bộ thông thường sẽ sập ngay tức khắc.',
                  'Chúng tôi phân tách cổng nhận dữ liệu qua cầu nối broker MQTT nạp vào hàng đợi reactive trong Spring Boot, áp dụng cơ chế Backpressure để đệm các xung lưu lượng mà không đánh rơi bất kỳ gói tin nào.',
                ],
                code: {
                  language: 'java',
                  snippet: CODE_SNIPPET_IOT,
                },
              },
              {
                heading: '2. Đảm bảo ngữ nghĩa Exactly-Once với cơ chế nạp bất biến (Idempotent)',
                body: [
                  'Do đường truyền mạng tại biên không ổn định hay gửi lại gói tin, dữ liệu thường xuyên bị duplicate. Chúng tôi sử dụng định danh xác định UUIDv5 sinh từ ID thiết bị, timestamp và số sequence của phép đo.',
                  'Bộ lọc Redis Bloom filter kết hợp ràng buộc UNIQUE trên PostgreSQL giúp loại bỏ trùng lặp trong chưa đầy 0.8ms mà không gây deadlock database.',
                ],
              },
              {
                heading: '3. Bảo toàn dữ liệu với Transactional Outbox Pattern',
                body: [
                  'Để đồng bộ trạng thái giữa thiết bị biên và các worker phân tích dữ liệu, các thao tác ghi DB và phát sự kiện được bọc nguyên tử trong bảng transactional outbox, đảm bảo tính nhất quán cuối cùng trên toàn bộ dashboard giám sát.',
                ],
              },
            ],
          },
        },
      ],
    },
    contact: {
      tag: '05 - LIÊN HỆ',
      title: 'Cùng nhau',
      titleSub: 'xây dựng sản phẩm.',
      desc: 'Sẵn sàng tiếp nhận các cơ hội việc làm toàn thời gian, dự án freelance và hợp tác công nghệ. Hiện đang sinh sống và làm việc tại TP. Hồ Chí Minh, Việt Nam.',
      emailLabel: 'EMAIL CỦA BẠN',
      msgLabel: 'LỜI NHẮN',
      sendBtn: 'GỬI TIN NHẮN →',
      sendingBtn: 'ĐANG GỬI...',
      successMsg: '✓ Đã gửi tin nhắn! Cảm ơn bạn, tôi sẽ phản hồi lại email sớm nhất.',
      errorMsg: 'Lỗi kết nối. Vui lòng gửi email trực tiếp qua nhatprx@gmail.com.',
    },
    footer: {
      rights: 'Bảo lưu mọi quyền.',
      edition: 'Phiên bản Đơn sắc Tối giản',
    },
  },

  // ==========================================
  // FRENCH
  // ==========================================
  fr: {
    label: 'Français',
    nav: {
      liveLab: 'SERVEUR EN DIRECT',
      about: 'À PROPOS',
      skills: 'COMPÉTENCES',
      experience: 'EXPÉRIENCE',
      projects: 'PROJETS',
      blog: 'BLOG',
      contact: 'CONTACT',
    },
    hero: {
      role: 'INGÉNIEUR LOGICIEL',
      desc: 'Conception de systèmes backend résilients, rétro-ingénierie de protocoles clients et montée en charge des infrastructures cloud modernes.',
      getInTouch: 'ME CONTACTER',
      resume: 'TÉLÉCHARGER CV',
    },
    server: {
      tag: 'TÉLÉMÉTRIE EN DIRECT',
      title: 'Le vrai serveur.',
      titleSub: 'Testez-le.',
      desc: "Vous interagissez directement avec le vrai serveur Linux hébergeant ce portfolio. Explorez les conteneurs et les métriques système - c'est un bac à sable sécurisé en lecture seule.",
    },
    about: {
      tag: '01 - À PROPOS',
      title: 'Concevoir des systèmes',
      titleSub: 'performants et fiables.',
      p1: "Ingénieur logiciel autonome sur l'ensemble du cycle de développement, de la conception architecturale au déploiement en production. Expérience éprouvée en architecture backend, cloud et intégration chez Grevo Solutions et Amazon Web Services.",
      p2: 'Solide maîtrise de la programmation orientée objet (OOP), des principes SOLID et de la conception d’API RESTful. Pratique des pipelines CI/CD (Jenkins) et des déploiements conteneurisés (Docker, Google Cloud Run). Connaissance approfondie du framework AWS Well-Architected.',
      educationTitle: 'FORMATION',
      languagesTitle: 'LANGUES MAÎTRISÉES',
      edu1School: 'Université FPT',
      edu1Degree: "LICENCE D'INGÉNIERIE",
      edu1Major: 'Informatique · Sept 2022 - Présent',
      edu1Dates: 'Hô Chi Minh-Ville, Vietnam',
      edu1Location: 'Hô Chi Minh-Ville, Vietnam',
      edu2School: 'Multimedia University',
      edu2Degree: "PROGRAMME D'ÉCHANGE ÉTUDIANT",
      edu2Major: 'Communication Interpersonnelle · Jan - Avr 2023',
      edu2Dates: 'Cyberjaya, Malaisie',
      edu2Location: 'Cyberjaya, Malaisie',
      languages: ['Anglais (Courant)', 'Vietnamien (Langue maternelle)', 'Japonais (Notions)', 'Français (Familier)'],
    },
    experience: {
      tag: '03 - EXPÉRIENCE & PROJETS',
      title: 'Parcours',
      titleSub: 'professionnel.',
      desc: 'Rôles d’ingénierie couvrant l’infrastructure cloud, le SaaS d’entreprise et l’IoT edge — axés sur la résilience backend et l’évolutivité distribuée.',
      items: [
        {
          role: 'Stagiaire Infrastructure Cloud',
          company: 'AMAZON WEB SERVICES (AWS) · Hô Chi Minh-Ville · Sur site',
          period: 'JANV - AOÛT 2026',
          summary:
            'Contribution à la conception et à l’optimisation de l’infrastructure cloud pour une application web SaaS sur AWS, de l’évaluation architecturale à la réduction des coûts.',
          bullets: [
            'Recherche et recommandation de patterns d’architecture AWS adaptés à des charges de plusieurs dizaines de milliers de requêtes quotidiennes',
            'Participation aux décisions d’architecture et à la mise en œuvre technique de l’application SaaS',
            'Déploiement du monitoring et des métriques avec CloudWatch pour la détection proactive des goulots d’étranglement',
            'Optimisation du dimensionnement EC2, du cache et du stockage, permettant une réduction de ~17% de la facture cloud',
          ],
          tech: ['EC2', 'S3', 'CloudFront', 'RDS', 'Lambda', 'API Gateway', 'ElastiCache (Redis)', 'ALB', 'CloudWatch'],
        },
        {
          role: 'Ingénieur Fondateur & Chef de Projet',
          company: 'GREVO SOLUTIONS · Hô Chi Minh-Ville · Sur site',
          period: 'MARS 2025 - JANV 2026',
          summary:
            'Direction de la conception et du déploiement d’une plateforme intelligente de gestion des déchets, en tant qu’ingénieur référent sur l’architecture et l’intégration IoT.',
          bullets: [
            'Conception de l’architecture globale reliant capteurs IoT matériels, backend cloud et tableaux de bord multi-tenants',
            'Déploiement d’une plateforme de production pour un client en Malaisie sur AWS, associant dispositifs IoT à une stack Spring Boot et React',
            'Développement d’API RESTful performantes avec Spring Boot et optimisation des schémas PostgreSQL et Redis',
            'Gestion des pipelines de déploiement continu avec Docker, Jenkins CI/CD et Google Cloud Run',
          ],
          tech: ['Spring Boot', 'Java 21', 'ReactJS', 'PostgreSQL', 'Redis', 'Docker', 'Google Cloud Run', 'Jenkins', 'IoT'],
        },
        {
          role: 'Équipe Technique · Opérations Événementielles',
          company: 'FPT EDUCATION · Hô Chi Minh-Ville · Sur site',
          period: 'JANV 2023 - AOÛT 2024',
          summary:
            'Support technique et opérationnel pour les événements universitaires de grande envergure et les programmes étudiants.',
          bullets: [
            'Gestion de l’infrastructure technique (réseaux, audiovisuel, livestreaming) pour des événements de plus de 1 000 participants',
            'Coordination d’événements majeurs dont F-Camp 2023 - récompensé parmi les 20 meilleurs contributeurs de l’organisation',
          ],
          tech: [],
        },
      ],
    },
    projects: {
      tag: '03 - EXPÉRIENCE & PROJETS',
      title: 'Systèmes conçus et',
      titleSub: 'déployés en production.',
      desc: 'Systèmes de production, frameworks d’automatisation et architectures cloud évolutives — conçus pour la haute concurrence et la basse latence.',
      items: [
        {
          title: 'LordNine Bot · Automation Framework',
          meta: 'DÉVELOPPEUR UNIQUE · 34 VERSIONS EN PRODUCTION',
          period: 'MARS - AVRIL 2026',
          desc: 'Framework d’automatisation MMORPG haute performance, rétro-conçu pour une concurrence extrême sur du matériel grand public.',
          bullets: [
            'Remplacement de Playwright par un client CDP personnalisé, réduisant la mémoire par instance de ~100 Mo à ~1 Ko - permettant plus de 100 sessions simultanées',
            'Implémentation d’une boucle AIMD adaptive (150ms-800ms) et fusion des files d’attente GUI, diminuant l’utilisation CPU de ~90%',
            'Création d’un écosystème SaaS complet : licences liées au HWID, mises à jour automatiques vérifiées par SHA256 et installeur Windows - 34 versions publiées en 2 mois',
          ],
          tech: ['Python 3.13', 'OpenCV', 'CDP (DevTools)', 'SQLite', 'CustomTkinter'],
          repoUrl: 'https://github.com/nhatprx',
        },
        {
          title: 'Attenda · Smart Attendance System',
          meta: "CHEF D'ÉQUIPE · ÉQUIPE DE 4 PERSONNES",
          period: 'MARS - AOÛT 2025',
          desc: 'Direction d’une équipe de 4 personnes pour concevoir un système de pointage biométrique universitaire combinant matériel ESP32-S3 et dashboard cloud.',
          bullets: [
            'Conception du boîtier biométrique ESP32-S3 avec capteur d’empreinte et reconnaissance faciale TensorFlow sur puce (précision ~95%, latence <1.5s)',
            'Développement du tableau de bord React + TypeScript pour 1 000+ étudiants et backend Python/PostgreSQL traitant 500+ émargements quotidiens',
          ],
          tech: ['ESP32-S3', 'TensorFlow', 'React', 'TypeScript', 'Python', 'Gunicorn', 'PostgreSQL'],
          repoUrl: 'https://github.com/nhatprx',
        },
        {
          title: 'Grevo WasteNet · Multi-Tenant Platform',
          meta: 'PROJECT LEAD · PRODUCTION CLOUD',
          period: 'MAR 2025 - JAN 2026',
          desc: 'Enterprise multi-tenant IoT platform on AWS integrating edge sensors with Spring Boot microservices and React dashboards.',
          bullets: [
            'Architected end-to-end cloud infrastructure on AWS for enterprise client, connecting 50+ smart bin clusters to centralized Spring Boot microservices',
            'Built high-throughput telemetry ingestion pipeline handling 10,000+ MQTT sensor signals/min with zero packet loss using Redis and PostgreSQL',
            'Deployed containerized microservices via Jenkins CI/CD pipelines to Google Cloud Run and AWS EC2 with automated health checks',
          ],
          tech: ['Spring Boot', 'Java 21', 'React', 'PostgreSQL', 'Redis', 'Docker', 'Jenkins', 'AWS', 'MQTT'],
          repoUrl: 'https://github.com/nhatprx',
        },
      ],
    },
    skills: {
      tag: '02 - STACK TECHNIQUE',
      title: 'Stack',
      titleSub: 'technique.',
      desc: 'Outils sélectionnés, langages de production, backends cloud et architectures éprouvés sur des systèmes distribués.',
      categories: [
        {
          title: 'LANGAGES',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['JavaScript', 'Java', 'Python'],
        },
        {
          title: 'FRAMEWORKS',
          gridClass: 'grid grid-cols-2 gap-2',
          skills: ['Spring Boot', 'ReactJS', 'NodeJS', 'ThreeJS'],
        },
        {
          title: 'BASES DE DONNÉES',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['PostgreSQL', 'MySQL', 'Redis'],
        },
        {
          title: 'DEVOPS & CLOUD',
          gridClass: 'grid grid-cols-2 gap-2',
          skills: ['AWS (EC2, S3, Lambda)', 'Google Cloud Run', 'Docker', 'Jenkins', 'Vercel', 'Render', 'Railway', 'Git'],
        },
        {
          title: 'ARCHITECTURE SYSTÈME',
          gridClass: 'grid grid-cols-1 gap-2',
          skills: [
            'Principes OOP & SOLID',
            "Conception d'API RESTful",
            'Pipelines CI/CD (Jenkins)',
            'Déploiements Conteneurisés (Docker, Cloud Run)',
            'Framework AWS Well-Architected',
          ],
        },
      ],
    },
    blog: {
      tag: '04 - BLOG',
      title: 'Notes',
      titleSub: "d'ingénierie.",
      desc: 'Analyses techniques approfondies et compromis d’architecture issus de la production logicielle et des systèmes distribués.',
      readNote: "LIRE L'ARTICLE →",
      backToPortfolio: '← RETOUR AU PORTFOLIO',
      modalNoteLabel: "NOTE D'INGÉNIERIE",
      modalClose: 'FERMER',
      modalOtherNotes: "AUTRES NOTES D'INGÉNIERIE",
      modalReadInModal: 'LIRE DANS LA FENÊTRE →',
      posts: [
        {
          slug: 'cdp-vs-playwright-automation',
          title: "Rétro-ingénierie d'automatisation MMORPG : Pourquoi le CDP surpasse Playwright de 10 000%",
          date: 'AVRIL 2026',
          readTime: '6 MIN DE LECTURE',
          summary:
            "Comment la dissection des mécanismes internes des navigateurs sans tête et l'abandon de WebDriver au profit de sockets bruts Chrome DevTools Protocol ont fait chuter la mémoire par instance de ~100 Mo à ~1 Ko.",
          tags: ['Python', 'CDP', 'Rétro-ingénierie', 'Optimisation'],
          content: {
            lead: "Début 2026, lors du développement d'un framework d'automatisation MMORPG (LordNine Bot), les outils traditionnels ont atteint un mur mémoire infranchissable. Voici comment l'utilisation directe du Chrome DevTools Protocol (CDP) a tout changé.",
            sections: [
              {
                heading: '1. Le problème : La surcharge de 100 Mo par instance',
                body: [
                  "Chaque contexte Playwright ou Puppeteer génère des bindings Node, des files d'attente IPC et des bacs à sable Chromium consommant facilement 80 à 120 Mo par thread. Sur une machine 16 Go de RAM, exécuter plus de 40 émulateurs causait un écroulement immédiat de l'OS.",
                  'De plus, les frameworks conventionnels laissent des signatures repérables (navigator.webdriver, flags) déclenchant les sanctions anti-triche.',
                ],
              },
              {
                heading: '2. La solution : WebSockets bruts et Protocole CDP',
                body: [
                  "Plutôt que d'orchestrer des navigateurs complets, nous avons connecté nos scripts directement via WebSockets asynchrones au port de débogage natif du protocole Chrome DevTools.",
                  'En forgeant les messages JSON-RPC 2.0 à la main, l’empreinte mémoire est passée de ~100 Mo à seulement ~1 Ko par session active.',
                ],
                code: {
                  language: 'python',
                  snippet: CODE_SNIPPET_PYTHON,
                },
              },
              {
                heading: '3. Ordonnancement adaptatif AIMD',
                body: [
                  "L'envoi de captures à 60 FPS saturait les bus mémoire. Nous avons mis en place une régulation AIMD : l'intervalle s'étend de 150ms à 800ms lorsqu'aucune action n'est requise, réduisant l'utilisation CPU en tâche de fond de ~90%.",
                ],
              },
              {
                heading: '4. Résultats et impact en production',
                body: [
                  'Ce framework a alimenté 34 versions commerciales en 2 mois. Plus de 100 comptes peuvent tourner simultanément sur un CPU 4 cœurs standard avec mises à jour sécurisées SHA256.',
                ],
              },
            ],
          },
        },
        {
          slug: 'edge-cloud-biometric-esp32',
          title: 'Conception d’un système biométrique Edge-Cloud avec ESP32-S3 et TensorFlow',
          date: 'AOÛT 2025',
          readTime: '5 MIN DE LECTURE',
          summary:
            'Compromis architecturaux entre reconnaissance faciale sur microcontrôleur embarqué et délégation au cloud : latence, confidentialité et synchronisation PostgreSQL hors ligne.',
          tags: ['IoT', 'ESP32-S3', 'TensorFlow', 'PostgreSQL'],
          content: {
            lead: "Les systèmes d'émargement universitaire subissent souvent des files d'attente et des coupures réseau. Avec Attenda, nous avons conçu une architecture biométrique où l'inférence se fait directement sur puce ESP32-S3.",
            sections: [
              {
                heading: '1. Pourquoi l’Edge Computing pour la biométrie ?',
                body: [
                  'Diffuser les flux vidéo bruts de plus de 30 salles vers un serveur central monopolise la bande passante et pose des risques majeurs de sécurité des données privées.',
                  'En réalisant l’extraction de caractéristiques directement sur l’ESP32-S3, nous n’émettons que des vecteurs de 512 dimensions, supprimant les images brutes dès le capteur.',
                ],
              },
              {
                heading: '2. Optimisation d’inférence sur silicium contraint',
                body: [
                  'Grâce à TensorFlow Lite for Microcontrollers et une quantification INT8, le modèle a été réduit à moins de 1.8 Mo, s’exécutant en 1.2s - 1.4s par étudiant avec 95%+ de précision.',
                ],
                code: {
                  language: 'c',
                  snippet: CODE_SNIPPET_C,
                },
              },
              {
                heading: '3. Résilience hors ligne et réconciliation PostgreSQL',
                body: [
                  'En cas de coupure Wi-Fi, les logs sont écrits sur la mémoire flash SPI interne puis transmis par lots au backend Python/PostgreSQL avec clés d’idempotence dès le rétablissement.',
                ],
              },
            ],
          },
        },
        {
          slug: 'aws-microservice-docker-isolation',
          title: 'Retours d’expérience sur le déploiement de microservices multi-tenants et l’isolation Docker sur AWS',
          date: 'JANV 2026',
          readTime: '7 MIN DE LECTURE',
          summary:
            'Enseignements clés sur le VPC Peering, le durcissement des conteneurs et la réduction des coûts de transfert sortant dans une infrastructure cloud de production.',
          tags: ['AWS', 'Docker', 'DevOps', 'Architecture'],
          content: {
            lead: 'Exploiter des microservices multi-tenants en production impose des frontières strictes d’isolation et de latence réseau. Voici nos enseignements techniques sur AWS.',
            sections: [
              {
                heading: '1. Défense en profondeur : Au-delà des paramètres Docker standards',
                body: [
                  'En production, nous imposons un système de fichiers racine en lecture seule (read-only rootfs), supprimons toutes les capacités Linux (cap-drop: ALL) sauf la liaison réseau, et isolons les nœuds dans des sous-réseaux privés.',
                ],
                code: {
                  language: 'yaml',
                  snippet: CODE_SNIPPET_YAML,
                },
              },
              {
                heading: '2. Économie sur le trafic sortant via VPC Endpoints',
                body: [
                  'L’utilisation de VPC Endpoints Gateway pour le trafic S3 et DynamoDB évite la traversée coûteuse des NAT Gateways, réduisant la latence de 40% et éliminant les frais au Go.',
                ],
              },
              {
                heading: '3. Health Checks et arrêt gracieux (SIGTERM)',
                body: [
                  'Une temporisation de 15 secondes pour le SIGTERM combinée au draining de l’ALB garantit que toutes les requêtes en vol se terminent sans interruption de service.',
                ],
              },
            ],
          },
        },
        {
          slug: 'redis-cache-stampede-mitigation',
          title: 'Atténuation des Cache Stampedes : Expiration probabiliste anticipée (XFetch) vs Verrous Redis',
          date: 'FÉVR 2026',
          readTime: '5 MIN DE LECTURE',
          summary:
            'Comment nous avons résolu les problèmes de thundering herd sous forte charge dans Spring Boot grâce à l’algorithme probabiliste XFetch, réduisant les pics de latence P99 de 84%.',
          tags: ['Redis', 'Spring Boot', 'Systèmes Distribués', 'Caching'],
          content: {
            lead: 'Lorsqu’une clé de cache à fort trafic expire, des milliers de requêtes concurrentes interrogent simultanément la base de données. Voici notre comparatif entre verrous distribués et expiration probabiliste anticipée.',
            sections: [
              {
                heading: '1. Le problème du Thundering Herd',
                body: [
                  'Dans notre backend multi-tenant, les clés de catalogue expiraient aux heures de pointe, provoquant des tempêtes de requêtes concurrentes qui saturaient le pool de connexions SQL.',
                ],
              },
              {
                heading: '2. Algorithme XFetch et rafraîchissement anticipé',
                body: [
                  'Au lieu d’attendre l’expiration totale du TTL, l’algorithme XFetch régénère le cache en arrière-plan avec une probabilité proportionnelle au temps restant et au coût de calcul de la donnée.',
                ],
                code: {
                  language: 'java',
                  snippet: CODE_SNIPPET_REDIS,
                },
              },
              {
                heading: '3. Résultats en production',
                body: [
                  'Sous un banc d’essai à 8 000 req/s, la latence P99 est passée de 1 420 ms à 220 ms (-84%) avec une charge CPU stabilisée à 28%.',
                ],
              },
            ],
          },
        },
        {
          slug: 'zero-downtime-postgres-migrations',
          title: 'Migrations de schéma PostgreSQL sans interruption (Zero-Downtime) sur tables volumineuses',
          date: 'NOV 2025',
          readTime: '6 MIN DE LECTURE',
          summary:
            'Guide pratique sur l’ajout sécurisé de colonnes, les verrous lock_timeout, la création d’index concurrents (CREATE INDEX CONCURRENTLY) et la prévention des blocages en production.',
          tags: ['PostgreSQL', 'Base de données', 'DevOps', 'Fiabilité'],
          content: {
            lead: 'Exécuter un ALTER TABLE en préproduction prend quelques millisecondes. En production sous fort trafic, la même commande peut poser un verrou exclusif et saturer les pools de connexion.',
            sections: [
              {
                heading: '1. Risques des files d’attente de verrous',
                body: [
                  'PostgreSQL traitant les verrous selon une file FIFO, une requête lente bloque l’ALTER TABLE qui bloque à son tour toutes les lectures/écritures suivantes. Configurer un lock_timeout de 2s est indispensable.',
                ],
                code: {
                  language: 'sql',
                  snippet: CODE_SNIPPET_POSTGRES,
                },
              },
              {
                heading: '2. Indexation concurrente sans blocage',
                body: [
                  'La commande CREATE INDEX CONCURRENTLY analyse la table en deux passes et construit l’index sans jamais interdire les opérations d’écriture clientes.',
                ],
              },
              {
                heading: '3. Stratégie multi-étapes',
                body: [
                  'Nous appliquons le pattern Expand & Contract pour garantir la rétrocompatibilité continue entre schémas de base de données et versions d’application.',
                ],
              },
            ],
          },
        },
        {
          slug: 'event-driven-iot-spring-boot',
          title: 'Conception de pipelines d’ingestion IoT événementiels : De MQTT aux Reactive Workers',
          date: 'JUIL 2025',
          readTime: '7 MIN DE LECTURE',
          summary:
            'Architecture d’une passerelle télémétrique tolérante aux pannes absorbant 10 000+ battements de cœur par minute sans aucune perte de message grâce au backpressure et au pattern outbox.',
          tags: ['IoT', 'Spring Boot', 'Architecture', 'Kafka'],
          content: {
            lead: 'Les capteurs IoT sur le terrain se reconnectent souvent par vagues massives. Voici comment nous avons conçu une ingestion réactive sous Spring Boot capable d’absorber ces chocs.',
            sections: [
              {
                heading: '1. Absorption des vagues de reconnexion',
                body: [
                  'Les flux de capteurs transitent par un broker MQTT connecté à des workers réactifs Spring Boot dotés de backpressure pour amortir les pointes sans perte.',
                ],
                code: {
                  language: 'java',
                  snippet: CODE_SNIPPET_IOT,
                },
              },
              {
                heading: '2. Sémantique Exactly-Once et idempotence',
                body: [
                  'Les identifiants déterministes UUIDv5 et les filtres de Bloom Redis permettent de dédupliquer les trames réseau en moins de 0,8 ms.',
                ],
              },
              {
                heading: '3. Garantie de livraison via Transactional Outbox',
                body: [
                  'Les événements sont enregistrés atomiquement avec les mutations de base de données, garantissant la cohérence globale des métriques analytiques.',
                ],
              },
            ],
          },
        },
      ],
    },
    contact: {
      tag: '05 - CONTACT',
      title: 'Créons ensemble',
      titleSub: 'des projets durables.',
      desc: 'Disponible pour des opportunités d’ingénierie à temps plein, missions freelance et collaborations techniques. Actuellement basé à Hô Chi Minh-Ville, Vietnam.',
      emailLabel: 'VOTRE EMAIL',
      msgLabel: 'VOTRE MESSAGE',
      sendBtn: 'ENVOYER LE MESSAGE →',
      sendingBtn: 'ENVOI EN COURS...',
      successMsg: '✓ Message envoyé avec succès ! Je vous répondrai rapidement.',
      errorMsg: 'Erreur réseau. Veuillez me contacter par email à nhatprx@gmail.com.',
    },
    footer: {
      rights: 'Tous droits réservés.',
      edition: 'Édition Monochrome Minimaliste',
    },
  },

  // ==========================================
  // JAPANESE
  // ==========================================
  ja: {
    label: '日本語',
    nav: {
      liveLab: '実機サーバー',
      about: '概要',
      skills: 'スキル',
      experience: '職務経歴',
      projects: '実績',
      blog: '技術ノート',
      contact: 'お問い合わせ',
    },
    hero: {
      role: 'ソフトウェアエンジニア',
      desc: '耐障害性に優れたバックエンドの構築、クライアントプロトコルのリバースエンジニアリング、高負荷分散クラウド基盤の最適化に従事。',
      getInTouch: 'お問い合わせ',
      resume: '履歴書をダウンロード',
    },
    server: {
      tag: 'リアルタイム稼働状況',
      title: '本番サーバー環境',
      titleSub: '実際に確認してください。',
      desc: 'このポートフォリオサイトを実際にホストしているLinux実機サーバーに直接接続されています。内部プロセスやメモリ、稼働コンテナを自由にご確認いただけます（安全な読み取り専用環境です）。',
    },
    about: {
      tag: '01 - プロフィール',
      title: 'スケーラブルな',
      titleSub: 'システムを創る。',
      p1: 'アーキテクチャ設計から本番運用まで、機能開発をエンドツーエンドで完結できるソフトウェアエンジニア。Grevo Solutionsでのプロダクト開発やAmazon Web Servicesでのクラウド設計経験を有し、信頼性の高いシステムを構築してきました。',
      p2: 'オブジェクト指向（OOP）やSOLID原則、RESTful API設計に精通。Jenkinsを用いたCI/CD自動化やコンテナデプロイ（Docker, Google Cloud Run）の実践経験が豊富。AWS Well-Architectedフレームワークに基づき、セキュリティと高可用性を徹底追求。',
      educationTitle: '学歴',
      languagesTitle: '語学能力',
      edu1School: 'FPT大学',
      edu1Degree: '工学士（コンピュータサイエンス）',
      edu1Major: 'コンピュータサイエンス専攻 · 2022年9月 - 在学中',
      edu1Dates: 'ベトナム・ホーチミン市',
      edu1Location: 'ベトナム・ホーチミン市',
      edu2School: 'マルチメディア大学',
      edu2Degree: '交換留学プログラム',
      edu2Major: '異文化間コミュニケーション · 2023年1月 - 4月',
      edu2Dates: 'マレーシア・サイバージャヤ',
      edu2Location: 'マレーシア・サイバージャヤ',
      languages: ['英語 (流暢)', 'ベトナム語 (母国語)', '日本語 (基礎)', 'フランス語 (初級)'],
    },
    experience: {
      tag: '03 - 経歴 & プロジェクト',
      title: 'これまでの',
      titleSub: '開発・参画実績。',
      desc: 'クラウド基盤、企業向けSaaS、IoTエッジ連携の実務経歴 — バックエンドの耐障害性と分散システムの拡張性を追求。',
      items: [
        {
          role: 'クラウドインフラ・インターン',
          company: 'AMAZON WEB SERVICES (AWS) · ホーチミン市 · オンサイト',
          period: '2026年1月 - 8月',
          summary:
            'AWS上でのサブスクリプション型Webアプリケーションのクラウド基盤設計・最適化に参画。アーキテクチャ評価から実装、コスト削減までを担当。',
          bullets: [
            '1日数万リクエスト規模のワークロードに最適化したAWSアーキテクチャパターンの調査・設計提案',
            'サブスクリプション型Webアプリケーションの基盤選定および実装への直接参画',
            'CloudWatchを用いた統合監視・オブザーバビリティの構築によるパフォーマンスボトルネックの早期検知',
            'EC2サイジング、キャッシュ戦略、ストレージ構成の最適化を実施し、クラウド利用コストの約17%削減に貢献',
          ],
          tech: ['EC2', 'S3', 'CloudFront', 'RDS', 'Lambda', 'API Gateway', 'ElastiCache (Redis)', 'ALB', 'CloudWatch'],
        },
        {
          role: '創業エンジニア & プロジェクトリード',
          company: 'GREVO SOLUTIONS · ホーチミン市 · オンサイト',
          period: '2025年3月 - 2026年1月',
          summary:
            'スマート廃棄物管理プラットフォームの設計・提供をリード。システム全体のアーキテクチャ、IoTエッジ連携、開発進行を統括。',
          bullets: [
            'エッジハードウェア、クラウドバックエンド、マルチテナント管理ダッシュボードを統合する全体構造を設計',
            'マレーシアのクライアント向けにAWS上で本番運用されるIoTプラットフォームを提供（Spring BootおよびReact構成）',
            'Spring Bootによる高効率なRESTful API開発、PostgreSQLとRedisを組み合わせたデータ設計の最適化',
            'Docker、Jenkins CI/CD、Google Cloud Runを用いたゼロダウンタイム本番デプロイ自動化',
          ],
          tech: ['Spring Boot', 'Java 21', 'ReactJS', 'PostgreSQL', 'Redis', 'Docker', 'Google Cloud Run', 'Jenkins', 'IoT'],
        },
        {
          role: '技術スタッフ · イベント運営',
          company: 'FPT EDUCATION · ホーチミン市 · オンサイト',
          period: '2023年1月 - 2024年8月',
          summary:
            '大学主催の大規模イベント、技術ワークショップ、学生支援プログラムにおける技術基盤および運用統括を担当。',
          bullets: [
            '1,000名以上が参加する全学規模イベントの技術基盤（ネットワーク、音響・映像、ライブ配信）を運用管理',
            'F-Camp 2023などの主要行事を統括し、組織内トップ20の優秀貢献者として表彰',
          ],
          tech: [],
        },
      ],
    },
    projects: {
      tag: '03 - 経歴 & プロジェクト',
      title: '設計・構築を手がけた',
      titleSub: '主要システム。',
      desc: '本番分散システム、リバースエンジニアリング自動化フレームワーク、高並列クラウド基盤 — 低レイテンシと極限の並列処理を追求。',
      items: [
        {
          title: 'LordNine Bot · Automation Framework',
          meta: '単独開発 · 34回の本番商用リリース',
          period: '2026年3月 - 4月',
          desc: '高並列処理に特化してリバースエンジニアリングされた、一般PC上で軽快に動作するMMORPG自動化フレームワーク。',
          bullets: [
            'Playwrightを独自のChrome DevTools Protocolクライアントへ刷新し、1インスタンスあたりのメモリ消費を約100MBから約1KBに極小化。家庭用PCで100並列以上の同時実行を実現',
            'AIMD適応型スクリーンショットスケジューリング（150ms〜800ms）とGUIキュー集約により、UI描画に伴うCPU負荷を約90%削減',
            'HWIDバインド認証、SHA256ハッシュ検証付き自己アップデート、Windowsインストーラーを含む完全なSaaS運用基盤を構築（2ヶ月で34回リリース）',
          ],
          tech: ['Python 3.13', 'OpenCV', 'CDP (DevTools)', 'SQLite', 'CustomTkinter'],
          repoUrl: 'https://github.com/nhatprx',
        },
        {
          title: 'Attenda · Smart Attendance System',
          meta: 'チームリード · 4名チーム',
          period: '2025年3月 - 8月',
          desc: 'ESP32-S3エッジ端末とクラウド管理ダッシュボードを連携させた、大学向け高費用対効果スマート出席管理システム。',
          bullets: [
            '指紋センサーとESP32-S3を用いたエッジハードウェアを開発し、ローカル処理によりクラウド通信量を大幅削減。TensorFlow顔認証モデルを搭載し、精度約95%・認識遅延1.5秒未満を達成',
            '1,000名以上の学生情報をリアルタイム監視するReact + TypeScriptダッシュボードおよび日次500件以上の出席ログを処理するPython/PostgreSQLバックエンドを設計',
          ],
          tech: ['ESP32-S3', 'TensorFlow', 'React', 'TypeScript', 'Python', 'Gunicorn', 'PostgreSQL'],
          repoUrl: 'https://github.com/nhatprx',
        },
        {
          title: 'Grevo WasteNet · Multi-Tenant Platform',
          meta: 'PROJECT LEAD · PRODUCTION CLOUD',
          period: 'MAR 2025 - JAN 2026',
          desc: 'Enterprise multi-tenant IoT platform on AWS integrating edge sensors with Spring Boot microservices and React dashboards.',
          bullets: [
            'Architected end-to-end cloud infrastructure on AWS for enterprise client, connecting 50+ smart bin clusters to centralized Spring Boot microservices',
            'Built high-throughput telemetry ingestion pipeline handling 10,000+ MQTT sensor signals/min with zero packet loss using Redis and PostgreSQL',
            'Deployed containerized microservices via Jenkins CI/CD pipelines to Google Cloud Run and AWS EC2 with automated health checks',
          ],
          tech: ['Spring Boot', 'Java 21', 'React', 'PostgreSQL', 'Redis', 'Docker', 'Jenkins', 'AWS', 'MQTT'],
          repoUrl: 'https://github.com/nhatprx',
        },
      ],
    },
    skills: {
      tag: '02 - 技術スタック',
      title: '技術',
      titleSub: 'スタック。',
      desc: '分散システムの実践で培った、厳選されたツール、言語、クラウド基盤、アーキテクチャパターン。',
      categories: [
        {
          title: 'プログラミング言語',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['JavaScript', 'Java', 'Python'],
        },
        {
          title: 'フレームワーク',
          gridClass: 'grid grid-cols-2 gap-2',
          skills: ['Spring Boot', 'ReactJS', 'NodeJS', 'ThreeJS'],
        },
        {
          title: 'データベース',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['PostgreSQL', 'MySQL', 'Redis'],
        },
        {
          title: 'DEVOPS & クラウド',
          gridClass: 'grid grid-cols-2 gap-2',
          skills: ['AWS (EC2, S3, Lambda)', 'Google Cloud Run', 'Docker', 'Jenkins', 'Vercel', 'Render', 'Railway', 'Git'],
        },
        {
          title: 'システムアーキテクチャ',
          gridClass: 'grid grid-cols-1 gap-2',
          skills: [
            'OOPおよびSOLID原則',
            'RESTful API設計',
            'CI/CDパイプライン (Jenkins)',
            'コンテナデプロイ (Docker, Cloud Run)',
            'AWS Well-Architectedフレームワーク',
          ],
        },
      ],
    },
    blog: {
      tag: '04 - ブログ',
      title: '技術',
      titleSub: 'ノート。',
      desc: '高負荷分散システムの本番運用から得たアーキテクチャの知見と技術的トレードオフの考察。',
      readNote: '記事を読む →',
      backToPortfolio: '← ポートフォリオに戻る',
      modalNoteLabel: '技術ノート',
      modalClose: '閉じる',
      modalOtherNotes: 'その他の技術ノート',
      modalReadInModal: 'モーダルで読む →',
      posts: [
        {
          slug: 'cdp-vs-playwright-automation',
          title: 'MMORPG自動化のリバースエンジニアリング：CDPがPlaywrightを100倍上回る理由',
          date: '2026年4月',
          readTime: '所要時間：約6分',
          summary:
            'ヘッドレスブラウザの内部構造を解析し、重厚なWebDriver抽象層を生のChrome DevTools Protocolソケットに置き換えることで、インスタンスあたりのメモリを100MBから1KBに削減した技術的アプローチ。',
          tags: ['Python', 'CDP', 'リバースエンジニアリング', '最適化'],
          content: {
            lead: '2026年初頭、MMORPGのエンタープライズ自動化フレームワーク（LordNine Bot）を開発するにあたり、SeleniumやPlaywrightなどのブラウザ自動化ツールはメモリ枯渇という決定的な壁に直面しました。生のChrome DevTools Protocol（CDP）WebSocketへ移行した全記録を解説します。',
            sections: [
              {
                heading: '1. 課題：インスタンスあたり100MBの巨大なオーバーヘッド',
                body: [
                  'PlaywrightやPuppeteerの各コンテキストはNodeバインディング、IPCキュー、Chromiumサンドボックスを起動するため、1スレッドあたり容易に80MB〜120MBを消費します。16GBメモリのPC上で40以上のインスタンスを並列実行すると、OOMクラッシュとCPU枯渇が発生します。',
                  'また、標準的な自動化フレームワークは特有の痕跡（navigator.webdriver等）を残すため、アンチチートに即座に検知される脆弱性がありました。',
                ],
              },
              {
                heading: '2. 解決策：生のCDP WebSocket接続とゼロアロケーション',
                body: [
                  '高レベルのラッパーを介さず、クライアントの実行時デバッグポートに生の非同期WebSocketで直接接続。必要なJSON-RPCメッセージのみを手作業で構築することで、メモリ消費を約100MBから1KBへと劇的に圧縮しました。',
                ],
                code: {
                  language: 'python',
                  snippet: CODE_SNIPPET_PYTHON,
                },
              },
              {
                heading: '3. AIMD適応型スケジューリングとキュー集約',
                body: [
                  'ネットワークが軽量化されても、毎秒60フレームの描画送信は帯域を圧迫します。メモリ変動がない間はキャプチャ間隔を150msから800msまで動的に広げるAIMD制御を実装し、CPU負荷を約90%カットしました。',
                ],
              },
              {
                heading: '4. 本番環境での成果',
                body: [
                  'このフレームワークにより、2ヶ月で34回リリースを達成。ミドルレンジの4コアCPU上で100アカウント以上の完全無人並列稼働を成功させました。',
                ],
              },
            ],
          },
        },
        {
          slug: 'edge-cloud-biometric-esp32',
          title: 'ESP32-S3とTensorFlowを用いたエッジ・クラウド生体認証システムの設計',
          date: '2025年8月',
          readTime: '所要時間：約5分',
          summary:
            'オンデバイス顔認識とクラウド処理のトレードオフ：レイテンシ最適化、プライバシー保護、オフライン時のPostgreSQL同期パイプライン。',
          tags: ['IoT', 'ESP32-S3', 'TensorFlow', 'PostgreSQL'],
          content: {
            lead: '大学の出席管理では、ピーク時の回線混雑やプライバシー懸念が問題となります。Attendaでは、ESP32-S3を用いたエッジファースト生体認証アーキテクチャを設計しました。',
            sections: [
              {
                heading: '1. なぜ生体認証にエッジコンピューティングが必要なのか？',
                body: [
                  '30以上の教室から生カメラ映像を中央サーバーにストリーミングすると莫大な帯域を浪費します。ESP32-S3上で直接特徴量抽出を行い、512次元のベクトルのみを送信することで、元画像をエッジ側で即時破棄します。',
                ],
              },
              {
                heading: '2. 制約のあるハードウェアでの推論最適化',
                body: [
                  'TensorFlow Lite for Microcontrollers（TFLM）とINT8量子化により、顔認識モデルを1.8MB未満に圧縮。1人あたり1.2秒〜1.4秒の高速推論と95%以上の精度を実現しました。',
                ],
                code: {
                  language: 'c',
                  snippet: CODE_SNIPPET_C,
                },
              },
              {
                heading: '3. オフラインキューイングとPostgreSQL同期',
                body: [
                  'Wi-Fi切断時はSPIフラッシュ上のリングバッファに出席データを記録。復旧時に冪等性キーを用いてPostgreSQLへ一括同期し、欠損ゼロを保証します。',
                ],
              },
            ],
          },
        },
        {
          slug: 'aws-microservice-docker-isolation',
          title: 'AWSマルチテナント・マイクロサービスデプロイとDocker分離の実践的知見',
          date: '2026年1月',
          readTime: '所要時間：約7分',
          summary:
            '本番環境におけるVPCピアリング、コンテナセキュリティ強化、およびデータ転送料金の最適化に関する実践知見。',
          tags: ['AWS', 'Docker', 'DevOps', 'アーキテクチャ'],
          content: {
            lead: 'マルチテナントのマイクロサービスを本番運用するには、分離性、レイテンシ、運用の平易さを両立させる必要があります。AWS上でのインフラ設計における知見をまとめました。',
            sections: [
              {
                heading: '1. 多層防御：Dockerデフォルト設定を超えて',
                body: [
                  '本番コンテナでは読み取り専用ルートファイルシステム（read-only rootfs）を強制し、不要なLinux機能を全削除（cap-drop: ALL）。非特権UID/GIDで安全に隔離します。',
                ],
                code: {
                  language: 'yaml',
                  snippet: CODE_SNIPPET_YAML,
                },
              },
              {
                heading: '2. VPCエンドポイントによるデータ転送費用の削減',
                body: [
                  'S3やDynamoDBへの通信をNAT Gateway経由からAWS Gateway VPC Endpointへ切り替えることで、レイテンシを40%削減し、ギガバイト単位の処理費用を完全に削減しました。',
                ],
              },
              {
                heading: '3. ヘルスチェックと安全なコネクションドレイン',
                body: [
                  'ローリングアップデート時のSIGTERM処理に15秒の猶予期間を設け、ALBコネクションドレインと連携させることで、通信中のリクエストを切断することなく安全に新旧入替を行います。',
                ],
              },
            ],
          },
        },
        {
          slug: 'redis-cache-stampede-mitigation',
          title: 'キャッシュスタンピード対策：Redisにおける確率的早期再計算（XFetch）と分散ロックの比較',
          date: '2026年2月',
          readTime: '所要時間：約5分',
          summary:
            'Spring Boot高負荷環境におけるThundering Herd問題をXFetch最適確率アルゴリズムによって解消し、DBのP99レイテンシを84%削減した検証記録。',
          tags: ['Redis', 'Spring Boot', '分散システム', 'キャッシュ'],
          content: {
            lead: '高トラフィックなキャッシュキーが失効すると、数千のリクエストが同時にキャッシュミスを起こし、後段のデータベースへ殺到します。分散ロックと確率的早期計算の設計比較を解説します。',
            sections: [
              {
                heading: '1. Thundering Herd（群集殺到）問題の本質',
                body: [
                  'マルチテナントSaaSにおいて、アクセス集中時間帯にカタログキャッシュがTTLを迎えると、秒間5,000クエリが同時に重い集計処理を実行し、DB接続プールが枯渇していました。',
                ],
              },
              {
                heading: '2. XFetchアルゴリズムによるバックグラウンド先行リフレッシュ',
                body: [
                  '厳密なTTL到達を待つのではなく、計算コストと残り時間に応じた確率関数に基づき、バックグラウンドスレッドがキー失効前に透過的に再計算を行います。',
                ],
                code: {
                  language: 'java',
                  snippet: CODE_SNIPPET_REDIS,
                },
              },
              {
                heading: '3. 本番負荷試験での検証結果',
                body: [
                  '秒間8,000リクエストの負荷試験において、P99応答時間は1,420msから220msへと84%激減し、CPU利用率は28%のフラットな推移に安定しました。',
                ],
              },
            ],
          },
        },
        {
          slug: 'zero-downtime-postgres-migrations',
          title: '高トラフィックPostgreSQLにおけるゼロダウンタイム・スキーマ移行の実践手法',
          date: '2025年11月',
          readTime: '所要時間：約6分',
          summary:
            '安全なカラム追加、lock_timeoutの設定、CREATE INDEX CONCURRENTLYによる非ブロッキングインデックス構築、本番障害を防ぐスキーマ設計ガイドライン。',
          tags: ['PostgreSQL', 'データベース', 'DevOps', '信頼性'],
          content: {
            lead: 'ステージング環境でのALTER TABLEは数ミリ秒で完了しますが、本番環境のアクセス集中下では排他ロックを獲得し、後続のすべてのクエリをキューに溜め込んでサービスダウンを引き起こします。',
            sections: [
              {
                heading: '1. ロック待ち行列によるカスケード障害',
                body: [
                  'PostgreSQLはロック要求をFIFOで処理するため、時間のかかるSELECT処理の後ろにALTER TABLEが並ぶと、後続のすべての読み書きが待たされます。これを防ぐため、移行トランザクションには必ずlock_timeout=2sを適用します。',
                ],
                code: {
                  language: 'sql',
                  snippet: CODE_SNIPPET_POSTGRES,
                },
              },
              {
                heading: '2. CREATE INDEX CONCURRENTLYによる無停止インデックス化',
                body: [
                  '通常のインデックス作成は書き込みを全停止しますが、CONCURRENTLY指定によりテーブルを2回走査し、ユーザーのCRUD処理を阻害することなく安全に構築できます。',
                ],
              },
              {
                heading: '3. Expand & Contract（拡張と縮退）パターン',
                body: [
                  'スキーマの追加・コードの反映・旧定義の削除を段階的に進めることで、後方互換性を保ちながらダウンタイムゼロでのマイグレーションを実現します。',
                ],
              },
            ],
          },
        },
        {
          slug: 'event-driven-iot-spring-boot',
          title: 'イベント駆動型IoTデータ収集パイプライン：MQTTからReactive Workersへの設計',
          date: '2025年7月',
          readTime: '所要時間：約7分',
          summary:
            '毎分10,000件以上のセンサーテレメトリを欠損なく処理する耐障害性の高いエッジ受信ゲートウェイ。Backpressure制御とTransactional Outboxパターンの実装。',
          tags: ['IoT', 'Spring Boot', 'アーキテクチャ', 'Kafka'],
          content: {
            lead: 'フィールドのエッジ端末は頻繁に切断し、回線復旧時に一斉に再接続してバーストデータを送信します。突発的な負荷を吸収するイベント駆動パイプラインの構築手法を解説します。',
            sections: [
              {
                heading: '1. センサー再接続バーストの吸収',
                body: [
                  'MQTTブローカーとSpring Bootリアクティブキューを連携させ、Backpressure制御によりメモリを圧迫することなくパケットを確実にバッファリングします。',
                ],
                code: {
                  language: 'java',
                  snippet: CODE_SNIPPET_IOT,
                },
              },
              {
                heading: '2. 決定論的UUIDv5と重複排除（Exactly-Once）',
                body: [
                  '通信リトライによる重複フレームを、デバイスIDとタイムスタンプから生成するUUIDv5およびRedis Bloomフィルターを用いて0.8ms以下で検知・破棄します。',
                ],
              },
              {
                heading: '3. Transactional Outboxによるデータ欠損防止',
                body: [
                  'エッジ端末の状態更新とイベント通知を単一のトランザクションでOutboxテーブルに記録し、分析基盤との最終的な整合性を保証します。',
                ],
              },
            ],
          },
        },
      ],
    },
    contact: {
      tag: '05 - お問い合わせ',
      title: '共に',
      titleSub: '未来を創る。',
      desc: 'フルタイムのエンジニア採用、フリーランス案件、共同開発の機会を受け付けております。現在ベトナム・ホーチミン市在住。',
      emailLabel: 'メールアドレス',
      msgLabel: 'メッセージ',
      sendBtn: 'メッセージを送信 →',
      sendingBtn: '送信中...',
      successMsg: '✓ 送信完了しました。折り返しご連絡いたします。',
      errorMsg: '送信エラー。直接 nhatprx@gmail.com までメールをお送りください。',
    },
    footer: {
      rights: '無断転載を禁じます。',
      edition: 'ミニマル・モノクローム版',
    },
  },
}
