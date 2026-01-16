// 地図とピン管理のメインスクリプト
let map;
let currentEditingPinId = null;
let pinsContainer;
let pinPopup;
let regionMarkers = [];
let currentActiveRegion = null;

// お気に入り管理用のユーティリティ関数
window.favoriteUtils = {
  // お気に入り一覧を取得
  getFavorites: function () {
    const favorites = localStorage.getItem("favoriteAttractions");
    return favorites ? JSON.parse(favorites) : [];
  },

  // お気に入りに追加
  addFavorite: function (attractionName) {
    const favorites = this.getFavorites();
    if (!favorites.includes(attractionName)) {
      favorites.push(attractionName);
      localStorage.setItem("favoriteAttractions", JSON.stringify(favorites));
      this.onFavoriteChange();
    }
  },

  // お気に入りから削除
  removeFavorite: function (attractionName) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(attractionName);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem("favoriteAttractions", JSON.stringify(favorites));
      this.onFavoriteChange();
    }
  },

  // お気に入りかどうかチェック
  isFavorite: function (attractionName) {
    return this.getFavorites().includes(attractionName);
  },

  // お気に入り変更時のコールバック（各ページで更新処理を実行）
  onFavoriteChange: function () {
    // カスタムイベントを発火して各ページで更新処理を実行
    window.dispatchEvent(new CustomEvent("favoritesChanged"));
  },

  // 指定された市にお気に入り登録された観光地があるかチェック
  hasFavoriteInRegion: function (regionName) {
    if (!window.toyamaRegions) return false;
    const region = window.toyamaRegions.find((r) => r.name === regionName);
    if (!region || !region.attractions) return false;

    const favorites = this.getFavorites();
    return region.attractions.some((attraction) =>
      favorites.includes(attraction.name)
    );
  },
};

