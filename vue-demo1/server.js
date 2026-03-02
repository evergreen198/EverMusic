import express from 'express';
import pool from './db.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ========== 用户相关 ==========

// 根据邮箱或用户名查询用户（用于登录）
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  // 添加参数验证
  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' });
  }
  try {
    // 支持邮箱或用户名登录
    const result = await pool.query(
      'SELECT id, username, email, password_hash, bio, created_at FROM users WHERE email = $1 OR username = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    // TODO: 使用 bcrypt 验证密码哈希
    // const isPasswordValid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (password !== result.rows[0].password_hash) {
      return res.status(401).json({ error: '密码错误' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ error: err.message });
  }
});

// 创建用户
app.post('/api/register', async (req, res) => {
  const { username, email, password_hash, bio } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, bio) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, password_hash, bio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ========== 项目相关 ==========
// 查询当前登录用户的项目列表
app.get('/api/projects_list', async (req, res) => {
  const { userId } = req.query;

  // 验证用户ID
  if (!userId) {
    return res.status(400).json({ error: '缺少用户ID参数' });
  }

  try {
    const result = await pool.query(`
            SELECT
                p.id,
                p.title,
                p.creator_id,
                p.bpm,
                p.duration_second,
                p.updated_at,
                p.last_edited_by
            FROM projects p
            WHERE p.creator_id = $1
            ORDER BY p.updated_at DESC
        `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('查询项目列表失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取单个项目（返回完整project_data）
// 查询单个项目详细信息（包含所有字段）
app.get('/api/projects_data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
            SELECT
                p.id,
                p.creator_id,
                p.title,
                p.bpm,
                p.duration_second,
                p.project_json,
                p.version,
                p.last_edited_by,
                p.created_at,
                p.updated_at,
                p.description,
                u.username as creator_name,
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'user_id', pc.user_id,
                            'role', pc.role
                        )
                    ) FILTER (WHERE pc.id IS NOT NULL),
                    '[]'::jsonb
                ) as collaborators
            FROM projects p
            JOIN users u ON p.creator_id = u.id
            LEFT JOIN project_collaborators pc ON p.id = pc.project_id
            WHERE p.id = $1
            GROUP BY p.id, u.username
        `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '项目不存在' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('查询项目详情失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 创建项目
app.post('/api/projects', async (req, res) => {
  const { creator_id, title, bpm, duration_second, project_json, version, last_edited_by, description } = req.body;
  try {
    // 注意：project_json 已经是 JSON 字符串，不需要再次 stringify
    const result = await pool.query(
      `INSERT INTO projects
             (creator_id, title, bpm, duration_second, project_json, version, last_edited_by, description, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
      [creator_id, title, bpm, duration_second, project_json, version, last_edited_by, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('创建项目失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 更新项目（保存音乐）
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { title, bpm, duration_second, project_json, last_edited_by, description } = req.body;
  try {
    // 注意：project_json 已经是 JSON 字符串，不需要再次 stringify
    const result = await pool.query(
      `UPDATE projects
             SET title = $1,
                 bpm = $2,
                 duration_second = $3,
                 project_json = $4::jsonb,
                 last_edited_by = $5,
                 description = $6,
                 version = version + 1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING *`,
      [title, bpm, duration_second, project_json, last_edited_by, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('更新项目失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 删除项目
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== 合作者相关 ==========

// 添加合作者
app.post('/api/projects/:id/collaborators', async (req, res) => {
  const { id } = req.params;
  const { user_id, role, permissions } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO project_collaborators (project_id, user_id, role, permissions)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      [id, user_id, role, JSON.stringify(permissions || {})]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 启动服务
const PORT = 7220;
app.listen(PORT, () => {
  console.log(`API服务器运行在 http://localhost:${PORT}`);
});
