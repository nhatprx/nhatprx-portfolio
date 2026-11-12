import type { TranslationDict } from '../translationTypes'
import {
  CODE_SNIPPET_PYTHON,
  CODE_SNIPPET_C,
  CODE_SNIPPET_YAML,
  CODE_SNIPPET_REDIS,
  CODE_SNIPPET_POSTGRES,
  CODE_SNIPPET_IOT,
} from '../blogSnippets'

export const en: TranslationDict = {
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
      p2: '',
      educationTitle: 'EDUCATION',
      languagesTitle: 'WORKING LANGUAGES',
      edu1School: 'FPT University',
      edu1Degree: 'BACHELOR OF ENGINEERING',
      edu1Major: 'Computer Science',
      edu1Dates: 'Ho Chi Minh City, VN',
      edu1Location: 'Ho Chi Minh City, VN',
      edu2School: 'Multimedia University',
      edu2Degree: 'STUDENT EXCHANGE PROGRAM',
      edu2Major: 'Interpersonal Communication',
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
          title: 'DATABASES',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['PostgreSQL', 'MySQL', 'Redis'],
        },
        {
          title: 'FRAMEWORKS',
          gridClass: 'grid grid-cols-2 sm:grid-cols-4 gap-2',
          skills: ['Spring Boot', 'ReactJS', 'NodeJS', 'ThreeJS'],
          fullWidth: true,
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
      directEmail: 'nhatprx@gmail.com',
      directPhone: '+84 879 888 965',
      githubUrl: 'https://github.com/nhatprx',
      linkedinUrl: 'https://www.linkedin.com/in/nhatprx/',
      availabilityLocation: 'Ho Chi Minh City, Vietnam',
      isAvailableForRoles: true,
    },
    footer: {
      rights: 'All rights reserved.',
      edition: 'Minimal Monochrome Edition',
    },
  }