// 富山県の主要地域データ（グローバルに公開）
window.toyamaRegions = [
  {
    name: "富山市",
    lng: 137.2113,
    lat: 36.6953,
    description:
      "富山県の県庁所在地。立山連峰を背景にした美しい街並みと、新鮮な海の幸が楽しめる都市です。",
    attractions: [
      {
        name: "富山城址公園",
        description:
          "富山城の跡地に造られた公園。春には桜が美しく、市民の憩いの場として親しまれています。",
        image: "images/toyamazyo.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/2YvBeHj771LnpCr77",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3199.1446714077324!2d137.20853580466957!3d36.6950612853543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff79088f31e0eb3%3A0x4dd7717cee383c0b!2z5a-M5bGx5Z-O5Z2A5YWs5ZyS!5e0!3m2!1sja!2sjp!4v1768378633975!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "富山市ガラス美術館",
        description:
          "ガラス工芸の美しさを堪能できる美術館。国内外のガラス作品が展示されており、ワークショップも開催されています。",
        image: "images/kirari.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/Hy5PMD4i7doQCSR16",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3199.420993819808!2d137.2126108762926!3d36.68842017399191!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff782a6c5744f49%3A0x75f8f79d715e75f!2z5a-M5bGx5biC44Ks44Op44K5576O6KGT6aSo!5e0!3m2!1sja!2sjp!4v1768379830144!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "富岩運河環水公園",
        description:
          "世界一美しいスターバックスに選ばれたこともある店舗が佇む、おしゃれな公園です。運河沿いの散策路では、のんびりとした時間を過ごせます。春には桜が満開になり、いっそう美しい景色が広がります。",
        image: "images/sutaba.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/wKMERo5BuHngMWnh8",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.5488831837915!2d137.21243289999998!3d36.709376899999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff79a0c9f0ead31%3A0xa22b4d88da54f6f3!2z5a-M5bKp6YGL5rKz55Kw5rC05YWs5ZyS!5e0!3m2!1sja!2sjp!4v1768384794541!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "八尾諏訪町",
        description:
          "全国的にも有名なおわら風の盆が行われる地。古い街並みで風情豊かな景観を楽しめます。",
        image: "images/owara.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/ZDtUF24VJJQAi5ir9",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6408.202374780539!2d137.12716171523644!3d36.575779334509285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff78b5d8297c183%3A0x1e9463ebbec2f60b!2z44GK44KP44KJ6aKo44Gu55uGIOirj-ioqueUug!5e0!3m2!1sja!2sjp!4v1768384918202!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "高岡市",
    lng: 137.0258,
    lat: 36.7547,
    description:
      "万葉のふるさととして知られる歴史ある街。高岡大仏や瑞龍寺など、見どころがたくさんあります。",
    attractions: [
      {
        name: "高岡大仏",
        description:
          "日本三大仏の一つに数えられる高岡大仏。高さ約15.85メートルの銅製の大仏で、高岡市のシンボルとして親しまれています。",
        image: "images/takaokadaibutu.webp",
        mapLinkUrl: "https://maps.app.goo.gl/nDAETJctvTg4fBvY9",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.041048782024!2d137.0145377762947!3d36.745585770775556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff783d0e41cd7fd%3A0xdae04c4d4c8f7f2f!2z6auY5bKh5aSn5LuP!5e0!3m2!1sja!2sjp!4v1768385079382!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "瑞龍寺",
        description:
          "加賀前田家の菩提寺として知られる臨済宗の寺院。国宝に指定された山門や仏殿は必見です。",
        image: "images/zuiryuuzi.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/dqQBP5uX7ckndvYu7",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.4570200921!2d137.00793387629423!3d36.735599771337725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff782e993de9327%3A0xf2f439d9e469fb6!2z55Ge6b6N5a-6!5e0!3m2!1sja!2sjp!4v1768385196743!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "高岡古城公園",
        description:
          "高岡城の跡地に造られた公園。桜の名所として知られ、春には多くの花見客で賑わいます。",
        image: "images/kozyokoen.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/vH4iQwYPDxiDtq6L8",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.8974607348523!2d137.0184149762947!3d36.74903227058151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff782b4e1fe7d77%3A0xbd12f4acd0d83a2b!2z6auY5bKh5Y-k5Z-O5YWs5ZyS!5e0!3m2!1sja!2sjp!4v1768385257826!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "魚津市",
    lng: 137.4067,
    lat: 36.8311,
    description:
      "蜃気楼で有名な魚津。美しい海岸線と新鮮な魚介類が自慢の港町です。",
    attractions: [
      {
        name: "花の森･天神山ガーデン",
        description: "花の森･天神山ガーデン",
        image: "images/hananomori.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/xcrhqXH2vvqTboWp7",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3193.633567885094!2d137.44655927629722!3d36.827299766170874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7a5675aeae85d%3A0xf95b2af69220ea9a!2z6Iqx44Gu5qOu44O75aSp56We5bGx44Ks44O844OH44Oz!5e0!3m2!1sja!2sjp!4v1768385391526!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "魚津水族館",
        description:
          "富山湾の生き物を中心に展示する水族館。ホタルイカや深海魚など、地元の海の生き物を観察できます。",
        image: "images/uodusuizokukann.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/jBmnjVUDuxLaU18v9",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.8411074818055!2d137.3856191762963!3d36.7983598678024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7a4bd301526a7%3A0xbe46871f4ae41060!2z6a2a5rSl5rC05peP6aSo!5e0!3m2!1sja!2sjp!4v1768385474599!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "氷見市",
    lng: 136.9889,
    lat: 36.8567,
    description:
      "氷見牛で知られる食のまち。漁港から届く新鮮な魚介類も楽しめます。",
    attractions: [
      {
        name: "氷見漁港場外市場「ひみ番屋街」",
        description:
          "氷見のおいしいものが集結している氷見の食文化発信施設。新鮮な魚介類が並び、地元の味を楽しむことができます。",
        image: "images/himigyokou.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/8CMZFcoxiY6fUokTA",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6384.171304047235!2d136.97771979357913!3d36.864368600000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff772484c84637d%3A0x55c0a0de59b92e80!2z5rC36KaL5ryB5riv5aC05aSW5biC5aC0IOOBsuOBv-eVquWxi-ihlw!5e0!3m2!1sja!2sjp!4v1768385562261!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "雨晴海岸(高岡市との境界付近)",
        description:
          "立山連峰を背景にした絶景で知られる海岸。特に朝日の美しさは格別で、多くの写真家が訪れます。",
        image: "images/amaharashi.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/8qpWzLD8QJwtWBqe8",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.1521604742506!2d137.03948387629694!3d36.81487356687168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff777c360d22897%3A0x2a10f941cf8fac42!2z6Zuo5pm05rW35bK4!5e0!3m2!1sja!2sjp!4v1768385658975!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "WHARF&CO. HIMI GLAMPING RESORT",
        description:
          "富山県初のグランピング施設。氷見牛や新鮮な魚介を楽しめるBBQエリアや、テイクアウトエリアもあります。",
        image: "images/gurannpingu.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/os88VEnT1PR9thKw8",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.996685359931!2d136.98304937629874!3d36.86649816395878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff773078bf1e935%3A0xaab028912e2c9f98!2sWHARF%26CO.!5e0!3m2!1sja!2sjp!4v1768385769144!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "滑川市",
    lng: 137.3389,
    lat: 36.7667,
    description: "ホタルイカで有名な街。春のホタルイカ漁は必見です。",
    attractions: [
      {
        name: "ホタルイカミュージアム",
        description:
          "ホタルイカの生態や漁法について学べる博物館。滑川市の名物であるホタルイカについて詳しく知ることができます。",
        image: "images/hotaruika.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/EzEp4wuQLDZSqc6i7",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.85322188363!2d137.34191887629567!3d36.77408846917032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7a3270db11533%3A0x6d779889547929ae!2z44G744Gf44KL44GE44GL44Of44Ol44O844K444Ki44Og!5e0!3m2!1sja!2sjp!4v1768385860853!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "黒部市",
    lng: 137.45,
    lat: 36.8667,
    description:
      "黒部峡谷や宇奈月温泉など、自然豊かな観光地がたくさんあります。",
    attractions: [
      {
        name: "黒部峡谷",
        description:
          "日本三大峡谷の一つに数えられる黒部峡谷。トロッコ列車での観光が人気で、清流と緑豊かな自然が織りなす美しい景観が楽しめます。",
        image: "images/kurobetorokko.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/JnA222G2jYdYu1iW7",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.16114861088!2d137.58473152629688!3d36.81465816688347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7b115f45de33d%3A0x4c26667166b62ba!2z6buS6YOo5bOh6LC344OI44Ot44OD44Kz6Zu76LuK!5e0!3m2!1sja!2sjp!4v1768386025792!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "宇奈月温泉",
        description:
          "黒部峡谷の入口にある温泉街。黒部川の清流を眺めながら、ゆっくりと温泉を楽しむことができます。",
        image: "images/unadukionnsenn.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/YBdtnRqE47geG4PZ9",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.0653695038923!2d137.58217225!3d36.81695345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7b115cc1ecdff%3A0x4d98cbe70baa6c0c!2z5a6H5aWI5pyI5rip5rOJ6aeF!5e0!3m2!1sja!2sjp!4v1768436909545!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "砺波市",
    lng: 136.9667,
    lat: 36.65,
    description:
      "チューリップのまちとして知られ、春には美しい花畑が広がります。",
    attractions: [
      {
        name: "砺波チューリップ公園",
        description:
          "春には約300万本のチューリップが咲き誇る公園。色とりどりの花畑は圧巻で、多くの観光客が訪れます。",
        image: "images/tyu-rippukouenn.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/qm8zne1VFtLSSnHw7",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3201.4264425013534!2d136.95946157629092!3d36.6401903767023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7876f7fba6f37%3A0xda5a13b27fa53f90!2z56C65rOi44OB44Ol44O844Oq44OD44OX5YWs5ZyS!5e0!3m2!1sja!2sjp!4v1768437077849!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "チューリップ四季彩館",
        description:
          "チューリップ四季彩館は特別な技術で一年中いつでもチューリップをご覧いただくことができる世界で唯一の施設です。館内では、土の中に埋まる球根が持つヒミツや、チューリップを愛する人の歴史・文化をちょっと不思議な体験と共に巡ることができます。",
        image: "images/sikisaikann.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/5vKWByR6Lo7BtLMV8",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3201.4264425013534!2d136.95946157629092!3d36.6401903767023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7876e5e17fa9f%3A0xcd8092623ccef6e3!2z44OB44Ol44O844Oq44OD44OX5Zub5a2j5b2p6aSo!5e0!3m2!1sja!2sjp!4v1768437122665!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "庄川峡",
        description:
          "海外から庄川峡への旅行客はこの5年で40倍、2017年には1万人を超えたという絶景スポット。特に冬の時期の庄川峡は必見です。",
        image: "images/shogawa.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/e7vB1g7i5caMAnGr5",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6409.642888817919!2d137.0017510964614!3d36.55841800722558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff826c41fac784d%3A0x9157267299ecbdec!2z5bqE5bed5bOh6YGK6Kan6Ii5IOiIueedgOWgtA!5e0!3m2!1sja!2sjp!4v1768437231433!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "小矢部市",
    lng: 136.8667,
    lat: 36.6667,
    description: "四季折々の風景、歴史ロマン溢れる名所も多い街です。",
    attractions: [
      {
        name: "稲葉山牧野",
        description:
          "牧場内にあるふれあい動物広場では、ヤギやウサギ、リスやテンジクネズミなど可愛い動物たちとふれあうことができます。１日10食限定のブランド牛「稲葉メルヘン牛」を使用したハンバーグ定食は絶品です。",
        image: "images/meruhen.png",
        mapLinkUrl: "https://maps.app.goo.gl/5Q82M8xmsvQ3CKGv9",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.5750787602883!2d136.87088337629342!3d36.70874757284873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff77f9c42859c2d%3A0x2b0e3882e826257e!2z56iy6JGJ5bGx54mn6YeO!5e0!3m2!1sja!2sjp!4v1768437317303!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "南砺市",
    lng: 136.9,
    lat: 36.55,
    description:
      "五箇山の合掌造り集落で有名。世界遺産に登録された貴重な文化遺産があります。",
    attractions: [
      {
        name: "五箇山合掌造り集落",
        description:
          "世界遺産に登録された合掌造り集落。白川郷と並ぶ日本の原風景が残る貴重な場所です。",
        image: "images/gassyoudukuri.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/TRxZ3h7BEM9rEKMy7",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12841.201375019582!2d136.9253192683907!3d36.42611962311815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff8160fca0169d9%3A0x1bb62ba0a8da831c!2z44CSOTM5LTE5MTUg5a-M5bGx55yM5Y2X56C65biC55u45YCJIOS6lOeuh-WxsQ!5e0!3m2!1sja!2sjp!4v1768437377885!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "射水市",
    lng: 137.0833,
    lat: 36.7167,
    description:
      "新湊大橋や海王丸パークなど、海と親しめる観光スポットが充実しています。",
    attractions: [
      {
        name: "海王丸パーク",
        description:
          "大型帆船「海王丸」を展示する公園。船内見学ができ、海の歴史を学ぶことができます。",
        image: "images/kaioumaru.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/8N31yvnFfXuZm5zc8",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.599880134436!2d137.10663412629566!3d36.78016511882798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff79ddf3f73dc23%3A0xe86a54bf0146fe7e!2z5rW3546L5Li444OR44O844Kv!5e0!3m2!1sja!2sjp!4v1768437459962!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "内川エリア",
        description:
          "「日本のベニス」と称される約3.5kmの内川の両岸には、漁船が連なって係留され、どこか懐かしい港町の雰囲気が漂い、レンタル着物での散策も人気です。",
        image: "images/utikawa.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/Gpx4xMb5wNGX7wje9",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.5655403591636!2d137.0829150080681!3d36.78098872557866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff79d582a1cb113%3A0x761876265abab11!2z5paw5rmK5YaF5bed!5e0!3m2!1sja!2sjp!4v1768437608709!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "立山町",
    lng: 137.3167,
    lat: 36.5833,
    description:
      "立山連峰の玄関口。立山黒部アルペンルートの出発点として多くの観光客が訪れます。",
    attractions: [
      {
        name: "立山黒部アルペンルート",
        description:
          "標高3,000m級の山々を結ぶ観光ルート。ケーブルカーやロープウェイを乗り継ぎながら、雄大な自然を楽しめます。",
        image: "images/ro-pu.png",
        mapLinkUrl: "https://maps.app.goo.gl/oJjvAcnQqxME7Bfk9",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51260.688282673545!2d137.36938164863278!3d36.58320540000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7ef694982fbe7%3A0xec337af679bf641a!2z56uL5bGx6buS6YOo44Ki44Or44Oa44Oz44Or44O844OI44GN44Gj44G35aOy44KK5aC0!5e0!3m2!1sja!2sjp!4v1768437794571!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "みくりが池",
        description:
          "約1万年前にできた周囲約630ｍ、水深約15ｍの火山湖。その美しい姿から、北アルプスで最も美しい火山湖といわれています。",
        image: "images/mikurigaike.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/FqsP3DVonsrUrkqj8",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3203.8865470191968!2d137.59465337628887!3d36.5809517300272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7e7dcfc6e8ebd%3A0xf5306d15be33ac59!2z44G_44GP44KK44GM5rGg!5e0!3m2!1sja!2sjp!4v1768437872699!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "雪の大谷",
        description:
          "除雪の際にできる「雪の壁」でできあがった約500ｍの区間。 雪の白と青空のコントラストに清々しさを覚えます。",
        image: "images/yukiootani.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/6E3qENgz8QL5Q3GK9",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3204.088475599128!2d137.5890186762886!3d36.576085680300196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7ee9a2676bc07%3A0xa9e04c6329b57e7d!2z6Zuq44Gu5aSn6LC3!5e0!3m2!1sja!2sjp!4v1768437919508!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "黒部ダム",
        description:
          "日本一の高さを誇るアーチ式ダム。観光放水は圧巻で、多くの観光客が訪れる人気スポットです。",
        image: "images/kurobedamu.png",
        mapLinkUrl: "https://maps.app.goo.gl/NMcr8pyGrWnau2wv8",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3204.4819791256946!2d137.66031937628827!3d36.5666014808319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7ee9a2676bc07%3A0xde13fd9614c9785e!2z6buS6YOo44OA44Og!5e0!3m2!1sja!2sjp!4v1768437972837!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "上市町",
    lng: 137.3667,
    lat: 36.7,
    description: "自然豊かな山間の町。温泉やハイキングコースが楽しめます。",
    attractions: [
      {
        name: "大岩山日石寺（おおいわさんにっせきじ）",
        description:
          "千三百年の歴史を誇る、真言密宗の大本山。白装束に身を包んで滝に打たれる六本滝の滝行や名物の「大岩そうめん」が有名です。",
        image: "images/nissekizi.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/7jxstQU5eVMYKCaK7",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3200.5103302325656!2d137.38858307629178!3d36.66222907546401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff794ef6b023fdf%3A0x3d8315bf3640f4a3!2z5pel55-z5a-6!5e0!3m2!1sja!2sjp!4v1768438072000!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "花の家",
        description:
          "細田守監督によるアニメ映画「おおかみこどもの雨と雪」。主人公「花」の家族が暮らす舞台のモデルとなった古民家です。",
        image: "images/ookami.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/Nib1wuJkm5GtJ8p18",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3200.6031364870664!2d137.40319617629146!3d36.65999697558954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff794de9ba73f4f%3A0x157b0e6c5d256cbe!2z44GK44GK44GL44G_44GT44Gp44KC44Gu6Iqx44Gu5a62!5e0!3m2!1sja!2sjp!4v1768438130676!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "入善町",
    lng: 137.45,
    lat: 36.9167,
    description: "美しい海岸線と豊かな自然に囲まれた、のどかな町です。",
    attractions: [
      {
        name: "入善フラワーロード",
        description:
          "入善町の特産品であり、町の花でもあるチューリップが自然の中で咲きならび、開花から摘花まで、日々変化する姿をお楽しみいただけます。また、色とりどりの鮮やかなチューリップが青空と残雪の北アルプスを背景に広がる光景は訪れる人に感動を与えます。",
        image: "images/nyuzenn.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/t3ntxrmMTTWZcYFP7",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3189.5880424430416!2d137.44989017630076!3d36.924112960703916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7ab007979c2eb%3A0x7c50961028d190ea!2z44Gr44KF44GG44Gc44KT44OV44Op44Ov44O844Ot44O844OJMjAyNA!5e0!3m2!1sja!2sjp!4v1768438320417!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
  {
    name: "朝日町",
    lng: 137.5667,
    lat: 36.95,
    description: "日本海に面した美しい海岸線と、新鮮な海の幸が楽しめる町です。",
    attractions: [
      {
        name: "ヒスイ海岸",
        description:
          "ここヒスイ海岸には砂がありません。日本でも珍しい小石の海岸です。ブルーやグリーン、そしてコバルト色に輝く五色の小石が海岸にちりばめられ、海岸の小石が全て宝石に見える美しい海岸です。何と言っても青緑色に輝く翡翠（ヒスイ）の原石があるため、海水まで綺麗な海水まで綺麗なエメラルドグリーンに見えます。",
        image: "images/hisuikaigan.jpg",
        mapLinkUrl: "https://maps.app.goo.gl/3snX3LwPf5eR39gQ8",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6374.911554706654!2d137.58448619189514!3d36.975052533816836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff655002297fea1%3A0x56185d8a5b74e683!2z44OS44K544Kk5rW35bK477yI5a6u5bSO44O75aKD5rW35bK477yJ!5e0!3m2!1sja!2sjp!4v1768438397908!5m2!1sja!2sjp",
        link: "gallery.html",
      },
      {
        name: "春の四重奏",
        description:
          "朝日町の舟川べりでは、４月上旬から中旬にかけて「あさひ舟川 春の四重奏」と呼ばれる美しい景色に出会えます。1957年に地元の人たちによって植えられた舟川べりの桜並木と残雪の朝日岳を背景に、チューリップと菜の花畑が広がっています。真心を込めてつくられた絶景をひと目見ようと、毎年たくさんの人が訪れています。",
        image: "images/harunosizyuusou.jpeg",
        mapLinkUrl: "https://maps.app.goo.gl/j5jf2L3sxmMyRtFz7",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3188.9132596392783!2d137.53551347630136!3d36.94023995979235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff6556a32f2b68b%3A0xb0f26e226271534b!2z44GC44GV44Gy6Iif5bed44CM5pil44Gu5Zub6YeN5aWP44CN!5e0!3m2!1sja!2sjp!4v1768438516253!5m2!1sja!2sjp",
        link: "gallery.html",
      },
    ],
  },
];

// データストレージキー
const STORAGE_KEY = "toyama_map_pins";

// Mapboxアクセストークン（無料プランを使用する場合は、Mapboxアカウントから取得してください）
// 参考: https://account.mapbox.com/access-tokens/
mapboxgl.accessToken =
  "pk.eyJ1IjoiZnVtb3RvIiwiYSI6ImNtYXhqbGZ4bDBiOWwybHB3a3R5dmk3Z2kifQ.vXgn2UF6HVT0cnnQRmLO1A";

// ローカルストレージからデータを読み込む
function loadPinsFromStorage() {
  const savedPins = localStorage.getItem(STORAGE_KEY);
  if (savedPins) {
    return JSON.parse(savedPins);
  }
  return [];
}

// ローカルストレージにデータを保存
function savePinsToStorage(pins) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
}

// 画像をBase64に変換
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 座標をピクセル位置に変換
function lngLatToPixel(lng, lat) {
  const point = map.project([lng, lat]);
  return { x: point.x, y: point.y };
}

// ピクセル位置を座標に変換
function pixelToLngLat(x, y) {
  return map.unproject([x, y]);
}

// ピンをマップに追加
function addPinToMap(pinData) {
  const pinElement = document.createElement("div");
  pinElement.className = "pin-svg";
  pinElement.dataset.pinId = pinData.id;

  const pinImage = document.createElement("img");
  pinImage.src = pinData.image || "images/mainvisual01.png";
  pinImage.alt = pinData.title || "ピン";
  pinImage.className = "pin-normal-icon";

  // 編集モード用のアイコン
  const editIcon = document.createElement("div");
  editIcon.className = "pin-edit-icon";
  editIcon.innerHTML = "✏️";
  editIcon.style.display = "none";

  pinElement.appendChild(pinImage);
  pinElement.appendChild(editIcon);

  // 個別の位置更新関数
  function updatePosition() {
    // このピンが固定されている場合は更新しない
    if (pinElement._isFixed) {
      return;
    }
    // このピンが編集中の場合は更新しない
    if (currentEditingPinId === pinData.id) {
      return;
    }

    const pixelPos = lngLatToPixel(pinData.lng, pinData.lat);
    pinElement.style.left = pixelPos.x + "px";
    pinElement.style.top = pixelPos.y + "px";
  }

  // 座標をピクセル位置に変換して配置
  updatePosition();

  // 地図のイベントに個別の位置更新関数を登録
  map.on("move", updatePosition);
  map.on("zoom", updatePosition);

  // 位置更新関数をピン要素に保存（後で削除できるように）
  pinElement._updatePosition = updatePosition;

  // クリックイベント
  pinElement.addEventListener("click", function (e) {
    e.stopPropagation();

    // アイコンを編集モードに切り替え
    const pinImage = pinElement.querySelector(".pin-normal-icon");
    const editIcon = pinElement.querySelector(".pin-edit-icon");
    if (pinImage) pinImage.style.display = "none";
    if (editIcon) editIcon.style.display = "flex";
    pinElement.classList.add("editing");

    // ピンの位置を即座に固定
    const container = map.getContainer();
    const rect = container.getBoundingClientRect();
    const pixelPos = lngLatToPixel(pinData.lng, pinData.lat);
    pinElement.style.position = "fixed";
    pinElement.style.left = rect.left + pixelPos.x + "px";
    pinElement.style.top = rect.top + pixelPos.y + "px";
    pinElement.style.pointerEvents = "none";
    pinElement._isFixed = true;

    showPinDetail(pinData.id);
  });

  // ホバーでポップアップ表示
  let popupTimeout;
  pinElement.addEventListener("mouseenter", function () {
    if (pinData.title) {
      popupTimeout = setTimeout(() => {
        showPinPopup(pinElement, pinData.title);
      }, 300);
    }
  });

  pinElement.addEventListener("mouseleave", function () {
    if (popupTimeout) {
      clearTimeout(popupTimeout);
    }
    hidePinPopup();
  });

  pinsContainer.appendChild(pinElement);
}

// ピンポップアップを表示
function showPinPopup(pinElement, text) {
  const rect = pinElement.getBoundingClientRect();
  const mapRect = document.getElementById("map").getBoundingClientRect();

  pinPopup.textContent = text;
  pinPopup.style.left = rect.left - mapRect.left + rect.width / 2 + "px";
  pinPopup.style.top = rect.top - mapRect.top + "px";
  pinPopup.classList.add("show");
}

// ピンポップアップを非表示
function hidePinPopup() {
  pinPopup.classList.remove("show");
}

// ピンの詳細を表示（詳細パネルを開く）
function showPinDetail(pinId) {
  const pins = loadPinsFromStorage();
  const pin = pins.find((p) => p.id === pinId);

  if (!pin) return;

  const detailPanel = document.getElementById("detailPanel");
  const detailTitle = document.getElementById("detailTitle");
  const detailImage = document.getElementById("detailImage");
  const detailDescription = document.getElementById("detailDescription");

  if (detailTitle) detailTitle.textContent = pin.title || "タイトルなし";
  if (detailImage) {
    if (pin.image) {
      detailImage.src = pin.image;
      detailImage.style.display = "block";
    } else {
      detailImage.style.display = "none";
    }
  }
  if (detailDescription)
    detailDescription.textContent = pin.description || pin.title || "説明なし";

  currentEditingPinId = pinId;
  detailPanel.classList.add("active");

  // 地図の操作を無効化
  if (map) {
    map.boxZoom.disable();
    map.scrollZoom.disable();
    map.dragPan.disable();
    map.dragRotate.disable();
    map.keyboard.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();
  }
}

// ピンを削除
function deletePin(pinId) {
  if (!confirm("このピンを削除してもよろしいですか？")) {
    return;
  }

  // DOMから削除
  const pinElement = pinsContainer.querySelector(`[data-pin-id="${pinId}"]`);
  if (pinElement) {
    pinElement.remove();
  }

  // ストレージから削除
  const pins = loadPinsFromStorage();
  const filteredPins = pins.filter((p) => p.id !== pinId);
  savePinsToStorage(filteredPins);

  // 詳細パネルを閉じる
  const detailPanel = document.getElementById("detailPanel");
  if (detailPanel) {
    detailPanel.classList.remove("active");
  }
}

// ピンを保存
async function savePin(pinData) {
  let pins = loadPinsFromStorage();

  if (pinData.id) {
    // 既存のピンを更新
    const index = pins.findIndex((p) => p.id === pinData.id);
    if (index !== -1) {
      pins[index] = { ...pins[index], ...pinData };

      // DOM要素を更新
      const pinElement = pinsContainer.querySelector(
        `[data-pin-id="${pinData.id}"]`
      );
      if (pinElement) {
        const pinImage = pinElement.querySelector("img");
        if (pinImage && pinData.image) {
          pinImage.src = pinData.image;
        }
        // 位置を更新
        const pixelPos = lngLatToPixel(pinData.lng, pinData.lat);
        pinElement.style.left = pixelPos.x + "px";
        pinElement.style.top = pixelPos.y + "px";
      }
    }
  } else {
    // 新しいピンを作成
    const newPin = {
      id: Date.now(),
      ...pinData,
    };
    pins.push(newPin);
    addPinToMap(newPin);
  }

  savePinsToStorage(pins);
}

// Firebase関連の変数
let currentUID = null;
let firebasePins = [];

// 地図の初期化
document.addEventListener("DOMContentLoaded", function () {
  console.log("Map initialization started");

  pinsContainer = document.getElementById("pinsContainer");
  pinPopup = document.getElementById("pinPopup");

  if (!pinsContainer) {
    console.error("Map elements not found!");
    return;
  }

  // Mapbox地図を初期化（富山県を中心に）
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v11", // ライトグレースタイルを使用
    center: [137.2113, 36.6953], // 富山県の中心座標（富山市）
    zoom: 10, // 初期ズームレベル
    minZoom: 8, // 最小ズームレベル
    maxZoom: 18, // 最大ズームレベル
    maxBounds: [
      [136.5, 36.2], // 南西の境界
      [137.8, 37.2], // 北東の境界
    ], // 地図の移動範囲を制限（富山県周辺）
    pitchWithRotate: false,
    dragRotate: false,
  });

  // 地図読み込み後に日本語ラベルを設定
  map.on("style.load", function () {
    // 日本語ラベルを有効にする
    const layers = map.getStyle().layers;
    layers.forEach(function (layer) {
      if (
        layer.type === "symbol" &&
        layer.layout &&
        layer.layout["text-field"]
      ) {
        // 日本語フォントを使用するように設定
        map.setLayoutProperty(layer.id, "text-field", [
          "coalesce",
          ["get", "name_ja"],
          ["get", "name"],
        ]);
      }
    });
  });

  // Firebase認証完了を待つ関数
  function waitForFirebaseAuth() {
    return new Promise((resolve) => {
      // 既に認証が完了している場合
      if (window.currentUID) {
        currentUID = window.currentUID;
        console.log("既に認証済み。現在のユーザー UID:", currentUID);
        resolve();
        return;
      }

      // 認証完了を待つ
      const authHandler = () => {
        currentUID = window.currentUID;
        console.log("Firebase認証完了。現在のユーザー UID:", currentUID);
        window.removeEventListener("firebaseAuthReady", authHandler);
        resolve();
      };

      window.addEventListener("firebaseAuthReady", authHandler);

      // タイムアウト（10秒待っても認証が完了しない場合）
      setTimeout(() => {
        if (!currentUID) {
          console.warn("Firebase認証がタイムアウトしました");
          window.removeEventListener("firebaseAuthReady", authHandler);
          resolve(); // タイムアウトしても続行（エラーは後で処理）
        }
      }, 10000);
    });
  }

  // Firebaseからピンを読み込む関数
  function loadFirebasePins() {
    if (
      window.firebaseOnChildAdded &&
      window.firebaseRef &&
      window.firebaseDatabase
    ) {
      const pinsRef = window.firebaseRef(window.firebaseDatabase, "pins");

      // 既存のピンを読み込む
      if (window.firebaseOnValue) {
        window.firebaseOnValue(pinsRef, (snapshot) => {
          const pinsData = snapshot.val();
          if (pinsData) {
            Object.keys(pinsData).forEach((pinKey) => {
              const pinData = pinsData[pinKey];
              // 既に読み込まれているかチェック
              const exists = firebasePins.find((p) => p.firebaseKey === pinKey);
              if (!exists && pinData.lng && pinData.lat) {
                const firebasePin = {
                  id: pinKey,
                  lng: pinData.lng,
                  lat: pinData.lat,
                  title: pinData.text || "",
                  description: pinData.text || "",
                  image: pinData.imageBase64 || pinData.imageURL || null,
                  firebaseKey: pinKey,
                  uid: pinData.uid,
                };
                firebasePins.push(firebasePin);
                addPinToMap(firebasePin);
              }
            });
          }
        });
      }

      // 新しいピンが追加されたとき
      window.firebaseOnChildAdded(pinsRef, (snapshot) => {
        const pinData = snapshot.val();
        const pinKey = snapshot.key;

        // 既に読み込まれているかチェック
        const exists = firebasePins.find((p) => p.firebaseKey === pinKey);
        if (!exists && pinData && pinData.lng && pinData.lat) {
          const firebasePin = {
            id: pinKey,
            lng: pinData.lng,
            lat: pinData.lat,
            title: pinData.text || "",
            description: pinData.text || "",
            image: pinData.imageBase64 || pinData.imageURL || null,
            firebaseKey: pinKey,
            uid: pinData.uid,
          };

          firebasePins.push(firebasePin);
          addPinToMap(firebasePin);
        }
      });

      // ピンが削除されたとき
      if (window.firebaseOnChildRemoved) {
        window.firebaseOnChildRemoved(pinsRef, (snapshot) => {
          const pinKey = snapshot.key;
          const index = firebasePins.findIndex((p) => p.firebaseKey === pinKey);
          if (index !== -1) {
            const pin = firebasePins[index];
            const pinElement = pinsContainer.querySelector(
              `[data-pin-id="${pin.id}"]`
            );
            if (pinElement) {
              pinElement.remove();
            }
            firebasePins.splice(index, 1);
          }
        });
      }

      // ピンが更新されたとき
      if (window.firebaseOnChildChanged) {
        window.firebaseOnChildChanged(pinsRef, (snapshot) => {
          const pinData = snapshot.val();
          const pinKey = snapshot.key;
          const index = firebasePins.findIndex((p) => p.firebaseKey === pinKey);

          if (index !== -1 && pinData) {
            const pin = firebasePins[index];
            pin.title = pinData.text || "";
            pin.description = pinData.text || "";
            pin.image = pinData.imageBase64 || pinData.imageURL || null;

            // DOM要素を更新
            const pinElement = pinsContainer.querySelector(
              `[data-pin-id="${pin.id}"]`
            );
            if (pinElement) {
              const pinImage = pinElement.querySelector("img");
              if (pinImage && pin.image) {
                pinImage.src = pin.image;
              }
            }
          }
        });
      }
    }
  }

  // 地域マーカーを追加する関数
  function addRegionMarkers() {
    const regionsContainer = document.createElement("div");
    regionsContainer.id = "regionsContainer";
    regionsContainer.style.position = "absolute";
    regionsContainer.style.top = "0";
    regionsContainer.style.left = "0";
    regionsContainer.style.width = "100%";
    regionsContainer.style.height = "100%";
    regionsContainer.style.pointerEvents = "none";
    regionsContainer.style.zIndex = "150";
    document.body.appendChild(regionsContainer);

    toyamaRegions.forEach((region) => {
      const marker = document.createElement("div");
      marker.className = "region-marker";
      marker.dataset.regionName = region.name;

      const label = document.createElement("div");
      label.className = "region-label";

      // お気に入りマークを追加（該当市にお気に入り観光地がある場合）
      updateRegionFavoriteStar(label, region.name);

      label.appendChild(document.createTextNode(region.name));
      marker.appendChild(label);

      function updatePosition() {
        const pixelPos = lngLatToPixel(region.lng, region.lat);
        marker.style.left = pixelPos.x + "px";
        marker.style.top = pixelPos.y + "px";
        marker.style.transform = "translate(-50%, -50%)";
      }

      updatePosition();
      map.on("move", updatePosition);
      map.on("zoom", updatePosition);

      marker.addEventListener("click", function (e) {
        e.stopPropagation();
        showRegionDetail(region);

        // アクティブなマーカーのスタイルを更新
        regionMarkers.forEach((m) => m.classList.remove("active"));
        marker.classList.add("active");
        currentActiveRegion = marker;
      });

      regionsContainer.appendChild(marker);
      regionMarkers.push(marker);
    });
  }

  // 地域ラベルにお気に入りマークを更新する関数
  function updateRegionFavoriteStar(label, regionName) {
    // 既存のお気に入りマークを削除
    const existingStar = label.querySelector(".region-favorite-star");
    if (existingStar) {
      existingStar.remove();
    }

    // お気に入りマークを追加（該当市にお気に入り観光地がある場合）
    if (
      window.favoriteUtils &&
      window.favoriteUtils.hasFavoriteInRegion(regionName)
    ) {
      const favoriteStar = document.createElement("span");
      favoriteStar.className = "region-favorite-star";
      favoriteStar.innerHTML = "★";
      favoriteStar.style.color = "#FFD700";
      favoriteStar.style.marginRight = "6px";
      favoriteStar.style.fontSize = "16px";
      label.insertBefore(favoriteStar, label.firstChild);
    }
  }

  // すべての地域マーカーを更新する関数
  function updateAllRegionMarkers() {
    regionMarkers.forEach((marker) => {
      const regionName = marker.dataset.regionName;
      const label = marker.querySelector(".region-label");
      if (label) {
        // 市名のテキストノードを保持
        const textNodes = Array.from(label.childNodes).filter(
          (node) => node.nodeType === Node.TEXT_NODE
        );
        const cityName =
          textNodes.length > 0 ? textNodes[0].textContent.trim() : regionName;

        // ラベルを再構築
        label.innerHTML = "";
        updateRegionFavoriteStar(label, regionName);
        label.appendChild(document.createTextNode(cityName));
      }
    });
  }

  // 地域詳細を表示する関数
  function showRegionDetail(region) {
    const panel = document.getElementById("regionDetailPanel");
    const title = document.getElementById("regionTitle");
    const description = document.getElementById("regionDescription");
    const attractionsContainer = document.getElementById("regionAttractions");

    if (panel && title && description) {
      title.textContent = region.name;
      description.textContent = region.description;

      // MOREボタンを1つだけ生成
      if (attractionsContainer) {
        attractionsContainer.innerHTML = "";
        const moreButton = document.createElement("a");
        moreButton.href = `region-detail.html?region=${encodeURIComponent(
          region.name
        )}`;
        moreButton.className = "more-link-btn";
        moreButton.textContent = "もっと見る";
        attractionsContainer.appendChild(moreButton);
      }

      panel.classList.add("show");

      // 地図をその地域に移動
      map.flyTo({
        center: [region.lng, region.lat],
        zoom: 12,
        duration: 1000,
      });
    }
  }

  // 地域詳細パネルを閉じる
  const closeRegionBtn = document.getElementById("closeRegionBtn");
  const regionDetailPanel = document.getElementById("regionDetailPanel");
  if (closeRegionBtn && regionDetailPanel) {
    closeRegionBtn.addEventListener("click", function () {
      regionDetailPanel.classList.remove("show");
      if (currentActiveRegion) {
        currentActiveRegion.classList.remove("active");
        currentActiveRegion = null;
      }
    });
  }

  map.on("load", async function () {
    console.log("Map loaded successfully");

    // 地域マーカーを追加
    addRegionMarkers();

    // 保存されたピンを読み込んで表示
    const savedPins = loadPinsFromStorage();
    savedPins.forEach((pin) => {
      addPinToMap(pin);
    });

    // お気に入り変更時のイベントリスナー
    window.addEventListener("favoritesChanged", function () {
      updateAllRegionMarkers();
    });

    // Firebase認証を待つ
    await waitForFirebaseAuth();

    // Firebaseからピンを読み込む
    loadFirebasePins();
  });

  // 詳細パネルの閉じるボタン
  const closeButton = document.getElementById("closeButton");
  const detailPanel = document.getElementById("detailPanel");
  if (closeButton && detailPanel) {
    closeButton.addEventListener("click", function () {
      // ピンの固定を解除
      if (currentEditingPinId) {
        const pinElement = pinsContainer.querySelector(
          `[data-pin-id="${currentEditingPinId}"]`
        );
        if (pinElement) {
          // アイコンを通常モードに戻す
          const pinImage = pinElement.querySelector(".pin-normal-icon");
          const editIcon = pinElement.querySelector(".pin-edit-icon");
          if (pinImage) pinImage.style.display = "block";
          if (editIcon) editIcon.style.display = "none";
          pinElement.classList.remove("editing");

          pinElement.style.position = "absolute";
          pinElement.style.pointerEvents = "auto";
          pinElement._isFixed = false;
          // 位置を再計算
          if (pinElement._updatePosition) {
            pinElement._updatePosition();
          }
        }
      }

      detailPanel.classList.remove("active");
      currentEditingPinId = null;

      // 地図の操作を再有効化
      if (map) {
        map.boxZoom.enable();
        map.scrollZoom.enable();
        map.dragPan.enable();
        map.dragRotate.enable();
        map.keyboard.enable();
        map.doubleClickZoom.enable();
        map.touchZoomRotate.enable();
      }
    });
  }

  // 詳細パネルの削除ボタン
  const deleteButton = document.getElementById("deleteButton");
  if (deleteButton) {
    deleteButton.addEventListener("click", function () {
      if (currentEditingPinId) {
        // ピンの固定を解除
        const pinElement = pinsContainer.querySelector(
          `[data-pin-id="${currentEditingPinId}"]`
        );
        if (pinElement) {
          pinElement._isFixed = false;
        }

        deletePin(currentEditingPinId);
        detailPanel.classList.remove("active");

        // 地図の操作を再有効化
        if (map) {
          map.boxZoom.enable();
          map.scrollZoom.enable();
          map.dragPan.enable();
          map.dragRotate.enable();
          map.keyboard.enable();
          map.doubleClickZoom.enable();
          map.touchZoomRotate.enable();
        }
      }
    });
  }
});
