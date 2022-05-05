# enable-chromium-hevc-hardware-decoding

一个教你编译 Chrome 使其支持 Windows / macOS / Linux 三个平台 HEVC 硬 / 软解功能的教程。


##### 简体中文 | [English](./README.md)

## 下载预编译版本？

[点击下载](https://github.com/StaZhu/enable-chromium-hevc-hardware-decoding/releases/tag/103.0.5045.0)

## 支持哪些Profile？

#### 硬解支持

1. HEVC Main (最高支持 8192x8192 px)
2. HEVC Main10 (最高支持 8192x8192 px)
3. HEVC Main Still Picture (仅macOS)
4. HEVC Rext (仅macOS)

#### 软解支持

所有FFMPEG支持的Profile软解都支持，比如：

1. HEVC Main Still Picture
2. HEVC Rext
3. HEVC SCC

## 操作系统要求？

#### 硬解要求

macOS 11.0+

Windows 8+

Linux + Vaapi (暂未测试)

#### 软解要求

所以操作系统版本。比如 Windows 7, macOS 10.12, 等等...

## HDR 支持? (与Edge/Safari的对比) 

[点击查看详细测试](https://juejin.cn/post/7089795059737952287/#heading-41)

|                  | PQ (SDR Screen) | PQ (HDR Screen) | HLG (SDR Screen) | HLG (HDR Screen) |
| :-------------- | :------------- | :------------- | :-------------- | :-------------- |
|  Chromium macOS  |     ✅ (EDR)     |        ✅        |      ✅ (EDR)      |        ✅         |
| Chromium Windows |        ✅        |        ✅        |        ✅         |        ✅         |
|  Chromium Linux  |    暂未测试     |    暂未测试     |     暂未测试     |     暂未测试     |
|   Edge Windows   |        ❌        |        ✅        |        ✅         |        ❌         |
|   Safari macOS   |     ✅ (EDR)     |        ✅        |      ✅ (EDR)      |        ✅         |

## 如何验证视频播放是否走硬解？

1. 打开 `chrome://gpu`, 搜索 `Video Acceleration Information`, 如果能看到 **Decode hevc main**  和 **Decode hevc main 10** 说明支持硬解。
2. 打开 `chrome://media-internals` 并尝试播放一些HEVC视频，如果最终使用的Decoder是 `VDAVideoDecoder` 或 `D3D11VideoDecoder` 或 `VaapiVideoDecoder` 说明走了硬解, 如果Decoder是 `FFMpegVideoDecoder` 说明走的是软解。
3. 如果是Mac，请打开 `活动监视器`并搜索 `VTDecoderXPCService`, 如果播放时进程的CPU利用率大于0说明走了硬解。
4. 如果是Windows，请打开 `任务管理器` 并切换到 `性能` -`GPU`面板，如果 `Video Decoding` 的利用率大于0说明走了硬解。

## 如何编译？

1. 请参考 [Chrome编译手册](https://www.chromium.org/developers/how-tos/get-the-code/) 配置环境并拉取`103.0.5044.1` tag的代码（更新的版本，比如 `main` 分支，在没有代码冲突的情况, 理论上也可以)。
2. (可选) 支持HEVC软解：切换到 `src/third_party/ffmpeg` 目录，执行 `git am /path/to/add-hevc-ffmpeg-decoder-parser.patch`。
3. (可选) 支持Main / Main10 以外的其他HEVC Profile： 切换到 `src` 目录，执行 `git am /path/to/remove-main-main10-profile-limit.patch`。
4. (可选) 默认启用硬解：切换到 `src` 目录，执行 `git am /path/to/enable-hevc-hardware-decoding-by-default.patch`。
5. (可选) 去除启动参数：切换到 `src` 目录，执行 `git am /path/to/remove-clear-testing-args-passing.patch`。
6. 假设你想编译 `x64` 架构的Chromium，请执行 `gn gen out/Release64 --args="is_component_build = false is_official_build = true is_debug = false ffmpeg_branding = \"Chrome\" target_cpu = \"x64\" proprietary_codecs = true media_use_ffmpeg = true enable_platform_encrypted_hevc = true enable_platform_hevc = true enable_platform_hevc_decoding = true"`，其他可选的架构有： `x86` , `arm64` , `arm` 等。
7. 执行 `autoninja -C out/Release64 chrome` 以开始编译。
8. 如果是Mac，执行 `./out/Release64/Chromium.app/Contents/MacOS/Chromium --args --enable-clear-hevc-for-testing --enable-features=VideoToolboxHEVCDecoding` 打开编译好的Chromium并开启HEVC硬解。
9. 如果是Windows，在桌面创建一个快捷方式，并改为类似如下的路径： `C:\Users\Admin\Desktop\Chromium\chrome.exe --enable-clear-hevc-for-testing --enable-features=D3D11HEVCDecoding` 然后双击打开快捷方式，即可打开编译好的Chromium并开启HEVC硬解。

## 更新历史

`2022-5-5` 为 macOS 添加了 MSP & Rext VideoToolbox 硬解支持，修复了 Windows 下部分 HDR, Main10 Rec709 视频硬解失败的问题

`2022-4-27` 切换为 `git am` patch

`2022-4-24` 支持中文

`2022-4-21` 添加Crbug链接

`2022-4-20` 修改ReadMe

`2022-4-19` 首次提交

## 追踪进度

##### [Windows](https://crbug.com/1286132)

##### [macOS](https://crbug.com/1300444)

## License

MIT
