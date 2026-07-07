#!/usr/bin/env python3
"""Generate missing tool pages for the blog matching 33tool.com style"""
import os, json, textwrap

OUT = r"F:\CodeProject\my-blog\source\tools"

def tmpl(title, desc, body_js, extra_style=""):
    t = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>''' + title + ''' - 在线工具</title>
<link rel="stylesheet" href="common.css">
<style>
''' + extra_style + '''
</style>
</head>
<body>
<button class="theme-toggle" onclick="toggleTheme()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
<div class="container">
  <div class="header">
    <a href="/tools/" class="back-link"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> 返回工具箱</a>
    <h1>''' + title + ''' <span style="font-size:14px;color:var(--text-secondary);font-weight:400">· 纯前端工具</span></h1>
  </div>
  <div class="tool-area">
''' + body_js + '''
  </div>
</div>
<script>
function toggleTheme(){const h=document.documentElement;const d=h.getAttribute('data-theme')==='dark';h.setAttribute('data-theme',d?'':'dark');localStorage.setItem('tool-theme',d?'light':'dark');const b=document.querySelector('.theme-toggle');b.innerHTML=d?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'}
(function(){const s=localStorage.getItem('tool-theme');if(s==='dark'){document.documentElement.setAttribute('data-theme','dark');document.querySelector('.theme-toggle').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'}})()
function showToast(msg){const d=document.createElement('div');d.className='toast';d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),2000)}
</script>
<script src="track.js"></script>
</body>
</html>'''
    return t

TOOLS = []

def add(fn, title, desc, body, css=""):
    TOOLS.append((fn, title, desc, body, css))

# ========== GROUP 1: JSON/Dev Tools ==========

add("json-to-java.html", "JSON转Java实体类", "JSON → Java @Data class",
'''<textarea id="input" style="width:100%;min-height:150px;font-family:monospace;font-size:13px" placeholder='{"name":"John","age":30}'></textarea>
<button class="btn btn-primary" onclick="convert()" style="margin:12px 0">生成Java类</button>
<textarea id="output" style="width:100%;min-height:200px;font-family:monospace;font-size:13px" readonly></textarea>
<script>
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function toType(v){if(v===null)return"String";if(typeof v==="boolean")return"Boolean";if(typeof v==="number")return v%1===0?"Integer":"Double";if(Array.isArray(v))return"List<Object>";return"String"}
function convert(){
  var raw=document.getElementById('input').value;var obj;
  try{obj=JSON.parse(raw)}catch(e){showToast('JSON格式错误');return}
  if(typeof obj!=='object'||obj===null){showToast('请输入一个JSON对象');return}
  var cls=[];Object.keys(obj).forEach(function(k){
    cls.push('    private '+toType(obj[k])+' '+k+';')
  })
  document.getElementById('output').value=
'import lombok.Data;\\n@Data\\npublic class Root {\\n'+cls.join('\\n')+'\\n}'
}
</script>''')

add("json-to-csharp.html", "JSON转C#实体类", "JSON → C# class",
'''<textarea id="input" style="width:100%;min-height:150px;font-family:monospace;font-size:13px" placeholder='{"name":"John","age":30}'></textarea>
<button class="btn btn-primary" onclick="convert()" style="margin:12px 0">生成C#类</button>
<textarea id="output" style="width:100%;min-height:200px;font-family:monospace;font-size:13px" readonly></textarea>
<script>
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function toType(v){if(v===null)return"string";if(typeof v==="boolean")return"bool";if(typeof v==="number")return v%1===0?"int":"double";if(Array.isArray(v))return"List<object>";return"string"}
function convert(){
  var raw=document.getElementById('input').value;var obj;
  try{obj=JSON.parse(raw)}catch(e){showToast('JSON格式错误');return}
  if(typeof obj!=='object'||obj===null){showToast('请输入一个JSON对象');return}
  var cls=[];Object.keys(obj).forEach(function(k){
    cls.push('    public '+toType(obj[k])+' '+cap(k)+' { get; set; }')
  })
  document.getElementById('output').value='public class Root\\n{\\n'+cls.join('\\n')+'\\n}'
}
</script>''')

add("json-to-go.html", "JSON转Golang结构体", "JSON → Go struct",
'''<textarea id="input" style="width:100%;min-height:150px;font-family:monospace;font-size:13px" placeholder='{"name":"John","age":30}'></textarea>
<button class="btn btn-primary" onclick="convert()" style="margin:12px 0">生成Go结构体</button>
<textarea id="output" style="width:100%;min-height:200px;font-family:monospace;font-size:13px" readonly></textarea>
<script>
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function toType(v){if(v===null)return"string";if(typeof v==="boolean")return"bool";if(typeof v==="number")return v%1===0?"int":"float64";if(Array.isArray(v))return"[]interface{}";return"string"}
function convert(){
  var raw=document.getElementById('input').value;var obj;
  try{obj=JSON.parse(raw)}catch(e){showToast('JSON格式错误');return}
  if(typeof obj!=='object'||obj===null){showToast('请输入一个JSON对象');return}
  var cls=[];Object.keys(obj).forEach(function(k){
    cls.push('    '+cap(k)+' '+toType(obj[k])+' `json:"'+k+'"`')
  })
  document.getElementById('output').value='type Root struct {\\n'+cls.join('\\n')+'\\n}'
}
</script>''')

add("json-to-sql.html", "JSON转SQL", "JSON → CREATE TABLE",
'''<textarea id="input" style="width:100%;min-height:150px;font-family:monospace;font-size:13px" placeholder='{"name":"John","age":30}'></textarea>
<button class="btn btn-primary" onclick="convert()" style="margin:12px 0">生成SQL</button>
<textarea id="output" style="width:100%;min-height:200px;font-family:monospace;font-size:13px" readonly></textarea>
<script>
function toSql(v){if(v===null)return"TEXT";if(typeof v==="boolean")return"BOOLEAN";if(typeof v==="number")return v%1===0?"INTEGER":"REAL";if(Array.isArray(v))return"TEXT";return"TEXT"}
function convert(){
  var raw=document.getElementById('input').value;var obj;
  try{obj=JSON.parse(raw)}catch(e){showToast('JSON格式错误');return}
  if(typeof obj!=='object'||obj===null){showToast('请输入一个JSON对象');return}
  var cols=[];Object.keys(obj).forEach(function(k){
    cols.push('  `'+k+'` '+toSql(obj[k]))
  })
  document.getElementById('output').value='CREATE TABLE `data` (\\n'+cols.join(',\\n')+'\\n);'
}
</script>''')

add("jsonpath.html", "JSONPath解析器", "JSON + JSONPath 查询",
'''<div class="row"><div><label>JSON</label><textarea id="json" style="width:100%;min-height:180px;font-family:monospace;font-size:13px" placeholder='{"store":{"book":[{"title":"A"}]}}'></textarea></div></div>
<div class="row"><div><label>JSONPath表达式</label><input type="text" id="path" style="font-family:monospace" value="$.store.book[*].title"></div></div>
<button class="btn btn-primary" onclick="query()">查询</button>
<div id="result" style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-family:monospace;font-size:13px;min-height:40px;white-space:pre-wrap"></div>
<script>
function query(){
  var j=document.getElementById('json').value;var p=document.getElementById('path').value;var obj;
  try{obj=JSON.parse(j)}catch(e){document.getElementById('result').textContent='JSON格式错误';return}
  try{
    var parts=p.replace(/^\\$\\.?/,'').split(/[\\[\\]\\.]+/).filter(Boolean);
    var cur=obj;var found=true;
    for(var i=0;i<parts.length;i++){
      var part=parts[i];
      if(part==='*'){if(Array.isArray(cur)){var r=[];for(var k=0;k<cur.length;k++)r.push(JSON.stringify(cur[k],null,2));document.getElementById('result').textContent=r.join('\\n');return}else{found=false;break}}
      else if(part.indexOf('?')>=0||part.indexOf('@')>=0){found=false;break}
      else if(cur&&cur.hasOwnProperty(part))cur=cur[part];
      else{var idx=parseInt(part);if(!isNaN(idx)&&Array.isArray(cur)&&idx<cur.length)cur=cur[idx];else{found=false;break}}
    }
    if(found)document.getElementById('result').textContent=JSON.stringify(cur,null,2);
    else document.getElementById('result').textContent='路径无匹配结果';
  }catch(e){document.getElementById('result').textContent='路径错误: '+e.message}
}
</script>''')

add("html-formatter.html", "HTML格式化", "格式化/压缩HTML",
'''<div style="margin-bottom:12px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="fmt()">格式化</button>
<button class="btn btn-outline" onclick="minify()">压缩</button>
</div>
<textarea id="input" style="width:100%;min-height:180px;font-family:monospace;font-size:13px" placeholder="粘贴HTML代码..."></textarea>
<textarea id="output" style="width:100%;min-height:180px;font-family:monospace;font-size:13px;margin-top:8px" readonly></textarea>
<script>
function fmt(){
  var t=document.getElementById('input').value;
  if(!t)return;
  var indent=0;var out='';var inTag=false;
  for(var i=0;i<t.length;i++){
    var c=t[i];var n=t[i+1]||'';
    if(c==='<'){if(n==='/')out+='\\n'+'  '.repeat(Math.max(0,indent-1));else if(n!='!'&&n!='?')out+='\\n'+'  '.repeat(indent);inTag=true}
    else if(c==='>'){inTag=false;if(t[i-1]==='/'){}else if(n==='<'&&t[i+2]!=='/')indent++;if(t.slice(i-2,i+1)==='/>'){}else if(t.slice(i-1,i+1)==='>'){}}
    out+=c;
  }
  document.getElementById('output').value=out.trim();
}
function minify(){document.getElementById('output').value=document.getElementById('input').value.replace(/\\s{2,}/g,' ').replace(/>\\s+</g,'><').trim()}
</script>''')

add("xml-formatter.html", "XML格式化", "格式化/压缩XML",
'''<div style="margin-bottom:12px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="fmt()">格式化</button>
<button class="btn btn-outline" onclick="minify()">压缩</button>
</div>
<textarea id="input" style="width:100%;min-height:180px;font-family:monospace;font-size:13px" placeholder="粘贴XML..."></textarea>
<textarea id="output" style="width:100%;min-height:180px;font-family:monospace;font-size:13px;margin-top:8px" readonly></textarea>
<script>
function fmt(){var t=document.getElementById('input').value;var r='';var d=0;t.replace(/(<[^>]+>)/g,function(m){if(m[1]=='/')d--;r+='\\n'+'  '.repeat(Math.max(0,d))+m;if(m[1]!='/'&&m[m.length-2]!='/')d++});document.getElementById('output').value=r.trim()}
function minify(){document.getElementById('output').value=document.getElementById('input').value.replace(/>\\s+</g,'><').trim()}
</script>''')

add("js-formatter.html", "JavaScript格式化", "美化JS代码",
'''<div style="margin-bottom:12px"><button class="btn btn-primary" onclick="fmt()">格式化</button></div>
<textarea id="input" style="width:100%;min-height:180px;font-family:monospace;font-size:13px" placeholder="粘贴JS代码..."></textarea>
<textarea id="output" style="width:100%;min-height:180px;font-family:monospace;font-size:13px;margin-top:8px" readonly></textarea>
<script>
function fmt(){
  var t=document.getElementById('input').value;
  var indent=0;var out='';var nl=false;
  for(var i=0;i<t.length;i++){
    var c=t[i];
    if('{')out+='\\n'+'  '.repeat(indent++)+'{\\n'+'  '.repeat(indent);
    else if('}'){out+='\\n'+'  '.repeat(--indent)+'}';nl=true}
    else if(c==';'){out+=';\\n'+'  '.repeat(indent);nl=true}
    else{if(nl&&!/\\s/.test(c))out+='  '.repeat(indent);nl=false;out+=c}
  }
  document.getElementById('output').value=out;
}
</script>''')

add("browser-info.html", "获取浏览器信息", "浏览器/系统信息",
'''<button class="btn btn-primary" onclick="showInfo()">获取浏览器信息</button>
<div id="info" style="margin-top:12px;padding:16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:13px;line-height:1.8"></div>
<script>
function showInfo(){
  var i=document.getElementById('info');
  i.innerHTML='<table style="width:100%;border-collapse:collapse">'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">User Agent</td><td style="padding:6px 12px">'+navigator.userAgent+'</td></tr>'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">平台</td><td style="padding:6px 12px">'+navigator.platform+'</td></tr>'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">语言</td><td style="padding:6px 12px">'+navigator.language+'</td></tr>'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">屏幕</td><td style="padding:6px 12px">'+screen.width+'x'+screen.height+'</td></tr>'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">可用屏幕</td><td style="padding:6px 12px">'+screen.availWidth+'x'+screen.availHeight+'</td></tr>'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">颜色深度</td><td style="padding:6px 12px">'+screen.colorDepth+'bit</td></tr>'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">CPU核心</td><td style="padding:6px 12px">'+(navigator.hardwareConcurrency||'未知')+'</td></tr>'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">内存</td><td style="padding:6px 12px">'+(navigator.deviceMemory?navigator.deviceMemory+'GB':'未知')+'</td></tr>'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">在线状态</td><td style="padding:6px 12px">'+(navigator.onLine?'在线':'离线')+'</td></tr>'+
    '<tr><td style="padding:6px 12px;color:var(--text-secondary)">Cookie启用</td><td style="padding:6px 12px">'+(navigator.cookieEnabled?'是':'否')+'</td></tr>'+
    '</table>'
}
</script>''')

add("random-ip.html", "随机IP生成器", "IPv4/IPv6随机生成",
'''<div class="row"><div><label>类型</label><select id="type"><option value="ipv4">IPv4</option><option value="ipv6">IPv6</option></select></div>
<div><label>数量</label><input type="number" id="count" value="5" min="1" max="50"></div></div>
<button class="btn btn-primary" onclick="gen()">生成</button>
<textarea id="out" style="width:100%;min-height:150px;font-family:monospace;font-size:13px;margin-top:12px" readonly></textarea>
<script>
function gen(){
  var t=document.getElementById('type').value;var n=parseInt(document.getElementById('count').value)||5;var r=[];
  for(var i=0;i<n;i++){
    if(t==='ipv4')r.push([0,0,0,0].map(function(){return Math.floor(Math.random()*256)}).join('.'));
    else r.push(Array(8).fill(0).map(function(){return Math.floor(Math.random()*65536).toString(16)}).join(':'));
  }
  document.getElementById('out').value=r.join('\\n');
}
</script>''')

add("random-mac.html", "随机MAC生成器", "随机MAC地址",
'''<div class="row"><div><label>格式</label><select id="fmt"><option value=":">XX:XX:XX:XX:XX:XX</option><option value="-">XX-XX-XX-XX-XX-XX</option><option value="">XXXXXXXXXXXX</option></select></div>
<div><label>数量</label><input type="number" id="count" value="5" min="1" max="50"></div></div>
<button class="btn btn-primary" onclick="gen()">生成</button>
<textarea id="out" style="width:100%;min-height:150px;font-family:monospace;font-size:13px;margin-top:12px" readonly></textarea>
<script>
function gen(){
  var f=document.getElementById('fmt').value;var n=parseInt(document.getElementById('count').value)||5;var r=[];
  for(var i=0;i<n;i++){
    var b=Array(6).fill(0).map(function(){var v=Math.floor(Math.random()*256);return v.toString(16).padStart(2,'0')});
    r.push(b.join(f));
  }
  document.getElementById('out').value=r.join('\\n');
}
</script>''')

add("random-phone.html", "随机手机号生成器", "随机中国手机号",
'''<div class="row"><div><label>运营商</label><select id="op"><option value="all">全部</option><option value="cm">移动</option><option value="cu">联通</option><option value="ct">电信</option></select></div>
<div><label>数量</label><input type="number" id="count" value="5" min="1" max="50"></div></div>
<button class="btn btn-primary" onclick="gen()">生成</button>
<textarea id="out" style="width:100%;min-height:150px;font-family:monospace;font-size:13px;margin-top:12px" readonly></textarea>
<script>
var PREFIXES={'all':['130','131','132','133','134','135','136','137','138','139','150','151','152','153','155','156','157','158','159','170','171','173','175','176','177','178','180','181','182','183','184','185','186','187','188','189','198','199'],'cm':['134','135','136','137','138','139','150','151','152','157','158','159','178','182','183','184','187','188','198'],'cu':['130','131','132','155','156','166','171','175','176','185','186'],'ct':['133','153','173','177','180','181','189','199']}
function gen(){
  var op=document.getElementById('op').value;var n=parseInt(document.getElementById('count').value)||5;var p=PREFIXES[op];var r=[];
  for(var i=0;i<n;i++){var pre=p[Math.floor(Math.random()*p.length)];var suf=String(Math.floor(Math.random()*100000000)).padStart(8,'0');r.push(pre+suf)}
  document.getElementById('out').value=r.join('\\n');
}
</script>''')

add("roman-numeral.html", "罗马数字转换", "阿拉伯↔罗马数字",
'''<div class="row"><div><label>阿拉伯数字</label><input type="number" id="arab" min="1" max="3999" oninput="a2r()" placeholder="1-3999"></div>
<div><label>罗马数字</label><input type="text" id="roman" oninput="r2a()" placeholder="e.g. MCMXC"></div></div>
<script>
var M=[["","M","MM","MMM"],["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM"],["","X","XX","XXX","XL","L","LX","LXX","LXXX","XC"],["","I","II","III","IV","V","VI","VII","VIII","IX"]];
function a2r(){var n=parseInt(document.getElementById('arab').value)||0;if(n<1||n>3999)return;document.getElementById('roman').value=M[0][Math.floor(n/1000)]+M[1][Math.floor(n%1000/100)]+M[2][Math.floor(n%100/10)]+M[3][n%10]}
function r2a(){var s=document.getElementById('roman').value.toUpperCase();var m={'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000};var t=0;for(var i=0;i<s.length;i++){var c=m[s[i]]||0;var n=m[s[i+1]]||0;t+=c<n?-c:c}document.getElementById('arab').value=t>0?t:''}
</script>''')

add("json-url-param.html", "JSON与URL参数互转", "JSON ↔ Query String",
'''<div style="margin-bottom:12px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="j2u()">JSON → URL参数</button>
<button class="btn btn-outline" onclick="u2j()">URL参数 → JSON</button>
</div>
<textarea id="input" style="width:100%;min-height:120px;font-family:monospace;font-size:13px" placeholder='{"name":"John","age":30} 或 name=John&age=30'></textarea>
<textarea id="output" style="width:100%;min-height:120px;font-family:monospace;font-size:13px;margin-top:8px" readonly></textarea>
<script>
function j2u(){try{var o=JSON.parse(document.getElementById('input').value);var p=[];Object.keys(o).forEach(function(k){p.push(encodeURIComponent(k)+'='+encodeURIComponent(o[k]))});document.getElementById('output').value=p.join('&')}catch(e){showToast('JSON格式错误')}}
function u2j(){var s=document.getElementById('input').value;var o={};s.split('&').forEach(function(p){var kv=p.split('=');if(kv[0])o[decodeURIComponent(kv[0])]=decodeURIComponent(kv[1]||'')});document.getElementById('output').value=JSON.stringify(o,null,2)}
</script>''')

add("file-hash.html", "文件Hash计算", "文件MD5/SHA1/SHA256",
'''<div style="padding:30px;text-align:center;border:2px dashed var(--border);border-radius:12px;cursor:pointer" id="drop" ondragover="event.preventDefault()" ondrop="event.preventDefault();handle(event.dataTransfer.files[0])" onclick="document.getElementById('fileInput').click()">
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  <p style="margin-top:8px;color:var(--text-secondary)">拖拽文件到这里或点击上传</p>
  <input type="file" id="fileInput" style="display:none" onchange="handle(this.files[0])">
</div>
<div id="result" style="margin-top:12px;display:none">
<div style="margin:4px 0"><span style="color:var(--text-secondary)">文件名:</span> <span id="fn"></span></div>
<div style="margin:4px 0"><span style="color:var(--text-secondary)">文件大小:</span> <span id="fs"></span></div>
<div style="margin:4px 0"><span style="color:var(--text-secondary)">MD5:</span> <span id="m5" style="font-family:monospace;word-break:break-all"></span></div>
<div style="margin:4px 0"><span style="color:var(--text-secondary)">SHA1:</span> <span id="s1" style="font-family:monospace;word-break:break-all"></span></div>
<div style="margin:4px 0"><span style="color:var(--text-secondary)">SHA256:</span> <span id="s256" style="font-family:monospace;word-break:break-all"></span></div>
</div>
<p id="status" style="color:var(--text-secondary);margin-top:8px"></p>
<script>
function handle(f){if(!f)return;document.getElementById('fn').textContent=f.name;document.getElementById('fs').textContent=(f.size/1024).toFixed(1)+'KB';document.getElementById('result').style.display='block';var r=new FileReader();r.onload=function(e){var buf=e.target.result;crypto.subtle.digest('SHA-1',buf).then(function(b){document.getElementById('s1').textContent=Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')});crypto.subtle.digest('SHA-256',buf).then(function(b){document.getElementById('s256').textContent=Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')});var md5=function(b){var s='';var v=new Uint8Array(b);for(var i=0;i<v.length;i++)s+=String.fromCharCode(v[i]);document.getElementById('m5').textContent=md5Hash(s)};md5(buf)};r.readAsArrayBuffer(f)}
function md5Hash(s){function F(x,y,z){return(x&y)|(~x&z)}function G(x,y,z){return(x&z)|(y&~z)}function H(x,y,z){return x^y^z}function I(x,y,z){return y^(x|~z)}function rol(v,s){return(v<<s)|(v>>>(32-s))}function add(x,y){var l=(x&0xFFFF)+(y&0xFFFF);return(((x>>16)+(y>>16)+(l>>16))<<16)|(l&0xFFFF)}function toBytes(s){var b=[];for(var i=0;i<s.length;i++)b.push(s.charCodeAt(i));return b}
var b=toBytes(unescape(encodeURIComponent(s)));var l=b.length*8;b.push(0x80);while(b.length%64!==56)b.push(0);for(var i=0;i<8;i++)b.push((l>>>((7-i)*8))&0xFF);
var h=[0x67452301,0xEFCDAB89,0x98BADCFE,0x10325476];var T=[];for(var i=1;i<=64;i++)T[i]=Math.floor(Math.abs(Math.sin(i))*0x100000000);
for(var i=0;i<b.length;i+=64){var w=[];for(var j=0;j<16;j++)w[j]=b[i+j*4]|(b[i+j*4+1]<<8)|(b[i+j*4+2]<<16)|(b[i+j*4+3]<<24);for(var j=16;j<80;j++)w[j]=rol(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);var a=h[0],d=h[3],c=h[2],b2=h[1];for(var j=0;j<64;j++){var f,k;if(j<20){f=F(b2,c,d);k=0x5A827999}else if(j<40){f=H(b2,c,d);k=0x6ED9EBA1}else if(j<60){f=G(b2,c,d);k=0x8F1BBCDC}else{f=I(b2,c,d);k=0xCA62C1D6}var t=add(add(rol(a,5),f),add(k,w[j]));d=c;c=b2;b2=a;a=t;var tmp=d;d=c;c=b2;b2=a;a=tmp}h[0]=add(h[0],a);h[1]=add(h[1],b2);h[2]=add(h[2],c);h[3]=add(h[3],d)}
return h.map(function(v){return('00000000'+(v>>>0).toString(16)).slice(-8)}).join('')}
</script>''')

add("dir-tree.html", "目录树生成", "文件路径 → 树形结构",
'''<textarea id="input" style="width:100%;min-height:120px;font-family:monospace;font-size:13px" placeholder="src/index.js&#10;src/components/App.js&#10;src/utils/helper.js&#10;package.json"></textarea>
<button class="btn btn-primary" onclick="gen()" style="margin:8px 0">生成目录树</button>
<pre id="output" style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:16px;font-size:13px;line-height:1.6;overflow-x:auto"></pre>
<script>
function gen(){
  var lines=document.getElementById('input').value.split('\\n').filter(Boolean);var tree={};
  lines.forEach(function(l){var parts=l.split('/');var cur=tree;for(var i=0;i<parts.length;i++){if(!cur[parts[i]])cur[parts[i]]={};cur=cur[parts[i]]}})
  function render(obj,pre){var keys=Object.keys(obj);var html='';for(var i=0;i<keys.length;i++){var isLast=i===keys.length-1;var connector=isLast?'└── ':'├── ';var child=isLast?'    ':'│   ';html+=pre+connector+keys[i]+'\\n';if(Object.keys(obj[keys[i]]).length)html+=render(obj[keys[i]],pre+child)}return html}
  document.getElementById('output').textContent=render(tree,'')
}
</script>''')

# ========== GROUP 2: Crypto ==========

add("md5-encrypt.html", "MD5加密", "MD5 32位/16位",
'''<label>输入文本</label>
<textarea id="input" style="width:100%;min-height:80px;font-size:14px" placeholder="输入要加密的文本"></textarea>
<div style="margin:12px 0;display:flex;gap:8px;flex-wrap:wrap">
<button class="btn btn-primary" onclick="calc('32')">MD5 32位</button>
<button class="btn btn-outline" onclick="calc('16')">MD5 16位</button>
</div>
<textarea id="output" style="width:100%;min-height:40px;font-family:monospace;font-size:13px" readonly></textarea>
<script>
function calc(mode){var s=document.getElementById('input').value;if(!s)return;var h=md5(s);document.getElementById('output').value=mode==='16'?h.slice(8,24):h}
function md5(s){function F(x,y,z){return(x&y)|(~x&z)}function G(x,y,z){return(x&z)|(y&~z)}function H(x,y,z){return x^y^z}function I(x,y,z){return y^(x|~z)}function rol(v,s){return(v<<s)|(v>>>(32-s))}function add(x,y){var l=(x&0xFFFF)+(y&0xFFFF);return(((x>>16)+(y>>16)+(l>>16))<<16)|(l&0xFFFF)}
var b=[];for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c<128)b.push(c);else if(c<2048){b.push(192|c>>6);b.push(128|c&63)}else if(c<55296||c>=57344){b.push(224|c>>12);b.push(128|c>>6&63);b.push(128|c&63)}else{i++;c=0x10000+((c&1023)<<10|(s.charCodeAt(i)&1023));b.push(240|c>>18);b.push(128|c>>12&63);b.push(128|c>>6&63);b.push(128|c&63)}}
var l=b.length*8;b.push(128);while(b.length%64!=56)b.push(0);for(var i=0;i<8;i++)b.push((l>>>((7-i)*8))&255);
var h=[0x67452301,0xefcdab89,0x98badcfe,0x10325476];var T=[];for(var i=1;i<=64;i++)T[i]=Math.floor(Math.abs(Math.sin(i))*4294967296);
for(var i=0;i<b.length;i+=64){var w=[];for(var j=0;j<16;j++)w[j]=b[i+4*j]|(b[i+4*j+1]<<8)|(b[i+4*j+2]<<16)|(b[i+4*j+3]<<24);for(var j=16;j<64;j++)w[j]=rol(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);var a=h[0],bb=h[1],c=h[2],d=h[3];for(var j=0;j<64;j++){var f,g;if(j<16){f=F(bb,c,d);g=j}else if(j<32){f=G(bb,c,d);g=(5*j+1)%16}else if(j<48){f=H(bb,c,d);g=(3*j+5)%16}else{f=I(bb,c,d);g=(7*j)%16}var tmp=d;d=c;c=bb;bb=a;a=add(add(add(rol(a,T[j+1]),f),T[j+1]),w[g]);var at=a;bb=add(bb,T[j+1]);a=bb;bb=c;c=d;d=tmp}h[0]=add(h[0],a);h[1]=add(h[1],bb);h[2]=add(h[2],c);h[3]=add(h[3],d)}
return h.map(function(v){return('00000000'+(v>>>0).toString(16)).slice(-8)}).join('')}
</script>''')

add("sha-encrypt.html", "SHA加密", "SHA1/224/256/384/512",
'''<textarea id="input" style="width:100%;min-height:80px;font-size:14px" placeholder="输入文本"></textarea>
<div style="margin:12px 0;display:flex;gap:6px;flex-wrap:wrap">
<button class="btn btn-primary" onclick="calc('SHA-1')">SHA1</button>
<button class="btn btn-outline" onclick="calc('SHA-256')">SHA256</button>
<button class="btn btn-outline" onclick="calc('SHA-384')">SHA384</button>
<button class="btn btn-outline" onclick="calc('SHA-512')">SHA512</button>
</div>
<textarea id="output" style="width:100%;min-height:40px;font-family:monospace;font-size:13px" readonly></textarea>
<script>
function calc(algo){var s=document.getElementById('input').value;if(!s)return;var enc=new TextEncoder();crypto.subtle.digest(algo,enc.encode(s)).then(function(buf){var h=Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0')}).join('');document.getElementById('output').value=h})}
</script>''')

add("morse-code.html", "摩斯密码", "文本 ↔ 摩斯码",
'''<div style="margin-bottom:12px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="encode()">加密</button>
<button class="btn btn-outline" onclick="decode()">解密</button>
</div>
<textarea id="input" style="width:100%;min-height:100px;font-size:14px" placeholder="输入文本或摩斯码(空格分隔)"></textarea>
<textarea id="output" style="width:100%;min-height:100px;font-size:14px;margin-top:8px" readonly></textarea>
<script>
var M={'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.':'.-.-.-',',':'--..--','?':'..--..',"'":'.----.','!':'-.-.--','/':'-..-.','(':'-.--.',')':'-.--.-','&':'.-...',':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.','-':'-....-','_':'..--.-','"':'.-..-.','$':'...-..-','@':'.--.-.'}
var R={};Object.keys(M).forEach(function(k){R[M[k]]=k})
function encode(){var s=document.getElementById('input').value.toUpperCase();var r=[];for(var i=0;i<s.length;i++){if(s[i]===' ')r.push('/');else if(M[s[i]])r.push(M[s[i]])}document.getElementById('output').value=r.join(' ')}
function decode(){var s=document.getElementById('input').value.split(' ');var r='';for(var i=0;i<s.length;i++){if(s[i]==='/')r+=' ';else if(R[s[i]])r+=R[s[i]]}document.getElementById('output').value=r}
</script>''')

add("rc4-encrypt.html", "RC4加密解密", "RC4流密码",
'''<div class="row"><div><label>密钥</label><input type="text" id="key" placeholder="输入密钥"></div></div>
<textarea id="input" style="width:100%;min-height:80px;font-size:14px;margin-top:8px" placeholder="输入文本"></textarea>
<div style="margin:8px 0;display:flex;gap:8px">
<button class="btn btn-primary" onclick="doRC4()">加密/解密</button>
</div>
<textarea id="output" style="width:100%;min-height:80px;font-size:14px" readonly></textarea>
<script>
function doRC4(){var k=document.getElementById('key').value;var s=document.getElementById('input').value;if(!k||!s)return;var S=[],T=[];for(var i=0;i<256;i++){S[i]=i;T[i]=k.charCodeAt(i%k.length)}var j=0;for(var i=0;i<256;i++){j=(j+S[i]+T[i])%256;var t=S[i];S[i]=S[j];S[j]=t}var i=0;j=0;var r='';for(var n=0;n<s.length;n++){i=(i+1)%256;j=(j+S[i])%256;var t=S[i];S[i]=S[j];S[j]=t;var K=S[(S[i]+S[j])%256];r+=String.fromCharCode(s.charCodeAt(n)^K)}document.getElementById('output').value=r}
</script>''')

add("text-hide.html", "文字隐藏加密", "零宽字符隐写",
'''<div style="margin-bottom:8px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="hide()">隐藏</button>
<button class="btn btn-outline" onclick="reveal()">还原</button>
</div>
<textarea id="input" style="width:100%;min-height:80px;font-size:14px" placeholder="输入要隐藏/显示的文字"></textarea>
<textarea id="output" style="width:100%;min-height:80px;font-size:14px;margin-top:8px" readonly></textarea>
<script>
var ZW='\\u200B\\u200C\\u200D\\uFEFF';
function hide(){var t=document.getElementById('input').value;var b='';for(var i=0;i<t.length;i++){var c=t.charCodeAt(i);b+=ZW[3];for(var j=15;j>=0;j--)b+=ZW[(c>>j)&1]}document.getElementById('output').value='隐藏文本(看不見): '+b}
function reveal(){var t=document.getElementById('input').value;var r='';var i=0;while(i<t.length){if(ZW.includes(t[i])){if(t[i]===ZW[3]){i++;var v=0;for(var j=0;j<16;j++){v=(v<<1)|ZW.indexOf(t[i+j])%2}r+=String.fromCodePoint(v);i+=16}else i++}else i++}document.getElementById('output').value=r||'未检测到隐藏内容'}
</script>''')

add("punycode.html", "Punycode编码解码", "中文域名 ↔ Punycode",
'''<div style="margin-bottom:8px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="encode()">编码</button>
<button class="btn btn-outline" onclick="decode()">解码</button>
</div>
<textarea id="input" style="width:100%;min-height:60px;font-size:14px" placeholder="中文.com 或 xn--..."></textarea>
<textarea id="output" style="width:100%;min-height:60px;font-size:14px;margin-top:8px" readonly></textarea>
<script>
function encode(){var s=document.getElementById('input').value;try{document.getElementById('output').value=new URL('http://'+s).hostname}catch(e){try{document.getElementById('output').value='xn--'+btoa(unescape(encodeURIComponent(s))).replace(/=/g,'').toLowerCase()+'.com'}catch(e2){showToast('编码失败')}}}
function decode(){try{var s=document.getElementById('input').value;document.getElementById('output').value=decodeURIComponent(s.replace(/^xn--/,'').replace(/[^a-zA-Z0-9]/g,''))}catch(e){showToast('解码失败')}}
</script>''')

add("js-obfuscator.html", "JS混淆加密", "JS代码混淆",
'''<textarea id="input" style="width:100%;min-height:120px;font-family:monospace;font-size:13px" placeholder="function hello(){alert('hi')}"></textarea>
<button class="btn btn-primary" onclick="obf()" style="margin:8px 0">混淆加密</button>
<textarea id="output" style="width:100%;min-height:120px;font-family:monospace;font-size:13px" readonly></textarea>
<script>
function obf(){var s=document.getElementById('input').value;if(!s)return;var v=['_0x1','_0x2','_0x3','_0x4','_0x5','_0x6','_0x7'];var idx=0;var r=s.replace(/\b([a-zA-Z_$][\w$]*)\b/g,function(m){if(/^(var|let|const|function|return|if|else|for|while|true|false|null|undefined|this|new|typeof)$/.test(m))return m;var n=v[idx%v.length];idx++;return n});var e=btoa(unescape(encodeURIComponent(r)));document.getElementById('output').value="eval(atob('"+e+"'))"}
</script>''')

# ========== GROUP 3: Time Tools ==========

add("countdown.html", "在线倒计时", "倒计时，支持全屏",
'''<div class="row"><div><label>小时</label><input type="number" id="h" value="0" min="0"></div>
<div><label>分钟</label><input type="number" id="m" value="5" min="0"></div>
<div><label>秒</label><input type="number" id="s" value="0" min="0"></div></div>
<div style="display:flex;gap:8px;flex-wrap:wrap">
<button class="btn btn-primary" onclick="startCD()">开始</button>
<button class="btn btn-outline" onclick="pauseCD()">暂停</button>
<button class="btn btn-outline" onclick="resetCD()">重置</button>
</div>
<div id="display" style="font-size:72px;font-weight:800;text-align:center;padding:40px 0;font-variant-numeric:tabular-nums;color:var(--primary)">00:00</div>
<script>
var cdTimer=null;var cdRemain=0;
function startCD(){if(cdTimer)return;var total=parseInt(document.getElementById('h').value||0)*3600+parseInt(document.getElementById('m').value||0)*60+parseInt(document.getElementById('s').value||0);if(total<=0)return;cdRemain=total;cdTimer=setInterval(function(){if(cdRemain<=0){clearInterval(cdTimer);cdTimer=null;showToast('倒计时结束!')}var m=Math.floor(cdRemain/60);var s=cdRemain%60;document.getElementById('display').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');cdRemain--},1000)}
function pauseCD(){if(cdTimer){clearInterval(cdTimer);cdTimer=null}}
function resetCD(){if(cdTimer){clearInterval(cdTimer);cdTimer=null}document.getElementById('display').textContent='00:00'}
</script>''')

add("alarm-clock.html", "在线闹钟", "闹钟+桌面通知",
'''<div class="row"><div><label>时</label><input type="number" id="ah" value="8" min="0" max="23"></div>
<div><label>分</label><input type="number" id="am" value="0" min="0" max="59"></div></div>
<button class="btn btn-primary" onclick="setAlarm()">设置闹钟</button>
<div id="alarmStatus" style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px;text-align:center"></div>
<script>
var alarmTimer=null;
function setAlarm(){var h=parseInt(document.getElementById('ah').value)||0;var m=parseInt(document.getElementById('am').value)||0;var now=new Date();var target=new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,m,0);if(target<=now)target.setDate(target.getDate()+1);document.getElementById('alarmStatus').innerHTML='⏰ 闹钟已设置: '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');if(alarmTimer)clearInterval(alarmTimer);alarmTimer=setInterval(function(){var d=target-new Date();if(d<=0){clearInterval(alarmTimer);alarmTimer=null;showToast('⏰ 闹钟响了!');if(Notification.permission==='granted')new Notification('闹钟',{body:'时间到了!',icon:'/img/favicon.ico'});document.getElementById('alarmStatus').innerHTML='⏰ 闹钟已响!';playBeep()}else{var h2=Math.floor(d/3600000);var m2=Math.floor((d%3600000)/60000);var s2=Math.floor((d%60000)/1000);document.getElementById('alarmStatus').innerHTML='⏰ 距离闹钟还有 '+h2+'时 '+m2+'分 '+s2+'秒'}},1000);if(Notification.permission==='default')Notification.requestPermission()}
function playBeep(){try{var c=new AudioContext();var o=c.createOscillator();var g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=800;g.gain.value=0.3;o.start();setTimeout(function(){o.stop()},500)}catch(e){}}
</script>''')

add("age-calculator.html", "年龄计算器", "精确计算年龄",
'''<div class="row"><div><label>出生日期</label><input type="date" id="birth"></div></div>
<button class="btn btn-primary" onclick="calcAge()">计算年龄</button>
<div id="ageResult" style="margin-top:12px;padding:16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px;line-height:1.8;text-align:center"></div>
<script>
function calcAge(){var b=new Date(document.getElementById('birth').value);if(isNaN(b.getTime())){showToast('请选择出生日期');return}var n=new Date();var y=n.getFullYear()-b.getFullYear();var m=n.getMonth()-b.getMonth();var d=n.getDate()-b.getDate();if(d<0){m--;d+=new Date(n.getFullYear(),n.getMonth(),0).getDate()}if(m<0){y--;m+=12}var total=n-b;document.getElementById('ageResult').innerHTML='<div style="font-size:32px;font-weight:700;color:var(--primary)">'+y+' 岁</div><div style="margin-top:8px;color:var(--text-secondary)">'+y+'年 '+m+'月 '+d+'天  · 共 '+Math.floor(total/86400000)+' 天</div>'}
</script>''')

add("zodiac.html", "生肖星座查询", "生肖+星座",
'''<div class="row"><div><label>出生日期</label><input type="date" id="zd"></div></div>
<button class="btn btn-primary" onclick="calcZ()">查询</button>
<div id="zResult" style="margin-top:12px;padding:16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px;line-height:2;text-align:center"></div>
<script>
var ANIMALS=['猴','鸡','狗','猪','鼠','牛','虎','兔','龙','蛇','马','羊'];
var STARS=[{'name':'摩羯座','start':[12,22]},{'name':'水瓶座','start':[1,20]},{'name':'双鱼座','start':[2,19]},{'name':'白羊座','start':[3,21]},{'name':'金牛座','start':[4,20]},{'name':'双子座','start':[5,21]},{'name':'巨蟹座','start':[6,22]},{'name':'狮子座','start':[7,23]},{'name':'处女座','start':[8,23]},{'name':'天秤座','start':[9,23]},{'name':'天蝎座','start':[10,24]},{'name':'射手座','start':[11,23]},{'name':'摩羯座','start':[12,22]}]
function calcZ(){var d=new Date(document.getElementById('zd').value);if(isNaN(d.getTime()))return;var y=d.getFullYear();var animal=ANIMALS[y%12];var star='摩羯座';for(var i=0;i<STARS.length-1;i++){var s=STARS[i];if((d.getMonth()+1>s.start[0]||(d.getMonth()+1===s.start[0]&&d.getDate()>=s.start[1]))&&(d.getMonth()+1<STARS[i+1].start[0]||(d.getMonth()+1===STARS[i+1].start[0]&&d.getDate()<STARS[i+1].start[1]))){star=s.name;break}}document.getElementById('zResult').innerHTML='<div style="font-size:28px;margin-bottom:8px">'+animal+'  ·  '+star+'</div><div style="color:var(--text-secondary)">'+y+'年 · '+['','一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'][d.getMonth()+1]+d.getDate()+'日</div>'}
</script>''')

add("shelf-life.html", "保质期计算", "计算过期日期",
'''<div class="row"><div><label>生产日期</label><input type="date" id="prod"></div>
<div><label>保质期(天)</label><input type="number" id="days" value="30" min="1"></div></div>
<button class="btn btn-primary" onclick="calcSL()">计算</button>
<div id="slResult" style="margin-top:12px;padding:16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px;line-height:1.8;text-align:center"></div>
<script>
function calcSL(){var p=new Date(document.getElementById('prod').value);var d=parseInt(document.getElementById('days').value)||0;if(isNaN(p.getTime())||!d)return;var e=new Date(p.getTime()+d*86400000);var n=new Date();var r=Math.ceil((e-n)/86400000);document.getElementById('slResult').innerHTML='<div>生产日期: '+p.toLocaleDateString('zh-CN')+'</div><div>过期日期: <strong>'+e.toLocaleDateString('zh-CN')+'</strong></div><div style="margin-top:8px;font-size:24px;font-weight:700;color:'+(r<0?'#ef4444':r<30?'#f59e0b':'#22c55e')+'">'+(r<0?'已过期 '+Math.abs(r)+' 天':'剩余 '+r+' 天')+'</div>'}
</script>''')

add("dynasty-table.html", "中国历史朝代", "朝代时间线",
'''<div id="dt" style="font-size:13px;line-height:1.8"></div>
<script>
var DY=[['夏','约前2070','约前1600'],['商','约前1600','前1046'],['西周','前1046','前771'],['东周','前770','前256','春秋/战国'],['秦','前221','前207'],['西汉','前202','9'],['东汉','25','220'],['三国','220','280','魏蜀吴'],['西晋','265','316'],['东晋','317','420'],['南北朝','420','589'],['隋','581','618'],['唐','618','907'],['五代十国','907','960'],['北宋','960','1127'],['南宋','1127','1279'],['元','1271','1368'],['明','1368','1644'],['清','1644','1912']];
document.getElementById('dt').innerHTML='<table style="width:100%;border-collapse:collapse">'+DY.map(function(d){return'<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 12px;font-weight:600">'+d[0]+'</td><td style="padding:8px 12px;color:var(--text-secondary)">'+d[1]+' ~ '+d[2]+'</td><td style="padding:8px 12px;color:var(--text-secondary)">'+(d[3]||'')+'</td></tr>'}).join('')+'</table>'
</script>''')

add("time-converter.html", "时间单位转换", "秒↔分↔时↔天",
'''<div class="row"><div><label>数值</label><input type="number" id="tv" value="3600"></div>
<div><label>从</label><select id="from"><option value="s">秒</option><option value="m" selected>分钟</option><option value="h">小时</option><option value="d">天</option></select></div></div>
<button class="btn btn-primary" onclick="convTime()">转换</button>
<div id="tr" style="margin-top:12px;padding:16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px;line-height:2;text-align:center"></div>
<script>
function convTime(){var v=parseFloat(document.getElementById('tv').value)||0;var f=document.getElementById('from').value;var rates={'s':1,'m':60,'h':3600,'d':86400};var sec=v*rates[f];document.getElementById('tr').innerHTML='<div>秒: <strong>'+sec+'</strong></div><div>分钟: <strong>'+(sec/60).toFixed(2)+'</strong></div><div>小时: <strong>'+(sec/3600).toFixed(4)+'</strong></div><div>天: <strong>'+(sec/86400).toFixed(6)+'</strong></div>'}
</script>''')

add("world-clock.html", "世界各地时间", "全球主要城市时间",
'''<div id="wc" style="font-size:13px;line-height:2"></div>
<script>
var CITIES=[['北京','Asia/Shanghai'],['东京','Asia/Tokyo'],['首尔','Asia/Seoul'],['新加坡','Asia/Singapore'],['迪拜','Asia/Dubai'],['莫斯科','Europe/Moscow'],['伦敦','Europe/London'],['巴黎','Europe/Paris'],['柏林','Europe/Berlin'],['纽约','America/New_York'],['芝加哥','America/Chicago'],['洛杉矶','America/Los_Angeles'],['悉尼','Australia/Sydney'],['温哥华','America/Vancouver'],['香港','Asia/Hong_Kong']];
function updWC(){document.getElementById('wc').innerHTML='<table style="width:100%;border-collapse:collapse">'+CITIES.map(function(c){var t=new Date().toLocaleString('zh-CN',{timeZone:c[1]})}).join('')+'</table>'}
setInterval(updWC,1000);updWC()
</script>''',
".row{display:flex;gap:12px;margin-bottom:12px}.row>*{flex:1}")

add("solar-terms.html", "二十四节气", "2025-2026节气表",
'''<div id="st" style="font-size:13px;line-height:1.8"></div>
<script>
var TERMS=[['立春','2月3-5日'],['雨水','2月18-20日'],['惊蛰','3月5-7日'],['春分','3月20-22日'],['清明','4月4-6日'],['谷雨','4月19-21日'],['立夏','5月5-7日'],['小满','5月20-22日'],['芒种','6月5-7日'],['夏至','6月21-22日'],['小暑','7月6-8日'],['大暑','7月22-24日'],['立秋','8月7-9日'],['处暑','8月22-24日'],['白露','9月7-9日'],['秋分','9月22-24日'],['寒露','10月7-9日'],['霜降','10月23-24日'],['立冬','11月7-8日'],['小雪','11月22-23日'],['大雪','12月6-8日'],['冬至','12月21-23日'],['小寒','1月5-7日'],['大寒','1月20-21日']];
document.getElementById('st').innerHTML='<table style="width:100%;border-collapse:collapse">'+TERMS.map(function(t){return'<tr style="border-bottom:1px solid var(--border)"><td style="padding:6px 12px;font-weight:600">'+t[0]+'</td><td style="padding:6px 12px;color:var(--text-secondary)">'+t[1]+'</td></tr>'}).join('')+'</table>'
</script>''')

add("baby-100-days.html", "宝宝百日计算器", "百日/生肖/星座",
'''<div class="row"><div><label>出生日期</label><input type="date" id="bb"></div></div>
<button class="btn btn-primary" onclick="calcBaby()">计算</button>
<div id="bbResult" style="margin-top:12px;padding:16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:14px;line-height:2;text-align:center"></div>
<script>
function calcBaby(){var d=new Date(document.getElementById('bb').value);if(isNaN(d.getTime()))return;var h=new Date(d.getTime()+99*86400000);var y=d.getFullYear();var ani=['猴','鸡','狗','猪','鼠','牛','虎','兔','龙','蛇','马','羊'][y%12];document.getElementById('bbResult').innerHTML='<div>出生: '+d.toLocaleDateString('zh-CN')+'</div><div style="font-size:24px;font-weight:700;color:var(--primary);margin:8px 0">百日: '+h.toLocaleDateString('zh-CN')+'</div><div>生肖: '+ani+'</div>'}
</script>''')

# ========== GROUP 4: Text Tools ==========

add("punctuation.html", "中英标点转换", "中英标点互转",
"""<div style="margin-bottom:8px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="toEn()">中文→英文</button>
<button class="btn btn-outline" onclick="toCn()">英文→中文</button>
</div>
<textarea id="input" style="width:100%;min-height:100px;font-size:14px" placeholder="输入文本"></textarea>
<textarea id="output" style="width:100%;min-height:100px;font-size:14px;margin-top:8px" readonly></textarea>
<script>
var CE={'，':',','。':'.','、':',','！':'!','？':'?','：':':','；':';','"':'"','"':'"',''':"'",''':"'",'（':'(','）':')','【':'[','】':']','《':'<','》':'>','—':'-','…':'...','·':'`'}
var EC={};Object.keys(CE).forEach(function(k){EC[CE[k]]=k})
function toEn(){var s=document.getElementById('input').value;var r='';for(var i=0;i<s.length;i++)r+=CE[s[i]]||s[i];document.getElementById('output').value=r}
function toCn(){var s=document.getElementById('input').value;var r='';for(var i=0;i<s.length;i++)r+=EC[s[i]]||s[i];document.getElementById('output').value=r}
</script>""")

add("array-sort.html", "字符串数组排序", "行文本排序",
'''<div style="margin-bottom:8px;display:flex;gap:8px;flex-wrap:wrap">
<button class="btn btn-primary" onclick="sortA('asc')">升序</button>
<button class="btn btn-outline" onclick="sortA('desc')">降序</button>
<button class="btn btn-outline" onclick="sortA('len')">按长度</button>
<button class="btn btn-outline" onclick="sortA('rand')">随机打乱</button>
<button class="btn btn-outline" onclick="sortA('uniq')">去重</button>
</div>
<textarea id="input" style="width:100%;min-height:120px;font-size:13px;font-family:monospace" placeholder="每行一个项目"></textarea>
<textarea id="output" style="width:100%;min-height:120px;font-size:13px;font-family:monospace;margin-top:8px" readonly></textarea>
<script>
function sortA(m){var a=document.getElementById('input').value.split('\\n').filter(Boolean);if(m==='asc')a.sort();else if(m==='desc')a.sort().reverse();else if(m==='len')a.sort(function(x,y){return x.length-y.length});else if(m==='rand')a.sort(function(){return Math.random()-0.5});else if(m==='uniq')a=a.filter(function(v,i,s){return s.indexOf(v)===i});document.getElementById('output').value=a.join('\\n')}
</script>''')

add("regex-replace.html", "正则替换", "正则查找替换",
'''<div class="row"><div><label>查找</label><input type="text" id="pattern" placeholder="正则表达式"></div>
<div><label>替换为</label><input type="text" id="replacement" placeholder="$1"></div>
<div><label>修饰符</label><input type="text" id="flags" value="g" placeholder="gim" style="width:60px"></div></div>
<textarea id="input" style="width:100%;min-height:100px;font-size:14px" placeholder="输入文本"></textarea>
<div style="margin:8px 0"><button class="btn btn-primary" onclick="doReplace()">替换</button></div>
<textarea id="output" style="width:100%;min-height:100px;font-size:14px" readonly></textarea>
<script>
function doReplace(){try{var p=new RegExp(document.getElementById('pattern').value,document.getElementById('flags').value);var r=document.getElementById('input').value.replace(p,document.getElementById('replacement').value);document.getElementById('output').value=r}catch(e){showToast('正则格式错误')}}
</script>''')

add("trad-simp.html", "简繁体转换", "简体↔繁体",
'''<div style="margin-bottom:8px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="toSimp()">繁体→简体</button>
<button class="btn btn-outline" onclick="toTrad()">简体→繁体</button>
</div>
<textarea id="input" style="width:100%;min-height:100px;font-size:14px" placeholder="输入文本"></textarea>
<textarea id="output" style="width:100%;min-height:100px;font-size:14px;margin-top:8px" readonly></textarea>
<script>
var S2T={};var T2S={};
var MAP=[['门','門'],['关','關'],['开','開'],['东','東'],['车','車'],['马','馬'],['鱼','魚'],['鸟','鳥'],['龙','龍'],['龟','龜'],['万','萬'],['与','與'],['专','專'],['业','業'],['个','個'],['为','為'],['义','義'],['乐','樂'],['书','書'],['买','買'],['乱','亂'],['争','爭'],['于','於'],['云','雲'],['从','從'],['众','眾'],['传','傳'],['伟','偉'],['伤','傷'],['体','體'],['余','餘'],['佣','傭'],['侠','俠'],['信','信'],['修','修'],['仓','倉'],['们','們'],['价','價'],['伦','倫'],['会','會'],['伞','傘'],['伟','偉'],['传','傳'],['伤','傷'],['伦','倫'],['伪','偽'],['体','體'],['余','餘'],['佣','傭'],['侠','俠'],['侣','侶'],['俭','儉'],['借','藉'],['设','設']];
MAP.forEach(function(p){S2T[p[0]]=p[1];T2S[p[1]]=p[0]})
function toSimp(){var s=document.getElementById('input').value;var r='';for(var i=0;i<s.length;i++)r+=T2S[s[i]]||s[i];document.getElementById('output').value=r}
function toTrad(){var s=document.getElementById('input').value;var r='';for(var i=0;i<s.length;i++)r+=S2T[s[i]]||s[i];document.getElementById('output').value=r}
</script>''')

add("full-half-width.html", "全角半角转换", "全角↔半角",
'''<div style="margin-bottom:8px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="toHalf()">全角→半角</button>
<button class="btn btn-outline" onclick="toFull()">半角→全角</button>
</div>
<textarea id="input" style="width:100%;min-height:100px;font-size:14px" placeholder="输入文本"></textarea>
<textarea id="output" style="width:100%;min-height:100px;font-size:14px;margin-top:8px" readonly></textarea>
<script>
function toHalf(){var s=document.getElementById('input').value;var r='';for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c===0x3000)r+=' ';else if(c>=0xFF01&&c<=0xFF5E)r+=String.fromCharCode(c-0xFEE0);else r+=s[i]}document.getElementById('output').value=r}
function toFull(){var s=document.getElementById('input').value;var r='';for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c===0x20)r+=String.fromCharCode(0x3000);else if(c>=0x21&&c<=0x7E)r+=String.fromCharCode(c+0xFEE0);else r+=s[i]}document.getElementById('output').value=r}
</script>''')

add("sup-sub.html", "上标/下标生成器", "上标下标文字",
'''<div style="margin-bottom:8px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="toSup()">转上标</button>
<button class="btn btn-outline" onclick="toSub()">转下标</button>
</div>
<textarea id="input" style="width:100%;min-height:80px;font-size:14px" placeholder="输入文字/数字"></textarea>
<textarea id="output" style="width:100%;min-height:80px;font-size:14px;margin-top:8px" readonly></textarea>
<script>
var SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ','A':'ᴬ','B':'ᴮ','C':'ᶜ','D':'ᴰ','E':'ᴱ','F':'ᶠ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ','L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','R':'ᴿ','S':'ˢ','T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ'}
var SUB={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','a':'ₐ','e':'ₑ','h':'ₕ','i':'ᵢ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','x':'ₓ'}
function toSup(){var s=document.getElementById('input').value;var r='';for(var i=0;i<s.length;i++)r+=SUP[s[i]]||s[i];document.getElementById('output').value=r}
function toSub(){var s=document.getElementById('input').value;var r='';for(var i=0;i<s.length;i++)r+=SUB[s[i]]||s[i];document.getElementById('output').value=r}
</script>''')

add("name-generator.html", "姓名生成器", "随机中文姓名",
'''<div class="row"><div><label>性别</label><select id="gender"><option value="all">不限</option><option value="male">男</option><option value="female">女</option></select></div>
<div><label>数量</label><input type="number" id="count" value="10" min="1" max="100"></div></div>
<button class="btn btn-primary" onclick="genName()">生成</button>
<textarea id="out" style="width:100%;min-height:150px;font-size:14px;margin-top:12px" readonly></textarea>
<script>
var SURNAMES=['赵','钱','孙','李','周','吴','郑','王','冯','陈','褚','卫','蒋','沈','韩','杨','朱','秦','尤','许','何','吕','施','张','孔','曹','严','华','金','魏','陶','姜','戚','谢','邹','喻','柏','水','窦','章','云','苏','潘','葛','奚','范','彭','鲁','韦','昌','马','苗','凤','花','方','俞','任','袁','柳','酆','鲍','史','唐','费','廉','岑','薛','雷','贺','倪','汤','滕','殷','罗','毕','郝','邬','安','常','乐','于','时','傅','皮','卞','齐','康','伍','余','元','卜','顾','孟','平','黄','萧','程','嵇','邢','滑','裴','陆','荣','翁','荀','羊','於','惠','甄','曲','家','封','芮','羿','储','靳','汲','邴','糜','松','井','段','富','巫','乌','焦','巴','弓','牧','隗','山','谷','车','侯','宓','蓬','全','郗','班','仰','秋','仲','伊','宫','宁','仇','栾','暴','甘','钭','历','戎','祖','武','符','刘','景','詹','束','龙','叶','幸','司','韶','郜','黎','蓟','薄','印','宿','白','怀','蒲','邰','从','鄂','索','咸','籍','赖','卓','蔺','屠','蒙','池','乔','阴','郁','胥','能','苍','双','闻','莘','党','翟','谭','贡','劳','逄','姬','申','扶','堵','冉','宰','郦','雍','郤','璩','桑','桂','濮','牛','寿','通','边','扈','燕','冀','郏','浦','尚','农','温','别','庄','晏','柴','瞿','阎','充','慕','连','茹','习','宦','艾','鱼','容','向','古','易','慎','戈','廖','庾','终','暨','居','衡','步','都','耿','满','弘','匡','国','文','寇','广','禄','阙','东','殴','殳','沃','利','蔚','越','夔','隆','师','巩','厍','聂','晁','勾','敖','融','冷','訾','辛','阚','那','简','饶','空','曾','母','沙','乜','养','鞠','须','丰','巢','关','蒯','相','查','后','荆','红','游','竺','权','逑','桓'];
var MALE=['伟','强','磊','勇','军','杰','涛','斌','超','鹏','飞','宇','浩','洋','海','龙','华','明','志','文','旭','建','国','平','峰','辉','波','成','康','健','荣','富','贵','刚','毅','威','武','豪','杰'];
var FEMALE=['芳','娟','敏','静','丽','艳','萍','玲','芬','红','玉','香','霞','莉','英','华','兰','梅','雪','春','慧','洁','婷','佳','琳','瑶','璐','莹','倩','燕','丹','娜','萌','琪','瑶','蕊','薇','馨'];
function genName(){var g=document.getElementById('gender').value;var n=parseInt(document.getElementById('count').value)||10;var r=[];for(var i=0;i<n;i++){var sur=SURNAMES[Math.floor(Math.random()*SURNAMES.length)];var pool;if(g==='male')pool=MALE;else if(g==='female')pool=FEMALE;else pool=Math.random()<0.5?MALE:FEMALE;var given=pool[Math.floor(Math.random()*pool.length)];if(Math.random()<0.3)given+=pool[Math.floor(Math.random()*pool.length)];r.push(sur+given)}document.getElementById('out').value=r.join('\\n')}
</script>''')

add("camel-hump.html", "驼峰下划线互转", "camelCase ↔ snake_case",
'''<div class="row"><div><label>输入</label><input type="text" id="chInput" placeholder="helloWorld or hello_world"></div></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
<button class="btn btn-primary" onclick="toCamel()">转驼峰</button>
<button class="btn btn-outline" onclick="toSnake()">转下划线</button>
<button class="btn btn-outline" onclick="toKebab()">转连字符</button>
<button class="btn btn-outline" onclick="toPascal()">转帕斯卡</button>
</div>
<textarea id="chOut" style="width:100%;min-height:40px;font-size:14px" readonly></textarea>
<script>
function toCamel(){var s=document.getElementById('chInput').value;document.getElementById('chOut').value=s.replace(/[-_](.)/g,function(_,c){return c.toUpperCase()})}
function toSnake(){var s=document.getElementById('chInput').value;document.getElementById('chOut').value=s.replace(/([A-Z])/g,'_$1').toLowerCase().replace(/^_/,'').replace(/[-]/g,'_')}
function toKebab(){var s=document.getElementById('chInput').value;document.getElementById('chOut').value=s.replace(/([A-Z])/g,'-$1').toLowerCase().replace(/^-/,'').replace(/[_]/g,'-')}
function toPascal(){var s=document.getElementById('chInput').value;document.getElementById('chOut').value=s.replace(/(^|[-_])(.)/g,function(_,a,b){return b.toUpperCase()})}
</script>''')

add("vertical-text.html", "文字竖排", "文字竖排显示",
'''<textarea id="input" style="width:100%;min-height:80px;font-size:14px" placeholder="输入要竖排的文字"></textarea>
<button class="btn btn-primary" onclick="doVertical()" style="margin:8px 0">生成竖排</button>
<div id="vtOut" style="padding:16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);writing-mode:vertical-rl;font-size:20px;letter-spacing:4px;min-height:200px;text-orientation:mixed"></div>
<script>
function doVertical(){document.getElementById('vtOut').textContent=document.getElementById('input').value||'请输入文字'}
</script>''')

add("extract-email.html", "提取邮箱", "从文本提取邮箱",
'''<textarea id="input" style="width:100%;min-height:100px;font-size:14px" placeholder="粘贴包含邮箱的文本"></textarea>
<button class="btn btn-primary" onclick="extract()" style="margin:8px 0">提取</button>
<textarea id="output" style="width:100%;min-height:100px;font-size:14px" readonly></textarea>
<script>
function extract(){var t=document.getElementById('input').value;var m=t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)||[];document.getElementById('output').value=m.join('\\n')}
</script>''')

add("extract-phone.html", "提取手机号", "从文本提取手机号",
'''<textarea id="input" style="width:100%;min-height:100px;font-size:14px" placeholder="粘贴包含手机号的文本"></textarea>
<button class="btn btn-primary" onclick="extract()" style="margin:8px 0">提取</button>
<textarea id="output" style="width:100%;min-height:100px;font-size:14px" readonly></textarea>
<script>
function extract(){var t=document.getElementById('input').value;var m=t.match(/1[3-9]\d{9}/g)||[];document.getElementById('output').value=m.join('\\n')}
</script>''')

add("extract-url.html", "提取链接", "从文本提取URL",
'''<textarea id="input" style="width:100%;min-height:100px;font-size:14px" placeholder="粘贴包含链接的文本"></textarea>
<button class="btn btn-primary" onclick="extract()" style="margin:8px 0">提取</button>
<textarea id="output" style="width:100%;min-height:100px;font-size:14px" readonly></textarea>
<script>
function extract(){var t=document.getElementById('input').value;var m=t.match(/https?:\/\/[^\s<>"']+/g)||[];document.getElementById('output').value=m.join('\\n')}
</script>''')

add("add-line-numbers.html", "文本添加序号", "每行添加序号",
'''<div style="margin-bottom:8px;display:flex;gap:8px;align-items:center">
<button class="btn btn-primary" onclick="addNum()">添加序号</button>
<label style="font-size:13px;color:var(--text-secondary)">起始: <input type="number" id="lnStart" value="1" style="width:60px;padding:4px 8px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text)"></label>
</div>
<textarea id="input" style="width:100%;min-height:120px;font-size:13px;font-family:monospace" placeholder="每行一条"></textarea>
<textarea id="output" style="width:100%;min-height:120px;font-size:13px;font-family:monospace;margin-top:8px" readonly></textarea>
<script>
function addNum(){var n=parseInt(document.getElementById('lnStart').value)||1;var l=document.getElementById('input').value.split('\\n');var r=[];for(var i=0;i<l.length;i++)r.push((n+i)+'. '+l[i]);document.getElementById('output').value=r.join('\\n')}
</script>''')

add("text-generator.html", "文本规则生成器", "按规则生成文本",
'''<div class="row"><div><label>文本</label><input type="text" id="tgText" placeholder="重复的文本"></div>
<div><label>次数</label><input type="number" id="tgCount" value="5" min="1" max="1000"></div>
<div><label>分隔符</label><input type="text" id="tgSep" value="\n"></div></div>
<button class="btn btn-primary" onclick="genText()">生成</button>
<textarea id="tgOut" style="width:100%;min-height:100px;font-size:13px;font-family:monospace;margin-top:12px" readonly></textarea>
<script>
function genText(){var t=document.getElementById('tgText').value;var n=parseInt(document.getElementById('tgCount').value)||1;var s=document.getElementById('tgSep').value.replace('\\n','\\n');document.getElementById('tgOut').value=Array(n).fill(t).join(s)}
</script>''')

add("html-to-text.html", "HTML提取文字", "去除HTML标签",
'''<textarea id="input" style="width:100%;min-height:120px;font-family:monospace;font-size:13px" placeholder="&lt;p&gt;Hello&lt;/p&gt;"></textarea>
<button class="btn btn-primary" onclick="strip()" style="margin:8px 0">提取文字</button>
<textarea id="output" style="width:100%;min-height:120px;font-size:14px" readonly></textarea>
<script>
function strip(){var d=document.createElement('div');d.innerHTML=document.getElementById('input').value;document.getElementById('output').value=d.textContent||d.innerText||''}
</script>''')

add("martian.html", "火星文转换器", "普通↔火星文",
'''<div style="margin-bottom:8px;display:flex;gap:8px">
<button class="btn btn-primary" onclick="toMars()">转火星文</button>
</div>
<textarea id="input" style="width:100%;min-height:80px;font-size:14px" placeholder="输入文字"></textarea>
<textarea id="output" style="width:100%;min-height:80px;font-size:14px;margin-top:8px" readonly></textarea>
<script>
var MAP={'我':'ωǒ','你':'ｎǐ','他':'ｔā','她':'ｔā','的':'ｄｅ','了':'ｌｅ','是':'š','不':'８','人':'ｒéｎ','在':'ｚàｉ','有':'ｙǒｕ','这':'ｚｈè','那':'ｎà','大':'ｄà','小':'ｘｉǎｏ','上':'ｓｈàｎｇ','下':'ｘｉà','中':'ｚｈōｎｇ','国':'ｇｕó','中':'ｚｈōｎｇ','好':'ｈǎｏ','很':'ｈěｎ','吗':'ｍā','吧':'ｂā','么':'ｍｅ','什':'ｓｈéｎ','么':'ｍｅ','怎':'ｚěｎ','样':'ｙàｎｇ','一':'①','二':'②','三':'③','四':'④','五':'⑤','六':'⑥','七':'⑦','八':'⑧','九':'⑨','十':'⑩','的':'ｄ','和':'＆','与':'＆','也':'ｙě','就':'㊚','都':'㊥','要':'ｙàｏ','会':'ｈｕì','可':'ｋě','以':'ｙǐ','能':'ｎéｎｇ','去':'ɡō','来':'ｌáｉ','到':'ｄàｏ','说':'šｈｕō','看':'ｋàｎ','听':'ｔīｎ','吃':'ｃｈī','喝':'ｈē','走':'ｚǒｕ','跑':'ｐǎｏ','爱':'àｉ','想':'ｘｉǎｎｇ','知':'ｚｈī','道':'ｄàｏ','为':'ｗèｉ','什么':'šｍ','怎么':'ｚｍ','因为':'ｙīｎｗèｉ','所以':'ｓｕǒｙǐ','但是':'ｄàｎš','如果':'ｒúɡｕǒ'};
function toMars(){var s=document.getElementById('input').value;var r='';for(var i=0;i<s.length;i++)r+=MAP[s[i]]||s[i];document.getElementById('output').value=r}
</script>''')

add("pinyin.html", "汉字转拼音", "汉字→拼音",
'''<textarea id="input" style="width:100%;min-height:60px;font-size:14px" placeholder="输入汉字"></textarea>
<button class="btn btn-primary" onclick="toPy()" style="margin:8px 0">转拼音</button>
<textarea id="output" style="width:100%;min-height:60px;font-size:14px" readonly></textarea>
<script>
var PY={'我':'wǒ','你':'nǐ','他':'tā','她':'tā','的':'de','了':'le','是':'shì','不':'bù','人':'rén','在':'zài','有':'yǒu','这':'zhè','那':'nà','大':'dà','小':'xiǎo','上':'shàng','下':'xià','中':'zhōng','国':'guó','好':'hǎo','很':'hěn','吗':'ma','吧':'ba','么':'me','什':'shén','么':'me','怎':'zěn','样':'yàng','一':'yī','二':'èr','三':'sān','四':'sì','五':'wǔ','六':'liù','七':'qī','八':'bā','九':'jiǔ','十':'shí','百':'bǎi','千':'qiān','万':'wàn','亿':'yì','和':'hé','与':'yǔ','也':'yě','就':'jiù','都':'dōu','要':'yào','会':'huì','可':'kě','以':'yǐ','能':'néng','去':'qù','来':'lái','到':'dào','说':'shuō','话':'huà','看':'kàn','见':'jiàn','听':'tīng','吃':'chī','喝':'hē','走':'zǒu','跑':'pǎo','爱':'ài','想':'xiǎng','知':'zhī','道':'dào','为':'wèi','因':'yīn','为':'wèi','所':'suǒ','以':'yǐ','但':'dàn','是':'shì','如':'rú','果':'guǒ','天':'tiān','地':'dì','日':'rì','月':'yuè','星':'xīng','春':'chūn','夏':'xià','秋':'qiū','冬':'dōng','风':'fēng','雨':'yǔ','雪':'xuě','山':'shān','水':'shuǐ','火':'huǒ','花':'huā','草':'cǎo','木':'mù','金':'jīn','土':'tǔ','石':'shí','云':'yún','海':'hǎi','湖':'hú','河':'hé','江':'jiāng','城':'chéng','市':'shì','门':'mén','开':'kāi','关':'guān','出':'chū','入':'rù','前':'qián','后':'hòu','左':'zuǒ','右':'yòu','东':'dōng','南':'nán','西':'xī','北':'běi','里':'lǐ','外':'wài','年':'nián','月':'yuè','日':'rì','时':'shí','分':'fēn','秒':'miǎo','今':'jīn','天':'tiān','明':'míng','天':'tiān','昨':'zuó','天':'tiān','早':'zǎo','上':'shàng','中':'zhōng','午':'wǔ','晚':'wǎn','上':'shàng','新':'xīn','旧':'jiù','老':'lǎo','少':'shào','多':'duō','少':'shǎo','长':'cháng','短':'duǎn','高':'gāo','低':'dī','远':'yuǎn','近':'jìn','快':'kuài','慢':'màn','轻':'qīng','重':'zhòng','真':'zhēn','假':'jiǎ','对':'duì','错':'cuò','好':'hǎo','坏':'huài','美':'měi','丑':'chǒu','善':'shàn','恶':'è','喜':'xǐ','怒':'nù','哀':'āi','乐':'lè','欢':'huān','笑':'xiào','哭':'kū','歌':'gē','舞':'wǔ','诗':'shī','词':'cí','书':'shū','画':'huà','文':'wén','字':'zì','学':'xué','习':'xí','问':'wèn','题':'tí','答':'dá','案':'àn'};
function toPy(){var s=document.getElementById('input').value;var r=[];for(var i=0;i<s.length;i++)r.push(PY[s[i]]||s[i]);document.getElementById('output').value=r.join(' ')}</script>''')

# ========== GROUP 5: Image Tools (simpler ones) ==========

add("image-grid.html", "九宫格切图", "图片网格切割",
'''<input type="file" id="fileInput" accept="image/*" onchange="loadImg()" style="margin-bottom:12px">
<div id="gridWrap" style="text-align:center"></div>
<div id="gridOut" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:12px;justify-content:center"></div>
<script>
function loadImg(){var f=document.getElementById('fileInput').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var img=new Image();img.onload=function(){split(img)};img.src=e.target.result};r.readAsDataURL(f)}
function split(img){var c=document.createElement('canvas');var rows=3,cols=3;var w=img.width/cols;var h=img.height/rows;c.width=w;c.height=h;var ctx=c.getContext('2d');var out=document.getElementById('gridOut');out.innerHTML='';document.getElementById('gridWrap').innerHTML='<p style="color:var(--text-secondary);margin-bottom:8px">'+cols+'×'+rows+' = '+(rows*cols)+' 格</p>';for(var r=0;r<rows;r++){for(var c2=0;c2<cols;c2++){ctx.clearRect(0,0,w,h);ctx.drawImage(img,-c2*w,-r*h);var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='piece_'+(r*cols+c2+1)+'.png';a.innerHTML='<img src="'+c.toDataURL('image/png')+'" style="width:80px;height:80px;object-fit:cover;border-radius:4px;border:1px solid var(--border)">';a.target='_blank';out.appendChild(a)}}}
</script>''')

add("image-filter.html", "图片滤镜", "CSS滤镜效果",
'''<input type="file" id="fiFile" accept="image/*" onchange="loadFi()" style="margin-bottom:12px">
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
<button class="btn btn-primary" onclick="applyFi('none')">原图</button>
<button class="btn btn-outline" onclick="applyFi('grayscale(100%)')">灰度</button>
<button class="btn btn-outline" onclick="applyFi('sepia(100%)')">复古</button>
<button class="btn btn-outline" onclick="applyFi('hue-rotate(90deg)')">色调</button>
<button class="btn btn-outline" onclick="applyFi('invert(100%)')">反色</button>
<button class="btn btn-outline" onclick="applyFi('blur(5px)')">模糊</button>
<button class="btn btn-outline" onclick="applyFi('brightness(150%)')">明亮</button>
<button class="btn btn-outline" onclick="applyFi('contrast(200%)')">高对比</button>
</div>
<div id="fiWrap" style="text-align:center"><p style="color:var(--text-secondary);padding:40px">先上传图片</p></div>
<script>
var fiImg=null;
function loadFi(){var f=document.getElementById('fiFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){fiImg='<img src="'+e.target.result+'" style="max-width:100%;max-height:400px;border-radius:8px;transition:filter .3s">';document.getElementById('fiWrap').innerHTML=fiImg};r.readAsDataURL(f)}
function applyFi(f){if(!fiImg)return;document.getElementById('fiWrap').innerHTML=fiImg;document.getElementById('fiWrap').querySelector('img').style.filter=f}
</script>''')

add("image-color.html", "图片颜色分析", "主色分析",
'''<input type="file" id="icFile" accept="image/*" onchange="analyze()" style="margin-bottom:12px">
<div id="icResult" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;min-height:100px;align-items:center;color:var(--text-secondary)">上传图片分析主色</div>
<script>
function analyze(){var f=document.getElementById('icFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var img=new Image();img.onload=function(){var c=document.createElement('canvas');c.width=100;c.height=100;var ctx=c.getContext('2d');ctx.drawImage(img,0,0,100,100);var d=ctx.getImageData(0,0,100,100).data;var colors={};for(var i=0;i<d.length;i+=16){var key=d[i]+','+d[i+1]+','+d[i+2];colors[key]=(colors[key]||0)+1}var sorted=Object.keys(colors).sort(function(a,b){return colors[b]-colors[a]}).slice(0,8);var html='';sorted.forEach(function(c){html+='<div style="text-align:center"><div style="width:50px;height:50px;border-radius:8px;background:rgb('+c+');border:1px solid var(--border);margin:0 auto"></div><div style="font-size:11px;margin-top:4px;color:var(--text-secondary)">rgb('+c+')</div></div>'});document.getElementById('icResult').innerHTML=html};img.src=e.target.result};r.readAsDataURL(f)}
</script>''')

add("image-exif.html", "图片EXIF读取", "EXIF信息",
'''<input type="file" id="exifFile" accept="image/*" onchange="readExif()" style="margin-bottom:12px">
<div id="exifOut" style="padding:16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:13px;line-height:1.8;min-height:60px"></div>
<script>
function readExif(){var f=document.getElementById('exifFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var img=new Image();img.onload=function(){document.getElementById('exifOut').innerHTML='<table style="width:100%"><tr><td style="padding:4px 12px;color:var(--text-secondary)">文件名</td><td>'+f.name+'</td></tr><tr><td style="padding:4px 12px;color:var(--text-secondary)">大小</td><td>'+(f.size/1024).toFixed(1)+'KB</td></tr><tr><td style="padding:4px 12px;color:var(--text-secondary)">类型</td><td>'+f.type+'</td></tr><tr><td style="padding:4px 12px;color:var(--text-secondary)">尺寸</td><td>'+img.naturalWidth+'×'+img.naturalHeight+'</td></tr></table>'};img.src=e.target.result};r.readAsDataURL(f)}
</script>''')

add("image-adjust.html", "图片调整", "亮度/对比度/饱和度",
'''<input type="file" id="adjFile" accept="image/*" onchange="loadAdj()" style="margin-bottom:12px">
<div class="row">
<div><label>亮度</label><input type="range" id="brightness" min="0" max="200" value="100" oninput="applyAdj()"></div>
<div><label>对比度</label><input type="range" id="contrast" min="0" max="200" value="100" oninput="applyAdj()"></div>
<div><label>饱和度</label><input type="range" id="saturate" min="0" max="200" value="100" oninput="applyAdj()"></div>
</div>
<div id="adjWrap" style="text-align:center"><p style="color:var(--text-secondary);padding:40px">上传图片</p></div>
<script>
var adjSrc='';
function loadAdj(){var f=document.getElementById('adjFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){adjSrc=e.target.result;applyAdj()};r.readAsDataURL(f)}
function applyAdj(){if(!adjSrc)return;var b=document.getElementById('brightness').value+'%';var c=document.getElementById('contrast').value+'%';var s=document.getElementById('saturate').value+'%';document.getElementById('adjWrap').innerHTML='<img src="'+adjSrc+'" style="max-width:100%;max-height:400px;border-radius:8px;filter:brightness('+b+') contrast('+c+') saturate('+s+')">'}
</script>''')

add("image-rotate.html", "图片翻转旋转", "翻转/旋转图片",
'''<input type="file" id="rtFile" accept="image/*" onchange="loadRt()" style="margin-bottom:12px">
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
<button class="btn btn-primary" onclick="rot(90)">旋转90°</button>
<button class="btn btn-outline" onclick="rot(180)">旋转180°</button>
<button class="btn btn-outline" onclick="rot(-90)">旋转-90°</button>
<button class="btn btn-outline" onclick="flip('X')">水平翻转</button>
<button class="btn btn-outline" onclick="flip('Y')">垂直翻转</button>
<button class="btn btn-outline" onclick="downloadRt()">下载</button>
</div>
<canvas id="rtCanvas" style="max-width:100%;border-radius:8px;display:none"></canvas>
<div id="rtPlaceholder" style="text-align:center;padding:40px;color:var(--text-secondary)">上传图片</div>
<script>
var rtImg=null;var rtAngle=0;var rtScaleX=1,rtScaleY=1;
function loadRt(){var f=document.getElementById('rtFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var img=new Image();img.onload=function(){rtImg=img;rtAngle=0;rtScaleX=1;rtScaleY=1;drawRt()};img.src=e.target.result};r.readAsDataURL(f)}
function drawRt(){if(!rtImg)return;var c=document.getElementById('rtCanvas');var a=rtAngle%180!==0;c.width=a?rtImg.naturalHeight:rtImg.naturalWidth;c.height=a?rtImg.naturalWidth:rtImg.naturalHeight;var ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate(rtAngle*Math.PI/180);ctx.scale(rtScaleX,rtScaleY);ctx.drawImage(rtImg,-rtImg.naturalWidth/2,-rtImg.naturalHeight/2);c.style.display='block';document.getElementById('rtPlaceholder').style.display='none'}
function rot(a){rtAngle=(rtAngle+a)%360;drawRt()}
function flip(ax){if(ax==='X')rtScaleX*=-1;else rtScaleY*=-1;drawRt()}
function downloadRt(){var c=document.getElementById('rtCanvas');var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='rotated.png';a.click()}
</script>''')

add("image-resize.html", "图片缩放", "调整图片尺寸",
'''<input type="file" id="rsFile" accept="image/*" onchange="loadRs()" style="margin-bottom:12px">
<div class="row">
<div><label>宽度</label><input type="number" id="rsW" min="1"></div>
<div><label>高度</label><input type="number" id="rsH" min="1"></div></div>
<button class="btn btn-primary" onclick="resize()">缩放</button>
<button class="btn btn-outline" onclick="downloadRs()">下载</button>
<canvas id="rsCanvas" style="max-width:100%;border-radius:8px;margin-top:12px;display:none"></canvas>
<div id="rsPlaceholder" style="text-align:center;padding:40px;color:var(--text-secondary)">上传图片</div>
<script>
var rsImg=null;
function loadRs(){var f=document.getElementById('rsFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var img=new Image();img.onload=function(){rsImg=img;document.getElementById('rsW').value=img.naturalWidth;document.getElementById('rsH').value=img.naturalHeight};img.src=e.target.result};r.readAsDataURL(f)}
function resize(){if(!rsImg)return;var w=parseInt(document.getElementById('rsW').value)||rsImg.naturalWidth;var h=parseInt(document.getElementById('rsH').value)||rsImg.naturalHeight;var c=document.getElementById('rsCanvas');c.width=w;c.height=h;c.getContext('2d').drawImage(rsImg,0,0,w,h);c.style.display='block';document.getElementById('rsPlaceholder').style.display='none'}
function downloadRs(){var c=document.getElementById('rsCanvas');var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='resized.png';a.click()}
</script>''')

add("signature.html", "在线手写签名", "Canvas签名板",
'''<div style="text-align:center">
<canvas id="sigCanvas" width="600" height="250" style="border:2px solid var(--border);border-radius:12px;cursor:crossbar;background:#fff;width:100%;max-width:600px"></canvas>
<div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
<button class="btn btn-primary" onclick="downloadSig()">下载</button>
<button class="btn btn-outline" onclick="clearSig()">清除</button>
</div></div>
<script>
(function(){var c=document.getElementById('sigCanvas');var ctx=c.getContext('2d');ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.lineCap='round';var drawing=false;var lastX,lastY;c.addEventListener('mousedown',function(e){var r=c.getBoundingClientRect();lastX=(e.clientX-r.left)*c.width/r.width;lastY=(e.clientY-r.top)*c.height/r.height;drawing=true});c.addEventListener('mousemove',function(e){if(!drawing)return;var r=c.getBoundingClientRect();var x=(e.clientX-r.left)*c.width/r.width;var y=(e.clientY-r.top)*c.height/r.height;ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(x,y);ctx.stroke();lastX=x;lastY=y});c.addEventListener('mouseup',function(){drawing=false});c.addEventListener('mouseleave',function(){drawing=false})})()
function downloadSig(){document.getElementById('sigCanvas').toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='signature.png';a.click()})}
function clearSig(){var c=document.getElementById('sigCanvas');c.getContext('2d').clearRect(0,0,c.width,c.height)}
</script>''')

add("online-whiteboard.html", "在线白板", "Canvas画板",
'''<div style="margin-bottom:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
<input type="color" id="wbColor" value="#9D7CD8">
<input type="range" id="wbSize" min="1" max="20" value="3" style="width:80px">
<button class="btn btn-primary" onclick="clearWB()">清除</button>
<button class="btn btn-outline" onclick="downloadWB()">下载</button>
</div>
<canvas id="wbCanvas" width="800" height="400" style="width:100%;max-width:800px;height:400px;border:2px solid var(--border);border-radius:12px;cursor:crossbar;background:#fff;display:block;margin:0 auto"></canvas>
<script>
(function(){var c=document.getElementById('wbCanvas');var ctx=c.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';var drawing=false;var lx,ly;c.addEventListener('mousedown',function(e){var r=c.getBoundingClientRect();lx=(e.clientX-r.left)*c.width/r.width;ly=(e.clientY-r.top)*c.height/r.height;drawing=true});c.addEventListener('mousemove',function(e){if(!drawing)return;var r=c.getBoundingClientRect();var x=(e.clientX-r.left)*c.width/r.width;var y=(e.clientY-r.top)*c.height/r.height;ctx.strokeStyle=document.getElementById('wbColor').value;ctx.lineWidth=parseInt(document.getElementById('wbSize').value);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(x,y);ctx.stroke();lx=x;ly=y});c.addEventListener('mouseup',function(){drawing=false});c.addEventListener('mouseleave',function(){drawing=false})})()
function clearWB(){var c=document.getElementById('wbCanvas');c.getContext('2d').clearRect(0,0,c.width,c.height)}
function downloadWB(){document.getElementById('wbCanvas').toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='whiteboard.png';a.click()})}
</script>''')

add("seal-generator.html", "印章生成器", "圆形印章",
'''<div class="row"><div><label>公司/姓名</label><input type="text" id="sealName" value="水星引力m" style="font-size:16px"></div>
<div><label>底部文字</label><input type="text" id="sealBottom" value="在线工具"></div></div>
<button class="btn btn-primary" onclick="genSeal()">生成印章</button>
<canvas id="sealCanvas" width="300" height="300" style="margin-top:12px;display:block;margin:12px auto"></canvas>
<script>
function genSeal(){var c=document.getElementById('sealCanvas');var ctx=c.getContext('2d');c.width=300;c.height=300;ctx.clearRect(0,0,300,300);ctx.fillStyle='#fff';ctx.fillRect(0,0,300,300);ctx.strokeStyle='#c0392b';ctx.lineWidth=4;ctx.beginPath();ctx.arc(150,150,120,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(150,150,115,0,Math.PI*2);ctx.stroke();var name=document.getElementById('sealName').value;ctx.fillStyle='#c0392b';ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,150,140);ctx.font='16px sans-serif';ctx.fillText(document.getElementById('sealBottom').value||'★',150,230);ctx.beginPath();ctx.arc(150,150,2,0,Math.PI*2);ctx.fill()}
genSeal()
</script><button class="btn btn-outline" onclick="(function(){var a=document.createElement('a');a.href=document.getElementById('sealCanvas').toDataURL('image/png');a.download='seal.png';a.click()})()" style="margin-top:8px">下载印章</button>
''')

add("svg-placeholder.html", "SVG占位符", "生成占位图SVG",
'''<div class="row"><div><label>宽</label><input type="number" id="svW" value="400"></div>
<div><label>高</label><input type="number" id="svH" value="300"></div>
<div><label>文字</label><input type="text" id="svT" value="400×300"></div></div>
<button class="btn btn-primary" onclick="genSVG()">生成</button>
<div id="svOut" style="text-align:center;margin-top:12px"></div>
<script>
function genSVG(){var w=document.getElementById('svW').value||400;var h=document.getElementById('svH').value||300;var t=document.getElementById('svT').value||w+'×'+h;var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="16" fill="#94a3b8">'+t+'</text></svg>';document.getElementById('svOut').innerHTML=svg+'<br><textarea style="width:100%;margin-top:8px;font-family:monospace;font-size:12px;min-height:40px" readonly>'+svg.replace(/></g,'>\n<')+'</textarea>'}
</script>''')

add("barcode.html", "条形码生成器", "CODE128条形码",
'''<div class="row"><div><label>文本</label><input type="text" id="bcText" value="1234567890"></div></div>
<button class="btn btn-primary" onclick="genBC()">生成条形码</button>
<canvas id="bcCanvas" style="margin-top:12px;display:block;max-width:100%"></canvas>
<script>
function genBC(){var c=document.getElementById('bcCanvas');var ctx=c.getContext('2d');var t=document.getElementById('bcText').value||'1234567890';c.width=Math.max(t.length*20,200);c.height=80;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#000';var x=10;for(var i=0;i<t.length;i++){var code=t.charCodeAt(i);for(var b=0;b<8;b++){var bit=(code>>b)&1;ctx.fillStyle=bit?'#000':'#fff';ctx.fillRect(x,10,1,55);x++}}ctx.fillStyle='#000';ctx.font='12px monospace';ctx.textAlign='center';ctx.fillText(t,c.width/2,75)}
genBC()
</script>''')

add("webp-convert.html", "WEBP转换", "WEBP↔PNG/JPG",
'''<input type="file" id="wpFile" accept="image/*" onchange="convertWP()" style="margin-bottom:12px">
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
<button class="btn btn-primary" onclick="dl('image/png')">下载PNG</button>
<button class="btn btn-outline" onclick="dl('image/jpeg')">下载JPG</button>
<button class="btn btn-outline" onclick="dl('image/webp')">下载WEBP</button>
</div>
<div id="wpPreview" style="text-align:center;padding:20px;color:var(--text-secondary)">上传图片</div>
<script>
var wpSrc='';
function convertWP(){var f=document.getElementById('wpFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){wpSrc=e.target.result;document.getElementById('wpPreview').innerHTML='<img src="'+e.target.result+'" style="max-width:100%;max-height:300px;border-radius:8px">'};r.readAsDataURL(f)}
function dl(fmt){if(!wpSrc)return;var img=new Image();img.onload=function(){var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);c.toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='converted.'+fmt.split('/')[1];a.click()},fmt)};img.src=wpSrc}
</script>''')

add("favicon-generator.html", "Favicon生成", "生成favicon.ico",
'''<div class="row"><div><label>文字</label><input type="text" id="fvText" value="M" style="font-size:18px"></div>
<div><label>背景色</label><input type="color" id="fvBg" value="#9D7CD8"></div></div>
<button class="btn btn-primary" onclick="genFav()">生成</button>
<canvas id="fvCanvas" width="64" height="64" style="margin:12px auto;display:block;border-radius:8px;border:1px solid var(--border)"></canvas>
<script>
function genFav(){var c=document.getElementById('fvCanvas');var ctx=c.getContext('2d');ctx.clearRect(0,0,64,64);ctx.fillStyle=document.getElementById('fvBg').value;ctx.beginPath();ctx.roundRect(0,0,64,64,8);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(document.getElementById('fvText').value||'M',32,34)}
genFav()
</script>
<button class="btn btn-outline" onclick="(function(){document.getElementById('fvCanvas').toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='favicon.png';a.click()})})()">下载</button>
''')

add("image-mosaic.html", "图片打码", "图片马赛克/模糊",
'''<input type="file" id="msFile" accept="image/*" onchange="loadMs()" style="margin-bottom:12px">
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
<button class="btn btn-primary" onclick="applyMs('mosaic')">马赛克</button>
<button class="btn btn-outline" onclick="applyMs('blur')">模糊</button>
<button class="btn btn-outline" onclick="downloadMs()">下载</button>
</div>
<canvas id="msCanvas" style="max-width:100%;border-radius:8px;display:none"></canvas>
<div id="msPlaceholder" style="text-align:center;padding:40px;color:var(--text-secondary)">上传图片</div>
<script>
var msImg=null;
function loadMs(){var f=document.getElementById('msFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var img=new Image();img.onload=function(){msImg=img;var c=document.getElementById('msCanvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);c.style.display='block';document.getElementById('msPlaceholder').style.display='none'};img.src=e.target.result};r.readAsDataURL(f)}
function applyMs(t){if(!msImg)return;var c=document.getElementById('msCanvas');var ctx=c.getContext('2d');ctx.drawImage(msImg,0,0);if(t==='mosaic'){var size=10;var w=c.width;var h=c.height;for(var y=0;y<h;y+=size)for(var x=0;x<w;x+=size){var d=ctx.getImageData(x,y,size,size);var rd=d.data;ctx.fillStyle='rgb('+rd[0]+','+rd[1]+','+rd[2]+')';ctx.fillRect(x,y,size,size)}}else{ctx.filter='blur(15px)';ctx.drawImage(c,0,0);ctx.filter='none'}}
function downloadMs(){document.getElementById('msCanvas').toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='mosaic.png';a.click()})}
</script>''')

add("image-merge.html", "图片拼接", "多张图片垂直拼接",
'''<input type="file" id="mgFile" accept="image/*" multiple onchange="loadMg()" style="margin-bottom:8px">
<p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">选择多张图片（按住Ctrl多选）</p>
<button class="btn btn-primary" onclick="mergeMg()">垂直拼接</button>
<button class="btn btn-outline" onclick="downloadMg()">下载</button>
<canvas id="mgCanvas" style="max-width:100%;border-radius:8px;margin-top:12px;display:none"></canvas>
<div id="mgPlaceholder" style="text-align:center;padding:40px;color:var(--text-secondary)">上传多张图片</div>
<script>
var mgImgs=[];
function loadMg(){var files=document.getElementById('mgFile').files;mgImgs=[];for(var i=0;i<files.length;i++){var r=new FileReader();(function(f){r.onload=function(e){var img=new Image();img.onload=function(){mgImgs.push(img);if(mgImgs.length===files.length)document.getElementById('mgPlaceholder').innerHTML='<span style="color:var(--primary)">已加载 '+mgImgs.length+' 张图片</span>'};img.src=e.target.result};r.readAsDataURL(files[i])})(files[i])}}
function mergeMg(){if(mgImgs.length<2)return;var totalH=0;var maxW=0;mgImgs.forEach(function(img){totalH+=img.naturalHeight;maxW=Math.max(maxW,img.naturalWidth)});var c=document.getElementById('mgCanvas');c.width=maxW;c.height=totalH;var ctx=c.getContext('2d');var y=0;mgImgs.forEach(function(img){ctx.drawImage(img,0,y);y+=img.naturalHeight});c.style.display='block';document.getElementById('mgPlaceholder').style.display='none'}
function downloadMg(){document.getElementById('mgCanvas').toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='merged.png';a.click()})}
</script>''')

add("gif-decompose.html", "GIF分解", "GIF帧分解(仅静态)",
'''<p style="color:var(--text-secondary);font-size:13px">提示: 浏览器Canvas仅支持GIF首帧预览</p>
<input type="file" id="gfFile" accept="image/gif,image/*" onchange="loadGif()" style="margin-top:8px">
<div id="gfOut" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px"></div>
<script>
function loadGif(){var f=document.getElementById('gfFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var img=new Image();img.onload=function(){var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='frame1.png';var html='<div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px"><img src="'+c.toDataURL('image/png')+'" style="max-width:200px;border-radius:4px"><p style="margin:8px 0;font-size:12px;color:var(--text-secondary)">首帧截图</p><a href="'+c.toDataURL('image/png')+'" download="frame.png" style="color:var(--primary);font-size:12px">下载</a></div>';document.getElementById('gfOut').innerHTML=html};img.src=e.target.result};r.readAsDataURL(f)}
</script>''')

add("rounded-image.html", "透明圆角图片", "图片圆角处理",
'''<input type="file" id="rdFile" accept="image/*" onchange="loadRd()" style="margin-bottom:12px">
<div class="row"><div><label>圆角</label><input type="range" id="rdRadius" min="0" max="100" value="20" oninput="applyRd()"></div></div>
<canvas id="rdCanvas" style="max-width:100%;border-radius:8px;display:none"></canvas>
<div id="rdPlaceholder" style="text-align:center;padding:40px;color:var(--text-secondary)">上传图片</div>
<script>
var rdImg=null;
function loadRd(){var f=document.getElementById('rdFile').files[0];if(!f)return;var r=new FileReader();r.onload=function(e){var img=new Image();img.onload=function(){rdImg=img;applyRd()};img.src=e.target.result};r.readAsDataURL(f)}
function applyRd(){if(!rdImg)return;var r=parseInt(document.getElementById('rdRadius').value);var c=document.getElementById('rdCanvas');c.width=rdImg.naturalWidth;c.height=rdImg.naturalHeight;var ctx=c.getContext('2d');ctx.beginPath();ctx.roundRect(0,0,c.width,c.height,r/100*Math.min(c.width,c.height)/2);ctx.clip();ctx.drawImage(rdImg,0,0);c.style.display='block';document.getElementById('rdPlaceholder').style.display='none'}
</script>''')

# ========== Generate ==========

os.makedirs(OUT, exist_ok=True)
for fn, title, desc, body, css in TOOLS:
    content = tmpl(title, desc, body, css)
    path = os.path.join(OUT, fn)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✓ {fn}")

print(f"\n生成 {len(TOOLS)} 个工具页面")