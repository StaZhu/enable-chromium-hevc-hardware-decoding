# enable-chromium-hevc-hardware-decoding

一个教你编译 Chrome / Electron 使其支持 Windows / macOS 平台 HEVC 硬 / 软解功能的教程。


##### 简体中文 | [English](./README.md)

## 下载地址

#### 支持 HEVC 硬 + 软解的 Chromium
[点击下载](https://github.com/StaZhu/enable-chromium-hevc-hardware-decoding/releases)后，双击打开。

#### 支持 HEVC 硬解的 Chrome Canery
[点击下载](https://www.google.com/chrome/canary/)后，启动时传入 `--enable-features=PlatformHEVCDecoderSupport` 并双击打开 (版本号 >= 104.0.5084.0)。

#### 支持 HEVC 硬解的 Edge Canery (Mac版本)
[点击下载](https://www.microsoftedgeinsider.com/download/canary/)后，启动时传入 `--enable-features=PlatformHEVCDecoderSupport` 并双击打开 (版本号 >= 104.0.1293.0)。

## 支持硬解哪些Profile？

HEVC Main (最高支持 8192x8192 px)

HEVC Main 10 (最高支持 8192x8192 px)

HEVC Main Still Picture (仅 macOS，最高支持 8192x8192 px)

HEVC Rext (部分支持，细节见下表，最高支持 8192x8192 px)

|        GPU             | 8b 420 | 8b 422 | 8b 444 | 10b 420 | 10b 422 | 10b 444 | 12b 420 | 12b 422 | 12b 444 |
| :--------------------- | :----- | :----- | :----- | :------ | :------ | :------ | :------ | :------ | :------ |
|  Apple Silicon (macOS) |   ✅  |   ✅   |   ✅  |    ✅   |   ✅   |   ✅    |   ❌   |   ❌    |   ❌   |
| Intel ICL ~ TGLx (Win) |   ✅  |   ⭕   |   ⭕  |    ✅   |   ✅   |   ✅    |   ❌   |   ❌    |   ❌   |
|    Intel TGLx+ (Win)   |   ✅  |   ⭕   |   ⭕  |    ✅   |   ✅   |   ✅    |   ✅   |   ⭕    |   ⭕   |

✅：显卡+软件都支持
⭕：显卡支持，软件未实现
❌：显卡不支持

#### 注1：Intel CPU 的 Mac 支持软解 HEVC Rext，8 ~ 12b 非 444 的内容均可正常解码，444 也能解码但存在绿条纹问题。
#### 注2：Intel 10代及以后的 GPU 支持硬解 HEVC Rext，如果需要使用这部分能力，须确保 Chromium 版本号 >= 106.0.5210.0。有一些Profile并不是很常见因此暂时没有支持，如果你有支持他们的需要且确保显卡支持，可以在 `crbug.com` 提交issue。
#### 注3：尽管 NVIDIA GPU 支持 8 ~ 12b 非 422 HEVC Rext CUVIA 或 NVDEC 硬解码，但由于NVIDIA 没有给 D3D11 接口暴露这部分能力，因此 Chromium 以后也不会支持它们。

## 操作系统要求？

macOS Big Sur (11.0) 及以上

Windows 8 及以上

Android (已支持，暂未测试)

ChromeOS (已支持，暂未测试)

## 支持哪些 API？

目前支持 HTML Video Element，MSE，以及 Clearkey EME，不支持 WebRTC 和 HEVC 编码。

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

## HDR 支持？(与Edge / Safari的对比)

|                  | PQ (SDR Screen) | PQ (HDR Screen) | HLG (SDR Screen) | HLG (HDR Screen) |
| :--------------- | :------------- | :------------- | :-------------- | :-------------- |
|  Chromium 105 macOS  |     ✅ (EDR)     |        ✅        |      ✅ (EDR)      |        ✅         |
| Chromium 105 Windows |        ✅        |        ✅        |        ✅         |        ✅         |
|   Edge 102 Windows   |        ❌        |        部分支持        |        部分支持         |        ❌         |
|   Safari 15.3 macOS   |     ✅ (EDR)     |        ✅        |      ✅ (EDR)      |        ✅         |

## 杜比视界支持？
支持兼容HLG、PQ的杜比视界（Profile 4,7,8)，不支持 IPTPQc2 的杜比视界（Profile 5）以及杜比视界全景声（E-AC3）。

## 技术实现区别？(与Edge / Safari的对比)

#### Windows

Edge 使用 `VDAVideoDecoder` 调用 `MediaFoundation`（需要安装`HEVC视频扩展`插件）完成硬解，和系统自带的 `电影与电视` 用的解码器相同。

Chromium 使用 `D3D11VideoDecoder` 调用 `D3D11VA` （无需安装插件）完成硬解，和 `VLC` 等视频播放器用的解码器相同。

#### macOS

Safari 和 Chromium 二者均使用 `VideoToolbox` 解码器完成硬解。

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

Chrome 104 及以上版本 将集成 ChromeOS, Mac, Windows, Android 的 HEVC 硬解支持，默认关闭，并允许通过 `--enable-features=PlatformHEVCDecoderSupport` 启用，待未来版本稳定后会默认启用。（Chrome 只包含操作系统提供的解码器，功能为可选支持，不支持的GPU和操作系统将无法使用）

## 如何编译？

1. 请参考 [Chrome编译手册](https://www.chromium.org/developers/how-tos/get-the-code/) 配置环境并拉取 `main` 分支（硬解代码已合入）的代码。
2. (可选) 支持 HEVC 软解：切换到 `src/third_party/ffmpeg` 目录，执行 `git am /path/to/add-hevc-ffmpeg-decoder-parser.patch` 。
3. (可选) 支持 Main / Main10 以外的其他 HEVC Profile： 切换到 `src` 目录，执行 `git am /path/to/remove-main-main10-profile-limit.patch`。
4. (可选) 默认启用硬解：切换到 `src` 目录，执行 `git am /path/to/enable-hevc-hardware-decoding-by-default.patch`。
5. (可选) 集成 Widevine CDM，以支持 EME 加密视频 (例：Netflix) 播放：切换到 `src` 目录，执行 `cp -R /path/to/widevine/* third_party/widevine/cdm` (Windows 请执行: `xcopy /path/to/widevine third_party\widevine\cdm /E/H`)。
6. 假设你想编译 `Mac` + `x64` 架构（其他可选的架构有：`x86`, `arm64`, `arm`）+ 支持 CDM 的 Chromium，请执行 `gn gen out/Release64 --args="is_component_build = false is_official_build = true is_debug = false ffmpeg_branding = \"Chrome\" target_cpu = \"x64\" proprietary_codecs = true media_use_ffmpeg = true enable_widevine = true bundle_widevine_cdm = true enable_platform_hevc = true enable_hevc_parser_and_hw_decoder = true"`，如果想编译 `Windows`，请额外添加 `enable_media_foundation_widevine_cdm = true`，如果想编译 `Windows` 且目标架构为 `arm64`，请将 `bundle_widevine_cdm` 改为 `false`。
6. 执行 `autoninja -C out/Release64 chrome` 以开始编译。
7. 如果是 Mac，执行 `./out/Release64/Chromium.app/Contents/MacOS/Chromium --args --enable-features=PlatformHEVCDecoderSupport` 打开编译好的 Chromium 并开启 HEVC 硬解。
8. 如果是 Windows，在桌面创建一个快捷方式，并改为类似如下的路径： `C:\Users\Admin\Desktop\Chromium\chrome.exe --enable-features=PlatformHEVCDecoderSupport` 然后双击打开快捷方式，即可打开编译好的 Chromium 并开启 HEVC 硬解。

## 如何集成到 Electron 等基于 Chromium 的项目？

Electron >= v20.0.0-beta.9 (Chromium >= v104.0.5084.0) 已集成好 Mac, Windows 平台的 HEVC 硬解功能，在启动时执行 `app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport')` 即可启用硬解。若要集成软解，方法同上述 Chromium 教程相同。

Electron < v20.0.0-beta.9 版本，请点开 `追踪进度` 内的提交记录，自己手动 CV 大法集成，欢迎提交不同版本的 Patch PR到本项目。

## 更新历史

`2022-07-31` Windows 平台 Intel 显卡支持硬解 HEVC Rext Profile, 更新 Patch 到 `106.0.5211.0`

`2022-07-15` 更新 Electron v20.0.0-beta.9 及以上版本支持情况

`2022-06-21` 更新 Microsoft Edge (Mac) 测试 HEVC 功能的方法

`2022-06-18` 修复 HLG/PQ tone mapping 问题, 更新 Patch 到 `105.0.5127.0`

`2022-06-17` 去除 Linux 支持，更新其他平台与 HDR 功能支持情况

`2022-05-26` 更新 Chrome Canary 测试 HEVC 功能的方法

`2022-05-25` 更新 Chrome 104 支持情况，以及 Electron 20 开启方法

`2022-05-24` 更新 Patch 到 `104.0.5080.1`

`2022-05-23` 添加 CDM 编译步骤，更新 Patch 到 `104.0.5077.1`

`2022-05-17` 更新实现细节和 Electron 集成指南

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
