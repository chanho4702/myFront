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
  // 헤딩 id 는 텍스트만의 순수 함수다. 등장 순서 카운터를 두면 그 카운터가 리렌더 사이에
  // 살아남아(useMemo 가 클로저를 캐시한다) 다크모드 토글 한 번에 모든 앵커가 밀린다.
  // deps 를 [] 로 둬서 컴포넌트 타입도 렌더마다 새로 만들지 않는다(불필요한 리마운트 방지).
  const components = useMemo(
    () => ({
      h2: ({ children }: { children?: React.ReactNode }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
      h3: ({ children }: { children?: React.ReactNode }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
    }),
    [],
  );

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
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </Markdown>
    </Box>
  );
}
