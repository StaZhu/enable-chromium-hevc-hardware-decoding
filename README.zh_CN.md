# enable-chromium-hevc-hardware-decoding

一个教你为 Chrome / Edge 启用 HEVC 硬解码 & 硬编码，或编译 Chromium / Electron 使其支持 HEVC 硬、软解码 & 硬编码功能的教程。

##### 简体中文 | [English](./README.md)

## 启动方式

#### Chrome & Edge (Mac) & Chromium

确保版本号 >= 107, 双击打开。

## 支持硬解码哪些Profile？

HEVC Main (最高支持 8192x8192 px)

HEVC Main 10 (最高支持 8192x8192 px)

HEVC Main Still Picture (Windows 不支持，最高支持 8192x8192 px)

HEVC Rext (部分支持，细节见下表，最高支持 8192x8192 px)

|        GPU             | 8b 420 | 8b 422 | 8b 444 | 10b 420 | 10b 422 | 10b 444 | 12b 420 | 12b 422 | 12b 444 |
| :--------------------- | :----- | :----- | :----- | :------ | :------ | :------ | :------ | :------ | :------ |
|  Apple Silicon (macOS) |   ✅    |   ✅   |   ✅   |    ✅   |    ✅    |    ✅   |    ❌   |    ❌    |    ❌   |
| Intel ICL ~ TGLx (Win) |   ✅    |   ❌   |   ⭕   |    ✅   |    ✅    |    ✅   |    ❌   |    ❌    |    ❌   |
|    Intel TGLx+ (Win)   |   ✅    |   ❌   |   ⭕   |    ✅   |    ✅    |    ✅   |    ✅   |    ⭕    |    ⭕   |

✅：显卡+软件都支持
⭕：显卡支持，软件未实现
❌：显卡不支持

*注1：Intel CPU 的 Mac 支持 VideoToolbox 软解 HEVC Rext，8 ~ 12b 400, 420, 422, 444 的内容均可正常解码。*

*注2：Intel 10代及以后的 GPU 支持硬解 HEVC Rext，如果需要使用这部分能力，须确保 Chromium 版本号 >= 106.0.5210.0。有一些Profile并不是很常见因此暂时没有支持，如果你有支持他们的需要且确保显卡支持，可以在 `crbug.com` 提交issue。*

*注3：尽管 NVIDIA GPU 支持 8 ~ 12b 非 422 HEVC Rext CUVIA 或 NVDEC 硬解码，但由于NVIDIA 没有给 D3D11 接口暴露这部分能力，因此 Chromium 以后也不会支持它们。*

## 支持硬编码哪些Profile？

HEVC Main (仅 macOS & Windows, macOS 最高支持 4096x2304 px & 120 fps, Windows 最高支持 1920*1088 px & 30 fps)

