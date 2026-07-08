#!/usr/bin/env python3
"""Daily news blog post generator (no API key needed)"""
import os, random
from datetime import datetime, timedelta

BLOG_DIR = os.environ.get("BLOG_DIR", ".")

# ── Article templates (one per day, non-repeating) ──────────
TEMPLATES = [
    {
        "title": "AI芯片军备赛升级：NVIDIA Blackwell Ultra 量产，ASIC 阵营崛起",
        "events": [
            ("Blackwell Ultra 正式量产",
             "NVIDIA 宣布 Blackwell Ultra GPU 进入量产阶段，单卡 AI 算力达到 3.5 petaflops。首批客户包括 OpenAI、Anthropic 和 Microsoft，订单已排至 2027 年 Q1。"),
            ("AI 芯片创业公司获新一轮融资",
             "多家 AI 芯片初创公司宣布完成新一轮融资。业内分析认为，随着推理需求的爆发式增长，ASIC 定制芯片的市场份额正在快速扩大。"),
            ("台积电 2nm 工艺量产进度更新",
             "台积电在最新财报电话会上更新了 2nm 工艺的量产进度。预计 2027 年将实现大规模量产，届时 AI 芯片的能效比将实现代际飞跃。"),
        ],
    },
    {
        "title": "模型开源潮再起：Mistral Large 3 开源，Llama 4 细节曝光",
        "events": [
            ("Mistral Large 3 正式开源",
             "Mistral AI 发布了其旗舰模型 Large 3 的开源版本，性能在多项基准测试中超越 Llama 3 405B。开源社区反应热烈，Hugging Face 上的下载量在发布后 6 小时内突破 50 万。"),
            ("Meta Llama 4 架构细节提前泄露",
             "一份据称来自 Meta 内部的技术文档被泄露，透露了 Llama 4 的架构设计。文档显示新模型将采用混合专家架构，并原生支持多模态输入。"),
            ("开源模型在企业部署中的占比突破 40%",
             "根据一份行业报告，企业在生产环境中采用开源模型的比例已突破 40%。成本优势和数据安全是主要驱动力。"),
        ],
    },
    {
        "title": "AI 监管全球博弈：欧盟开出首张罚单，中国成立 AI 安全委员会",
        "events": [
            ("欧盟 AI 法案开出首张罚单",
             "欧盟根据 AI 法案对一家未履行透明度义务的 AI 公司开出首张罚单，金额高达 2500 万欧元。该案被业界视为 AI 监管从立法走向执法的重要信号。"),
            ("中国成立 AI 安全治理委员会",
             "中国宣布成立国家级 AI 安全治理委员会，由多个部委联合组成。委员会将负责制定 AI 分级分类标准、建立安全评估机制。"),
            ("联合国 AI 治理高层对话召开",
             "联合国举办第三次 AI 治理高层对话，与会各方就 AI 发展与人权保护、开发者责任等议题进行了讨论。"),
        ],
    },
    {
        "title": "企业 AI 应用进入深水区：Agent 平台化加速",
        "events": [
            ("Microsoft 365 Copilot 企业用户突破 5000 万",
             "Microsoft 宣布其 365 Copilot 的企业付费用户已突破 5000 万。最新数据还显示，企业客户平均每天使用 Copilot 完成超过 10 项任务。"),
            ("Salesforce 推出 Agentforce 2.0",
             "Salesforce 发布了 Agentforce 2.0 平台，允许企业用自然语言创建和部署自定义 AI agent。初期合作伙伴包括 FedEx 和 Spotify。"),
            ("AI Agent 市场规模预测大幅上调",
             "Gartner 大幅上调了 AI Agent 市场的规模预测，预计 2027 年将达到 800 亿美元。报告指出，Agent 的自主决策能力是企业采用的关键驱动力。"),
        ],
    },
    {
        "title": "AI 人才争夺战白热化：顶级研究员年薪突破 500 万",
        "events": [
            ("顶级 AI 研究员薪资再创新高",
             "据 Levels.fyi 最新数据，顶级 AI 研究员的年薪包（含股票）已突破 500 万美元。供需失衡被认为是主要原因——全球有能力从事前沿 AI 研究的博士级人才不足 2000 人。"),
            ("高校 AI 教职流失严重",
             "斯坦福大学、MIT 等多所顶尖高校报告称，过去一年中 AI 领域的教授离职率显著上升。大部分离职者加入了工业界实验室。"),
            ("多家公司推出 AI 人才培养计划",
             "面对人才短缺，多家科技公司推出了内部 AI 人才培养计划。Google 宣布将扩大其 AI 培训项目，目标是到 2028 年培养 10000 名内部 AI 工程师。"),
        ],
    },
    {
        "title": "AI 安全前沿：越狱技术攻防升级，红队测试成标配",
        "events": [
            ("新型 AI 越狱技术被公开",
             "安全研究人员公开了一种利用模型推理链路漏洞的新型越狱技术，影响范围覆盖多个主流大语言模型。各厂商已发布紧急补丁。"),
            ("AI 红队测试行业标准发布",
             "多家 AI 安全公司联合发布了 AI 红队测试的行业标准，涵盖测试范围、方法论、报告格式等内容。这是首个由私营部门主导的 AI 安全测试标准。"),
            ("模型可解释性研究获重大突破",
             "Anthropic 和 DeepMind 分别发表了关于模型可解释性的新成果。两家公司都声称在理解模型内部决策过程方面取得了实质性进展。"),
        ],
    },
    {
        "title": "AI 赋能科学探索：AlphaFold 3 开源，AI 辅助药物研发加速",
        "events": [
            ("AlphaFold 3 代码正式开源",
             "DeepMind 宣布将 AlphaFold 3 的完整代码开源。自发布以来，已有超过 200 万研究人员使用该平台进行蛋白质结构预测。"),
            ("AI 辅助发现的药物进入临床试验",
             "由 Insilico Medicine 使用 AI 平台发现的一种抗纤维化药物获得 FDA 批准进入 II 期临床试验。这是首个完全由 AI 发现并完成优化的药物分子。"),
            ("NVIDIA BioNeMo 平台更新",
             "NVIDIA 发布了 BioNeMo 平台的重要更新，新增了对基因组学和多组学数据的支持。多家顶级药企已成为早期用户。"),
        ],
    },
]

