# enable-chromium-hevc-hardware-decoding

A guide that teach you enable hardware HEVC decoding & encoding for Chrome / Edge, or build a custom version of Chromium / Electron that supports hardware & software HEVC decoding and hardware HEVC encoding.

##### English | [简体中文](./README.zh_CN.md)

## Usage

#### Chrome & Edge (Mac) & Chromium

Make sure version >= 107 then open directly.

## What's the hardware decoding supported HEVC profile?

HEVC Main (Up to 8192x8192 pixels)

HEVC Main 10 (Up to 8192x8192 pixels)

HEVC Main Still Picture (up to 8192x8192 pixels)

HEVC Rext (partially supported, see the table below for details, up to 8192x8192 pixels)

|        GPU             | 8b 420 |     8b 422     |      8b 444    | 10b 420  | 10b 422 | 10b 444 | 12b 420 |    12b 422    |    12b 444     |
| :--------------------- | :----- | :------------- | :------------- | :------- | :------ | :------ | :------ | :------------ | :------------- |
|  Apple Silicon (macOS) |   ✅    |       ✅       |       ✅       |    ✅    |    ✅    |    ✅   |    ❌   |       ❌       |       ❌       |
| Intel ICL ~ TGLx (Win) |   ✅    |✅<sup>[5]</sup>|✅<sup>[4]</sup>|    ✅    |    ✅    |    ✅   |    ❌   |       ❌       |       ❌       |
|    Intel TGLx+ (Win)   |   ✅    |✅<sup>[5]</sup>|✅<sup>[4]</sup>|    ✅    |    ✅    |    ✅   |    ✅   |✅<sup>[4]</sup>|✅<sup>[4]</sup>|

✅：GPU + software support
❌：GPU not support

*Note 1: Intel Macs support HEVC Rext software decoding of 8 ~ 12b 400, 420, 422, 444 contents. Apple Silicon Mac supports HEVC Rext hardware decoding of 8 ~ 10b 400, 420, 422, 444 contents, and software decoding of 12b 400, 420, 422, 444 contents on macOS 13+.*

*Note 2: Intel Gen10 GPUs support HEVC Rext hardware decoding of 8b 420, 8b 422, 8b 444, 10b 420, 10b 422, 10b 444 contents on Windows. Gen11+ GPUs additionally support HEVC Rext hardware decoding of 12b 420, 12b 422, 12b 444 contents.*

*Note 3: Although NVIDIA GPUs support HEVC Rext hardware decoding of 8 ~ 12b non-422 contents via CUVIA or NVDEC, but because they did not provide a D3D11 interface, thus Chromium will not support it in the future.*

*Note 4: HEVC 8b 444, 12b 422, 12b 444 support requires Chrome >= `117.0.5866.0`.*

*Note 5: HEVC 8b 422 support requires Chrome >= `118.0.5956.0`.*

*Note 6: To retain the original 4:2:2/4:4:4 chroma sampling, requires Chrome >= `125.0.6408.0`.*

## What's the hardware encoding supported HEVC profile?

HEVC Main (macOS & Windows & Android, macOS up to 4096x2304 px & 120 fps, Windows up to 1920*1088 px & 30 fps, Android up to the hardware)

