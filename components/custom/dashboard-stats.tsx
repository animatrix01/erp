'use client';

import { DashboardStatistics } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BarChart2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: DashboardStatistics;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const phdPercent = ((stats.phdHolders / stats.totalFaculty) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-institutional-600 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-institutional-600 uppercase tracking-wider font-bold mb-1">Total Faculty</p>
                <p className="text-3xl font-bold text-institutional-900 mt-2">{stats.totalFaculty}</p>
                <p className="text-xs text-institutional-500 mt-2">Active employees</p>
              </div>
              <Users className="h-6 w-6 text-institutional-400 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-institutional-600 uppercase tracking-wider font-bold mb-1">Ph.D. Holders</p>
                <p className="text-3xl font-bold text-institutional-900 mt-2">{stats.phdHolders}</p>
                <p className="text-xs text-institutional-500 mt-2">{phdPercent}% of faculty</p>
              </div>
              <GraduationCap className="h-6 w-6 text-blue-400 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-institutional-600 uppercase tracking-wider font-bold mb-1">Non-Ph.D.</p>
                <p className="text-3xl font-bold text-institutional-900 mt-2">
                  {stats.totalFaculty - stats.phdHolders}
                </p>
                <p className="text-xs text-institutional-500 mt-2">
                  {(100 - parseFloat(phdPercent)).toFixed(1)}% of faculty
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-400 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-institutional-600 uppercase tracking-wider font-bold mb-1">Designations</p>
                <p className="text-3xl font-bold text-institutional-900 mt-2">
                  {Object.keys(stats.facultyDistribution).length}
                </p>
                <p className="text-xs text-institutional-500 mt-2">Distinct roles</p>
              </div>
              <BarChart2 className="h-6 w-6 text-amber-400 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Distribution Table */}
      <Card className="shadow-md border-2">
        <CardHeader className="py-4 px-5 border-b-2 border-institutional-200 bg-institutional-50">
          <CardTitle className="text-base font-bold text-institutional-800 uppercase tracking-wide">
            Faculty Distribution by Designation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-institutional-100 border-b-2 border-institutional-200">
                <th className="text-left py-3 px-5 text-xs font-bold text-institutional-700 uppercase tracking-wider">
                  Designation
                </th>
                <th className="text-right py-3 px-5 text-xs font-bold text-institutional-700 uppercase tracking-wider">
                  Count
                </th>
                <th className="text-right py-3 px-5 text-xs font-bold text-institutional-700 uppercase tracking-wider">
                  Share
                </th>
                <th className="py-3 px-5 text-xs font-bold text-institutional-700 uppercase tracking-wider">
                  Distribution
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.facultyDistribution).map(([designation, count], i) => {
                const pct = (count / stats.totalFaculty) * 100;
                return (
                  <tr key={designation} className={cn(
                    'border-b border-institutional-200',
                    i % 2 === 0 ? 'bg-white' : 'bg-institutional-50/50'
                  )}>
                    <td className="py-3 px-5 text-institutional-900 font-semibold">{designation}</td>
                    <td className="text-right py-3 px-5 text-institutional-900 font-medium">{count}</td>
                    <td className="text-right py-3 px-5 text-institutional-600 font-medium">{pct.toFixed(1)}%</td>
                    <td className="py-3 px-5">
                      <div className="w-full bg-institutional-200 rounded-full h-2">
                        <div
                          className="bg-institutional-600 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-institutional-300 bg-institutional-100">
                <td className="py-3 px-5 font-bold text-institutional-900">Total</td>
                <td className="text-right py-3 px-5 font-bold text-institutional-900">{stats.totalFaculty}</td>
                <td className="text-right py-3 px-5 font-bold text-institutional-900">100.0%</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
