# enable-chromium-hevc-hardware-decoding

一个教你为 Chrome / Edge 启用 HEVC 硬解码 & 硬编码，或编译 Chromium / Electron 使其支持 HEVC 硬、软解码 & 硬编码功能的教程。

##### 简体中文 | [English](./README.md)

## 支持硬解码哪些Profile？

HEVC Main (最高支持 8192x8192 px)

HEVC Main 10 (最高支持 8192x8192 px)

HEVC Main Still Picture (最高支持 8192x8192 px)

HEVC Rext (部分支持，细节见下表，最高支持 8192x8192 px)

|        GPU             | 8b 420 |     8b 422     |      8b 444    | 10b 420  | 10b 422 | 10b 444 | 12b 420 |    12b 422    |    12b 444     |
| :--------------------- | :----- | :------------- | :------------- | :------- | :------ | :------ | :------ | :------------ | :------------- |
|  Apple Silicon (macOS) |   ✅    |       ✅       |       ✅       |    ✅    |    ✅    |    ✅   |    ❌   |       ❌       |       ❌       |
| Intel ICL ~ TGLx (Win) |   ✅    |✅<sup>[5]</sup>|✅<sup>[4]</sup>|    ✅    |    ✅    |    ✅   |    ❌   |       ❌       |       ❌       |
|    Intel TGLx+ (Win)   |   ✅    |✅<sup>[5]</sup>|✅<sup>[4]</sup>|    ✅    |    ✅    |    ✅   |    ✅   |✅<sup>[4]</sup>|✅<sup>[4]</sup>|

✅：显卡+软件都支持
❌：显卡不支持

*注1：Intel Mac 支持软解 HEVC Rext 8 ~ 12b 400, 420, 422, 444 的内容。Apple Silicon Mac 支持硬解 HEVC Rext 8 ～ 10b 400, 420, 422, 444 的内容，在 macOS 13+ 支持软解 HEVC Rext 12b 400, 420, 422, 444 的内容。*

*注2：Intel 10 代 GPU 支持硬解 HEVC Rext 8b 420, 8b 422, 8b 444, 10b 420, 10b 422, 10b 444 的内容。11 代及以后的 GPU 还支持硬解 HEVC Rext 12b 420, 12b 422, 12b 444 的内容。*

*注3：尽管 NVIDIA GPU 支持 8 ~ 12b 非 422 HEVC Rext CUVIA 或 NVDEC 硬解码，但由于 NVIDIA 没有给 D3D11 接口暴露这部分能力，因此 Chromium 以后也不会支持它们。*

*注4：Windows HEVC 8b 444, 12b 422, 12b 444 支持需要 Chrome >= `117.0.5866.0`。*

*注5：Windows HEVC 8b 422 支持需要 Chrome >= `118.0.5956.0`。*

*注6：保留原始 4:2:2/4:4:4 色度抽样, 需要 Chrome >= `125.0.6408.0`。*

## 支持硬编码哪些Profile？

HEVC Main (macOS & Windows & Android, macOS 最高支持取决于硬件<sup>[4]<sup>, Windows 最高支持取决于硬件<sup>[3]</sup>, 安卓最高支持取决于硬件)

