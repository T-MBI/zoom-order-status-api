const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// サンプルオーダーデータ（実際のシステムでは外部DBやAPIから取得）
const orderDatabase = {
  "ORD001": {
    ordernumber: "ORD001",
    status: "Processing",
    customer: "田中太郎",
    items: ["商品A", "商品B"],
    total: 15000,
    orderdate: "2025-01-15",
    estimateddelivery: "2025-01-25"
  },
  "ORD002": {
    ordernumber: "ORD002",
    status: "Shipped",
    customer: "佐藤花子",
    items: ["商品C"],
    total: 8500,
    orderdate: "2025-01-10",
    estimateddelivery: "2025-01-20",
    trackingnumber: "TRK123456789"
  },
  "ORD003": {
    ordernumber: "ORD003",
    status: "Delivered",
    customer: "鈴木一郎",
    items: ["商品D", "商品E", "商品F"],
    total: 22000,
    orderdate: "2025-01-05",
    deliverydate: "2025-01-18"
  }
};

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: "Zoom Contact Center Order Status API",
    version: "1.0.0",
    endpoints: {
      orderStatus: "/rest/zoomllv?q={ordernumber}:{{global_custom.Zoomllv.ordernumber}}&apikey=YOUR_API_KEY"
    }
  });
});

// オーダーステータス取得エンドポイント（ZoomのHTTPウィジェット対応）
app.get('/rest/zoomllv', (req, res) => {
  try {
    // クエリパラメータからオーダー番号を抽出
    const query = req.query.q;
    const apikey = req.query.apikey;
    
    // APIキーの簡易検証（実際の運用では強固な認証が必要）
    if (!apikey || apikey !== process.env.API_KEY) {
      return res.status(401).json({
        error: "Invalid API key",
        code: "UNAUTHORIZED"
      });
    }
    
    if (!query) {
      return res.status(400).json({
        error: "Query parameter 'q' is required",
        code: "MISSING_QUERY"
      });
    }
    
    // オーダー番号を抽出（"ordernumber":"ORD001" 形式から）
    const orderNumberMatch = query.match(/ordernumber['":]+"?([^'"}&]+)/i);
    
    if (!orderNumberMatch) {
      return res.status(400).json({
        error: "Order number not found in query",
        code: "INVALID_QUERY_FORMAT"
      });
    }
    
    const orderNumber = orderNumberMatch[1].trim();
    
    // データベースからオーダー情報取得
    const orderInfo = orderDatabase[orderNumber];
    
    if (!orderInfo) {
      return res.status(404).json({
        error: "Order not found",
        code: "ORDER_NOT_FOUND",
        ordernumber: orderNumber
      });
    }
    
    // レスポンス返却
    res.json({
      success: true,
      data: orderInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
});

// 全オーダー一覧取得（テスト用）
app.get('/orders', (req, res) => {
  res.json({
    success: true,
    orders: Object.values(orderDatabase),
    count: Object.keys(orderDatabase).length
  });
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/rest/zoomllv`);
});