import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <table className={`w-full caption-bottom text-sm ${className}`}>
      {children}
    </table>
  );
};

const TableHeader: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <thead className={`[&_tr]:border-b ${className}`}>
      {children}
    </thead>
  );
};

const TableBody: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`}>
      {children}
    </tbody>
  );
};

const TableRow: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>
      {children}
    </tr>
  );
};

const TableHead: React.FC<TableProps & React.ThHTMLAttributes<HTMLTableHeaderCellElement>> = ({ children, className = "", ...props }) => {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
      {children}
    </th>
  );
};

const TableCell: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
      {children}
    </td>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
