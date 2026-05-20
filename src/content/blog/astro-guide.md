---
title: "用 Astro 搭建一个高性能博客"
description: "如何搭建个人博客，更加流畅使用个人博客"
pubDate: "mar 18 2024"
heroImage: "/images/blog/astro-guide/wz.webp"
badge: "正式1.0"
tags: ["程序","网站"]
---
<blockquote>
<p>本篇文章的目的旨在读者无须在多个窗口间跳动即可完成 Astro 的部署与个性化。<strong>需要下载的内容可在本页面一键下载</strong></p>
</blockquote>
<h2 id="为什么选择-astro">为什么选择 Astro</h2>
<p>关于这个问题，你可以访问它的官方网站：<a href="https://docs.astro.build/zh-cn/concepts/why-astro/">为什么是 Astro? | Docs</a></p>
<blockquote>
<p>如果你想了解我的想法，请移动至本文结尾</p>
</blockquote>
<h2 id="需要的环境">需要的环境</h2>
<ul>
<li>为了让 Astro 在你的系统上运行，你需要安装 <a href="https://nodejs.cn/"><strong>Node.js</strong></a>、版本 <code>v18.14.1</code> 或更高版本。
<blockquote>
<p>点击下载：<a class="btn" href="../asset/node-v20.11.1-x64.msi" target="_blank"> node-v20.11.1-x64</a></p>
</blockquote>
</li>
<li>[可选] 安装 <strong>pnpm</strong>：</li>
</ul>
<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8; overflow-x: auto;" tabindex="0"><code><span class="line"><span style="color:#B392F0">npm</span><span style="color:#9ECBFF"> install</span><span style="color:#79B8FF"> -g</span><span style="color:#9ECBFF"> pnpm</span></span></code></pre>
<h3 id="我还需要什么">我还需要什么</h3>
<ul>
<li>一个 <a href="https://github.com/">GitHub</a> 账号</li>
<li>一个合适的代码编辑器</li>
<li>掌握一定的 <strong><em>魔法-Magic</em></strong></li>
</ul>
<h2 id="创建你的博客项目">创建你的博客项目</h2>
<blockquote>
<p>Astro 不像 Hexo，可以安装多个主题，然后只用写几个配置文件就好了——还能随便切换主题。Astro 每个主题就是一个项目，而每位作者用的 <code>frontmatter</code> 格式可能都不一样，所以为了避免频繁迁移项目，请先选好自己要使用的主题。</p>
</blockquote>
<h3 id="选择你需要的主题">选择你需要的主题</h3>
<p>Astro 像 Hexo 一样，也有很多主题可用（<del>更好的说法是项目模板</del>）。你可以在 <a href="https://astro.build/themes/"><strong>Themes | Astro</strong></a> 挑选自己需要的主题，这里我选择简单好用的 <a href="https://github.com/satnaing/astro-paper"><strong>AstroPaper</strong></a> 作为示例。</p>
<h3 id="拷贝主题--项目模板仓库">拷贝主题 / 项目模板（仓库）</h3>
<p>只需要使用包管理器即可（推荐使用 pnpm）：</p>
<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8; overflow-x: auto;" tabindex="0"><code><span class="line"><span style="color:#6A737D"># npm 6.x</span></span>
<span class="line"><span style="color:#B392F0">npm</span><span style="color:#9ECBFF"> create</span><span style="color:#9ECBFF"> astro@latest</span><span style="color:#79B8FF"> --template</span><span style="color:#9ECBFF"> satnaing/astro-paper</span></span>
<span class="line"><span style="color:#6A737D"># npm 7+, extra double-dash is needed:</span></span>
<span class="line"><span style="color:#B392F0">npm</span><span style="color:#9ECBFF"> create</span><span style="color:#9ECBFF"> astro@latest</span><span style="color:#79B8FF"> --</span><span style="color:#79B8FF"> --template</span><span style="color:#9ECBFF"> satnaing/astro-paper</span></span>
<span class="line"><span style="color:#6A737D"># yarn</span></span>
<span class="line"><span style="color:#B392F0">yarn</span><span style="color:#9ECBFF"> create</span><span style="color:#9ECBFF"> astro</span><span style="color:#79B8FF"> --template</span><span style="color:#9ECBFF"> satnaing/astro-paper</span></span></code></pre>
<p>完成后的目录如下：</p>
<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8; overflow-x: auto;" tabindex="0"><code><span class="line"><span style="color:#B392F0">/</span></span>
<span class="line"><span style="color:#B392F0">├──</span><span style="color:#9ECBFF"> public/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   ├──</span><span style="color:#9ECBFF"> assets/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   │</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> logo.svg</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   │</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> logo.png</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> favicon.svg</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> astropaper-og.jpg</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> robots.txt</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> toggle-theme.js</span></span>
<span class="line"><span style="color:#B392F0">├──</span><span style="color:#9ECBFF"> src/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   ├──</span><span style="color:#9ECBFF"> assets/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   │</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> socialIcons.ts</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   ├──</span><span style="color:#9ECBFF"> components/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   ├──</span><span style="color:#9ECBFF"> content/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   │</span><span style="color:#F97583">   |</span><span style="color:#B392F0">  blog/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   │</span><span style="color:#F97583">   |</span><span style="color:#B392F0">    └──</span><span style="color:#9ECBFF"> some-blog-posts.md</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   │</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> config.ts</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   ├──</span><span style="color:#9ECBFF"> layouts/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> pages/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> styles/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> utils/</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> config.ts</span></span>
<span class="line"><span style="color:#B392F0">│</span><span style="color:#9ECBFF">   └──</span><span style="color:#9ECBFF"> types.ts</span></span>
<span class="line"><span style="color:#B392F0">└──</span><span style="color:#9ECBFF"> package.json</span></span></code></pre>
<p>安装必要的内容：</p>
<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8; overflow-x: auto;" tabindex="0"><code><span class="line"><span style="color:#B392F0">npm</span><span style="color:#9ECBFF"> installl</span></span></code></pre>
<p>如果你迫不及待想看看自己的博客，可以启动 Astro 开发服务：</p>
<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8; overflow-x: auto;" tabindex="0"><code><span class="line"><span style="color:#B392F0">npm</span><span style="color:#9ECBFF"> run</span><span style="color:#9ECBFF"> dev</span></span></code></pre>
<p>你应该能在终端中看到 Astro 正在以开发模式运行的提示信息。</p>
<p>在浏览器中输入 <code>http://localhost:4321/</code> 即可即时预览。</p>
<h3 id="个性化你的博客">个性化你的博客</h3>
<h4 id="configts">config.ts</h4>
<p>里面包含了网站的一些基本信息，下面是 <a href="https://github.com/satnaing/astro-paper"><strong>AstroPaper</strong></a> 的 <code>config.ts</code>：</p>
<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8; overflow-x: auto;" tabindex="0"><code><span class="line"><span style="color:#6A737D">// file: src/config.ts</span></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> const</span><span style="color:#79B8FF"> SITE</span><span style="color:#F97583"> =</span><span style="color:#E1E4E8"> {</span></span>
<span class="line"><span style="color:#E1E4E8">  website: </span><span style="color:#9ECBFF">"https://astro-paper.pages.dev/"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  author: </span><span style="color:#9ECBFF">"Sat Naing"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  desc: </span><span style="color:#9ECBFF">"A minimal, responsive and SEO-friendly Astro blog theme."</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  title: </span><span style="color:#9ECBFF">"AstroPaper"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  ogImage: </span><span style="color:#9ECBFF">"astropaper-og.jpg"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  lightAndDarkMode: </span><span style="color:#79B8FF">true</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  postPerPage: </span><span style="color:#79B8FF">3</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  scheduledPostMargin: </span><span style="color:#79B8FF">15</span><span style="color:#F97583"> *</span><span style="color:#79B8FF"> 60</span><span style="color:#F97583"> *</span><span style="color:#79B8FF"> 1000</span><span style="color:#E1E4E8">, </span><span style="color:#6A737D">// 15 minutes</span></span>
<span class="line"><span style="color:#E1E4E8">};</span></span></code></pre>

