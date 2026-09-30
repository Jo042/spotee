#!/usr/bin/env node
// ハーネス（CLAUDE.md・スキル・計画）が実態から遅れていないかを機械的に調べる。
//   --session-start  セッション開始時のフック用。問題があるときだけ、Claude への文脈として短く出力する
//   （引数なし）      すべての結果を表示する（/review-harness 用）
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? join(dirname(fileURLToPath(import.meta.url)), '../..');
const LOCAL = join(ROOT, 'local');
const SESSION_START = process.argv.includes('--session-start');

const CLAUDE_MD_MAX_LINES = 200;
const ROADMAP_STALE_DAYS = 14;
const REVIEW_INTERVAL_DAYS = 30;
const DOC_STALE_DAYS = 90;

const findings = [];
const add = (level, message) => findings.push({ level, message });

const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : null);
const daysSince = (date) => Math.floor((Date.now() - date.getTime()) / 86_400_000);

// ---------- 公開のハーネス ----------

const claudeMd = read(join(ROOT, 'CLAUDE.md'));
const skillsDir = join(ROOT, '.claude/skills');
// 外部から入れたスキル（skills-lock.json に載っているもの）は点検しない
const externalSkills = new Set(Object.keys(JSON.parse(read(join(ROOT, 'skills-lock.json')) ?? '{}').skills ?? {}));
const ownSkills = existsSync(skillsDir)
  ? readdirSync(skillsDir).filter((name) => existsSync(join(skillsDir, name, 'SKILL.md')) && !externalSkills.has(name))
  : [];
