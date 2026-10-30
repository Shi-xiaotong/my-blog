#!/usr/bin/env python3
"""Content safety guard — 自动生成内容发布前的题材扫描。

用途：文章写盘 / 提交前扫一遍，命中敏感题材（时政、军事外交、社会案件、
灾难事故、群体性事件、民族宗教等）就拦下来，不写盘、不提交。

用法：
    from content_guard import scan, is_safe
    hits = scan(md_text)          # 返回命中的规则说明列表
    is_safe(md_text)              # True = 可以发布

命令行（CI 用）：
    python _scripts/content_guard.py a.md b.md          # 只报告，命中则 exit 1
    python _scripts/content_guard.py --delete a.md      # 命中则删除文件

规则表见 SENSITIVE_RULES，需要扩充直接往里加；
也可以在项目根放 blocklist.txt（一行一个关键词/正则）追加自定义规则。
"""

import os
import re
import sys

# ── 规则表：（说明, 正则） ────────────────────────────────────────────────
# 只写题材类别，不针对具体个人；命中即拦截。
SENSITIVE_RULES = [
    ("党政时政", r"中共中央|党的第?[一二三四五六七八九十\d]*届|中全会|政治局|总书记|中央委员|国务院|全国人大|人民政协|政协全国|中央军委|党校|党建工作"),
    ("国家机构与领导人", r"国家主席|国务院总理|委员长|政协主席|常委(?:会|委员)|省委书记|市委书记"),
    ("军事外交", r"解放军|军演|军事演习|实战化|导弹试射|核试验|核威慑|国防部|外交部|大使馆|领事馆|领土(?:争议|争端)|主权(?:争议|争端)|领海|划界"),
    ("国际冲突", r"制裁|贸易战|关税战|开战|停火协议|武装冲突|边境冲突|军事行动|空袭|无人机袭击"),
    ("选举政治", r"总统大选|国会选举|议会选举|中期选举|竞选集会|执政党|在野党|弹劾|公投"),
    ("社会案件", r"命案|凶杀|杀人案|枪击案|持刀伤人|绑架案|性侵案|虐童|贩毒|电信诈骗案"),
    ("灾难事故", r"遇难|罹难|死亡人数|伤亡|塌方|坍塌|沉船|空难|矿难|爆炸事故|火灾事故|重大事故"),
    ("群体性事件", r"示威|游行抗议|罢工|罢课|骚乱|暴动|聚集闹事|戒严|维稳"),
    ("反腐纪检", r"落马|双规|纪委监委|纪律审查|监察调查|贪污受贿|巨额财产"),
    ("民族宗教", r"民族(?:冲突|矛盾|分裂)|宗教(?:冲突|极端)|邪教|泛清真化|去极端化"),
    ("公共卫生政策", r"疫情(?:防控|封控)|封城|静默管理|全员核酸|隔离政策|方舱"),
]

_EXTRA_RULES = []


def _load_extra_rules():
    """从项目根 blocklist.txt 追加自定义规则（一行一个关键词或正则）。"""
    global _EXTRA_RULES
    if _EXTRA_RULES:
        return _EXTRA_RULES
    root = os.environ.get("BLOG_DIR", ".")
    path = os.path.join(root, "blocklist.txt")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    _EXTRA_RULES.append((f"自定义({line})", line))
    return _EXTRA_RULES


def scan(text: str) -> list:
    """返回命中的规则说明列表；空列表表示安全。"""
    if not text:
        return []
    hits = []
    for label, pattern in SENSITIVE_RULES + _load_extra_rules():
        if re.search(pattern, text):
            hits.append(label)
    return hits


def is_safe(text: str) -> bool:
    return not scan(text)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    delete = "--delete" in sys.argv

    flagged = 0
    for path in args:
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            text = f.read()
        hits = scan(text)
        if hits:
            flagged += 1
            print(f"[BLOCK] {path} → {', '.join(hits)}")
            if delete:
                os.remove(path)
                print(f"         已删除：{path}")
        else:
            print(f"[OK]    {path}")

    if flagged:
        print(f"\n共拦截 {flagged} 个文件")
    return 1 if flagged else 0


if __name__ == "__main__":
    sys.exit(main())