*Note 1: You need to pass a chrome switch to enable it（`--enable-features=PlatformHEVCEncoderSupport`）[Test Page](https://w3c.github.io/webcodecs/samples/encode-decode-worker/index.html).*

*Note 2: Windows / Mac need to make sure Chrome version >= `109.0.5397.0`，Android need to make sure Chrome version >= `117.0.5899.0`。*

## What's the OS requirement?

macOS Big Sur (11.0) and above

Windows 8 and above

Android 5.0 and above

Chrome OS (Only supports GPUs that support VAAPI interface, eg: Intel GPU)

Linux (Chrome version >= `108.0.5354.0`, and only supports GPUs that support VAAPI interface, eg: Intel GPU)

## What's the API supported?

Video Decode: File, Media Source Extensions, WebCodec (8Bit requires >= `107.0.5272.0`, 10Bit + HEVC with Alpha requires >= `108.0.5343.0`), Clearkey and Widevine L1 (HW only) Encrypted Media Extensions, WebRTC (experimental, need to use Chrome Canary passing `--enable-features=PlatformHEVCEncoderSupport,WebRtcAllowH265Send,WebRtcAllowH265Receive --force-fieldtrials=WebRTC-Video-H26xPacketBuffer/Enabled` to enable the feature, or use the Chromium binary provided by this repo, some useful sites here: [Media Capabilities](https://webrtc.internaut.com/mc/), [Demo](https://webrtc.github.io/samples/src/content/peerconnection/change-codecs/)) are supported.

Video Encode: WebCodec (Windows, macOS, and Android, when passing `--enable-features=PlatformHEVCEncoderSupport`) is supported.

## What's the GPU requirement?

#### Discrete GPU

Intel DG1 and above

NVIDIA GT635, GTX645 and above

AMD RX460 and above

#### Integrated GPU

Intel HD4400, HD515 and above

AMD Radeon R7, Vega M and above

Apple M1, M1 Pro, M1 Max, M1 Ultra and above

#### Detail Table

[Intel](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/intel.html)

[AMD](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/amd.html)

[NVIDIA](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/nvidia.html)

## HDR Supports? (Compared with Edge / Safari / Firefox)

|                 |   PQ     |   HDR10  |  HDR10+  |   HLG    |  DV P5   |  DV P8.1  |  DV P8.4    |
| :-------------- | :------- | :------- | :------- | :------- |:-------- |:--------- |:----------- |
| Chrome Mac  |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
| Chrome Win  |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
|  Edge Mac   |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
|  Edge Win   |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
| Safari Mac  |    ✅    |     ✅    |    ✅    |    ✅    |    ✅     |     ✅     |     ✅     |
| Firefox Win<sup>[1]</sup>|    ❌    |     ❌    |    ❌    |    ❌    |    ❌     |     ❌     |     ❌     |

On Windows platform, Chrome supports PQ, HDR10 (PQ with static metadata), and HLG. Automatic Tone-mapping will be enabled based on static metadata (if present). HDR10+ SEI dynamic metadata wil be ignored while decoding and playback will downgrade to HDR10.

On macOS platform, Chrome supports PQ, HDR10 (PQ with static metadata), HLG. In SDR / HDR / Hybrid mode, the macOS system will automatically perform EDR to ensure that HDR is displayed correctly. Chrome / Edge shared the same code thus has the same decoding ability, Safari also supports the above all HDR formats.

*Note 1: Firefox >= 120 just added HEVC decoding support (Windows platform only, experimental, need to manually set `media.wmf.hevc.enabled=1` to enable the feature). Based on my testing, Firefox supports HEVC Main profile while doesn't support Main10 profile (HDR contents usually encoded with Main10 profile) yet, if the bug got fixed, I will re-test and update the table later.*

#### Dolby Vision Supports Status

There are two type of support type here:
1. Type 1: Supports RPU dynamic metadata and Profile 5 (IPTPQc2).
2. Type 2: Supports profiles like Profile 8/9 that has cross-compatible HDR10/HLG/SDR support.

For the first type, currently only Chromecast and Windows platforms have very limited support. On Windows platform, Chrome supports encrypted Dolby Vision content, for versions of Chrome >= 110, when manually passing `--enable-features=PlatformEncryptedDolbyVision` switch and launch Chrome and when the system has installed the Dolby Vision extension and HEVC video extension, Profile 4/5/8 will be supported, "Supported" will be returned when querying the API (Note: For external HDR displays, if HDR mode is turned on, Microsoft's MediaFoundation has a bug and will not return "Supported" results).

For the second type, Profile 8/9 with cross-compatibility such as HLG, HDR10, SDR, using API to query with `dvh1`, `dvhe`, `dva1`, `dvav` will return "not supported" (for example :`MediaSource.isTypeSupported('video/mp4;codecs="dvh1.08.07"')`), while when querying with `hvc1`, `hev1`, `avc1`, `avc3`, "supported" will be returned. The specific version of Chrome has different implementation details:

Chrome >= 122. as long as the platform supports HEVC, then it is supported. Assuming that the API used by developers is MSE, the logic will be something like below:

```javascript
if (isTypeSupported('video/mp4;codecs="dvh1.08.07"')) {
   if (use_rpu) {
     // Playback should success. Chrome internally considers the codec to be Dolby Vision 
     // and uses RPU dynamic metadata.
     source.addSourceBuffer('video/mp4;codecs="dvh1.08.07"');
     ...
   } else if (dvcc.dv_bl_signal_compatibility_id === 1 ||
              dvcc.dv_bl_signal_compatibility_id === 2 ||
              dvcc.dv_bl_signal_compatibility_id === 4) {
     // Playback should success. Chrome internally considers the codec to be HEVC,
     // ignores RPU dynamic metadata, decode and render in HLG/HDR10/SDR mode.
     // Note: If it is profile 5, source buffer can only be created with `dvh1` or `dvhe`
     // mimetype.
     source.addSourceBuffer('video/mp4;codecs="hev1.2.4.L120.90"');
     ...
   } else {
     // Playback should fails, for incompatible dolby profiles, if you use HEVC construct
     // source buffer, it will always fails.
   }
} else if (isTypeSupported('video/mp4;codecs="hev1.2.4.L120.90"')) {
   if (dvcc.dv_bl_signal_compatibility_id === 1 ||
       dvcc.dv_bl_signal_compatibility_id === 2 ||
       dvcc.dv_bl_signal_compatibility_id === 4) {
     // Playback should success. Chrome internally considers the codec to be HEVC,
     // ignores RPU dynamic metadata, decode and render in HLG/HDR10/SDR mode.
     source.addSourceBuffer('video/mp4;codecs="hev1.2.4.L120.90"');
     ...
   } else {
     // Playback should fails, for example when Chrome does not support profile 5 but you use 
     // HEVC construct SourceBuffer.
   }
} else {
   // Playback should fails, HEVC is not supported.
}
```

Versions 110 ~ 121 of Chrome on Windows, Dolby Vision is not playable at all if its not encrypted, this is a bug of the browser. Chrome on other platforms, such as macOS, Android, etc, as long as constructing source buffer with `hvc1`, `hev1`, `avc1`, `avc3` and the sample entry is not `dvh1`, `dvhe`, `dva1`, `dvav`, then the playback should be success.

Versions 107 ~ 109 of Chrome, if constructing source buffer with `hvc1`, `hev1`, `avc1`, `avc3` and the sample entry is not `dvh1`, `dvhe`, `dva1`, `dvav`, then the playback should be success.

#### HDR support by version of Chrome/Edge

Chrome 107 does not support the ability to extract HEVC static metadata, and all HDR10 video playback are downgraded to PQ only mode. HLG videos uses the video processor API provided by the GPU vendor for processing tone-mapping has a poor performance on some laptops, and playing 4K video may cause frame droping.

Chrome 108 supports the ability to extract HEVC static metadata. For videos with static metadata written in the container, the playback is okey on 108, but some videos are not written static metadata to their containers, thus Chrome 108 can not extract the static metadata from these videos which causing the playback to be downgraded to PQ only mode, and the max content light level maybe cutted to a low value for these videos. In addition, the HLG Tone-mapping algorithm on Windows platform has been switched to Chrome's own algorithm, which solves the problem of bad performance on the laptop when using video processor for HLG Tone-mapping. However, Chrome has been using 8 bit for Tone-mapping, which resulting an insufficient contrast ratio of the Tone-mapping result.

Chrome 109 makes the HDR -> SDR process to a 16 bit + zero copy process, which improves the accuracy of PQ Tone-mapping on Windows platform, thus the problem of the insufficient contrast ratio for HLG has been also solved, and the video memory usage has been reduced by about 50%.

Chrome 110 solves the problem of incomplete static metadata extraction. It supports the extraction of static metadata from both the bitstream and the container, thus the max content light level issue has been solved, and at this point all HDR issues should have been resolved.

Chrome 119 fixed 10bit video playback issues for AMD GPU on Windows platform (black screen when playing HLG video in SDR mode, 4K freezes, high memory usage, color change when switching full-screen, crash when playing SDR video in HDR mode).

Chrome 122 improved Dolby Vision cross-compatible playback ability.

Chrome 123 ensures that on Windows platforms, PQ/HDR10 video can be rendered at absolute brightness when system HDR mode is enabled. It also solves the problem of abnormal Tone-mapping issue when the window is dragged between SDR monitor / HDR monitor when multiple monitors are connected.

Chrome 124 solves the issue that on Windows platform when the NVIDIA RTX Auto HDR feature is enabled, page scrolling will cause video brightness transition.

Chrome 125 solves all issues with Intel HDR10 MPO, the feature has been re-enabled.

Edge 125 solves the issue of no zero-copy output when using `VDAVideoDecoder` decodes HEVC Main10 10bit contents on the Windows platform, and the issue of PQ/HDR10/HLG bad tone-mapping result could also be solved. The HDR rendering results of later versions of Edge are expected to be exactly the same as Chrome, performed by Skia, and the rendering results of various GPU manufacturers will remain consistent no matter system HDR mode on or off (Intel HDR10 MPO may be enabled if system HDR mode is turned on and GPU generation >= 11, which may result in slight inconsistencies with Skia rendering results).

## How to verify certain profile or resolution is supported？

### Clear Content

#### MediaCapabilities

```javascript
const mediaConfig = {
  /**
   * You can use `file` or `media-source` and the result are same here. And if type is `webrtc`,
   * `contentType` should be replaced with `video/h265` (NOTE: `webrtc` feature is only for
   * testing purpose, official Chrome may won't enable this by default, so you should find 
   * chromium v128 binary in this repo and test by yourself).
   */
  type: 'file',
  video: {
    /**
     * HEVC Profile
     * 
     * Main: `hev1.1.6.L93.B0`
     * Main 10: `hev1.2.4.L93.B0`
     * Main still-picture: `hvc1.3.E.L93.B0`
     * Range extensions: `hvc1.4.10.L93.B0`
     */
    contentType : 'video/mp4;codecs="hev1.1.6.L120.90"',
    /* Width */
    width: 1920,
    /* Height */
    height: 1080,
    /* Any number */
    bitrate: 10000, 
    /* Any number */
    framerate: 30
  }
}

navigator.mediaCapabilities.decodingInfo(mediaConfig)
  .then(result => {
     /* Indicate whether or not the video with given profile, width, and height can played well on the browser */
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
   * HEVC Profile
   * 
   * Main: `hev1.1.6.L93.B0`
   * Main 10: `hev1.2.4.L93.B0`
   * Main still-picture: `hvc1.3.E.L93.B0`
   * Range extensions: `hvc1.4.10.L93.B0`
   */
  codec: 'hev1.1.6.L120.90',
  /* HEVC is always hw accelerated */
  hardwareAcceleration: 'prefer-hardware',
  /* Width */
  codedWidth: 1280,
  /* Height */
  codedHeight: 720,
}

try {
  const result = await VideoDecoder.isConfigSupported(videoConfig);
  /* Indicate whether or not the video with given profile, width, and height can be decoded by WebCodecs API */
  if (result.supported) {
    console.log('Video can play!');
  } else {
    console.log('Video can\'t play!');
  }
} catch (e) {
  /* There is a bug that in previous version of Chromium, the api may throw Error if config is not supported */
  console.log('Video can\'t play!');
}
```

*Note 1：The above four API have already took `--disable-gpu`, `--disable-accelerated-video-decode`, `gpu-workaround`, `settings - system - Use hardware acceleration when available`, `OS version` etc... into consideration, and if Chrome version >= `107.0.5304.0` (There is a bug in Chrome 108 and previous versions on Windows platform. If a specific GPU driver version causes D3D11VideoDecoder to be disabled for some reason, although the hardware decoding is no longer available, APIs such as isTypeSupported may still return "support", the bug has been fixed in Chrome 109) and OS is macOS or Windows, the result are guaranteed.*

*Note 2: There is a bug for the Android platform, Chrome < `112.0.5612.0` does not return the actual support status of different devices (although Android >= 5.0 supports HEVC main profile SW decoding by default, however whether main10 profile is supported or not completely depends on hardware), and always assume that all HEVC profiles and resolution are supported. Chrome >= `112.0.5612.0` now solves this bug, and will return the correct result depends on hardware and the given video's resolution. Just like Windows and macOS, the above three APIs are supported as well, and every influencing factors should have been taken into account.*

*Note 3：Compared with `MediaSource.isTypeSupported()` or `CanPlayType()`, we recommend using `MediaCapabilities`, since `MediaCapabilities` not only takes `settings - system - Use hardware acceleration when available` etc... into consideration, but also check if the given `width and height` is supported or not since different GPU may have different max resolution support, eg: some AMD GPU only support up to 4096 * 2048, and some old GPU only support up to 1080P.*

### Encrypted Content

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

## What's the tech diff? (Compared with Edge / Safari / Firefox)

#### Windows

Edge uses `VDAVideoDecocder` to call `MFT` (need to install `HEVC Video Extension`, Edge 117 ~ 121 uses `MediaFoundationRenderer`, and switch back to the original `VDAVideoDecocder` after version 122) to finish the HEVC decoding which is the same tech behind `Movies and TV` builtin system app.

Firefox (>= 120, experimental, need to manually set `media.wmf.hevc.enabled=1` to enable the feature) uses `MFT` (need to install `HEVC Video Extension`) to finish the HEVC decoding which is the same tech behind `Movies and TV` builtin system app.

When using `MFT`, If the device does not have hardware decoding support of a specific profile (i.e. NVIDIA GTX 745 does not support Main10 profile) or resolution (i.e. NVIDIA GTX 960 does not support resolutions above 4K), `MFT` will automatically switch to software decoding.

Chrome uses `D3D11VideoDecoder` to call `D3D11VA` (no need to install anything) to finish the HEVC HW decoding which is the same tech behind video players like `VLC`.

#### macOS

Edge and Chrome use the same decoding implementations on macOS.

Safari and Chrome use the same `VideoToolbox` to finish the HEVC decoding, if the device does not have hardware support, it will automatically fallback to use software decoding. Compared with Safari, Chrome requires higher OS version (10.13 vs 11.0).

## How to verify HEVC hardware support is enabled?

1. Open `chrome://gpu`, and search `Video Acceleration Information`, you should see **Decode hevc main** field and **Decode hevc main 10** field (macOS will show **Decode hevc main still-picture** and **Decode hevc range extensions** as well, Windows Intel Gen10+ iGPU will show **Decode hevc range extensions** as well) present if hardware decoding is supported (macOS is an exception here, you see this field doesn't means the decode will use hardware, it actually depends on your GPU).
2. Open `chrome://media-internals` and play some HEVC video ([Test Page](https://lf-tk-sg.ibytedtos.com/obj/tcs-client-sg/resources/video_demo_hevc.html)) if the decoder is `VDAVideoDecoder` or `VideoToolboxVideoDecoder` or `D3D11VideoDecoder` or `VaapiVideoDecoder` that means the video is using hardware decoding (macOS is an exception here, if the OS >= Big Sur, and the GPU doesn't support HEVC, VideoToolbox will fallback to software decode which has a better performance compared with FFMPEG, the decoder is `VDAVideoDecoder` or `VideoToolboxVideoDecoder` in this case indeed), and if the decoder is `FFMpegVideoDecoder` that means the video is using software decoding.
3. Open `Activity Monitor` on Mac and search `VTDecoderXPCService`, if the cpu usage larger than 0 when playing video, that means hardware (or software) decoding is being used.
4. Open `Windows Task Manager` on Windows and switch to `Performance` - `GPU`, if `Video Decode`(Intel, NVIDIA) or `Video Codec`(AMD) usage larger than 0 when playing video, that means hardware decoding is being used. For some first generation GPU (i.e: NVIDIA RTX 745) that support HEVC, since there is no dedicated hw decoding circuit inside the GPU, although the `D3D11` decoding API is supported, it will only occupy the general `3D` utilization when decoding.

## Why my GPU support HEVC, but still not able to hardware decode?

#### OS version is too low

##### Windows

Please make sure you are using Windows 8 and above, this is because the `D3D11VideoDecoder` doesn't support Windows 7.

##### macOS

Please make sure you are using macOS Big Sur and above, this is because `CMVideoFormatDescriptionCreateFromHEVCParameterSets` API has compatibility issue on lower macOS.

#### GPU driver has bug

Some GPU driver may has bug which will cause `D3D11VideoDecoder` forbidden to use. in this case, you need to upgrade your GPU driver and try again. [See reference](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

#### GPU hardware has bug

Some GPU hardware may has bug which will cause `D3D11VideoDecoder` forbidden to use. in this case, we can't do anything else but to use the FFMPEG software decode. [See reference](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

## How to Build?

1. Follow [the official build doc](https://www.chromium.org/developers/how-tos/get-the-code/) to prepare the build environment then fetch the source code from `main` branch (HEVC HW codes has been merged).
2. (Optional) To enable HEVC software decoding: switch to `src/third_party/ffmpeg` dir, then execute `git am /path/to/add-hevc-ffmpeg-decoder-parser.patch`. If failed to apply the patch, could also try `node /path/to/add-hevc-ffmpeg-decoder-parser.js` to enable software decoding (Node.js is required to run the script), then switch to `src` dir, and execute `git am /path/to/enable-hevc-ffmpeg-decoding.patch`.
3. (Optional) To enable HEVC encoding support by default on Windows / macOS / Android, switch to `src` dir, then execute `git am /path/to/enable-hevc-encoding-by-default.patch`.
4. (Optional) To integrate Widevine CDM to support EME API (like Netflix): switch to `src` dir, then execute `cp -R /path/to/widevine/* third_party/widevine/cdm` (Windows: `xcopy /path/to/widevine third_party\widevine\cdm /E/H`).
5. (Optional) To enable HEVC WebRTC support by default, switch to `src` dir, then execute `git am /path/to/enable-hevc-webrtc-send-receive-by-default.patch`, and then switch to `src/third_party/webrtc` dir, execute `git am /path/to/enable-h26x-packet-buffer-by-default.patch`.
6. If you are using `Mac` + want to build `x64` arch (target_cpu to `x86` , `arm64` , `arm` also available) + want to add CDM support, then run `gn gen out/Release64 --args="is_component_build = false is_official_build = true is_debug = false ffmpeg_branding = \"Chrome\" target_cpu = \"x64\" proprietary_codecs = true media_use_ffmpeg = true enable_widevine = true bundle_widevine_cdm = true"`, if you are using `Windows`, you need to add `enable_media_foundation_widevine_cdm = true` as well.
7. Run `autoninja -C out/Release64 chrome` to start the build.
8. Open Chromium directly.

## How to integrate this into Chromium based project like Electron?

If Electron >= v22.0.0, the HEVC HW decoding feature for macOS, Windows, and Linux (VAAPI only) should have already been integrated. To add HEVC SW decoding, the method should be the same with Chromium guide above.

## Change Log

`2024-07-19` Added HEVC Main Still Picture Profile support for Windows (Chrome >= `128.0.6607.0`)

`2024-06-29` Added patches to enable HEVC WebRTC support (Chrome >= `128.0.6564.0`)

`2024-05-30` Fixed issue of abnormal color when HEVC video encoded with GBR color space matrix (Chrome >= `127.0.6510.0`).

`2024-04-18` Fixed issue of video frame stuttering on some AMD GPUs (Edge >= `124.0.2478.49`), and issue of bad HEVC Main10 HDR tone-mapping performance for Edge on Windows platform (Edge >= `125.0.2530.0`)

`2024-04-09` Fixed issue where HEVC Rext 4:2:2/4:4:4 video chroma sampling was downgraded to 4:2:0 on Windows/macOS platforms (Chrome >= `125.0.6408.0`)

`2024-03-28` Update Chromium 123 / 124 HDR related bug fixes detail, and the tech diff with Chrome for `Edge >= 122`

`2023-12-22` Update implementation details and comparison with Firefox

`2023-12-08` Improved Dolby Vision playback capabilities (Chrome >= `122.0.6168.0`)

`2023-11-16` Support MV-HEVC Base Layer playback (Chrome >= `121.0.6131.0`)

`2023-10-20` Fixed Winodows CRA/RASL image artifact issue when seeking (Chrome >= `120.0.6076.0`)

`2023-10-10` Block Intel driver version between `20.19.15.4284` and `20.19.15.5172` that could cause HEVC playback crash (Chrome >= `120.0.6059.0`)

`2023-10-02` Update HDR10/PQ support status for Edge 117

`2023-09-23` Fix 10bit video playback issues for AMD GPU on Windows platform (black screen when playing HLG video in SDR mode, 4K freezes, high memory usage, color change when switching full-screen, crash when playing SDR video in HDR mode, Chrome >= `119.0.6022.0`)

`2023-08-21` Add HEVC Rext 8bit 422 support on Windows (Chrome >= `118.0.5956.0`)

`2023-07-28` Fixed latency issue with WebCodecs VideoDecoder implementation for H265 on Windows (detail: https://github.com/w3c/webcodecs/issues/698, Chrome >= `117.0.5913.0`)

`2023-07-20` Add HEVC HW WebCodecs encoding support for Android 10+ (Chrome >= `117.0.5899.0`)

`2023-07-16` Apple Silicon + macOS 14 = adds HEVC SVC (L1T2) WebCodecs encoding support (Chrome >= `117.0.5891.0`)

`2023-07-07` Fixed 8bit HDR HEVC playback failure issue under Windows (Chrome >= `117.0.5877.0`)

`2023-07-02` Add HEVC Rext 8bit 444, 12bit 422, 12bit 444 support on Windows (Chrome >= `117.0.5866.0`)

`2023-02-22` Android platform now able to use the support detection API to detect the correct support status of different devices (Chrome >= `112.0.5612.0`)

`2023-02-17` Update Widevine L1 HEVC / Dolby Vision support detect method

`2023-02-14` Android platform now allows H264 / HEVC / VP9 / AV1 to be played at the maximum resolution supported by the device. Previously all Codecs only supported the hard-coded 4K. Now as long as the device supports it, it can support 8K or even higher resolutions (Chrome > = `112.0.5594.0`)

`2023-02-11` Allow invalid colorspace (primary, matrix, transfer) video to play instead of block the whole playback (Chrome >= `112.0.5589.0`)

`2022-12-03` Fixed the incomplete SEI parsing logic, and supported the extraction of HDR Metadata both from the bitstream and container. This will solved the problem that some HDR10 videos could not extract static hdr metadata and guarantee the best HDR performance (Chrome >= `110.0.5456.0`)

`2022-11-18` Fix a bug if D3D11VideoDecoder is disabled by gpu workaround, support detection API still report "supported" (M110, M109)

`2022-11-03` Add macOS WebCodec HEVC encode support, decrease 50% GPU memory usage when playing HDR content on SDR screen on Windows, and improved HDR tone mapping color accuracy on Windows as well

`2022-10-28` Edge (Mac) >= 107 enable by default

`2022-10-25` Chrome >= 107 enable by default + Windows WebCodec Encode support

`2022-10-11` Add Linux HEVC HW decoding support (Chrome >= `108.0.5354.0`)

`2022-10-09` HEVC with alpha (macOS only) support decoding with WebCodec API and preserve it's alpha layer

`2022-10-08` Add HDR10 Metadata extract logic, support WebCodec >= 10bits

`2022-09-26` Add a SW decoding auto-gen patch script

`2022-09-15` Fix crash for Intel 11/12 Gen iGPU when play HDR video in system HDR mode, improve the accuracy of MediaCapabilities API, Update Patch to `107.0.5303.0`

`2022-09-14` Chrome Canary >= `107.0.5300.0` has enabled HEVC HW decoder by default, official version will be available after `2022-10-25`

`2022-09-08` Guarantee the detection API's result (Chrome >= `107.0.5288.0`), and update the detection methods

`2022-08-31` Add WebCodec API (8bit only) support, and HEVC with alpha layer support (macOS only)

`2022-08-06` Update usage to Edge (Mac) 104 release version

`2022-08-02` Update usage to Chrome 104 release version

`2022-08-01` Add Chrome / Edge Usage

`2022-07-31` Intel GPU support HEVC Rext Profile hw decoding on Windows, Update Patch to `106.0.5211.0`

`2022-07-15` Update Electron v20.0.0-beta.9 and above version support status

`2022-06-21` Update Microsoft Edge (Mac) feature test guide

`2022-06-18` Fix HLG/PQ tone mapping, and update Patch to `105.0.5127.0`

`2022-06-17` Remove Linux support, Update Other Platform and HDR support status

`2022-05-26` Update Chrome Canary HEVC feature test guide

`2022-05-25` Update Chrome 104 support status, and Electron 20 enable method

`2022-05-24` Update Patch to `104.0.5080.1`

`2022-05-23` Add CDM compile guide, and update Patch to `104.0.5077.1`

`2022-05-17` Update detail of tech implement and guide to integrate into electron

`2022-05-14` Update Patch to `104.0.5061.1`

`2022-05-13` Add HEVC Test page

`2022-05-10` Update README, add more special detail of the hardware support and GPU models

`2022-05-05` Add support for MSP & Rext on macOS, and fix the issue that some HDR & Rec.709 Main10 video can't be hw decoded on Windows

`2022-04-27` Replace to `git am` patch

`2022-04-24` Support chinese README

`2022-04-21` Add Crbug trace

`2022-04-20` Modify README

`2022-04-19` Initial commit

## Trace Crbug

##### [Windows](https://crbug.com/1286132)

##### [macOS](https://crbug.com/1300444)

## License

MIT
