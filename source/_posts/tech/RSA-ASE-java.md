---
title: RSA + AES 接口加密原理与 Java 实践
date: 2026-05-11
tags:
  - Java
  - RSA
  - AES
  - 网络安全
  - 接口加密
categories:
  - tech
  - Java
---

# RSA + AES 接口加密原理与 Java 实践

在现代开放平台、支付系统、银行接口、SaaS 平台中：

```text
RSA + AES
```

已经成为最常见的一种接口安全方案。

很多人第一次接触接口加密时，会疑惑：

- 为什么不用 HTTPS 就好了？
- 为什么 RSA 和 AES 要一起使用？
- 为什么还需要签名？
- timestamp 和 nonce 又是干什么的？

本文就从原理到实现，完整梳理一次：

```text
RSA + AES 混合加密
```

的整体设计思路。

---

# 一、为什么使用 RSA + AES 加密？

很多人会认为：

```text
HTTPS 已经加密了，接口为什么还要再次加密？
```

实际上：

HTTPS 解决的是：

```text
客户端 与 服务器之间传输链路的安全
```

但接口安全不仅仅只是“传输安全”。

开放平台还需要：

 安全需求 | HTTPS | RSA + AES |
---|---|---|
 数据加密 | ✅ | ✅ |
 防止数据被篡改 | ❌ | ✅ |
 防止伪造请求 | ❌ | ✅ |
 防止重放攻击 | ❌ | ✅ |
 验证调用方身份 | ❌ | ✅ |

因此：

```text
HTTPS + RSA + AES + 签名
```

才是现代开放平台真正完整的安全方案。

---

# 二、RSA + AES 加密有什么好处？

## 1. 数据安全

业务数据会被 AES 加密：

```text
即使数据被截获，也无法直接查看内容
```

---

## 2. 身份认证

使用 RSA 私钥签名：

```text
只有真正持有私钥的人才能发起请求
```

---

## 3. 防止数据篡改

签名可以校验：

```text
请求数据是否被修改
```

哪怕只改一个字符：

```text
验签都会失败
```

---

## 4. 防止重放攻击

通过：

```text
timestamp + nonce
```

防止攻击者重复发送旧请求。

---

## 5. AES 性能高

AES 属于：

```text
对称加密
```

速度非常快。

适合：

```text
大批量业务数据加密
```

---

## 6. RSA 更安全

RSA 属于：

```text
非对称加密
```

适合：

- 密钥交换
- 数字签名

但不适合大数据量加密。

因此：

```text
RSA + AES
```

是目前最经典的组合方案。

---

# 三、整体加密流程

整体流程如下：

```text
客户端：
1. 生成随机 AES Key
2. AES 加密业务数据
3. RSA 加密 AES Key
4. 对参数进行签名
5. 发送请求

服务端：
1. 验签
2. RSA 解密 AES Key
3. AES 解密业务数据
4. 处理业务
```

---

# 四、为什么 RSA 不直接加密数据？

这是很多初学者最容易误解的问题。

RSA 虽然安全，但：

 问题 | 说明 |
---|---|
 加密速度慢 | 不适合大量数据 |
 有长度限制 | 无法加密超长内容 |
 CPU 消耗大 | 高并发性能差 |

例如：

```text
2048位 RSA
```

最多只能加密：

```text
约 190 字节
```

所以实际生产环境：

```text
RSA 只负责加密 AES Key
AES 负责加密真正业务数据
```

这就是：

```text
混合加密（Hybrid Encryption）
```

---

# 五、不同算法介绍

# 1. AES

AES 是：

```text
对称加密算法
```

特点：

 特性 | 说明 |
---|---|
 加密速度快 | 非常适合大数据 |
 安全性高 | 广泛应用 |
 加解密使用同一个密钥 | 对称加密 |

常见模式：

 模式 | 是否推荐 |
---|---|
 ECB | ❌ |
 CBC | ⚠️ |
 GCM | ✅ |

---

## 为什么推荐 AES-GCM？

推荐：

```text
AES/GCM/NoPadding
```

因为：

```text
GCM 自带完整性校验
```

相比 CBC 更安全。

---

# 2. RSA

RSA 是：

```text
非对称加密算法
```

特点：

 特性 | 说明 |
---|---|
 公钥加密 | 私钥解密 |
 私钥签名 | 公钥验签 |
 安全性高 | 适合身份认证 |
 加密速度慢 | 不适合大数据 |

RSA 通常用于：

- 数字签名
- 密钥交换
- 身份认证

---

# 3. SHA256withRSA

这是：

```text
数字签名算法
```

