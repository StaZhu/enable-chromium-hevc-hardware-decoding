# enable-chromium-hevc-hardware-decoding

A guide that teach you enable hardware HEVC decoding & encoding for Chrome / Edge, or build a custom version of Chromium / Electron that supports hardware & software HEVC decoding and hardware HEVC encoding.

##### English | [简体中文](./README.zh_CN.md)

## Usage

#### Chrome & Edge (Mac) & Chromium

Make sure version >= 107 then open directly.

## What's the hardware decoding supported HEVC profile?

HEVC Main (Up to 8192x8192 pixels)

HEVC Main 10 (Up to 8192x8192 pixels)

HEVC Main Still Picture (only Windows is not supported, up to 8192x8192 pixels)

HEVC Rext (partially supported, see the table below for details, up to 8192x8192 pixels)

|        GPU             | 8b 420 | 8b 422 |      8b 444    | 10b 420  | 10b 422 | 10b 444 | 12b 420 |    12b 422    |    12b 444     |
| :--------------------- | :----- | :----- | :------------- | :------- | :------ | :------ | :------ | :------------ | :------------- |
|  Apple Silicon (macOS) |   ✅    |   ✅   |       ✅       |    ✅    |    ✅    |    ✅   |    ❌   |       ❌       |       ❌       |
| Intel ICL ~ TGLx (Win) |   ✅    |   ❌   |✅<sup>[4]</sup>|    ✅    |    ✅    |    ✅   |    ❌   |       ❌       |       ❌       |
|    Intel TGLx+ (Win)   |   ✅    |   ❌   |✅<sup>[4]</sup>|    ✅    |    ✅    |    ✅   |    ✅   |✅<sup>[4]</sup>|✅<sup>[4]</sup>|

✅：GPU + software support
❌：GPU not support

*Note 1: Intel Macs support HEVC Rext software decoding of 8 ~ 12b 400, 420, 422, 444 contents. Apple Silicon Mac supports HEVC Rext hardware decoding of 8 ~ 10b 400, 420, 422, 444 contents, and software decoding of 12b 400, 420, 422, 444 contents on macOS 13+.*

*Note 2: Intel Gen10 GPUs support HEVC Rext hardware decoding of 8b 420, 8b 444, 10b 420, 10b 422, 10b 444 contents on Windows. Gen11+ GPUs additionally support HEVC Rext hardware decoding of 12b 420, 12b 422, 12b 444 contents.*

*Note 3: Although NVIDIA GPUs support HEVC Rext hardware decoding of 8 ~ 12b non-422 contents via CUVIA or NVDEC, but because they did not provide a D3D11 interface, thus Chromium will not support it in the future.*

*Note 4: HEVC 8b 444, 12b 422, 12b 444 support requires Chrome >= `117.0.5866.0`.*

## What's the hardware encoding supported HEVC profile?

HEVC Main (macOS & Windows only, macOS up to 4096x2304 px & 120 fps, Windows up to 1920*1088 px & 30 fps)