<table><thead><tr><th>选项</th><th>描述</th></tr></thead><tbody><tr><td><strong><em>website</em></strong></td><td>您部署的网站URL</td></tr><tr><td><strong><em>author</em></strong></td><td>您的姓名</td></tr><tr><td><strong><em>desc</em></strong></td><td>您的网站描述。对于SEO和社交媒体分享很有用</td></tr><tr><td><strong><em>title</em></strong></td><td>您的网站名称</td></tr><tr><td><strong><em>ogImage</em></strong></td><td>您网站的默认OG图像。对于社交媒体分享很有用。OG图像可以是外部图像URL，也可以放置在<code>/public</code>目录下</td></tr><tr><td><strong><em>lightAndDarkMode</em></strong></td><td>启用或禁用网站的<code>明亮和暗黑模式</code>。如果禁用，将使用主色彩方案。此选项默认启用。</td></tr><tr><td><strong><em>postPerPage</em></strong></td><td>您可以指定每个帖子页面上显示多少帖子。（例如：如果将SITE.postPerPage设置为3，则每页只显示3篇帖子）</td></tr><tr><td><strong><em>scheduledPostMargin</em></strong></td><td>在生产模式下，具有将来<code>pubDatetime</code>的帖子将不可见。但是，如果帖子的<code>pubDatetime</code>在接下来的15分钟内，它将是可见的。如果您不喜欢默认的15分钟间隔，可以设置<code>scheduledPostMargin</code>。</td></tr></tbody></table>
<h4 id="新文章">新文章</h4>
<p><code>blog/</code> 文件夹中放的就是你的文章，用一般的 <code>MarkDown</code> 格式编写即可，注意里面的 <code>frontmatter</code>，不同的主题可能有不同的 <code>frontmatter</code> 规则，详见主题仓库的 <code>README.md</code>。</p>
<p>下面是 <a href="https://github.com/satnaing/astro-paper"><strong>AstroPaper</strong></a> 的 <code>frontmatter</code> 规则：</p>