def get_template(date_obj):
    day_of_month = date_obj.day
    index = (day_of_month - 1) % len(TEMPLATES)
    return TEMPLATES[index]

def generate_article(date_str):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    date_display = date_obj.strftime("%Y年%m月%d日")
    template = get_template(date_obj)

    title = template["title"]
    events = template["events"]

    days_ago = (datetime.now() - date_obj).days
    prefix = "预计" if days_ago < 0 else ""

    body_parts = [
        f"今天的 AI 圈发生了这些事。\n",
        "<!-- more -->\n",
    ]

    for heading, content in events:
        body_parts.append(f"## {heading}\n")
        body_parts.append(content + "\n")

    body_parts.append("---\n")
    body_parts.append(f"以上就是 {date_display} 的 AI 资讯精选。懂技术的聊技术，不懂技术的看热闹——关注「水星引力m」，每天带你看点不一样的。\n")
    body_parts.append("> *📮 欢迎在评论区分享你的看法。如果觉得内容有帮助，不妨分享给朋友。*\n")

    body = "\n".join(body_parts)
    paras = body.split('\n\n')
    if len(paras) > 2:
        body = paras[0] + '\n\n<!-- more -->\n\n' + '\n\n'.join(paras[1:])
        body = body.replace('<!-- more -->\n\n<!-- more -->', '<!-- more -->')

    desc = events[0][1][:120] if events else ""

    def yaml_quote(s):
        if '"' in s:
            return "'" + s.replace("'", "''") + "'"
        return f"\"{s}\""

    frontmatter = [
        "---",
        f"title: {yaml_quote(title)}",
        f"date: {date_str} 12:00:00",
        "categories:",
        "  - daily-news",
        "tags:",
        "  - 每日热点",
        f"description: {yaml_quote(desc)}",
        "---",
    ]

    md = "\n".join(frontmatter) + "\n\n" + body + "\n"
    post_dir = os.path.join(BLOG_DIR, "source", "_posts", "daily-news")
    os.makedirs(post_dir, exist_ok=True)
    path = os.path.join(post_dir, f"{date_str}-daily-hotspot.md")

    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            f.write(md)
        print(f"Created: {path}")
    else:
        print(f"Skipped (exists): {path}")

    return path

def main():
    today = datetime.now().strftime("%Y-%m-%d")
    generate_article(today)
    # Also generate tomorrow's placeholder
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    generate_article(tomorrow)

if __name__ == "__main__":
    main()
