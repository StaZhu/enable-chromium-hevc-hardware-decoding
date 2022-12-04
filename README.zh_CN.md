# enable-chromium-hevc-hardware-decoding

一个教你为 Chrome / Edge 启用 HEVC 硬解码 & 硬编码，或编译 Chromium / Electron 使其支持 HEVC 硬、软解码 & 硬编码功能的教程。

##### 简体中文 | [English](./README.md)

## 启动方式

#### Chrome & Edge (Mac) & Chromium

确保版本号 >= 107, 双击打开。

## 支持硬解码哪些Profile？

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

#### 注1：Intel CPU 的 Mac 支持 VideoToolbox 软解 HEVC Rext，8 ~ 12b 400, 420, 422, 444 的内容均可正常解码。
#### 注2：Intel 10代及以后的 GPU 支持硬解 HEVC Rext，如果需要使用这部分能力，须确保 Chromium 版本号 >= 106.0.5210.0。有一些Profile并不是很常见因此暂时没有支持，如果你有支持他们的需要且确保显卡支持，可以在 `crbug.com` 提交issue。
#### 注3：尽管 NVIDIA GPU 支持 8 ~ 12b 非 422 HEVC Rext CUVIA 或 NVDEC 硬解码，但由于NVIDIA 没有给 D3D11 接口暴露这部分能力，因此 Chromium 以后也不会支持它们。

## 支持硬编码哪些Profile？

HEVC Main (仅 macOS & Windows, macOS 最高支持 4096x2304 px & 120 fps, Windows 最高支持 1920*1088 px & 30 fps)

#### 注1：Chrome Media Team 在 2022 年还没有计划在所有平台支持 HEVC 硬编码，因此只能通过 Chrome Switch（`--enable-features=PlatformHEVCEncoderSupport`）的方式测试使用，并需要确保 Chrome 版本号 >= `109.0.5397.0`。[测试页面](https://webrtc.internaut.com/wc/wcWorker2/)。

## 操作系统要求？

macOS Big Sur (11.0) 及以上

Windows 8 及以上

Android

Chrome OS (仅支持 VAAPI 接口支持的 GPU，比如：Intel 核显)

Linux (版本号须 >= `108.0.5354.0`, 仅支持 VAAPI 接口支持的 GPU，比如：Intel 核显)

## 支持哪些 API？

视频解码：支持 File, Media Source Extensions, WebCodec (8Bit >= `107.0.5272.0`, 10Bit + HEVC with Alpha >= `108.0.5343.0`), Clearkey Encrypted Media Extensions, 不支持 WebRTC。

视频编码：支持 WebCodec (目前仅支持 macOS 和 Windows，需要传启动参数：`--enable-features=PlatformHEVCEncoderSupport`, 并确保浏览器版本 >= `109.0.5397.0`)。

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
|  Chrome 108 macOS  |     ✅ (EDR)     |        ✅        |      ✅ (EDR)      |        ✅         |
| Chrome 108 Windows |        ✅        |        ✅        |        ✅         |        ✅         |
|   Edge 107 Windows   |        ❌        |        ✅        |        ✅         |        ✅         |
|   Safari 16.1 macOS   |     ✅ (EDR)     |        ✅        |      ✅ (EDR)      |        ✅         |

## 杜比视界支持？
支持兼容HLG、PQ的单层杜比视界（Profile 8.1, 8.2, 8.4, 尽管使用 API 查询 `dvh1.08.07` 时仍会返回"不支持")，不支持 IPTPQc2 的单层杜比视界（Profile 5），不支持双层杜比视界，不支持杜比视界全景声（E-AC3）。

## 如何验证特定 Profile, 分辨率的视频是否可以播放？

#### MediaCapabilities

```javascript
const mediaConfig = {
  /**
   * 这里写 `file` 或 `media-source` 都可以, 结果一致,
   * 不要写 `webrtc`, 因为目前 WebRTC 还不支持 HEVC
   */
  type: 'file',
  video: {
    /**
     * 视频的Profile
     * 
     * Main: `hev1.1.6.L93.B0`
     * Main 10: `hev1.2.4.L93.B0`
     * Main still-picture: `hvc1.3.E.L93.B0`
     * Range extensions: `hvc1.4.10.L93.B0`
     */
    contentType : 'video/mp4;codecs="hev1.1.6.L120.90"',
    /* 视频的宽度 */
    width: 1920,
    /* 视频的高度 */
    height: 1080,
    /* 随便写 */
    bitrate: 10000, 
    /* 随便写 */
    framerate: 30
  }
}

navigator.mediaCapabilities.decodingInfo(mediaConfig)
  .then(result => {
    /* 指定的 Profile + 宽高的视频是否可解码 */
    if (result.supported) {
      console.log('Video can play!');
    } else {
      console.log('Video can\'t play!');
    }
  });
```

#### MediaSource