*注1：Chrome >= `130.0.6703.0` 默认启用，无需启动参数，< `130.0.6703.0` 时需要通过 Chrome Switch（`--enable-features=PlatformHEVCEncoderSupport`）的方式测试使用，[测试页面](https://w3c.github.io/webcodecs/samples/encode-decode-worker/index.html)。*

*注2: Windows / Mac 须确保 Chrome 版本号 >= `109.0.5397.0`，Android 须确保 Chrome 版本号 >= `117.0.5899.0`。*

*注3: Windows Chrome >= `131.0.6759.0` 时最高分辨率与帧率组合，基于 MF 获取值计算，取决于硬件，最高分辨率可达 `7680x4320`，最高帧率可达 `300fps`，< `130.0.6703.0` 时统一为 `1920x1088 & 30fps`。*

*注4: Mac Chrome >= `131.0.6771.0` 时，最高分辨率取决于硬件，Apple Silicon 芯片的 Mac，最高支持到 `8192x4352 & 120fps`，否则，最高支持到 `4096x2304 & 120fps`*

## 操作系统要求？

macOS Big Sur (11.0) 及以上

Windows 8 及以上

Android 5.0 及以上

Chrome OS (仅支持 VAAPI, V4L2 接口支持的 GPU，比如：Intel 核显)

Linux (版本号须 >= `108.0.5354.0`, 仅支持 VAAPI 接口支持的 GPU，比如：Intel 核显)

## 支持哪些 API？

视频解码：支持 File, Media Source Extensions, WebCodec (8Bit >= `107.0.5272.0`, 10Bit + HEVC with Alpha >= `108.0.5343.0`), Clearkey 以及 Widevine L1 (不支持L3) Encrypted Media Extensions, WebRTC (实验性功能，需使用 Chrome Canary 传入 `--enable-features=PlatformHEVCEncoderSupport,WebRtcAllowH265Send,WebRtcAllowH265Receive --force-fieldtrials=WebRTC-Video-H26xPacketBuffer/Enabled` 开启，或直接使用本仓库提供的 Chromium 测试，一些可用的测试地址供参考：[Media Capabilities](https://webrtc.internaut.com/mc/), [Demo](https://webrtc.github.io/samples/src/content/peerconnection/change-codecs/))。

视频编码：支持 WebCodec (支持 macOS, Windows, Androird, Chrome >= `130.0.6703.0` 版本默认启用，< `130.0.6703.0` 版本需要传启动参数：`--enable-features=PlatformHEVCEncoderSupport` 手动开启), WebRTC (测试方式见视频解码部分描述)，MediaRecorder (Chrome >= `132.0.6784.0` 版本需要传启动参数 `--enable-features=MediaRecorderHEVCSupport` 手动开启, [Demo](https://webrtc.github.io/samples/src/content/getusermedia/record/))。

## GPU要求？

#### 独显

Intel DG1 及以上

NVIDIA GT635, GTX645 及以上

AMD RX460 及以上

#### 集显

Intel HD4400, HD515 及以上

AMD Radeon R7, Vega M 及以上

Apple M1, M1 Pro, M1 Max, M1 Ultra 及以上

#### 详细支持列表

[Intel](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/intel.html)

[AMD](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/amd.html)

[NVIDIA](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/nvidia.html)

## HDR 支持？(与 Edge / Safari / Firefox 的对比)

|                 |   PQ     |   HDR10  |  HDR10+  |   HLG    |  DV P5   |  DV P8.1  |  DV P8.4    |
| :-------------- | :------- | :------- | :------- | :------- |:-------- |:--------- |:----------- |
| Chrome Mac  |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
| Chrome Win  |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
|  Edge Mac   |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
|  Edge Win   |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
| Safari Mac  |    ✅    |     ✅    |    ✅    |    ✅    |    ✅     |     ✅     |     ✅     |
|Firefox Win<sup>[1]</sup>|    ❌    |     ❌    |    ❌    |    ❌    |    ❌     |     ❌     |     ❌     |

在 Windows 平台，Chrome 支持 PQ、HDR10 (含静态元数据的 PQ)、HLG，会基于静态元数据（如果存在）自动进行 Tone-mapping。HDR10+ 的 SEI 动态元数据在解码时会被忽略，并以 HDR10 降级播放。

在 macOS 平台，Chrome 支持 PQ、HDR10 (含静态元数据的 PQ)、HLG。在 SDR / HDR / 自动模式下，macOS 系统会自动进行 EDR 以确保 HDR 显示正确，Chrome / Edge 实现相同，支持情况一致，Safari 同样支持上述所有 HDR 格式。

*注1：Firefox >= 133 默认启用 HEVC 解码支持 (仅 Windows 平台)，支持 HEVC Main 以及 Main10 profile (通常 HDR 视频以 Main10 profile 编码)，但无法正常渲染 HLG/PQ HDR*

#### Dolby Vision 支持情况说明

这里情况分为两种：
1. 第一种：支持 RPU 动态元数据，支持 Profile 5（IPTPQc2）播放。
2. 第二种：支持 Profile 8/9 等 Cross-compatible Profile，以 HDR10/HLG/SDR 渲染播放。

对于第一种，目前仅 Chromecast 和 Windows 平台具有有限的支持，在 Windows 平台，Chrome 支持加密杜比视界内容。Chrome >= 110 的版本，手动传入 `--enable-features=PlatformEncryptedDolbyVision` 启动参数，在系统已安装杜比视界插件 + HEVC视频扩展插件的情况下，支持 Profile 4/5/8，使用 API 查询时会返回“支持”（注：对于外置 HDR 显示器，如果开启 HDR 模式，微软的 MediaFoundation 存在Bug，不会返回“支持” 结果）。

对于第二种，例如具有 HLG, HDR10, SDR 兼容性的 Profile 8/9，在使用 API 以 `dvh1`, `dvhe`, `dva1`, `dvav` 查询时会返回 "不支持"（例如：`MediaSource.isTypeSupported('video/mp4;codecs="dvh1.08.07"')`），以 `hvc1`, `hev1`, `avc1`, `avc3` 查询时会返回"支持"，具体版本的 Chrome，实现细节有所不同：

Chrome >= 122，正常情况，只要平台支持 HEVC，则支持，假定开发者使用的 API 是 MSE，则整体流程大致如下：

```javascript
if (isTypeSupported('video/mp4;codecs="dvh1.08.07"')) {
  if (use_rpu) {
    // 播放成功，Chrome 内部认为 Codec 为 杜比视界，并使用 RPU 动态元数据。
    source.addSourceBuffer('video/mp4;codecs="dvh1.08.07"');
    ...
  } else if (dvcc.dv_bl_signal_compatibility_id === 1 ||
             dvcc.dv_bl_signal_compatibility_id === 2 ||
             dvcc.dv_bl_signal_compatibility_id === 4) {
    // 播放成功，Chrome 内部认为 Codec 为 HEVC，忽略 RPU 动态元数据
    // 并以 HLG/HDR10/SDR 格式解码渲染。
    // 注意：如果是 Profile5，只能基于 `dvh1` 或 `dvhe` 创建 Source Buffer
    source.addSourceBuffer('video/mp4;codecs="hev1.2.4.L120.90"');
    ...
  } else {
    // 播放失败，不向下兼容的杜比 Profile，不可以使用 HEVC 构造
    // Source Buffer。
  }
} else if (isTypeSupported('video/mp4;codecs="hev1.2.4.L120.90"')) {
  if (dvcc.dv_bl_signal_compatibility_id === 1 ||
      dvcc.dv_bl_signal_compatibility_id === 2 ||
      dvcc.dv_bl_signal_compatibility_id === 4) {
    // 播放成功，Chrome 内部认为 Codec 为 HEVC，忽略 RPU 动态元数据
    // 并以 HLG/HDR10/SDR 渲染。
    source.addSourceBuffer('video/mp4;codecs="hev1.2.4.L120.90"');
    ...
  } else {
    // 播放失败，例如 Chrome 不支持 Profile 5 时，但你使用 HEVC 构造
    // 了 Source Buffer。
  }
} else {
  // 播放失败，HEVC 不支持。
}
```

110 ～ 121 版本的 Windows Chrome, 开发者需要注意，不管啥情况都是播不成的，这不是你的问题，是浏览器的问题。如果是其他平台的 Chrome, 比如：macOS, Android 等，可以正常以 `hvc1`, `hev1`, `avc1`, `avc3` 构建 SourceBuffer 并播放 Profile 8 等兼容杜比视界内容，只要视频的 Sample Entry 不是 `dvh1`, `dvhe`, `dva1`, `dvav` 就可以。

107 ～ 109 版本，可以正常以 `hvc1`, `hev1`, `avc1`, `avc3` 构建 SourceBuffer 并播放 Profile8 等兼容 Dolby Vision 内容，只要视频的 Sample Entry 不是 `dvh1`, `dvhe`, `dva1`, `dvav` 就可以。

#### 不同版本 Chrome/Edge 的 HDR 支持情况

Chrome 107 不支持提取 HEVC 静态元数据的能力，所有 HDR10 视频均以降级为 PQ 的方式播放。HLG 视频使用显卡厂商自带的 Video Processor API 进行 Tone-mapping，在部分笔记本上性能较差，播放 4K 视频可能会导致卡顿。

Chrome 108 支持了提取 HEVC 静态元数据的能力，对于容器内写入元数据的视频，播放效果很好，但有部分视频由于静态元数据没有写入容器，由于提取不到静态元数据，导致这部分 HDR10 视频被降级为 PQ 视频播放，高光细节可能会缺失。此外 Windows 平台的 HLG Tone-mapping 算法切换为了 Chrome 自己的算法，解决了卡顿的问题，但 Chrome 一直使用 8bit 做 Tone-maping，这又导致 HLG Tone-mapping 结果存在对比度不足的问题。

Chrome 109 开始，HDR -> SDR 流程切换为 16bit + 零拷贝，提升了 Windows 下的 PQ Tone-mapping 的精准度，HLG 对比度不足问题也得以解决，还降低了大概 50% 的显存占用。

Chrome 110 主要解决静态元数据提取不完整的问题，支持从比特流和容器同时提取静态元数据，部分 HDR10 视频在 macOS 和 Windows 下高光部分不够亮的问题得以解决，至此所有 HDR 问题均已解决。

Chrome 119 解决了 Windows 平台 AMD 显卡 10bit 播放视频问题（SDR 模式下播放 HLG 视频黑屏，4K 卡顿，显存占用高，播放 PQ 视频可能导致全屏颜色变化，HDR 模式下播放 10bit SDR 视频崩溃）。

Chrome 122 主要解决了杜比视界 Profile8 兼容播放等问题。

Chrome 123 确保了 Windows 平台，PQ/HDR10 视频在显示器 HDR 模式下可以以绝对亮度渲染。还解决了连接多显示器时，窗口在 SDR 显示器/ HDR 显示器间拖动时，Tone-mapping 颜色异常的问题。

Chrome 124 解决了 Windows 平台，开启 NVIDIA RTX Auto HDR 功能后，页面滚动会导致视频亮度频繁切换的问题。

Chrome 125 在解决了 Intel HDR10 MPO 的各种问题后，重启启用了该功能。 

Edge 125 解决了 Windows 平台 `VDAVideoDecoder` 解码 HEVC Main10 10bit 视频后，没有零拷贝输出的问题，PQ/HDR10/HLG Tone-mapping 异常的问题方可亦得到解决。后期版本的 HDR 渲染结果预期将与 Chrome 完全一致，由于统一由 Skia 渲染，最终各显卡厂商的渲染结果在 HDR 模式开启/关闭前后，都可以保持一致（在 HDR 模式开启后，11 代以后的 Intel GPU, Intel HDR10 MPO 可能会被启用，此时与 Skia 渲染的结果有少许不一致）。

## 如何验证特定 Profile, 分辨率的视频是否可以播放？

### 非加密内容

#### MediaCapabilities

```javascript
const mediaConfig = {
  /**
   * 这里写 `file` 或 `media-source` 都可以, 结果一致。当要检测 `webrtc`
   * 可用性时，`contentType` 应该被替换为 `video/h265` (注意: `webrtc` 功能 
   * 仅用于测试目的, Chrome 官方可能未来不会默认启用该功能, 你可以传入命令行开启，
   * 或在本仓库使用自定义 Chromium v128 二进制测试)
   */
  type: 'file',
  video: {
    /**
     * 视频的 Profile
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

#### VideoDecoder

```javascript
const videoConfig = {
  /**
   * 视频的 Profile
   * 
   * Main: `hev1.1.6.L93.B0`
   * Main 10: `hev1.2.4.L93.B0`
   * Main still-picture: `hvc1.3.E.L93.B0`
   * Range extensions: `hvc1.4.10.L93.B0`
   */
  codec: 'hev1.1.6.L120.90',
  /* HEVC 只支持硬解 */
  hardwareAcceleration: 'prefer-hardware',
  /* 视频的宽度 */
  codedWidth: 1280,
  /* 视频的高度 */
  codedHeight: 720,
}

try {
  const result = await VideoDecoder.isConfigSupported(videoConfig);
  /* 指定的 Profile + 宽高的视频是否可解码 */
  if (result.supported) {
    console.log('Video can play!');
  } else {
    console.log('Video can\'t play!');
  }
} catch (e) {
  /* 老版本 Chromium 可能对不支持的 Profile, throw Error */
  console.log('Video can\'t play!');
}
```

*注1：上述四种 API 均已经将 `--disable-gpu`, `--disable-accelerated-video-decode`，`gpu-workaround`，`设置-系统-使用硬件加速模式（如果可用）`，`操作系统版本号` 等影响因素考虑在内了，只要确保 Chrome 版本号 >= `107.0.5304.0` (Windows 平台 Chrome 108 及之前版本存在一个 Bug，如果设备特定的GPU驱动程序版本因为一些原因导致 D3D11VideoDecoder 被禁用，尽管硬解已不可用，但此时 isTypeSupported 等 API 仍然会返回 “支持”，该问题已在 Chrome 109 修复), 且系统是 macOS 或 Windows，则可保证结果准确性。*

*注2：安卓平台存在一个 Bug，Chrome < `112.0.5612.0` 的版本没有返回实际硬件支持情况（安卓 5.0 之后的版本尽管默认支持 HEVC main profile 软解，但 main10 profile 是否支持由则由具体硬件来决定），永远认为支持所有 Profile 和分辨率的 HEVC 视频。Chrome >= `112.0.5612.0` 版本解决了这个问题，并会根据设备实际支持的情况返回正确的结果，和 macoS, Windows 一样支持上述三种 API，且各种影响因素均会被考虑在内。*

*注3：相比 `MediaSource.isTypeSupported()` 或 `CanPlayType()`，更推荐使用 `MediaCapabilities`，`MediaCapabilities` 除了会将 `设置-系统-使用硬件加速模式（如果可用）` 等等上述影响因素加入考虑外，还会考虑 `视频分辨率` 是否支持，不同的 GPU 所支持的最高分辨率是不一样的，比如部分 AMD GPU 最高只支持到 4096 * 2048，一些老的 GPU 只能支持到 1080P。*

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

## 硬解技术实现区别？(与 Edge / Safari / Firefox 的对比)

#### Windows

Edge 使用 `VDAVideoDecoder` 调用 `MFT`（需要安装 `HEVC视频扩展` 插件, Edge 117 ~ 121 使用 `MediaFoundationRenderer`, 在 122 及以后版本切换回了之前的 `VDAVideoDecocder`）完成解码，和系统自带的 `电影与电视` 用的解码器相同。

Firefox (>= 120, 实验功能, 需手动设置 `media.wmf.hevc.enabled=1` 开启) 调用 `MFT`（需要安装 `HEVC视频扩展` 插件）完成解码，和系统自带的 `电影与电视` 用的解码器相同。

当使用 `MFT` 解码时，如果设备不支持特定的 Profile（比如：NVIDIA GTX 745 不支持 Main10 Profile）或者分辨率（比如：NVIDIA GTX 960 不支持 4K 以上分辨率）的硬解，`MFT` 会自动切换到软解。

Chrome 使用 `D3D11VideoDecoder` 调用 `D3D11VA` （无需安装插件）完成硬解，和 `VLC` 等视频播放器用的解码器相同。

#### macOS

Edge 和 Chrome 在 macOS 的解码实现没有任何区别。

Safari 和 Chrome 二者均使用 `VideoToolbox` 解码器完成解码，如果设备不支持硬解，均会自动切换到软解。此外, 与 Safari 相比，Chrome 具有更高的操作系统版本要求 (10.13 vs 11.0)。

## 如何验证视频播放是否走硬解？

1. 打开 `chrome://gpu`, 搜索 `Video Acceleration Information`, 如果能看到 **Decode hevc main** 和 **Decode hevc main 10**, 以及 **Decode hevc main still-picture** (macOS 和 Windows Intel Gen10+ iGPU 还会显示 **Decode hevc range extensions**) 说明支持硬解（这里 macOS 是个例外，显示仅代表支持 VideoToolbox 解码，至于是否硬解取决于 GPU 支持情况）。
2. 打开 `chrome://media-internals` 并尝试播放一些 HEVC 视频 ([测试页面](https://lf3-cdn-tos.bytegoofy.com/obj/tcs-client/resources/video_demo_hevc.html))，如果最终使用的 Decoder 是 `VDAVideoDecoder` 或 `VideoToolboxVideoDecoder` 或 `D3D11VideoDecoder` 或 `VaapiVideoDecoder` 说明走了硬解（这里 macOS 是个例外，macOS Big Sur 以上版本，在不支持的 GPU 上，VideoToolbox 会自动 fallback 到软解，性能相比 FFMPEG 软解更好，Decoder 同样为 `VDAVideoDecoder` 或 `VideoToolboxVideoDecoder`）, 如果 Decoder 是 `FFMpegVideoDecoder` 说明走的是软解。
3. 如果是 Mac，请打开 `活动监视器`并搜索 `VTDecoderXPCService`, 如果播放时进程的 CPU 利用率大于 0 说明走了硬解（或软解）。
4. 如果是 Windows，请打开 `任务管理器` 并切换到 `性能` - `GPU` 面板，如果 `Video Decode`(Intel, NVIDIA) 或 `Video Codec`(AMD) 的利用率大于 0 说明走了硬解，对于一些初代支持 HEVC 的显卡（例如: NVIDIA RTX 745），由于没有专用解码电路，虽然支持 `D3D11` 解码 API，但解码时仅占用通用的 `3D` 利用率。

## 如何验证视频编码是否走硬编？

1. 打开 `chrome://gpu`, 搜索 `Video Acceleration Information`, 如果能看到 **Encode hevc main** 说明支持硬编码。
2. 如果是 Mac，请打开 `活动监视器`并搜索 `VTDecoderXPCService`, 如果编码时进程的 CPU 利用率大于 0 说明走了硬编码。
3. 如果是 Windows，请打开 `任务管理器` 并切换到 `性能` - `GPU` 面板，如果编码时 `Video Encode`(Intel, NVIDIA) 或 `Video Codec`(AMD) 的利用率大于 0 说明走了硬编码。

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
2. (可选) 支持 HEVC 软解：切换到 `src/third_party/ffmpeg` 目录，执行 `git am /path/to/add-hevc-ffmpeg-decoder-parser.patch` 。如果有冲突，也可尝试使用 `node /path/to/add-hevc-ffmpeg-decoder-parser.js` 直接修改代码（需要确保Node.js已安装再执行该命令）, 然后继续执行 `git am /path/to/change-libavcodec-header.patch` (如果本仓库同步上游不及时，这条命令也可能失败，如遇失败可提 Issue 反馈，或直接提交修复的 Merge Request)，最后切换回 `src` 目录，执行 `git am /path/to/enable-hevc-ffmpeg-decoding.patch`。
3. (可选) 默认启用 HEVC WebRTC 功能，切换到 `src` 目录，执行 `git am /path/to/enable-hevc-webrtc-send-receive-by-default.patch`，然后切到 `src/third_party/webrtc` 目录，执行 `git am /path/to/enable-h26x-packet-buffer-by-default.patch`。
4. (可选) 集成 Widevine CDM，以支持 EME 加密视频 (例：Netflix) 播放：切换到 `src` 目录，执行 `cp -R /path/to/widevine/* third_party/widevine/cdm` (Windows 请执行: `xcopy /path/to/widevine third_party\widevine\cdm /E/H`)。
5. 假设你想编译 `Mac` + `x64` 架构（其他可选的架构有：`x86`, `arm64`, `arm`）+ 支持 CDM 的 Chromium，请执行 `gn gen out/Release64 --args="is_component_build = false is_official_build = true is_debug = false ffmpeg_branding = \"Chrome\" target_cpu = \"x64\" proprietary_codecs = true media_use_ffmpeg = true enable_widevine = true bundle_widevine_cdm = true"`，如果想编译 `Windows`，请额外添加 `enable_media_foundation_widevine_cdm = true`。
6. 执行 `autoninja -C out/Release64 chrome` 以开始编译。
7. 双击打开 Chromium。

## 如何集成到 Electron 等基于 Chromium 的项目？

Electron >= v22.0.0 已集成好 macOS, Windows, 和 Linux (仅 VAAPI) 平台的 HEVC 硬解功能，且开箱即用。若要集成软解，方法同上述 Chromium 教程相同。

Electron >= v33.0.0 已集成好 macOS, Windows 平台的 HEVC 硬编码功能，且开箱即用。

## 更新历史

`2024-11-18` Firefox >= 133 默认启用 HEVC 解码支持（仅支持 Windows 平台），更新与 Firefox HDR 支持的对比。

`2024-10-18` 新增 MediaRecorder HEVC 编码支持 (Chrome >= `132.0.6784.0`)

`2024-10-11` 提高 Apple Silicon Mac 编码分辨率至 `8192x4352` (Chrome >= `131.0.6771.0`)

`2024-10-10` 添加 Mac HEVC VideoToolbox 软编支持 (Chrome >= `131.0.6769.0`)

`2024-10-05` Windows 平台高帧率编码支持 (Chrome >= `131.0.6759.0`)

`2024-09-27` 修复了 Apple Silicon Mac 在 macOS 15.0 无法硬编码 H264/HEVC 的问题 (Chrome >= `131.0.6742.0`)

`2024-09-11` 修复了一个由于 `TemporalId` 计算错误导致 HEVC 视频播放失败的问题 (Chrome >= `130.0.6711.0`)

`2024-09-07` Window, macOS, Android 默认启用 HEVC 硬编码，Windows 平台硬编码最大分辨率限制从 1080P&30fps 提升到 4K/8K&30fps (Chrome >= `130.0.6703.0`)

`2024-07-19` Windows 平台新增 HEVC Main Still Picture Profile 支持 (Chrome >= `128.0.6607.0`)

`2024-06-29` 新增启用 HEVC WebRTC 支持的 Patch (Chrome >= `128.0.6564.0`)

`2024-05-30` 修复了 GBR 色彩空间 Matrix 编码的 HEVC 视频，存在的颜色渲染异常的问题 (Chrome >= `127.0.6510.0`)

`2024-04-18` 修复了某些 AMD GPU 上的视频帧卡顿的问题 (Edge >= `124.0.2478.49`)，以及 Windows 平台上 Edge 的 HEVC Main10 HDR Tone-mapping 颜色异常，性能不佳的问题 (Edge >= `125.0.2530.0`)

`2024-04-09` 解决了 Windows/macOS 平台 HEVC Rext 4:2:2/4:4:4 视频色度抽样被降级到 4:2:0 的问题 (Chrome >= `125.0.6408.0`)

`2024-03-28` 更新 Chromium 123 / 124 HDR 问题修复细节，以及 `Edge >= 122` 后与 Chrome 的技术实现区别对比

`2023-12-22` 更新与 Firefox 技术实现细节的对比

`2023-12-08` 提升杜比视界播放能力 (Chrome >= `122.0.6168.0`)

`2023-11-16` 支持 MV-HEVC Base Layer 播放 (Chrome >= `121.0.6131.0`)

`2023-10-20` 修复 Windows CRA/RASL Seek 时可能导致马赛克画面的问题 (Chrome >= `120.0.6076.0`)

`2023-10-10` 禁用 `20.19.15.4284` - `20.19.15.5172` 可能导致 HEVC 崩溃的驱动版本 (Chrome >= `120.0.6059.0`)

`2023-10-02` 更新 Edge 117 HEVC HDR10/PQ 支持情况

`2023-09-23` Windows 平台 AMD 显卡 10bit 播放视频问题修复（SDR 模式下播放 HLG 视频黑屏，4K 卡顿，显存占用高，播放 PQ 视频可能导致全屏颜色变化，HDR 模式下播放 10bit SDR 视频崩溃, Chrome >= `119.0.6022.0`）

`2023-08-21` Windows 平台添加 HEVC Rext 8bit 422 支持 (Chrome >= `118.0.5956.0`)

`2023-07-28` 修复 Windows HEVC WebCodecs VideoDecoder 特定视频帧输出延时问题 (见: https://github.com/w3c/webcodecs/issues/698, Chrome >= `117.0.5913.0`)

`2023-07-20` Android 10+ 新增 HEVC HW WebCodecs 编码支持 (Chrome >= `117.0.5899.0`)

`2023-07-16` Apple Silicon + macOS 14 以上系统添加 HEVC SVC (L1T2) WebCodecs 编码支持 (Chrome >= `117.0.5891.0`)

`2023-07-07` 修复 Windows 下 8bit HDR HEVC 播放失败问题 (Chrome >= `117.0.5877.0`)

`2023-07-02` Windows 平台添加 HEVC Rext 8bit 444, 12bit 422, 12bit 444 支持 (Chrome >= `117.0.5866.0`)

`2023-02-22` 安卓平台的检测 API 已支持根据设备实际支持情况返回正确的结果 (Chrome >= `112.0.5612.0`)

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
