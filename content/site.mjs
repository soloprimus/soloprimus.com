// Site identity and interface copy. Essays live in content/essays/*.md.
// After editing anything in content/, run `node scripts/build.mjs`.

export const SITE = {
  url: 'https://soloprimus.com',
  // Pen names: change them here and rebuild.
  penName: { en: 'Solo Primus', caps: 'SOLO PRIMUS', zh: '凌霄' },
  links: {
    substack: 'https://substack.com/@soloprimus',
    x: 'https://x.com/veryzs',
  },
  langs: {
    en: { prefix: '', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_US' },
    zh: { prefix: '/zh', htmlLang: 'zh-CN', hreflang: 'zh-CN', ogLocale: 'zh_CN' },
  },
  topics: ['investing', 'ai', 'creator'],
};

export const T = {
  en: {
    skip: 'Skip to content',
    homeLabel: 'Solo Primus, home',
    navLabel: 'Main',
    nav: { essays: 'Essays', topics: 'Topics', about: 'About', subscribe: 'Subscribe' },
    otherLang: { label: '中文', title: 'Read this site in Chinese' },
    theme: { toDark: 'Switch to dark theme', toLight: 'Switch to light theme' },
    menu: { open: 'Open menu', close: 'Close menu' },
    topics: { investing: 'Investing', ai: 'Applied AI', creator: 'Creative work' },
    levers: { investing: 'Capital', ai: 'Code', creator: 'Media' },
    date: (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }),
    shortDate: (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }),
    minRead: (n) => `${n} min read`,

    home: {
      title: 'Solo Primus · Essays on investing, AI, and creative work',
      description: 'Solo Primus is an assistant professor with a PhD in economics and a background in electronic information engineering, writing about investing, applied AI, and creative work.',
      eyebrow: 'Investing · Applied AI · Creative work',
      h1: ['Think like an economist.', 'Build like an engineer.'],
      lead: 'I’m Solo Primus, an assistant professor with a PhD in economics and a background in electronic information engineering. I write about three kinds of leverage one person can use: capital, code, and media.',
      facts: [
        ['PhD', 'Economics'],
        ['Role', 'Assistant professor'],
        ['Training', 'Electronic information engineering'],
        ['Research', 'Multiple published papers'],
      ],
      primary: 'Start reading',
      secondary: 'Follow on Substack',
      heroAlt: 'Platinum and copper mountain sculpture with a winding path to the summit',
      leverEyebrow: 'Three kinds of leverage',
      leverTitle: 'Capital, code, and media',
      leverIntro: 'Naval Ravikant describes capital, labor, code, and media as the main forms of leverage. Code and media cost almost nothing to copy, so one person can use them without asking anyone’s permission. My essays work on three of them.',
      cards: {
        investing: { title: 'Understand the business. Question the price.', text: 'How value is created, where the risks sit, and what would make me reconsider.', link: 'Investing essays' },
        ai: { title: 'Give AI a job, not a wish list.', text: 'Pick a real task, count the whole workflow, and keep a human checkpoint.', link: 'AI essays' },
        creator: { title: 'Find your voice. Make it a practice.', text: 'A sustainable rhythm for making, publishing, and learning from readers.', link: 'Creative work essays' },
      },
      thesis: {
        label: 'Thesis card',
        caption: 'Four lines to write before buying anything.',
        rows: [['Business', 'Who pays, and for what?'], ['Counterargument', 'The strongest case against it'], ['Evidence', 'What would change my mind'], ['Review', 'When I check again']],
      },
      workflow: {
        label: 'Count the whole workflow',
        withAi: 'With AI',
        byHand: 'By hand',
        steps: ['Instructions', 'Draft', 'Check', 'Fix'],
        unit: 'min',
        caption: 'Illustrative. The draft takes 2 minutes; checking and fixing take 18.',
      },
      loop: { label: 'A publishing loop', steps: ['Make', 'Publish', 'Listen', 'Revise'], center: 'Repeat', caption: 'Small, finished pieces, improved each round.' },
      startEyebrow: 'Start here',
      startTitle: 'Essays worth starting with',
      alsoTitle: 'Also in Chinese',
      alsoNote: 'Longer essays, currently available in Chinese.',
      allEssays: 'All essays',
      introTitle: 'Hi, I’m Solo Primus.',
      intro: [
        'I have a background in electronic information engineering, earned a PhD in economics, and now work as an assistant professor. I have published a number of academic papers.',
        'Solo Primus is my pen name. It stands for a simple belief: an independent person who keeps learning and refining their work can reach a very high level.',
      ],
      introMore: 'More about me',
      principlesTitle: 'How I think',
      principles: ['Frameworks before forecasts.', 'Write down what would change my mind.', 'Count the whole cost, not only the visible part.', 'Revise when the evidence changes.'],
    },

    follow: {
      eyebrow: 'Subscribe',
      title: 'New essays, when they are ready.',
      text: 'Follow on Substack or add the RSS feed to your reader. Every essay is free to read.',
      substack: 'Follow on Substack',
      rss: 'RSS feed',
      x: 'Follow on X',
    },

    footer: {
      tagline: 'Think clearly. Act with intent.',
      disclaimer: 'Essays are for research and education. Nothing on this site is investment advice.',
      rss: 'RSS',
    },

    essays: {
      title: 'Essays · Solo Primus',
      description: 'Essays by Solo Primus on investing, applied AI, and creative work. Free to read.',
      eyebrow: 'Library',
      h1: 'Essays',
      lead: 'Frameworks for investing, applied AI, and creative work. Every essay is free to read.',
      all: 'All',
      filterLabel: 'Filter essays by topic',
      inChinese: 'In Chinese',
      inChineseNote: 'These essays are written in Chinese. Titles are translated here.',
      empty: 'No essays on this topic yet.',
      zhBadge: '中文',
    },

    article: {
      by: 'By',
      onThisPage: 'On this page',
      topicsTitle: 'Topics',
      readNext: 'Keep reading',
      authorTitle: 'About the author',
      authorBio: 'I’m Solo Primus (凌霄), an assistant professor with a PhD in economics and a background in electronic information engineering. I write about investing, applied AI, and creative work.',
      authorMore: 'More about me',
      alternate: 'Read in Chinese',
      allEssays: 'All essays',
    },

    about: {
      title: 'About Solo Primus',
      description: 'Solo Primus (凌霄) is an assistant professor with a PhD in economics and a background in electronic information engineering.',
      eyebrow: 'About',
      h1: 'About Solo Primus',
      lead: 'I’m Solo Primus, an assistant professor with a PhD in economics and a background in electronic information engineering. This site is where I write about investing, applied AI, and creative work.',
      sections: [
        {
          h: 'The name',
          p: [
            'Solo Primus is my pen name. Solo stands for the independent individual. Primus is Latin for “first.” Together they express a belief I hold: an independent person who keeps learning and refining their work can reach a very high level and achieve a great deal.',
            'My Chinese pen name is 凌霄 (Líng Xiāo), “above the clouds.” I start from myself, but the aim is not to stand apart from the world. The aim is to climb to a higher vantage point.',
            'The mark is a mountain with a winding path. Progress is rarely a straight line, but it can keep going up.',
          ],
        },
        {
          h: 'Background',
          p: [
            'I have a background in electronic information engineering and earned a PhD in economics. I now work as an assistant professor and have published a number of academic papers.',
            'Both disciplines shape how I write here. Engineering asks me to build something small and test it. Economics asks what it is worth, and why people choose it.',
          ],
        },
      ],
      writeTitle: 'What I write about',
      howTitle: 'How I write',
      howNote: 'Every essay is free to read.',
      disclosureTitle: 'Disclosures',
      disclosures: [
        'Nothing on this site is investment advice. I don’t know your situation, and companies mentioned in essays are there to illustrate ideas. Do your own research before making any decision.',
        'The site stores your color theme choice in your browser. It is hosted on Cloudflare, which records aggregate, cookie-free visit statistics. Substack and X have their own privacy policies.',
      ],
      elsewhereTitle: 'Elsewhere',
    },

    notFound: {
      title: 'Page not found · Solo Primus',
      h1: 'Page not found',
      text: 'This page doesn’t exist or has moved.',
      home: 'Go to the home page',
      essays: 'Browse essays',
    },
  },

  zh: {
    skip: '跳到正文',
    homeLabel: '凌霄 SOLO PRIMUS，返回首页',
    navLabel: '主导航',
    nav: { essays: '文章', topics: '专题', about: '关于', subscribe: '订阅' },
    otherLang: { label: 'English', title: '阅读英文版网站' },
    theme: { toDark: '切换到深色模式', toLight: '切换到浅色模式' },
    menu: { open: '打开菜单', close: '关闭菜单' },
    topics: { investing: '投资研究', ai: '人工智能', creator: '自主创作' },
    levers: { investing: '资本', ai: '代码', creator: '媒体' },
    date: (d) => `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`,
    shortDate: (d) => `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`,
    minRead: (n) => `约 ${n} 分钟`,

    home: {
      title: '凌霄 SOLO PRIMUS · 投资、人工智能与自主创作',
      description: '凌霄（SOLO PRIMUS），有电子信息工程背景的经济学博士，现任助理教授。写投资、人工智能与自主创作的框架与思考。',
      eyebrow: '投资研究 · 人工智能 · 自主创作',
      h1: ['像经济学家一样思考，', '像工程师一样动手。'],
      lead: '我是凌霄（SOLO PRIMUS），有电子信息工程背景的经济学博士，现任助理教授，发表过多篇学术论文。我在这里写一个人能用好的三种杠杆：资本、代码与媒体。',
      facts: [
        ['学位', '经济学博士'],
        ['职位', '助理教授'],
        ['背景', '电子信息工程'],
        ['研究', '多篇学术论文'],
      ],
      primary: '开始阅读',
      secondary: '在 Substack 关注',
      heroAlt: '铂金与铜色的山形雕塑，一条蜿蜒的小路通向山顶',
      leverEyebrow: '三种杠杆',
      leverTitle: '资本、代码与媒体',
      leverIntro: 'Naval Ravikant 把杠杆分为资本、劳动力、代码和媒体。代码和媒体几乎没有复制成本，一个人不需要任何人许可就能使用。我的文章围绕其中三种展开。',
      cards: {
        investing: { title: '越过喧嚣，看清价值。', text: '价值如何产生，风险在哪里，什么会让我重新考虑。', link: '投资文章' },
        ai: { title: '善假于物，一人亦可成事。', text: '选一项真实任务，算清整个流程，保留人的核验。', link: '人工智能文章' },
        creator: { title: '以己之见，成有恒之作。', text: '建立可持续的节奏：创作、发布、倾听、复盘。', link: '创作文章' },
      },
      thesis: {
        label: '论点卡',
        caption: '买入之前，先写下这四行。',
        rows: [['生意', '谁付钱，为什么付？'], ['反方', '最有力的反对理由'], ['证据', '什么会让我改主意'], ['复盘', '什么时候再看']],
      },
      workflow: {
        label: '算总账',
        withAi: '用 AI',
        byHand: '人工完成',
        steps: ['写指令', '生成', '核对', '修正'],
        unit: '分钟',
        caption: '示意：生成初稿只要 2 分钟，核对和修正要 18 分钟。',
      },
      loop: { label: '发布循环', steps: ['创作', '发布', '倾听', '复盘'], center: '循环', caption: '小而完整的作品，每一轮都更好一点。' },
      startEyebrow: '从这里开始',
      startTitle: '先读这几篇',
      allEssays: '全部文章',
      introTitle: '你好，我是凌霄。',
      intro: [
        '我有电子信息工程的学科背景，之后取得经济学博士学位，现任助理教授，发表过多篇学术论文。',
        'SOLO PRIMUS 是我的英文笔名，凌霄是中文笔名。我相信，一个独立的人，通过持续的学习和精进，也能登临更高之境。',
      ],
      introMore: '更多关于我',
      principlesTitle: '我的思考方式',
      principles: ['先立框架，再谈预测。', '写下什么会让我改变主意。', '算总账，不只算看得见的那一笔。', '证据变了，判断就跟着改。'],
    },

    follow: {
      eyebrow: '订阅',
      title: '新文章发布时，第一时间读到。',
      text: '在 Substack 关注，或把 RSS 加入你的阅读器。所有文章免费阅读。',
      substack: '在 Substack 关注',
      rss: 'RSS 订阅',
      x: '关注 X',
    },

    footer: {
      tagline: '明辨。躬行。积微成著。',
      disclaimer: '本站内容用于研究与学习，不构成投资建议。',
      rss: 'RSS',
    },

    essays: {
      title: '文章 · 凌霄 SOLO PRIMUS',
      description: '凌霄（SOLO PRIMUS）关于投资、人工智能与自主创作的文章，全部免费阅读。',
      eyebrow: '文章库',
      h1: '文章',
      lead: '关于投资、人工智能与自主创作的框架与思考，全部免费阅读。',
      all: '全部',
      filterLabel: '按主题筛选文章',
      empty: '这个主题下还没有文章。',
    },

    article: {
      by: '作者',
      onThisPage: '本页目录',
      topicsTitle: '主题',
      readNext: '继续阅读',
      authorTitle: '关于作者',
      authorBio: '我是凌霄（SOLO PRIMUS），有电子信息工程背景的经济学博士，现任助理教授。我写投资、人工智能与自主创作。',
      authorMore: '更多关于我',
      alternate: '阅读英文版',
      allEssays: '全部文章',
    },

    about: {
      title: '关于凌霄 · SOLO PRIMUS',
      description: '凌霄（SOLO PRIMUS），有电子信息工程背景的经济学博士，现任助理教授，发表过多篇学术论文。',
      eyebrow: '关于',
      h1: '关于凌霄',
      lead: '我是凌霄（SOLO PRIMUS），有电子信息工程背景的经济学博士，现任助理教授。这个网站是我写投资、人工智能与自主创作的地方。',
      sections: [
        {
          h: '名字',
          p: [
            'SOLO PRIMUS 是我的英文笔名。Solo 指独立的个体，Primus 在拉丁语里是“第一”。合起来表达我相信的一件事：一个独立的人，通过持续的学习和精进，也能达到很高的境界，取得很高的成就。',
            '中文笔名是凌霄。我从自身出发，但目标不是孤立于世界，而是登临更高之境。',
            '网站的标志是一座山和一条蜿蜒向上的路。进步很少是一条直线，但可以一直向上。',
          ],
        },
        {
          h: '背景',
          p: [
            '我有电子信息工程的学科背景，之后取得经济学博士学位，现任助理教授，发表过多篇学术论文。',
            '两个学科都影响着我在这里的写作。工程让我先动手搭一个小东西，再去检验它；经济学让我追问它值多少，人们为什么这样选择。',
          ],
        },
      ],
      writeTitle: '我写什么',
      howTitle: '写作原则',
      howNote: '所有文章免费阅读。',
      disclosureTitle: '声明',
      disclosures: [
        '本站内容不构成投资建议。我不了解你的具体情况，文章里提到的公司仅用于说明问题。做任何决定之前，请独立研究。',
        '网站只在你的浏览器里保存明暗主题设置。网站托管在 Cloudflare，它会记录匿名、不使用 Cookie 的访问统计。Substack 与 X 适用各自的隐私政策。',
      ],
      elsewhereTitle: '在别处',
    },

    notFound: {
      title: '页面不存在 · 凌霄 SOLO PRIMUS',
      h1: '页面不存在',
      text: '这个页面不存在，或者已经移动。',
      home: '返回首页',
      essays: '浏览文章',
    },
  },
};
