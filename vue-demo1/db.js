// 引入 pg 库的 Pool 类，Pool 是连接池，管理多个数据库连接
import pg from 'pg';
const {Pool} = pg
// 创建连接池配置
const pool = new Pool({
    user: 'postgres',           // 【修改】你的 pgAdmin 用户名，默认 postgres
    host: 'localhost',          // 数据库在本机运行
    database: 'postgres', // 【修改】你创建的数据库名
    password: '060722wqlinfpjx',        // 【修改】你的 pgAdmin 密码
    port: 5432,                 // PostgreSQL 默认端口
});

// 导出 pool，供其他文件使用
export default pool;      // ES Module