const skillTexts = ownSkills.map((name) => [name, readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8')]);

if (claudeMd) {
  const lines = claudeMd.split('\n').length;
  if (lines > CLAUDE_MD_MAX_LINES) {
    add('warn', `CLAUDE.md が ${lines} 行ある（推奨は ${CLAUDE_MD_MAX_LINES} 行以内）。手順はスキルへ、特定のファイルだけの規約は .claude/rules/ へ移せないか`);
  }
}

// 文書に書かれたパスが実在するか（バッククォートで囲まれたもの）
const PATH_BASES = ['', 'backend', 'backend/src', 'frontend', 'frontend/src', 'local'];
// 拡張子のあるファイルか、末尾が / のディレクトリだけをパスとみなす（ESLint のルール名やリポジトリ名を除く）
const looksLikePath = (s) =>
  /^[\w.@-]+(\/[\w.@[\]-]+)+\/?$/.test(s) && (s.endsWith('/') || /\.[a-z]+$/.test(s));
const pathExists = (p) => PATH_BASES.some((base) => existsSync(join(ROOT, base, p)));

const docsToCheck = [
  ['CLAUDE.md', claudeMd],
  ['CLAUDE.local.md', read(join(ROOT, 'CLAUDE.local.md'))],
  ...skillTexts.map(([name, text]) => [`.claude/skills/${name}/SKILL.md`, text]),
];
for (const [name, text] of docsToCheck) {
  if (!text) continue;
  const missing = [...new Set([...text.matchAll(/`([^`\s]+)`/g)].map((m) => m[1]))]
    .filter(looksLikePath)
    .filter((p) => !pathExists(p));
  for (const p of missing) add('warn', `${name} に書かれた \`${p}\` が見つからない（移動・削除された？）`);
}

// 文書に書かれた npm run のスクリプトが実在するか
const pkg = JSON.parse(read(join(ROOT, 'package.json')) ?? '{}');
const scripts = new Set(Object.keys(pkg.scripts ?? {}));
for (const [name, text] of docsToCheck) {
  if (!text) continue;
  const used = [...text.matchAll(/npm run ([\w:.-]+)/g)].map((m) => m[1]);
  for (const s of new Set(used)) {
    if (!scripts.has(s)) add('warn', `${name} の \`npm run ${s}\` がルートの package.json に無い`);
  }
}

// CLAUDE.md が案内しているスキルが実在するか
if (claudeMd) {
  for (const m of new Set([...claudeMd.matchAll(/`\/([a-z][a-z0-9-]+)/g)].map((x) => x[1]))) {
    if (!ownSkills.includes(m) && !existsSync(join(ROOT, '.claude/commands', `${m}.md`))) {
      add('warn', `CLAUDE.md が案内している /${m} のスキルが .claude/skills/ に無い`);
    }
  }
}

// スキルの frontmatter
for (const [name, text] of skillTexts) {
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    add('warn', `スキル ${name} に frontmatter が無い`);
    continue;
  }
  const declared = fm[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  if (declared && declared !== name) add('warn', `スキル ${name} の name が "${declared}" でディレクトリ名と違う`);
  if (!/^description:\s*\S/m.test(fm[1])) add('warn', `スキル ${name} に description が無い（Claude が使いどころを判断できない）`);
}

// ---------- 非公開の計画と記録（local/ がある環境だけ） ----------

if (existsSync(LOCAL)) {
  const updatedOf = (file) => {
    const text = read(join(LOCAL, file));
    const date = text?.match(/最終更新:\s*(\d{4}-\d{2}-\d{2})/)?.[1];
    return date ? new Date(`${date}T00:00:00`) : null;
  };

  const roadmapUpdated = updatedOf('roadmap.md');
  if (roadmapUpdated && daysSince(roadmapUpdated) > ROADMAP_STALE_DAYS) {
    add('info', `local/roadmap.md が ${daysSince(roadmapUpdated)} 日更新されていない。進捗と順番が今と合っているか`);
  }

  const reviewLog = read(join(LOCAL, 'harness/review-log.md'));
  const lastReview = [...(reviewLog ?? '').matchAll(/^## (\d{4}-\d{2}-\d{2})/gm)].map((m) => m[1]).sort().pop();
  if (!lastReview) {
    add('info', 'ハーネスの定期点検の記録がまだ無い。/review-harness を提案する');
  } else if (daysSince(new Date(`${lastReview}T00:00:00`)) > REVIEW_INTERVAL_DAYS) {
    add('info', `前回のハーネスの定期点検（${lastReview}）から ${REVIEW_INTERVAL_DAYS} 日以上経った。/review-harness を提案する`);
  }

  const proposals = read(join(LOCAL, 'harness/proposals.md')) ?? '';
  const pending = (proposals.match(/^- \[ \] /gm) ?? []).length;
  if (pending > 0) add('info', `ハーネスの改善案が ${pending} 件たまっている（local/harness/proposals.md）`);

  try {
    execFileSync('node', [join(LOCAL, 'scripts/build-index.mjs'), '--check'], { stdio: 'pipe' });
  } catch (error) {
    const output = String(error.stdout ?? '') + String(error.stderr ?? '');
    add('warn', `記録の検査で誤りがある（node local/scripts/build-index.mjs --check）: ${output.split('\n')[0]}`);
  }

  // 長く更新されていない資料（セッション開始時は出さない）
  if (!SESSION_START) {
    const walk = (dir) =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = join(dir, e.name);
        if (e.isDirectory()) return ['.git', 'records', 'archive', 'templates'].includes(e.name) ? [] : walk(p);
        return e.name.endsWith('.md') ? [p] : [];
      });
    for (const file of walk(LOCAL)) {
      const age = daysSince(statSync(file).mtime);
      if (age > DOC_STALE_DAYS) add('info', `${file.replace(`${ROOT}/`, '')} が ${age} 日更新されていない。まだ必要か、archive/ へ移すか`);
    }
  }
}

// ---------- 出力 ----------

if (SESSION_START) {
  if (findings.length === 0) process.exit(0);
  const lines = findings.map((f) => `- ${f.message}`).join('\n');
  const context = `【ハーネスの自動点検】次の点が見つかった。最初の応答の冒頭で短く伝え、直し方を提案すること（CLAUDE.md・スキルは承認を得てから変更する）。\n${lines}`;
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context } }));
} else {
  if (findings.length === 0) console.log('ハーネスの点検: 問題なし');
  for (const f of findings) console.log(`${f.level === 'warn' ? '要対応' : '確認'}: ${f.message}`);
}
