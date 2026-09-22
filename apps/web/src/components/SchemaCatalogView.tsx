import React from 'react';
import { FileCode, Tag, Check, ShieldCheck } from 'lucide-react';

interface SchemaItem {
  name: string;
  subject: string;
  version: number;
  compatibility: string;
  owner: string;
  tags: string[];
}

interface SchemaCatalogViewProps {
  schemas?: SchemaItem[];
}

export const SchemaCatalogView: React.FC<SchemaCatalogViewProps> = ({ schemas = [] }) => {
  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'PII':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/80';
      case 'FINANCIAL':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
      case 'SENSITIVE':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
      default:
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80';
    }
  };

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            CONFLUENT SCHEMA REGISTRY & STREAM CATALOG
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Registered JSON_SR contracts with field-level classification tags
          </p>
        </div>
        <span className="text-xs font-mono text-gray-400">
          {schemas.length} Schemas Managed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 font-mono">
              <th className="pb-3 font-semibold">SCHEMA CONTRACT</th>
              <th className="pb-3 font-semibold">SUBJECT NAME</th>
              <th className="pb-3 font-semibold">VERSION</th>
              <th className="pb-3 font-semibold">COMPATIBILITY</th>
              <th className="pb-3 font-semibold">GOVERNANCE TAGS</th>
              <th className="pb-3 font-semibold">DOMAIN OWNER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-mono">
            {schemas.map((s, i) => (
              <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                <td className="py-3 font-bold text-white flex items-center">
                  <FileCode className="h-4 w-4 text-cyan-400 mr-2 shrink-0" />
                  {s.name}
                </td>
                <td className="py-3 text-gray-400 text-[11px]">{s.subject}</td>
                <td className="py-3 text-cyan-400 font-bold">v{s.version}</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-gray-800 text-emerald-400 text-[10px] font-semibold border border-gray-700">
                    {s.compatibility}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.tags.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getTagBadge(
                          t
                        )}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 text-gray-400 text-[11px]">{s.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
