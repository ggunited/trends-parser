import React from 'react';

interface DataTableProps<T> {
  title: string;
  headers: [string, string];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

const DataTable = <T,>({ title, headers, data, renderRow, keyExtractor }: DataTableProps<T>) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      </div>
      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-sm text-left text-slate-300 table-fixed">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3">
                {headers[0]}
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-right">
                {headers[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={keyExtractor(item)} className="bg-slate-800/50 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                {renderRow(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;