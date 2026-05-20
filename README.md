# AChengLinus | WiKi

![Astrofy | Personal Porfolio Website Template](public/social_img.webp)

**EN:** Astrofy is a free and open-source template for your Personal Portfolio Website built with Astro and TailwindCSS. Create in minutes a website with a Blog, CV, Project Section, Store, and RSS Feed.

**中:** Astrofy 是一个基于 Astro 和 TailwindCSS 构建的免费开源个人作品集网站模板。只需几分钟即可创建一个包含博客、简历、项目展示、商店和 RSS 订阅的网站。

## Demo

**EN:** View a live demo of [Astrofy](https://astrofy-template.netlify.app/)

**中:** 查看 [Astrofy](https://astrofy-template.netlify.app/) 的在线演示

## Installation / 安装

**EN:** Run the following command in your terminal

**中:** 在终端中运行以下命令

```bash
pnpm install
```

**EN:** Once the packages are installed you are ready to run astro. Astro comes with a built-in development server that has everything you need for project development. The astro dev command will start the local development server so that you can see your new website in action for the very first time.

**中:** 安装完成后即可运行 Astro。Astro 内置了开发服务器，包含项目开发所需的一切。`astro dev` 命令将启动本地开发服务器，让你首次看到新网站的运行效果。

```bash
pnpm run dev
```

## Tech Stack / 技术栈

- [Astro](https://astro.build)
- [tailwindcss](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)

## Project Structure / 项目结构

```php
├── src/
│   ├── components/
│   │   ├── cv/
│   │   │   ├── TimeLine
│   │   ├── BaseHead.astro
│   │   ├── Card.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   └── HorizontalCard.astro
│   │   └── SideBar.astro
│   │   └── SideBarMenu.astro
│   │   └── SideBarFooter.astro
│   ├── content/
│   │   ├── blog/
│   │   │   ├── post1.md
│   │   │   ├── post2.md
│   │   │   └── post3.md
│   │   ├── store/
│   │   │   ├── item1.md
│   │   │   ├── item2.md
│   ├── layouts/
│   │   └── BaseLayout.astro
│   │   └── PostLayout.astro
│   └── pages/
│   │   ├── blog/
│   │   │   ├── [...page].astro
│   │   │   ├── [slug].astro
│   │   └── cv.astro
│   │   └── index.astro
│   │   └── projects.astro
│   │   └── rss.xml.js
│   ├── styles/
│   │   └── global.css
│   └── config.ts
├── public/
│   ├── favicon.svg
│   └── profile.webp
│   └── social_img.webp
├── astro.config.mjs
├── tailwind.config.cjs
├── package.json
└── tsconfig.json
```

### Site config / 站点配置

**EN:** You can change global site configuration on '/src/config.ts' file:

**中:** 可以在 `/src/config.ts` 文件中修改全局网站配置：

- **SITE_TITLE**: **EN:** Default pages title / **中:** 默认页面标题
- **SITE_DESCRIPTION**: **EN:** Default pages description / **中:** 默认页面描述
- **GENERATE_SLUG_FROM_TITLE**: **EN:** By default Astrofy will generate the blog slug pages based on the article name. Set this var to false if you want to use the Astro file base (Compatible with Astrofy older versions). / **中:** 默认 Astrofy 会根据文章名称生成博客 slug 页面。如果想使用 Astro 文件基础路径，将此变量设为 false（兼容 Astrofy 旧版本）。
- **TRANSITION_API**: **EN:** Enable and disable transition API / **中:** 启用或禁用过渡动画 API

### Components usage / 组件使用说明

#### Layout Components / 布局组件

**EN:** The `BaseHead`, `Footer`, `Header`, and `SideBar` components are already included in the layout system. To change the website content you can edit the content of these components.

**中:** `BaseHead`、`Footer`、`Header` 和 `SideBar` 组件已包含在布局系统中。修改这些组件的内容即可更改网站内容。

##### SideBar / 侧边栏

**EN:** In the Sidebar you can change your profilePicture, links to all your website pages, and your social icons.

**中:** 在侧边栏中，你可以更改头像、所有页面链接和社交图标。

**EN:** You can change your avatar shape using [mask classes](https://daisyui.com/components/mask/).

**中:** 你可以使用 [mask 类](https://daisyui.com/components/mask/) 更改头像形状。

**EN:** The used social-icons are SVG from [BoxIcons](https://boxicons.com/) pack. You can replace the icons in the `SideBarFooter` component.

**中:** 社交图标使用 [BoxIcons](https://boxicons.com/) 的 SVG 图标。你可以在 `SideBarFooter` 组件中替换这些图标。

**EN:** To add a new page in the sidebar go to the `SideBarMenu` component.

**中:** 要在侧边栏添加新页面，请前往 `SideBarMenu` 组件。

```
<li><a class="py-3 text-base" id="home" href="/">Home</a></li>
```

**EN:** **Note**: In order to change the sidebar menu's active item, you need to setup the prop `sideBarActiveItemID` in the `BaseLayout` component of your new page and add that id to the link in the `SideBarMenu`

**中:** **注意**: 要更改侧边栏菜单的当前活动项，需要在新页面的 `BaseLayout` 组件中设置 `sideBarActiveItemID` 属性，并在 `SideBarMenu` 的链接中添加该 id。

#### TimeLine / 时间线

**EN:** The timeline components are used to confirm the CV.

**中:** 时间线组件用于展示简历。

```html
<div class="time-line-container">
  <TimeLineElement title="Element Title" subtitle="Subtitle">
    Content that can contain
    <div>divs</div>
    and <span>anything else you want</span>.
  </TimeLineElement>
  ...
</div>
```

#### Card & HorizontalCard / 卡片与横向卡片

**EN:** The cards are primarily used for the Project and the Blog components. They include a picture, a title, and a description.

**中:** 卡片组件主要用于项目和博客模块，包含图片、标题和描述。

```html
<HorizontalCard title="Card Title" img="imge_url" desc="Description" url="Link
URL" target="Optional link target (_blank default)" badge="Optional badge"
tags={['Array','of','tags']} />
```

#### HorizontalCard Shop Item / 商店商品横向卡片

**EN:** This component is already included in the Store layout of the template. In case you want to use it in another place these are the props.

**中:** 该组件已包含在模板的商店布局中。如果你想在其他地方使用，以下是其属性说明。

```html
<HorizontalShopItem
  title="Item Title"
  img="imge_url"
  desc="Item description"
  pricing="current_price"
  oldPricing="old_price"
  checkoutUrl="external store checkout url"
  badge="Optional badge"
  url="item details url"
  custom_link="Custom link url"
  custom_link_label="Cutom link btn label"
  target="Optional link target (_self default)"
/>
```

#### Adding a Custom Component / 添加自定义组件

**EN:** To add a custom component, you can create a .astro file in the components folder under the source folder.

**中:** 要添加自定义组件，可以在源码目录下的 components 文件夹中创建 `.astro` 文件。

**EN:** Components must follow this template. The `---` represents the code fence and uses Javascript and can be used for imports.

**中:** 组件必须遵循此模板。`---` 表示代码块，使用 JavaScript，可用于导入。

**EN:** The HTML component is the actual style of your new component.

**中:** HTML 部分是你新组件的实际样式。

```html
---
// Component Script (JavaScript)
---
<!-- Component Template (HTML + JS Expressions) -->
```

**EN:** For more details, see the [astro components](https://docs.astro.build/en/core-concepts/astro-components/) documentation here.

**中:** 更多详情请参阅 [Astro 组件文档](https://docs.astro.build/en/core-concepts/astro-components/)。

### Layouts / 布局

**EN:** Include `BaseLayout` in each page you add and `PostLayout` to your post pages.

**中:** 在每个页面中包含 `BaseLayout`，在文章页面中包含 `PostLayout`。

**EN:** The BaseLayout defines a general template for each new webpage you want to add. It imports constants SITE_TITLE and SITE_DESCRIPTION which can be modified in the `../config` folder. Data placed there can be imported anywhere using import.

**中:** BaseLayout 为每个新页面定义了通用模板，导入可在 `../config` 文件夹中修改的 SITE_TITLE 和 SITE_DESCRIPTION 常量。放置在那里的数据可以通过 import 在任何地方引用。

### Content / 内容

**EN:** You can add a [content collection](https://docs.astro.build/en/guides/content-collections/) in `/content/' folder, you will need add it at config.ts.

**中:** 你可以在 `/content/` 文件夹中添加[内容集合](https://docs.astro.build/en/guides/content-collections/)，同时需要在 config.ts 中进行配置。

#### config.ts

**EN:** Where you need to define your content collections, we define our content schemas too.

**中:** 在此定义你的内容集合以及内容模式（schema）。

#### Blog / 博客

**EN:** Add your `md` blog post in the `/content/blog/` folder.

**中:** 将你的 `md` 博客文章添加到 `/content/blog/` 文件夹中。

##### Post format / 文章格式

**EN:** Add code with this format in the top of each post file.

**中:** 在每篇文章文件顶部添加如下格式的代码。

```
---
title: "Post Title"
description: "Description"
pubDate: "Post date format(Sep 10 2022)"
heroImage: "Post Hero Image URL"
---
```

### Pages / 页面

#### Blog / 博客

**EN:** Blog uses Astro's content collection to query post's `md`.

**中:** 博客模块使用 Astro 的内容集合来查询文章的 `md` 文件。

##### [page].astro

**EN:** The `[page].astro` is the route to work with the paginated post list. You can change there the number of items listed for each page and the pagination button labels.

**中:** `[page].astro` 是处理分页文章列表的路由。你可以在此更改每页显示的文章数量和分页按钮标签。

##### [slug].astro

**EN:** The `[slug].astro` is the base route for every blog post, you can customize the page layout or behaviour, by default uses `content/blog` for content collection and `PostLayout` as layout.

**中:** `[slug].astro` 是每篇博客文章的基础路由，你可以自定义页面布局或行为，默认使用 `content/blog` 作为内容集合，`PostLayout` 作为布局。

#### Shop / 商店

**EN:** Add your `md` item in the `/pages/shop/` folder.

**中:** 将你的 `md` 商品添加到 `/pages/shop/` 文件夹中。

##### [page].astro

**EN:** The `[page].astro` is the route to work with the paginated item list. You can change there the number of items listed for each page and the pagination button labels. The shop will render all `.md` files you include inside this folder.

**中:** `[page].astro` 是处理分页商品列表的路由。你可以在此更改每页显示的商品数量和分页按钮标签。商店会渲染此文件夹中的所有 `.md` 文件。

##### Item format / 商品格式

**EN:** Add code with this format at the top of each item file.

**中:** 在每个商品文件顶部添加如下格式的代码。

```js
---
title: "Demo Item 1"
description: "Item description"
heroImage: "Item img url"
details: true // show or hide details btn
custom_link_label: "Custom btn link label"
custom_link: "Custom btn link"
pubDate: "Sep 15 2022"
pricing: "$15"
oldPricing: "$25.5"
badge: "Featured"
checkoutUrl: "https://checkouturl.com/"
---
```

#### Static pages / 静态页面

**EN:** The other pages included in the template are static pages. The `index` page belongs to the root page. You can add your pages directly in the `/pages` folder and then add a link to those pages in the `sidebar` component.

**中:** 模板中的其他页面为静态页面。`index` 页面属于根页面。你可以直接在 `/pages` 文件夹中添加页面，然后在 `sidebar` 组件中添加指向这些页面的链接。

**EN:** Feel free to modify the content included in the pages that the template contains or add the ones you need.

**中:** 欢迎随意修改模板中包含的页面内容，或添加你需要的页面。

### Theming / 主题

**EN:** To change the template theme change the `data-theme` attribute of the `<html>` tag in `BaseLayout.astro` file.

**中:** 要更改模板主题，修改 `BaseLayout.astro` 文件中 `<html>` 标签的 `data-theme` 属性。

**EN:** You can choose among 30 themes available or create your custom theme. See themes available [here](https://daisyui.com/docs/themes/).

**中:** 你可以从 30 个可用主题中选择，或创建自定义主题。查看可用主题[在此](https://daisyui.com/docs/themes/)。

## Sitemap / 站点地图

**EN:** The Sitemap is generated automatically when you build your website in the root of the domain. Please update the `robots.txt` file in the public folder with your site name URL for the Sitemap.

**中:** 当你构建网站时，站点地图（Sitemap）会在域名根目录自动生成。请更新 `public` 文件夹中的 `robots.txt` 文件，填入你的站点 URL。

## Deploy / 部署

**EN:** You can deploy your site on your favourite static hosting service such as Vercel, Netlify, GitHub Pages, etc.

**中:** 你可以将网站部署在任何喜欢的静态托管服务上，如 Vercel、Netlify、GitHub Pages 等。

**EN:** The configuration for the deployment varies depending on the platform where you are going to do it. See the [official Astro information](https://docs.astro.build/en/guides/deploy/) to deploy your website.

**中:** 部署配置因平台而异。请参阅 [Astro 官方部署指南](https://docs.astro.build/en/guides/deploy/)。

> **⚠️ CAUTION / 注意** </br>
> **EN:** The Blog pagination of this template is implemented using dynamic route parameters in its filename and for now this format is incompatible with SSR deploy configs, so please use the default static deploy options for your deployments.
>
> **中:** 该模板的博客分页使用文件名中的动态路由参数实现，目前此格式与 SSR 部署配置不兼容，请使用默认的静态部署选项。

## Contributing / 贡献

**EN:** Suggestions and pull requests are welcomed! Feel free to open a discussion or an issue for a new feature request or bug.

**中:** 欢迎提出建议和 Pull Request！如有新功能请求或 Bug，请随时发起讨论或提交 Issue。

**EN:** One of the best ways to contribute is to grab a [bug report or feature suggestion](https://github.com/manuelernestog/astrofy/issues) that has been marked `accepted` and dig in.

**中:** 贡献的最佳方式之一是认领标记为 `accepted` 的 [Bug 报告或功能建议](https://github.com/manuelernestog/astrofy/issues)并深入研究。

**EN:** Please be wary of working on issues _not_ marked as `accepted`. Just because someone has created an issue doesn't mean we'll accept a pull request for it.

**中:** 请注意，不要处理 _未_ 标记为 `accepted` 的问题。有人创建了 issue 并不意味着我们会接受相应的 pull request。

## License / 许可证

**EN:** Astrofy is licensed under the MIT license — see the [LICENSE](https://github.com/manuelernestog/astrofy/blob/main/LICENSE) file for details.

**中:** Astrofy 采用 MIT 许可证 — 详见 [LICENSE](https://github.com/manuelernestog/astrofy/blob/main/LICENSE) 文件。

## Contributors / 贡献者

<a href="https://github.com/manuelernestog/astrofy/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=manuelernestog/astrofy" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
