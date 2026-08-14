'use client';

import { useEffect, useState } from 'react';
import { BarChart3, CloudSun } from 'lucide-react';
import { toast } from 'sonner';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { WeatherForm } from '@/components/dashboard/weather-form';
import { FileBrowser } from '@/components/dashboard/file-browser';
import { WeatherSummary } from '@/components/dashboard/weather-summary';
import { WeatherChart } from '@/components/dashboard/weather-chart';
import { WeatherTable } from '@/components/dashboard/weather-table';
import { EmptyState } from '@/components/ui/empty-state';

import type { StoredFile } from '@/lib/storage';
import { parseStoredWeather, type WeatherPayload } from '@/lib/weather';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function Home() {
  /* ── Form state ── */
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  /* ── Data state ── */
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
  const [payload, setPayload] = useState<WeatherPayload | null>(null);

  /* ── UI state ── */
  const [storeLoading, setStoreLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState('');
  const [payloadLoading, setPayloadLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── Load a single file ── */
  const loadFile = async (file: StoredFile) => {
    setSelectedFile(file);
    setPayloadLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/weather-file-content/${encodeURIComponent(file.name)}`,
      );
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message || 'not found');
      setPayload(parseStoredWeather(data));
    } catch (e) {
      setPayload(null);
      toast.error('Unable to load dataset', {
        description: e instanceof Error ? e.message : 'Please try again.',
      });
    } finally {
      setPayloadLoading(false);
    }
  };

  /* ── Load file list ── */
  const loadFiles = async (selectFileName?: string) => {
    setFilesLoading(true);
    setFilesError('');
    try {
      const res = await fetch(`${API_BASE}/list-weather-files`);
      const data = (await res.json()) as { files?: StoredFile[]; message?: string };
      if (!res.ok) throw new Error(data.message || 'Unable to list files.');
      const nextFiles = data.files || [];
      setFiles(nextFiles);

      if (selectFileName) {
        const file = nextFiles.find((item) => item.name === selectFileName);
        if (file) await loadFile(file);
        else {
          setSelectedFile(null);
          setPayload(null);
        }
      } else {
        setSelectedFile(null);
        setPayload(null);
      }
    } catch (e) {
      setFiles([]);
      setSelectedFile(null);
      setPayload(null);
      setFilesError(e instanceof Error ? e.message : 'Unable to list files.');
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    void loadFiles();
  }, []);

  /* ── Store weather data ── */
  const handleStore = async () => {
    if (!latitude.trim() || !longitude.trim() || !startDate || !endDate) {
      toast.error('Please fill in all fields', {
        description: 'Latitude, longitude, start date, and end date are required.',
      });
      return;
    }
    setStoreLoading(true);
    try {
      const res = await fetch(`${API_BASE}/store-weather-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: Number(latitude),
          longitude: Number(longitude),
          start_date: startDate,
          end_date: endDate,
        }),
      });
      const data = (await res.json()) as { file?: string; message?: string };
      if (!res.ok) throw new Error(data.message || 'Unable to store data.');
      toast.success('Weather snapshot saved', {
        description: `Dataset stored in S3 successfully.`,
      });
      await loadFiles(data.file);
    } catch (e) {
      toast.error('Unable to fetch weather data', {
        description: e instanceof Error ? e.message : 'Please verify coordinates and date range.',
      });
    } finally {
      setStoreLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <WeatherForm
            latitude={latitude}
            longitude={longitude}
            startDate={startDate}
            endDate={endDate}
            loading={storeLoading}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSubmit={handleStore}
          />
          <FileBrowser
            files={files}
            selectedFile={selectedFile}
            loading={filesLoading}
            error={filesError}
            onSelectFile={(f) => void loadFile(f)}
            onRefresh={() => void loadFiles()}
          />
        </Sidebar>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[960px] px-5 py-6 sm:px-8 lg:py-8">
            {/* Page header */}
            <div className="animate-fade-in mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
                Weather Data Explorer
              </h1>
              <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
                Explore historical temperature patterns and manage weather snapshots stored in S3.
              </p>

              {/* Mobile sidebar trigger */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground lg:hidden"
              >
                <CloudSun size={14} strokeWidth={1.8} />
                Open data explorer
              </button>
            </div>

            {/* Content */}
            {selectedFile && payload ? (
              <div className="space-y-6">
                <WeatherSummary
                  payload={payload}
                  fileName={selectedFile.name}
                  loading={payloadLoading}
                />
                <WeatherChart daily={payload.daily} />
                <WeatherTable daily={payload.daily} fileName={selectedFile.name} />
              </div>
            ) : payloadLoading ? (
              <div className="space-y-6">
                <WeatherSummary payload={null} fileName={null} loading={true} />
                <div className="h-80 animate-skeleton rounded-xl border border-border bg-surface-raised" />
                <div className="h-64 animate-skeleton rounded-xl border border-border bg-surface-raised" />
              </div>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No snapshot selected"
                description="Select a stored snapshot from the sidebar, or fetch a new weather dataset to begin exploring temperature data."
                action={
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 lg:hidden"
                  >
                    Fetch Weather Data
                  </button>
                }
              />
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-border px-5 py-5 sm:px-8">
            <p className="text-[11px] text-muted-foreground/50">
              ClimateLens · Open-Meteo historical archive · AWS S3 storage
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
