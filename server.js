const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 郵便局APIクライアント
class JapanPostAPI {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://stub-qz73x.da.pf.japanpost.jp/api/v1';
    this.clientId = process.env.CLIENT_ID || 'TEST7t6fj7eqC5v6UDaHlpvvtesttest';
    this.secretKey = process.env.SECRET_KEY || 'testGzhSdzpZ1muyICtest0123456789';
    this.token = null;
    this.tokenExpiry = null;
  }

  // トークンを取得
  async getToken() {
    try {
      const response = await axios.post(`${this.baseURL}/j/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        secret_key: this.secretKey
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        }
      });

      this.token = response.data.token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('トークンを取得しました');
      return this.token;
    } catch (error) {
      console.error('トークン取得エラー:', error.response?.data || error.message);
      throw new Error('トークンの取得に失敗しました');
    }
  }

  // 有効なトークンを取得（必要に応じて更新）
  async getValidToken() {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      await this.getToken();
    }
    return this.token;
  }

  // コード番号検索
  async searchCode(searchCode, options = {}) {
    try {
      const token = await this.getValidToken();

      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.choikitype) params.append('choikitype', options.choikitype);
      if (options.searchtype) params.append('searchtype', options.searchtype);
      if (options.ec_uid) params.append('ec_uid', options.ec_uid);

      const url = `${this.baseURL}/searchcode/${encodeURIComponent(searchCode)}${params.toString() ? '?' + params.toString() : ''}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('コード検索エラー:', error.response?.data || error.message);
      throw new Error('コード検索に失敗しました');
    }
  }
}

const japanPostAPI = new JapanPostAPI();

// API エンドポイント

// トークン取得エンドポイント
app.post('/api/token', async (req, res) => {
  try {
    const token = await japanPostAPI.getToken();
    res.json({
      success: true,
      message: 'トークンを取得しました',
      hasToken: !!token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// コード番号検索エンドポイント
app.post('/api/search', async (req, res) => {
  try {
    let { searchCode, page, limit, choikitype, searchtype, ec_uid } = req.body;

    if (!searchCode) {
      return res.status(400).json({
        success: false,
        error: '検索コードが必要です'
      });
    }

    // ハイフンを除去
    searchCode = searchCode.replace(/-/g, '');

    const options = {};
    if (page) options.page = page;
    if (limit) options.limit = limit;
    if (choikitype) options.choikitype = choikitype;
    if (searchtype) options.searchtype = searchtype;
    if (ec_uid) options.ec_uid = ec_uid;

    const result = await japanPostAPI.searchCode(searchCode, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// メインページ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
  console.log(`http://localhost:${PORT} でアクセスできます`);
});

module.exports = app;
