# enable-chromium-hevc-hardware-decoding

一个教你编译 Chrome 使其支持 Windows / macOS / Linux 三个平台 HEVC 硬 / 软解功能的教程。


##### 简体中文 | [English](./README.md)

## 下载预编译版本？

[点击下载](https://github.com/StaZhu/enable-chromium-hevc-hardware-decoding/releases/tag/103.0.5045.0)

## 支持硬解哪些Profile？

HEVC Main (最高支持 8192x8192 px)

HEVC Main 10 (最高支持 8192x8192 px)

HEVC Main Still Picture (仅 macOS，最高支持 8192x8192 px)

HEVC Rext (仅 macOS，最高支持 8192x8192 px)

## 操作系统要求？

macOS Big Sur (11.0) 及以上

Windows 8 及以上

Linux + Vaapi (暂未测试)

## GPU要求？

#### 独显

NVIDIA GTX950 及以上

AMD RX460 及以上

#### 集显

Intel HD4400, HD515 及以上

AMD Radeon R7, Vega M 及以上

Apple M1, M1 Pro, M1 Max, M1 Ultra 及以上

#### 详细支持列表

[Intel](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/intel.html)

[AMD](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/amd.html)

[NVIDIA](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/nvidia.html)

## HDR 支持? (与Edge / Safari的对比) 

|                  | PQ (SDR Screen) | PQ (HDR Screen) | HLG (SDR Screen) | HLG (HDR Screen) |
| :--------------- | :------------- | :------------- | :-------------- | :-------------- |
|  Chromium macOS  |     ✅ (EDR)     |        ✅        |      ✅ (EDR)      |        ✅         |
| Chromium Windows |        ✅        |        ✅        |        ✅         |        ✅         |
|  Chromium Linux  |    暂未测试     |    暂未测试     |     暂未测试     |     暂未测试     |
|   Edge Windows   |        ❌        |        ✅        |        ✅         |        ❌         |
|   Safari macOS   |     ✅ (EDR)     |        ✅        |      ✅ (EDR)      |        ✅         |

## 如何验证视频播放是否走硬解？

1. 打开 `chrome://gpu`, 搜索 `Video Acceleration Information`, 如果能看到 **Decode hevc main**  和 **Decode hevc main 10**  (macOS 还会显示 **Decode hevc main still-picture** 和 **Decode hevc range extensions**) 说明支持硬解（这里 macOS 是个例外，显示仅代表支持 VideoToolbox 解码，至于是否硬解取决于 GPU 支持情况)。
2. 打开 `chrome://media-internals` 并尝试播放一些 HEVC 视频 ([测试页面](https://lf3-cdn-tos.bytegoofy.com/obj/tcs-client/resources/video_demo_hevc.html))，如果最终使用的 Decoder 是 `VDAVideoDecoder` 或 `D3D11VideoDecoder` 或 `VaapiVideoDecoder` 说明走了硬解（这里 macOS 是个例外，macOS Big Sur 以上版本，在不支持的 GPU 上，VideoToolbox 会自动 fallback 到软解，性能相比 FFMPEG 软解更好，Decoder 同样为 `VDAVideoDecoder`）, 如果 Decoder 是 `FFMpegVideoDecoder` 说明走的是软解。
3. 如果是 Mac，请打开 `活动监视器`并搜索 `VTDecoderXPCService`, 如果播放时进程的 CPU 利用率大于0说明走了硬解（或软解)。
4. 如果是 Windows，请打开 `任务管理器` 并切换到 `性能` - `GPU` 面板，如果 `Video Decoding` 的利用率大于0说明走了硬解。

## 为什么我的显卡支持，但仍无法使用硬解？

#### 操作系统版本过低

##### Windows

请确保操作系统版本大于等于 Windows 8，这是因为 Chromium 的 `D3D11VideoDecoder` 仅支持 Windows 8 以上系统，在 Windows 8 以下操作系统使用 `VDAVideoDecoder` 进行硬解。而 `VDAVideoDecoder` 基于 `Media Foundation` 实现，`Media Foundation ` 对于 HEVC 硬解的支持（需要安装 `HEVC视频扩展` 插件），系统版本需大于 Windows 10 1709。

##### macOS

请确保操作系统版本大于等于 Big Sur，这是因为`CMVideoFormatDescriptionCreateFromHEVCParameterSets` API，在 Big Sur 以下版本有兼容问题。

#### 显卡驱动版本有问题

部分显卡驱动版本有 BUG，导致被禁用使用`D3D11VideoDecoder`，因此若你确保 GPU 支持 HEVC 硬解，请先更新到最新版本显卡驱动再尝试。[参考](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

#### 特定硬件有问题

部分硬解有 BUG，导致被禁用 `D3D11VideoDecoder`，这种情况没什么办法解决，只能软解。[参考](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

## HEVC 支持将来是否会包含在 Chrome 内并默认启用？

很有可能，但会只包含操作系统提供的解码器，功能为可选支持，不支持的GPU和操作系统将无法使用。

## 如何编译？

1. 请参考 [Chrome编译手册](https://www.chromium.org/developers/how-tos/get-the-code/) 配置环境并拉取 `main` 分支的代码。
2. (可选) 支持 HEVC 软解：切换到 `src/third_party/ffmpeg` 目录，执行 `git am /path/to/add-hevc-ffmpeg-decoder-parser.patch` 。
3. (可选) 支持 Main / Main10 以外的其他 HEVC Profile： 切换到 `src` 目录，执行 `git am /path/to/remove-main-main10-profile-limit.patch`。
4. (可选) 默认启用硬解：切换到 `src` 目录，执行 `git am /path/to/enable-hevc-hardware-decoding-by-default.patch`。
5. (可选) 去除启动参数：切换到 `src` 目录，执行 `git am /path/to/remove-clear-testing-args-passing.patch`。
6. 假设你想编译 `x64` 架构的 Chromium，请执行 `gn gen out/Release64 --args="is_component_build = false is_official_build = true is_debug = false ffmpeg_branding = \"Chrome\" target_cpu = \"x64\" proprietary_codecs = true media_use_ffmpeg = true enable_platform_encrypted_hevc = true enable_platform_hevc = true enable_platform_hevc_decoding = true"`，其他可选的架构有： `x86` , `arm64` , `arm` 等。
7. 执行 `autoninja -C out/Release64 chrome` 以开始编译。
8. 如果是 Mac，执行 `./out/Release64/Chromium.app/Contents/MacOS/Chromium --args --enable-clear-hevc-for-testing --enable-features=PlatformHEVCDecoderSupport` 打开编译好的 Chromium 并开启 HEVC 硬解。
9. 如果是 Windows，在桌面创建一个快捷方式，并改为类似如下的路径： `C:\Users\Admin\Desktop\Chromium\chrome.exe --enable-clear-hevc-for-testing --enable-features=PlatformHEVCDecoderSupport` 然后双击打开快捷方式，即可打开编译好的 Chromium 并开启 HEVC 硬解。

## 更新历史

`2022-05-14` 更新 Patch 到 `104.0.5061.1`

`2022-05-13` 添加 HEVC 测试页面

`2022-05-10` 更新 README，明确硬解范围和支持型号

`2022-05-05` 为 macOS 添加了 MSP & Rext VideoToolbox 硬解支持，修复了 Windows 下部分 Main10 hdr, Rec.709 视频硬解失败的问题

`2022-04-27` 切换为 `git am` patch

`2022-04-24` 支持中文 README

`2022-04-21` 添加 Crbug 链接

`2022-04-20` 修改 README

`2022-04-19` 首次提交

## 追踪进度

##### [Windows](https://crbug.com/1286132)

##### [macOS](https://crbug.com/1300444)

## License

MIT
