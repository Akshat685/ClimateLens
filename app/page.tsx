'use client';

import { useEffect, useState } from 'react';
import { BarChart3, CloudSun, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex h-screen flex-col overflow-hidden bg-background relative">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob dark:mix-blend-screen dark:bg-primary/10"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-[hsl(var(--chart-high))]/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 dark:mix-blend-screen dark:bg-[hsl(var(--chart-high))]/10"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-[hsl(var(--chart-low))]/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000 dark:mix-blend-screen dark:bg-[hsl(var(--chart-low))]/10"></div>
      </div>

      <div className="relative z-10 flex h-full flex-col">
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
            <div className="mx-auto max-w-[1024px] px-6 py-10 sm:px-10 lg:py-12">
              {/* Page header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center sm:text-left"
              >
                <h1 className="text-[36px] font-black tracking-tighter sm:text-[48px] bg-clip-text text-transparent bg-gradient-to-r from-primary via-[hsl(var(--chart-low))] to-[hsl(var(--chart-high))] pb-2 drop-shadow-sm">
                  Weather Data Explorer
                </h1>
                <p className="mt-1 max-w-2xl text-[16px] leading-relaxed text-muted-foreground/90 font-medium">
                  Fetch, store, and analyze historical temperature patterns powered by Open-Meteo and secure AWS S3 storage.
                </p>

                {/* Mobile sidebar trigger */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-6 py-3 text-[14px] font-bold text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-200 hover:bg-primary hover:text-primary-foreground lg:hidden"
                >
                  <CloudSun size={18} strokeWidth={2.5} />
                  Open Data Explorer
                </button>
              </motion.div>

              {/* Content */}
              <div className="min-h-[600px] relative">
                <AnimatePresence mode="wait">
                  {selectedFile && payload ? (
                    <motion.div
                      key="data-view"
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: -10 }}
                      transition={{ duration: 0.4, staggerChildren: 0.1 }}
                      className="space-y-8"
                    >
                      <WeatherSummary
                        payload={payload}
                        fileName={selectedFile.name}
                        loading={payloadLoading}
                      />
                      <WeatherChart daily={payload.daily} />
                      <WeatherTable daily={payload.daily} fileName={selectedFile.name} />
                    </motion.div>
                  ) : payloadLoading ? (
                    <motion.div
                      key="loading-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      <WeatherSummary payload={null} fileName={null} loading={true} />
                      <div className="h-[360px] animate-skeleton rounded-3xl glass-panel bg-surface/40" />
                      <div className="h-72 animate-skeleton rounded-2xl glass-panel bg-surface/40" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center pt-8"
                    >
                      <EmptyState
                        icon={Sparkles}
                        title="Ready to Explore?"
                        description="Select a stored snapshot from your sidebar, or fetch a brand new weather dataset to instantly visualize temperature patterns."
                        action={
                          <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--chart-low))] px-8 py-3.5 text-[15px] font-bold text-white shadow-glow-primary transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_-5px_hsl(var(--primary))] active:scale-95 lg:hidden"
                          >
                            Get Started
                          </button>
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 border-t border-border/40 px-6 py-8 sm:px-10">
              <p className="text-center text-[13px] font-semibold tracking-wide text-muted-foreground/50">
                ClimateLens · Powered by Open-Meteo & AWS S3
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
