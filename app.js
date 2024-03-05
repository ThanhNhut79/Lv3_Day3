import jsonServer from "json-server";
import { v4 as uuidv4 } from "uuid";
const app = jsonServer.create();

// câu 1:Viết API việc đăng ký user với userName, id sẽ được là một string ngẫu nhiên, không được phép trùng, bắt đầu từ ký tự US (ví dụ: US8823).
app.post("/users", (req, res) => {
  const { userName } = req.body;
  const id = generateRandomId("US");

  // Kiểm tra xem người dùng đã tồn tại hay chưa
  const existingUser = db.users.find((user) => user.userName === userName);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = { id: `US${uuidv4().split("-")[0]}`, userName };
  db.users.push(newUser);

  res.json(newUser);
});

// câu2: Viết API cho phép user tạo bài post (thêm bài post, xử lý id tương tự user).
app.post("/posts", (req, res) => {
  const { userId, content } = req.body;
  const user = db.users.find((user) => user.id === userId);
  if (!user) {
    return res.status(404).json({ error: "không tìm thấy user" });
  }

  const id = `PS${uuidv4().split("-")[0]}`;
  const newPost = { id, userId, content };
  db.posts.push(newPost);

  res.json(newPost);
});

// câu 3 :Viết API cho phép user chỉnh sửa lại bài post (chỉ user tạo bài viết mới được phép chỉnh sửa).
app.put("/posts/:postId", (req, res) => {
  const { postId } = req.params;
  const { userId, content } = req.body;
  const post = db.posts.find((post) => post.id === postId);

  if (!post) {
    return res.status(404).json({ error: "Khong tìm thấy bài post" });
  }

  if (post.userId !== userId) {
    return res
      .status(403)
      .json({ error: "tài khoản không được phép chỉnh sửa" });
  }

  post.content = content;

  res.json({ message: "Update bài post thành công" });
});

// câu 4: Viết API cho phép user được comment vào bài post
app.post("/posts/:postId/comments", (req, res) => {
  const { postId } = req.params;
  const { userId, content } = req.body;
  const post = db.posts.find((post) => post.id === postId);

  if (!post) {
    return res.status(404).json({ error: "không tìm thấy bài post" });
  }

  const id = `CMT${uuidv4().split("-")[0]}`;
  const newComment = { id, postId, userId, content };
  db.comments.push(newComment);

  res.json(newComment);
});

// câu 5: Viết API cho phép user chỉnh sửa comment (chỉ user tạo comment mới được sửa)
app.put("/comments/:commentId", (req, res) => {
  const { commentId } = req.params;
  const { userId, content } = req.body;
  const comment = db.comments.find((comment) => comment.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: "khong tim thay comment" });
  }

  if (comment.userId !== userId) {
    return res.status(403).json({ error: "Tài khoản không được phép update" });
  }

  comment.content = content;

  res.json({ message: "chỉnh sửa comment thành công" });
});

//câu 6:Viết API lấy tất cả comment của một bài post.
app.get("/posts/:postId/comments", (req, res) => {
  const { postId } = req.params;
  const comments = db.comments.filter((comment) => comment.postId === postId);

  res.json(comments);
});

//câu 7: Viết API lấy tất cả các bài post, 3 comment đầu (dựa theo index) của tất cả user .
app.get("/posts", (req, res) => {
  const posts = db.posts;
  const users = db.users;

  const postsWithComments = posts.map((post) => {
    const comments = db.comments.filter(
      (comment) => comment.postId === post.id
    );
    const user = users.find((u) => u.id === post.userId);

    return {
      ...post,
      comments: comments.slice(0, 3),
      user,
    };
  });

  res.json(postsWithComments);
});

//câu 8: Viết API lấy một bài post và tất cả comment của bài post đó thông qua postId
app.get("/api/posts/:postId", (req, res) => {
  const { postId } = req.params;
  const post = router.db.get("posts").find({ id: postId }).value();

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const comments = router.db.get("comments").filter({ postId }).value();

  res.json({ post, comments });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
