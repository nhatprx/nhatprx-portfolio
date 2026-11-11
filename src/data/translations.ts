export type SupportedLang = 'en' | 'vi' | 'fr' | 'ja'

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
    edu1School: string
    edu1Major: string
    edu1Dates: string
    edu2School: string
    edu2Major: string
    edu2Dates: string
  }
  experience: {
    tag: string
    title: string
    titleSub: string
  }
  projects: {
    tag: string
    title: string
    titleSub: string
  }
  skills: {
    tag: string
    title: string
    titleSub: string
  }
  blog: {
    tag: string
    title: string
    titleSub: string
    readNote: string
    backToPortfolio: string
    published: string
    readingTime: string
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

export const TRANSLATIONS: Record<SupportedLang, TranslationDict> = {
  en: {
    label: 'English',
    nav: {
      liveLab: 'LIVE LAB',
      about: 'ABOUT',
      experience: 'EXPERIENCE',
      projects: 'PROJECTS',
      skills: 'SKILLS',
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
      p2: 'Hands-on with Java (Spring Boot), TypeScript (React, Node.js), Python, and modern cloud primitives. Focused on clean architecture, predictable performance, and low operational overhead.',
      educationTitle: 'EDUCATION',
      edu1School: 'FPT UNIVERSITY',
      edu1Major: 'Computer Science · Sep 2022 - Present',
      edu1Dates: 'GPA: 3.2 / 4.0',
      edu2School: 'MULTIMEDIA UNIVERSITY, MALAYSIA',
      edu2Major: 'Interpersonal Communication · Jan - Apr 2023',
      edu2Dates: 'Study Abroad Program · Cyberjaya',
    },
    experience: {
      tag: '02 - EXPERIENCE',
      title: "Where I've",
      titleSub: 'shipped code.',
    },
    projects: {
      tag: '03 - PROJECTS',
      title: 'Featured',
      titleSub: 'systems.',
    },
    skills: {
      tag: '04 - SKILLS',
      title: 'Technical',
      titleSub: 'stack.',
    },
    blog: {
      tag: '05 - BLOG',
      title: 'Engineering',
      titleSub: 'notes.',
      readNote: 'READ NOTE →',
      backToPortfolio: '← BACK TO PORTFOLIO',
      published: 'PUBLISHED',
      readingTime: 'READ TIME',
    },
    contact: {
      tag: '06 - CONTACT',
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
  vi: {
    label: 'Tiếng Việt',
    nav: {
      liveLab: 'MÁY CHỦ TRỰC TIẾP',
      about: 'GIỚI THIỆU',
      experience: 'KINH NGHIỆM',
      projects: 'DỰ ÁN',
      skills: 'KỸ NĂNG',
      blog: 'BÀI VIẾT',
      contact: 'LIÊN HỆ',
    },
    hero: {
      role: 'KỸ SƯ PHẦN MỀM',
      desc: 'Xây dựng hệ thống backend chịu tải cao, phân tích và tối ưu hóa giao thức hệ thống, và mở rộng hạ tầng đám mây phân tán hiện đại.',
      getInTouch: 'LIÊN HỆ NGAY',
      resume: 'TẢI CV',
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
      p2: 'Thành thạo Java (Spring Boot), TypeScript (React, Node.js), Python và các nền tảng đám mây. Luôn ưu tiên kiến trúc tinh gọn, hiệu năng ổn định và chi phí vận hành tối ưu.',
      educationTitle: 'HỌC VẤN',
      edu1School: 'ĐẠI HỌC FPT',
      edu1Major: 'Khoa học Máy tính · 09/2022 - Hiện tại',
      edu1Dates: 'GPA: 3.2 / 4.0',
      edu2School: 'ĐẠI HỌC MULTIMEDIA, MALAYSIA',
      edu2Major: 'Giao tiếp liên văn hóa · 01/2023 - 04/2023',
      edu2Dates: 'Chương trình du học quốc tế · Cyberjaya',
    },
    experience: {
      tag: '02 - KINH NGHIỆM',
      title: 'Nơi tôi từng',
      titleSub: 'làm việc & cống hiến.',
    },
    projects: {
      tag: '03 - DỰ ÁN',
      title: 'Dự án',
      titleSub: 'tiêu biểu.',
    },
    skills: {
      tag: '04 - KỸ NĂNG',
      title: 'Ngăn xếp',
      titleSub: 'công nghệ.',
    },
    blog: {
      tag: '05 - BÀI VIẾT',
      title: 'Ghi chép',
      titleSub: 'kỹ thuật.',
      readNote: 'ĐỌC BÀI VIẾT →',
      backToPortfolio: '← QUAY LẠI TRANG CHỦ',
      published: 'NGÀY ĐĂNG',
      readingTime: 'THỜI GIAN ĐỌC',
    },
    contact: {
      tag: '06 - LIÊN HỆ',
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
  fr: {
    label: 'Français',
    nav: {
      liveLab: 'SERVEUR EN DIRECT',
      about: 'À PROPOS',
      experience: 'EXPÉRIENCE',
      projects: 'PROJETS',
      skills: 'COMPÉTENCES',
      blog: 'BLOG',
      contact: 'CONTACT',
    },
    hero: {
      role: 'INGÉNIEUR LOGICIEL',
      desc: 'Conception de systèmes backend résilients, rétro-ingénierie de protocoles clients et montée en charge des infrastructures cloud modernes.',
      getInTouch: 'ME CONTACTER',
      resume: 'CV EN PDF',
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
      p1: "Ingénieur logiciel autonome sur l'ensemble du cycle de développement, de la conception architecturale au déploiement en production. Expérience prouvée chez Grevo Solutions et Amazon Web Services.",
      p2: 'Maîtrise de Java (Spring Boot), TypeScript (React, Node.js), Python et des technologies cloud modernes. Recherche constante de simplicité et de performances.',
      educationTitle: 'FORMATION',
      edu1School: 'UNIVERSITÉ FPT',
      edu1Major: 'Informatique · Sept 2022 - Présent',
      edu1Dates: 'Moyenne : 3.2 / 4.0',
      edu2School: 'MULTIMEDIA UNIVERSITY, MALAISIE',
      edu2Major: 'Communication Interpersonnelle · Jan - Avr 2023',
      edu2Dates: "Programme d'échange · Cyberjaya",
    },
    experience: {
      tag: '02 - EXPÉRIENCE',
      title: 'Parcours',
      titleSub: 'professionnel.',
    },
    projects: {
      tag: '03 - PROJETS',
      title: 'Projets',
      titleSub: 'phares.',
    },
    skills: {
      tag: '04 - COMPÉTENCES',
      title: 'Stack',
      titleSub: 'technique.',
    },
    blog: {
      tag: '05 - BLOG',
      title: 'Notes',
      titleSub: "d'ingénierie.",
      readNote: "LIRE L'ARTICLE →",
      backToPortfolio: '← RETOUR AU PORTFOLIO',
      published: 'PUBLIÉ',
      readingTime: 'TEMPS DE LECTURE',
    },
    contact: {
      tag: '06 - CONTACT',
      title: 'Créons ensemble',
      titleSub: 'des projets durables.',
      desc: 'Disponible pour des postes à temps plein, missions freelance et collaborations techniques. Actuellement basé à Hô Chi Minh-Ville, Vietnam.',
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
  ja: {
    label: '日本語',
    nav: {
      liveLab: 'ライブ環境',
      about: '概要',
      experience: '経歴',
      projects: '実績',
      skills: '技術',
      blog: '記事',
      contact: 'お問い合わせ',
    },
    hero: {
      role: 'ソフトウェアエンジニア',
      desc: '高信頼性バックエンドシステムの構築、プロトコルのリバースエンジニアリング、クラウド分散インフラの最適化に従事。',
      getInTouch: '連絡を取る',
      resume: '履歴書',
    },
    server: {
      tag: '稼働テレメトリ',
      title: '実際のサーバー環境',
      titleSub: '試してみる。',
      desc: 'このポートフォリオをホストしている本番Linuxサーバーへ直接アクセスできます。自由にコンテナやリソースを確認してください（安全な読み取り専用環境です）。',
    },
    about: {
      tag: '01 - 概要',
      title: 'スケーラブルな',
      titleSub: 'システム構築。',
      p1: 'システム設計から本番デプロイまで、エンドツーエンドで責任を持って開発を推進するエンジニア。Grevo Solutionsでのプロダクト開発やAmazon Web Servicesでのクラウド設計経験を有します。',
      p2: 'Java (Spring Boot)、TypeScript (React, Node.js)、Python、各種クラウド基盤に精通。シンプルな構造と高パフォーマンスを両立。',
      educationTitle: '学歴',
      edu1School: 'FPT大学',
      edu1Major: 'コンピュータサイエンス · 2022年9月 - 在学中',
      edu1Dates: 'GPA: 3.2 / 4.0',
      edu2School: 'マルチメディア大学（マレーシア）',
      edu2Major: '異文化間コミュニケーション · 2023年1月 - 4月',
      edu2Dates: '留学プログラム · サイバージャヤ',
    },
    experience: {
      tag: '02 - 経歴',
      title: '開発と',
      titleSub: 'キャリアの実績。',
    },
    projects: {
      tag: '03 - 実績',
      title: '主要な',
      titleSub: 'プロジェクト。',
    },
    skills: {
      tag: '04 - 技術',
      title: '技術',
      titleSub: 'スタック。',
    },
    blog: {
      tag: '05 - 記事',
      title: 'エンジニアリング',
      titleSub: 'ノート。',
      readNote: '記事を読む →',
      backToPortfolio: '← ポートフォリオに戻る',
      published: '公開日',
      readingTime: '所要時間',
    },
    contact: {
      tag: '06 - お問い合わせ',
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
