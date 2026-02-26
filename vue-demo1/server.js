import express from 'express';
import pool from './db.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ========== 用户相关 ==========

// 根据邮箱查询用户（用于登录）
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  // 添加参数验证
  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' });
  }
  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash, bio, created_at FROM users WHERE email = $1',
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

// 获取所有项目（不返回完整JSON，只返回列表）
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                p.id,
                p.title,
                p.bpm,
                p.updated_at,
                u.username as creator,
                jsonb_array_length(p.project_data->'tracks') as track_count
            FROM projects p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.updated_at DESC
        `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取单个项目（返回完整project_data）
app.get('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
            SELECT
                p.*,
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
            JOIN users u ON p.user_id = u.id
            LEFT JOIN project_collaborators pc ON p.id = pc.project_id
            WHERE p.id = $1
            GROUP BY p.id, u.username
        `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '项目不存在' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建项目
app.post('/api/projects', async (req, res) => {
  const { user_id, title, bpm, project_data } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO projects
             (user_id, title, bpm, project_data, time_signature_num, time_signature_den)
             VALUES ($1, $2, $3, $4, 4, 4)
             RETURNING *`,
      [user_id, title, bpm, JSON.stringify(project_data)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新项目（保存音乐）
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { title, bpm, project_data, last_edited_by } = req.body;
  try {
    const result = await pool.query(
      `UPDATE projects
             SET title = $1,
                 bpm = $2,
                 project_data = $3,
                 last_edited_by = $4,
                 version = version + 1,
                 updated_at = now()
             WHERE id = $5
             RETURNING *`,
      [title, bpm, JSON.stringify(project_data), last_edited_by, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
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
