---
title: "MM-Wiki"
description: "MM-Wiki 是一个轻量级的企业知识分享与团队协同软件，可用于快速构建企业 Wiki 和团队知识分享平台。部署方便，使用简单，帮助团队构建一个信息共享、文档管理的协作环境。"
pubDate: "mar 18 2024"
heroImage: "/blog/mmwiki/文章内容/MM-Wikilogo.webp"
---
</a></p><p>MM-Wiki 是一个轻量级的企业知识分享与团队协同软件，可用于快速构建企业 Wiki 和团队知识分享平台。部署方便，使用简单，帮助团队构建一个信息共享、文档管理的协作环境。</p><h3>特点</h3><ul class=" list-paddingleft-2"><li><p>部署方便，基于 golang 编写，只需要下载对于平台下二进制文件执行即可。</p></li><li><p>快速安装程序, 提供方便的安装界面程序，无需任何手动操作。</p></li><li><p>独立的空间，空间是一组文档的集合，一般为公司部门或者团队，空间下的文档相互独立。空间可根据需求设置空间访问级别。</p></li><li><p>完善的系统权限管理，系统可以自定义角色，并为不同角色授予不同的权限。</p></li><li><p>集成统一登录，本系统支持通过外部系统认证用户, 比如与公司的 LDAP 登录融合。具体请看登录认证功能。</p></li><li><p>邮件通知功能，当开启邮件通知，文档更改会通知所有关注该文档的用户。</p></li><li><p>文档具有分享和下载功能，目前只支持下载 MarkDown 源文件。</p></li></ul><h3>系统预览</h3><h3>
1 安装</h3><p><img src="/blog/mmwiki/文章图片/02141427_uAwe.webp" alt=""></p></p><h4>
2 登录</h4><p><a href="https://github.com/phachon/mm-wiki/blob/master/static/images/preview/login.png" target="_blank">
<p><img src="/blog/mmwiki/文章图片/02141430_F4X7.webp" alt=""></p></p><h4>
3 系统</h4><p><a href="https://github.com/phachon/mm-wiki/blob/master/static/images/preview/system.png" target="_blank">
<p><img src="/blog/mmwiki/文章图片/02141432_15DK.webp" alt=""></p></p><h4>
4 空间文档</h4><p><a href="https://github.com/phachon/mm-wiki/blob/master/static/images/preview/space.png" target="_blank">
<p><img src="/blog/mmwiki/文章图片/02141435_BKr0.webp" alt=""></p></p><h4>
5 编辑文档</h4><p><a href="https://github.com/phachon/mm-wiki/blob/master/static/images/preview/edit.png" target="_blank">
<p><img src="/blog/mmwiki/文章图片/02141437_oOiM.webp" alt=""></p></p><h4>
6 文档分享</h4><p><a href="https://github.com/phachon/mm-wiki/blob/master/static/images/preview/share.png" target="_blank">
</a></p><h3>使用的一些插件</h3><p>MM-Wiki 是站在巨人的肩膀上开发的一款软件，是因为系统中使用了非常多优秀的插件，非常感谢这些插件的作者们：</p><ul class=" list-paddingleft-2"><li><p><a href="https://github.com/twbs/bootstrap">bootstrap</a></p></li><li><p><a href="https://github.com/flatlogic/awesome-bootstrap-checkbox">awesome-bootstrap-checkbox</a></p></li><li><p><a href="https://victor-valencia.github.com/bootstrap-iconpicker">bootstrap-iconpicker</a></p></li><li><p><a href="http://silviomoreto.github.io/bootstrap-select">bootstrap-select</a></p></li><li><p><a href="https://bttstrp.github.io/bootstrap-switch">bootstrap-switch</a></p></li><li><p><a href="https://github.com/bootstrap-tagsinput/bootstrap-tagsinput">bootstrap-tagsinput</a></p></li><li><p><a href="https://github.com/pandao/editor.md">editor.md</a></p></li><li><p><a href="http://jquery-dev.com/">layout</a></p></li><li><p><a href="http://layer.layui.com/">layer</a></p></li><li><p><a href="https://github.com/onokumus/metisMenu">metisMenu</a></p></li><li><p><a href="http://morrisjs.github.com/morris.js/">morris</a></p></li><li><p><a href="https://github.com/sandywalker/webui-popover">popover</a></p></li><li><p><a href="http://markgoodyear.com/labs/scrollup/">scrollup</a></p></li><li><p><a href="http://treejs.cn/">zTreev3</a></p></li></ul><h3>二次开发</h3><p>环境要求：go 1.8</p><pre class="brush:shell;toolbar: true; auto-links: false;">$&nbsp;git&nbsp;clone&nbsp;https://github.com/phachon/mm-wiki.git
$&nbsp;cd&nbsp;mm-wiki
$&nbsp;go&nbsp;build&nbsp;./</pre><h3>反馈</h3><ul class=" list-paddingleft-2"><li><p>如果您喜欢该项目，请&nbsp;<a href="https://github.com/phachon/mm-wiki/stargazers">Star</a>.</p></li><li><p>如果在使用过程中有任何问题， 请提交&nbsp;<a href="https://github.com/phachon/mm-wiki/issues">Issue</a>.</p></li><li><p>如果您发现并解决了bug，请提交&nbsp;<a href="https://github.com/phachon/mm-wiki/pulls">Pull Request</a>.</p></li><li><p>如果您想二次开发，欢迎&nbsp;<a href="https://github.com/phachon/mm-wiki/network/members">Fork</a>.</p></li><li><p>如果你想交个朋友，欢迎发邮件给&nbsp;<a href="mailto:phachon@163.com">phachon@163.com</a>.</p></li></ul><h3>License</h3><p>MIT</p><h3>谢谢</
                                                         
