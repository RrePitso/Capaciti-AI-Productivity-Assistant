// src/components/reports/ReportBuilderForm.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FileDown, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Report, ReportType } from '@/types/database';

function todayMinus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function ReportBuilderForm() {
  const queryClient = useQueryClient();
  const [reportType, setReportType] = useState<ReportType>('progress');
  const [reportTitle, setReportTitle] = useState('Monthly Programme Progress Report');
  const [startDate, setStartDate] = useState(todayMinus(30));
  const [endDate, setEndDate] = useState(todayMinus(0));
  const [result, setResult] = useState<Report | null>(null);

  const generate = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<{ data: Report }>('/api/ai/report', {
        reportType,
        reportTitle,
        startDate,
        endDate,
      });
      return data.data;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  function handleExport() {
    if (!result) return;
    const content = `${result.report_title}\n\nExecutive Summary\n${result.executive_summary}\n\nFindings\n${(result.findings ?? [])
      .map((f) => `- ${f}`)
      .join('\n')}\n\nRecommendations\n${(result.recommendations ?? []).map((r) => `- ${r}`).join('\n')}\n\nConclusion\n${result.conclusion}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.report_title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
        </CardHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            generate.mutate();
          }}
        >
          <div>
            <Label htmlFor="reportTitle">Report Title</Label>
            <Input id="reportTitle" required value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
              <option value="progress">Progress Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="operational">Operational Report</option>
              <option value="stakeholder">Stakeholder Update</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {generate.isError && (
            <p className="text-sm text-red-600">Something went wrong generating the report. Try again.</p>
          )}

          <Button type="submit" className="w-full" loading={generate.isPending}>
            <Sparkles className="h-4 w-4" />
            Generate Report
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>

        {!result ? (
          <p className="text-sm text-capaciti-grey">Your generated report will appear here.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-capaciti-grey">Executive Summary</h4>
              <p className="text-sm text-capaciti-navy">{result.executive_summary}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase text-capaciti-grey">Findings</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-capaciti-navy">
                {(result.findings ?? []).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase text-capaciti-grey">Recommendations</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-capaciti-navy">
                {(result.recommendations ?? []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase text-capaciti-grey">Conclusion</h4>
              <p className="text-sm text-capaciti-navy">{result.conclusion}</p>
            </div>
            <Button variant="outline" type="button" onClick={handleExport}>
              <FileDown className="h-4 w-4" />
              Export
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
