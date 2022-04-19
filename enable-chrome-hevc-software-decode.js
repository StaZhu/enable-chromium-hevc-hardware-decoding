const fs = require('fs');
const path = require('path');
const encodingConfig = { encoding: 'utf8' };
const ffmpegRoot = './src/third_party/ffmpeg';

function renameFile(source, dest) {
  const content = fs.readFileSync(path.join(ffmpegRoot, source), encodingConfig);
  fs.writeFileSync(path.join(ffmpegRoot, dest), content, encodingConfig);
  console.log(`Copy ${source} to ${dest}`);
}

function modifyAVCodec(filename, value) {
  const content = fs.readFileSync(filename, encodingConfig);
  if (content.includes(value)) {
    console.log(`Skipped modify file ${filename}, add line ${value}`);
    return;
  }
  fs.writeFileSync(filename, content.replace('NULL };', `${value},\n    NULL };`), encodingConfig);
  console.log(`Modify file ${filename}, add line ${value}`);
}

function enableSoftwreDecodeHEVC() {
  function modifyffmpegGeneratedGniHEVC() {
    const filename = `${ffmpegRoot}/ffmpeg_generated.gni`;
    const content = fs.readFileSync(filename, encodingConfig);

    const code = 'if ((is_mac) || (is_win) || (use_linux_config)) {';
    const codeInertedFlag = '  # HEVC source code';

    const codeToInsert = [
      code,
      codeInertedFlag,
      '  ffmpeg_c_sources += [',
      '    "libavcodec/bswapdsp.c",',
      '    "libavcodec/autorename_libavcodec_hevcdec.c",',
      '    "libavcodec/hevc_cabac.c",',
      '    "libavcodec/hevc_data.c",',
      '    "libavcodec/hevc_filter.c",',
      '    "libavcodec/hevc_mp4toannexb_bsf.c",',
      '    "libavcodec/hevc_mvs.c",',
      '    "libavcodec/hevc_parse.c",',
      '    "libavcodec/hevc_parser.c",',
      '    "libavcodec/hevc_ps.c",',
      '    "libavcodec/hevc_refs.c",',
      '    "libavcodec/hevc_sei.c",',
      '    "libavcodec/hevcdsp.c",',
      '    "libavcodec/hevcpred.c",',
      '    "libavcodec/dynamic_hdr10_plus.c",',
      '    "libavcodec/dovi_rpu.c",',
      '    "libavcodec/dynamic_hdr_vivid.c",',
      '    "libavformat/autorename_libavformat_hevc.c",',
      '    "libavformat/avc.c",',
      '    "libavformat/hevcdec.c",',
      '  ]',
      '',
      '  if (current_cpu == "x64" || current_cpu == "x86") {',
      '    ffmpeg_c_sources += [',
      '      "libavcodec/x86/bswapdsp_init.c",',
      '      "libavcodec/x86/hevcdsp_init.c",',
      '    ]',
      '',
      '    ffmpeg_asm_sources += [',
      '      "libavcodec/x86/bswapdsp.asm",',
      '      "libavcodec/x86/hevc_deblock.asm",',
      '      "libavcodec/x86/hevc_idct.asm",',
      '      "libavcodec/x86/hevc_mc.asm",',
      '      "libavcodec/x86/hevc_add_res.asm",',
      '      "libavcodec/x86/hevc_sao.asm",',
      '      "libavcodec/x86/hevc_sao_10bit.asm",',
      '    ]',
      '  }',
      '',
      '  if (current_cpu == "arm64") {',
      '    ffmpeg_c_sources += [',
      '      "libavcodec/aarch64/hevcdsp_init_aarch64.c",',
      '    ]',
      '',
      '    ffmpeg_gas_sources += [',
      '      "libavcodec/aarch64/hevcdsp_idct_neon.S",',
      '      "libavcodec/aarch64/hevcdsp_sao_neon.S",',
      '    ]',
      '  }',
      '',
      '  if (current_cpu == "arm" && arm_use_neon) {',
      '    ffmpeg_c_sources += [',
      '      "libavcodec/arm/hevcdsp_init_arm.c",',
      '      "libavcodec/arm/hevcdsp_init_neon.c",',
      '    ]',
      '',
      '    ffmpeg_gas_sources += [',
      '      "libavcodec/arm/hevcdsp_deblock_neon.S",',
      '      "libavcodec/arm/hevcdsp_idct_neon.S",',
      '      "libavcodec/arm/hevcdsp_qpel_neon.S",',
      '      "libavcodec/arm/hevcdsp_sao_neon.S",',
      '    ]',
      '  }',
      ''
    ].join('\n');
    if (content.includes(codeInertedFlag)) {
      console.log('Skipped modify ffmpeg_generated.gni');
      return;
    }
    fs.writeFileSync(filename, content.replace(code, codeToInsert), encodingConfig);
    console.log('Modify ffmpeg_generated.gni hevc success');
  }

  function enableHevcConfig(filename) {
    let content = fs.readFileSync(filename, encodingConfig);
    content = content
      .replace('define CONFIG_HEVC_DECODER 0', 'define CONFIG_HEVC_DECODER 1')
      .replace('define CONFIG_HEVC_PARSER 0', 'define CONFIG_HEVC_PARSER 1')
      .replace('define CONFIG_HEVC_DEMUXER 0', 'define CONFIG_HEVC_DEMUXER 1');
    fs.writeFileSync(filename, content, encodingConfig);
    console.log('Enable hevc config: CONFIG_HEVC_DECODER, CONFIG_HEVC_PARSER and CONFIG_HEVC_DEMUXER');
  }

  function enableFFMPEGHevc(brand, os, arch) {
    modifyAVCodec(`${ffmpegRoot}/chromium/config/${brand}/${os}/${arch}/libavcodec/codec_list.c`, '&ff_hevc_decoder');
    modifyAVCodec(`${ffmpegRoot}/chromium/config/${brand}/${os}/${arch}/libavcodec/parser_list.c`, '&ff_hevc_parser');
    modifyAVCodec(
      `${ffmpegRoot}/chromium/config/${brand}/${os}/${arch}/libavformat/demuxer_list.c`,
      '&ff_hevc_demuxer'
    );
    enableHevcConfig(`${ffmpegRoot}/chromium/config/${brand}/${os}/${arch}/config.h`);
    if ((arch === 'x64' || arch === 'ia32') && (os === 'win' || os == 'win-msvc' || os == 'mac')) {
      enableHevcConfig(`${ffmpegRoot}/chromium/config/${brand}/${os}/${arch}/config.asm`);
    }
  }

  // add deps for hevc codec
  modifyffmpegGeneratedGniHEVC();

  // rename filename to avoid same name conflict
  renameFile('libavcodec/hevcdec.c', 'libavcodec/autorename_libavcodec_hevcdec.c');
  renameFile('libavformat/hevc.c', 'libavformat/autorename_libavformat_hevc.c');

  // add hevc decorder param for ffmpeg
  enableFFMPEGHevc('Chrome', 'win', 'ia32');
  enableFFMPEGHevc('Chrome', 'win', 'x64');
  enableFFMPEGHevc('Chrome', 'win', 'arm64');
  enableFFMPEGHevc('Chrome', 'win-msvc', 'ia32');
  enableFFMPEGHevc('Chrome', 'win-msvc', 'x64');
  enableFFMPEGHevc('Chrome', 'mac', 'x64');
  enableFFMPEGHevc('Chrome', 'mac', 'arm64');
  enableFFMPEGHevc('Chrome', 'linux', 'x64');
  enableFFMPEGHevc('Chrome', 'linux', 'ia32');
  enableFFMPEGHevc('Chrome', 'linux', 'arm64');
  enableFFMPEGHevc('Chrome', 'linux', 'arm');
  enableFFMPEGHevc('Chrome', 'linux', 'arm-neon');
  
  enableFFMPEGHevc('Chromium', 'win', 'ia32');
  enableFFMPEGHevc('Chromium', 'win', 'x64');
  enableFFMPEGHevc('Chromium', 'win', 'arm64');
  enableFFMPEGHevc('Chromium', 'win-msvc', 'ia32');
  enableFFMPEGHevc('Chromium', 'win-msvc', 'x64');
  enableFFMPEGHevc('Chromium', 'mac', 'x64');
  enableFFMPEGHevc('Chromium', 'mac', 'arm64');
  enableFFMPEGHevc('Chromium', 'linux', 'x64');
  enableFFMPEGHevc('Chromium', 'linux', 'ia32');
  enableFFMPEGHevc('Chromium', 'linux', 'arm64');
  enableFFMPEGHevc('Chromium', 'linux', 'arm');
  enableFFMPEGHevc('Chromium', 'linux', 'arm-neon');
  enableFFMPEGHevc('Chromium', 'linux-noasm', 'x64');

  enableFFMPEGHevc('ChromeOS', 'linux', 'x64');
  enableFFMPEGHevc('ChromeOS', 'linux', 'ia32');
  enableFFMPEGHevc('ChromeOS', 'linux', 'arm64');
  enableFFMPEGHevc('ChromeOS', 'linux', 'arm');
  enableFFMPEGHevc('ChromeOS', 'linux', 'arm-neon');
  enableFFMPEGHevc('ChromeOS', 'linux-noasm', 'x64');
}

enableSoftwreDecodeHEVC();