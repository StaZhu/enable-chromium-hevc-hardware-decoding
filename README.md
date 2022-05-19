# enable-chromium-hevc-hardware-decoding

A guide that teach you build a custom version of Chrome / Electron on macOS / Windows / Linux that supports hardware / software HEVC decoding.


##### English | [简体中文](./README.zh_CN.md)

## Get release build?

[Click to download](https://github.com/StaZhu/enable-chromium-hevc-hardware-decoding/releases/tag/103.0.5045.0)

## What's the hardware supported HEVC profile?

HEVC Main (Up to 8192x8192 pixels)

HEVC Main 10 (Up to 8192x8192 pixels)

HEVC Main Still Picture (macOS only, Up to 8192x8192 pixels)

HEVC Rext (macOS only, Up to 8192x8192 pixels)

## What's the OS requirement?

macOS Big Sur (11.0) and above

Windows 8 and above

Linux + Vaapi (Not tested)

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

|                  | PQ (SDR Screen) | PQ (HDR Screen) | HLG (SDR Screen) | HLG (HDR Screen) |
| :-------------- | :------------- | :------------- | :-------------- | :-------------- |
|  Chromium macOS  |     ✅ (EDR)      |        ✅        |      ✅ (EDR)      |        ✅         |
| Chromium Windows |        ✅        |        ✅        |        ✅         |        ✅         |
|  Chromium Linux  |   Not Tested    |   Not Tested    |    Not Tested    |    Not Tested    |
|   Edge Windows   |        ❌        |        ✅        |        ✅         |        ❌         |
|   Safari macOS   |     ✅ (EDR)      |        ✅        |      ✅ (EDR)      |        ✅         |

## What's the tech diff? (Compared with Edge / Safari)

#### Windows

Edge uses `VDAVideoDecoder` to call `MediaFoundation` (need to install `HEVC Video Extension`) to finish the HEVC HW decoding which is the same tech behind `Movies and TV` builtin system app.

Chromium uses `D3D11VideoDecoder` to call `D3D11VA` (no need to install anything) to finish the HEVC HW decoding which is the same tech behind video players like `VLC`.

#### macOS

Safari and Chromium use the same `VideoToolbox` to finish the HEVC HW decoding.

## How to verify HEVC hardware support is enabled?

1. Open `chrome://gpu`, and search `Video Acceleration Information`, you should see **Decode hevc main** field and **Decode hevc main 10** field  (macOS will show **Decode hevc main still-picture** and **Decode hevc range extensions** as well)  present if hardware decoding is supported (macOS is an exception here, you see this field doesn't means the decode will use hardware, it actually depends on your GPU).
2. Open `chrome://media-internals` and play some HEVC video ([Test Page](https://lf-tk-sg.ibytedtos.com/obj/tcs-client-sg/resources/video_demo_hevc.html)) if the decoder is `VDAVideoDecoder` or `D3D11VideoDecoder` or `VaapiVideoDecoder` that means the video is using hardware decoding (macOS is an exception here, if the OS >= Big Sur, and the GPU doesn't support HEVC, VideoToolbox will fallback to software decode which has a better performance compared with FFMPEG, the decoder is `VDAVideoDecoder` in this case indeed), and if the decoder is `FFMpegVideoDecoder` that means  the video is using software decoding.
3. Open `Activity Monitor` on Mac and search `VTDecoderXPCService`, if the cpu usage larger than 0 when playing video, that means hardware (or software) decoding is being used.
4. Open `Windows Task Manager` on Windows and switch to `Performance` - `GPU`, if `Video Decoding` usage larger than 0 when playing video,  that means hardware decoding is being used.

## Why my GPU support HEVC, but still not able to hardware decode?

#### OS version is too low

##### Windows

Please make sure you are using Windows 8 and above, this is because the `D3D11VideoDecoder` doesn't support Windows 7, and will use `VDAVideoDecoder` to hardware decoding. while `VDAVideoDecoder` based on `Media Foundation` , and `Media Foundation` start to support HEVC since Windows 10 1709 (which need you to install the `HEVC Video Extension`).

##### macOS

Please make sure you are using macOS Big Sur and above, this is because `CMVideoFormatDescriptionCreateFromHEVCParameterSets`  API has compatibility issue on lower macOS.

#### GPU driver has bug

Some GPU driver may has bug which will cause `D3D11VideoDecoder` forbidden to use. in this case, you need to upgrade your GPU driver and try again. [See reference](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

#### GPU hardware has bug

Some GPU hardware may has bug which will cause `D3D11VideoDecoder` forbidden to use. in this case, we can't do anything else but to use the FFMPEG software decode. [See reference](https://source.chromium.org/chromium/chromium/src/+/main:gpu/config/gpu_driver_bug_list.json?q=disable_d3d11_video_decoder)

## Will HEVC decoding feature be enabled in chrome by default in the future?

Very likely, but one thing is sure, only platform decoder that provided by the  OS will be supported in chrome thus this will be optional depends on the GPU and OS support.

## How to Build?

1. Follow [the official build doc](https://www.chromium.org/developers/how-tos/get-the-code/) to prepare the build environment then fetch the source code from `main` branch (HEVC HW codes has been merged).
2. (Optional) To enable HEVC software decoding: switch to `src/third_party/ffmpeg` dir, then execute `git am /path/to/add-hevc-ffmpeg-decoder-parser.patch`.
3. (Optional) To enable other HEVC profiles (non main / main 10 profiles): switch to `src` dir, then execute `git am /path/to/remove-main-main10-profile-limit.patch`.
4. (Optional) To default enable hardware decode: switch to `src` dir, then execute `git am /path/to/enable-hevc-hardware-decoding-by-default.patch`.
5. (Optional) To remove chrome switch passing: switch to `src` dir, then execute `git am /path/to/remove-clear-testing-args-passing.patch`.
6. If you are using `x64` arch cpu, run `gn gen out/Release64 --args="is_component_build = false is_official_build = true is_debug = false ffmpeg_branding = \"Chrome\" target_cpu = \"x64\" proprietary_codecs = true media_use_ffmpeg = true enable_platform_encrypted_hevc = true enable_platform_hevc = true enable_platform_hevc_decoding = true"`,  you can change target_cpu to `x86` , `arm64` , `arm` if you want to build other cpu archs.
7. Run `autoninja -C out/Release64 chrome` to start the build.
8. Run `./out/Release64/Chromium.app/Contents/MacOS/Chromium --args --enable-clear-hevc-for-testing --enable-features=PlatformHEVCDecoderSupport` to open chromium if you are using macOS.
9. Create a desktop shortcut and passing the args like `C:\Users\Admin\Desktop\Chromium\chrome.exe --enable-clear-hevc-for-testing --enable-features=PlatformHEVCDecoderSupport` then double click the desktop shortcut to open chromium if you are using Windows.

## How to integrate this into Chromium based project like Electron?

If Electron = 20 (Chromium 104), directly add `enable_platform_encrypted_hevc = true enable_platform_hevc = true enable_platform_hevc_decoding = true` to `build/args/release.gn`, then compile yourself, and you will get a hardware supported electron, other part should be the same with chromium.

If Electron < 20, please follow the CL in `Trace Crbug` to manually integrate HEVC features, pull request of the patch code wecome.

## Change Log

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
