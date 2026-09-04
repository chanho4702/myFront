import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ComparisonRow } from '../content/comparison';

/**
 * 사실 대조표. SpecTable 과 같은 헤어라인 리듬을 쓰되, 값이 여러 열이라 MUI Table 을 쓴다.
 *
 * 좁은 화면에서는 표를 접거나 줄이지 않고 **가로 스크롤**한다 — 대조표는 같은 행을 나란히
 * 봐야 의미가 있어서, 열을 세로로 쌓아 버리면 비교라는 목적 자체가 사라진다.
 * 스크롤 컨테이너에 tabIndex 를 주는 이유는 키보드만 쓰는 사용자도 스크롤할 수 있어야 하기 때문.
 */
export default function ComparisonTable({ columns, rows, caption }: { columns: string[]; rows: ComparisonRow[]; caption?: string }) {
  return (
    <Box sx={{ overflowX: 'auto' }} tabIndex={0} role="region" aria-label="제품 비교표">
      <Table size="small" sx={{ minWidth: 720, borderTop: '1px solid', borderColor: 'divider' }}>
        {caption && (
          <Box component="caption" sx={{ captionSide: 'bottom', textAlign: 'left', pt: 2, color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.7 }}>
            {caption}
          </Box>
        )}
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 148, borderColor: 'divider', py: 1.75 }} />
            {columns.map((col, i) => (
              <TableCell
                key={col}
                scope="col"
                sx={{
                  borderColor: 'divider',
                  py: 1.75,
                  fontWeight: 700,
                  // 첫 열이 우리 제품이다. 색으로만 구분하면 색각 이상에서 사라지므로 굵기도 함께 준다.
                  color: i === 0 ? 'primary.main' : 'text.secondary',
                  fontSize: '0.875rem',
                }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell component="th" scope="row" sx={{ borderColor: 'divider', py: 1.75, verticalAlign: 'top' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {row.label}
                </Typography>
              </TableCell>
              {row.values.map((value, i) => (
                <TableCell key={columns[i]} sx={{ borderColor: 'divider', py: 1.75, verticalAlign: 'top' }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: i === 0 ? 'text.primary' : 'text.secondary', fontWeight: i === 0 ? 600 : 400 }}>
                    {value}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
