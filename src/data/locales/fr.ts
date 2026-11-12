import type { TranslationDict } from '../translationTypes'
import {
  CODE_SNIPPET_PYTHON,
  CODE_SNIPPET_C,
  CODE_SNIPPET_YAML,
  CODE_SNIPPET_REDIS,
  CODE_SNIPPET_POSTGRES,
  CODE_SNIPPET_IOT,
} from '../blogSnippets'

export const fr: TranslationDict = {
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
      p2: '',
      educationTitle: 'FORMATION',
      languagesTitle: 'LANGUES MAÎTRISÉES',
      edu1School: 'Université FPT',
      edu1Degree: "LICENCE D'INGÉNIERIE",
      edu1Major: 'Informatique',
      edu1Dates: 'Hô Chi Minh-Ville, Vietnam',
      edu1Location: 'Hô Chi Minh-Ville, Vietnam',
      edu2School: 'Multimedia University',
      edu2Degree: "PROGRAMME D'ÉCHANGE ÉTUDIANT",
      edu2Major: 'Communication Interpersonnelle',
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
          title: 'BASES DE DONNÉES',
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
  }
