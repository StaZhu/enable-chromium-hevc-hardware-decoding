const fs = require('fs');
const path = require('path');
const os = require('os');
const childProcess = require('child_process');
const process = require('process');

let genPatch = false;
let output = path.resolve(os.homedir(), './Desktop');
let ffmpegRoot = path.resolve('./');

for (const [idx, argv] of process.argv.entries()) {
  switch (argv) {
    case '-r':
      ffmpegRoot = process.argv[idx + 1];
      if (
        typeof ffmpegRoot !== 'string' ||
        !fs.existsSync(genPath('./ffmpeg_generated.gni'))
      ) {
        console.error(
          'Please provide the correct path of `src/third_party/ffmpeg`!',
        );
        process.exit(1);
      }
      break;
    case '-o':
      output = path.resolve(process.argv[idx + 1]);
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, {
          recursive: true,
        });
      }
      break;
    case '-g':
      genPatch = true;
      break;
    default:
      break;
  }
}

const encodingConfig = { encoding: 'utf8' };
const patchFiles = new Set();
const patches = [
  {
    condition: [
      'if (((current_cpu == "arm64" || current_cpu == "arm64e") &&',
      '     ffmpeg_branding == "Chrome") ||',
      '    (current_cpu == "x64" && ffmpeg_branding == "Chrome") ||',
      '    (is_android && current_cpu == "x86" && ffmpeg_branding == "Chrome") ||',
      '    (is_apple && ffmpeg_branding == "Chrome") ||',
      '    (is_win && ffmpeg_branding == "Chrome") ||',
      '    (use_linux_config && ffmpeg_branding == "Chrome")) {',
    ].join('\n'),
    ffmpeg_c_sources: [
      'libavcodec/hevc/autorename_libavcodec_hevc_parse.c',
      'libavcodec/hevc/autorename_libavcodec_hevc_parser.c',
      'libavcodec/hevc/autorename_libavcodec_hevc_cabac.c',
      'libavcodec/hevc/data.c',
      'libavcodec/hevc/dsp.c',
      'libavcodec/hevc/filter.c',
      'libavcodec/hevc/hevcdec.c',
      'libavcodec/hevc/mvs.c',
      'libavcodec/hevc/autorename_libavcodec_hevc_pred.c',
      'libavcodec/hevc/ps.c',
      'libavcodec/hevc/refs.c',
      'libavcodec/hevc/sei.c',
    ],
  },
  {
    condition: [
      'if ((current_cpu == "x64" && ffmpeg_branding == "Chrome") ||',
      '    (is_win && current_cpu == "x86" && ffmpeg_branding == "Chrome") ||',
      '    (use_linux_config && current_cpu == "x86" && ffmpeg_branding == "Chrome")) {',
    ].join('\n'),
    ffmpeg_c_sources: [
      'libavcodec/x86/hevc/dsp_init.c',
      'libavcodec/x86/hevc/pred_init.c',
      'libavcodec/x86/h26x/h2656dsp.c',
    ],
    ffmpeg_asm_sources: [
      'libavcodec/x86/hevc/add_res.asm',
      'libavcodec/x86/hevc/deblock.asm',
      'libavcodec/x86/hevc/dequant.asm',
      'libavcodec/x86/hevc/idct.asm',
      'libavcodec/x86/hevc/mc.asm',
      'libavcodec/x86/hevc/pred.asm',
      'libavcodec/x86/hevc/sao.asm',
      'libavcodec/x86/hevc/sao_10bit.asm',
      'libavcodec/x86/h26x/h2656_inter.asm',
    ],
  },
  {
    condition: [
      'if ((current_cpu == "arm64" || current_cpu == "arm64e") &&',
      '    ffmpeg_branding == "Chrome") {',
    ].join('\n'),
    ffmpeg_c_sources: [
      'libavcodec/aarch64/hevcdsp_init_aarch64.c',
      'libavcodec/aarch64/hevcpred_init_aarch64.c',
    ],
    ffmpeg_gas_sources: [
      'libavcodec/aarch64/autorename_libavcodec_aarch64_hevcdsp_idct_neon.S',
      'libavcodec/aarch64/hevcdsp_deblock_neon.S',
      'libavcodec/aarch64/hevcdsp_dequant_neon.S',
      'libavcodec/aarch64/hevcpred_neon.S',
      'libavcodec/aarch64/h26x/epel_neon.S',
      'libavcodec/aarch64/h26x/qpel_neon.S',
      'libavcodec/aarch64/h26x/sao_neon.S',
    ],
  },
  {
    condition: [
      'if (use_linux_config && current_cpu == "arm" && ffmpeg_branding == "Chrome") {',
    ].join('\n'),
    ffmpeg_c_sources: ['libavcodec/arm/hevcdsp_init_arm.c'],
  },
  {
    condition: [
      'if (use_linux_config && current_cpu == "arm" && ffmpeg_branding == "Chrome") {',
    ].join('\n'),
    guard: 'arm_version >= 7 && arm_use_neon',
    ffmpeg_c_sources: ['libavcodec/arm/hevcdsp_init_neon.c'],
    ffmpeg_gas_sources: [
      'libavcodec/arm/hevcdsp_deblock_neon.S',
      'libavcodec/arm/hevcdsp_idct_neon.S',
      'libavcodec/arm/hevcdsp_qpel_neon.S',
      'libavcodec/arm/hevcdsp_sao_neon.S',
    ],
  },
  {
    condition: [
      'if (use_linux_config && current_cpu == "riscv64" &&',
      '    ffmpeg_branding == "Chrome") {',
    ].join('\n'),
    ffmpeg_c_sources: ['libavcodec/riscv/hevcdsp_init.c'],
    ffmpeg_gas_sources: [
      'libavcodec/riscv/h26x/h2656_inter_rvv.S',
      'libavcodec/riscv/hevcdsp_idct_rvv.S',
    ],
  },
];