*Note 1: Chrome Media Team has no plan to support HEVC encoding in 2022, thus if you want to use this feature, the only way is passing a chrome switch to enable it（`--enable-features=PlatformHEVCEncoderSupport`）, and need to make sure Chrome version >= `109.0.5397.0`. [Test Page](https://webrtc.internaut.com/wc/wcWorker2/).*

## What's the OS requirement?

macOS Big Sur (11.0) and above

Windows 8 and above

Android 5.0 and above

Chrome OS (Only supports GPUs that support VAAPI interface, eg: Intel GPU)

Linux (Chrome version >= `108.0.5354.0`, and only supports GPUs that support VAAPI interface, eg: Intel GPU)

## What's the API supported?

Video Decode: File, Media Source Extensions, WebCodec (8Bit requires >= `107.0.5272.0`, 10Bit + HEVC with Alpha requires >= `108.0.5343.0`), Clearkey and Widevine L1 (HW only) Encrypted Media Extensions are supported. WebRTC is not supported.

Video Encode: WebCodec (Windows and macOS only, passing `--enable-features=PlatformHEVCEncoderSupport` and make sure browser >= `109.0.5397.0`) is supported.

## What's the GPU requirement?

#### Independent GPU

NVIDIA GTX950 and above

AMD RX460 and above

#### Integrated GPU

Intel HD4400, HD515 and above

AMD Radeon R7, Vega M and above

Apple M1, M1 Pro, M1 Max, M1 Ultra and above

#### Detail Table

[Intel](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/intel.html)

[AMD](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/amd.html)

[NVIDIA](https://bluesky-soft.com/en/dxvac/deviceInfo/decoder/nvidia.html)

## HDR Supports? (Compared with Edge / Safari)

|                 |   PQ     |   HDR10  |  HDR10+  |   HLG    |  DV P5   |  DV P8.1  |  DV P8.4    |
| :-------------- | :------- | :------- | :------- | :------- |:-------- |:--------- |:----------- |
| Chrome 114 Mac  |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
| Chrome 114 Win  |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
|  Edge 114 Mac   |    ✅    |     ✅    |    ✅    |    ✅    |    ❌     |     ✅     |     ✅     |
|  Edge 114 Win   |    ❌    |     ❌    |    ❌    |    ✅    |    ❌     |     ❌     |     ✅     |
| Safari 16.5 Mac |    ✅    |     ✅    |    ✅    |    ✅    |    ✅     |     ✅     |     ✅     |

On Windows platform, Chrome supports PQ, HDR10 (PQ with static metadata), and HLG. Automatic Tone-mapping will be enabled based on static metadata (if present). HDR10+ SEI dynamic metadata wil be ignored while decoding and playback will downgrade to HDR10. The decoding implementation of Edge is different from that of Chrome / Chromium, there is a problem of abnormal PQ HDR Tone-mapping when playing in SDR mode.

On macOS platform, Chrome supports PQ, HDR10 (PQ with static metadata), HLG. In SDR / HDR / Hybrid mode, the macOS system will automatically perform EDR to ensure that HDR is displayed correctly. Chrome / Edge shared the same code thus has the same decoding ability, Safari also supports the above all HDR formats.

#### Dolby Vision Supports Status

On Windows platoform, for encrypted Dolby Vision content, when Chrome >= 110, Profile 4/5/8 are supported, when passing the `--enable-features=PlatformEncryptedDolbyVision` switch to launch Chrome, and when the system has installed the Dolby Vision Extension + HEVC Video Extension, "Supported" will be returned when querying the API. For non-encrypted Dolby Vision content, the RPU dynamic metadata of Dolby Vision Profile 8.1/8.4 will be ignored when decoding, and played with HDR10 / HLG downgrade instead, and will return "not supported" when using API query (for example: `MediaSource. isTypeSupported('video/mp4;codecs="dvh1.08.07"')`), Profile 5 (IPTPQc2) is not supported, and the color will be abnormal during playback.

On macOS platform, the non-encrypted Dolby Vision Profile 8.1/8.4 are supported, but "not supported" will still be returned when using the API query (for example: `MediaSource.isTypeSupported('video/mp4;codecs="dvh1.08.07"')`). Safari is the only browser that supports Profile 5. Chrome / Edge uses VideoToolbox to decode, and the test results show that directly using VideoToolbox can not decode Dolby Vision Profile 5 correctly, so Chrome / Edge doesn't support Dolby Vision Profile 5 for now.

Neither of the platforms supports dual-layer Dolby Vision.

#### HDR support by version of Chrome

Chrome 107 does not support the ability to extract HEVC static metadata, and all HDR10 video playback are downgraded to PQ only mode. HLG videos uses the video processor API provided by the GPU vendor for processing tone-mapping has a poor performance on some laptops, and playing 4K video may cause frame droping.

Chrome 108 supports the ability to extract HEVC static metadata. For videos with static metadata written in the container, the playback is okey on 108, but some videos are not written static metadata to their containers, thus Chrome 108 can not extract the static metadata from these videos which causing the playback to be downgraded to PQ only mode, and the max content light level maybe cutted to a low value for these videos. In addition, the HLG Tone-mapping algorithm on Windows platform has been switched to Chrome's own algorithm, which solves the problem of bad performance on the laptop when using video processor for HLG Tone-mapping. However, Chrome has been using 8 bit for Tone-mapping, which resulting an insufficient contrast ratio of the Tone-mapping result.

Chrome 109 makes the HDR -> SDR process to a 16 bit + zero copy process, which improves the accuracy of PQ Tone-mapping on Windows platform, thus the problem of the insufficient contrast ratio for HLG has been also solved, and the video memory usage has been reduced by about 50%.

Chrome 110 solves the problem of incomplete static metadata extraction. It supports the extraction of static metadata from both the bitstream and the container, thus the max content light level issue has been solved, and at this point all HDR issues should have been resolved.

## How to verify certain profile or resolution is supported？

### Clear Content

#### MediaCapabilities

```javascript
const mediaConfig = {
  /**
   * You can use `file` or `media-source` and the result are same here,
   * don't use `webrtc` since HEVC webrtc is not supported currently.
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

*Note 1：The above three API have already took `--disable-gpu`, `--disable-accelerated-video-decode`, `gpu-workaround`, `settings - system - Use hardware acceleration when available`, `OS version` etc... into consideration, and if Chrome version >= `107.0.5304.0` (There is a bug in Chrome 108 and previous versions on Windows platform. If a specific GPU driver version causes D3D11VideoDecoder to be disabled for some reason, although the hardware decoding is no longer available, APIs such as isTypeSupported may still return "support", the bug has been fixed in Chrome 109) and OS is macOS or Windows, the result are guaranteed.*

*Note 2: There is a bug for the Android platform, Chrome < `112.0.5612.0` does not return the actual support status of different devices (although Android >= 5.0 supports HEVC main profile SW decoding by default, however whether main10 profile is supported or not completely depends on hardware), and always assume that all HEVC profiles and resolution are supported. Chrome >= `112.0.5612.0` now solves this bug, and will return the correct result depends on hardware and the given video's resolution. Just like Windows and macOS, the above three APIs are supported as well, and every influencing factors should have been taken into account.*

*Note 3：Compared with `MediaSource.isTypeSupported()` or `CanPlayType()`, we recommand using `MediaCapabilities`, since `MediaCapabilities` not only takes `settings - system - Use hardware acceleration when available` etc... into consideration, but also check if the given `width and height` is supported or not since different GPU may have different max resolution support, eg: some AMD GPU only support up to 4096 * 2048, and some old GPU only support up to 1080P.*

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

## What's the tech diff? (Compared with Edge / Safari)

#### Windows

Edge uses `VDAVideoDecoder` to call `MediaFoundation` (need to install `HEVC Video Extension`) to finish the HEVC HW decoding which is the same tech behind `Movies and TV` builtin system app.

Chromium uses `D3D11VideoDecoder` to call `D3D11VA` (no need to install anything) to finish the HEVC HW decoding which is the same tech behind video players like `VLC`.

#### macOS

Safari and Chromium use the same `VideoToolbox` to finish the HEVC HW decoding.

## How to verify HEVC hardware support is enabled?

1. Open `chrome://gpu`, and search `Video Acceleration Information`, you should see **Decode hevc main** field and **Decode hevc main 10** field  (macOS will show **Decode hevc main still-picture** and **Decode hevc range extensions** as well, Windows Intel Gen10+ iGPU will show **Decode hevc range extensions** as well)  present if hardware decoding is supported (macOS is an exception here, you see this field doesn't means the decode will use hardware, it actually depends on your GPU).
2. Open `chrome://media-internals` and play some HEVC video ([Test Page](https://lf-tk-sg.ibytedtos.com/obj/tcs-client-sg/resources/video_demo_hevc.html)) if the decoder is `VDAVideoDecoder` or `D3D11VideoDecoder` or `VaapiVideoDecoder` that means the video is using hardware decoding (macOS is an exception here, if the OS >= Big Sur, and the GPU doesn't support HEVC, VideoToolbox will fallback to software decode which has a better performance compared with FFMPEG, the decoder is `VDAVideoDecoder` in this case indeed), and if the decoder is `FFMpegVideoDecoder` that means  the video is using software decoding.
3. Open `Activity Monitor` on Mac and search `VTDecoderXPCService`, if the cpu usage larger than 0 when playing video, that means hardware (or software) decoding is being used.
4. Open `Windows Task Manager` on Windows and switch to `Performance` - `GPU`, if `Video Decode`(Intel, Nvidia) or `Video Codec`(AMD) usage larger than 0 when playing video,  that means hardware decoding is being used.

## Why my GPU support HEVC, but still not able to hardware decode?

#### OS version is too low

##### Windows

Please make sure you are using Windows 8 and above, this is because the `D3D11VideoDecoder` doesn't support Windows 7.

##### macOS

Please make sure you are using macOS Big Sur and above, this is because `CMVideoFormatDescriptionCreateFromHEVCParameterSets`  API has compatibility issue on lower macOS.

#### GPU driver has bug

Some GPU driver may has bug which will cause `D3D11VideoDecoder` forbidden to use. in this case, you need to upgrade your GPU driver and try again. [See reference](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

#### GPU hardware has bug

Some GPU hardware may has bug which will cause `D3D11VideoDecoder` forbidden to use. in this case, we can't do anything else but to use the FFMPEG software decode. [See reference](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

## How to Build?

1. Follow [the official build doc](https://www.chromium.org/developers/how-tos/get-the-code/) to prepare the build environment then fetch the source code from `main` branch (HEVC HW codes has been merged).
2. (Optional) To enable HEVC software decoding: switch to `src/third_party/ffmpeg` dir, then execute `git am /path/to/add-hevc-ffmpeg-decoder-parser.patch`. If failed to apply the patch, could also try `node /path/to/add-hevc-ffmpeg-decoder-parser.js` to enable software decoding (Node.js is required to run the script).
3. (Optional) To enable other HEVC profiles (non main / main 10 profiles): switch to `src` dir, then execute `git am /path/to/remove-main-main10-profile-limit.patch`.
4. (Optional) To enable HEVC encoding support by default on Windows / macOS, switch to `src` dir, then execute `git am /path/to/enable-hevc-encoding-by-default.patch`.
5. (Optional) To integrate Widevine CDM to support EME API (like Netflix): switch to `src` dir, then execute `cp -R /path/to/widevine/* third_party/widevine/cdm` (Windows: `xcopy /path/to/widevine third_party\widevine\cdm /E/H`).
6. If you are using `Mac` + want to build `x64` arch (target_cpu to `x86` , `arm64` , `arm` also available) + want to add CDM support, then run `gn gen out/Release64 --args="is_component_build = false is_official_build = true is_debug = false ffmpeg_branding = \"Chrome\" target_cpu = \"x64\" proprietary_codecs = true media_use_ffmpeg = true enable_widevine = true bundle_widevine_cdm = true"`, if you are using `Windows`, you need to add `enable_media_foundation_widevine_cdm = true` as well.
7. Run `autoninja -C out/Release64 chrome` to start the build.
8. Open Chromium directly.

## How to integrate this into Chromium based project like Electron?

If Electron >= v22.0.0, the HEVC HW decoding feature for macOS, Windows, and Linux (VAAPI only) should have already been integrated. To add HEVC SW decoding, the method should be the same with Chromium guide above.

## Change Log

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
