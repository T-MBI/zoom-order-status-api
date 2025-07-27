const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// サンプルオーダーデータ（日本語対応・注文者名追加・10個のサンプル）
const orderDatabase = {
  "1001": {
    "_id": "661c8e8a84c2df280001369f",
    "ordernumber": "1001",
    "ordername": "田中太郎",
    "orderstatus": "注文完了",
    "ordernotes": "ご注文ありがとうございました。2025年1月27日 14:00に商品の発送が完了いたしました。",
    "ordertrackingid": "Z1346792"
  },
  "1002": {
    "_id": "661c8e8a84c2df2800013700",
    "ordernumber": "1002",
    "ordername": "佐藤花子", 
    "orderstatus": "処理中",
    "ordernotes": "ご注文を受け付けました。現在、商品の準備を行っております。2営業日以内に発送予定です。",
    "ordertrackingid": "Z1346793"
  },
  "1003": {
    "_id": "661c8e8a84c2df2800013701",
    "ordernumber": "1003",
    "ordername": "鈴木一郎",
    "orderstatus": "配送中",
    "ordernotes": "商品を2025年1月25日に発送いたしました。現在配送業者にて輸送中です。お届けまでもうしばらくお待ちください。",
    "ordertrackingid": "Z1346794"
  },
  "1004": {
    "_id": "661c8e8a84c2df2800013702", 
    "ordernumber": "1004",
    "ordername": "高橋次郎",
    "orderstatus": "キャンセル",
    "ordernotes": "2025年1月20日にお客様よりキャンセルのご依頼をいただき、注文をキャンセルいたしました。",
    "ordertrackingid": "Z1346795"
  },
  "1005": {
    "_id": "661c8e8a84c2df2800013703",
    "ordernumber": "1005",
    "ordername": "山田美咲",
    "orderstatus": "配送完了",
    "ordernotes": "2025年1月26日 15:30に配送が完了いたしました。商品をご確認ください。ありがとうございました。",
    "ordertrackingid": "Z1346796"
  },
  "1006": {
    "_id": "661c8e8a84c2df2800013704",
    "ordernumber": "1006",
    "ordername": "渡辺健太",
    "orderstatus": "注文受付",
    "ordernotes": "ご注文を受け付けました。ご入金確認後、商品の準備を開始いたします。",
    "ordertrackingid": "Z1346797"
  },
  "1007": {
    "_id": "661c8e8a84c2df2800013705",
    "ordernumber": "1007",
    "ordername": "中村あかり",
    "orderstatus": "出荷準備中",
    "ordernotes": "商品の準備が完了し、現在出荷の準備を行っております。明日発送予定です。",
    "ordertrackingid": "Z1346798"
  },
  "1008": {
    "_id": "661c8e8a84c2df2800013706",
    "ordernumber": "1008",
    "ordername": "小林大輔",
    "orderstatus": "返品処理中",
    "ordernotes": "返品のご依頼を承りました。商品到着後、検品を行い返金処理を進めております。",
    "ordertrackingid": "Z1346799"
  },
  "1009": {
    "_id": "661c8e8a84c2df2800013707",
    "ordernumber": "1009",
    "ordername": "森田さゆり",
    "orderstatus": "入金待ち",
    "ordernotes": "ご注文ありがとうございます。お支払いの確認が取れ次第、商品の準備を開始いたします。",
    "ordertrackingid": "Z1346800"
  },
  "1010": {
    "_id": "661c8e8a84c2df2800013708",
    "ordernumber": "1010",
    "ordername": "加藤雄一",
    "orderstatus": "交換対応中",
    "ordernotes": "商品の不具合によるお取替えのご依頼を承りました。新しい商品を準備しております。",
    "ordertrackingid": "Z1346801"
  }
};

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: "Zoom Contact Center Order Status API",
    version: "1.0.0",
    endpoints: {
      orderStatus: "/rest/zoomllv?q={\"ordernumber\":\"ORDER_NUMBER\"}&apikey=YOUR_API_KEY",
      healthCheck: "/health",
      allOrders: "/orders"
    }
  });
});

// オーダーステータス取得エンドポイント（元のAPI形式に合わせた出力）
app.get('/rest/zoomllv', (req, res) => {
  try {
    // クエリパラメータからオーダー番号を抽出
    const query = req.query.q;
    const apikey = req.query.apikey;
    
    // APIキーの簡易検証
    if (!apikey || apikey !== process.env.API_KEY) {
      return res.status(401).json([{
        error: "Unauthorized",
        message: "Invalid API key"
      }]);
    }
    
    if (!query) {
      return res.status(400).json([{
        error: "Bad Request",
        message: "Query parameter 'q' is required"
      }]);
    }
    
    // JSONパースしてオーダー番号を取得
    let parsedQuery;
    try {
      parsedQuery = JSON.parse(decodeURIComponent(query));
    } catch (parseError) {
      return res.status(400).json([{
        error: "Bad Request",
        message: "Invalid query format. Expected JSON."
      }]);
    }
    
    const orderNumber = parsedQuery.ordernumber;
    
    if (!orderNumber) {
      return res.status(400).json([{
        error: "Bad Request",
        message: "ordernumber is required in query"
      }]);
    }
    
    // データベースからオーダー情報取得
    const orderInfo = orderDatabase[orderNumber];
    
    if (!orderInfo) {
      // 注文が見つからない場合は空の配列を返す（元のAPIに合わせる）
      return res.json([]);
    }
    
    // 元のAPI形式に合わせて配列で返す
    res.json([orderInfo]);
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json([{
      error: "Internal Server Error",
      message: "An error occurred while processing your request"
    }]);
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