<table><thead><tr><th>属性</th><th>描述</th><th>备注</th></tr></thead><tbody><tr><td><strong><em>title</em></strong></td><td>文章的标题。 (h1)</td><td>必填<sup>*</sup></td></tr><tr><td><strong><em>description</em></strong></td><td>文章的描述。用于文章摘要和文章的站点描述。</td><td>必填<sup>*</sup></td></tr><tr><td><strong><em>pubDatetime</em></strong></td><td>发布的日期时间，使用 ISO 8601 格式。</td><td>必填<sup>*</sup></td></tr><tr><td><strong><em>modDatetime</em></strong></td><td>修改的日期时间，使用 ISO 8601 格式。 （仅在博客文章修改时添加此属性）</td><td>可选</td></tr><tr><td><strong><em>author</em></strong></td><td>文章的作者。</td><td>默认 = SITE.author</td></tr><tr><td><strong><em>slug</em></strong></td><td>文章的Slug。此字段是可选的，但不能是空字符串。 (slug: ""❌)</td><td>默认 = slugified文件名</td></tr><tr><td><strong><em>featured</em></strong></td><td>是否在首页的特色部分显示此文章</td><td>默认 = false</td></tr><tr><td><strong><em>draft</em></strong></td><td>将此文章标记为’未发布’。</td><td>默认 = false</td></tr><tr><td><strong><em>tags</em></strong></td><td>此文章的相关关键词。以数组 yaml 格式编写。</td><td>默认 = others</td></tr><tr><td><strong><em>ogImage</em></strong></td><td>文章的OG图像。对于社交媒体分享和SEO很有用。</td><td>默认 = SITE.ogImage 或生成的OG图像</td></tr><tr><td><strong><em>canonicalURL</em></strong></td><td>规范的URL（绝对路径），以防文章已经存在于其他来源。</td><td>默认 = <code>Astro.site</code> + <code>Astro.url.pathname</code></td></tr></tbody></table>
<h2 id="部署你的博客项目">部署你的博客项目</h2>
<p>随便找一个托管平台部署即可，这里使用 <code>Vercel</code> 。</p>
<h3 id="将你的项目托管至-github">将你的项目托管至 GitHub</h3>
<p>这个不用多说了吧：</p>
<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8; overflow-x: auto;" tabindex="0"><code><span class="line"><span style="color:#B392F0">git</span><span style="color:#9ECBFF"> init</span></span>
<span class="line"><span style="color:#B392F0">git</span><span style="color:#9ECBFF"> add</span><span style="color:#9ECBFF"> README.md</span></span>
<span class="line"><span style="color:#B392F0">git</span><span style="color:#9ECBFF"> commit</span><span style="color:#79B8FF"> -m</span><span style="color:#9ECBFF"> "first commit"</span></span>
<span class="line"><span style="color:#B392F0">git</span><span style="color:#9ECBFF"> branch</span><span style="color:#79B8FF"> -M</span><span style="color:#9ECBFF"> main</span></span>
<span class="line"><span style="color:#B392F0">git</span><span style="color:#9ECBFF"> remote</span><span style="color:#9ECBFF"> add</span><span style="color:#9ECBFF"> origin</span><span style="color:#9ECBFF"> 你的仓库地址</span></span>
<span class="line"><span style="color:#B392F0">git</span><span style="color:#9ECBFF"> push</span><span style="color:#79B8FF"> -u</span><span style="color:#9ECBFF"> origin</span><span style="color:#9ECBFF"> main</span></span></code></pre>
<h3 id="托管-vercel">托管 Vercel</h3>
<ol>
<li>进入 <a href="https://vercel.com/">Vercel</a> 然后注册一个账号；</li>
<li>新建一个项目；
<img src="/images/blog/astro-guide/Astro01.png" alt=""></li>
<li>选择你刚刚创建的仓库（这里拿之前的举例子）；
<img src="/images/blog/astro-guide/Astro02.png" alt=""></li>
<li>点击 <code>Deploy</code>；</li>
<li>看到满屏的烟花了吗？你成功了！
<img src="/images/blog/astro-guide/Astro03.png" alt=""></li>
</ol>
<h2 id="可能遇到的问题">可能遇到的问题</h2>
<ol>
<li>
<p><strong>克隆项目时报错了</strong>：</p>
<p>这可能是 npm 镜像的问题，推荐使用官方镜像 + 使用魔法。</p>
<blockquote>
<p><del>博主之前就是用了其他镜像导致祭了</del>。</p>
</blockquote>
</li>
</ol>
<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8; overflow-x: auto;" tabindex="0"><code><span class="line"><span style="color:#B392F0">npm</span><span style="color:#9ECBFF"> config</span><span style="color:#9ECBFF"> set</span><span style="color:#9ECBFF"> registry</span><span style="color:#9ECBFF"> https://registry.npmjs.org/</span></span></code></pre>
<ol start="2">
<li>
<p><strong>项目自己就报错了</strong>：</p>
<p>因为 Astro 的博客就是一个独立的项目：</p>
<p>所以这个很难有一个通用的解法，下面是可能的问题：</p>
<ul>
<li>启用了作者的实验性内容（我就遇到过）；</li>
<li>文章格式不符合项目要求或者文件路径错误；</li>
<li>……</li>
</ul>
</li>
<li>
<p><strong>本地没问题，部署报错了</strong>：</p>
<p>看看 <code>pnpm-lock.yaml</code> 和 <code>package.json</code> 有没有问题。</p>
</li>
<li>
<p>其他（待添加）</p>
</li>
</ol>
<h2 id="尾声我为什么选择-astro">尾声——我为什么选择 Astro</h2>
<p>搭建个人博客有很多种途径，作者本人（我）曾在此吃了不少苦头。刚开始我买了云服务器准备使用 WordPress 搭建网站，结果发现这对服务器的要求太高了，WP 还会出一些奇怪的 BUG （比如某一个重要 .js 突然祭了，就写不了文章了）。于是乎，我找到了成本更低也更快捷的方法——Hexo。它拥有庞大的社区，解决方案也很成熟，很适合我这种没有基础的小白。问题就是，单从我个人体验来说，Hexo 并不像它简介说的一样快速，它太臃肿了，尤其是对于某些主题来说，东西太多太杂，资源浪费严重。如果你曾使用<a href="https://pagespeed.web.dev/analysis/https-old-saroprock-com/hf4ci40qpw?hl=en&form_factor=mobile">PageSpeed Insights (web.dev)</a>测试过 Hexo 站点，会发现它真的慢……</p>
<p>下面是用 Butterfly 搭建的一个 Hexo 站点，仅有两篇文章：</p>
<p><img src="/images/blog/astro-guide/Astro04.png" alt=""></p>
<p>我的老博客：</p>
<p><img src="/images/blog/astro-guide/Astro07.png" alt=""></p>
<p>更不用说其他的了……</p>
<p><img src="/images/blog/astro-guide/Astro05.png" alt=""></p>
<p>而下面是我现在的博客：</p>
<p><img src="/images/blog/astro-guide/Astro06.png" alt=""></p>
<p>就我个人而言，Astro 是一个优于 Hexo 的替代品，那么我为什么不用 Astro 呢？</p> 