function genPath(subPath) {
  return path.resolve(ffmpegRoot, subPath);
}

function writePatchFile(filename, content) {
  patchFiles.add(path.relative(ffmpegRoot, filename));
  fs.writeFileSync(filename, content, encodingConfig);
}

function modifyAVCodec(filename, value) {
  const content = fs.readFileSync(filename, encodingConfig);
  writePatchFile(
    filename,
    content.includes(value)
      ? content
      : content.replace('NULL };', `${value},\n    NULL };`),
  );
}

function writeAutoRenameFile(filename, content) {
  writePatchFile(filename, content);
}

function enableHevcConfig(filename) {
  let content = fs.readFileSync(filename, encodingConfig);
  content = content
    .replace('define CONFIG_HEVC_DECODER 0', 'define CONFIG_HEVC_DECODER 1')
    .replace('define CONFIG_HEVC_PARSER 0', 'define CONFIG_HEVC_PARSER 1')
    .replace('define CONFIG_HEVCPARSE 0', 'define CONFIG_HEVCPARSE 1')
    .replace('define CONFIG_HEVC_SEI 0', 'define CONFIG_HEVC_SEI 1')
    .replace('define CONFIG_BSWAPDSP 0', 'define CONFIG_BSWAPDSP 1')
    .replace('define CONFIG_DOVI_RPUDEC 0', 'define CONFIG_DOVI_RPUDEC 1')
    .replace("--enable-decoder='aac,h264'", "--enable-decoder='aac,h264,hevc'")
    .replace("--enable-parser='aac,h264'", "--enable-parser='aac,h264,hevc'");
  writePatchFile(filename, content);
}

function enableFFMPEGHevc(brand, os, arch) {
  modifyAVCodec(
    genPath(`./chromium/config/${brand}/${os}/${arch}/libavcodec/codec_list.c`),
    '&ff_hevc_decoder',
  );
  modifyAVCodec(
    genPath(
      `./chromium/config/${brand}/${os}/${arch}/libavcodec/parser_list.c`,
    ),
    '&ff_hevc_parser',
  );
  const configDir = genPath(`chromium/config/${brand}/${os}/${arch}`);
  for (const config of ['config.h', 'config_components.h']) {
    enableHevcConfig(path.join(configDir, config));
  }
  for (const config of ['config.asm', 'config_components.asm']) {
    const filename = path.join(configDir, config);
    if (fs.existsSync(filename)) {
      enableHevcConfig(filename);
    }
  }
}

