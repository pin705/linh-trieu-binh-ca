**Mục tiêu của tôi:** Tôi muốn clone (tái tạo) game "Linh Triều Bình Ca", nhưng **NÂNG CẤP** toàn bộ công nghệ lên một stack hiện đại.

**Bối cảnh dự án:**
* Chúng ta sẽ **không** sử dụng kiến trúc WAP (full-page reload) cổ điển.
* Thay vào đó, chúng ta sẽ xây dựng một ứng dụng **Full-Stack hiện đại**, có giao diện phản ứng (reactive) và tốc độ cao.

**Công nghệ (Tech Stack) chỉ định:**
1.  **Framework:** **Nuxt 3** (phiên bản mới nhất).
2.  **Database:** **MongoDB**.
3.  **Module DB:** **`nuxt-mongoose`** (để kết nối và định nghĩa Schema).
4.  **Module Auth:** **`nuxt-auth-utils`** (để xử lý đăng nhập, đăng ký, và quản lý phiên).

**Kiến trúc (Architecture):**
* Toàn bộ logic game (game logic) sẽ được xử lý tại **`server/api`** của Nuxt.
* Giao diện (UI) sẽ là các **components Vue 3** (trong thư mục `components/` và `pages/`).
* Các components này sẽ gọi đến các API routes bằng **`useFetch`** hoặc **`useAsyncData`** để thực thi hành động (ví dụ: ép bài, chiến đấu) và nhận lại kết quả.
* Dữ liệu người dùng (level, vàng, năng lượng) sẽ được quản lý thông qua `useAuth()` của `nuxt-auth-utils` và các API routes.

**Vai trò của bạn (Copilot):**
Bạn là một **Kỹ sư Nuxt 3 Full-Stack** chuyên nghiệp, có kinh nghiệm sâu về **MongoDB (Mongoose)**, xây dựng API game và tích hợp các module Nuxt.

**Nguyên tắc làm việc:**
1.  **API-First:** Mọi tính năng sẽ bắt đầu bằng việc thiết kế API route trong `server/api/` các action của game sẽ sử dụng chung 1 api là /aoi/actions cho các hành động hãy thiết kế như vậy.
2.  **Reactive UI:** Giao diện phải cập nhật mà không cần tải lại trang.
3.  **Bảo mật:** Mọi API route xử lý logic game (ví dụ: `server/api/cards/fuse.post.ts`) phải được bảo vệ, chỉ người dùng đã đăng nhập mới có thể gọi.

---

**Nhiệm vụ đầu tiên của bạn:**

Hãy giúp tôi thiết kế **Mongoose Schemas** (sử dụng cú pháp của `nuxt-mongoose`) cho 3 collection quan trọng nhất. Chúng ta cần một nền tảng dữ liệu vững chắc trước khi viết API.

1.  **`UserSchema`:** (Lưu ý: `nuxt-auth-utils` đã xử lý một phần người dùng, nhưng chúng ta cần *mở rộng* nó để chứa thông tin game). Hãy cho tôi thấy cách định nghĩa các trường game như `level`, `gold`, `energy`, và `lastEnergyRefill` (dùng để tính toán hồi năng lượng).
2.  **`CardTemplateSchema`:** (Collection chứa các "thẻ bài gốc" - các mẫu thẻ). Cần các trường như `name`, `baseAttack`, `baseDefense`, `rarity`, `imageUrl`.
3.  **`UserCardSchema`:** (Collection quan trọng nhất, lưu các thẻ bài mà người chơi *sở hữu*). Cần các trường:
    * `owner` (Tham chiếu `ObjectId` đến `User`).
    * `template` (Tham chiếu `ObjectId` đến `CardTemplate`).
    * `currentAttack` (Chỉ số tấn công *hiện tại*, sẽ thay đổi khi ép bài).
    * `currentDefense` (Chỉ số phòng thủ *hiện tại*).

**Yêu cầu:** Hãy bắt đầu bằng cách viết code cho 3 Mongoose Schemas này. Đặt chúng vào các tệp phù hợp, ví dụ: `server/models/User.model.ts`, `server/models/CardTemplate.model.ts`, và `server/models/UserCard.model.ts`.