*注1：Chrome Media Team 在 2022 年还没有计划在所有平台支持 HEVC 硬编码，因此只能通过 Chrome Switch（`--enable-features=PlatformHEVCEncoderSupport`）的方式测试使用，并需要确保 Chrome 版本号 >= `109.0.5397.0`。[测试页面](https://webrtc.internaut.com/wc/wcWorker2/)。*

## 操作系统要求？

macOS Big Sur (11.0) 及以上

Windows 8 及以上

Android 5.0 及以上

Chrome OS (仅支持 VAAPI 接口支持的 GPU，比如：Intel 核显)

Linux (版本号须 >= `108.0.5354.0`, 仅支持 VAAPI 接口支持的 GPU，比如：Intel 核显)

## 支持哪些 API？

视频解码：支持 File, Media Source Extensions, WebCodec (8Bit >= `107.0.5272.0`, 10Bit + HEVC with Alpha >= `108.0.5343.0`), Clearkey 以及 Widevine L1 (不支持L3) Encrypted Media Extensions, 不支持 WebRTC。

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

|                 |   PQ     |   HDR10  |  HDR10+  |   HLG    |  DV P5   |  DV P8.1  |  DV P8.4    |
| :-------------- | :------- | :------- | :------- | :------- |:-------- |:--------- |:----------- |
| Chrome 110 Mac  |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
| Chrome 110 Win  |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
|  Edge 110 Mac   |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
|  Edge 110 Win   |    ❌    |     ❌    |    ❌    |    ✅    |    ❌     |     ❌     |     ✅     |
| Safari 16.2 Mac |    ✅    |     ✅    |    ✅    |    ✅    |    ✅     |     ✅     |     ✅     |

在 Windows 平台，Chrome 支持 PQ、HDR10 (含静态元数据的 PQ)、HLG，在 SDR 模式播放时会基于静态元数据（如果存在）自动进行 Tone-mapping，在 HDR 模式播放时会提交静态元数据到 GPU。HDR10+ 的 SEI 动态元数据在解码时会被忽略，并以 HDR10 降级播放。由于 Edge 的解码实现和 Chrome / Chromium 不同，在 SDR 模式播放时，存在 PQ HDR Tone-mapping 异常的问题。

在 macOS 平台，Chrome 支持 PQ、HDR10 (含静态元数据的 PQ)、HLG。在 SDR / HDR / 自动模式下，macOS 系统会自动进行 EDR 以确保 HDR 显示正确，Chrome / Edge 实现相同，支持情况一致，Safari 同样支持上述所有 HDR 格式。

#### Dolby Vision 支持情况说明

在 Windows 平台，对于加密杜比视界内容，Chrome >= 110时，支持 Profile 4/5/8，在传入 `--enable-features=PlatformEncryptedDolbyVision` 启动参数开启后，且系统已安装杜比视界插件 + HEVC视频扩展插件的情况下，使用 API 查询时会返回“支持”。对于非加密杜比视界内容，Dolby Vision Profile 8.1/8.4 的 RPU 动态元数据在解码时会被忽略，并以 HDR10 / HLG 降级播放, 使用 API 查询时会返回"不支持"（例如：`MediaSource.isTypeSupported('video/mp4;codecs="dvh1.08.07"')`），不支持 Profile 5（IPTPQc2），播放时会出现颜色异常。

在 macOS 平台，支持非加密的杜比视界 Profile 8.1/8.4，但使用 API 查询时仍会返回"不支持"（例如：`MediaSource.isTypeSupported('video/mp4;codecs="dvh1.08.07"')`）。Safari 是唯一支持 Profile 5 的浏览器，Chrome / Edge 使用 VideoToolbox 解码，测试结果显示直接使用 VideoToolBox 解码并不能支持杜比视界 Profile 5，因此 Chrome / Edge 目前均不支持杜比视界 Profile 5。

上述两个平台均不支持双层杜比视界。

#### 不同版本 Chrome 的 HDR 支持情况

Chrome 107 不支持提取 HEVC 静态元数据的能力，所有 HDR10 视频均以降级为 PQ 的方式播放。HLG 视频使用显卡厂商自带的 Video Processor API 进行 Tone-mapping，在部分笔记本上性能较差，播放 4K 视频可能会导致卡顿。

Chrome 108 支持了提取 HEVC 静态元数据的能力，对于容器内写入元数据的视频，播放效果很好，但有部分视频由于静态元数据没有写入容器，由于提取不到静态元数据，导致这部分 HDR10 视频被降级为 PQ 视频播放，高光细节可能会缺失。此外 Windows 平台的 HLG Tone-mapping 算法切换为了 Chrome 自己的算法，解决了卡顿的问题，但 Chrome 一直使用 8bit 做 Tone-maping，这又导致 HLG Tone-mapping 结果存在对比度不足的问题。

Chrome 109 开始，HDR -> SDR 流程切换为 16 bit + 零拷贝，提升了 Windows 下的 PQ Tone-mapping 的精准度，HLG 对比度不足问题也得以解决，还降低了大概 50% 的显存占用。

Chrome 110 主要解决静态元数据提取不完整的问题，支持从比特流和容器同时提取静态元数据，部分 HDR10 视频在 macOS 和 Windows 下高光部分不够亮的问题得以解决，至此所有 HDR 问题均已解决。

## 如何验证特定 Profile, 分辨率的视频是否可以播放？

### 非加密内容

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

*注1：上述三种 API 均已经将 `--disable-gpu`, `--disable-accelerated-video-decode`，`gpu-workaround`，`设置-系统-使用硬件加速模式（如果可用）`，`操作系统版本号` 等影响因素考虑在内了，只要确保 Chrome 版本号 >= `107.0.5304.0` (Windows 平台 Chrome 108 及之前版本存在一个 Bug，如果设备特定的GPU驱动程序版本因为一些原因导致 D3D11VideoDecoder 被禁用，尽管硬解已不可用，但此时 isTypeSupported 等 API 仍然会返回 “支持”，该问题已在 Chrome 109 修复), 且系统是 macOS 或 Windows，则可保证结果准确性。*

*注2：相比 `MediaSource.isTypeSupported()` 或 `CanPlayType()`，更推荐使用 `MediaCapabilities`，`MediaCapabilities` 除了会将 `设置-系统-使用硬件加速模式（如果可用）` 等等上述影响因素加入考虑外，还会考虑 `视频分辨率` 是否支持，不同的 GPU 所支持的最高分辨率是不一样的，比如部分 AMD GPU 最高只支持到 4096 * 2048，一些老的 GPU 只能支持到 1080P。*

### 加密内容

#### requestMediaKeySystemAccess

```javascript
/** Detect HEVC Widevine L1 support (only Windows is supported). */
try {
  await navigator.requestMediaKeySystemAccess('com.widevine.alpha.experiment', [
    {
      initDataTypes: ['cenc'],
      distinctiveIdentifier: 'required',
      persistentState: 'required',
      sessionTypes: ['temporary'],
      videoCapabilities: [
        {
          robustness: 'HW_SECURE_ALL',
          contentType: 'video/mp4; codecs="hev1.1.6.L120.90"',
        },
      ],
    },
  ]);
  console.log('Widevine L1 HEVC main profile is supported!');
} catch (e) {
  console.log('Widevine L1 HEVC main profile is not supported!');
}

/**
 * Detect Dolby Vision Widevine L1 support (only Windows is supported, and only if
 * `--enable-features=PlatformEncryptedDolbyVision` switch has been passed).
 */
try {
  await navigator.requestMediaKeySystemAccess('com.widevine.alpha.experiment', [
    {
      initDataTypes: ['cenc'],
      distinctiveIdentifier: 'required',
      persistentState: 'required',
      sessionTypes: ['temporary'],
      videoCapabilities: [
        {
          robustness: 'HW_SECURE_ALL',
          contentType: 'video/mp4; codecs="dvhe.05.07"',
        },
      ],
    },
  ]);
  console.log('Widevine L1 DV profile 5 is supported!');
} catch (e) {
  console.log('Widevine L1 DV profile 5 is not supported!');
}
```

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

`2023-02-17` 更新 Widevine L1 HEVC / Dolby Vision 支持的检测方法

`2023-02-14` 安卓平台现已允许使用设备支持的最大分辨率播放 H264 / HEVC / VP9 / AV1，原先所有 Codec 最大仅支持写死的 4K，现在只要设备支持，即可支持 8K 甚至更高的分辨率 (Chrome >= `112.0.5594.0`)

`2023-02-11` 视频色彩空间 (Primary, Matrix, Transfer) 非法时, 仍允许视频文件正常播放 (Chrome >= `112.0.5589.0`)

`2022-12-03` 修复了 SEI 可能提取不完整的问题，支持了同时从比特流和封装容器提取 HDR Metadata (静态元数据）的能力。上述两点最终可解决了部分 HDR10 视频提取不到静态元数据的问题，并确保 HDR 效果最佳 (Chrome >= `110.0.5456.0`)

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