本质上：

```text
SHA256 摘要
+
RSA 签名
```

作用：

```text
保证数据完整性
```

---

# 六、完整请求结构

通常接口请求结构如下：

```json
{
  "encryptKey": "RSA加密后的AES Key",
  "data": "AES加密后的业务数据",
  "sign": "RSA签名",
  "timestamp": 1715060000,
  "nonce": "随机字符串"
}
```

---

# 七、签名流程

签名时：

```text
sign 字段本身不参与签名
```

签名步骤：

## 1. 参数排序

按照 ASCII 升序排序：

```text
appId=10001
data=xxx
encryptKey=xxx
nonce=xxx
timestamp=xxx
```

---

## 2. 拼接字符串

格式：

```text
key=value
```

多个参数：

```text
&
```

连接。

例如：

```text
appId=10001&data=xxx&encryptKey=xxx&nonce=abc&timestamp=1715060000
```

---

## 3. SHA256withRSA 签名

使用：

```text
客户端私钥
```

生成签名。

---

# 八、防重放攻击

仅仅签名还不够。

攻击者可能：

```text
重复发送之前的请求
```

因此需要：

```text
timestamp + nonce
```

---

# 1. timestamp

作用：

```text
限制请求有效时间
```

例如：

```text
5分钟内有效
```

---

# 2. nonce

作用：

```text
保证每次请求唯一
```

通常使用：

```java
UUID.randomUUID()
```

生成随机串。

服务端需要：

```text
Redis 去重
```

否则无法真正防重放。

---

# 九、Java 实现过程

# 1. 生成 AES Key

```java
KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");

keyGenerator.init(256);

SecretKey secretKey = keyGenerator.generateKey();

byte[] keyBytes = secretKey.getEncoded();
```

---

# 2. AES-GCM 加密

```java
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
```

推荐参数：

 参数 | 值 |
---|---|
 Key长度 | 256位 |
 Nonce长度 | 12字节 |
 Tag长度 | 128位 |

---

# 3. RSA 加密 AES Key

```java
Cipher cipher = Cipher.getInstance(
    "RSA/ECB/OAEPWithSHA-256AndMGF1Padding"
);
```

推荐：

```text
OAEP
```

不要再使用：

```text
PKCS1Padding
```

---

# 4. SHA256withRSA 签名

```java
Signature signature =
        Signature.getInstance("SHA256withRSA");
```

---

# 十、完整示例

假设业务数据：

```json
{
  "orderNo": "20260511001",
  "amount": 100
}
```

---

## 第一步：AES 加密业务数据

得到：

```text
data
```

---

## 第二步：RSA 加密 AES Key

得到：

```text
encryptKey
```

---

## 第三步：参数签名

签名原文：

```text
appId=10001&data=xxx&encryptKey=xxx&nonce=abc&timestamp=1715060000
```

生成：

```text
sign
```

---

## 最终请求

```json
{
  "encryptKey": "xxx",
  "data": "xxx",
  "sign": "xxx",
  "timestamp": 1715060000,
  "nonce": "abc"
}
```

---

# 十一、常见错误

# 1. timestamp 使用毫秒

错误：

```java
System.currentTimeMillis()
```

正确：

```java
System.currentTimeMillis() / 1000
```

---

# 2. sign 参与签名

错误：

```text
sign=xxx
```

也参与签名。

正确：

```text
sign 本身不参与签名
```

---

# 3. AES-GCM nonce 长度错误

推荐：

```text
12字节
```

---

# 4. RSA 模式错误

推荐：

```text
OAEPWithSHA-256AndMGF1Padding
```

不要使用：

```text
PKCS1Padding
```

---

# 十二、总结

RSA + AES 本质上是：

```text
安全性 + 性能
```

的一种平衡方案。

其中：

 算法 | 作用 |
---|---|
 AES | 数据加密 |
 RSA | 密钥交换 |
 SHA256withRSA | 数字签名 |
 timestamp | 防超时 |
 nonce | 防重放 |

这也是目前：

- 支付系统
- 银行接口
- 聚合支付
- SaaS 平台
- OpenAPI

最主流的一种安全通信方案。

---

# 十三、最后

以前总觉得：

```text
接口加密很高深
```

真正学习后会发现：

它其实就是：

```text
AES 负责加密数据
RSA 负责保护 AES Key
签名负责防篡改
timestamp + nonce 防重放
```

组合起来的一套完整安全体系。

理解这套流程之后：

后续学习：

- JWT
- OAuth2
- HTTPS 双向认证
- API 网关签名
- 国密 SM2 / SM4

都会轻松很多。
