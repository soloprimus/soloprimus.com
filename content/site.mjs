// Site identity and interface copy. Essays live in content/essays/*.md.
// English is the source text; each Chinese string is a faithful translation of the English beside it.
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
      title: 'Solo Primus · Essays on investing, applied AI, and creative work',
      description: 'Solo Primus is an assistant professor with a PhD in economics and a background in electronic information engineering, writing about investing, applied AI, and creative work.',
      eyebrow: 'Investing · Applied AI · Creative work',
      h1: ['Think like an economist.', 'Build like an engineer.'],
      lead: 'I’m Solo Primus, an assistant professor with a PhD in economics and a background in electronic information engineering. I write about three kinds of leverage one person can use: capital, code, and media.',
      facts: [
        ['Degree', 'PhD in Economics'],
        ['Position', 'Assistant professor'],
        ['Background', 'Electronic information engineering'],
        ['Publications', 'Multiple academic papers'],
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
        'Solo Primus is my pen name, and 凌霄 is my Chinese one. Both stand for one belief: an independent person who keeps learning and refining their work can reach a very high level.',
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
    nav: { essays: '文章', topics: '主题', about: '关于', subscribe: '订阅' },
    otherLang: { label: 'English', title: '阅读英文版网站' },
    theme: { toDark: '切换到深色模式', toLight: '切换到浅色模式' },
    menu: { open: '打开菜单', close: '关闭菜单' },
    topics: { investing: '投资', ai: 'AI 应用', creator: '创作' },
    levers: { investing: '资本', ai: '代码', creator: '媒体' },
    date: (d) => `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`,
    shortDate: (d) => `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`,
    minRead: (n) => `阅读约 ${n} 分钟`,

    home: {
      title: '凌霄 SOLO PRIMUS · 关于投资、AI 应用与创作的文章',
      description: '凌霄（SOLO PRIMUS），经济学博士，现任助理教授，有电子信息工程的学科背景，写投资、AI 应用与创作。',
      eyebrow: '投资 · AI 应用 · 创作',
      h1: ['像经济学家一样思考，', '像工程师一样构建。'],
      lead: '我是凌霄（SOLO PRIMUS），经济学博士，现任助理教授，有电子信息工程的学科背景。我写一个人可以运用的三种杠杆：资本、代码与媒体。',
      facts: [
        ['学位', '经济学博士'],
        ['职位', '助理教授'],
        ['学科背景', '电子信息工程'],
        ['学术发表', '多篇学术论文'],
      ],
      primary: '开始阅读',
      secondary: '在 Substack 关注',
      heroAlt: '铂金与铜色的山形雕塑，一条蜿蜒的小路通向山顶',
      leverEyebrow: '三种杠杆',
      leverTitle: '资本、代码与媒体',
      leverIntro: 'Naval Ravikant 把资本、劳动力、代码和媒体视为杠杆的主要形式。代码和媒体的复制成本几乎为零，因此一个人无需征得任何人许可，就能使用它们。我的文章围绕其中三种展开。',
      cards: {
        investing: { title: '看懂生意，追问价格。', text: '价值如何创造，风险在哪里，什么会让我重新考虑。', link: '投资文章' },
        ai: { title: '给 AI 一份工作，而不是一张愿望清单。', text: '选一项真实任务，把整个流程都算进去，并保留人工检查环节。', link: 'AI 文章' },
        creator: { title: '找到自己的声音，让创作成为习惯。', text: '以可持续的节奏创作、发布，并从读者那里学习。', link: '创作文章' },
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
      loop: { label: '发布循环', steps: ['创作', '发布', '倾听', '修改'], center: '重复', caption: '小而完整的作品，每一轮都更好一点。' },
      startEyebrow: '从这里开始',
      startTitle: '值得先读的文章',
      allEssays: '全部文章',
      introTitle: '你好，我是凌霄。',
      intro: [
        '我有电子信息工程的学科背景，后来取得经济学博士学位，现任助理教授，发表过多篇学术论文。',
        'SOLO PRIMUS 是我的英文笔名，凌霄是中文笔名。两个名字代表同一个信念：一个独立的人，只要持续学习、不断精进，也能达到很高的境界。',
      ],
      introMore: '进一步了解我',
      principlesTitle: '我的思考方式',
      principles: ['先立框架，再谈预测。', '写下什么会让我改变主意。', '计算全部成本，不只是看得见的那部分。', '证据变了，判断就跟着改。'],
    },

    follow: {
      eyebrow: '订阅',
      title: '新文章一写好，就能读到。',
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
      description: '凌霄（SOLO PRIMUS）关于投资、AI 应用与创作的文章，均可免费阅读。',
      eyebrow: '文章库',
      h1: '文章',
      lead: '关于投资、AI 应用与创作的思考框架。所有文章均可免费阅读。',
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
      authorBio: '我是凌霄（SOLO PRIMUS），经济学博士，现任助理教授，有电子信息工程的学科背景。我写投资、AI 应用与创作。',
      authorMore: '进一步了解我',
      alternate: '阅读英文版',
      allEssays: '全部文章',
    },

    about: {
      title: '关于凌霄 · SOLO PRIMUS',
      description: '凌霄（SOLO PRIMUS），经济学博士，现任助理教授，有电子信息工程的学科背景。',
      eyebrow: '关于',
      h1: '关于凌霄',
      lead: '我是凌霄（SOLO PRIMUS），经济学博士，现任助理教授，有电子信息工程的学科背景。我在这个网站上写投资、AI 应用与创作。',
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
            '我有电子信息工程的学科背景，后来取得经济学博士学位，现任助理教授，发表过多篇学术论文。',
            '这两个学科都影响着我在这里的写作。工程学要求我先做出一个小东西，再去检验它；经济学让我追问：它值多少，人们为什么会选择它。',
          ],
        },
      ],
      writeTitle: '我写什么',
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
