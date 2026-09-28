// Site identity and interface copy. Essays live in content/essays/*.md.
// English is the source text; each Chinese string is a faithful translation of the English beside it.
// After editing anything in content/, run `node scripts/build.mjs`.

export const SITE = {
  url: 'https://soloprimus.com',
  // Pen names: change them here and rebuild.
  penName: { en: 'Solo Primus', caps: 'SOLO PRIMUS', zh: '凌霄' },
  links: {
    substack: 'https://substack.com/@soloprimus',
    x: 'https://x.com/veryzg',
  },
  langs: {
    en: { prefix: '', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_US' },
    zh: { prefix: '/zh', htmlLang: 'zh-CN', hreflang: 'zh-CN', ogLocale: 'zh_CN' },
  },
  topics: ['investing', 'ai', 'growth'],
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
    topics: { investing: 'Investing', ai: 'AI', growth: 'Self-improvement' },
    date: (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }),
    shortDate: (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }),
    minRead: (n) => `${n} min read`,

    home: {
      title: 'Solo Primus · One person. Three levers. Unlimited upside.',
      description: 'Solo Primus is a professor with a PhD in economics and a seasoned investor, writing about investing, AI, and self-improvement.',
      eyebrow: 'Investing · AI · Self-improvement',
      h1: ['One person. Three levers.', 'Unlimited upside.'],
      pillars: [
        ['Investing', 'See through the noise of prices to what value really is.'],
        ['AI', 'See the essence and direction of technology, and be the one who rides the wave.'],
        ['Self-improvement', 'Understand human nature, understand yourself, and keep improving.'],
      ],
      // What readers gain: where they start, and where the essays take them.
      facts: [
        ['Chasing prices', 'Understanding value'],
        ['AI anxiety', 'Mastering AI'],
        ['Going with the crowd', 'Thinking independently'],
        ['Going in circles', 'Improving continuously'],
      ],
      factsTo: 'to',
      primary: 'Start reading',
      secondary: 'Follow on Substack',
      heroAlt: 'Platinum and copper mountain sculpture with a winding path to the summit',
      leverEyebrow: 'Three kinds of leverage',
      leverTitle: 'Capital, AI, and your own growth',
      leverIntro: 'One person can build on three kinds of leverage. Capital and AI multiply what you do. Your own growth multiplies you.',
      cards: {
        investing: { title: 'See value as it really is.', text: 'Start from first principles and understand what a business is really worth.', link: 'Investing essays' },
        ai: { title: 'Be the one who rides the wave.', text: 'See the essence of the technology and the direction of its trends.', link: 'AI essays' },
        growth: { title: 'Read human nature. Read yourself.', text: 'Turn experience into a method for continuous growth.', link: 'Self-improvement essays' },
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
      loop: { label: 'A growth loop', steps: ['Learn', 'Practice', 'Review', 'Adjust'], center: 'Repeat', caption: 'Each round a little better than the last.' },
      startEyebrow: 'Start here',
      startTitle: 'Essays worth starting with',
      alsoTitle: 'Also in Chinese',
      alsoNote: 'Longer essays, currently available in Chinese.',
      allEssays: 'All essays',
      introTitle: 'Hi, I’m Solo Primus.',
      intro: [
        'I’m a professor and a seasoned investor. I earned a PhD in economics, have a background in electronic information engineering, and have published a number of academic papers.',
        'Solo Primus is my pen name, and 凌霄 is my Chinese one. Both stand for one belief: an independent person who keeps learning and refining their work can reach a very high level.',
      ],
      introMore: 'More about me',
      principlesTitle: 'How I think',
      principles: ['Frameworks before forecasts.', 'Write down what would change my mind.', 'Count the whole cost, not only the visible part.', 'Revise when the evidence changes.'],
    },

    follow: {
      eyebrow: 'Subscribe',
      title: 'One essay every Sunday, to keep you company on the way up.',
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
      description: 'Essays by Solo Primus on investing, AI, and self-improvement. Free to read.',
      eyebrow: 'Library',
      h1: 'Essays',
      lead: 'Essays on investing, AI, and self-improvement. Every essay is free to read.',
      all: 'All',
      filterLabel: 'Filter essays by topic',
      inChinese: 'In Chinese',
      inChineseNote: 'These essays are written in Chinese. Their titles and summaries are translated here.',
      empty: 'No essays on this topic yet.',
      zhBadge: '中文',
    },

    article: {
      by: 'By',
      onThisPage: 'On this page',
      topicsTitle: 'Topics',
      readNext: 'Keep reading',
      authorTitle: 'About the author',
      authorBio: 'I’m Solo Primus (凌霄), a professor with a PhD in economics and a seasoned investor. I write about investing, AI, and self-improvement.',
      authorMore: 'More about me',
      alternate: 'Read in Chinese',
      allEssays: 'All essays',
    },

    about: {
      title: 'About Solo Primus',
      description: 'Solo Primus (凌霄) is a professor with a PhD in economics and a seasoned investor.',
      eyebrow: 'About',
      h1: 'About Solo Primus',
      lead: 'Professor · PhD in economics · Seasoned investor. I write about investing, AI, and self-improvement.',
      story: [
        'This is an age of noise.\nMarkets move your money with emotion. Technology pushes you along with anxiety. Other people define your success by their own standards.',
        'I believe one person can still live with clarity: think independently, keep improving, and climb, step by step, to higher ground.',
        'I’m Solo Primus: a professor with a PhD in economics, and a seasoned investor. Here, I write about three things.',
        ['Investing.', 'Start from first principles, see through the noise of prices, and see value as it really is.'],
        ['AI.', 'In the wave of technology, see its essence and its direction. Be the one who rides the wave, not the one swept away by it.'],
        ['Self-improvement.', 'Experience has taught me to read human nature, and to read myself. I have turned those insights into an original method for continuous growth.'],
      ],
      motto: 'Start from yourself. Rise to a higher plane.',
      mottoNote: 'One essay every Sunday, to keep you company on the way up.',
      sections: [
        {
          h: 'The pen names',
          p: [
            'Solo Primus is my pen name. Solo stands for the independent individual. Primus is Latin for “first.” Together they express a belief I hold: an independent person who keeps learning and refining their work can reach a very high level and achieve a great deal.',
            'My Chinese pen name is 凌霄 (Líng Xiāo), “soaring above the clouds.” I start from myself, but my aim is not to stand apart from the world. It is to ascend to a higher realm.',
            'The mark is a mountain with a winding path. Progress is rarely a straight line, but it can keep going up.',
          ],
        },
        {
          h: 'Background',
          p: [
            'I have a background in electronic information engineering and earned a PhD in economics. I’m a professor and a seasoned investor, and I have published a number of academic papers.',
            'Both disciplines shape how I write here. Engineering asks me to build something small and test it. Economics asks what it is worth, and why people choose it.',
          ],
        },
      ],
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
    nav: { essays: '文章', topics: '主题', about: '关于', subscribe: '订阅' },
    otherLang: { label: 'English', title: '阅读英文版网站' },
    theme: { toDark: '切换到深色模式', toLight: '切换到浅色模式' },
    menu: { open: '打开菜单', close: '关闭菜单' },
    topics: { investing: '投资', ai: 'AI', growth: '自我提升' },
    date: (d) => `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`,
    shortDate: (d) => `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`,
    minRead: (n) => `阅读约 ${n} 分钟`,

    home: {
      title: '凌霄 SOLO PRIMUS · 一个人，三种杠杆，上不封顶',
      description: '凌霄（SOLO PRIMUS），教授，经济学博士，资深投资人，写投资、AI 与自我提升。',
      eyebrow: '投资 · AI · 自我提升',
      h1: ['一个人，三种杠杆，', '上不封顶。'],
      pillars: [
        ['投资', '穿过价格的喧嚣，看见价值本来的样子。'],
        ['AI', '看清技术的本质与方向，做驾驭浪潮的人。'],
        ['自我提升', '读懂人性，读懂自己，持续精进。'],
      ],
      facts: [
        ['追涨杀跌', '看懂价值'],
        ['AI 焦虑', '驾驭 AI'],
        ['随波逐流', '独立判断'],
        ['原地打转', '持续精进'],
      ],
      factsTo: '变成',
      primary: '开始阅读',
      secondary: '在 Substack 关注',
      heroAlt: '铂金与铜色的山形雕塑，一条蜿蜒的小路通向山顶',
      leverEyebrow: '三种杠杆',
      leverTitle: '资本、AI 与自身的成长',
      leverIntro: '一个人可以借助三种杠杆。资本和 AI 放大你所做的事，自身的成长放大你这个人。',
      cards: {
        investing: { title: '看见价值本来的样子。', text: '从第一性原理出发，理解一门生意真正的价值。', link: '投资文章' },
        ai: { title: '做驾驭浪潮的人。', text: '看清技术的本质，看懂趋势的方向。', link: 'AI 文章' },
        growth: { title: '读懂人性，读懂自己。', text: '把阅历化成一套持续精进的方法。', link: '自我提升文章' },
      },
      thesis: {
        label: '论点卡',
        caption: '买入任何东西之前，先写下这四行。',
        rows: [['生意', '谁在付钱，付钱买什么？'], ['反方', '最有力的反对理由'], ['证据', '什么会让我改变判断'], ['复盘', '什么时候重新检查']],
      },
      workflow: {
        label: '把整个流程算进去',
        withAi: '用 AI',
        byHand: '人工完成',
        steps: ['写指令', '初稿', '核对', '修正'],
        unit: '分钟',
        caption: '示意：初稿需要 2 分钟，核对和修正需要 18 分钟。',
      },
      loop: { label: '精进循环', steps: ['学习', '实践', '复盘', '调整'], center: '重复', caption: '每一轮，都比上一轮更好一点。' },
      startEyebrow: '从这里开始',
      startTitle: '值得先读的文章',
      allEssays: '全部文章',
      introTitle: '你好，我是凌霄。',
      intro: [
        '我是教授，也是资深投资人。我取得了经济学博士学位，有电子信息工程的学科背景，发表过多篇学术论文。',
        'SOLO PRIMUS 是我的英文笔名，凌霄是中文笔名。两个名字代表同一个信念：一个独立的人，只要持续学习、不断精进，也能达到很高的境界。',
      ],
      introMore: '进一步了解我',
      principlesTitle: '我的思考方式',
      principles: ['先立框架，再谈预测。', '写下什么会让我改变主意。', '计算全部成本，不只是看得见的那部分。', '证据变了，判断就跟着改。'],
    },

    follow: {
      eyebrow: '订阅',
      title: '每周日一篇文章，陪你一起向上。',
      text: '在 Substack 关注，或把 RSS 加入你的阅读器。所有文章均可免费阅读。',
      substack: '在 Substack 关注',
      rss: 'RSS 订阅',
      x: '在 X 关注',
    },

    footer: {
      tagline: '明辨。笃行。',
      disclaimer: '文章用于研究与教育。本站内容均不构成投资建议。',
      rss: 'RSS',
    },

    essays: {
      title: '文章 · 凌霄 SOLO PRIMUS',
      description: '凌霄（SOLO PRIMUS）关于投资、AI 与自我提升的文章，均可免费阅读。',
      eyebrow: '文章库',
      h1: '文章',
      lead: '关于投资、AI 与自我提升的文章。所有文章均可免费阅读。',
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
      authorBio: '我是凌霄（SOLO PRIMUS），教授，经济学博士，资深投资人。我写投资、AI 与自我提升。',
      authorMore: '进一步了解我',
      alternate: '阅读英文版',
      allEssays: '全部文章',
    },

    about: {
      title: '关于凌霄 · SOLO PRIMUS',
      description: '凌霄（SOLO PRIMUS），教授，经济学博士，资深投资人。',
      eyebrow: '关于',
      h1: '关于凌霄',
      lead: '教授 · 经济学博士 · 资深投资人。写投资、AI 与自我提升。',
      story: [
        '这是一个充满噪音的时代。\n市场用情绪左右你的钱，技术用焦虑推着你走，别人用他们的标准定义你的成功。',
        '我相信，一个人也可以活得清醒：独立判断，持续精进，一步步登上更高的地方。',
        '我是凌霄（SOLO PRIMUS）：教授，经济学博士，资深投资人。在这里，我写三件事。',
        ['投资。', '从第一性原理出发，穿过价格的喧嚣，看见价值本来的样子。'],
        ['AI。', '在技术的浪潮里，看清本质与方向。做驾驭浪潮的人，不做被浪潮裹挟的人。'],
        ['自我提升。', '阅历让我读懂人性，也读懂自己。我把这些领悟，化成一套独创的精进方法。'],
      ],
      motto: '从自身出发，登临更高之境。',
      mottoNote: '每周日一篇文章，陪你一起向上。',
      sections: [
        {
          h: '笔名',
          p: [
            'SOLO PRIMUS 是我的英文笔名。Solo 代表独立的个体；Primus 是拉丁语，意为“第一”。两个词合在一起，表达我的一个信念：一个独立的人，只要持续学习、不断精进，也能达到很高的境界，取得很高的成就。',
            '我的中文笔名是凌霄，意为“直上云霄”。我从自身出发，但目标不是孤立于世界，而是登临更高之境。',
            '网站的标志是一座山和一条蜿蜒向上的路。进步很少走直线，但可以一直向上。',
          ],
        },
        {
          h: '背景',
          p: [
            '我有电子信息工程的学科背景，并取得了经济学博士学位。我是教授，也是资深投资人，发表过多篇学术论文。',
            '这两个学科都影响着我在这里的写作。工程学要求我先做出一个小东西，再去检验它；经济学让我追问：它值多少，人们为什么会选择它。',
          ],
        },
      ],
      howTitle: '我的写作方式',
      howNote: '所有文章均可免费阅读。',
      disclosureTitle: '声明',
      disclosures: [
        '本站内容不构成投资建议。我不了解你的具体情况，文章中提到的公司仅用于说明观点。做任何决定之前，请自行研究。',
        '网站会在你的浏览器中保存你选择的明暗主题。网站托管在 Cloudflare，它会记录汇总的、不使用 Cookie 的访问统计。Substack 和 X 有各自的隐私政策。',
      ],
      elsewhereTitle: '其他平台',
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
