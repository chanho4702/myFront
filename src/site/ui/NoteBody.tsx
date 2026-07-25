import { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Box from '@mui/material/Box';
import { slugify } from './slug';

/** 자식 노드에서 순수 텍스트만 뽑는다 — 헤딩 id 계산용. */
function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return textOf((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return '';
}

/**
 * 노트 마크다운 렌더러. raw HTML 은 렌더하지 않는다(react-markdown 기본값 — XSS 방어).
 * 코드블록은 신택스 하이라이터 없이 모노 + 가로 스크롤로만 처리한다(번들 절약).
 * 헤딩 id 는 slug.ts 의 slugify 로 붙인다 — 목차와 같은 규칙이어야 앵커가 맞는다.
 */
export default function NoteBody({ markdown }: { markdown: string }) {
  // tableOfContents 와 동일한 중복 카운팅. 렌더마다 초기화되어야 하므로 markdown 별로 만든다.
  const heading = useMemo(() => {
    const seen = new Map<string, number>();
    return (tag: 'h2' | 'h3') =>
      function Heading({ children }: { children?: React.ReactNode }) {
        const base = slugify(textOf(children));
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n}`;
        return tag === 'h2' ? <h2 id={id}>{children}</h2> : <h3 id={id}>{children}</h3>;
      };
  }, [markdown]);

  return (
    <Box
      sx={{
        color: 'text.primary',
        lineHeight: 1.8,
        '& h2': { fontSize: '1.5rem', fontWeight: 700, mt: 6, mb: 2, letterSpacing: '-0.01em', scrollMarginTop: '80px' },
        '& h3': { fontSize: '1.15rem', fontWeight: 700, mt: 4, mb: 1.5, scrollMarginTop: '80px' },
        '& p': { my: 2 },
        '& a': { color: 'primary.main', textDecorationColor: 'currentColor' },
        '& ul, & ol': { pl: 3, my: 2 },
        '& li': { my: 0.5 },
        '& blockquote': {
          my: 3,
          ml: 0,
          pl: 2.5,
          borderLeft: '3px solid',
          borderColor: 'primary.main',
          color: 'text.secondary',
        },
        '& code': {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.875em',
          bgcolor: 'action.hover',
          px: 0.75,
          py: 0.25,
          borderRadius: 0.5,
        },
        '& pre': {
          overflowX: 'auto',
          p: 2,
          borderRadius: '4px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
        },
        '& pre code': { bgcolor: 'transparent', p: 0, fontSize: '0.8125rem', lineHeight: 1.7 },
        '& table': { width: '100%', borderCollapse: 'collapse', my: 3, display: 'block', overflowX: 'auto' },
        '& th, & td': { border: '1px solid', borderColor: 'divider', px: 1.5, py: 1, textAlign: 'left' },
        '& th': { fontWeight: 700, bgcolor: 'action.hover' },
        '& img': { maxWidth: '100%' },
        '& hr': { border: 0, borderTop: '1px solid', borderColor: 'divider', my: 5 },
      }}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={{ h2: heading('h2'), h3: heading('h3') }}>
        {markdown}
      </Markdown>
    </Box>
  );
}