```javascript
if (MediaSource.isTypeSupported('video/mp4;codecs="hev1.1.6.L120.90"')) {
  console.log('HEVC main profile is supported!');
}

if (MediaSource.isTypeSupported('video/mp4;codecs="hev1.2.4.L120.90"')) {
  console.log('HEVC main 10 profile is supported!');
}

if (MediaSource.isTypeSupported('video/mp4;codecs="hev1.3.E.L120.90"')) {
  console.log('HEVC main still-picture profile is supported!');
}

if (MediaSource.isTypeSupported('video/mp4;codecs="hev1.4.10.L120.90"')) {
  console.log('HEVC range extensions profile is supported!');
}
```

#### CanPlayType

```javascript
const video = document.createElement('video');

if (video.canPlayType('video/mp4;codecs="hev1.1.6.L120.90"') === 'probably') {
  console.log('HEVC main profile is supported!');
}

if (video.canPlayType('video/mp4;codecs="hev1.2.4.L120.90"') === 'probably') {
  console.log('HEVC main 10 profile is supported!');
}

if (video.canPlayType('video/mp4;codecs="hev1.3.E.L120.90"') === 'probably') {
  console.log('HEVC main still-picture profile is supported!');
}

if (video.canPlayType('video/mp4;codecs="hev1.4.10.L120.90"') === 'probably') {
  console.log('HEVC range extensions profile is supported!');
}
```

#### 注1：上述三种 API 均已经将 `--disable-gpu`, `--disable-accelerated-video-decode`，`gpu-workaround`，`设置-系统-使用硬件加速模式（如果可用）`，`操作系统版本号` 等影响因素考虑在内了，只要确保 Chrome 版本号 >= `107.0.5304.0`，且系统是 macOS 或 Windows，则可保证结果准确性。
#### 注2：相比 `MediaSource.isTypeSupported()` 或 `CanPlayType()`，更推荐使用 `MediaCapabilities`，`MediaCapabilities` 除了会将 `设置-系统-使用硬件加速模式（如果可用）` 等等上述影响因素加入考虑外，还会考虑 `视频分辨率` 是否支持，不同的 GPU 所支持的最高分辨率是不一样的，比如部分 AMD GPU 最高只支持到 4096 * 2048，一些老的 GPU 只能支持到 1080P。

## 技术实现区别？(与Edge / Safari的对比)

#### Windows

Edge 使用 `VDAVideoDecoder` 调用 `MediaFoundation`（需要安装`HEVC视频扩展`插件）完成硬解，和系统自带的 `电影与电视` 用的解码器相同。

Chromium 使用 `D3D11VideoDecoder` 调用 `D3D11VA` （无需安装插件）完成硬解，和 `VLC` 等视频播放器用的解码器相同。

#### macOS

Safari 和 Chromium 二者均使用 `VideoToolbox` 解码器完成硬解。

## 如何验证视频播放是否走硬解？

