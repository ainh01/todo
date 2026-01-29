# Ứng dụng To-Do List Full-stack

Một ứng dụng danh sách công việc full-stack đơn giản nhưng mạnh mẽ, cho phép người dùng quản lý các tác vụ của mình một cách hiệu quả với tính năng xác thực người dùng an toàn.  

**Điểm nổi bật:**  
*   **Xác thực người dùng:** Đăng nhập an toàn bằng email và mật khẩu.  
*   **Quản lý tác vụ:** Giao diện trực quan để tạo, sửa, xóa công việc.  
*   **Sắp xếp bằng Kéo và Thả:** Dễ dàng thay đổi thứ tự công việc.  
*   **Nhập/Xuất Dữ liệu:** Lưu trữ và tải lên danh sách công việc.  
*   **Backend được Docker hóa:** Dễ dàng cài đặt và triển khai môi trường backend.  

**[➡️ Xem Live Demo tại đây](https://todo.xain.click/)**  

## Tính năng  

*   ✔️ **Xác thực người dùng:** Đăng nhập an toàn bằng email/mật khẩu sử dụng JWT (JSON Web Tokens).  
*   ✔️ **Quản lý Tác vụ:** Tạo, chỉnh sửa và xóa các mục trong danh sách công việc.  
*   ✔️ **Hành động Nhanh:** Truy cập các hành động thường dùng từ thanh bên phải.  
*   ✔️ **Sắp xếp bằng Kéo và Thả:** Dễ dàng sắp xếp lại các tác vụ (chỉ hoạt động trên máy tính để bàn).  
*   ✔️ **Chỉnh sửa Slogan:** Nhấp đúp chuột để tùy chỉnh slogan cho danh sách của bạn.  
*   📝 **Lưu trữ Dữ liệu Bền vững:** Các tác vụ được lưu vào cơ sở dữ liệu MongoDB.  
*   📥 **Nhập/Xuất Dữ liệu:** Hỗ trợ tải xuống danh sách công việc của bạn và thêm các tác vụ mới từ một tệp.  
*   ↩️ **Gửi bằng phím Enter:** Gửi nhanh các hành động (như tạo tác vụ mới) bằng cách nhấn phím Enter.  

## Công nghệ sử dụng

*   **Backend:**  
    *   [Node.js](https://nodejs.org/)  
    *   [Express](https://expressjs.com/)  
    *   [MongoDB](https://www.mongodb.com/)  
    *   [JSON Web Tokens (JWT)](https://jwt.io/)  
    *   [Docker](https://www.docker.com/)  
*   **Frontend:**  
    *   Vue 2.x
    *   Sass

## 🛠️ Yêu cầu cài đặt

Để chạy dự án này trên máy cục bộ, bạn cần cài đặt các phần mềm sau:  

*   **Node.js:** Một phiên bản ổn định gần đây được khuyến nghị.  
*   **Docker:** Cần thiết nếu bạn chạy backend trong container.
*   **MongoDB:** Một instance MongoDB đang chạy (có thể cài đặt cục bộ hoặc sử dụng dịch vụ đám mây như [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).  
*   **npm** hoặc **yarn:** Trình quản lý gói cho Node.js.  

## ⚙️ Cài đặt Backend  

### a. Di chuyển vào thư mục `backend/`  

```bash  
cd backend/  
```  

### b. Tạo tệp `.env`  

Tạo một tệp có tên `.env` trong thư mục `backend/` và thêm các biến môi trường theo `.env.example`

### c. Xây dựng và chạy Docker container

Đây là cách được khuyến nghị để chạy backend.  

1.  **Xây dựng Docker image:**
    ```bash  
    docker build -t todolist-backend .  
    ```  

2.  **Chạy Docker container:**  
    ```bash  
    # Lệnh này sẽ ánh xạ cổng 3000 của máy host tới cổng 3000 của container  
    # và nạp các biến môi trường từ tệp .env  
    docker run -p 3000:3000 --env-file ./.env todolist-backend
    ```  

### d. (Tùy chọn) Chạy cục bộ không cần Docker  

Nếu bạn muốn phát triển mà không dùng Docker:  

1.  **Cài đặt các dependency:**  
    ```bash  
    npm install  
    ```  

2.  **Khởi chạy:**  
    ```bash  
    npm run dev  
    ```  
    hoặc
    ```bash  
    npm start  
    ```  

## 🖥️ Cài đặt Frontend  

### a. Vị trí tệp  

Các tệp tĩnh của frontend (HTML, CSS, JS) được đặt trong thư mục `public/`.  

### b. Cấu hình URL của Backend  

1.  Mở tệp `public/js/config.js`.  
2.  Cập nhật hằng số `__BASE_URL__` để trỏ đến API backend của bạn.

### c. Chạy Frontend  

Để chạy frontend cục bộ, bạn chỉ cần mở tệp `public/index.html` trong trình duyệt web.  

## ☁️ Triển khai (Deployment)  

### a. Triển khai Frontend  

Bạn có thể triển khai các tệp tĩnh trong thư mục `public/` lên các dịch vụ như **Vercel, Netlify, hoặc GitHub Pages**.  

1.  **Cấu hình URL API:** Đảm bảo rằng tệp `public/js/config.js` đã được cấu hình với URL API của backend đã được triển khai.

2.  **(Tùy chọn) Thay thế URL động (không làm bước 1):**  
    Một số nền tảng (như Vercel) cho phép bạn đặt biến môi trường và sử dụng chúng trong quá trình xây dựng. Bạn có thể đặt một placeholder trong `config.js` (ví dụ: `__BASE_URL__`) và thay thế nó khi xây dựng.  

    *   **Lệnh Build:**  
        ```bash  
        # Lệnh này tìm và thay thế "__BASE_URL__" bằng giá trị của biến môi trường $BASE_URL  
        sed -i "s|__BASE_URL__|$BASE_URL|g" public/js/config.js  
        ```  
    *   **Biến môi trường trên nền tảng:**  
        Đặt biến `BASE_URL` trên Vercel/Netlify thành URL backend của bạn (ví dụ: `https://api.yourdomain.com/api`).  

    > **Lưu ý:** Lệnh `sed` trên hoạt động trên các hệ thống Unix-like (Linux, macOS). Nếu bạn xây dựng trên Windows, bạn có thể cần một giải pháp thay thế.  

### b. Triển khai Backend (sử dụng Docker)  

1.  **Đẩy Docker Image:** Đẩy image của bạn lên một sổ đăng ký container (container registry) như Docker Hub, Google Container Registry (GCR), hoặc Amazon Elastic Container Registry (ECR).  

2.  **Triển khai Image:** Triển khai image từ registry lên nhà cung cấp dịch vụ đám mây hỗ trợ Docker, ví dụ như **Railway, Render, AWS ECS, Google Cloud Run**.  

3.  **Cấu hình Biến môi trường:** Đảm bảo rằng các biến môi trường (`MONGODB_URI`, `JWT_SECRET`, `PORT`) được cấu hình một cách an toàn trong môi trường triển khai của bạn. **Không bao giờ đưa các giá trị này vào mã nguồn công khai.**  

**Tài liệu API:** Bạn có thể tham khảo tài liệu API chi tiết tại: [https://twtodo.xain.click/api-docs/](https://twtodo.xain.click/api-docs/)  

## License

Giao diện người dùng (UI) của frontend là phiên bản được chỉnh sửa dựa trên [uiineed-todo-list](https://github.com/ricocc/uiineed-todo-list) của tác giả [ricocc](https://github.com/ricocc), cũng được cấp phép theo [Giấy phép MIT](https://github.com/ricocc/uiineed-todo-list/blob/master/LICENSE).
