import React, { useState, useEffect } from 'react';
import { SchemaCatalogView } from '../components/SchemaCatalogView';
import { StreamLineageView } from '../components/StreamLineageView';
import { api } from '../services/api';
import { Shield, Lock, FileCheck, Database } from 'lucide-react';

export const GovernancePage: React.FC = () => {
  const [schemas, setSchemas] = useState<any[]>([]);
  const [fieldTags, setFieldTags] = useState<any[]>([]);

  useEffect(() => {
    api.fetchGovernanceSchemas().then((data) => setSchemas(data.schemas || [])).catch(console.error);
    api.fetchGovernanceTags().then((data) => setFieldTags(data.field_tags || [])).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/80">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              CONFLUENT STREAM GOVERNANCE & SCHEMA REGISTRY
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Strict schema compatibility, field-level PII protection, and real-time Stream Lineage
            </p>
          </div>
        </div>
      </div>

      {/* Live Stream Lineage Graph Component */}
      <StreamLineageView />

      {/* Schema Registry Contracts Table */}
      <SchemaCatalogView schemas={schemas} />

      {/* Field-Level Classification Tags */}
      <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              FIELD-LEVEL DATA CLASSIFICATION TAGS
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Tags managed via Confluent Stream Catalog REST API with automated masking in downstream webhooks
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {fieldTags.length} Fields Tagged
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {fieldTags.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-gray-800 bg-gray-950/60 font-mono text-xs space-y-1"
            >
              <div className="text-gray-400 text-[10px] truncate">{item.entityName}</div>
              <div className="text-white font-bold">{item.field}</div>
              <div className="pt-1 flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    item.tag === 'PII'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : item.tag === 'FINANCIAL'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {item.tag}
                </span>
                <span className="text-[10px] text-gray-500">Auto-Masked</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