1. 打开 `chrome://gpu`, 搜索 `Video Acceleration Information`, 如果能看到 **Decode hevc main**  和 **Decode hevc main 10**  (macOS 还会显示 **Decode hevc main still-picture** 和 **Decode hevc range extensions**，Windows Intel Gen10+ iGPU 会显示 **Decode hevc range extensions**) 说明支持硬解（这里 macOS 是个例外，显示仅代表支持 VideoToolbox 解码，至于是否硬解取决于 GPU 支持情况)。
2. 打开 `chrome://media-internals` 并尝试播放一些 HEVC 视频 ([测试页面](https://lf3-cdn-tos.bytegoofy.com/obj/tcs-client/resources/video_demo_hevc.html))，如果最终使用的 Decoder 是 `VDAVideoDecoder` 或 `D3D11VideoDecoder` 或 `VaapiVideoDecoder` 说明走了硬解（这里 macOS 是个例外，macOS Big Sur 以上版本，在不支持的 GPU 上，VideoToolbox 会自动 fallback 到软解，性能相比 FFMPEG 软解更好，Decoder 同样为 `VDAVideoDecoder`）, 如果 Decoder 是 `FFMpegVideoDecoder` 说明走的是软解。
3. 如果是 Mac，请打开 `活动监视器`并搜索 `VTDecoderXPCService`, 如果播放时进程的 CPU 利用率大于0说明走了硬解（或软解)。
4. 如果是 Windows，请打开 `任务管理器` 并切换到 `性能` - `GPU` 面板，如果 `Video Decode`(Intel, Nvidia) 或 `Video Codec`(AMD) 的利用率大于0说明走了硬解。

## 为什么我的显卡支持，但仍无法使用硬解？

#### 操作系统版本过低

##### Windows

请确保操作系统版本大于等于 Windows 8，这是因为 Chromium 的 `D3D11VideoDecoder` 仅支持 Windows 8 以上系统。

##### macOS

请确保操作系统版本大于等于 Big Sur，这是因为`CMVideoFormatDescriptionCreateFromHEVCParameterSets` API，在 Big Sur 以下版本有兼容问题。

#### 显卡驱动版本有问题

部分显卡驱动版本有 BUG，导致被禁用使用`D3D11VideoDecoder`，因此若你确保 GPU 支持 HEVC 硬解，请先更新到最新版本显卡驱动再尝试。[参考](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

#### 特定硬件有问题

部分硬解有 BUG，导致被禁用 `D3D11VideoDecoder`，这种情况没什么办法解决，只能软解。[参考](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

## 如何编译？

1. 请参考 [Chrome编译手册](https://www.chromium.org/developers/how-tos/get-the-code/) 配置环境并拉取 `main` 分支（硬解代码已合入）的代码。
2. (可选) 支持 HEVC 软解：切换到 `src/third_party/ffmpeg` 目录，执行 `git am /path/to/add-hevc-ffmpeg-decoder-parser.patch` 。如果有冲突，也可尝试使用 `node /path/to/add-hevc-ffmpeg-decoder-parser.js` 直接修改代码（需要确保Node.js已安装再执行该命令）。
3. (可选) 支持 Main / Main10 以外的其他 HEVC Profile： 切换到 `src` 目录，执行 `git am /path/to/remove-main-main10-profile-limit.patch`。
4. (可选) 默认启用 Windows / macOS 的 HEVC 编码功能，切换到 `src` 目录，执行 `git am /path/to/enable-hevc-encoding-by-default.patch`.
5. (可选) 集成 Widevine CDM，以支持 EME 加密视频 (例：Netflix) 播放：切换到 `src` 目录，执行 `cp -R /path/to/widevine/* third_party/widevine/cdm` (Windows 请执行: `xcopy /path/to/widevine third_party\widevine\cdm /E/H`)。
6. 假设你想编译 `Mac` + `x64` 架构（其他可选的架构有：`x86`, `arm64`, `arm`）+ 支持 CDM 的 Chromium，请执行 `gn gen out/Release64 --args="is_component_build = false is_official_build = true is_debug = false ffmpeg_branding = \"Chrome\" target_cpu = \"x64\" proprietary_codecs = true media_use_ffmpeg = true enable_widevine = true bundle_widevine_cdm = true"`，如果想编译 `Windows`，请额外添加 `enable_media_foundation_widevine_cdm = true`。
7. 执行 `autoninja -C out/Release64 chrome` 以开始编译。
8. 双击打开 Chromium。

## 如何集成到 Electron 等基于 Chromium 的项目？

Electron >= v22.0.0 已集成好 macOS, Windows, 和 Linux (仅 VAAPI) 平台的 HEVC 硬解功能，且开箱即用。若要集成软解，方法同上述 Chromium 教程相同。

## 更新历史

`2022-12-03` 修复了 SEI 可能提取不完整的问题，支持了同时从比特流和封装容器提取 HDR Metadata (静态元数据）的能力。上述两点最终可解决了部分 HDR10 视频提取不到静态元数据的问题，并确保 HDR 效果效果最佳 (Chrome >= `110.0.5456.0`)

`2022-11-18` 修复当 D3D11VideoDecoder 被 GPU Workaround 禁用时, 检测 API 仍返回 ”支持“ 的 Bug (M110, M109)

`2022-11-03` macOS 平台 WebCodec 新增 HEVC 编码支持，Windows 平台 HDR -> SDR 情况显存占用降低了 50%，Windows 平台提升了 HDR Tone Mapping 的色彩准确度

`2022-10-28` Edge (Mac) >= 107 默认支持

`2022-10-25` Chrome >= 107 默认支持 + Windows平台 WebCodec 支持 HEVC 编码

`2022-10-11` 支持 Linux HEVC 硬解 (Chrome >= `108.0.5354.0`)

`2022-10-09` 带 Alpha 图层的 HEVC (仅 macOS) 支持 WebCodec 解码时保留 Alpha 图层

`2022-10-08` 支持 HDR10 Metadata 提取能力，支持 WebCodec >= 10bit

`2022-09-26` 新增软解自动 Patch 脚本

`2022-09-15` 修复了 Intel 11/12 代 iGPU 开启系统 HDR 模式下播放 HDR 视频导致崩溃的问题，提升了 MediaCapabilities API 返回值的准确性，更新 Patch 到 `107.0.5303.0`

`2022-09-14` Chrome Canary >= `107.0.5300.0` 已默认启用 HEVC 硬解，正式版将于 `2022-10-25` 推送

`2022-09-08` 提升了 API 的检测准确性 (Chrome >= `107.0.5288.0`), 更新了相应的检测方法

`2022-08-31` 支持 WebCodec API (仅 8bit), 支持带 Alpha 图层的 HEVC (仅 macOS)

`2022-08-06` 更新使用说明为 Edge (Mac) 104 正式版

`2022-08-02` 更新使用说明为 Chrome 104 正式版

`2022-08-01` 添加 Chrome / Edge 使用说明

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
