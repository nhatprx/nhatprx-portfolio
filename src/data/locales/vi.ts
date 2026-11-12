import type { TranslationDict } from '../translationTypes'
import {
  CODE_SNIPPET_PYTHON,
  CODE_SNIPPET_C,
  CODE_SNIPPET_YAML,
  CODE_SNIPPET_REDIS,
  CODE_SNIPPET_POSTGRES,
  CODE_SNIPPET_IOT,
} from '../blogSnippets'

export const vi: TranslationDict = {
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
      p2: '',
      educationTitle: 'HỌC VẤN',
      languagesTitle: 'NGÔN NGỮ GIAO TIẾP',
      edu1School: 'Đại học FPT',
      edu1Degree: 'KỸ SƯ KHOA HỌC MÁY TÍNH',
      edu1Major: 'Khoa học Máy tính',
      edu1Dates: 'TP. Hồ Chí Minh, Việt Nam',
      edu1Location: 'TP. Hồ Chí Minh, Việt Nam',
      edu2School: 'Đại học Multimedia',
      edu2Degree: 'CHƯƠNG TRÌNH TRAO ĐỔI SINH VIÊN',
      edu2Major: 'Giao tiếp liên văn hóa',
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
          title: 'CƠ SỞ DỮ LIỆU',
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
  }