function modifyFFMPEGGenerated(filename) {
  let content = fs.readFileSync(filename, encodingConfig);
  const deps = 'ffmpeg_c_deps += [';
  const predSource = '\n  "libavcodec/hevc/pred.c",';
  if (!content.includes(deps)) {
    throw new Error('Cannot find ffmpeg_c_deps in ffmpeg_generated.gni');
  }
  if (!content.includes(predSource)) {
    content = content.replace(deps, deps + predSource);
  }
  for (const { condition, guard, ...sourceLists } of patches) {
    if (!content.includes(condition)) {
      console.error(
        `Failed to modify ffmpeg_generated.gni, please upgrade the script!`,
        condition,
      );
      process.exit(1);
    }
    const indent = guard ? '    ' : '  ';
    let toAdd = '\n';
    if (guard) {
      toAdd += `  if (${guard}) {\n`;
    }
    for (const [field, sources] of Object.entries(sourceLists)) {
      toAdd += `${indent}${field} += [\n`;
      toAdd += sources.map(source => `${indent}  "${source}",\n`).join('');
      toAdd += `${indent}]\n`;
    }
    if (guard) {
      toAdd += '  }\n';
    }
    if (!content.includes(toAdd)) {
      content = content.replace(condition, condition + '\n' + toAdd);
    }
  }
  writePatchFile(filename, content);
}

function enableSoftwareDecodeHEVC() {
  // 1. Add hevc decoder param for ffmpeg
  enableFFMPEGHevc('Chrome', 'win', 'ia32');
  enableFFMPEGHevc('Chrome', 'win', 'x64');
  enableFFMPEGHevc('Chrome', 'win', 'arm64');
  enableFFMPEGHevc('Chrome', 'mac', 'x64');
  enableFFMPEGHevc('Chrome', 'mac', 'arm64');
  enableFFMPEGHevc('Chrome', 'ios', 'x64');
  enableFFMPEGHevc('Chrome', 'ios', 'arm64');
  enableFFMPEGHevc('Chrome', 'linux', 'x64');
  enableFFMPEGHevc('Chrome', 'linux', 'ia32');
  enableFFMPEGHevc('Chrome', 'linux', 'arm64');
  enableFFMPEGHevc('Chrome', 'linux', 'arm');
  enableFFMPEGHevc('Chrome', 'linux', 'arm-neon');
  enableFFMPEGHevc('Chrome', 'linux', 'riscv64');
  enableFFMPEGHevc('Chrome', 'linux-noasm', 'x64');
  enableFFMPEGHevc('Chrome', 'android', 'arm64');
  enableFFMPEGHevc('Chrome', 'android', 'ia32');
  enableFFMPEGHevc('Chrome', 'android', 'x64');

  // 2. Create auto rename file
  const prefix = '// File automatically generated. See crbug.com/495833.';
  writeAutoRenameFile(
    genPath(
      `./libavcodec/aarch64/autorename_libavcodec_aarch64_hevcdsp_idct_neon.S`,
    ),
    [prefix, '#include "hevcdsp_idct_neon.S"'].join('\n'),
  );
  writeAutoRenameFile(
    genPath(`./libavcodec/hevc/autorename_libavcodec_hevc_parse.c`),
    [prefix, '#include "parse.c"'].join('\n'),
  );
  writeAutoRenameFile(
    genPath(`./libavcodec/hevc/autorename_libavcodec_hevc_parser.c`),
    [prefix, '#include "parser.c"'].join('\n'),
  );
  writeAutoRenameFile(
    genPath(`./libavcodec/hevc/autorename_libavcodec_hevc_cabac.c`),
    [prefix, '#include "cabac.c"'].join('\n'),
  );
  writeAutoRenameFile(
    genPath('./libavcodec/hevc/autorename_libavcodec_hevc_pred.c'),
    [prefix, '#include "pred.c"', ''].join('\n'),
  );

  // 3. Modify ffmpeg_generated.gni
  modifyFFMPEGGenerated(genPath(`./ffmpeg_generated.gni`));

  // 4. Commit the code then `git format-patch HEAD^ -o /path/to/export/patch`
  // if you want to generate the `.patch` file.
  if (genPatch) {
    const gitOptions = { cwd: ffmpegRoot, stdio: 'inherit' };
    const files = [...patchFiles];
    childProcess.execFileSync('git', ['add', '--', ...files], gitOptions);
    childProcess.execFileSync('git', [
      'commit', '--only',
      '-m', 'Video: Add HEVC ffmpeg decoder & parser',
      '-m', [
        'Add ffmpeg software decoder and parser for HEVC, this will make',
        'sure those users using macOS version < 11 or Windows < 8 or those',
        'users who disabled gpu acceleration or hardware not supported',
        'profiles to have software HEVC decoding ability.',
      ].join('\n'),
      '--', ...files,
    ], gitOptions);
    childProcess.execFileSync('git', ['format-patch', '-1', 'HEAD', '-o', output], gitOptions);
    console.log('Generate patch success!');
  }
}

enableSoftwareDecodeHEVC();
console.log('Modify ffmpeg success!');
