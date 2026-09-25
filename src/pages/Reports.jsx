import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  Download,
  Loader2,
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import DatePicker from "../components/DatePicker";
import { Skeleton, ErrorState, StatCard } from "../components/ui";
import { cn } from "../lib/utils";
import { statsService } from "../services/statsService";
import { reportService } from "../services/reportService";

const REPORT_CARDS = [
  {
    id: "inventory",
    icon: Package,
    title: "Inventory Report",
    description: "Every active item with quantities, location, and low-stock flag.",
    color: "bg-primary-50 text-primary-600",
  },
  {
    id: "borrowing",
    icon: ArrowLeftRight,
    title: "Borrowing Report",
    description:
      "Requests, loans, returns and overdue items in the selected date range.",
    color: "bg-blue-50 text-blue-600",
    usesDateRange: true,
  },
  {
    id: "usage",
    icon: BarChart3,
    title: "Usage Analytics",
    description: "Most-borrowed items ranked by borrow count and quantity.",
    color: "bg-purple-50 text-purple-600",
  },
];

function ReportCard({ report, onDownload, downloadingId }) {
  const Icon = report.icon;
  const isLoading = downloadingId === report.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card flex flex-col p-5"
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl mb-4",
          report.color,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{report.title}</h3>
      <p className="text-sm text-gray-500 flex-1 mb-4">{report.description}</p>
      <button
        onClick={() => onDownload(report)}
        disabled={!!downloadingId}
        className="btn btn-primary w-full"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download CSV
          </span>
        )}
      </button>
    </motion.div>
  );
}

export default function Reports() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [downloadingId, setDownloadingId] = useState(null);

  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stats-summary"],
    queryFn: statsService.getSummary,
  });

  const handleDownload = async (report) => {
    setDownloadingId(report.id);
    try {
      await reportService.download(
        report.id,
        report.usesDateRange ? { start: startDate, end: endDate } : {},
      );
      toast.success(`${report.title} downloaded`);
    } catch (err) {
      toast.error(err.message || "Failed to generate report");
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="page-container space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isError) {
    return (
      <PageTransition>
        <div className="page-container">
          <ErrorState message={error?.message} onRetry={refetch} />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="page-container space-y-6">
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Download live inventory and borrowing data as CSV
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label="Total Items"
            value={(summary?.total_items ?? 0).toLocaleString()}
            colorClass="bg-primary-50 text-primary-600"
          />
          <StatCard
            icon={ArrowLeftRight}
            label="Active Borrows"
            value={summary?.active_borrows ?? 0}
            colorClass="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock Items"
            value={summary?.low_stock_items ?? 0}
            colorClass="bg-red-50 text-red-600"
          />
          <StatCard
            icon={Users}
            label="Active Users"
            value={summary?.total_users ?? 0}
            colorClass="bg-green-50 text-green-600"
          />
        </div>

        <div className="card flex flex-wrap items-center gap-3 p-5">
          <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            max={endDate}
            clearable={false}
            className="w-40 min-h-[40px] px-3 py-1.5 text-sm"
            ariaLabel="Start date"
          />
          <span className="text-gray-400 text-sm">to</span>
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            min={startDate}
            clearable={false}
            className="w-40 min-h-[40px] px-3 py-1.5 text-sm"
            ariaLabel="End date"
          />
          <span className="text-xs text-gray-500">Applies to the Borrowing Report</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Available Reports</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_CARDS.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onDownload={handleDownload}
                downloadingId={downloadingId}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
