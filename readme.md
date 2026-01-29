# Language Toggle: [English](#english) | [Tiếng Việt](#tiếng-việt)  

---  

<a name="english"></a>  

# Full-Stack To-Do List Application  

A simple yet powerful full-stack to-do list application that enables users to manage their tasks efficiently with secure user authentication.  

**Key Highlights:**  
* **User Authentication:** Secure login with email and password.  
* **Task Management:** Intuitive interface to create, edit, and delete tasks.  
* **Drag-and-Drop Sorting:** Easily reorder your tasks.  
* **Data Import/Export:** Save and upload your task lists.  
* **Dockerized Backend:** Effortless setup and deployment of backend environment.  

**[View Live Demo here](https://todo.xain.click/)**  

## Features  

* ✔️ **User Authentication:** Secure login with email/password using JWT (JSON Web Tokens).  
* ✔️ **Task Management:** Create, edit, and delete items in your to-do list.  
* ✔️ **Quick Actions:** Access frequently used actions from the right sidebar.  
* ✔️ **Drag-and-Drop Sorting:** Easily rearrange your tasks (desktop only).  
* ✔️ **Edit Tagline:** Double-click to customize the tagline for your list.  
* 📝 **Persistent Data Storage:** Tasks are saved to MongoDB database.  
* 📥 **Data Import/Export:** Support for downloading your task list and adding new tasks from a file.  
* ↩️ **Enter Key Submit:** Quickly submit actions (such as creating new tasks) by pressing Enter.  

## Technology Stack  

* **Backend:**  
  * [Node.js](https://nodejs.org/)  
  * [Express](https://expressjs.com/)  
  * [MongoDB](https://www.mongodb.com/)  
  * [JSON Web Tokens (JWT)](https://jwt.io/)  
  * [Docker](https://www.docker.com/)  
* **Frontend:**  
  * Vue 2.x  
  * Sass  

## Installation Requirements  

To run this project locally, you need to install the following software:  

* **Node.js:** A recent stable version is recommended.  
* **Docker:** Required if you run the backend in a container.  
* **MongoDB:** A running MongoDB instance (can be installed locally or use a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).  
* **npm** or **yarn:** Package manager for Node.js.  

## Backend Installation  

### a. Navigate to the `backend/` directory  

```bash  
cd backend/  
```  

### b. Create a `.env` file  

Create a file named `.env` in the `backend/` directory and add environment variables according to `.env.example`  

### c. Build and run Docker container  

This is the recommended way to run the backend.  

1. **Build Docker image:**  
   ```bash  
   docker build -t todolist-backend .  
   ```  

2. **Run Docker container:**  
   ```bash  
   # This command maps port 3000 of the host machine to port 3000 of the container  
   # and loads environment variables from the .env file  
   docker run -p 3000:3000 --env-file ./.env todolist-backend  
   ```  

### d. (Optional) Run locally without Docker  

If you want to develop without Docker:  

1. **Install dependencies:**  
   ```bash  
   npm install  
   ```  

2. **Start the application:**  
   ```bash  
   npm run dev  
   ```  
   or  
   ```bash  
   npm start  
   ```  

## Frontend Installation  

### a. File location  

Frontend static files (HTML, CSS, JS) are located in the `public/` directory.  

### b. Configure Backend URL  

1. Open the file `public/js/config.js`.  
2. Update the `__BASE_URL__` constant to point to your backend API.  

### c. Run Frontend  

To run the frontend locally, simply open the `public/index.html` file in your web browser.  

## Deployment  

### a. Deploy Frontend  

You can deploy the static files in the `public/` directory to services like **Vercel, Netlify, or GitHub Pages**.  

1. **Configure API URL:** Ensure that `public/js/config.js` is configured with the deployed backend API URL.  

2. **(Optional) Replace URL dynamically (skip step 1):**  
   Some platforms (like Vercel) allow you to set environment variables and use them during build. You can place a placeholder in `config.js` (e.g., `__BASE_URL__`) and replace it during build.  

   * **Build Command:**  
     ```bash  
     # This command finds and replaces "__BASE_URL__" with the value of the $BASE_URL environment variable  
     sed -i "s|__BASE_URL__|$BASE_URL|g" public/js/config.js  
     ```  
   * **Environment variable on platform:**  
     Set the `BASE_URL` variable on Vercel/Netlify to your backend URL (e.g., `https://api.yourdomain.com/api`).  

   > **Note:** The `sed` command above works on Unix-like systems (Linux, macOS). If you build on Windows, you may need an alternative solution.  

### b. Deploy Backend (using Docker)  

1. **Push Docker Image:** Push your image to a container registry such as Docker Hub, Google Container Registry (GCR), or Amazon Elastic Container Registry (ECR).  

2. **Deploy Image:** Deploy the image from the registry to a cloud provider that supports Docker, such as **Railway, Render, AWS ECS, Google Cloud Run**.  

3. **Configure Environment Variables:** Ensure that environment variables (`MONGODB_URI`, `JWT_SECRET`, `PORT`) are securely configured in your deployment environment. **Never include these values in public source code.**  

**API Documentation:** You can refer to detailed API documentation at: [https://twtodo.xain.click/api-docs/](https://twtodo.xain.click/api-docs/)  

## License  

The frontend user interface (UI) is a modified version based on [uiineed-todo-list](https://github.com/ricocc/uiineed-todo-list) by author [ricocc](https://github.com/ricocc), also licensed under the [MIT License](https://github.com/ricocc/uiineed-todo-list/blob/master/LICENSE).  

---  

<a name="tiếng-việt"></a>  

# Ứng Dụng To-Do List Full-Stack  

Một ứng dụng danh sách công việc full-stack đơn giản nhưng mạnh mẽ, cho phép người dùng quản lý các tác vụ của mình một cách hiệu quả với tính năng xác thực người dùng an toàn.  

**Điểm Nổi Bật:**  
* **Xác Thực Người Dùng:** Đăng nhập an toàn bằng email và mật khẩu.  
* **Quản Lý Tác Vụ:** Giao diện trực quan để tạo, sửa, xóa công việc.  
* **Sắp Xếp Bằng Kéo và Thả:** Dễ dàng thay đổi thứ tự công việc.  
* **Nhập/Xuất Dữ Liệu:** Lưu trữ và tải lên danh sách công việc.  
* **Backend Được Docker Hóa:** Dễ dàng cài đặt và triển khai môi trường backend.  

**[Xem Live Demo Tại Đây](https://todo.xain.click/)**  

## Tính Năng  

* ✔️ **Xác Thực Người Dùng:** Đăng nhập an toàn bằng email/mật khẩu sử dụng JWT (JSON Web Tokens).  
* ✔️ **Quản Lý Tác Vụ:** Tạo, chỉnh sửa và xóa các mục trong danh sách công việc.  
* ✔️ **Hành Động Nhanh:** Truy cập các hành động thường dùng từ thanh bên phải.  
* ✔️ **Sắp Xếp Bằng Kéo và Thả:** Dễ dàng sắp xếp lại các tác vụ (chỉ hoạt động trên máy tính để bàn).  
* ✔️ **Chỉnh Sửa Slogan:** Nhấp đúp chuột để tùy chỉnh slogan cho danh sách của bạn.  
* 📝 **Lưu Trữ Dữ Liệu Bền Vững:** Các tác vụ được lưu vào cơ sở dữ liệu MongoDB.  
* 📥 **Nhập/Xuất Dữ Liệu:** Hỗ trợ tải xuống danh sách công việc của bạn và thêm các tác vụ mới từ một tệp.  
* ↩️ **Gửi Bằng Phím Enter:** Gửi nhanh các hành động (như tạo tác vụ mới) bằng cách nhấn phím Enter.  

## Công Nghệ Sử Dụng  

* **Backend:**  
  * [Node.js](https://nodejs.org/)  
  * [Express](https://expressjs.com/)  
  * [MongoDB](https://www.mongodb.com/)  
  * [JSON Web Tokens (JWT)](https://jwt.io/)  
  * [Docker](https://www.docker.com/)  
* **Frontend:**  
  * Vue 2.x  
  * Sass  

## Yêu Cầu Cài Đặt  

Để chạy dự án này trên máy cục bộ, bạn cần cài đặt các phần mềm sau:  

* **Node.js:** Một phiên bản ổn định gần đây được khuyến nghị.  
* **Docker:** Cần thiết nếu bạn chạy backend trong container.  
* **MongoDB:** Một instance MongoDB đang chạy (có thể cài đặt cục bộ hoặc sử dụng dịch vụ đám mây như [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).  
* **npm** hoặc **yarn:** Trình quản lý gói cho Node.js.  

## Cài Đặt Backend  

### a. Di Chuyển Vào Thư Mục `backend/`  

```bash  
cd backend/  
```  

### b. Tạo Tệp `.env`  

Tạo một tệp có tên `.env` trong thư mục `backend/` và thêm các biến môi trường theo `.env.example`  

### c. Xây Dựng và Chạy Docker Container  

Đây là cách được khuyến nghị để chạy backend.  

1. **Xây Dựng Docker Image:**  
   ```bash  
   docker build -t todolist-backend .  
   ```  

2. **Chạy Docker Container:**  
   ```bash  
   # Lệnh này sẽ ánh xạ cổng 3000 của máy host tới cổng 3000 của container  
   # và nạp các biến môi trường từ tệp .env  
   docker run -p 3000:3000 --env-file ./.env todolist-backend  
   ```  

### d. (Tùy Chọn) Chạy Cục Bộ Không Cần Docker  

Nếu bạn muốn phát triển mà không dùng Docker:  

1. **Cài Đặt Các Dependency:**  
   ```bash  
   npm install  
   ```  

2. **Khởi Chạy:**  
   ```bash  
   npm run dev  
   ```  
   hoặc  
   ```bash  
   npm start  
   ```  

## Cài Đặt Frontend  

### a. Vị Trí Tệp  

Các tệp tĩnh của frontend (HTML, CSS, JS) được đặt trong thư mục `public/`.  

### b. Cấu Hình URL Của Backend  

1. Mở tệp `public/js/config.js`.  
2. Cập nhật hằng số `__BASE_URL__` để trỏ đến API backend của bạn.  

### c. Chạy Frontend  

Để chạy frontend cục bộ, bạn chỉ cần mở tệp `public/index.html` trong trình duyệt web.  

## Triển Khai (Deployment)  

### a. Triển Khai Frontend  

Bạn có thể triển khai các tệp tĩnh trong thư mục `public/` lên các dịch vụ như **Vercel, Netlify, hoặc GitHub Pages**.  

1. **Cấu Hình URL API:** Đảm bảo rằng tệp `public/js/config.js` đã được cấu hình với URL API của backend đã được triển khai.  

2. **(Tùy Chọn) Thay Thế URL Động (không làm bước 1):**  
   Một số nền tảng (như Vercel) cho phép bạn đặt biến môi trường và sử dụng chúng trong quá trình xây dựng. Bạn có thể đặt một placeholder trong `config.js` (ví dụ: `__BASE_URL__`) và thay thế nó khi xây dựng.  

   * **Lệnh Build:**  
     ```bash  
     # Lệnh này tìm và thay thế "__BASE_URL__" bằng giá trị của biến môi trường $BASE_URL  
     sed -i "s|__BASE_URL__|$BASE_URL|g" public/js/config.js  
     ```  
   * **Biến Môi Trường Trên Nền Tảng:**  
     Đặt biến `BASE_URL` trên Vercel/Netlify thành URL backend của bạn (ví dụ: `https://api.yourdomain.com/api`).  

   > **Lưu Ý:** Lệnh `sed` trên hoạt động trên các hệ thống Unix-like (Linux, macOS). Nếu bạn xây dựng trên Windows, bạn có thể cần một giải pháp thay thế.  

### b. Triển Khai Backend (sử dụng Docker)  

1. **Đẩy Docker Image:** Đẩy image của bạn lên một sổ đăng ký container (container registry) như Docker Hub, Google Container Registry (GCR), hoặc Amazon Elastic Container Registry (ECR).  

2. **Triển Khai Image:** Triển khai image từ registry lên nhà cung cấp dịch vụ đám mây hỗ trợ Docker, ví dụ như **Railway, Render, AWS ECS, Google Cloud Run**.  

3. **Cấu Hình Biến Môi Trường:** Đảm bảo rằng các biến môi trường (`MONGODB_URI`, `JWT_SECRET`, `PORT`) được cấu hình một cách an toàn trong môi trường triển khai của bạn. **Không bao giờ đưa các giá trị này vào mã nguồn công khai.**  

**Tài Liệu API:** Bạn có thể tham khảo tài liệu API chi tiết tại: [https://twtodo.xain.click/api-docs/](https://twtodo.xain.click/api-docs/)  

## License  

Giao diện người dùng (UI) của frontend là phiên bản được chỉnh sửa dựa trên [uiineed-todo-list](https://github.com/ricocc/uiineed-todo-list) của tác giả [ricocc](https://github.com/ricocc), cũng được cấp phép theo [Giấy Phép MIT](https://github.com/ricocc/uiineed-todo-list/blob/master/LICENSE).  