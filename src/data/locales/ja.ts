import type { TranslationDict } from '../translationTypes'
import { DEFAULT_IDENTITY } from '../identity'
import {
  CODE_SNIPPET_PYTHON,
  CODE_SNIPPET_C,
  CODE_SNIPPET_YAML,
  CODE_SNIPPET_REDIS,
  CODE_SNIPPET_POSTGRES,
  CODE_SNIPPET_IOT,
} from '../blogSnippets'

export const ja: TranslationDict = {
  label: '日本語',
  identity: DEFAULT_IDENTITY,
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
      p2: '',
      educationTitle: '学歴',
      languagesTitle: '語学能力',
      edu1School: 'FPT大学',
      edu1Degree: '工学士（コンピュータサイエンス）',
      edu1Major: 'コンピュータサイエンス専攻',
      edu1Dates: 'ベトナム・ホーチミン市',
      edu1Location: 'ベトナム・ホーチミン市',
      edu2School: 'マルチメディア大学',
      edu2Degree: '交換留学プログラム',
      edu2Major: '異文化間コミュニケーション',
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
          title: 'データベース',
          gridClass: 'grid grid-cols-3 gap-2',
          skills: ['PostgreSQL', 'MySQL', 'Redis'],
        },
        {
          title: 'フレームワーク',
          gridClass: 'grid grid-cols-2 sm:grid-cols-4 gap-2',
          skills: ['Spring Boot', 'ReactJS', 'NodeJS', 'ThreeJS'],
          fullWidth: true,
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
}
