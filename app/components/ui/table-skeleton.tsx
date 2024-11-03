import { TableCell, TableRow } from "./table"

interface TableSkeletonProps {
  columns: number
  rows?: number
}

export function TableSkeleton({ columns, rows = 10 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j} className="p-2">
              <div className="h-4 bg-gray-200 rounded"></div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
} 