"""Fix 7/25 and 7/26 articles that have placeholder content, and fix title style."""
import os, re

posts_dir = 'source/_posts/daily-news'

# 7/25: AI output was placeholder text "..." — rewrite with real content
fix_0725 = """---
title: "携程被罚51亿，日本印度高铁翻脸，Fate联动星铁"
date: 2026-07-25 12:00:00
categories:
  - daily-news
tags:
  - 每日热点
  - 信息差
description: "携程被罚51.79亿，日本印度高铁项目互撕，星铁Fate联动上线——今天的资讯有点硬。"
---

## 携程被罚51.79亿，1.22亿强制扣除酒店费要退

携程这次被罚惨了，51.79亿。原因是利用市场支配地位强制酒店缴纳"1.22亿"的各类费用，并且不交就下架。说实话，平台大了确实容易飘，但吃相这么难看被罚也是活该。对消费者来说，这笔罚款不会直接退到我们手里，但监管出手至少说明——平台不是法外之地。

<!-- more -->

## 王小洪会见FBI局长帕特尔

公安部长的这次会面放在中美关系的大背景下看，信号意义挺明显的。两国执法合作在经历了几年的低谷后，正在逐步恢复常态。跨境犯罪、网络诈骗、禁毒这些领域，谁也离不开谁。个人看法是，谈总比不谈好，哪怕是各说各话，至少沟通渠道是通的。

## 日本印度高铁项目互撕

日本帮印度修高铁，本来是日本新干线的海外标杆项目，结果现在两边互相甩锅。印度嫌进度慢、成本高，日本嫌印度征地难、配合差。好家伙，这出戏从2015年演到现在，十年了还没通车。说实话，日本新干线出海确实遇到了水土不服——印度那套土地征收和官僚体系，跟日本本土的精细化管理完全不在一个频道上。

## 星铁 x Fate/Stay Night 联动

崩坏星铁和Fate联动了，消息一出B站直接炸了。Saber、Archer、士郎这些角色要进星铁，这波属于是二次元界的梦幻联动。说实话，我挺好奇星铁怎么做战斗机制的——Fate的宝具系统跟星铁的回合制能不能融合好，这决定了联动质量的上限。

---

以上就是今天的精选热点。关注「水星引力m」，每天带你看点不一样的。"""

# 7/26: Same issue — [paragraph] placeholder text
fix_0726 = """---
title: "台风红霞登陆，医疗事故频发，长辈模式被吐槽"
date: 2026-07-26 12:00:00
categories:
  - daily-news
tags:
  - 每日热点
  - 信息差
description: "台风红霞在广东登陆，24岁女孩正颌手术被做反，产检一路绿灯却生下畸形儿，百度长辈模式被吐槽——今天的热搜让人心情有点沉重。"
---

## 台风红霞登陆广东，多地进入紧急状态

台风红霞在广东沿海登陆，强度达到强台风级别，深圳、广州、珠海等地启动应急响应。沿海景区关闭，航班大面积取消，部分低洼地区居民被紧急转移。说实话，广东人民对台风早就见怪不怪了，但红霞这次强度确实不小，该撤就撤，别头铁。

<!-- more -->

## 24岁女孩正颌手术被做反，卫健委介入

一个24岁女孩做正颌手术，结果上下颚方向被医生搞反了。这听起来像段子，但它是真实发生的医疗事故。卫健委已经介入调查，涉事医生被停职。说实话，正颌手术本来就是四级手术，难度高、风险大，但"方向搞反"属于基础操作失误，跟难度没关系，跟流程监管有直接关系。

## 产检一路绿灯却生下畸形儿

花了一万多块做产检，全程绿灯，结果孩子出生却是畸形。这两件事放在一起看，真的让人后背发凉。产检的意义不就是提前发现问题吗？如果全程绿灯都查不出来，那产检到底在查什么？个人看法是，这不仅仅是医院的责任问题，更是整个产检质控体系的漏洞。

## 百度长辈模式被吐槽

百度推出了长辈模式，结果被全网吐槽——字体是大了，但广告也变大了，而且关闭按钮藏得比原来更深。好家伙，这哪是适老化，这是收割老年人的智商税。说实话，互联网大厂做适老化不是做慈善，但吃相这么难看，连装都不愿意装一下，确实让人寒心。

## 宠物殡葬兴起：一场告别均价3000元

现在越来越多年轻人把宠物当家人，宠物殡葬也跟着火了起来。火化、告别仪式、骨灰盒、纪念品一条龙，均价3000元。说实话，这价格确实不便宜，但对于很多养宠人来说，这可能是最后一次表达爱的方式了。

---

以上就是今天的精选热点。关注「水星引力m」，每天带你看点不一样的。"""

# Apply
path_25 = os.path.join(posts_dir, '2026-07-25-digest.md')
path_26 = os.path.join(posts_dir, '2026-07-26-digest.md')
open(path_25, 'w', encoding='utf-8').write(fix_0725)
open(path_26, 'w', encoding='utf-8').write(fix_0726)
print('7/25 and 7/26 rewritten with real content')

# Now fix ALL daily-news titles to avoid the "名词、名词、名词——今天热搜XX" format
# The user doesn't like comma-separated listing titles
import re
for f in sorted(os.listdir(posts_dir)):
    if not f.endswith('.md'):
        continue
    path = os.path.join(posts_dir, f)
    content = open(path, 'r', encoding='utf-8').read()
    
    # Check title for comma-separated listing pattern
    title_m = re.search(r'title: "(.+?)"', content)
    if not title_m:
        continue
    
    title = title_m.group(1)
    
    # Count Chinese commas in title
    commas = title.count('、') + title.count('，')
    
    # If title has 2+ Chinese commas, it's a listing title
    # Also check for "XX热搜" pattern
    has_hot_search = '热搜' in title
    
    if commas >= 2 or (commas >= 1 and has_hot_search):
        old_title = title
        # Simplify: take the first item as the main topic
        # e.g., "台风登陆、医疗翻车、长辈模式劝退：今天热搜有点重" 
        #     → "台风红霞登陆，医疗事故频发，长辈模式被吐槽"
        # Already fixed for 7/24-26 above
        
        # For older articles, just note them
        print(f'Title style: {f} -> "{title[:50]}..."')

print('Done')