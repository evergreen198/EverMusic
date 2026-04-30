import express from 'express';
import pool from './db.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io'
import dotenv from 'dotenv';
dotenv.config();
// Please install OpenAI SDK first: `npm install openai`
const app = express();

//  配置 CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://113.44.82.167',
  'http://113.44.82.167:80',
  'http://113.44.82.167:7220',
  'http://113.44.82.167:7221',
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : [])
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

const httpServer = createServer(app);

// Socket.IO 也需要配置 CORS
export const io = new Server(httpServer, {
  cors: corsOptions
});
//AI接口
import OpenAI from "openai";
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
  // "sk-77394cf256604205baf53b20d4e63be3",
});

async function styleToMusicParams(styleDescription) {
  const systemPrompt = `你是一名专业的作曲与编曲专家。请根据不同音乐曲风生成和弦与节奏搭配。
任务要求：
输出必须构成四和弦循环。
每个和弦需要搭配一个节奏类型，且风格要统一。
每组需要指定 主要演奏乐器。
和弦使用常见流行音乐和弦（如 C, G, Am, F, Dm7, G7, Cmaj7 等）。
总时长60秒左右。
节奏rhythmId必须从以下列表中选择，不允许生成列表外的节奏名称：
whole, 全音符
half, 二分音符
quarter, 四分音符
eighth, 八分音符
sixteenth, 十六分音符
dottedhalf, 附点二分音符
dottedquarter, 附点四分音符
dottedeighthnote, 小附点 (1/8+1/8+1/16)
dottedquarternote, 大附点 (1/4+1/4+1/8)
syncopationLarge, 大切分 (1/8+1/4+1/8)
syncopationSmall, 小切分 (1/16+1/8+1/16)
eighthTriplet, 八分三连音 (1/12+1/12+1/12)
frontEighthBackSixteenth, 前八后十六 (1/8+1/16+1/16)
根据用户的风格描述，返回包含以下格式的JSON：
{
  "tracks": [//音乐轨道，可以有多个轨道，从1开始编号，1-9
    {
      //每个轨道的片段数组Clips
      "clips": [
        {
          // notes：音符，每个音符是一个字符串
          // 例如"C4"表示C4音符，如果isChord为true，则表示和弦
          // 此时notes数组中有多个音符，且音符取决于content表示的和弦；
          // 如果isChord为false，则表示单音符，notes数组只有一个音符
          "notes": [
            "C4",
            "E4",
            "G4"
          ],
          // clip_id：片段编号，从0开始编号，0-8
          "clip_id": 0,
          // content：音符内容，例如"C"表示C和弦，"C7"表示C7和弦
          "content": "C",
          //isChord表示是否为和弦，true表示和弦，false表示单音符
          "isChord": true,
          //rhythmId代表了该片段的节奏，例如"whole"表示全音符，"half"表示二分音符等。可选值：
          "rhythmId": "whole",
          //itemWidth：片段宽度，由durationsecond计算得出，itemWidth=durationsecond*30
          "itemWidth": 119,
          //itemHeight：片段高度，单位像素，固定为30
          "itemHeight": 30,
          // startsecond：片段开始时间，单位秒，从0开始
          "startsecond": 11.233333333333333,
          // instrumentId：乐器ID，例如"piano"、"guitar"等
          "instrumentId": "piano",
          // durationsecond：片段持续时间，单位秒
          "durationsecond": 4
        }
      ],
      //音量，始终为100
      "volume": 100,
      // track_id：轨道编号，从0开始编号，1-9
      "track_id": 6,
      // midiChannel：MIDI通道，从1开始编号，1-9
      "midiChannel": 6
    }
  ]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `风格：${styleDescription}，请根据风格生成符合要求的音乐参数` }
      ],
      model: "deepseek-chat",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const params = JSON.parse(completion.choices[0].message.content);
    return JSON.stringify(params, null, 2);

  } catch (error) {
    console.error("生成失败：", error);
    return null;
  }
}

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

// 更新用户信息
app.post('/api/updateuser/:id', async (req, res) => {
  const userId = req.params.id
  const { username, avatar_url, email, password: password_hash, bio } = req.body
  try {
    const result = await pool.query(
      `UPDATE users
             SET username = $1,
                 email = $2,
                 password_hash = $3,
                 avatar_url = $4,
                 bio = $5
             WHERE id = $6
             RETURNING *`,
      [username, email, password_hash, avatar_url, bio, userId]
    )
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

})
// ========== 项目相关 ==========
// 查询当前登录用户的项目列表
// 查询当前登录用户的项目列表 - 优化版
app.get('/api/projects_list', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: '缺少用户ID参数' });
  }

  try {
    // ✅ 方案1：单次查询，只从 projects 表获取（推荐）
    const result = await pool.query(`
      SELECT DISTINCT
        p.id,
        p.title,
        p.creator_id,
        p.duration_second,
        p.updated_at,
        p.last_edited_by
      FROM projects p
      LEFT JOIN project_collaborators pc ON p.id = pc.project_id
      WHERE p.creator_id = $1 OR pc.user_id = $1
      ORDER BY p.updated_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('查询项目列表失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取单个项目（返回完整project_data）
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

//邀请码对标项目
app.post('/api/project/invites/:id', async (req, res) => {
  const { id: projectId } = req.params;
  const { invite_code, inviter_id, role, max_uses } = req.body;

  if (!invite_code || !inviter_id) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  try {
    // 默认最多 5 人
    const finalMaxUses = max_uses && max_uses > 0 ? max_uses : 5;
    // 默认 7 天过期
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 7);
    const result = await pool.query(
      `
      INSERT INTO project_invites
      (project_id, invite_code, inviter_id, role, max_uses, used_count, expire_at)
      VALUES ($1, $2, $3, $4, $5, 0, $6)
      RETURNING *
      `,
      [
        projectId,
        invite_code,
        inviter_id,
        role || 'editor',
        finalMaxUses,
        expireAt
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('创建邀请失败:', err);

    // 唯一邀请码冲突
    if (err.code === '23505') {
      return res.status(400).json({ error: '邀请码已存在' });
    }

    res.status(500).json({ error: err.message });
  }
});

// 确认项目可加入
app.get('/api/project/invites/confirm', async (req, res) => {
  const { inviteCode } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM project_invites WHERE invite_code = $1`,
      [inviteCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '邀请码不存在' });
    }
    // 检查邀请是否过期
    const invite = result.rows[0];
    if (invite.expire_at < new Date()) {
      return res.status(403).json({ error: '邀请已过期' });
    }
    // 检查邀请是否已被使用超过最大次数
    if (invite.used_count >= invite.max_uses) {
      return res.status(403).json({ error: '邀请已被使用超过最大次数' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('确认邀请失败:', err);
    res.status(500).json({ error: err.message });
  }
})

// 添加合作者
app.post(`/api/project/invites/:id/collaborators`, async (req, res) => {
  const { id: projectId } = req.params;
  const { user_id, role, permissions, } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO project_collaborators (project_id, user_id, role, permissions,updated_at)
             VALUES ($1, $2, $3, $4,CURRENT_TIMESTAMP)
             RETURNING *`,
      [projectId, user_id, role, JSON.stringify(permissions), ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('添加合作者失败:', err);
    res.status(500).json({ error: err.message });
  }
});


//AI作曲函数
// server.js
app.post('/api/generate-music', async (req, res) => {
  try {
    const { style } = req.body;
    const musicData = await styleToMusicParams(style);
    res.json(musicData);
  } catch (error) {
    console.error('生成音乐失败:', error);
    res.status(500).json({ error: '生成音乐失败' });
  }
});


//=======Socket.io=========
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  //主机项目->加入房间
  socket.on('host-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`主机项目加入项目 ${projectId}`);
  });

  //加入邀请->加入房间
  socket.on('join-project', (projectId, userdata) => {
    socket.join(`project-${projectId}`);
    //传输用户数据
    io.to(`project-${projectId}`).emit('user-joined', userdata)
    console.log(`用户加入项目 ${projectId}, 用户数据:`, userdata);
  });

  // 实时编辑同步
  socket.on('remote-edit-clip', (projectId, clipData) => {
    socket.to(`project-${projectId}`).emit('clip-updated', {
      type: clipData.operation.type,
      ...clipData.operation
    });
  });

  // 添加片段
  socket.on('remote-add-clip', (projectId, clipData) => {
    console.log('发送远程添加片段:', projectId, clipData);
    socket.to(`project-${projectId}`).emit('clip-added', {
      type: 'add',
      clip: clipData.clip,
      trackId: clipData.clip.track_id
    });
  });

  // 删除片段
  socket.on('remote-delete-clip', (projectId, clipData) => {
    console.log('发送远程删除片段:', projectId, clipData);
    socket.to(`project-${projectId}`).emit('clip-deleted', {
      type: 'delete',
      trackId: clipData.trackId,
      clipId: clipData.clipId
    });
  });

  // 编辑项目标题
  socket.on('remote-edit-title', (projectId, titleData) => {
    console.log('发送远程编辑项目标题:', projectId, titleData);
    socket.to(`project-${projectId}`).emit('title-updated', {
      type: 'title',
      title: titleData.title
    });
  });
  // 编辑项目描述
  socket.on('remote-edit-description', (projectId, descriptionData) => {
    console.log('发送远程编辑项目描述:', projectId, descriptionData);
    socket.to(`project-${projectId}`).emit('description-updated', {
      type: 'description',
      description: descriptionData.description
    });
  });
  // 编辑项目速度
  socket.on('remote-edit-bpm', (projectId, bpmData) => {
    console.log('发送远程编辑项目速度:', projectId, bpmData);
    socket.to(`project-${projectId}`).emit('bpm-updated', {
      type: 'bpm',
      bpm: bpmData.bpm
    });
  });



});


// 启动服务
const PORT = process.env.PORT || 7220;
httpServer.listen(PORT,'0.0.0.0',() => {
  console.log(`✅ REST API 和 Socket.IO 都已启动`);
});
